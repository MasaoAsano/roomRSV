import { Database } from 'sqlite3';

export const createTables = (db: Database) => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // 会議室テーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS meeting_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          projector BOOLEAN NOT NULL,
          tv_conference BOOLEAN NOT NULL,
          whiteboard BOOLEAN NOT NULL,
          location TEXT NOT NULL,
          floor INTEGER NOT NULL
        )
      `);

      // 予約テーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          attendees INTEGER NOT NULL,
          purpose TEXT NOT NULL,
          booker_name TEXT NOT NULL,
          booker_email TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (room_id) REFERENCES meeting_rooms (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

export const seedMeetingRooms = (db: Database) => {
  const rooms = [
    {
      id: 'room-001',
      name: '会議室A',
      capacity: 4,
      projector: true,
      tvConference: false,
      whiteboard: true,
      location: '本社ビル',
      floor: 5
    },
    {
      id: 'room-002',
      name: '会議室B',
      capacity: 6,
      projector: true,
      tvConference: true,
      whiteboard: true,
      location: '本社ビル',
      floor: 5
    },
    {
      id: 'room-003',
      name: '会議室C',
      capacity: 8,
      projector: false,
      tvConference: true,
      whiteboard: false,
      location: '本社ビル',
      floor: 6
    },
    {
      id: 'room-004',
      name: '大型会議室',
      capacity: 12,
      projector: true,
      tvConference: true,
      whiteboard: true,
      location: '本社ビル',
      floor: 7
    },
    {
      id: 'room-005',
      name: 'セミナー室',
      capacity: 20,
      projector: true,
      tvConference: true,
      whiteboard: true,
      location: '本社ビル',
      floor: 8
    },
    {
      id: 'room-006',
      name: '小会議室D',
      capacity: 2,
      projector: false,
      tvConference: false,
      whiteboard: true,
      location: '本社ビル',
      floor: 4
    },
    {
      id: 'room-007',
      name: '会議室E',
      capacity: 10,
      projector: true,
      tvConference: false,
      whiteboard: true,
      location: '本社ビル',
      floor: 6
    },
    {
      id: 'room-008',
      name: '会議室F',
      capacity: 6,
      projector: false,
      tvConference: true,
      whiteboard: false,
      location: '本社ビル',
      floor: 5
    },
    {
      id: 'room-009',
      name: '会議室G',
      capacity: 4,
      projector: true,
      tvConference: true,
      whiteboard: true,
      location: '本社ビル',
      floor: 7
    },
    {
      id: 'room-010',
      name: 'VIP会議室',
      capacity: 8,
      projector: true,
      tvConference: true,
      whiteboard: true,
      location: '本社ビル',
      floor: 9
    }
  ];

  return new Promise<void>((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO meeting_rooms 
      (id, name, capacity, projector, tv_conference, whiteboard, location, floor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    rooms.forEach(room => {
      stmt.run([
        room.id,
        room.name,
        room.capacity,
        room.projector,
        room.tvConference,
        room.whiteboard,
        room.location,
        room.floor
      ]);
    });

    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
