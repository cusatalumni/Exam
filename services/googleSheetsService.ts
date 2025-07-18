import type { User, Question, UserAnswer, TestResult, CertificateData, Organization, Exam } from '../types';
import { logoBase64 } from '../assets/logo';

// Internal type for the mock DB that includes password
interface DbUser extends User {
    password?: string;
}

// =================================================================
// MOCK DATABASE & DYNAMIC CONFIGURATION
// This simulates a backend database. In a real app, this would be
// a separate service with a real database (e.g., Firebase, PostgreSQL).
// =================================================================

let mockDb: {
    users: DbUser[];
    testResults: TestResult[];
    organizations: Organization[];
} = {
    users: [
        { 
            id: 'user-001', 
            name: 'Administrator', 
            email: 'admin@annapoornainfo.com', 
            role: 'admin',
            password: 'Mansat@2'
        }
    ],
    testResults: [],
    organizations: [
        {
            id: 'org-mco',
            name: 'Medical Coding Online',
            website: 'www.coding-online.net',
            logo: logoBase64,
            exams: [
                {
                    id: 'exam-mco-free',
                    name: 'Free Training',
                    description: 'Hone your skills with a quick test. No strings attached.',
                    price: 0,
                    questionSourceUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMFALpdYSsjcnERF1wOpcnIT2qrRAZoyJYzc5T8_xq_Q3eQjAJJH30iDMMlO2tKhIYYKdOVBiPqF3Y/pub?gid=743667979&single=true&output=csv',
                    numberOfQuestions: 10,
                    passScore: 60,
                    certificateTemplateId: 'cert-mco-1'
                },
                {
                    id: 'exam-mco-paid',
                    name: 'Paid Original Test',
                    description: 'The full exam experience, designed to mimic official certification tests.',
                    price: 49.99,
                    questionSourceUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMFALpdYSsjcnERF1wOpcnIT2qrRAZoyJYzc5T8_xq_Q3eQjAJJH30iDMMlO2tKhIYYKdOVBiPqF3Y/pub?gid=743667979&single=true&output=csv',
                    numberOfQuestions: 10,
                    passScore: 60,
                    certificateTemplateId: 'cert-mco-1'
                }
            ],
            certificateTemplates: [
                {
                    id: 'cert-mco-1',
                    title: 'Medical Coding Proficiency',
                    body: 'For successfully demonstrating proficiency in medical coding, including mastery of ICD-10-CM, CPT, HCPCS Level II, and coding guidelines through the completion of a comprehensive Examination with a score of {finalScore}%. This achievement reflects dedication to excellence in medical coding and preparedness for professional certification.',
                    signature1Name: 'Dr. Amelia Reed',
                    signature1Title: 'Program Director',
                    signature2Name: 'B. Manoj',
                    signature2Title: 'Chief Instructor'
                }
            ]
        },
        {
            id: 'org-hci',
            name: 'Healthcare Certs Inc.',
            website: 'www.h-certs.com',
            logo: logoBase64, // Can use a different logo here
            exams: [
                {
                    id: 'exam-hci-pharma',
                    name: 'Pharma Assistant Cert',
                    description: 'Test your knowledge on pharmaceutical practices and patient care.',
                    price: 25.00,
                    questionSourceUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMFALpdYSsjcnERF1wOpcnIT2qrRAZoyJYzc5T8_xq_Q3eQjAJJH30iDMMlO2tKhIYYKdOVBiPqF3Y/pub?gid=743667979&single=true&output=csv', // Different sheet ideally
                    numberOfQuestions: 5,
                    passScore: 70,
                    certificateTemplateId: 'cert-hci-1'
                }
            ],
            certificateTemplates: [
                {
                    id: 'cert-hci-1',
                    title: 'Pharmaceutical Assistant',
                    body: 'Is hereby certified for completing the introductory course on pharmaceutical assistance and patient interaction with a final score of {finalScore}%.',
                    signature1Name: 'Dr. Evelyn Hayes',
                    signature1Title: 'Head of Certification',
                    signature2Name: 'Mr. David Chen',
                    signature2Title: 'Lead Examiner'
                }
            ]
        }
    ]
};


// Cache for the questions to avoid re-fetching on every test start.
const questionCache = new Map<string, Question[]>();

// Fetches and parses questions from a given Google Sheet URL.
const fetchAndParseQuestions = async (url: string): Promise<Question[]> => {
    if (questionCache.has(url)) {
        return questionCache.get(url)!;
    }

    try {
        const response = await fetch(`${url}&_=${new Date().getTime()}`);
        if (!response.ok) throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/csv')) {
            throw new Error('Received incorrect file type from Google Sheets.');
        }

        const csvText = await response.text();
        const lines = csvText.trim().split(/\r\n|\r|\n/).slice(1).filter(line => line.trim() !== '');

        const questions: Question[] = lines.map((line, index) => {
            try {
                const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (columns.length < 3) return null;

                const [questionStr, optionsStr, correctAnswerStr] = columns.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                if (!questionStr || !optionsStr || !correctAnswerStr) return null;

                const correctAnswerNum = parseInt(correctAnswerStr, 10);
                if (isNaN(correctAnswerNum)) return null;

                const options = optionsStr.split('|');
                if (options.length < 2) return null;

                return {
                    id: index + 1,
                    question: questionStr,
                    options,
                    correctAnswer: correctAnswerNum,
                };
            } catch {
                return null;
            }
        }).filter((q): q is Question => q !== null);

        if (questions.length === 0) throw new Error("No questions parsed from the sheet.");
        
        questionCache.set(url, questions);
        return questions;
    } catch (error) {
        console.error("Error fetching or parsing questions:", error);
        throw error;
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const googleSheetsService = {
    // === DYNAMIC DATA MANAGEMENT (for Admin page) ===
    getOrganizations: (): Organization[] => {
        return mockDb.organizations;
    },
    updateOrganization: (updatedOrg: Organization): void => {
        const index = mockDb.organizations.findIndex(o => o.id === updatedOrg.id);
        if (index !== -1) {
            mockDb.organizations[index] = updatedOrg;
            console.log("Updated organization:", updatedOrg);
        }
    },

    // === AUTHENTICATION ===
    login: async (email: string, password: string): Promise<User> => {
        await delay(500);
        const user = mockDb.users.find(u => u.email === email);
        if (user && user.password === password) {
            // Return a user object without the password
            const { password: _, ...userToReturn } = user;
            return userToReturn;
        }
        throw new Error("User not found or password incorrect.");
    },
    signup: async (name: string, email: string, password: string): Promise<User> => {
        await delay(500);
        if (mockDb.users.some(u => u.email === email)) {
            throw new Error("User with this email already exists.");
        }
        const newUser: DbUser = { 
            id: `user-${Date.now()}`, 
            name, 
            email, 
            role: 'user', 
            password 
        };
        mockDb.users.push(newUser);
        
        const { password: _, ...userToReturn } = newUser;
        return userToReturn;
    },

    // === DYNAMIC EXAM LOGIC ===
    getExamConfig: (orgId: string, examId: string): Exam | undefined => {
        const org = mockDb.organizations.find(o => o.id === orgId);
        return org?.exams.find(e => e.id === examId);
    },

    getQuestions: async (examConfig: Exam): Promise<Question[]> => {
        const allQuestions = await fetchAndParseQuestions(examConfig.questionSourceUrl);
        if (allQuestions.length === 0) return [];
        
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(examConfig.numberOfQuestions, allQuestions.length));
    },

    submitTest: async (userId: string, orgId: string, examId: string, answers: UserAnswer[]): Promise<TestResult> => {
        await delay(1000);
        
        const examConfig = googleSheetsService.getExamConfig(orgId, examId);
        if (!examConfig) throw new Error("Invalid exam configuration.");
        
        const allQuestions = questionCache.get(examConfig.questionSourceUrl);
        if (!allQuestions) throw new Error("Could not retrieve questions to grade the test.");
        
        let correctCount = 0;
        const review: TestResult['review'] = [];

        answers.forEach(userAnswer => {
            const question = allQuestions.find(q => q.id === userAnswer.questionId);
            if (question) {
                if ((userAnswer.answer + 1) === question.correctAnswer) {
                    correctCount++;
                }
                review.push({
                    questionId: question.id,
                    question: question.question,
                    options: question.options,
                    userAnswer: userAnswer.answer,
                    correctAnswer: question.correctAnswer - 1
                });
            }
        });

        const totalQuestions = answers.length;
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

        const newResult: TestResult = {
            testId: `test-${Date.now()}`,
            userId,
            examId,
            answers,
            score: parseFloat(score.toFixed(2)),
            correctCount,
            totalQuestions,
            timestamp: Date.now(),
            review
        };

        mockDb.testResults.push(newResult);
        return newResult;
    },

    getTestResult: async(testId: string, userId: string): Promise<TestResult | null> => {
        await delay(500);
        const foundResult = mockDb.testResults.find(r => r.testId === testId && r.userId === userId);
        return foundResult || null;
    },

    getCertificateData: async (testId: string, user: User, orgId: string): Promise<CertificateData | null> => {
        await delay(500);
        const result = mockDb.testResults.find(r => r.testId === testId && r.userId === user.id);
        const organization = mockDb.organizations.find(o => o.id === orgId);
        
        if (!result || !organization) return null;
        
        const exam = organization.exams.find(e => e.id === result.examId);
        const template = organization.certificateTemplates.find(t => t.id === exam?.certificateTemplateId);

        if (result && exam && template && exam.price > 0 && result.score >= exam.passScore) {
            return {
                certificateNumber: `${result.timestamp}`,
                candidateName: user.name,
                finalScore: result.score,
                date: new Date(result.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                }),
                totalQuestions: result.totalQuestions,
                organization,
                template
            };
        }
        return null;
    },
};