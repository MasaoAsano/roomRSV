import React, { useState } from 'react';
import { BookingRequest, Equipment } from '../types';

interface SearchFormProps {
  onSearch: (request: BookingRequest) => void;
  isLoading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [duration, setDuration] = useState<number>(60);
  const [attendees, setAttendees] = useState<number>(4);
  const [requiredEquipment, setRequiredEquipment] = useState<Equipment>({
    projector: false,
    tvConference: false,
    whiteboard: false
  });

  const handleEquipmentChange = (equipment: keyof Equipment) => {
    setRequiredEquipment(prev => ({
      ...prev,
      [equipment]: !prev[equipment]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: BookingRequest = {
      duration,
      attendees,
      requiredEquipment
      // startTimeは削除（バックエンドで現在時刻をデフォルトとして使用）
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            1〜20名で入力してください
          </p>
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
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
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
