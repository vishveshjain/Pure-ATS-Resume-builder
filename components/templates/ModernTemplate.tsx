import React from 'react';
import { ResumeData, SectionKey } from '../../types';

const ModernTemplate: React.FC<{ resumeData: ResumeData, sectionOrder: SectionKey[] }> = ({ resumeData, sectionOrder }) => {
    const { contact, summary, experience, education, projects, skills } = resumeData;

    const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
        <section className={`mb-5 ${className}`}>
            <h2 className="text-sm font-bold uppercase text-indigo-600 border-b-2 border-indigo-200 pb-1 mb-3 tracking-wider">{title}</h2>
            {children}
        </section>
    );
    
    // Main content sections that can be reordered
    const SummarySection = () => <Section title="Professional Summary"><p className="text-sm leading-relaxed text-gray-800">{summary}</p></Section>;
    
    const ExperienceSection = () => (
        <Section title="Work Experience">
            {experience.map(exp => (
                <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-800">{exp.title}</h3>
                        <p className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-semibold text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.location}</p>
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                        {exp.description.map((item, index) => (
                            <li key={index} className="pl-1">{item}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </Section>
    );
    
    const ProjectsSection = () => (
        projects && projects.length > 0 && (
            <Section title="Projects">
                {projects.map(proj => (
                    <div key={proj.id} className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-800">{proj.name}</h3>
                            {proj.link && (
                                <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} className="text-xs font-medium text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                    {proj.link}
                                </a>
                            )}
                        </div>
                        <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                ))}
            </Section>
        )
    );

    // Sidebar sections have a fixed order in this template design
    const EducationSectionSidebar = () => (
        <Section title="Education">
            {education.map(edu => (
                <div key={edu.id} className="mb-3">
                    <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                    <p className="text-xs">{edu.degree}</p>
                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </Section>
    );

    const SkillsSectionSidebar = () => (
         <Section title="Skills">
            {skills.map(skill => (
                <div key={skill.id} className="mb-3">
                    <h3 className="font-bold text-gray-800 mb-1">{skill.category}</h3>
                    <p className="text-xs leading-relaxed">{skill.items}</p>
                </div>
            ))}
        </Section>
    );

    // Map section keys to their corresponding components
    const sectionComponents: Record<SectionKey, React.ReactNode> = {
        summary: <SummarySection />,
        experience: <ExperienceSection />,
        education: null, // Rendered in sidebar
        projects: <ProjectsSection />,
        skills: null, // Rendered in sidebar
    };

    // Filter out sidebar sections from the main content order
    const mainContentOrder = sectionOrder.filter(key => key !== 'education' && key !== 'skills');


    return (
        <div className="flex font-source-sans bg-white text-sm">
            {/* Left Sidebar */}
            <aside className="w-1/3 bg-gray-100 p-6 text-gray-700">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{contact.name}</h1>
                </header>
                
                <Section title="Contact">
                    <ul className="space-y-2 text-xs">
                        {contact.location && <li><span className="font-semibold">Location:</span> {contact.location}</li>}
                        {contact.phone && <li><span className="font-semibold">Phone:</span> {contact.phone}</li>}
                        {contact.email && <li><span className="font-semibold">Email:</span> <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a></li>}
                        {contact.linkedin && <li><span className="font-semibold">LinkedIn:</span> <a href={`https://${contact.linkedin}`} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">{contact.linkedin}</a></li>}
                        {contact.github && <li><span className="font-semibold">GitHub:</span> <a href={`https://${contact.github}`} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">{contact.github}</a></li>}
                         {contact.website && <li><span className="font-semibold">Website:</span> <a href={`https://${contact.website}`} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">{contact.website}</a></li>}
                    </ul>
                </Section>
                
                <EducationSectionSidebar />
                <SkillsSectionSidebar />
            </aside>

            {/* Main Content */}
            <main className="w-2/3 p-6">
                {mainContentOrder.map(key => (
                    <React.Fragment key={key}>{sectionComponents[key]}</React.Fragment>
                ))}
            </main>
        </div>
    );
};

export default ModernTemplate;