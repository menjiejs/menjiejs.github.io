import { GameSession, Player, CreateSessionData } from '../models/GameSession';
import { GameService } from './GameService';
import { v4 as uuidv4 } from 'uuid';

export interface RoomInfo {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  gameMode: 'solo' | 'team' | 'competitive';
  players: Array<{
    id: string;
    name: string;
    rank: string;
    isReady: boolean;
  }>;
}

export class RoomService {
  private gameService: GameService;
  private roomMap: Map<string, string> = new Map(); // roomId -> sessionId

  constructor(gameService: GameService) {
    this.gameService = gameService;
  }

  // 创建房间
  createRoom(roomName: string, maxPlayers: number = 4, gameMode: 'solo' | 'team' | 'competitive' = 'solo'): string {
    const roomId = this.generateRoomId();
    const sessionId = uuidv4();

    const sessionData: CreateSessionData = {
      roomId,
      roomName,
      maxPlayers,
      gameMode
    };

    this.gameService.createSession(sessionData);
    this.roomMap.set(roomId, sessionId);

    return roomId;
  }

  // 加入房间
  async joinRoom(roomId: string, player: Omit<Player, 'health' | 'maxHealth'>): Promise<GameSession> {
    const sessionId = this.roomMap.get(roomId);
    if (!sessionId) {
      throw new Error('Room not found');
    }

    // 检查房间是否已满
    const session = this.gameService.getGameState(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.session.players.length >= session.session.maxPlayers) {
      throw new Error('Room is full');
    }

    // 添加玩家
    return this.gameService.addPlayer(sessionId, player);
  }

  // 获取房间信息
  getRoomInfo(roomId: string): RoomInfo | null {
    const sessionId = this.roomMap.get(roomId);
    if (!sessionId) {
      return null;
    }

    const gameState = this.gameService.getGameState(sessionId);
    if (!gameState) {
      return null;
    }

    const session = gameState.session;

    return {
      roomId: session.roomId,
      roomName: session.roomName,
      maxPlayers: session.maxPlayers,
      currentPlayers: session.currentPlayers,
      status: session.status,
      gameMode: session.gameMode,
      players: session.players.map(player => ({
        id: player.id,
        name: player.name,
        rank: player.rank,
        isReady: player.isReady
      }))
    };
  }

  // 获取所有公开房间
  getAllRooms(): RoomInfo[] {
    const rooms: RoomInfo[] = [];

    this.roomMap.forEach((sessionId, roomId) => {
      const roomInfo = this.getRoomInfo(roomId);
      if (roomInfo && roomInfo.status === 'waiting') {
        rooms.push(roomInfo);
      }
    });

    return rooms;
  }

  // 玩家准备
  async playerReady(roomId: string, playerId: string): Promise<GameSession> {
    const sessionId = this.roomMap.get(roomId);
    if (!sessionId) {
      throw new Error('Room not found');
    }

    return this.gameService.setPlayerReady(sessionId, playerId);
  }

  // 玩家离开房间
  async leaveRoom(roomId: string, playerId: string): Promise<boolean> {
    const sessionId = this.roomMap.get(roomId);
    if (!sessionId) {
      return false;
    }

    const gameState = this.gameService.getGameState(sessionId);
    if (!gameState) {
      return false;
    }

    // 移除玩家
    const session = gameState.session;
    session.players = session.players.filter(p => p.id !== playerId);
    session.currentPlayers = session.players.length;

    // 如果房间空了，删除房间
    if (session.players.length === 0) {
      this.gameService.removeSession(sessionId);
      this.roomMap.delete(roomId);
      return true;
    }

    // 如果所有玩家都离开了，删除房间
    if (session.status === 'waiting' && session.players.length === 0) {
      this.gameService.removeSession(sessionId);
      this.roomMap.delete(roomId);
      return true;
    }

    return true;
  }

  // 删除房间
  deleteRoom(roomId: string): boolean {
    const sessionId = this.roomMap.get(roomId);
    if (sessionId) {
      this.gameService.removeSession(sessionId);
      this.roomMap.delete(roomId);
      return true;
    }
    return false;
  }

  // 检查房间是否存在
  roomExists(roomId: string): boolean {
    return this.roomMap.has(roomId);
  }

  // 获取房间的完整游戏状态
  getGameState(roomId: string): any {
    const sessionId = this.roomMap.get(roomId);
    if (!sessionId) {
      return null;
    }

    return this.gameService.getGameState(sessionId);
  }

  // 生成房间ID
  private generateRoomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // 获取特定房间类型的房间列表
  getRoomsByGameMode(gameMode: 'solo' | 'team' | 'competitive'): RoomInfo[] {
    const allRooms = this.getAllRooms();
    return allRooms.filter(room => room.gameMode === gameMode);
  }

  // 获取玩家所在的房间
  getPlayerRooms(playerId: string): RoomInfo[] {
    const playerRooms: RoomInfo[] = [];

    this.roomMap.forEach((sessionId, roomId) => {
      const roomInfo = this.getRoomInfo(roomId);
      if (roomInfo && roomInfo.players.some(p => p.id === playerId)) {
        playerRooms.push(roomInfo);
      }
    });

    return playerRooms;
  }
}