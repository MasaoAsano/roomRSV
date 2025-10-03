import { getDatabase } from '../database';
import { Booking, BookingRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class BookingService {
  private db = getDatabase();

  async createBooking(
    roomId: string,
    request: BookingRequest,
    bookerName: string,
    bookerEmail: string,
    purpose: string
  ): Promise<Booking> {
    const startTime = request.startTime || new Date();
    const endTime = request.endTime || new Date(startTime.getTime() + request.duration * 60000);
    
    // 予約時間の重複チェック
    const isAvailable = await this.isRoomAvailable(roomId, startTime, endTime);
    if (!isAvailable) {
      throw new Error('指定された時間帯に会議室が利用できません');
    }

    // 予約時間の検証
    this.validateBookingTime(request.duration);

    const booking: Booking = {
      id: uuidv4(),
      roomId,
      startTime,
      endTime,
      attendees: request.attendees,
      purpose,
      bookerName,
      bookerEmail,
      createdAt: new Date()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO bookings 
         (id, room_id, start_time, end_time, attendees, purpose, booker_name, booker_email, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.id,
          booking.roomId,
          booking.startTime.toISOString(),
          booking.endTime.toISOString(),
          booking.attendees,
          booking.purpose,
          booking.bookerName,
          booking.bookerEmail,
          booking.createdAt.toISOString()
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(booking);
          }
        }
      );
    });
  }

  async getBookingsByRoom(roomId: string, startDate?: Date, endDate?: Date): Promise<Booking[]> {
    let query = 'SELECT * FROM bookings WHERE room_id = ?';
    const params: any[] = [roomId];

    if (startDate && endDate) {
      query += ' AND start_time >= ? AND end_time <= ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    query += ' ORDER BY start_time';

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const bookings: Booking[] = rows.map(row => ({
            id: row.id,
            roomId: row.room_id,
            startTime: new Date(row.start_time),
            endTime: new Date(row.end_time),
            attendees: row.attendees,
            purpose: row.purpose,
            bookerName: row.booker_name,
            bookerEmail: row.booker_email,
            createdAt: new Date(row.created_at)
          }));
          resolve(bookings);
        }
      });
    });
  }

  async getAllBookings(startDate?: Date, endDate?: Date): Promise<Booking[]> {
    let query = 'SELECT * FROM bookings';
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE start_time >= ? AND end_time <= ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    query += ' ORDER BY start_time';

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const bookings: Booking[] = rows.map(row => ({
            id: row.id,
            roomId: row.room_id,
            startTime: new Date(row.start_time),
            endTime: new Date(row.end_time),
            attendees: row.attendees,
            purpose: row.purpose,
            bookerName: row.booker_name,
            bookerEmail: row.booker_email,
            createdAt: new Date(row.created_at)
          }));
          resolve(bookings);
        }
      });
    });
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM bookings WHERE id = ?',
        [bookingId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async isRoomAvailable(roomId: string, startTime: Date, endTime: Date): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM bookings 
         WHERE room_id = ? AND (
           (start_time < ? AND end_time > ?) OR
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
        [
          roomId,
          endTime.toISOString(),
          startTime.toISOString(),
          endTime.toISOString(),
          startTime.toISOString(),
          startTime.toISOString(),
          endTime.toISOString()
        ],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count === 0);
          }
        }
      );
    });
  }

  private validateBookingTime(duration: number): void {
    // 15分〜2時間の範囲チェック
    if (duration < 15 || duration > 120) {
      throw new Error('予約時間は15分から2時間の間で設定してください');
    }

    // 15分単位チェック
    if (duration % 15 !== 0) {
      throw new Error('予約時間は15分単位で設定してください');
    }
  }
}
