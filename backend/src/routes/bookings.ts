import { Router } from 'express';
import { BookingService } from '../services/bookingService';
import { RoomService } from '../services/roomService';
import { ApiResponse, BookingRequest } from '../types';

const router = Router();
const bookingService = new BookingService();
const roomService = new RoomService();

// 予約作成
router.post('/', async (req, res) => {
  try {
    const {
      roomId,
      duration,
      attendees,
      requiredEquipment,
      startTime,
      endTime,
      purpose,
      bookerName,
      bookerEmail
    } = req.body;

    // 入力値の検証
    if (!roomId || !duration || !attendees || !purpose || !bookerName || !bookerEmail) {
      const response: ApiResponse<null> = {
        success: false,
        error: '必要な情報が不足しています'
      };
      return res.status(400).json(response);
    }

    // 会議室の存在確認
    const room = await roomService.getRoomById(roomId);
    if (!room) {
      const response: ApiResponse<null> = {
        success: false,
        error: '指定された会議室が見つかりません'
      };
      return res.status(404).json(response);
    }

    const request: BookingRequest = {
      duration: parseInt(duration),
      attendees: parseInt(attendees),
      requiredEquipment,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined
    };

    const booking = await bookingService.createBooking(
      roomId,
      request,
      bookerName,
      bookerEmail,
      purpose
    );

    const response: ApiResponse<typeof booking> = {
      success: true,
      data: booking
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || '予約の作成に失敗しました'
    };
    res.status(400).json(response);
  }
});

// 予約一覧取得
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const bookings = await bookingService.getAllBookings(start, end);
    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '予約一覧の取得に失敗しました'
    };
    res.status(500).json(response);
  }
});

// 予約詳細取得
router.get('/:id', async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      const response: ApiResponse<null> = {
        success: false,
        error: '予約が見つかりません'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<typeof booking> = {
      success: true,
      data: booking
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '予約情報の取得に失敗しました'
    };
    res.status(500).json(response);
  }
});

// 予約削除
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await bookingService.deleteBooking(req.params.id);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: '予約が見つかりません'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: '予約の削除に失敗しました'
    };
    res.status(500).json(response);
  }
});

export default router;
