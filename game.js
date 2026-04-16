#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎮 C++ 算法大战游戏');
console.log('👤 制作人: 16nights');
console.log('📧 联系邮箱: yanyuze061121@icloud.com');
console.log('');
console.log('正在启动游戏...\n');

// 启动后端
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

backend.on('error', (error) => {
  console.error('❌ 后端启动失败:', error);
});

backend.on('close', (code) => {
  console.log(`\n🔴 后端进程退出，代码: ${code}`);
});

// 等待后端启动
setTimeout(() => {
  console.log('✅ 后端服务已启动');
  console.log('📡 后端地址: http://localhost:3001');
  console.log('🔗 健康检查: http://localhost:3001/health\n');

  console.log('请手动在另一个终端运行以下命令启动前端:');
  console.log('cd frontend && npm run dev');
  console.log('🌐 前端地址: http://localhost:3000\n');

  console.log('🎯 游戏使用说明:');
  console.log('1. 打开 http://localhost:3000');
  console.log('2. 输入玩家名称');
  console.log('3. 选择游戏模式');
  console.log('4. 开始游戏！\n');
}, 3000);