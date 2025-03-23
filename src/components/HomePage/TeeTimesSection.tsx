import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Users } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';

// Import types
interface TeeTimeBooking {
  id: string;
  course_id: string;
  course_name: string;
  date: string;
  time: string;
  players: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  booking_ref?: string;
  price?: number;
  notes?: string;
}

interface TeeTimesSectionProps {
  teeTimes: TeeTimeBooking[];
  onBookTeeTime: () => void;
}

export const TeeTimesSection: React.FC<TeeTimesSectionProps> = ({ teeTimes, onBookTeeTime }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-[#448460]/10 text-[#448460]';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="tee-times-container">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1F1E1F]">Upcoming Tee Times</h2>
        <button 
          className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors"
          onClick={onBookTeeTime}
        >
          + Book New
        </button>
      </div>
      
      {teeTimes.length > 0 ? (
        <div className="tee-times-list space-y-3">
          {teeTimes.map(teeTime => (
            <div 
              key={teeTime.id} 
              className="tee-time-card flex items-center bg-[#FBFCFB] p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="tee-time-date mr-4 text-center">
                <div className="bg-[#448460]/10 px-3 py-2 rounded-md">
                  <div className="date text-lg font-medium text-[#1F1E1F]">{formatDate(teeTime.date)}</div>
                  <div className="time text-sm font-medium text-[#448460]">{teeTime.time}</div>
                </div>
              </div>
              
              <div className="tee-time-details flex-grow">
                <h3 className="text-lg font-semibold text-[#1F1E1F]">{teeTime.course_name}</h3>
                <div className="flex items-center mt-1">
                  <div className="player-count flex items-center text-gray-600 mr-4">
                    <Users className="h-4 w-4 mr-1 text-[#448460]" />
                    <span>{teeTime.players} {teeTime.players === 1 ? 'Player' : 'Players'}</span>
                  </div>
                  <div className={`status px-2 py-0.5 rounded-full text-xs ${getStatusColor(teeTime.status)}`}>
                    {teeTime.status.charAt(0).toUpperCase() + teeTime.status.slice(1)}
                  </div>
                </div>
                {teeTime.price && (
                  <div className="price mt-1 text-sm text-gray-600">
                    ${teeTime.price.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="tee-time-actions">
                <button 
                  className="view-details-button p-2 rounded-full hover:bg-gray-100"
                  title="View details"
                >
                  <Clock className="h-5 w-5 text-[#448460]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state bg-gray-100 p-6 rounded-lg text-center border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You don't have any upcoming tee times.</p>
          <button 
            className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors"
            onClick={onBookTeeTime}
          >
            Book a Tee Time
          </button>
        </div>
      )}
    </div>
  );
}; 