
import React from 'react';
import { ResumeData } from '../../types';

const ClassicTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => {
    const { contact, summary, experience, education, skills } = resumeData;

    return (
        <div className="p-8 bg-white text-gray-800 font-lora text-sm">
            <header className="text-center mb-6 border-b pb-4">
                <h1 className="text-4xl font-bold tracking-wider">{contact.name}</h1>
                <div className="flex justify-center space-x-4 text-xs mt-2 text-gray-600">
                    <span>{contact.location}</span>
                    <span>|</span>
                    <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                    <span>|</span>
                    <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                    <span>|</span>
                    <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
                    <span>|</span>
                    <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
                </div>
            </header>

            <section className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-widest">SUMMARY</h2>
                <p className="text-justify">{summary}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-widest">EXPERIENCE</h2>
                {experience.map(exp => (
                    <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-semibold">{exp.company}</h3>
                            <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="italic">{exp.title}</p>
                            <p className="text-xs text-gray-600">{exp.location}</p>
                        </div>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            {exp.description.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-widest">EDUCATION</h2>
                {education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-semibold">{edu.institution}</h3>
                            <p className="text-xs text-gray-600">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="italic">{edu.degree}</p>
                             <p className="text-xs text-gray-600">{edu.location}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-widest">SKILLS</h2>
                <div className="space-y-1">
                    {skills.map(skill => (
                        <div key={skill.id} className="flex">
                            <p className="font-semibold w-1/4">{skill.category}:</p>
                            <p className="w-3/4">{skill.items}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ClassicTemplate;
