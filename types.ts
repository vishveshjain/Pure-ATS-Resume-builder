import React from 'react';

export interface ContactInfo {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    location: string;
}

export interface Experience {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string[];
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    location: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    link: string;
}

export interface Skill {
    id: string;
    category: string;
    items: string; // Stored as a comma-separated string for easier input management
}

export type SectionKey = 'summary' | 'experience' | 'education' | 'projects' | 'skills';

export interface ResumeData {
    contact: ContactInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
    skills: Skill[];
}

export interface Template {
    name: string;
    component: React.FC<{ resumeData: ResumeData; sectionOrder: SectionKey[] }>;
}