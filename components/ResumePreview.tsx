
import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
    resumeData: ResumeData;
    templateComponent: React.FC<{ resumeData: ResumeData }>;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, templateComponent: TemplateComponent }) => {
    return <TemplateComponent resumeData={resumeData} />;
};

export default ResumePreview;
