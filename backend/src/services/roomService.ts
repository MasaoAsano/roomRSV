import { getDatabase } from '../database';
import { MeetingRoom, RoomRecommendation, BookingRequest, Equipment } from '../types';

export class RoomService {
  private db = getDatabase();

  async getAllRooms(): Promise<MeetingRoom[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM meeting_rooms ORDER BY name',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const rooms: MeetingRoom[] = rows.map(row => ({
              id: row.id,
              name: row.name,
              capacity: row.capacity,
              equipment: {
                projector: Boolean(row.projector),
                tvConference: Boolean(row.tv_conference),
                whiteboard: Boolean(row.whiteboard)
              },
              location: row.location,
              floor: row.floor
            }));
            resolve(rooms);
          }
        }
      );
    });
  }

  async getRoomById(id: string): Promise<MeetingRoom | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM meeting_rooms WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            const room: MeetingRoom = {
              id: row.id,
              name: row.name,
              capacity: row.capacity,
              equipment: {
                projector: Boolean(row.projector),
                tvConference: Boolean(row.tv_conference),
                whiteboard: Boolean(row.whiteboard)
              },
              location: row.location,
              floor: row.floor
            };
            resolve(room);
          }
        }
      );
    });
  }

  async findAvailableRooms(startTime: Date, endTime: Date): Promise<MeetingRoom[]> {
    const allRooms = await this.getAllRooms();
    
    return new Promise((resolve, reject) => {
      const startTimeStr = startTime.toISOString();
      const endTimeStr = endTime.toISOString();
      
      this.db.all(
        `SELECT DISTINCT room_id FROM bookings 
         WHERE (start_time < ? AND end_time > ?) 
         OR (start_time < ? AND end_time > ?)
         OR (start_time >= ? AND end_time <= ?)`,
        [endTimeStr, startTimeStr, endTimeStr, startTimeStr, startTimeStr, endTimeStr],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const bookedRoomIds = new Set(rows.map(row => row.room_id));
            const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id));
            resolve(availableRooms);
          }
        }
      );
    });
  }

  async recommendRooms(request: BookingRequest): Promise<RoomRecommendation[]> {
    try {
      // startTimeが指定されていない場合は、現在時刻から1時間後をデフォルトとする
      const startTime = request.startTime || new Date();
      const endTime = request.endTime || new Date(startTime.getTime() + request.duration * 60000);
      
      console.log('Recommend request:', {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: request.duration,
        attendees: request.attendees,
        equipment: request.requiredEquipment
      });
      
      const availableRooms = await this.findAvailableRooms(startTime, endTime);
      console.log('Available rooms count:', availableRooms.length);
      
      const recommendations: RoomRecommendation[] = [];

      for (const room of availableRooms) {
        const recommendation = this.calculateRoomScore(room, request);
        if (recommendation.score > 0) {
          recommendations.push(recommendation);
        }
      }

      // スコア順にソート（高い順）
      const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);
      console.log('Recommendations generated:', sortedRecommendations.length);
      
      return sortedRecommendations;
    } catch (error) {
      console.error('Error in recommendRooms:', error);
      throw error;
    }
  }

  private calculateRoomScore(room: MeetingRoom, request: BookingRequest): RoomRecommendation {
    let score = 0;
    const reasons: string[] = [];

    // 1. 必須設備の完全一致チェック（最重要）
    const equipmentMatch = this.checkEquipmentMatch(room.equipment, request.requiredEquipment);
    if (!equipmentMatch.isMatch) {
      return { room, score: 0, reasons: ['必要な設備が不足しています'] };
    }
    score += 100; // 設備要件を満たす場合は基本スコア100
    reasons.push('必要な設備が揃っています');

    // 2. 収容人数に最も近いものを優先
    const capacityScore = this.calculateCapacityScore(room.capacity, request.attendees);
    score += capacityScore.points;
    reasons.push(capacityScore.reason);

    // 3. 追加のボーナス
    if (room.capacity === request.attendees) {
      score += 50; // ぴったり一致
      reasons.push('収容人数がぴったり一致します');
    } else if (room.capacity > request.attendees && room.capacity <= request.attendees + 2) {
      score += 30; // 少し余裕がある
      reasons.push('適度な余裕があります');
    }

    return { room, score, reasons };
  }

  private checkEquipmentMatch(roomEquipment: Equipment, requiredEquipment: Equipment): { isMatch: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (requiredEquipment.projector && !roomEquipment.projector) {
      missing.push('プロジェクター');
    }
    if (requiredEquipment.tvConference && !roomEquipment.tvConference) {
      missing.push('TV会議システム');
    }
    if (requiredEquipment.whiteboard && !roomEquipment.whiteboard) {
      missing.push('ホワイトボード');
    }

    return {
      isMatch: missing.length === 0,
      missing
    };
  }

  private calculateCapacityScore(roomCapacity: number, requestedAttendees: number): { points: number; reason: string } {
    if (roomCapacity < requestedAttendees) {
      return { points: 0, reason: '収容人数が不足しています' };
    }

    const ratio = requestedAttendees / roomCapacity;
    
    if (ratio >= 0.8 && ratio <= 1.0) {
      return { points: 40, reason: '収容人数が適切です' };
    } else if (ratio >= 0.6 && ratio < 0.8) {
      return { points: 30, reason: '収容人数に余裕があります' };
    } else if (ratio >= 0.4 && ratio < 0.6) {
      return { points: 20, reason: '収容人数に十分な余裕があります' };
    } else {
      return { points: 10, reason: '収容人数にかなりの余裕があります' };
    }
  }
}
