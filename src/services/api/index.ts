// Export all API services

import { authService } from './auth';
import courseService from './courses';
import socialService from './social';
import newsService from './news';
import activityService from './activities';
import profileService from './profile';
import scoresAPI from "./scores";

export {
  authService as auth,
  courseService as courses,
  socialService as social,
  newsService as news,
  activityService as activities,
  profileService as profile,
  scoresAPI
}; 