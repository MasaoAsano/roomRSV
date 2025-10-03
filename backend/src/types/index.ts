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
  duration: number; // 所要時間（分）
  attendees: number; // 参加人数
  requiredEquipment: Equipment; // 必要な設備
  startTime?: Date; // 希望開始時間（オプション）
  endTime?: Date; // 希望終了時間（オプション）
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
