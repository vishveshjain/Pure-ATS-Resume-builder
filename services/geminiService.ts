import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getImprovedPrompt = () => `
    Extract the information from the provided resume content. Structure the output as a valid JSON object.
    The JSON object must strictly adhere to the following structure. Do not add any extra text, markdown formatting, or explanations outside of the JSON object itself.
    If a value for a field is not found, use an empty string "" for string fields or an empty array [] for array fields.

    JSON Structure:
    {
      "contact": { "name": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": "", "location": "" },
      "summary": "",
      "experience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "location": "", "description": [""] }],
      "education": [{ "institution": "", "degree": "", "startDate": "", "endDate": "", "location": "" }],
      "projects": [{ "name": "", "description": "", "link": "" }],
      "skills": [{ "category": "", "items": "" }]
    }

    Important Rules:
    - For the "experience" section, ensure each accomplishment or responsibility is a separate string within the "description" array.
    - For the "skills" section, group skills into logical categories (e.g., "Programming Languages", "Frameworks", "Tools"). For each category, provide the skills as a single comma-separated string for the "items" field.
`;

const processApiResponse = (responseText: string): ResumeData => {
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7);
    }
    if (jsonText.endsWith('```')) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    
    const parsedJson = JSON.parse(jsonText);
    
    // Add unique IDs to array items and provide fallbacks for missing data
    const dataWithIds = {
        ...parsedJson,
        contact: parsedJson.contact || { name: '', email: '', phone: '', linkedin: '', github: '', website: '', location: '' },
        summary: parsedJson.summary || '',
        experience: parsedJson.experience?.map((item: any, index: number) => ({ ...item, id: `exp${Date.now()}${index}` })) || [],
        education: parsedJson.education?.map((item: any, index: number) => ({ ...item, id: `edu${Date.now()}${index}` })) || [],
        projects: parsedJson.projects?.map((item: any, index: number) => ({ ...item, id: `proj${Date.now()}${index}` })) || [],
        skills: parsedJson.skills?.map((item: any, index: number) => ({ ...item, id: `skill${Date.now()}${index}` })) || [],
    };
    
    return dataWithIds as ResumeData;
};

export const parseResume = async (mimeType: string, base64Data: string): Promise<ResumeData> => {
    const prompt = getImprovedPrompt();
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{
            parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt },
            ],
        }],
        config: {
            responseMimeType: 'application/json',
        },
    });

    return processApiResponse(response.text);
};

export const parseResumeFromText = async (textContent: string): Promise<ResumeData> => {
    const prompt = getImprovedPrompt();
    const fullPrompt = `Resume Content:\n${textContent}\n\n---\n\n${prompt}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: {
            responseMimeType: 'application/json',
        },
    });
    
    return processApiResponse(response.text);
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