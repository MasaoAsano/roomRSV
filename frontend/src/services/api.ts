import axios from 'axios';
import { MeetingRoom, Booking, BookingRequest, RoomRecommendation, CalendarData, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const roomApi = {
  // 会議室一覧取得
  getAllRooms: async (): Promise<MeetingRoom[]> => {
    const response = await api.get<ApiResponse<MeetingRoom[]>>('/rooms');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '会議室一覧の取得に失敗しました');
    }
    return response.data.data;
  },

  // 会議室詳細取得
  getRoomById: async (id: string): Promise<MeetingRoom> => {
    const response = await api.get<ApiResponse<MeetingRoom>>(`/rooms/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '会議室情報の取得に失敗しました');
    }
    return response.data.data;
  },

  // 最適な会議室の提案
  recommendRooms: async (request: BookingRequest): Promise<RoomRecommendation[]> => {
    console.log('🚀 Calling recommendRooms API with:', request);
    try {
      const response = await api.post<ApiResponse<RoomRecommendation[]>>('/rooms/recommend', request);
      console.log('✅ Received response:', response.data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || '会議室の提案に失敗しました');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // 会議室の予約状況取得
  getRoomBookings: async (roomId: string, startDate?: Date, endDate?: Date): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const response = await api.get<ApiResponse<Booking[]>>(`/rooms/${roomId}/bookings?${params}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '予約状況の取得に失敗しました');
    }
    return response.data.data;
  },

  // 会議室のカレンダーデータ取得
  getRoomCalendar: async (roomId: string, startDate?: Date): Promise<CalendarData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());

    const url = `/rooms/${roomId}/calendar`;
    console.log('🌐 API Request URL:', `${API_BASE_URL}${url}`, 'Params:', params.toString());
    
    const response = await api.get<ApiResponse<CalendarData>>(url, { params });
    console.log('📡 API Response:', response.status, response.data);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'カレンダーデータの取得に失敗しました');
    }
    return response.data.data;
  }
};

export const bookingApi = {
  // 予約作成
  createBooking: async (bookingData: {
    roomId: string;
    duration: number;
    attendees: number;
    requiredEquipment: Equipment;
    startTime?: Date;
    endTime?: Date;
    purpose: string;
    bookerName: string;
    bookerEmail: string;
  }): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '予約の作成に失敗しました');
    }
    return response.data.data;
  },

  // 予約一覧取得
  getAllBookings: async (startDate?: Date, endDate?: Date): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings?${params}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '予約一覧の取得に失敗しました');
    }
    return response.data.data;
  },

  // 予約詳細取得
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '予約情報の取得に失敗しました');
    }
    return response.data.data;
  },

  // 予約削除
  deleteBooking: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/bookings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '予約の削除に失敗しました');
    }
  }
};

export const healthApi = {
  // ヘルスチェック
  checkHealth: async (): Promise<{ success: boolean; message: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  }
};
