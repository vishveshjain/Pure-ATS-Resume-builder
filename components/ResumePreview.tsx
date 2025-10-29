import React from 'react';
import { ResumeData, SectionKey } from '../types';

interface ResumePreviewProps {
    resumeData: ResumeData;
    templateComponent: React.FC<{ resumeData: ResumeData, sectionOrder: SectionKey[] }>;
    sectionOrder: SectionKey[];
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, templateComponent: TemplateComponent, sectionOrder }) => {
    return <TemplateComponent resumeData={resumeData} sectionOrder={sectionOrder} />;
};

export default ResumePreview;