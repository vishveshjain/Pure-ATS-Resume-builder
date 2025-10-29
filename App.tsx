import React, { useState, useCallback, useMemo } from 'react';
import { ResumeData, Template, SectionKey } from './types';
import { initialResumeData, templates } from './constants';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import TemplateSelector from './components/TemplateSelector';
import { parseResume, generateSummary, parseResumeFromText } from './services/geminiService';
import { DownloadIcon, UploadIcon } from './components/icons';

// Declare jspdf, html2canvas, and mammoth from CDN so TypeScript knows about them
declare const jspdf: any;
declare const html2canvas: any;
declare const mammoth: any;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export default function App() {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
    const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
    const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(['summary', 'experience', 'education', 'projects', 'skills']);
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleTemplateSelect = useCallback((template: Template) => {
        setSelectedTemplate(template);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        setIsParsing(true);
        setError(null);
        try {
            let parsedData;
            const fileType = file.type;
            const fileName = file.name.toLowerCase();

            if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const { value: textContent } = await mammoth.extractRawText({ arrayBuffer });
                parsedData = await parseResumeFromText(textContent);
            } else if (fileType === 'application/pdf' || fileType === 'text/plain') {
                const base64Data = await fileToBase64(file);
                parsedData = await parseResume(file.type, base64Data);
            } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
                 throw new Error('.doc files are not supported. Please save as a .docx or PDF and try again.');
            }
            else {
                throw new Error(`Unsupported file type: ${fileType || 'unknown'}. Please upload a PDF, DOCX, or TXT file.`);
            }
            
            setResumeData(parsedData);
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Failed to parse resume. Please try again or fill the form manually.';
            setError(message);
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const summary = await generateSummary(resumeData);
            setResumeData(prev => ({ ...prev, summary }));
        } catch (err) {
            console.error(err);
            setError('Failed to generate summary. Please ensure you have some experience and education filled out.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        const previewElement = document.getElementById('resume-preview');
        if (!previewElement || isDownloading) return;
    
        setIsDownloading(true);
        setError(null);
        
        const originalTransform = previewElement.style.transform;
        const originalBoxShadow = previewElement.style.boxShadow;
        
        // Prepare element for high-quality capture
        previewElement.style.transform = 'scale(1)';
        previewElement.style.boxShadow = 'none';
        
        await new Promise(resolve => setTimeout(resolve, 100));
    
        try {
            const canvas = await html2canvas(previewElement, {
                scale: 2, // Capture at double resolution for crispness
                useCORS: true,
                logging: false,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgRatio = imgProps.height / imgProps.width;
            
            const finalImgWidth = pdfWidth;
            const finalImgHeight = pdfWidth * imgRatio;

            pdf.addImage(imgData, 'PNG', 0, 0, finalImgWidth, finalImgHeight);
            pdf.save(`${resumeData.contact.name.replace(/\s+/g, '_')}_Resume.pdf`);
    
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            setError('An error occurred while generating the PDF. Please try again.');
        } finally {
            // Restore original styles
            previewElement.style.transform = originalTransform;
            previewElement.style.boxShadow = originalBoxShadow;
            setIsDownloading(false);
        }
    };

    const TemplateComponent = useMemo(() => selectedTemplate.component, [selectedTemplate]);

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md p-4 flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-800">Pure ATS Resume Builder</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                    />
                    <button
                        onClick={handleTriggerUpload}
                        disabled={isParsing}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                    >
                        <UploadIcon className="h-5 w-5 mr-2"/>
                        {isParsing ? 'Parsing...' : 'Import Resume'}
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
                <div className="no-print">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                        <TemplateSelector
                            templates={templates}
                            selectedTemplate={selectedTemplate}
                            onSelect={handleTemplateSelect}
                        />
                        <hr className="my-6" />
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                        <ResumeForm
                            resumeData={resumeData}
                            setResumeData={setResumeData}
                            onGenerateSummary={handleGenerateSummary}
                            isGeneratingSummary={isLoading}
                            sectionOrder={sectionOrder}
                            setSectionOrder={setSectionOrder}
                        />
                    </div>
                </div>

                <div className="flex justify-center items-start">
                    <div id="resume-preview" className="w-full max-w-[8.5in] h-[11in] bg-white shadow-lg overflow-hidden transform scale-90 lg:scale-100 origin-top">
                        <ResumePreview
                            resumeData={resumeData}
                            templateComponent={TemplateComponent}
                            sectionOrder={sectionOrder}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}