import express from 'express';
import cors from 'cors';
import path from 'path';
import roomsRouter from './routes/rooms';
import bookingsRouter from './routes/bookings';

const app = express();
const PORT = process.env.PORT || 5001;

// ミドルウェア
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// データベースディレクトリの作成
import fs from 'fs';
import { initializeDatabase } from './database';

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// データベース初期化
initializeDatabase().catch(error => {
  console.error('データベース初期化エラー:', error);
});

// ルート
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '会議室予約システムAPIが正常に動作しています',
    timestamp: new Date().toISOString()
  });
});

// APIルート
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('エラー:', err);
  res.status(500).json({
    success: false,
    error: 'サーバー内部エラーが発生しました'
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📊 APIヘルスチェック: http://localhost:${PORT}/api/health`);
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  process.exit(0);
});
