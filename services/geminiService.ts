
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

// FIX: Per coding guidelines, API key must be read directly from process.env.API_KEY
// and fallbacks or warnings are not permitted.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        contact: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                website: { type: Type.STRING },
                location: { type: Type.STRING },
            },
        },
        summary: {
            type: Type.STRING,
            description: 'A professional summary of 2-4 sentences.'
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    title: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: "e.g., 'Jan 2022' or '2022'" },
                    endDate: { type: Type.STRING, description: "e.g., 'Present' or 'Dec 2023'" },
                    location: { type: Type.STRING },
                    description: {
                        type: Type.ARRAY,
                        description: 'List of accomplishments or responsibilities, starting with an action verb.',
                        items: { type: Type.STRING },
                    },
                },
                required: ['company', 'title', 'startDate', 'endDate', 'description'],
            },
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    location: { type: Type.STRING },
                },
                required: ['institution', 'degree'],
            },
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING },
                },
                required: ['name', 'description'],
            },
        },
        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "e.g., 'Languages', 'Frameworks', 'Developer Tools'" },
                    items: { type: Type.STRING, description: "A comma-separated list of skills." },
                },
                required: ['category', 'items'],
            },
        },
    },
};

export const parseResume = async (mimeType: string, base64Data: string): Promise<ResumeData> => {
    const prompt = 'Extract the information from this resume and structure it according to the provided JSON schema. For experience descriptions, ensure each item is a string in an array. For skills, group them into logical categories and provide the skills as a single comma-separated string for each category.';
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt },
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: resumeSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Add unique IDs to array items, as they are needed for React keys
    const dataWithIds = {
        ...parsedJson,
        experience: parsedJson.experience?.map((item: any, index: number) => ({ ...item, id: `exp${Date.now()}${index}` })) || [],
        education: parsedJson.education?.map((item: any, index: number) => ({ ...item, id: `edu${Date.now()}${index}` })) || [],
        projects: parsedJson.projects?.map((item: any, index: number) => ({ ...item, id: `proj${Date.now()}${index}` })) || [],
        skills: parsedJson.skills?.map((item: any, index: number) => ({ ...item, id: `skill${Date.now()}${index}` })) || [],
    };
    
    return dataWithIds as ResumeData;
};


export const generateSummary = async (resumeData: ResumeData): Promise<string> => {
    const { experience, education, skills } = resumeData;
    const context = `
        Based on the following professional background, write a compelling and concise professional summary (2-4 sentences) for a resume.
        
        Experience:
        ${experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description.join(', ')}`).join('\n')}
        
        Education:
        ${education.map(edu => `- ${edu.degree} from ${edu.institution}`).join('\n')}
        
        Skills:
        ${skills.map(skill => `${skill.category}: ${skill.items}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: context,
    });
    
    return response.text;
};
