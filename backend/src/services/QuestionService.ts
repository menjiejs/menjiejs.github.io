import { Question, TestCase } from '../models/Question';
import { getDB } from '../database/init';
import { v4 as uuidv4 } from 'uuid';

export class QuestionService {
  // 获取所有题目
  async getAllQuestions(): Promise<Question[]> {
    const db = getDB();
    try {
      const rows = await db.all('SELECT * FROM questions ORDER BY difficulty, created_at DESC');
      return rows.map(row => this.mapRowToQuestion(row));
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  // 根据ID获取题目
  async getQuestionById(id: string): Promise<Question | null> {
    const db = getDB();
    try {
      const row = await db.get('SELECT * FROM questions WHERE id = ?', [id]);
      return row ? this.mapRowToQuestion(row) : null;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  }

  // 根据难度获取题目
  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    const db = getDB();
    try {
      const rows = await db.all('SELECT * FROM questions WHERE difficulty = ? ORDER BY created_at DESC', [difficulty]);
      return rows.map(row => this.mapRowToQuestion(row));
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      return [];
    }
  }

  // 随机获取题目
  async getRandomQuestion(difficulty?: string): Promise<Question | null> {
    const db = getDB();
    try {
      let query = 'SELECT * FROM questions';
      let params: any[] = [];

      if (difficulty) {
        query += ' WHERE difficulty = ?';
        params.push(difficulty);
      }

      query += ' ORDER BY RANDOM() LIMIT 1';

      const row = await db.get(query, params);
      return row ? this.mapRowToQuestion(row) : null;
    } catch (error) {
      console.error('Error fetching random question:', error);
      return null;
    }
  }

  // 创建新题目
  async createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const db = getDB();
    try {
      const id = uuidv4();
      const now = new Date();

      await db.run(
        `INSERT INTO questions (
          id, title, description, difficulty, input_format, output_format,
          hints, template_code, test_cases, memory_limit, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          questionData.title,
          questionData.description,
          questionData.difficulty,
          questionData.inputFormat,
          questionData.outputFormat,
          questionData.hints.join('\\n'),
          questionData.templateCode,
          JSON.stringify(questionData.testCases),
          questionData.memoryLimit,
          now.toISOString(),
          now.toISOString()
        ]
      );

      return {
        ...questionData,
        id,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  }

  // 更新题目
  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question | null> {
    const db = getDB();
    try {
      const existing = await this.getQuestionById(id);
      if (!existing) {
        return null;
      }

      const updateData = {
        ...existing,
        ...questionData,
        updatedAt: new Date()
      };

      await db.run(
        `UPDATE questions SET
          title = ?, description = ?, difficulty = ?, input_format = ?,
          output_format = ?, hints = ?, template_code = ?, test_cases = ?,
          memory_limit = ?, updated_at = ?
        WHERE id = ?`,
        [
          updateData.title,
          updateData.description,
          updateData.difficulty,
          updateData.inputFormat,
          updateData.outputFormat,
          updateData.hints.join('\\n'),
          updateData.templateCode,
          JSON.stringify(updateData.testCases),
          updateData.memoryLimit,
          updateData.updatedAt.toISOString(),
          id
        ]
      );

      return updateData;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  }

  // 删除题目
  async deleteQuestion(id: string): Promise<boolean> {
    const db = getDB();
    try {
      const result = await db.run('DELETE FROM questions WHERE id = ?', [id]);
      return (result.changes || 0) > 0;
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  }

  // 验证答案
  async validateAnswer(questionId: string, answerCode: string, input: string): Promise<{
    isCorrect: boolean;
    expectedOutput: string;
    actualOutput?: string;
    message: string;
  }> {
    // 这里应该实现实际的代码执行逻辑
    // 现在简化为返回固定结果（演示用）

    // 1. 从数据库获取题目
    const question = await this.getQuestionById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // 2. 使用测试用例验证答案
    const testCases = question.testCases;
    const testCase = testCases.find(tc => tc.input === input);

    if (!testCase) {
      return {
        isCorrect: false,
        expectedOutput: '',
        message: 'Invalid test case input'
      };
    }

    // TODO: 实际执行代码并比较输出
    // 这里应该使用沙箱环境执行代码
    const isCorrect = Math.random() > 0.3; // 70%正确率（演示用）

    return {
      isCorrect,
      expectedOutput: testCase.expectedOutput,
      actualOutput: isCorrect ? testCase.expectedOutput : 'WRONG OUTPUT',
      message: isCorrect ? '答案正确！' : '答案错误，请检查代码'
    };
  }

  // 统计题目数量
  async getQuestionStats(): Promise<{
    total: number;
    byDifficulty: Record<string, number>;
  }> {
    const db = getDB();
    try {
      const rows = await db.all('SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty');
      const byDifficulty: Record<string, number> = {};

      let total = 0;
      rows.forEach(row => {
        byDifficulty[row.difficulty] = row.count;
        total += row.count;
      });

      return { total, byDifficulty };
    } catch (error) {
      console.error('Error getting question stats:', error);
      return { total: 0, byDifficulty: {} };
    }
  }

  // 辅助方法：将数据库行映射为Question对象
  private mapRowToQuestion(row: any): Question {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      inputFormat: row.input_format,
      outputFormat: row.output_format,
      hints: row.hints ? row.hints.split('\\n') : [],
      templateCode: row.template_code,
      testCases: JSON.parse(row.test_cases),
      memoryLimit: row.memory_limit,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}