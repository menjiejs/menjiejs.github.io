# 贡献指南

欢迎为 C++ 算法大战项目做出贡献！

## 开发环境设置

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
npm run install:frontend
npm run install:backend
```

### 开发模式
```bash
# 同时启动前后端（推荐）
npm run dev

# 或者分别启动
npm run dev:frontend  # 前端: http://localhost:3000
npm run dev:backend   # 后端: http://localhost:3001
```

## 项目结构

```
game/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/  # 组件
│   │   │   ├── Game/    # 游戏相关组件
│   │   │   └── UI/     # 通用UI组件
│   │   ├── pages/       # 页面组件
│   │   ├── hooks/       # 自定义hooks
│   │   ├── types/       # TypeScript类型定义
│   │   └── utils/       # 工具函数
│   └── public/
├── backend/           # Node.js后端
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── services/    # 业务逻辑
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── sockets/     # Socket.IO处理
│   │   └── database/    # 数据库相关
│   └── data/           # 数据库文件
└── docs/              # 文档
```

## 开发规范

### 代码风格
- 使用 TypeScript 强类型
- 遵循 ESLint 规则
- 组件使用函数式组件和 Hooks
- 文件命名使用 kebab-case

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 重构
test: 测试相关
chore: 构建或工具变动
```

示例：
```
feat: 添加排行榜页面功能
fix: 修复玩家加入房间时的重复渲染问题
docs: 更新README和API文档
```

## 开发流程

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'feat: Add AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 功能开发指南

### 添加新的游戏模式
1. 在 `src/models/GameSession.ts` 中定义新的游戏模式类型
2. 在后端 `services/GameService.ts` 中实现相应逻辑
3. 在前端 `src/components/Game/` 中添加相关组件

### 添加新的题目
1. 在数据库中添加题目（或使用 `QuestionService`）
2. 在后端实现题目验证逻辑
3. 在前端添加题目显示组件

### 添加新的段位
1. 在 `src/models/Monster.ts` 中添加新段位和怪物
2. 更新段位计算逻辑
3. 添加对应的UI样式

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 分别运行前后端测试
npm run test:frontend
npm run test:backend
```

### 编写测试
- 新增功能需要包含相应的测试
- 测试文件放在 `__tests__` 目录下
- 使用 Jest 测试框架

## 部署

### 生产环境构建
```bash
# 构建所有
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

### 环境变量
复制 `.env.example` 到 `.env` 并配置相应值。

## 常见问题

### Q: 如何添加新的 Socket.IO 事件？
A: 
1. 在前端 `src/types/socket.ts` 中定义事件类型
2. 在后端 `src/sockets/gameSocket.ts` 中实现事件处理
3. 在前端组件中使用 `useSocket` hook 调用

### Q: 如何扩展数据库模型？
A:
1. 在相应的 `models/*.ts` 文件中定义接口
2. 在 `services/*.ts` 中实现相关逻辑
3. 更新数据库迁移文件

### Q: 如何添加新的 UI 组件？
A:
1. 在 `src/components/` 相应目录下创建组件
2. 使用 Tailwind CSS 进行样式设计
3. 导出并在页面中使用

## 联系方式

- 项目地址：https://github.com/your-username/cpp-battle-game
- 问题反馈：Issues
- 开发讨论：Discussions

感谢你的贡献！🎮