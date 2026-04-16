import { getDB } from '../database/init';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  email?: string;
  rank: string;
  score: number;
  totalGames: number;
  wins: number;
  losses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  rank: string;
  score: number;
  winRate: number;
  totalGames: number;
  wins: number;
  losses: number;
  rankProgress: number;
  lastActiveAt: Date;
}

export class UserService {
  // 创建用户
  async createUser(username: string, email?: string): Promise<User> {
    const db = getDB();
    try {
      const id = uuidv4();
      const now = new Date();

      await db.run(
        `INSERT INTO users (id, username, email, rank, score, total_games, wins, losses, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, username, email, 'D', 0, 0, 0, 0, now.toISOString(), now.toISOString()]
      );

      return {
        id,
        username,
        email,
        rank: 'D',
        score: 0,
        totalGames: 0,
        wins: 0,
        losses: 0,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // 通过用户名查找用户
  async getUserByUsername(username: string): Promise<User | null> {
    const db = getDB();
    try {
      const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
      return row ? this.mapRowToUser(row) : null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  // 通过ID查找用户
  async getUserById(id: string): Promise<User | null> {
    const db = getDB();
    try {
      const row = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      return row ? this.mapRowToUser(row) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // 更新用户信息
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const db = getDB();
    try {
      const existing = await this.getUserById(id);
      if (!existing) {
        return null;
      }

      const updateData = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      await db.run(
        `UPDATE users SET
          username = ?, email = ?, rank = ?, score = ?, total_games = ?,
          wins = ?, losses = ?, updated_at = ?
        WHERE id = ?`,
        [
          updateData.username,
          updateData.email,
          updateData.rank,
          updateData.score,
          updateData.totalGames,
          updateData.wins,
          updateData.losses,
          updateData.updatedAt.toISOString(),
          id
        ]
      );

      return updateData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // 获取用户档案（包含额外统计信息）
  async getUserProfile(id: string): Promise<UserProfile | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }

    // 计算胜率
    const winRate = user.totalGames > 0 ? (user.wins / user.totalGames) * 100 : 0;

    // 计算段位进度（简化版）
    const rankProgress = this.calculateRankProgress(user.rank);

    // 获取最后活跃时间
    const lastActive = new Date();

    return {
      id: user.id,
      username: user.username,
      rank: user.rank,
      score: user.score,
      winRate,
      totalGames: user.totalGames,
      wins: user.wins,
      losses: user.losses,
      rankProgress,
      lastActiveAt: lastActive
    };
  }

  // 更新用户游戏统计
  async updateGameStats(id: string, won: boolean, scoreGained: number = 0): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }

    const updates = {
      totalGames: user.totalGames + 1,
      wins: won ? user.wins + 1 : user.wins,
      losses: won ? user.losses : user.losses + 1,
      score: user.score + scoreGained
    };

    // 根据胜负更新段位
    let newRank = user.rank;
    if (won) {
      newRank = this.calculateNewRank(user.rank, true);
    } else {
      newRank = this.calculateNewRank(user.rank, false);
    }

    updates.rank = newRank;

    return this.updateUser(id, updates);
  }

  // 获取排行榜
  async getLeaderboard(limit: number = 10, rank?: string): Promise<UserProfile[]> {
    const db = getDB();
    try {
      let query = 'SELECT * FROM users';
      let params: any[] = [];

      if (rank) {
        query += ' WHERE rank = ?';
        params.push(rank);
      }

      query += ' ORDER BY score DESC, total_games DESC, wins DESC LIMIT ?';
      params.push(limit);

      const rows = await db.all(query, params);
      return rows.map(row => this.mapRowToUserProfile(row));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // 获取所有段位的用户数量统计
  async getRankDistribution(): Promise<Record<string, number>> {
    const db = getDB();
    try {
      const rows = await db.all('SELECT rank, COUNT(*) as count FROM users GROUP BY rank');
      const distribution: Record<string, number> = {};

      rows.forEach(row => {
        distribution[row.rank] = row.count;
      });

      return distribution;
    } catch (error) {
      console.error('Error getting rank distribution:', error);
      return {};
    }
  }

  // 检查用户名是否已存在
  async usernameExists(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return user !== null;
  }

  // 获取总用户数
  async getTotalUsers(): Promise<number> {
    const db = getDB();
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM users');
      return result.count;
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0;
    }
  }

  // 辅助方法：将数据库行映射为User对象
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      rank: row.rank,
      score: row.score,
      totalGames: row.total_games,
      wins: row.wins,
      losses: row.losses,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // 辅助方法：将数据库行映射为UserProfile对象
  private mapRowToUserProfile(row: any): UserProfile {
    const totalGames = row.total_games;
    const winRate = totalGames > 0 ? (row.wins / totalGames) * 100 : 0;
    const rankProgress = this.calculateRankProgress(row.rank);

    return {
      id: row.id,
      username: row.username,
      rank: row.rank,
      score: row.score,
      winRate,
      totalGames,
      wins: row.wins,
      losses: row.losses,
      rankProgress,
      lastActiveAt: new Date(row.updated_at)
    };
  }

  // 计算新段位
  private calculateNewRank(currentRank: string, won: boolean): string {
    const rankOrder = ['D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', '青铜S', '黄金S', '钻石S', '魔王S'];
    const currentIndex = rankOrder.indexOf(currentRank);

    if (won) {
      // 胜利：提升段位
      if (currentIndex < rankOrder.length - 1) {
        // 对于S级，每胜一次提升一个星级
        if (currentRank.includes('S')) {
          const ranks = currentRank.split('S');
          const starLevel = ranks.length > 1 ? parseInt(ranks[1]) : 0;
          if (starLevel < 2) { // 最多魔王S+2
            return `${ranks[0]}S${starLevel + 1}`;
          }
        } else {
          return rankOrder[currentIndex + 1];
        }
      }
    } else {
      // 失败：降低段位
      if (currentIndex > 0) {
        // 对于S级，降低到普通段位
        if (currentRank.includes('S')) {
          return rankOrder[currentIndex - 1];
        } else {
          return rankOrder[currentIndex - 1];
        }
      }
    }

    return currentRank;
  }

  // 计算段位进度
  private calculateRankProgress(rank: string): number {
    const rankOrder = ['D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', '青铜S', '黄金S', '钻石S', '魔王S'];
    const index = rankOrder.indexOf(rank);

    if (index === -1) return 0;

    // 普通段位进度50%，S级根据星级
    if (rank.includes('S')) {
      const ranks = rank.split('S');
      const starLevel = ranks.length > 1 ? parseInt(ranks[1]) : 0;
      return ((index - 8) * 100 + starLevel * 33) / 4; // 简化的进度计算
    }

    return (index + 0.5) / rankOrder.length * 100;
  }
}