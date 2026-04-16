import { Router, Request, Response } from 'express';
import { GameService } from '../services/GameService';
import { QuestionService } from '../services/QuestionService';

const router = Router();
const gameService = new GameService();
const questionService = new QuestionService();

// 获取游戏状态
router.get('/state/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const gameState = gameService.getGameState(sessionId);

    if (!gameState) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    res.json(gameState);
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建游戏会话
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { roomId, roomName, maxPlayers, gameMode } = req.body;

    if (!roomId || !roomName) {
      return res.status(400).json({ error: 'Room ID and name are required' });
    }

    const sessionData = {
      roomId,
      roomName,
      maxPlayers: maxPlayers || 4,
      gameMode: gameMode || 'solo'
    };

    const session = gameService.createSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加玩家到会话
router.post('/session/:sessionId/player', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { playerId, playerName, rank = 'D' } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({ error: 'Player ID and name are required' });
    }

    const session = gameService.addPlayer(sessionId, {
      id: playerId,
      name: playerName,
      rank,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      isReady: false
    });

    res.json(session);
  } catch (error) {
    console.error('Error adding player:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 玩家准备
router.post('/session/:sessionId/player/ready', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const session = gameService.setPlayerReady(sessionId, playerId);
    res.json(session);
  } catch (error) {
    console.error('Error setting player ready:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 提交答案
router.post('/session/:sessionId/answer', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { playerId, answerCode, questionId } = req.body;

    if (!playerId || !answerCode || !questionId) {
      return res.status(400).json({ error: 'Player ID, answer code, and question ID are required' });
    }

    // 获取题目信息
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = gameService.answerQuestion(sessionId, playerId, answerCode, question);
    res.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取适合的题目
router.get('/question/:rank', async (req: Request, res: Response) => {
  try {
    const { rank } = req.params;
    const question = await gameService.getQuestionForRank(rank);

    if (!question) {
      return res.status(404).json({ error: 'No question found for this rank' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取所有会话
router.get('/sessions', (req: Request, res: Response) => {
  try {
    const sessions = gameService.getAllSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;