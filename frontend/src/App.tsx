import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import RoomCard from './components/RoomCard';
import BookingForm from './components/BookingForm';
import CalendarView from './components/CalendarView';
import { roomApi, bookingApi, healthApi } from './services/api';
import { BookingRequest, RoomRecommendation, Booking, Equipment } from './types';
import { Search, Calendar, CheckCircle, Menu, ChevronLeft } from 'lucide-react';

type AppState = 'home' | 'search' | 'results' | 'booking' | 'success' | 'calendar';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [recommendations, setRecommendations] = useState<RoomRecommendation[]>([]);
  const [currentRequest, setCurrentRequest] = useState<BookingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // APIヘルスチェック
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthApi.checkHealth();
        console.log('✅ API接続成功');
      } catch (error) {
        console.error('❌ API接続エラー:', error);
      }
    };
    checkHealth();
  }, []);

  const handleSearch = async (request: BookingRequest) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 検索開始:', request);
      const results = await roomApi.recommendRooms(request);
      console.log('📊 検索結果:', results);
      setRecommendations(results);
      setCurrentRequest(request);
      setCurrentState('results');
    } catch (error: any) {
      console.error('❌ 検索エラー:', error);
      setError(error.message || '検索に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (bookingData: {
    roomId: string;
    duration: number;
    attendees: number;
    requiredEquipment: Equipment;
    purpose: string;
    bookerName: string;
    bookerEmail: string;
  }) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📝 予約開始:', bookingData);
      await bookingApi.createBooking(bookingData);
      setSuccessMessage('予約が完了しました！');
      setCurrentState('success');
    } catch (error: any) {
      console.error('❌ 予約エラー:', error);
      setError(error.message || '予約に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentState('search');
    setRecommendations([]);
    setCurrentRequest(null);
    setError('');
    setSuccessMessage('');
  };

  const handleBackToResults = () => {
    setCurrentState('results');
    setError('');
    setSuccessMessage('');
  };

  const renderContent = () => {
    switch (currentState) {
      case 'home':
        return (
          <div className="text-center py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-red-900 mb-4">
                会議室予約システム
              </h1>
              <p className="text-xl text-red-700 mb-8">
                最適な会議室を簡単に見つけて予約
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              <div 
                onClick={() => setCurrentState('search')}
                className="bg-white p-8 rounded-lg shadow-md border border-red-200 hover:shadow-lg hover:border-red-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">会議室を予約</h3>
                <p className="text-red-600">
                  条件に合う最適な会議室を検索して予約できます
                </p>
              </div>

              <div 
                onClick={() => setCurrentState('calendar')}
                className="bg-white p-8 rounded-lg shadow-md border border-red-200 hover:shadow-lg hover:border-red-300 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="w-12 h-12 text-red-700" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">予約状況確認</h3>
                <p className="text-red-600">
                  会議室の1週間の予約状況をカレンダーで確認できます
                </p>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <button 
                onClick={() => setCurrentState('home')}
                className="flex items-center text-red-600 hover:text-red-800 mb-4"
              >
                <ChevronLeft className="mr-1" size={20} />
                戻る
              </button>
              
              <div className="flex items-center gap-6 mb-6">
                <Search className="text-red-600" size={32} />
                <h1 className="text-3xl font-bold text-red-900">会議室予約</h1>
              </div>
            </div>
            
            <SearchForm onSearch={handleSearch} isLoading={isLoading} initialRequest={currentRequest} />
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-red-900">推奨会議室</h1>
                <p className="text-red-700 mt-1">
                  あなたの要件に最適な会議室をご提案します
                </p>
              </div>
              <button
                onClick={handleBackToSearch}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                <Menu className="w-4 h-4 mr-2 rotate-180" />
                検索に戻る
              </button>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {recommendations.map((recommendation) => (
                    <RoomCard
                      key={recommendation.room.id}
                      room={recommendation.room}
                      showScore={true}
                      score={recommendation.score}
                      reasons={recommendation.reasons}
                      onClick={() => setCurrentState('booking')}
                    />
                  ))}
                </div>
                <div className="text center">
                  <button
                    onClick={() => setCurrentState('booking')}
                    className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-lg font-medium"
                  >
                    🎯 予約を進める
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 mb-4">
                    条件に合う会議室が見つかりませんでした。
                  </p>
                  <button
                    onClick={handleBackToSearch}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    ← 検索条件を変更する
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'booking':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📝 予約フォーム</h1>
                <p className="text-gray-600 mt-1">
                  会議室の予約を完了させてください
                </p>
              </div>
              <button
                onClick={handleBackToResults}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Menu className="w-4 h-4 mr-2 rotate-180" />
                結果に戻る
              </button>
            </div>
            <BookingForm
              recommendations={recommendations}
              onBook={handleBook}
              isLoading={isLoading}
              currentRequest={currentRequest}
            />
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 予約完了！
            </h1>
            <p className="text-gray-600 mb-6 text-lg">{successMessage}</p>
            <button
              onClick={handleBackToSearch}
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-medium"
            >
              ✨ 新しい予約を行う
            </button>
          </div>
        );

      case 'calendar':
        return (
          <CalendarView 
            onBack={() => setCurrentState('home')} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-300 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-900">
                    エラーが発生しました
                  </h3>
                  <div className="mt-2 text-sm text-red-800">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;