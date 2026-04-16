# C++ 算法大战

一个在线C++算法竞赛游戏，通过回答算法题来击败怪物，提升段位。

## 🎮 功能特性

- 🎮 **单人游戏模式**：按段位系统逐步挑战怪物
- 👥 **多人实时竞技**：创建房间，与朋友一起对战
- 🏆 **段位系统**：D→D+→C→C+→B→B+→A→A+→青铜S→黄金S→钻石S→魔王S
- 👹 **怪物战斗系统**：每个段位对应独特怪物
- 💻 **算法题库**：50+道精选C++算法题，无时间限制
- 📊 **实时排行榜**：查看玩家排名
- 🏅 **成就系统**：记录你的成长历程
- 🎯 **代码编辑器**：内置Monaco Editor，支持语法高亮
- ⚡ **实时同步**：WebSocket实现多人游戏实时同步

## 快速开始

### 📋 环境要求

- Node.js 18+
- npm 9+
- 现代浏览器（Chrome, Firefox, Safari, Edge）

### 🚀 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或者分别安装
npm run install:frontend
npm run install:backend
```

### ⚡ 开发模式

```bash
# 同时启动前后端开发服务器
npm run dev

# 或分别启动
npm run dev:frontend  # 前端: http://localhost:3000
npm run dev:backend   # 后端: http://localhost:3001
```

### 🗄️ 初始化数据库

```bash
npm run seed:database
```

### 🏗️ 构建项目

```bash
# 构建所有
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

## 🛠️ 技术栈

### 前端
- React 19 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Socket.IO Client（实时通信）
- Monaco Editor（代码编辑器）
- Zustand（状态管理）
- React Router（路由）

### 后端
- Node.js + Express
- TypeScript
- Socket.IO（WebSocket）
- SQLite（数据库）
- 自定义服务层架构

### 开发工具
- ESLint（代码检查）
- Prettier（代码格式化）
- Nodemon（开发服务器热重载）
- Concurrently（多进程管理）

## 📁 项目结构

```
game/
├── frontend/                    # React前端应用
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── Game/          # 游戏相关组件
│   │   │   │   ├── MonsterBattle.tsx
│   │   │   │   ├── QuestionCard.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   └── PlayerStats.tsx
│   │   │   └── UI/           # 通用UI组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomePage.tsx
│   │   │   ├── GamePage.tsx
│   │   │   ├── LobbyPage.tsx
│   │   │   └── LeaderboardPage.tsx
│   │   ├── hooks/            # 自定义hooks
│   │   │   ├── useGame.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useAuth.ts
│   │   ├── types/            # TypeScript类型定义
│   │   ├── utils/            # 工具函数
│   │   ├── App.tsx           # 根组件
│   │   └── main.tsx          # 应用入口
│   ├── public/               # 静态资源
│   └── package.json
├── backend/                   # Node.js后端
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── services/         # 业务逻辑
│   │   │   ├── GameService.ts
│   │   │   ├── RoomService.ts
│   │   │   ├── QuestionService.ts
│   │   │   └── UserService.ts
│   │   ├── models/           # 数据模型
│   │   │   ├── GameSession.ts
│   │   │   ├── Question.ts
│   │   │   ├── Monster.ts
│   │   │   └── User.ts
│   │   ├── routes/           # API路由
│   │   ├── sockets/          # Socket.IO处理
│   │   ├── database/         # 数据库相关
│   │   │   ├── init.ts
│   │   │   └── seed.ts
│   │   ├── utils/            # 工具函数
│   │   ├── index.ts          # 应用入口
│   │   └── server.ts
│   ├── data/                 # 数据库文件
│   └── package.json
├── docs/                     # 文档
│   ├── game-design.md        # 设计文档
│   └── api-docs.md          # API文档
├── GETTING_STARTED.md        # 快速开始指南
├── CONTRIBUTING.md           # 贡献指南
├── package.json             # 根目录配置
└── README.md                # 项目说明
```

## API文档

详见 `docs/api-docs.md`

## 🚀 部署

### 前端部署
```bash
# 构建前端
npm run build:frontend

# 部署到Vercel（推荐）
vercel deploy

# 或部署到其他平台
# 将 frontend/dist 目录部署到静态文件服务器
```

### 后端部署
```bash
# 构建后端
npm run build:backend

# 部署到Railway（推荐）
railway deploy

# 或使用其他Node.js托管服务
# 启动命令: node backend/dist/index.js
```

## 📚 文档

- [快速开始指南](./GETTING_STARTED.md) - 详细的安装和运行说明
- [贡献指南](./CONTRIBUTING.md) - 如何参与项目开发
- [设计文档](./docs/game-design.md) - 详细的技术设计
- [API文档](./docs/api-docs.md) - API接口说明

## 🔧 故障排除

### 常见问题

**Q: 前端无法连接到后端**
A: 检查后端是否正常运行，防火墙是否阻止了3001端口

**Q: 数据库初始化失败**
A: 确保backend/data目录有写权限，删除现有数据库文件后重新运行种子脚本

**Q: Socket.IO连接失败**
A: 检查CORS配置，确保前端URL在后端允许的源列表中

详细问题解决请查看 [GETTING_STARTED.md](./GETTING_STARTED.md) 的故障排除部分

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详细的贡献指南请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👤 制作人信息

**制作人**: 16nights
**联系邮箱**: yanyuze061121@icloud.com

## 📮 联系方式

- 项目地址：https://github.com/your-username/cpp-battle-game
- 问题反馈：[GitHub Issues](https://github.com/your-username/cpp-battle-game/issues)
- 技术讨论：[GitHub Discussions](https://github.com/your-username/cpp-battle-game/discussions)
- 邮件支持：yanyuze061121@icloud.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个Star！

---

**开始你的算法之旅吧！🎮**