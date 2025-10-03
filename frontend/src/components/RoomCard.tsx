import React from 'react';
import { MeetingRoom } from '../types';
import { Monitor, Video, PenTool } from 'lucide-react';

interface RoomCardProps {
  room: MeetingRoom;
  onClick?: () => void;
  showScore?: boolean;
  score?: number;
  reasons?: string[];
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onClick, 
  showScore = false, 
  score, 
  reasons = [] 
}) => {
  const getEquipmentIcon = (equipment: typeof room.equipment) => {
    const icons = [];
    if (equipment.projector) icons.push(<Monitor key="projector" className="w-4 h-4" />);
    if (equipment.tvConference) icons.push(<Video key="tv" className="w-4 h-4" />);
    if (equipment.whiteboard) icons.push(<PenTool key="whiteboard" className="w-4 h-4" />);
    return icons;
  };

  const getEquipmentText = (equipment: typeof room.equipment) => {
    const items = [];
    if (equipment.projector) items.push('プロジェクター');
    if (equipment.tvConference) items.push('TV会議システム');
    if (equipment.whiteboard) items.push('ホワイトボード');
    return items.join(', ');
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
          <p className="text-sm text-gray-600">
            {room.location} {room.floor}F
          </p>
        </div>
        {showScore && score !== undefined && (
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            適合度: {score}点
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1 text-gray-600">
          <span className="text-sm">定員:</span>
          <span className="font-medium">{room.capacity}名</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <span className="text-sm">設備:</span>
          <div className="flex gap-1">
            {getEquipmentIcon(room.equipment)}
          </div>
        </div>
      </div>

      {getEquipmentText(room.equipment) && (
        <p className="text-sm text-gray-500 mb-2">
          {getEquipmentText(room.equipment)}
        </p>
      )}

      {showScore && reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">推奨理由:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
