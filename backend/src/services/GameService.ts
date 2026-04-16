import { GameSession, Player, CreateSessionData, GameState, AnswerResult } from '../models/GameSession';
import { Question } from '../models/Question';
import { getMonsterByRank, MonsterInstance } from '../models/Monster';
import { getDB } from '../database/init';
import { v4 as uuidv4 } from 'uuid';

export class GameService {
  private sessions: Map<string, GameSession> = new Map();

  // 创建游戏会话
  createSession(data: CreateSessionData): GameSession {
    const session: GameSession = {
      id: uuidv4(),
      roomId: data.roomId,
      roomName: data.roomName,
      maxPlayers: data.maxPlayers || 4,
      currentPlayers: 0,
      players: [],
      monster: {
        id: '',
        name: '',
        rank: 'D',
        maxHealth: 30,
        currentHealth: 30
      },
      gameMode: data.gameMode,
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 根据初始段位设置怪物
    const monster = getMonsterByRank('D');
    session.monster = {
      ...monster,
      currentHealth: monster.maxHealth,
      id: monster.id
    };

    this.sessions.set(session.id, session);
    return session;
  }

  // 添加玩家到会话
  addPlayer(sessionId: string, player: Omit<Player, 'health' | 'maxHealth'>): GameSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 检查玩家是否已存在
    const existingPlayer = session.players.find(p => p.id === player.id);
    if (existingPlayer) {
      throw new Error('Player already exists in session');
    }

    // 检查玩家数量限制
    if (session.players.length >= session.maxPlayers) {
      throw new Error('Session is full');
    }

    // 计算玩家血量（基础100 + 段位加成）
    const baseHealth = 100;
    const rankMultiplier = this.getRankMultiplier(player.rank);
    const maxHealth = baseHealth + (rankMultiplier * 20);

    const newPlayer: Player = {
      ...player,
      health: maxHealth,
      maxHealth
    };

    session.players.push(newPlayer);
    session.currentPlayers = session.players.length;
    session.updatedAt = new Date();

    this.sessions.set(sessionId, session);
    return session;
  }

  // 玩家准备状态切换
  setPlayerReady(sessionId: string, playerId: string): GameSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    player.isReady = !player.isReady;
    session.updatedAt = new Date();

    this.sessions.set(sessionId, session);

    // 检查是否所有玩家都准备好了
    const allReady = session.players.every(p => p.isReady) && session.players.length > 0;
    if (allReady && session.status === 'waiting') {
      session.status = 'playing';
    }

    return session;
  }

  // 提交答案
  answerQuestion(
    sessionId: string,
    playerId: string,
    answerCode: string,
    question: Question
  ): AnswerResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // 这里应该添加实际的代码验证逻辑
    // 现在简化为随机决定是否正确（演示用）
    const isCorrect = Math.random() > 0.3; // 70%正确率

    const attackPower = this.calculatePlayerAttack(player.rank);

    if (isCorrect) {
      // 答对，怪物扣血
      session.monster.currentHealth -= attackPower;
      player.correctAnswers++;
      player.score += 100;

      if (session.monster.currentHealth <= 0) {
        // 怪物死亡，玩家获胜
        session.status = 'finished';
        session.endTime = new Date();

        return {
          isCorrect,
          gameFinished: true,
          winner: 'player',
          message: '恭喜！你击败了怪物！',
          damage: attackPower,
          healthChange: 0
        };
      }
    } else {
      // 答错，怪物回血并攻击玩家
      const healAmount = Math.floor(session.monster.maxHealth * 0.1);
      session.monster.currentHealth = Math.min(
        session.monster.currentHealth + healAmount,
        session.monster.maxHealth
      );

      const damage = 10;
      player.health -= damage;
      player.incorrectAnswers++;

      if (player.health <= 0) {
        // 玩家死亡
        session.status = 'finished';
        session.endTime = new Date();

        return {
          isCorrect,
          gameFinished: true,
          winner: 'monster',
          message: '很遗憾，你被怪物击败了！',
          damage: 0,
          healthChange: -damage
        };
      }
    }

    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return {
      isCorrect,
      gameFinished: false,
      message: isCorrect ? `攻击命中！造成 ${attackPower} 点伤害` : `被反击！受到 ${10} 点伤害`,
      damage: isCorrect ? attackPower : 0,
      healthChange: isCorrect ? 0 : -10
    };
  }

  // 获取游戏状态
  getGameState(sessionId: string): GameState | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      session
    };
  }

  // 获取所有会话
  getAllSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  // 移除会话
  removeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // 获取段位对应的乘数
  private getRankMultiplier(rank: string): number {
    const rankOrder = ['D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', '青铜S', '黄金S', '钻石S', '魔王S'];
    return rankOrder.indexOf(rank);
  }

  // 计算玩家攻击力
  private calculatePlayerAttack(rank: string): number {
    const baseAttack = 20;
    const rankMultiplier = this.getRankMultiplier(rank);
    return baseAttack + (rankMultiplier * 5);
  }

  // 从数据库加载题目（待实现）
  async getQuestionById(id: string): Promise<Question | null> {
    const db = getDB();
    try {
      const row = await db.get('SELECT * FROM questions WHERE id = ?', [id]);
      if (!row) return null;

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
    } catch (error) {
      console.error('Error loading question:', error);
      return null;
    }
  }

  // 获取适合玩家段位的题目
  async getQuestionForRank(rank: string): Promise<Question | null> {
    const db = getDB();
    try {
      // 根据段位获取难度
      const difficulty = this.getDifficultyForRank(rank);

      const row = await db.get(
        'SELECT * FROM questions WHERE difficulty = ? ORDER BY RANDOM() LIMIT 1',
        [difficulty]
      );

      if (!row) return null;

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
    } catch (error) {
      console.error('Error loading question for rank:', error);
      return null;
    }
  }

  // 根据段位获取难度
  private getDifficultyForRank(rank: string): string {
    const rankDifficultyMap: Record<string, string> = {
      'D': 'D',
      'D+': 'D+',
      'C': 'C',
      'C+': 'C+',
      'B': 'B',
      'B+': 'B+',
      'A': 'A',
      'A+': 'A+',
      '青铜S': 'S',
      '黄金S': 'S',
      '钻石S': 'S',
      '魔王S': 'S'
    };

    return rankDifficultyMap[rank] || 'D';
  }
}