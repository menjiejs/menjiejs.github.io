import { Server, Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { RoomService } from '../services/RoomService';
import { UserService } from '../services/UserService';

export function setupGameSocket(io: Server) {
  const gameService = new GameService();
  const roomService = new RoomService(gameService);
  const userService = new UserService();

  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // 加入房间
    socket.on('joinRoom', async (data) => {
      const { roomId, playerName, gameMode = 'solo' } = data;

      try {
        // 加入Socket.IO房间
        socket.join(roomId);

        // 获取或创建游戏会话
        let gameState = roomService.getGameState(roomId);
        if (!gameState) {
          // 创建新会话
          const roomInfo = roomService.createRoom(roomName || `房间 ${roomId}`, 4, gameMode);
          gameState = roomService.getGameState(roomId);
        }

        // 添加玩家
        const session = await roomService.joinRoom(roomId, {
          id: socket.id,
          name: playerName,
          rank: 'D', // 初始段位
          score: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          isReady: false
        });

        // 通知房间内所有玩家
        gameNamespace.to(roomId).emit('playerJoined', {
          playerId: socket.id,
          playerName,
          players: session.players
        });

        // 发送初始游戏状态
        socket.emit('roomInfo', roomService.getRoomInfo(roomId));

      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // 玩家准备
    socket.on('playerReady', (roomId) => {
      try {
        const session = roomService.playerReady(roomId, socket.id);
        gameNamespace.to(roomId).emit('roomInfo', roomService.getRoomInfo(roomId));
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // 提交答案
    socket.on('submitAnswer', async (data) => {
      const { roomId, answerCode, questionId } = data;

      try {
        // 获取题目
        const question = await gameService.getQuestionById(questionId);
        if (!question) {
          throw new Error('Question not found');
        }

        // 提交答案
        const result = gameService.answerQuestion(roomId, socket.id, answerCode, question);

        // 记录答案
        const session = roomService.getGameState(roomId);
        if (session && session.session) {
          // TODO: 保存答案记录到数据库
        }

        // 广播答题结果
        gameNamespace.to(roomId).emit('answerResult', {
          playerId: socket.id,
          ...result,
          gameState: roomService.getGameState(roomId)
        });

        // 如果游戏结束，更新用户统计
        if (result.gameFinished) {
          const player = session.session.players.find(p => p.id === socket.id);
          if (player) {
            await userService.updateGameStats(
              socket.id,
              result.winner === 'player',
              result.isCorrect ? 100 : 0
            );
          }
        }

      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // 获取游戏状态
    socket.on('getGameState', (roomId) => {
      try {
        const gameState = roomService.getGameState(roomId);
        if (gameState) {
          socket.emit('gameState', gameState);
        } else {
          socket.emit('error', { message: 'Game state not found' });
        }
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // 获取题目
    socket.on('getQuestion', (data) => {
      const { rank } = data;
      gameService.getQuestionForRank(rank).then(question => {
        if (question) {
          socket.emit('question', question);
        } else {
          socket.emit('error', { message: 'No question found for this rank' });
        }
      }).catch(error => {
        socket.emit('error', { message: error.message });
      });
    });

    // 玩家离开房间
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      roomService.leaveRoom(roomId, socket.id).then(success => {
        if (success) {
          gameNamespace.to(roomId).emit('playerLeft', {
            playerId: socket.id
          });
        }
      });
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      // 这里应该清理玩家的游戏状态
    });
  });
}