import React, { useState } from 'react';
import { BookingRequest, Equipment } from '../types';

interface SearchFormProps {
  onSearch: (request: BookingRequest) => void;
  isLoading?: boolean;
  initialRequest?: BookingRequest | null;
}

// 現在日時を取得して初期値を設定する関数
const getInitialDateTime = () => {
  const now = new Date();
  
  // 現在時刻を15分間隔に丸める
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  
  // 時間が18:00を超える場合は翌日の9:00に設定
  if (now.getHours() >= 18) {
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0);
  }
  
  return {
    date: now.toISOString().split('T')[0],
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  };
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false, initialRequest }) => {
  const [duration, setDuration] = useState<number>(initialRequest?.duration || 60);
  const [attendees, setAttendees] = useState<number>(initialRequest?.attendees || 4);
  
  // 初期日時の設定
  const initialDateTime = getInitialDateTime();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialRequest?.startTime) {
      const date = new Date(initialRequest.startTime);
      return date.toISOString().split('T')[0];
    }
    return initialDateTime.date;
  });
  
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (initialRequest?.startTime) {
      const date = new Date(initialRequest.startTime);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return initialDateTime.time;
  });
  const [requiredEquipment, setRequiredEquipment] = useState<Equipment>(
    initialRequest?.requiredEquipment || {
      projector: false,
      tvConference: false,
      whiteboard: false
    }
  );

  // initialRequestが変更された場合のみ日時を更新
  React.useEffect(() => {
    if (initialRequest?.startTime) {
      const date = new Date(initialRequest.startTime);
      setSelectedDate(date.toISOString().split('T')[0]);
      setSelectedTime(
        `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      );
    }
  }, [initialRequest]);

  const handleEquipmentChange = (equipment: keyof Equipment) => {
    setRequiredEquipment(prev => ({
      ...prev,
      [equipment]: !prev[equipment]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 日付と時間を組み合わせてstartTimeを作成
    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    
    const request: BookingRequest = {
      duration,
      attendees,
      requiredEquipment,
      startTime: startDateTime
    };

    onSearch(request);
  };

  const durationOptions = [
    { value: 15, label: '15分' },
    { value: 30, label: '30分' },
    { value: 45, label: '45分' },
    { value: 60, label: '1時間' },
    { value: 90, label: '1時間30分' },
    { value: 120, label: '2時間' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">会議室検索</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 所要時間 */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            所要時間
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 参加人数 */}
        <div>
          <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
            参加人数
          </label>
          <input
            type="number"
            id="attendees"
            min="1"
            max="20"
            value={attendees}
            onChange={(e) => setAttendees(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            1〜20名で入力してください
          </p>
        </div>

        {/* 希望日時 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-2">
              希望日
            </label>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              本日以降の日付を選択してください
            </p>
          </div>
          
          <div>
            <label htmlFor="selectedTime" className="block text-sm font-medium text-gray-700 mb-2">
              開始時間
            </label>
            <select
              id="selectedTime"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {Array.from({ length: 37 }, (_, i) => {
                const hour = Math.floor(i / 4) + 9;
                const minute = (i % 4) * 15;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                return (
                  <option key={timeStr} value={timeStr}>
                    {timeStr}
                  </option>
                );
              })}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              9:00〜18:00の15分間隔
            </p>
          </div>
        </div>

        {/* 必要な設備 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            必要な設備
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={requiredEquipment.projector}
                onChange={() => handleEquipmentChange('projector')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">プロジェクター</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={requiredEquipment.tvConference}
                onChange={() => handleEquipmentChange('tvConference')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">TV会議システム</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={requiredEquipment.whiteboard}
                onChange={() => handleEquipmentChange('whiteboard')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">ホワイトボード</span>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            必要な設備にチェックを入れてください（任意）
          </p>
        </div>

        {/* 検索ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? '検索中...' : '最適な会議室を検索'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
