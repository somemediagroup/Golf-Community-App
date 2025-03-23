import React from 'react';
import { MapPin, Users, MessageCircle } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';

// Types
interface GolfPartner {
  id: string;
  name: string;
  handicap: number;
  distance: number;
  avatar_url?: string;
}

interface PartnersSectionProps {
  partners: GolfPartner[];
  onFindPartners: () => void;
  onConnectPartner: (partner: GolfPartner) => void;
  isActive: boolean;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({ 
  partners, 
  onFindPartners, 
  onConnectPartner,
  isActive
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format handicap display
  const formatHandicap = (handicap: number) => {
    if (handicap === 0) return 'scratch';
    if (handicap === Math.floor(handicap)) return handicap.toString();
    return handicap.toFixed(1);
  };

  return (
    <div className="partners-section">
      <div className="section-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1F1E1F]">Golf Partners Near You</h2>
        <button 
          className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors flex items-center"
          onClick={onFindPartners}
        >
          <Users className="h-4 w-4 mr-2" />
          Find Partners
        </button>
      </div>
      
      {partners.length > 0 ? (
        <div className="partners-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.slice(0, 4).map(partner => (
            <div 
              key={partner.id} 
              className="partner-card bg-[#FBFCFB] p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4"
            >
              <div className="partner-avatar">
                {partner.avatar_url ? (
                  <OptimizedImage 
                    src={partner.avatar_url} 
                    alt={partner.name} 
                    width={64}
                    height={64}
                    className="rounded-full"
                    priority={isActive}
                  />
                ) : (
                  <div className="avatar-placeholder w-16 h-16 rounded-full bg-[#448460] text-[#FBFCFB] flex items-center justify-center text-lg font-medium">
                    {getInitials(partner.name)}
                  </div>
                )}
              </div>
              
              <div className="partner-details flex-grow">
                <h4 className="text-lg font-semibold text-[#1F1E1F]">{partner.name}</h4>
                <div className="space-y-1 mt-1">
                  <div className="handicap text-sm text-gray-600">
                    <span className="font-medium">Handicap:</span> {formatHandicap(partner.handicap)}
                  </div>
                  <div className="distance flex items-center text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-[#448460]" />
                    <span>{partner.distance.toFixed(1)} miles away</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="connect-button flex items-center px-3 py-2 bg-[#FBFCFB] border border-[#448460] text-[#448460] rounded-md hover:bg-[#448460]/10 transition-colors"
                onClick={() => onConnectPartner(partner)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Connect
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state bg-gray-100 p-6 rounded-lg text-center border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No golf partners found in your area.</p>
          <button 
            className="px-4 py-2 bg-[#448460] text-[#FBFCFB] rounded-md hover:bg-[#448460]/90 transition-colors"
            onClick={onFindPartners}
          >
            Find Partners
          </button>
        </div>
      )}
      
      {partners.length > 0 && (
        <div className="flex justify-center mt-6">
          <button 
            className="text-[#448460] font-medium hover:underline flex items-center"
            onClick={onFindPartners}
          >
            Find More Partners
          </button>
        </div>
      )}
    </div>
  );
}; 