export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface UserAnswer {
  questionId: number;
  answer: number; // The index of the selected option
}

export interface TestResult {
  testId: string;
  userId: string;
  examId: string; // Link back to the specific exam configuration
  answers: UserAnswer[];
  score: number; // Percentage
  correctCount: number;
  totalQuestions: number;
  timestamp: number;
  review: AnswerReview[];
}

export interface AnswerReview {
    questionId: number;
    question: string;
    options: string[];
    userAnswer: number; // index of user's answer
    correctAnswer: number; // index of correct answer
}

export interface CertificateData {
    certificateNumber: string;
    candidateName: string;
    finalScore: number;
    date: string;
    totalQuestions: number;
    // Dynamic fields from template
    organization: Organization;
    template: CertificateTemplate;
}

// =================================================================
// DYNAMIC CONFIGURATION TYPES
// =================================================================

export interface CertificateTemplate {
    id: string;
    title: string;
    body: string;
    signature1Name: string;
    signature1Title: string;
    signature2Name: string;
    signature2Title: string;
}

export interface Exam {
    id: string;
    name: string;
    description: string;
    price: number;
    questionSourceUrl: string;
    numberOfQuestions: number;
    passScore: number;
    certificateTemplateId: string;
}

export interface Organization {
    id: string;
    name: string;
    website: string;
    logo: string; // base64 string
    exams: Exam[];
    certificateTemplates: CertificateTemplate[];
}