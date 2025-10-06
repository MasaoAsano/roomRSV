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
    startTime?: Date | string;
    endTime?: Date | string;
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
          <div className="min-h-screen">
            {/* メインビジュアル - ヒーローセクション */}
            <div className="relative bg-gradient-to-br from-red-50 via-white to-red-100 py-16 px-4">
              {/* 背景装飾 */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-300 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100 rounded-full opacity-10 blur-2xl"></div>
              </div>
              
              {/* メインコンテンツ */}
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* 創造的なディスカッションを表現するSVGアイコン */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    {/* メインの会議室アイコン */}
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    
                    {/* 周囲の装飾的なアイコン */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H4.5C3.67 2 3 2.67 3 3.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"/>
                      </svg>
                    </div>
                    
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    
                    <div className="absolute top-1/2 -left-6 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    
                    <div className="absolute top-1/2 -right-6 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-5xl font-bold text-red-900 mb-6 leading-tight">
                  創造的な
                  <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"> ディスカッション</span>
                  <br />を始めよう
                </h1>
                <p className="text-xl text-red-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                  最適な会議室で、アイデアを形に変える<br />
                  クリエイティブな議論の場を見つけましょう
                </p>
                
                {/* 装飾的な要素 */}
                <div className="flex justify-center items-center space-x-4 mb-8">
                  <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* アクションボタンセクション */}
            <div className="bg-white py-12 px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  今すぐ始める
                </h2>
                <p className="text-red-600">
                  あなたの創造的なプロジェクトに最適な会議室を見つけましょう
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div 
                  onClick={() => setCurrentState('search')}
                  className="group bg-white p-8 rounded-2xl shadow-lg border border-red-200 hover:shadow-2xl hover:border-red-300 cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-3">会議室を予約</h3>
                  <p className="text-red-600 leading-relaxed">
                    条件に合う最適な会議室を検索して<br />
                    創造的なディスカッションの場を予約できます
                  </p>
                  <div className="mt-6 flex items-center text-red-500 group-hover:text-red-600 transition-colors duration-300">
                    <span className="text-sm font-medium">今すぐ予約</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>

                <div 
                  onClick={() => setCurrentState('calendar')}
                  className="group bg-white p-8 rounded-2xl shadow-lg border border-red-200 hover:shadow-2xl hover:border-red-300 cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-3">予約状況確認</h3>
                  <p className="text-red-600 leading-relaxed">
                    会議室の利用状況をカレンダーで<br />
                    リアルタイムに確認できます
                  </p>
                  <div className="mt-6 flex items-center text-red-500 group-hover:text-red-600 transition-colors duration-300">
                    <span className="text-sm font-medium">状況を確認</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 追加の装飾要素 */}
              <div className="mt-12 text-center">
                <div className="inline-flex items-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
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