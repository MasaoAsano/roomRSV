export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: {
    projector: boolean;
    tvConference: boolean;
    whiteboard: boolean;
  };
  location: string;
  floor: number;
}

export interface Equipment {
  projector: boolean;
  tvConference: boolean;
  whiteboard: boolean;
}

export interface BookingRequest {
  duration: number;
  attendees: number;
  requiredEquipment: Equipment;
  startTime?: Date;
  endTime?: Date;
}

export interface Booking {
  id: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  attendees: number;
  purpose: string;
  bookerName: string;
  bookerEmail: string;
  createdAt: Date;
}

export interface RoomRecommendation {
  room: MeetingRoom;
  score: number;
  reasons: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// カレンダー表示用の型
export interface CalendarSlot {
  timeSlot: string; // "09:00" or "09:15" などの時間スロット
  isBooked: boolean; // 予約済みかどうか
  bookingId?: string; // 予約ID（予約済みの場合）
  bookerName?: string; // 予約者名
  purpose?: string; // 会議目的
}

export interface CalendarDay {
  date: string; // "2025-10-03"
  dayOfWeek: string; // "月", "火", etc.
  slots: CalendarSlot[];
}

export interface CalendarData {
  room: MeetingRoom;
  weekStartDate: string; // "2025-10-03"
  weekEndDate: string; // "2025-10-09"
  days: CalendarDay[];
}
