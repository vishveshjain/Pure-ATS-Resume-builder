
import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { ResumeData, Experience, Education, Project, Skill, ContactInfo } from '../types';
import { PlusIcon, SparklesIcon, TrashIcon } from './icons';

interface ResumeFormProps {
    resumeData: ResumeData;
    setResumeData: Dispatch<SetStateAction<ResumeData>>;
    onGenerateSummary: () => void;
    isGeneratingSummary: boolean;
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

export default function ResumeForm({ resumeData, setResumeData, onGenerateSummary, isGeneratingSummary }: ResumeFormProps) {

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
            // FIX: Cast through `unknown` to resolve TypeScript error. This is safe because the generic type T
            // is correctly supplied at the call site, ensuring `prev[section]` is of the expected array type.
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
            // FIX: Cast through `unknown` to resolve TypeScript error. This is safe because the generic type T
            // is correctly supplied at the call site, ensuring `prev[section]` is of the expected array type.
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
                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
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
                <button
                    type="button"
                    onClick={() => addDynamicItem<Experience>('experience', { id: `exp${Date.now()}`, title: '', company: '', startDate: '', endDate: '', location: '', description: [] })}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Experience
                </button>
            </Section>

            <Section title="Education">
                {resumeData.education.map((edu) => (
                    <div key={edu.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
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
                <button
                    type="button"
                    onClick={() => addDynamicItem<Education>('education', { id: `edu${Date.now()}`, institution: '', degree: '', startDate: '', endDate: '', location: '' })}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Education
                </button>
            </Section>
            
            <Section title="Skills">
                {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                         <Input label="Category (e.g., Programming Languages)" name="category" value={skill.category} onChange={(e) => handleDynamicChange<Skill>('skills', skill.id, e)} />
                         <Textarea label="Skills (comma separated)" name="items" value={skill.items} onChange={(e) => handleDynamicChange<Skill>('skills', skill.id, e)} rows={2} />
                         <button type="button" onClick={() => removeDynamicItem('skills', skill.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700">
                             <TrashIcon className="w-5 h-5" />
                         </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addDynamicItem<Skill>('skills', { id: `skill${Date.now()}`, category: '', items: ''})}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                     <PlusIcon className="w-5 h-5 mr-1" /> Add Skill Category
                </button>
            </Section>
        </form>
    );
}
