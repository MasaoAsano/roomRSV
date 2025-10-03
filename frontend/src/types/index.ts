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
