import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { SUPABASE_URL } from '@/lib/supabase';

/**
 * Test API Page to verify that the Supabase backend is configured correctly
 * Tests database tables, RLS policies, and API services
 */
export default function TestApiPage() {
  const { supabase, user, courses, news, social, activities } = useSupabase();
  
  const [courseData, setCourseData] = useState<any[] | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  
  const [newsData, setNewsData] = useState<any[] | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  const [checkInsData, setCheckInsData] = useState<any[] | null>(null);
  const [checkInsError, setCheckInsError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function testApi() {
      setLoading(true);
      
      try {
        // Test courses table
        const { courses: coursesList, error: coursesErr } = await courses.getCourses();
        if (coursesErr) throw new Error(`Courses error: ${coursesErr.message}`);
        setCourseData(coursesList);
        
        // Test news table
        const { articles, error: newsErr } = await news.getNewsArticles();
        if (newsErr) throw new Error(`News error: ${newsErr.message}`);
        setNewsData(articles);
        
        // If user is logged in, test check-ins
        if (user) {
          const { checkIns, error: checkInsErr } = await activities.getUserCheckIns(user.id);
          if (checkInsErr) throw new Error(`Check-ins error: ${checkInsErr.message}`);
          setCheckInsData(checkIns);
        }
      } catch (error) {
        console.error('API test error:', error);
        if (error instanceof Error) {
          if (error.message.includes('Courses')) {
            setCoursesError(error.message);
          } else if (error.message.includes('News')) {
            setNewsError(error.message);
          } else if (error.message.includes('Check-ins')) {
            setCheckInsError(error.message);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    
    testApi();
  }, [courses, news, activities, user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">API Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Authentication Status</h2>
        {user ? (
          <div className="bg-green-100 text-green-800 p-4 rounded">
            <p><strong>User Authenticated:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {user.username}</p>
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
            <p>Not authenticated. Some tests may fail due to RLS policies.</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Golf Courses Test</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : coursesError ? (
            <div className="bg-red-100 text-red-800 p-4 rounded">{coursesError}</div>
          ) : (
            <div>
              <p className="mb-2 text-green-600">✓ Successfully retrieved {courseData?.length || 0} courses</p>
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {courseData?.map(course => (
                    <li key={course.id} className="py-2">
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-gray-600">{course.location}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">News Articles Test</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : newsError ? (
            <div className="bg-red-100 text-red-800 p-4 rounded">{newsError}</div>
          ) : (
            <div>
              <p className="mb-2 text-green-600">✓ Successfully retrieved {newsData?.length || 0} articles</p>
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {newsData?.map(article => (
                    <li key={article.id} className="py-2">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-gray-600">{article.published_date}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {user && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">User Check-ins Test</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : checkInsError ? (
            <div className="bg-red-100 text-red-800 p-4 rounded">{checkInsError}</div>
          ) : (
            <div>
              <p className="mb-2 text-green-600">✓ Successfully retrieved {checkInsData?.length || 0} check-ins</p>
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {checkInsData?.map(checkIn => (
                    <li key={checkIn.id} className="py-2">
                      <p className="font-medium">{checkIn.course?.name || 'Unknown Course'}</p>
                      <p className="text-sm text-gray-600">{new Date(checkIn.check_in_time).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Database Configuration Summary</h2>
        <div className="space-y-2">
          <p><strong>Connection URL:</strong> {SUPABASE_URL}</p>
          <p><strong>Tables Tested:</strong> golf_courses, news_articles{user ? ', check_ins' : ''}</p>
          <p><strong>RLS Status:</strong> {(courseData && newsData) ? 'Working correctly for public access' : 'Failed'}</p>
          <p><strong>User-specific RLS:</strong> {user ? (checkInsData ? 'Working correctly' : 'Failed') : 'Not tested (requires login)'}</p>
        </div>
      </div>
    </div>
  );
} 