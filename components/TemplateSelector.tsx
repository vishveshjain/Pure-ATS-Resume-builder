
import React from 'react';
import { Template } from '../types';

interface TemplateSelectorProps {
    templates: Template[];
    selectedTemplate: Template;
    onSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, selectedTemplate, onSelect }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Choose a Template</h3>
            <div className="flex space-x-4">
                {templates.map((template) => (
                    <button
                        key={template.name}
                        onClick={() => onSelect(template)}
                        className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                            selectedTemplate.name === template.name
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {template.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;
