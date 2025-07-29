

import type { User, Question, UserAnswer, TestResult, CertificateData, Organization, Exam, ExamProductCategory } from '../types';
import { logoBase64 } from '../assets/logo';


const EXAM_PRODUCT_CATEGORIES: ExamProductCategory[] = [
    { id: 'prod-cpc', name: 'CPC', description: 'A test series designed to prepare you for the AAPC CPC (Certified Professional Coder) certification.', practiceExamId: 'exam-cpc-practice', certificationExamId: 'exam-cpc-cert' },
    { id: 'prod-cca', name: 'CCA', description: 'A test series aligned with AHIMA’s CCA (Certified Coding Associate) exam blueprint.', practiceExamId: 'exam-cca-practice', certificationExamId: 'exam-cca-cert' },
    { id: 'prod-inpatient', name: 'Inpatient Coding', description: 'A test series for coders specializing in hospital inpatient coding.', practiceExamId: 'exam-inpatient-practice', certificationExamId: 'exam-inpatient-cert' },
    { id: 'prod-outpatient', name: 'Outpatient Coding', description: 'A test series for coders focusing on ambulatory care and outpatient procedures.', practiceExamId: 'exam-outpatient-practice', certificationExamId: 'exam-outpatient-cert' },
    { id: 'prod-billing', name: 'Medical Billing', description: 'A test series covering core concepts in medical billing and reimbursement.', practiceExamId: 'exam-billing-practice', certificationExamId: 'exam-billing-cert' },
    { id: 'prod-risk', name: 'Risk Adjustment Coding', description: 'A test series on risk adjustment models and hierarchical condition categories (HCC).', practiceExamId: 'exam-risk-practice', certificationExamId: 'exam-risk-cert' },
    { id: 'prod-auditing', name: 'Medical Auditing', description: 'A test series covering principles of medical record auditing and compliance.', practiceExamId: 'exam-auditing-practice', certificationExamId: 'exam-auditing-cert' },
    { id: 'prod-icd', name: 'ICD-10-CM', description: 'A test series focusing on ICD-10-CM coding proficiency.', practiceExamId: 'exam-icd-practice', certificationExamId: 'exam-icd-cert' },
];

const ALL_EXAMS: Exam[] = [
    // CPC
    { id: 'exam-cpc-practice', name: 'CPC Practice Test', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-cpc-cert', name: 'CPC Certification Exam', description: '', price: 19.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // CCA
    { id: 'exam-cca-practice', name: 'CCA Practice Test', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-cca-cert', name: 'CCA Certification Exam', description: '', price: 24.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // Inpatient
    { id: 'exam-inpatient-practice', name: 'Inpatient Coding Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-inpatient-cert', name: 'Inpatient Coding Certification', description: '', price: 19.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // Outpatient
    { id: 'exam-outpatient-practice', name: 'Outpatient Coding Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-outpatient-cert', name: 'Outpatient Coding Certification', description: '', price: 14.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // Billing
    { id: 'exam-billing-practice', name: 'Medical Billing Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-billing-cert', name: 'Medical Billing Certification', description: '', price: 12.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // Risk
    { id: 'exam-risk-practice', name: 'Risk Adjustment Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-risk-cert', name: 'Risk Adjustment Certification', description: '', price: 19.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // Auditing
    { id: 'exam-auditing-practice', name: 'Medical Auditing Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-auditing-cert', name: 'Medical Auditing Certification', description: '', price: 21.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
    // ICD
    { id: 'exam-icd-practice', name: 'ICD-10-CM Practice', description: '', price: 0, questionSourceUrl: '', numberOfQuestions: 10, passScore: 70, certificateTemplateId: '', isPractice: true },
    { id: 'exam-icd-cert', name: 'ICD-10-CM Certification', description: '', price: 14.99, questionSourceUrl: '', numberOfQuestions: 100, passScore: 70, certificateTemplateId: 'cert-mco-1', isPractice: false },
];


const MASTER_QUESTION_SOURCE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMFALpdYSsjcnERF1wOpcnIT2qrRAZoyJYzc5T8_xq_Q3eQjAJJH30iDMMlO2tKhIYYKdOVBiPqF3Y/pub?gid=743667979&single=true&output=csv';

let mockDb: {
    users: User[];
    testResults: TestResult[];
    organizations: Organization[];
} = {
    users: [
        { id: 'user-001', name: 'John Doe', email: 'john@example.com' }
    ],
    testResults: [],
    organizations: [
        {
            id: 'org-mco',
            name: 'Medical Coding Online',
            website: 'www.coding-online.net',
            logo: logoBase64,
            exams: ALL_EXAMS.map(exam => ({
                ...exam,
                recommendedBook: exam.isPractice ? undefined : {
                    title: 'Official CPC Certification Study Guide',
                    description: 'The most comprehensive guide to prepare for your certification. Includes practice questions and detailed explanations to master the material.',
                    imageUrl: 'https://via.placeholder.com/300x400/003366/FFFFFF.png?text=Study+Guide',
                    affiliateLinks: {
                        com: 'https://www.amazon.com/dp/164018398X?tag=mykada-20',
                        in: 'https://www.amazon.in/dp/164018398X?tag=httpcodingonl-21',
                        ae: 'https://amzn.to/46QduHx'
                    }
                }
            })),
            examProductCategories: EXAM_PRODUCT_CATEGORIES,
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
        }
    ]
};

const allQuestionsCache = new Map<string, Question[]>();

const fetchAndParseAllQuestions = async (url: string): Promise<Question[]> => {
    if (allQuestionsCache.has(url)) {
        return allQuestionsCache.get(url)!;
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

                return { id: index + 1, question: questionStr, options, correctAnswer: correctAnswerNum };
            } catch {
                return null;
            }
        }).filter((q): q is Question => q !== null);
        
        if (questions.length === 0) throw new Error("No questions parsed from the sheet.");
        
        allQuestionsCache.set(url, questions);
        return questions;
    } catch (error) {
        console.error("Error fetching or parsing questions:", error);
        throw error;
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const googleSheetsService = {
    initializeAndCategorizeExams: async (): Promise<void> => {
        // Just fetch all questions. No AI categorization.
        if (allQuestionsCache.has(MASTER_QUESTION_SOURCE_URL)) {
            return; 
        }
        await fetchAndParseAllQuestions(MASTER_QUESTION_SOURCE_URL);
    },
    
    getOrganizations: (): Organization[] => mockDb.organizations,
    
    login: async (email: string, _password: string): Promise<User> => {
        await delay(500);
        const user = mockDb.users.find(u => u.email === email);
        if (user) return user;
        throw new Error("User not found or password incorrect.");
    },
    
    signup: async (name: string, email: string, _password: string): Promise<User> => {
        await delay(500);
        if (mockDb.users.some(u => u.email === email)) {
            throw new Error("User with this email already exists.");
        }
        const newUser: User = { id: `user-${Date.now()}`, name, email };
        mockDb.users.push(newUser);
        return newUser;
    },
    
    getExamConfig: (orgId: string, examId: string): Exam | undefined => {
        const org = mockDb.organizations.find(o => o.id === orgId);
        return org?.exams.find(e => e.id === examId);
    },
    
    getQuestions: async (examConfig: Exam): Promise<Question[]> => {
        const allQuestions = allQuestionsCache.get(MASTER_QUESTION_SOURCE_URL);
        
        if (!allQuestions || allQuestions.length === 0) {
             throw new Error(`No questions found for: ${examConfig.name}`);
        }

        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(examConfig.numberOfQuestions, shuffled.length));
    },

    submitTest: async (userId: string, orgId: string, examId: string, answers: UserAnswer[]): Promise<TestResult> => {
        await delay(1000);
        const examConfig = googleSheetsService.getExamConfig(orgId, examId);
        if (!examConfig) throw new Error("Invalid exam configuration.");
        
        const questionPool = allQuestionsCache.get(MASTER_QUESTION_SOURCE_URL);
        
        if (!questionPool || questionPool.length === 0) throw new Error("Could not retrieve questions to grade the test.");
        
        let correctCount = 0;
        const review: TestResult['review'] = [];

        answers.forEach(userAnswer => {
            const question = questionPool.find(q => q.id === userAnswer.questionId);
            if (question) {
                if ((userAnswer.answer + 1) === question.correctAnswer) correctCount++;
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
            userId, examId, answers,
            score: parseFloat(score.toFixed(2)),
            correctCount, totalQuestions,
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
    
    getTestResultsForUser: async(userId: string): Promise<TestResult[]> => {
        await delay(500);
        return mockDb.testResults.filter(r => r.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
    },

    getCertificateData: async (testId: string, user: User, orgId: string): Promise<CertificateData | null> => {
        if (testId === 'sample') return googleSheetsService.getSampleCertificateData(user);

        await delay(500);
        const result = mockDb.testResults.find(r => r.testId === testId && r.userId === user.id);
        const organization = mockDb.organizations.find(o => o.id === orgId);
        
        if (!result || !organization) return null;
        
        const exam = organization.exams.find(e => e.id === result.examId);
        const template = organization.certificateTemplates.find(t => t.id === exam?.certificateTemplateId);

        if (result && exam && template && exam.price > 0 && result.score >= exam.passScore) {
            return {
                certificateNumber: `${result.timestamp}`,
                candidateName: user.name, finalScore: result.score,
                date: new Date(result.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                totalQuestions: result.totalQuestions, organization, template
            };
        }
        return null;
    },

    getSampleCertificateData: (user: User): CertificateData => {
        const organization = mockDb.organizations[0];
        const template = organization.certificateTemplates[0];
        return {
            certificateNumber: '12345-SAMPLE',
            candidateName: user.name,
            finalScore: 95,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            totalQuestions: 10,
            organization,
            template
        };
    },
};
