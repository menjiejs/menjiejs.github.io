import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';

const router = Router();
const userService = new UserService();

// 创建用户
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // 检查用户名是否已存在
    const exists = await userService.usernameExists(username);
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await userService.createUser(username, email);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 通过用户名获取用户
router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 通过ID获取用户
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新用户信息
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await userService.updateUser(id, updates);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取用户档案
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await userService.getUserProfile(id);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新游戏统计
router.post('/:id/game-stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { won, scoreGained } = req.body;

    if (typeof won !== 'boolean') {
      return res.status(400).json({ error: 'Won must be a boolean' });
    }

    const user = await userService.updateGameStats(id, won, scoreGained || 0);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating game stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取排行榜
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = '10', rank } = req.query;
    const limitNum = parseInt(limit as string);
    const leaderboard = await userService.getLeaderboard(limitNum, rank as string);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取段位分布
router.get('/stats/rank-distribution', async (req: Request, res: Response) => {
  try {
    const distribution = await userService.getRankDistribution();
    res.json(distribution);
  } catch (error) {
    console.error('Error getting rank distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取总用户数
router.get('/stats/total-users', async (req: Request, res: Response) => {
  try {
    const total = await userService.getTotalUsers();
    res.json({ total });
  } catch (error) {
    console.error('Error getting total users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 检查用户名是否存在
router.get('/username-exists/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const exists = await userService.usernameExists(username);
    res.json({ exists });
  } catch (error) {
    console.error('Error checking username existence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;