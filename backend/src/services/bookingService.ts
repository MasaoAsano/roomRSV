import { getDatabase } from '../database';
import { Booking, BookingRequest, CalendarData, CalendarDay, CalendarSlot } from '../types';
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

  // カレンダー表示用のデータ取得
  async getCalendarData(roomId: string, startDate: Date): Promise<CalendarData> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 1週間後

    // 会議室情報を取得
    const room = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM meeting_rooms WHERE id = ?', [roomId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!room) {
      throw new Error('会議室が見つかりません');
    }

    // 予約データを取得
    const bookings = await this.getBookingsByRoom(roomId, startDate, endDate);
    
    // 週の各日のデータを生成
    const days: CalendarDay[] = [];
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = dayNames[currentDate.getDay()];
      
      // 15分間隔の時間スロット生成（9:00-18:00）
      const slots: CalendarSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // この時間帯の予約があるかチェック
          const booking = this.findBookingForTimeSlot(bookings, dateStr, timeSlot);
          
          slots.push({
            timeSlot,
            isBooked: !!booking,
            bookingId: booking?.id,
            bookerName: booking?.bookerName,
            purpose: booking?.purpose
          });
        }
      }
      
      days.push({
        date: dateStr,
        dayOfWeek,
        slots
      });
    }

    return {
      room: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: {
          projector: !!room.projector,
          tvConference: !!room.tv_conference,
          whiteboard: !!room.whiteboard
        },
        location: room.location,
        floor: room.floor
      },
      weekStartDate: startDate.toISOString().split('T')[0],
      weekEndDate: endDate.toISOString().split('T')[0],
      days
    };
  }

  private findBookingForTimeSlot(bookings: Booking[], date: string, timeSlot: string): Booking | undefined {
    const slotTime = new Date(`${date}T${timeSlot}:00.000Z`);
    const slotEndTime = new Date(slotTime.getTime() + 15 * 60000); // 15分後
    
    return bookings.find(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      // 予約時間がこのスロットと重複しているかチェック
      return (slotTime >= startTime && slotTime < endTime) ||
             (slotEndTime > startTime && slotEndTime <= endTime) ||
             (slotTime <= startTime && slotEndTime >= endTime);
    });
  }
}
