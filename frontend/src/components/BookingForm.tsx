import React, { useState } from 'react';
import { BookingRequest, Equipment, RoomRecommendation } from '../types';

interface BookingFormProps {
  recommendations: RoomRecommendation[];
  onBook: (data: {
    roomId: string;
    duration: number;
    attendees: number;
    requiredEquipment: Equipment;
    purpose: string;
    bookerName: string;
    bookerEmail: string;
  }) => void;
  isLoading?: boolean;
  currentRequest?: BookingRequest | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  recommendations, 
  onBook, 
  isLoading = false,
  currentRequest
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [bookerName, setBookerName] = useState<string>('');
  const [bookerEmail, setBookerEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomId) {
      alert('会議室を選択してください');
      return;
    }

    if (!purpose.trim()) {
      alert('会議の目的を入力してください');
      return;
    }

    if (!bookerName.trim()) {
      alert('予約者名を入力してください');
      return;
    }

    if (!bookerEmail.trim()) {
      alert('メールアドレスを入力してください');
      return;
    }

    const selectedRecommendation = recommendations.find(r => r.room.id === selectedRoomId);
    if (!selectedRecommendation) {
      alert('選択された会議室の情報が見つかりません');
      return;
    }

    // 実際の検索条件を使用
    if (!currentRequest) {
      alert('検索条件が見つかりません');
      return;
    }

    const formData = {
      roomId: selectedRoomId,
      duration: currentRequest.duration,
      attendees: currentRequest.attendees,
      requiredEquipment: currentRequest.requiredEquipment,
      purpose: purpose.trim(),
      bookerName: bookerName.trim(),
      bookerEmail: bookerEmail.trim()
    };

    onBook(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">予約フォーム</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 検索条件の確認 */}
        {currentRequest && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">📋 検索条件</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• 所要時間: {currentRequest.duration}分</p>
              <p>• 参加人数: {currentRequest.attendees}名</p>
              {currentRequest.startTime && (
                <p>• 希望日時: {new Date(currentRequest.startTime).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              )}
              <div className="flex items-center gap-2">
                <span>• 必要な設備:</span>
                {currentRequest.requiredEquipment.projector && <span className="bg-blue-100 px-2 py-1 rounded text-xs">プロジェクター</span>}
                {currentRequest.requiredEquipment.tvConference && <span className="bg-blue-100 px-2 py-1 rounded text-xs">TV会議</span>}
                {currentRequest.requiredEquipment.whiteboard && <span className="bg-blue-100 px-2 py-1 rounded text-xs">ホワイトボード</span>}
                {!currentRequest.requiredEquipment.projector && !currentRequest.requiredEquipment.tvConference && !currentRequest.requiredEquipment.whiteboard && (
                  <span className="text-gray-500">なし</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 会議室選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏢 推奨会議室から選択
          </label>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.room.id} className="flex items-center">
                <input
                  type="radio"
                  id={`room-${recommendation.room.id}`}
                  name="roomId"
                  value={recommendation.room.id}
                  checked={selectedRoomId === recommendation.room.id}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor={`room-${recommendation.room.id}`} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{recommendation.room.name}</span>
                    <span className="text-sm text-gray-500">
                      定員: {recommendation.room.capacity}名 | 適合度: {recommendation.score}点
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 会議の目的 */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
            会議の目的 *
          </label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: プロジェクト進捗会議、クライアント打ち合わせ、チームミーティングなど"
            required
          />
        </div>

        {/* 予約者名 */}
        <div>
          <label htmlFor="bookerName" className="block text-sm font-medium text-gray-700 mb-2">
            予約者名 *
          </label>
          <input
            type="text"
            id="bookerName"
            value={bookerName}
            onChange={(e) => setBookerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="山田 太郎"
            required
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="bookerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス *
          </label>
          <input
            type="email"
            id="bookerEmail"
            value={bookerEmail}
            onChange={(e) => setBookerEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="yamada@company.com"
            required
          />
        </div>

        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !selectedRoomId}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              isLoading || !selectedRoomId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? '予約中...' : '予約を確定する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
