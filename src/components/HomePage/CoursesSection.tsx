import React from 'react';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';

// Types
interface Course {
  id: string;
  name: string;
  location: string;
  image_url?: string;
  rating?: number;
  course_type?: string;
  difficulty?: string;
  price_range?: string;
  featured?: boolean;
}

interface CoursesSectionProps {
  courses: Course[];
  onViewCourse: (course: Course) => void;
  onViewAllCourses: () => void;
  isActive: boolean;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({ 
  courses, 
  onViewCourse, 
  onViewAllCourses,
  isActive
}) => {
  // Only load images when this tab is active
  const imageLoading = isActive ? "eager" : "lazy";

  // Calculate difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch(difficulty.toLowerCase()) {
      case 'easy': 
      case 'beginner': 
        return "bg-green-100 text-green-800";
      case 'moderate':
      case 'intermediate': 
        return "bg-blue-100 text-blue-800";
      case 'difficult':
      case 'advanced': 
        return "bg-orange-100 text-orange-800";
      case 'expert':
      case 'professional': 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="courses-section">
      <div className="section-header flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1F1E1F]">Top Courses</h2>
        <button 
          className="text-[#448460] font-medium hover:underline flex items-center"
          onClick={onViewAllCourses}
        >
          View All
        </button>
      </div>
      
      <div className="courses-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.slice(0, 6).map(course => (
          <div 
            key={course.id} 
            className="course-card bg-[#FBFCFB] rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewCourse(course)}
          >
            <div className="course-image-container relative h-40 overflow-hidden">
              {course.image_url ? (
                <OptimizedImage
                  src={course.image_url} 
                  alt={course.name}
                  className="w-full h-full object-cover"
                  priority={isActive}
                  placeholder="blur"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#448460]/30 to-[#448460]/10 flex items-center justify-center">
                  <Star className="h-12 w-12 text-[#448460]/50" />
                </div>
              )}
              
              {course.rating && (
                <div className="absolute top-2 right-2 bg-[#1F1E1F]/80 text-[#FBFCFB] px-2 py-1 rounded-md flex items-center">
                  <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-current" />
                  <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                </div>
              )}
              
              {course.featured && (
                <div className="absolute top-2 left-2 bg-[#448460] text-[#FBFCFB] px-2 py-1 rounded-md text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            
            <div className="course-details p-4">
              <h3 className="text-lg font-semibold text-[#1F1E1F] mb-2">{course.name}</h3>
              
              <div className="course-meta space-y-2">
                <div className="location flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1 text-[#448460]" />
                  <span>{course.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  {course.price_range && (
                    <div className="price-range flex items-center text-gray-600 text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-[#448460]" />
                      <span>{course.price_range}</span>
                    </div>
                  )}
                  
                  {course.difficulty && (
                    <div className={`difficulty px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </div>
                  )}
                </div>
                
                {course.course_type && (
                  <div className="course-type text-sm text-gray-500">
                    {course.course_type}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <button 
          className="px-4 py-2 bg-[#FBFCFB] text-[#448460] border border-[#448460] rounded-md hover:bg-[#448460]/10 transition-colors"
          onClick={onViewAllCourses}
        >
          View All Courses
        </button>
      </div>
    </div>
  );
}; 