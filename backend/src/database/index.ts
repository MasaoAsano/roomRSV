import { Database } from 'sqlite3';
import { createTables, seedMeetingRooms } from './schema';
import path from 'path';

let db: Database | null = null;
let isInitialized = false;

export const getDatabase = (): Database => {
  if (!db) {
    const dbPath = path.join(__dirname, '../../data/meeting_rooms.db');
    db = new Database(dbPath);
    db.serialize(() => {
      console.log('データベースに接続しました:', dbPath);
    });
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    const database = getDatabase();
    await createTables(database);
    await seedMeetingRooms(database);
    isInitialized = true;
    console.log('データベースの初期化が完了しました');
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error);
    throw error;
  }
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};
