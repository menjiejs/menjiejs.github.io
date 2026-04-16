export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S';
  inputFormat: string;
  outputFormat: string;
  hints: string[];
  templateCode: string;
  testCases: TestCase[];
  memoryLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnswerResult {
  isCorrect: boolean;
  gameFinished: boolean;
  winner?: 'player' | 'monster';
  message: string;
  damage?: number;
  healthChange?: number;
}