import { Router, Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import { GameService } from '../services/GameService';

const router = Router();
const gameService = new GameService();
const roomService = new RoomService(gameService);

// 创建房间
router.post('/create', (req: Request, res: Response) => {
  try {
    const { roomName, maxPlayers, gameMode } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const roomId = roomService.createRoom(
      roomName,
      maxPlayers || 4,
      gameMode || 'solo'
    );

    res.status(201).json({ roomId, roomName });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 加入房间
router.post('/:roomId/join', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { playerId, playerName, rank = 'D' } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({ error: 'Player ID and name are required' });
    }

    const session = await roomService.joinRoom(roomId, {
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
    console.error('Error joining room:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('full')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取房间信息
router.get('/:roomId', (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const roomInfo = roomService.getRoomInfo(roomId);

    if (!roomInfo) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(roomInfo);
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取所有公开房间
router.get('/list', (req: Request, res: Response) => {
  try {
    const rooms = roomService.getAllRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error getting room list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 玩家准备
router.post('/:roomId/player/ready', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const session = await roomService.playerReady(roomId, playerId);
    res.json(session);
  } catch (error) {
    console.error('Error setting player ready:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 玩家离开房间
router.post('/:roomId/leave', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const success = await roomService.leaveRoom(roomId, playerId);
    res.json({ success });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除房间
router.delete('/:roomId', (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const success = roomService.deleteRoom(roomId);
    res.json({ success });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 检查房间是否存在
router.get('/:roomId/exists', (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const exists = roomService.roomExists(roomId);
    res.json({ exists });
  } catch (error) {
    console.error('Error checking room existence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取房间列表按游戏模式
router.get('/list/by-mode/:gameMode', (req: Request, res: Response) => {
  try {
    const { gameMode } = req.params;
    const rooms = roomService.getRoomsByGameMode(gameMode as any);
    res.json(rooms);
  } catch (error) {
    console.error('Error getting rooms by mode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;