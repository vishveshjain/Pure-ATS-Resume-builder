
import { ResumeData, Template } from './types';
import ClassicTemplate from './components/templates/ClassicTemplate';
import ModernTemplate from './components/templates/ModernTemplate';

export const initialResumeData: ResumeData = {
    contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
        phone: '123-456-7890',
        linkedin: 'linkedin.com/in/yourprofile',
        github: 'github.com/yourusername',
        website: 'yourportfolio.com',
        location: 'City, State'
    },
    summary: 'A brief professional summary about yourself. Highlight your key skills, experience, and career goals. Tailor this to the job you are applying for.',
    experience: [
        {
            id: 'exp1',
            company: 'Awesome Company',
            title: 'Software Engineer',
            startDate: 'Jan 2022',
            endDate: 'Present',
            location: 'San Francisco, CA',
            description: [
                'Developed and maintained web applications using React and TypeScript.',
                'Collaborated with cross-functional teams to deliver high-quality software.',
                'Improved application performance by 20% through code optimization.'
            ]
        }
    ],
    education: [
        {
            id: 'edu1',
            institution: 'University of Technology',
            degree: 'B.S. in Computer Science',
            startDate: 'Sep 2018',
            endDate: 'Dec 2021',
            location: 'Techville, USA'
        }
    ],
    projects: [
        {
            id: 'proj1',
            name: 'Personal Portfolio Website',
            description: 'Designed and built a responsive portfolio website to showcase my projects and skills.',
            link: 'yourportfolio.com'
        }
    ],
    skills: [
        { id: 'skill1', category: 'Programming Languages', items: 'JavaScript, TypeScript, Python, HTML, CSS' },
        { id: 'skill2', category: 'Frameworks & Libraries', items: 'React, Node.js, Express, Tailwind CSS' },
        { id: 'skill3', category: 'Tools & Platforms', items: 'Git, Docker, AWS, Vercel' }
    ]
};

export const templates: Template[] = [
    { name: 'Modern', component: ModernTemplate },
    { name: 'Classic', component: ClassicTemplate },
];
