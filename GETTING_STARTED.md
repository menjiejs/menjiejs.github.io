# C++ 算法大战 - 快速开始指南

## 项目概述

这是一个在线C++算法竞赛游戏，玩家通过回答算法题来击败怪物，提升段位，与其他玩家进行实时竞技。

## 系统要求

- Node.js 18+ 或更高版本
- npm 9+ 或更高版本
- 现代浏览器（Chrome, Firefox, Safari, Edge）

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/your-username/cpp-battle-game.git
cd cpp-battle-game
```

### 2. 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或者分别安装
npm run install:frontend
npm run install:backend
```

### 3. 配置环境变量

```bash
# 复制环境变量示例文件
cd backend
cp .env.example .env

# 编辑.env文件（可选，使用默认配置即可）
```

### 4. 初始化数据库

```bash
# 运行数据库种子脚本
npm run seed:database
```

## 运行项目

### 开发模式（推荐）

```bash
# 同时启动前后端服务
npm run dev
```

这将启动：
- 前端开发服务器：http://localhost:3000
- 后端API服务器：http://localhost:3001

### 分别启动

```bash
# 终端1：启动后端
npm run dev:backend

# 终端2：启动前端
npm run dev:frontend
```

### 使用启动脚本

```bash
# 使用node运行启动脚本
node game.js
```

## 访问应用

1. 打开浏览器访问 http://localhost:3000
2. 输入玩家名称
3. 选择游戏模式（单人/多人）
4. 开始游戏！

## 游戏模式

### 单人模式
- 选择单人模式直接开始游戏
- 按段位系统逐步挑战怪物
- 答对题目使怪物扣血，提升段位
- 答错题目怪物回血并攻击你

### 多人模式
- 选择多人模式创建或加入房间
- 邀请朋友通过房间码加入
- 实时比较进度和分数
- 支持团队竞技模式

## 段位系统

```
D → D+ → C → C+ → B → B+ → A → A+ → 青铜S → 黄金S → 钻石S → 魔王S
```

- 每个段位对应不同的怪物
- 胜利提升段位，失败降低段位
- 连续胜利有额外奖励

## 技术架构

### 前端
- React 19 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Socket.IO Client（实时通信）
- Monaco Editor（代码编辑器）
- Zustand（状态管理）

### 后端
- Node.js + Express
- TypeScript
- Socket.IO（WebSocket）
- SQLite（数据库）
- 自定义游戏服务层

## API端点

### 游戏相关
- `POST /api/game/session` - 创建游戏会话
- `GET /api/game/state/:sessionId` - 获取游戏状态
- `POST /api/game/session/:sessionId/player` - 添加玩家
- `POST /api/game/session/:sessionId/answer` - 提交答案

### 房间相关
- `POST /api/room/create` - 创建房间
- `POST /api/room/:roomId/join` - 加入房间
- `GET /api/room/:roomId` - 获取房间信息
- `GET /api/room/list` - 获取房间列表

### 用户相关
- `POST /api/user/create` - 创建用户
- `GET /api/user/:id` - 获取用户信息
- `GET /api/user/leaderboard` - 获取排行榜

## Socket.IO事件

### 客户端发送
- `joinRoom` - 加入游戏房间
- `playerReady` - 玩家准备
- `submitAnswer` - 提交答案
- `leaveRoom` - 离开房间

### 服务器发送
- `roomInfo` - 房间信息更新
- `playerJoined` - 玩家加入通知
- `playerLeft` - 玩家离开通知
- `gameState` - 游戏状态更新
- `answerResult` - 答题结果

## 开发工具

### 代码检查
```bash
# 运行代码检查
npm run lint

# 自动修复
npm run lint:frontend
npm run lint:backend
```

### 构建生产版本
```bash
# 构建所有
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

## 故障排除

### 端口被占用
如果3000或3001端口被占用，可以修改端口：
- 前端：修改 `frontend/vite.config.ts` 中的 `port`
- 后端：修改 `backend/.env` 中的 `PORT`

### 数据库问题
如果数据库初始化失败：
```bash
# 删除现有数据库
rm -rf backend/data/database.sqlite

# 重新初始化
npm run seed:database
```

### 依赖问题
如果遇到依赖安装问题：
```bash
# 清理缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

## 性能优化建议

1. **前端优化**
   - 使用代码分割减少初始加载时间
   - 启用图片懒加载
   - 使用CDN加速静态资源

2. **后端优化**
   - 启用Redis缓存游戏会话
   - 使用连接池管理数据库连接
   - 实现API限流

## 安全建议

1. 生产环境必须：
   - 使用HTTPS
   - 启用CORS白名单
   - 实现输入验证
   - 使用环境变量存储敏感信息

2. 代码执行安全：
   - 使用Docker容器隔离执行环境
   - 限制执行时间和内存
   - 禁止网络访问和文件系统操作

## 下一步

- 查看 [README.md](./README.md) 了解项目概览
- 查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南
- 查看 [docs/game-design.md](./docs/game-design.md) 了解详细设计
- 查看 [docs/api-docs.md](./docs/api-docs.md) 了解API文档

## 获取帮助

- 问题反馈：[GitHub Issues](https://github.com/your-username/cpp-battle-game/issues)
- 技术讨论：[GitHub Discussions](https://github.com/your-username/cpp-battle-game/discussions)
- 邮件支持：yanyuze061121@icloud.com

## 👤 制作人信息

**制作人**: 16nights
**联系邮箱**: yanyuze061121@icloud.com

---

**祝游戏愉快！🎮**