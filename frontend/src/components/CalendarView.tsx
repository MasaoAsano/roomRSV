import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { CalendarData, CalendarDay, CalendarSlot, MeetingRoom } from '../types';
import { roomApi } from '../services/api';

interface CalendarViewProps {
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await roomApi.getAllRooms();
        setRooms(roomsData);
        if (roomsData.length > 0) {
          setSelectedRoomId(roomsData[0].id);
        }
      } catch (err: any) {
        setError(err.message || '会議室の読み込みに失敗しました');
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadCalendarData();
    }
  }, [selectedRoomId, currentWeekStart]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomApi.getRoomCalendar(selectedRoomId, currentWeekStart);
      setCalendarData(data);
    } catch (err: any) {
      setError(err.message || 'カレンダーデータの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const getNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date .getDate();
    return `${month}/${day}`;
  };

  const getSlotColor = (slot: CalendarSlot) => {
    if (slot.isBooked) {
      return 'bg-red-200 border-red-300 text-red-800';
    }
    return 'bg-green-100 border-green-200 text-green-800';
  };

  const getBookedSlotTooltip = (slot: CalendarSlot) => {
    if (!slot.isBooked) return null;
    return `${slot.timeSlot} - ${slot.bookerName} (${slot.purpose})`;
  };

  // 時間帯のグループ化（1時間ごと）
  const groupSlotsByHour = (slots: CalendarSlot[]) => {
    const grouped: { [hour: string]: CalendarSlot[] } = {};
    slots.forEach(slot => {
      const hour = slot.timeSlot.substring(0, 2);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(slot);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-red-600 hover:text-red-800 mb-4"
        >
          <ChevronLeft className="mr-1" size={20} />
          戻る
        </button>
        
        <div className="flex items-center gap-6 mb-6">
          <Calendar className="text-red-600" size={32} />
          <h1 className="text-3xl font-bold text-red-900">予約状況カレンダー</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 会議室選択とフィルター */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              会議室を選択:
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (定員: {room.capacity}名, {room.location} {room.floor}F)
                </option>
              ))}
            </select>
          </div>

          {/* 週ナビゲーション */}
          <div className="flex items-center gap-4">
            <button
              onClick={getPreviousWeek}
              className="p-2 rounded-md bg-red-100 hover:bg-red-200"
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="font-semibold text-red-700 min-w-48 text-center">
              {calendarData ? `${calendarData.weekStartDate} - ${calendarData.weekEndDate}` : ''}
            </span>
            
            <button
              onClick={getNextWeek}
              className="p-2 rounded-md bg-red-100 hover:bg-red-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* カレンダー */}
        {calendarData && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-blue-900">{calendarData.room.name}</h3>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Users className="w-4 h-4" />
                  <span>定員: {calendarData.room.capacity}名</span>
                  <span>•</span>
                  <span>{calendarData.room.location} {calendarData.room.floor}F</span>
                </div>
              </div>
              
              {/* 設備表示 */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">設備:</span>
                {calendarData.room.equipment.projector && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">プロジェクター</span>
                )}
                {calendarData.room.equipment.tvConference && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">TV会議</span>
                )}
                {calendarData.room.equipment.whiteboard && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">ホワイトボード</span>
                )}
              </div>
            </div>

            {/* カレンダーテーブル */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 w-24">時間</th>
                    {calendarData.days.map((day) => (
                      <th key={day.date} className="p-3 text-center text-sm font-semibold text-gray-700 min-w-32">
                        <div>{day.dayOfWeek}</div>
                        <div className="text-xs text-gray-500">{formatDate(day.date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupSlotsByHour(calendarData.days[0].slots)).map(([hour, slots]) => (
                    <tr key={hour} className="border-t border-gray-100">
                      <td className="p-3 text-sm font-medium text-gray-600 bg-gray-50">
                        {hour}:00
                      </td>
                      {calendarData.days.map((day) => {
                        const daySlots = day.slots.filter(slot => slot.timeSlot.startsWith(hour));
                        return (
                          <td key={`${day.date}-${hour}`} className="p-1">
                            <div className="grid grid-cols-4 gap-1">
                              {daySlots.map((slot) => (
                                <div
                                  key={`${day.date}-${slot.timeSlot}`}
                                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${getSlotColor(slot)}`}
                                  title={getBookedSlotTooltip(slot) || `${slot.timeSlot}`}
                                >
                                  {slot.isBooked ? '●' : '○'}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 凡例 */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-green-200 rounded border"></div>
                  <span className="text-gray-600">利用可能 (○)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border-red-300 rounded border"></div>
                  <span className="text-gray-600">予約済み (●)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">1枠 = 15分</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;