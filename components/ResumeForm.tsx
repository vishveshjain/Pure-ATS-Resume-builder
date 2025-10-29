import React, { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react';
import { ResumeData, Experience, Education, Project, Skill, SectionKey } from '../types';
import { PlusIcon, SparklesIcon, TrashIcon, DragHandleIcon } from './icons';

interface ResumeFormProps {
    resumeData: ResumeData;
    setResumeData: Dispatch<SetStateAction<ResumeData>>;
    onGenerateSummary: () => void;
    isGeneratingSummary: boolean;
    sectionOrder: SectionKey[];
    setSectionOrder: Dispatch<SetStateAction<SectionKey[]>>;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const Input: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

const Textarea: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number }> = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

const SECTION_TITLE_MAP: Record<SectionKey, string> = {
    summary: 'Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects'
};

export default function ResumeForm({ resumeData, setResumeData, onGenerateSummary, isGeneratingSummary, sectionOrder, setSectionOrder }: ResumeFormProps) {
    const dragItem = useRef<{ section: keyof ResumeData; index: number } | null>(null);
    const dragOverItem = useRef<{ section: keyof ResumeData; index: number } | null>(null);
    const dragSectionIndex = useRef<number | null>(null);
    const dragOverSectionIndex = useRef<number | null>(null);


    const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, section: keyof ResumeData, index: number) => {
        dragItem.current = { section, index };
        setTimeout(() => {
            const target = e.target as HTMLElement;
            const draggableItem = target.closest('.draggable-item');
            if (draggableItem) {
                draggableItem.classList.add('dragging');
            }
        }, 0);
    };

    const handleItemDragEnter = (e: React.DragEvent<HTMLDivElement>, section: keyof ResumeData, index: number) => {
        if (dragItem.current && dragItem.current.section === section) {
            dragOverItem.current = { section, index };
        }
    };

    const handleItemDrop = () => {
        if (!dragItem.current || !dragOverItem.current) return;

        const { section: sourceSection, index: sourceIndex } = dragItem.current;
        const { section: targetSection, index: targetIndex } = dragOverItem.current;

        if (sourceSection === targetSection && sourceIndex !== targetIndex) {
            setResumeData(prev => {
                const list = [...(prev[sourceSection] as any[])];
                const [draggedItem] = list.splice(sourceIndex, 1);
                list.splice(targetIndex, 0, draggedItem);
                return { ...prev, [sourceSection]: list };
            });
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleItemDragEnd = () => {
        document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    };

    const handleSectionDragStart = (index: number) => {
        dragSectionIndex.current = index;
    };

    const handleSectionDragEnter = (index: number) => {
        dragOverSectionIndex.current = index;
    };

    const handleSectionDrop = () => {
        if (dragSectionIndex.current === null || dragOverSectionIndex.current === null) return;

        const newSectionOrder = [...sectionOrder];
        const [movedSection] = newSectionOrder.splice(dragSectionIndex.current, 1);
        newSectionOrder.splice(dragOverSectionIndex.current, 0, movedSection);
        
        setSectionOrder(newSectionOrder);

        dragSectionIndex.current = null;
        dragOverSectionIndex.current = null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({
            ...prev,
            contact: { ...prev.contact, [name]: value }
        }));
    };

    const handleSummaryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData(prev => ({ ...prev, summary: e.target.value }));
    };

    const handleDynamicChange = <T extends { id: string }>(section: keyof ResumeData, id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => {
            const list = prev[section] as unknown as T[];
            const updatedList = list.map(item =>
                item.id === id ? { ...item, [name]: name === 'description' ? value.split('\n') : value } : item
            );
            return { ...prev, [section]: updatedList };
        });
    };

    const addDynamicItem = <T extends { id: string }>(section: keyof ResumeData, newItem: T) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...(prev[section] as unknown as T[]), newItem]
        }));
    };

    const removeDynamicItem = (section: keyof ResumeData, id: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).filter(item => item.id !== id)
        }));
    };

    return (
        <form>
            <Section title="Arrange Sections">
                <div className="flex flex-wrap gap-2" onDrop={handleSectionDrop} onDragOver={handleDragOver}>
                    {sectionOrder.map((sectionKey, index) => (
                        <div
                            key={sectionKey}
                            draggable
                            onDragStart={() => handleSectionDragStart(index)}
                            onDragEnter={() => handleSectionDragEnter(index)}
                            className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-full cursor-move hover:bg-gray-300 transition-colors"
                        >
                            <DragHandleIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">{SECTION_TITLE_MAP[sectionKey]}</span>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Input label="Full Name" name="name" value={resumeData.contact.name} onChange={handleContactChange} />
                    <Input label="Email" name="email" value={resumeData.contact.email} onChange={handleContactChange} type="email" />
                    <Input label="Phone" name="phone" value={resumeData.contact.phone} onChange={handleContactChange} />
                    <Input label="Location" name="location" value={resumeData.contact.location} onChange={handleContactChange} />
                    <Input label="LinkedIn" name="linkedin" value={resumeData.contact.linkedin} onChange={handleContactChange} />
                    <Input label="GitHub" name="github" value={resumeData.contact.github} onChange={handleContactChange} />
                    <Input label="Website" name="website" value={resumeData.contact.website} onChange={handleContactChange} />
                </div>
            </Section>

            <Section title="Professional Summary">
                <Textarea
                    label="Summary"
                    name="summary"
                    value={resumeData.summary}
                    onChange={handleSummaryChange}
                    rows={5}
                />
                <button
                    type="button"
                    onClick={onGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isGeneratingSummary ? 'Generating...' : 'Generate with AI'}
                </button>
            </Section>

            <Section title="Experience">
                <div onDrop={handleItemDrop} onDragOver={handleDragOver}>
                    {resumeData.experience.map((exp, index) => (
                        <div key={exp.id} className="p-4 pl-12 border rounded-md mb-4 bg-gray-50 relative draggable-item" onDragEnter={(e) => handleItemDragEnter(e, 'experience', index)}>
                            <div className="absolute top-1/2 -translate-y-1/2 left-3 cursor-move p-1 text-gray-400 hover:text-gray-600" draggable onDragStart={(e) => handleItemDragStart(e, 'experience', index)} onDragEnd={handleItemDragEnd}>
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                            <Input label="Job Title" name="title" value={exp.title} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} />
                            <Input label="Company" name="company" value={exp.company} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} />
                                <Input label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} />
                            </div>
                            <Input label="Location" name="location" value={exp.location} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} />
                            <Textarea label="Description (one point per line)" name="description" value={exp.description.join('\n')} onChange={(e) => handleDynamicChange<Experience>('experience', exp.id, e)} rows={4} />
                            <button type="button" onClick={() => removeDynamicItem('experience', exp.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700">
                               <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addDynamicItem<Experience>('experience', { id: `exp${Date.now()}`, title: '', company: '', startDate: '', endDate: '', location: '', description: [] })}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Experience
                </button>
            </Section>

            <Section title="Education">
                <div onDrop={handleItemDrop} onDragOver={handleDragOver}>
                    {resumeData.education.map((edu, index) => (
                        <div key={edu.id} className="p-4 pl-12 border rounded-md mb-4 bg-gray-50 relative draggable-item" onDragEnter={(e) => handleItemDragEnter(e, 'education', index)}>
                             <div className="absolute top-1/2 -translate-y-1/2 left-3 cursor-move p-1 text-gray-400 hover:text-gray-600" draggable onDragStart={(e) => handleItemDragStart(e, 'education', index)} onDragEnd={handleItemDragEnd}>
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                            <Input label="Institution" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange<Education>('education', edu.id, e)} />
                            <Input label="Degree / Field of Study" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange<Education>('education', edu.id, e)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Start Date" name="startDate" value={edu.startDate} onChange={(e) => handleDynamicChange<Education>('education', edu.id, e)} />
                                <Input label="End Date" name="endDate" value={edu.endDate} onChange={(e) => handleDynamicChange<Education>('education', edu.id, e)} />
                            </div>
                            <Input label="Location" name="location" value={edu.location} onChange={(e) => handleDynamicChange<Education>('education', edu.id, e)} />
                            <button type="button" onClick={() => removeDynamicItem('education', edu.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addDynamicItem<Education>('education', { id: `edu${Date.now()}`, institution: '', degree: '', startDate: '', endDate: '', location: '' })}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Education
                </button>
            </Section>
            
            <Section title="Skills">
                 <div onDrop={handleItemDrop} onDragOver={handleDragOver}>
                    {resumeData.skills.map((skill, index) => (
                        <div key={skill.id} className="p-4 pl-12 border rounded-md mb-4 bg-gray-50 relative draggable-item" onDragEnter={(e) => handleItemDragEnter(e, 'skills', index)}>
                             <div className="absolute top-1/2 -translate-y-1/2 left-3 cursor-move p-1 text-gray-400 hover:text-gray-600" draggable onDragStart={(e) => handleItemDragStart(e, 'skills', index)} onDragEnd={handleItemDragEnd}>
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                             <Input label="Category (e.g., Programming Languages)" name="category" value={skill.category} onChange={(e) => handleDynamicChange<Skill>('skills', skill.id, e)} />
                             <Textarea label="Skills (comma separated)" name="items" value={skill.items} onChange={(e) => handleDynamicChange<Skill>('skills', skill.id, e)} rows={2} />
                             <button type="button" onClick={() => removeDynamicItem('skills', skill.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700">
                                 <TrashIcon className="w-5 h-5" />
                             </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addDynamicItem<Skill>('skills', { id: `skill${Date.now()}`, category: '', items: ''})}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                     <PlusIcon className="w-5 h-5 mr-1" /> Add Skill Category
                </button>
            </Section>

            <Section title="Projects">
                <div onDrop={handleItemDrop} onDragOver={handleDragOver}>
                    {resumeData.projects.map((proj, index) => (
                        <div key={proj.id} className="p-4 pl-12 border rounded-md mb-4 bg-gray-50 relative draggable-item" onDragEnter={(e) => handleItemDragEnter(e, 'projects', index)}>
                             <div className="absolute top-1/2 -translate-y-1/2 left-3 cursor-move p-1 text-gray-400 hover:text-gray-600" draggable onDragStart={(e) => handleItemDragStart(e, 'projects', index)} onDragEnd={handleItemDragEnd}>
                                <DragHandleIcon className="w-5 h-5" />
                            </div>
                            <Input label="Project Name" name="name" value={proj.name} onChange={(e) => handleDynamicChange<Project>('projects', proj.id, e)} />
                            <Textarea label="Description" name="description" value={proj.description} onChange={(e) => handleDynamicChange<Project>('projects', proj.id, e)} rows={3} />
                            <Input label="Link" name="link" value={proj.link} onChange={(e) => handleDynamicChange<Project>('projects', proj.id, e)} />
                            <button type="button" onClick={() => removeDynamicItem('projects', proj.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addDynamicItem<Project>('projects', { id: `proj${Date.now()}`, name: '', description: '', link: ''})}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Project
                </button>
            </Section>
        </form>
    );
}