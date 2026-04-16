import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';

let db: Database;

export const initializeDatabase = async () => {
  // 确保数据目录存在
  const dataDir = path.join(__dirname, '../../../data');
  const fs = require('fs');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // 启用外键约束
  await db.exec('PRAGMA foreign_keys = ON');

  // 创建表结构
  await createTables();

  // 插入初始数据
  await insertInitialData();

  console.log('Database initialized successfully');
  return db;
};

const createTables = async () => {
  // 创建题目表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      input_format TEXT NOT NULL,
      output_format TEXT NOT NULL,
      hints TEXT,
      template_code TEXT NOT NULL,
      test_cases TEXT NOT NULL,
      memory_limit INTEGER DEFAULT 256,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 创建怪物表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS monsters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rank TEXT NOT NULL,
      max_health INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 创建用户表（简化版本，后续可扩展）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      rank TEXT DEFAULT 'D',
      score INTEGER DEFAULT 0,
      total_games INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 创建游戏会话表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      room_name TEXT NOT NULL,
      max_players INTEGER DEFAULT 4,
      game_mode TEXT DEFAULT 'solo',
      status TEXT DEFAULT 'waiting',
      current_question_id TEXT,
      monster_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_question_id) REFERENCES questions(id),
      FOREIGN KEY (monster_id) REFERENCES monsters(id)
    );
  `);

  // 创建玩家会话表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS session_players (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      player_name TEXT NOT NULL,
      health INTEGER DEFAULT 100,
      max_health INTEGER DEFAULT 100,
      score INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      incorrect_answers INTEGER DEFAULT 0,
      is_ready BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES game_sessions(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(session_id, user_id)
    );
  `);

  // 创建答案记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS answer_records (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_code TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      time_spent INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES game_sessions(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);
};

const insertInitialData = async () => {
  // 插入基础怪物数据
  const monsters = [
    {
      id: 'slime_d',
      name: '史莱姆',
      rank: 'D',
      max_health: 30,
      image: '/monsters/slime.png',
      description: '最弱小的怪物，只能慢慢蠕动'
    },
    {
      id: 'goblin_c',
      name: '哥布林',
      rank: 'C',
      max_health: 50,
      image: '/monsters/goblin.png',
      description: '狡猾的小怪物，经常偷袭'
    },
    {
      id: 'orc_b',
      name: '兽人',
      rank: 'B',
      max_health: 80,
      image: '/monsters/orc.png',
      description: '强壮的战士，手持木棒'
    },
    {
      id: 'shadow_a',
      name: '暗影战士',
      rank: 'A',
      max_health: 120,
      image: '/monsters/shadow.png',
      description: '来自黑暗的战士，速度极快'
    },
    {
      id: 'lava_giant_s',
      name: '熔岩巨人',
      rank: '青铜S',
      max_health: 150,
      image: '/monsters/lava-giant.png',
      description: '体内流淌着熔岩的巨人'
    },
    {
      id: 'thunder_dragon_s',
      name: '雷霆龙',
      rank: '黄金S',
      max_health: 180,
      image: '/monsters/thunder-dragon.png',
      description: '掌控雷电的巨龙'
    },
    {
      id: 'holy_dragon_s',
      name: '神圣龙',
      rank: '钻石S',
      max_health: 220,
      image: '/monsters/holy-dragon.png',
      description: '神圣力量的守护者'
    },
    {
      id: 'chaos_overlord_s',
      name: '混沌魔王',
      rank: '魔王S',
      max_health: 300,
      image: '/monsters/chaos-overlord.png',
      description: '混沌的统治者'
    }
  ];

  // 检查是否已存在数据
  const existingMonsters = await db.all('SELECT id FROM monsters');
  if (existingMonsters.length === 0) {
    for (const monster of monsters) {
      await db.run(
        `INSERT INTO monsters (id, name, rank, max_health, image, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [monster.id, monster.name, monster.rank, monster.max_health, monster.image, monster.description]
      );
    }
    console.log('Monsters seeded successfully');
  }

  // 插入示例题目数据
  const questions = [
    {
      id: 'sum_two_numbers',
      title: '求两数之和',
      description: '计算两个整数之和',
      difficulty: 'D',
      input_format: '两个整数，空格分隔',
      output_format: '一个整数，两数之和',
      hints: '1. 读取两个输入数字\n2. 计算它们的和\n3. 输出结果',
      template_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}',
      test_cases: '[{"input": "2 3", "expectedOutput": "5", "isHidden": false}]',
      memory_limit: 256
    },
    {
      id: 'find_max',
      title: '找出最大值',
      description: '从三个整数中找出最大的',
      difficulty: 'D',
      input_format: '三个整数，空格分隔',
      output_format: '一个整数，最大值',
      hints: '使用条件判断比较三个数',
      template_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    int max = a;\n    if (b > max) max = b;\n    if (c > max) max = c;\n    cout << max;\n    return 0;\n}',
      test_cases: '[{"input": "1 5 3", "expectedOutput": "5", "isHidden": false}]',
      memory_limit: 256
    },
    {
      id: 'factorial',
      title: '计算阶乘',
      description: '计算给定正整数的阶乘',
      difficulty: 'C',
      input_format: '一个正整数n',
      output_format: '一个整数，n的阶乘',
      hints: '使用循环计算阶乘',
      template_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long result = 1;\n    for (int i = 1; i <= n; i++) {\n        result *= i;\n    }\n    cout << result;\n    return 0;\n}',
      test_cases: '[{"input": "5", "expectedOutput": "120", "isHidden": false}]',
      memory_limit: 256
    }
  ];

  const existingQuestions = await db.all('SELECT id FROM questions');
  if (existingQuestions.length === 0) {
    for (const question of questions) {
      await db.run(
        `INSERT INTO questions (id, title, description, difficulty, input_format, output_format, hints, template_code, test_cases, memory_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question.id,
          question.title,
          question.description,
          question.difficulty,
          question.input_format,
          question.output_format,
          question.hints,
          question.template_code,
          question.test_cases,
          question.memory_limit
        ]
      );
    }
    console.log('Questions seeded successfully');
  }
};

export const getDB = () => db;