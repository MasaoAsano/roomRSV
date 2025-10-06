import React, { useState } from 'react';
import { BookingRequest, Equipment } from '../types';

interface SearchFormProps {
  onSearch: (request: BookingRequest) => void;
  isLoading?: boolean;
  initialRequest?: BookingRequest | null;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false, initialRequest }) => {
  const [duration, setDuration] = useState<number>(initialRequest?.duration || 60);
  const [attendees, setAttendees] = useState<number>(initialRequest?.attendees || 4);
  
  // 現在日時を取得して初期値を設定する関数
  const getInitialDateTime = () => {
    const now = new Date();
    console.log('🔍 getInitialDateTime - 現在時刻:', now.toLocaleString('ja-JP'));
    
    // 現在時刻を15分間隔に丸める
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    console.log('🔍 15分刻みに丸めた時刻:', now.toLocaleString('ja-JP'));
    
    // 日本時間で日付を取得（タイムゾーンずれを回避）
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log('🔍 最終的な日時設定:', { date, time });
    
    return {
      date,
      time
    };
  };
  
  // 初期日時の設定
  const initialDateTime = getInitialDateTime();
  console.log('🔍 initialRequest:', initialRequest);
  console.log('🔍 initialDateTime:', initialDateTime);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialRequest?.startTime) {
      const date = new Date(initialRequest.startTime);
      const result = date.toISOString().split('T')[0];
      console.log('🔍 selectedDate (initialRequest使用):', result);
      return result;
    }
    console.log('🔍 selectedDate (現在日時使用):', initialDateTime.date);
    return initialDateTime.date;
  });
  
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (initialRequest?.startTime) {
      const date = new Date(initialRequest.startTime);
      const result = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      console.log('🔍 selectedTime (initialRequest使用):', result);
      return result;
    }
    console.log('🔍 selectedTime (現在日時使用):', initialDateTime.time);
    return initialDateTime.time;
  });
  const [requiredEquipment, setRequiredEquipment] = useState<Equipment>(
    initialRequest?.requiredEquipment || {
      projector: false,
      tvConference: false,
      whiteboard: false
    }
  );

  // 時間調整関数（15分刻み）
  const adjustTime = (minutes: number) => {
    const [hours, mins] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    
    // 範囲制限（9:00〜23:45）
    const minMinutes = 9 * 60; // 9:00
    const maxMinutes = 23 * 60 + 45; // 23:45
    
    let adjustedMinutes = Math.max(minMinutes, Math.min(maxMinutes, totalMinutes));
    
    // 15分刻みに調整
    adjustedMinutes = Math.round(adjustedMinutes / 15) * 15;
    
    const newHours = Math.floor(adjustedMinutes / 60);
    const newMins = adjustedMinutes % 60;
    
    const newTime = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    setSelectedTime(newTime);
  };

  // 時間入力のリアルタイム処理
  const handleTimeInput = (value: string) => {
    // 数字とコロンのみ許可
    const sanitized = value.replace(/[^0-9:]/g, '');
    
    // 長さ制限
    if (sanitized.length <= 5) {
      setSelectedTime(sanitized);
    }
  };

  // 時間バリデーションと設定
  const validateAndSetTime = (value: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (!timeRegex.test(value)) {
      // 無効な形式の場合は前回の有効な値に戻す
      return;
    }
    
    const [hours, minutes] = value.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // 範囲チェック（9:00〜23:45）
    const minMinutes = 9 * 60; // 9:00
    const maxMinutes = 23 * 60 + 45; // 23:45
    
    if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
      // 範囲外の場合は前回の有効な値に戻す
      return;
    }
    
    // 15分刻みチェック
    if (minutes % 15 !== 0) {
      // 15分刻みでない場合は最も近い15分刻みに調整
      const adjustedMinutes = Math.round(minutes / 15) * 15;
      const newTime = `${hours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
      setSelectedTime(newTime);
      return;
    }
    
    // 有効な場合はそのまま設定
    const newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setSelectedTime(newTime);
  };

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
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => adjustTime(-15)}
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold transition-colors"
                title="15分減算"
              >
                ◀
              </button>
              <input
                id="selectedTime"
                type="text"
                value={selectedTime}
                onChange={(e) => handleTimeInput(e.target.value)}
                onBlur={(e) => validateAndSetTime(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono"
                placeholder="HH:MM"
                maxLength={5}
              />
              <button
                type="button"
                onClick={() => adjustTime(15)}
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold transition-colors"
                title="15分加算"
              >
                ▶
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              9:00〜23:45の15分間隔（直接入力も可能）
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
