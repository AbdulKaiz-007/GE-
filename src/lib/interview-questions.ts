import { Question } from './types';

export interface InterviewQuestion {
    question: string;
    answer: string;
    domain: string;
    options?: Record<string, string>;
    correct_option?: string;
}

export const INTERVIEW_QUESTIONS: Record<string, InterviewQuestion[]> = {
    "Frontend": [
        {
            question: "What is the Virtual DOM in React?",
            answer: "The Virtual DOM is a lightweight copy of the real DOM. React uses it to track changes and update only the necessary parts of the real DOM, which improves performance.",
            domain: "Frontend",
            options: { A: "A lightweight copy of the real DOM", B: "A faster way to access local storage", C: "A replacement for CSS", D: "A type of database" },
            correct_option: "A"
        },
        {
            question: "Explain the CSS Box Model.",
            answer: "The CSS box model is a container that contains multiple properties including margins, borders, padding, and the main content.",
            domain: "Frontend",
            options: { A: "A model for 3D graphics", B: "A container for margins, borders, padding and content", C: "A way to store data in the browser", D: "A Javascript library" },
            correct_option: "B"
        },
        {
            question: "What are React Hooks?",
            answer: "Hooks are functions that let you “hook into” React state and lifecycle features from function components.",
            domain: "Frontend",
            options: { A: "Tools for fishing", B: "Functions for state and lifecycle in functional components", C: "CSS selectors", D: "HTTP status codes" },
            correct_option: "B"
        }
    ],
    "Backend": [
        {
            question: "What is the difference between REST and GraphQL?",
            answer: "REST is an architectural style for providing standards between computer systems on the web. GraphQL is a query language for APIs that allows clients to request exactly the data they need.",
            domain: "Backend",
            options: { A: "REST uses SQL, GraphQL uses NoSQL", B: "REST is legacy, GraphQL is modern", C: "REST is an architectural style, GraphQL is a query language", D: "There is no difference" },
            correct_option: "C"
        },
        {
            question: "What is database indexing and why is it used?",
            answer: "Indexing is a way to optimize the performance of a database by minimizing the number of disk accesses required when a query is processed. It's like an index in a book.",
            domain: "Backend",
            options: { A: "A way to delete data", B: "A optimization to minimize disk accesses", C: "A method to encrypt data", D: "A backup strategy" },
            correct_option: "B"
        }
    ],
    "AI/ML": [
        {
            question: "What is overfitting in Machine Learning?",
            answer: "Overfitting occurs when a statistical model or machine learning algorithm captures the noise of the data. This happens when the model is too complex and performs well on training data but poorly on unseen data.",
            domain: "AI/ML",
            options: { A: "When a model is too simple", B: "When a model captures noise instead of patterns", C: "When training takes too long", D: "When the dataset is too small" },
            correct_option: "B"
        },
        {
            question: "Explain Gradient Descent.",
            answer: "Gradient descent is an optimization algorithm used to minimize some function by iteratively moving in the direction of steepest descent.",
            domain: "AI/ML",
            options: { A: "A method to increase error", B: "An optimization algorithm to minimize a function", C: "A type of neural network layer", D: "A data visualization technique" },
            correct_option: "B"
        }
    ],
    "General": [
        {
            question: "Tell me about yourself.",
            answer: "A standard opener to summarize your background, skills, and why you're a fit for the role.",
            domain: "General",
            options: { A: "Summary of background and fit for role", B: "Listing every hobby", C: "Detailed life story from birth", D: "Asking why you were hired" },
            correct_option: "A"
        },
        {
            question: "What's your biggest weakness?",
            answer: "An opportunity to show self-awareness and how you're working to improve.",
            domain: "General",
            options: { A: "I have no weaknesses", B: "I work too hard", C: "An honest self-reflection with a plan to improve", D: "Something unrelated to work" },
            correct_option: "C"
        }
    ]
};

export function getQuestionsForDomain(domain: string): Question[] {
    const questions = INTERVIEW_QUESTIONS[domain] || INTERVIEW_QUESTIONS["General"];
    return questions.map((q, i) => {
        const correctLabel = q.correct_option || "A";
        const rawOptions = q.options || { A: q.answer, B: "Wrong Option 1", C: "Wrong Option 2", D: "Wrong Option 3" };
        
        const parsedOptions = Object.entries(rawOptions).map(([label, text]) => ({
            label,
            text,
            is_correct: label === correctLabel
        }));

        return {
            id: `int-${domain}-${i}`,
            lesson_id: `int-${domain}`,
            question_text: q.question,
            options: parsedOptions,
            correct_option: correctLabel,
            explanation: q.answer,
            concept_tag: domain,
            difficulty_tier: 'elite',
            created_at: new Date().toISOString()
        } as Question;
    });
}
