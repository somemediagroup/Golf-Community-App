import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';

// Import types
interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: string;
  format: string;
  entry_fee: number;
  prize_pool?: number;
  max_participants: number;
  current_participants: number;
  image_url: string;
}

interface TournamentsSectionProps {
  tournaments: Tournament[];
  onRegisterTournament: (tournament: Tournament) => void;
  onViewAllTournaments: () => void;
}

export const TournamentsSection: React.FC<TournamentsSectionProps> = ({ 
  tournaments, 
  onRegisterTournament,
  onViewAllTournaments
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="tournaments-container" id="tournaments-section">
      <div className="section-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1F1E1F]">Upcoming Tournaments</h2>
        <button 
          className="text-[#448460] font-medium hover:underline flex items-center"
          onClick={onViewAllTournaments}
        >
          View All
        </button>
      </div>
      
      {tournaments.length > 0 ? (
        <div className="tournaments-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.slice(0, 3).map(tournament => (
            <div 
              key={tournament.id} 
              className="tournament-card bg-[#FBFCFB] rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col"
            >
              <div className="relative h-40 overflow-hidden">
                <OptimizedImage 
                  src={tournament.image_url} 
                  alt={tournament.name}
                  className="w-full h-full"
                  height={160}
                />
                <div className="absolute bottom-0 left-0 bg-[#1F1E1F]/70 text-[#FBFCFB] px-3 py-1 rounded-tr-md">
                  <span className="text-sm font-medium">{formatDate(tournament.start_date)}</span>
                </div>
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-semibold text-[#1F1E1F] mb-2">{tournament.name}</h3>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-[#448460]" />
                    <span>{tournament.venue}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-[#448460]" />
                    <span>Registration deadline: {formatDate(tournament.registration_deadline)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-4 w-4 mr-2 text-[#448460]" />
                    <span>{tournament.current_participants} of {tournament.max_participants} participants</span>
                  </div>
                  
                  {tournament.prize_pool && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Trophy className="h-4 w-4 mr-2 text-[#448460]" />
                      <span>Prize pool: ${tournament.prize_pool}</span>
                    </div>
                  )}
                </div>
                
                <div className="tournament-meta flex justify-between items-center mt-2">
                  <span className="bg-[#448460]/10 text-[#448460] px-2 py-1 rounded-md text-sm">${tournament.entry_fee}</span>
                  <span className="text-gray-600 text-sm">{tournament.format}</span>
                </div>
              </div>
              
              <button 
                className={`py-3 w-full font-medium ${
                  tournament.status === 'registered' 
                    ? 'bg-[#448460]/20 text-[#448460] cursor-default' 
                    : 'bg-[#448460] text-[#FBFCFB] hover:bg-[#448460]/90'
                } transition-colors`}
                onClick={() => onRegisterTournament(tournament)}
                disabled={tournament.status === 'registered'}
              >
                {tournament.status === 'registered' ? 'Registered' : 'Register Now'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state bg-gray-100 p-6 rounded-lg text-center border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No upcoming tournaments at this time.</p>
          <button 
            className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors"
            onClick={onViewAllTournaments}
          >
            Browse Tournaments
          </button>
        </div>
      )}
    </div>
  );
}; 