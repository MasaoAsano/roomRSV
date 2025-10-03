import { Router } from 'express';
import { RoomService } from '../services/roomService';
import { BookingService } from '../services/bookingService';
import { ApiResponse, BookingRequest } from '../types';

const router = Router();
const roomService = new RoomService();
const bookingService = new BookingService();

// 会議室一覧取得
router.get('/', async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    const response: ApiResponse<typeof rooms> = {
      success: true,
      data: rooms
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '会議室一覧の取得に失敗しました'
    };
    res.status(500).json(response);
  }
});

// 会議室詳細取得
router.get('/:id', async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) {
      const response: ApiResponse<null> = {
        success: false,
        error: '会議室が見つかりません'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<typeof room> = {
      success: true,
      data: room
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '会議室情報の取得に失敗しました'
    };
    res.status(500).json(response);
  }
});

// 会議室の予約状況取得
router.get('/:id/bookings', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const bookings = await bookingService.getBookingsByRoom(req.params.id, start, end);
    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '予約状況の取得に失敗しました'
    };
    res.status(500).json(response);
  }
});

// 最適な会議室の提案
router.post('/recommend', async (req, res) => {
  try {
    const request: BookingRequest = req.body;
    
    console.log('Received recommend request:', request);
    
    // 入力値の検証
    if (!request.duration || !request.attendees || !request.requiredEquipment) {
      console.log('Missing required fields:', {
        duration: request.duration,
        attendees: request.attendees,
        requiredEquipment: request.requiredEquipment
      });
      const response: ApiResponse<null> = {
        success: false,
        error: '必要な情報が不足しています'
      };
      return res.status(400).json(response);
    }

    console.log('Calling roomService.recommendRooms...');
    const recommendations = await roomService.recommendRooms(request);
    console.log('Received recommendations:', recommendations.length);
    
    const response: ApiResponse<typeof recommendations> = {
      success: true,
      data: recommendations
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error in recommend endpoint:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: `会議室の提案に失敗しました: ${error.message || 'Unknown error'}`
    };
    res.status(500).json(response);
  }
});

export default router;
