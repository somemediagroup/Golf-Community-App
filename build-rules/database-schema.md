# Golf Community App Database Schema

This document outlines the database schema for the Golf Community App, including all tables, relationships, and key fields.

## User Management

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| password_hash | String | Hashed password |
| first_name | String | User's first name |
| last_name | String | User's last name |
| username | String | Unique username |
| avatar_url | String | URL to profile picture |
| bio | Text | User biography |
| location | String | User's general location |
| handicap | Decimal | User's current handicap |
| created_at | Timestamp | Account creation time |
| updated_at | Timestamp | Last account update time |
| last_login | Timestamp | Last login timestamp |
| is_verified | Boolean | Email verification status |
| is_active | Boolean | Account status |

### User_Roles Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| role | Enum | User, Admin, Course_Manager |
| created_at | Timestamp | Role assignment time |
| updated_at | Timestamp | Last role update time |

### User_Preferences Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| notification_preferences | JSON | Notification settings |
| privacy_settings | JSON | Privacy configuration |
| theme_preference | String | UI theme preference |
| language | String | Preferred language |
| updated_at | Timestamp | Last preferences update |

## Course Management

### Golf_Courses Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Course name |
| description | Text | Course description |
| location | String | Course location text |
| address | String | Full address |
| city | String | City |
| state | String | State/Province |
| postal_code | String | Postal/ZIP code |
| country | String | Country |
| geo_location | Point | GPS coordinates |
| contact_phone | String | Contact phone number |
| contact_email | String | Contact email |
| website | String | Course website URL |
| holes | Integer | Number of holes (usually 9 or 18) |
| par | Integer | Course par |
| course_type | Enum | Public, Private, Resort, etc. |
| established_year | Integer | Year established |
| amenities | JSON | Available amenities |
| price_range | Enum | $, $$, $$$, $$$$ |
| created_at | Timestamp | Record creation time |
| updated_at | Timestamp | Last record update |
| is_verified | Boolean | Course verification status |

### Course_Media Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| course_id | UUID | Foreign key to Golf_Courses |
| media_type | Enum | Photo, Video, Virtual_Tour |
| url | String | Media URL |
| title | String | Media title |
| description | Text | Media description |
| is_featured | Boolean | Featured status |
| uploaded_by | UUID | Foreign key to Users |
| upload_date | Timestamp | Upload timestamp |

### Course_Holes Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| course_id | UUID | Foreign key to Golf_Courses |
| hole_number | Integer | Hole number |
| par | Integer | Par for the hole |
| distance_yards | Integer | Distance in yards |
| distance_meters | Integer | Distance in meters |
| handicap_index | Integer | Hole difficulty (1-18) |
| description | Text | Hole description |
| image_url | String | Hole image |

## Social Features

### Friendships Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users (requester) |
| friend_id | UUID | Foreign key to Users (receiver) |
| status | Enum | Pending, Accepted, Rejected, Blocked |
| created_at | Timestamp | Request timestamp |
| updated_at | Timestamp | Last status update |

### Messages Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sender_id | UUID | Foreign key to Users |
| recipient_id | UUID | Foreign key to Users |
| content | Text | Message content |
| sent_at | Timestamp | Send timestamp |
| read_at | Timestamp | Read timestamp |
| is_read | Boolean | Read status |

### User_Groups Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Group name |
| description | Text | Group description |
| created_by | UUID | Foreign key to Users |
| created_at | Timestamp | Creation timestamp |
| updated_at | Timestamp | Last update timestamp |
| avatar_url | String | Group image URL |
| is_private | Boolean | Privacy setting |

### Group_Members Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Foreign key to User_Groups |
| user_id | UUID | Foreign key to Users |
| role | Enum | Admin, Member |
| joined_at | Timestamp | Join timestamp |

## Activity and Engagement

### Check_Ins Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| course_id | UUID | Foreign key to Golf_Courses |
| check_in_time | Timestamp | Check-in timestamp |
| geo_location | Point | GPS coordinates at check-in |
| comment | Text | Optional comment |
| weather_conditions | JSON | Weather data at check-in |
| visibility | Enum | Public, Friends, Private |

### Course_Reviews Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| course_id | UUID | Foreign key to Golf_Courses |
| rating | Decimal | Rating (1-5) |
| review_text | Text | Review content |
| pros | Text | Positive aspects |
| cons | Text | Negative aspects |
| visit_date | Date | Date of visit |
| created_at | Timestamp | Review timestamp |
| updated_at | Timestamp | Last update timestamp |
| helpful_count | Integer | Number of "helpful" marks |

### Review_Photos Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| review_id | UUID | Foreign key to Course_Reviews |
| url | String | Photo URL |
| caption | String | Photo caption |
| uploaded_at | Timestamp | Upload timestamp |

### User_Activities Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| activity_type | Enum | Check_In, Review, Score_Card, Friend_Add, etc. |
| activity_data | JSON | Activity details |
| related_entity_id | UUID | Related entity ID |
| created_at | Timestamp | Activity timestamp |
| visibility | Enum | Public, Friends, Private |

## Golf Performance Tracking

### Score_Cards Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| course_id | UUID | Foreign key to Golf_Courses |
| play_date | Date | Date played |
| total_score | Integer | Total score |
| created_at | Timestamp | Record creation time |
| updated_at | Timestamp | Last update time |
| weather_conditions | JSON | Weather during play |
| notes | Text | Player notes |
| visibility | Enum | Public, Friends, Private |

### Score_Card_Details Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| score_card_id | UUID | Foreign key to Score_Cards |
| hole_number | Integer | Hole number |
| par | Integer | Par for the hole |
| score | Integer | Player's score |
| fairway_hit | Boolean | Fairway hit status |
| green_in_regulation | Boolean | GIR status |
| putts | Integer | Number of putts |
| penalties | Integer | Number of penalties |

### Achievements Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Achievement name |
| description | Text | Achievement description |
| badge_image_url | String | Badge image URL |
| achievement_type | Enum | Score, Check_In, Social, etc. |
| criteria | JSON | Unlock criteria |
| created_at | Timestamp | Achievement creation time |

### User_Achievements Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| achievement_id | UUID | Foreign key to Achievements |
| unlocked_at | Timestamp | Unlock timestamp |
| related_entity_id | UUID | Related entity (if applicable) |

## Events and Planning

### Events Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Event title |
| description | Text | Event description |
| creator_id | UUID | Foreign key to Users |
| course_id | UUID | Foreign key to Golf_Courses |
| start_time | Timestamp | Start time |
| end_time | Timestamp | End time |
| max_participants | Integer | Maximum participants |
| created_at | Timestamp | Creation timestamp |
| updated_at | Timestamp | Last update timestamp |
| status | Enum | Scheduled, Cancelled, Completed |
| visibility | Enum | Public, Private, Group |
| event_type | Enum | Casual, Tournament, Lesson, etc. |

### Event_Participants Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Foreign key to Events |
| user_id | UUID | Foreign key to Users |
| rsvp_status | Enum | Going, Maybe, Declined |
| joined_at | Timestamp | RSVP timestamp |
| notes | Text | Participant notes |

### Event_Invitations Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Foreign key to Events |
| inviter_id | UUID | Foreign key to Users |
| invitee_id | UUID | Foreign key to Users |
| invitation_sent | Timestamp | Sent timestamp |
| response_time | Timestamp | Response timestamp |
| status | Enum | Pending, Accepted, Declined |
| message | Text | Invitation message |

## Content and News

### News_Articles Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Article title |
| content | Text | Article content |
| summary | Text | Brief summary |
| source | String | Source name |
| source_url | String | Original article URL |
| published_date | Timestamp | Publication date |
| author | String | Author name |
| featured_image | String | Featured image URL |
| category | Enum | Tournament, Player, Course, Equipment, etc. |
| is_featured | Boolean | Featured status |
| imported_at | Timestamp | Import timestamp |

### News_Categories Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Category name |
| description | Text | Category description |
| parent_category_id | UUID | Parent category (self-reference) |

### User_Bookmarks Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| entity_type | Enum | Course, News, Event, etc. |
| entity_id | UUID | Referenced entity ID |
| created_at | Timestamp | Bookmark timestamp |
| notes | Text | User notes |

## Notifications System

### Notifications Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| type | Enum | Friend_Request, Event_Invite, Check_In, etc. |
| content | Text | Notification text |
| related_entity_type | String | Entity type |
| related_entity_id | UUID | Entity ID |
| created_at | Timestamp | Creation timestamp |
| is_read | Boolean | Read status |
| read_at | Timestamp | Read timestamp |
| is_actionable | Boolean | Requires user action |

## Database Relationships Overview

### Primary Relationships
1. **Users and Courses**:
   - Users can check in to multiple courses
   - Users can review multiple courses
   - Users can submit score cards for multiple courses

2. **Users and Social Connections**:
   - Users can have many friends (many-to-many self-referential)
   - Users can belong to multiple groups
   - Users can send/receive messages

3. **Users and Activities**:
   - Users generate many activities
   - Activities can reference various entities

4. **Courses and Performance**:
   - Courses have many holes
   - Score cards reference specific courses
   - Score card details track performance on course holes

5. **Events and Participation**:
   - Users can create multiple events
   - Users can participate in multiple events
   - Events can have multiple invitations

### Indexes and Performance Considerations

1. **Frequently Queried Fields**:
   - user_id (across most tables)
   - course_id (in course-related tables)
   - created_at/timestamp fields (for chronological sorting)
   - geo_location (for proximity searches)

2. **Composite Indexes**:
   - (user_id, created_at) for user activity feeds
   - (course_id, rating) for course ratings
   - (event_id, start_time) for upcoming events

3. **Full-Text Search Indexes**:
   - Course names and descriptions
   - Review text
   - News article content

## Data Security and Privacy Considerations

1. **Sensitive Data Protection**:
   - Password hashes stored with strong encryption
   - Personal user information protected
   - Geolocation data anonymized where appropriate

2. **Privacy Controls**:
   - User visibility settings enforced at database level
   - Content sharing preferences respected in queries
   - Friend relationships verified for accessing protected content

3. **Audit Trails**:
   - Critical actions logged with timestamps and user IDs
   - Data modifications tracked
   - Login attempts recorded

## Database Evolution Strategy

1. **Version Control**:
   - Schema changes tracked with migrations
   - Backward compatibility maintained where possible

2. **Performance Monitoring**:
   - Query performance tracked
   - Index effectiveness evaluated
   - Regular optimization reviews

3. **Scaling Considerations**:
   - Sharding strategy for high-volume tables
   - Potential NoSQL integration for specific data types
   - Caching layer for frequently accessed data 