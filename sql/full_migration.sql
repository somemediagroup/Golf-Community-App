-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

--------------------------------------------------------------------------------
-- User Management Tables
--------------------------------------------------------------------------------

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    handicap DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'admin', 'course_manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_visibility": "friends", "score_visibility": "friends"}'::jsonb,
    theme_preference TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------------------------------------
-- Course Management Tables
--------------------------------------------------------------------------------

-- Create golf_courses table
CREATE TABLE IF NOT EXISTS golf_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL,
    geo_location GEOGRAPHY(POINT),
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    holes INTEGER NOT NULL CHECK (holes IN (9, 18, 27, 36)),
    par INTEGER NOT NULL,
    course_type TEXT CHECK (course_type IN ('public', 'private', 'semi-private', 'resort', 'municipal')),
    established_year INTEGER,
    amenities JSONB,
    price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_verified BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    rating DECIMAL
);

-- Create course_media table
CREATE TABLE IF NOT EXISTS course_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES golf_courses(id) ON DELETE CASCADE,
    media_type TEXT CHECK (media_type IN ('photo', 'video', 'virtual_tour')),
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_holes table
CREATE TABLE IF NOT EXISTS course_holes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES golf_courses(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    par INTEGER NOT NULL,
    distance_yards INTEGER,
    distance_meters INTEGER,
    handicap_index INTEGER,
    description TEXT,
    image_url TEXT,
    UNIQUE(course_id, hole_number)
);

--------------------------------------------------------------------------------
-- Social Features Tables
--------------------------------------------------------------------------------

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE
);

-- Create user_groups table
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    avatar_url TEXT,
    is_private BOOLEAN DEFAULT FALSE
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Create user_activities table (for social activities and feed)
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT CHECK (activity_type IN ('check_in', 'review', 'score_card', 'friend_add', 'post', 'achievement')),
    activity_data JSONB,
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    visibility TEXT CHECK (visibility IN ('public', 'friends', 'private'))
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES user_activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------------------------------------
-- Activity and Performance Tracking Tables
--------------------------------------------------------------------------------

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES golf_courses(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    geo_location GEOGRAPHY(POINT),
    comment TEXT,
    weather_conditions JSONB,
    visibility TEXT CHECK (visibility IN ('public', 'friends', 'private'))
);

-- Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES golf_courses(id) ON DELETE CASCADE,
    rating DECIMAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    helpful_count INTEGER DEFAULT 0
);

-- Create review_photos table
CREATE TABLE IF NOT EXISTS review_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES course_reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create score_cards table
CREATE TABLE IF NOT EXISTS score_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES golf_courses(id) ON DELETE CASCADE,
    play_date DATE NOT NULL,
    total_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    weather_conditions JSONB,
    notes TEXT,
    visibility TEXT CHECK (visibility IN ('public', 'friends', 'private'))
);

-- Create score_card_details table
CREATE TABLE IF NOT EXISTS score_card_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    score_card_id UUID REFERENCES score_cards(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    par INTEGER NOT NULL,
    score INTEGER NOT NULL,
    fairway_hit BOOLEAN,
    green_in_regulation BOOLEAN,
    putts INTEGER,
    penalties INTEGER DEFAULT 0
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_image_url TEXT,
    achievement_type TEXT NOT NULL,
    criteria JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    related_entity_id UUID
);

--------------------------------------------------------------------------------
-- Content, News and Events Tables
--------------------------------------------------------------------------------

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    source TEXT,
    source_url TEXT,
    published_date TIMESTAMP WITH TIME ZONE NOT NULL,
    author TEXT,
    featured_image TEXT,
    category TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    UNIQUE(user_id, entity_type, entity_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    course_id UUID REFERENCES golf_courses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT CHECK (status IN ('scheduled', 'cancelled', 'completed')) DEFAULT 'scheduled',
    visibility TEXT CHECK (visibility IN ('public', 'private', 'group')) DEFAULT 'public',
    event_type TEXT CHECK (event_type IN ('casual', 'tournament', 'lesson', 'social'))
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rsvp_status TEXT CHECK (rsvp_status IN ('going', 'maybe', 'declined')) DEFAULT 'going',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Create event_invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invitation_sent TIMESTAMP WITH TIME ZONE DEFAULT now(),
    response_time TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    message TEXT,
    UNIQUE(event_id, invitee_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_actionable BOOLEAN DEFAULT FALSE
);

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- User roles policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles are viewable by the user"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- User preferences policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Courses policies
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone"
    ON golf_courses FOR SELECT
    USING (true);

CREATE POLICY "Course managers can update courses"
    ON golf_courses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'course_manager')
        )
    );

CREATE POLICY "Admins can insert courses"
    ON golf_courses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'course_manager')
        )
    );

-- Course media policies
ALTER TABLE course_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course media is viewable by everyone"
    ON course_media FOR SELECT
    USING (true);

CREATE POLICY "Users can upload media for courses"
    ON course_media FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can only delete their own uploads"
    ON course_media FOR DELETE
    USING (auth.uid() = uploaded_by);

-- Course holes policies
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course holes are viewable by everyone"
    ON course_holes FOR SELECT
    USING (true);

CREATE POLICY "Course managers can manage holes"
    ON course_holes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'course_manager')
        )
    );

-- Friendships policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
    ON friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
    ON friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendship status"
    ON friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages they've sent or received"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages (mark as read)"
    ON messages FOR UPDATE
    USING (auth.uid() = recipient_id);

-- Groups policies
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups are viewable by everyone"
    ON user_groups FOR SELECT
    USING (NOT is_private OR auth.uid() IN (
        SELECT user_id FROM group_members WHERE group_id = user_groups.id
    ));

CREATE POLICY "Users can create groups"
    ON user_groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update group info"
    ON user_groups FOR UPDATE
    USING (auth.uid() IN (
        SELECT user_id FROM group_members 
        WHERE group_id = user_groups.id AND role = 'admin'
    ));

-- Group members policies
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members are viewable by other members"
    ON group_members FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM group_members 
        WHERE group_id = group_members.group_id
    ));

CREATE POLICY "Group admins can manage members"
    ON group_members FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM group_members 
        WHERE group_id = group_members.group_id AND role = 'admin'
    ));

CREATE POLICY "Users can join public groups"
    ON group_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND 
        NOT EXISTS (
            SELECT 1 FROM user_groups 
            WHERE id = group_id AND is_private
        )
    );

-- User activities policies
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public activities are viewable by everyone"
    ON user_activities FOR SELECT
    USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = user_activities.user_id AND friend_id = auth.uid() OR
                  user_id = auth.uid() AND friend_id = user_activities.user_id) AND
                  status = 'accepted'
        ))
    );

CREATE POLICY "Users can create activities"
    ON user_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
    ON user_activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
    ON user_activities FOR DELETE
    USING (auth.uid() = user_id);

-- Comments policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments on public or accessible posts are viewable"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_activities
            WHERE id = post_id AND (
                visibility = 'public' OR 
                auth.uid() = user_id OR
                (visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friendships
                    WHERE (user_id = user_activities.user_id AND friend_id = auth.uid() OR
                          user_id = auth.uid() AND friend_id = user_activities.user_id) AND
                          status = 'accepted'
                ))
            )
        )
    );

CREATE POLICY "Users can comment on public or accessible posts"
    ON comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM user_activities
            WHERE id = post_id AND (
                visibility = 'public' OR 
                auth.uid() = user_activities.user_id OR
                (visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friendships
                    WHERE (user_id = user_activities.user_id AND friend_id = auth.uid() OR
                          user_id = auth.uid() AND friend_id = user_activities.user_id) AND
                          status = 'accepted'
                ))
            )
        )
    );

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Check-ins policies
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public check-ins are viewable by everyone"
    ON check_ins FOR SELECT
    USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = check_ins.user_id AND friend_id = auth.uid() OR
                  user_id = auth.uid() AND friend_id = check_ins.user_id) AND
                  status = 'accepted'
        ))
    );

CREATE POLICY "Users can create their own check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
    ON check_ins FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
    ON check_ins FOR DELETE
    USING (auth.uid() = user_id);

-- Course reviews policies
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course reviews are viewable by everyone"
    ON course_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own reviews"
    ON course_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON course_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON course_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Review photos policies
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review photos are viewable by everyone"
    ON review_photos FOR SELECT
    USING (true);

CREATE POLICY "Users can add photos to their own reviews"
    ON review_photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM course_reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete photos from their own reviews"
    ON review_photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM course_reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

-- Score cards policies
ALTER TABLE score_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public score cards are viewable by everyone"
    ON score_cards FOR SELECT
    USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = score_cards.user_id AND friend_id = auth.uid() OR
                  user_id = auth.uid() AND friend_id = score_cards.user_id) AND
                  status = 'accepted'
        ))
    );

CREATE POLICY "Users can create their own score cards"
    ON score_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own score cards"
    ON score_cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own score cards"
    ON score_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Score card details policies
ALTER TABLE score_card_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Score card details are viewable if parent score card is viewable"
    ON score_card_details FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM score_cards
            WHERE id = score_card_id AND (
                visibility = 'public' OR 
                auth.uid() = user_id OR
                (visibility = 'friends' AND EXISTS (
                    SELECT 1 FROM friendships
                    WHERE (user_id = score_cards.user_id AND friend_id = auth.uid() OR
                          user_id = auth.uid() AND friend_id = score_cards.user_id) AND
                          status = 'accepted'
                ))
            )
        )
    );

CREATE POLICY "Users can manage their own score card details"
    ON score_card_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM score_cards
            WHERE id = score_card_id AND user_id = auth.uid()
        )
    );

-- Achievements policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage achievements"
    ON achievements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- User achievements policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User achievements are viewable by the user and friends"
    ON user_achievements FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = user_achievements.user_id AND friend_id = auth.uid() OR
                  user_id = auth.uid() AND friend_id = user_achievements.user_id) AND
                  status = 'accepted'
        )
    );

-- News articles policies
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News articles are viewable by everyone"
    ON news_articles FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage news articles"
    ON news_articles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- News categories policies
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News categories are viewable by everyone"
    ON news_categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage news categories"
    ON news_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- User bookmarks policies
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
    ON user_bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
    ON user_bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
    ON user_bookmarks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON user_bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Events policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone"
    ON events FOR SELECT
    USING (
        visibility = 'public' OR 
        auth.uid() = creator_id OR
        (visibility = 'group' AND EXISTS (
            SELECT 1 FROM event_participants
            WHERE event_id = events.id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Event creators can update their events"
    ON events FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Event creators can delete their events"
    ON events FOR DELETE
    USING (auth.uid() = creator_id);

-- Event participants policies
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event participants are viewable by related users"
    ON event_participants FOR SELECT
    USING (
        auth.uid() IN (
            SELECT creator_id FROM events WHERE id = event_id
        ) OR
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM events
            WHERE id = event_id AND visibility = 'public'
        ) OR
        EXISTS (
            SELECT 1 FROM event_participants
            WHERE event_id = event_participants.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join events they can view"
    ON event_participants FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM events
            WHERE id = event_id AND (
                visibility = 'public' OR
                auth.uid() = creator_id OR
                (visibility = 'group' AND EXISTS (
                    SELECT 1 FROM event_invitations
                    WHERE event_id = events.id AND invitee_id = auth.uid() AND status = 'accepted'
                ))
            )
        )
    );

CREATE POLICY "Users can update their own participation"
    ON event_participants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove themselves from events"
    ON event_participants FOR DELETE
    USING (auth.uid() = user_id);

-- Event invitations policies
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see invitations they've sent or received"
    ON event_invitations FOR SELECT
    USING (
        auth.uid() = inviter_id OR
        auth.uid() = invitee_id
    );

CREATE POLICY "Users can send invitations for events they created or participate in"
    ON event_invitations FOR INSERT
    WITH CHECK (
        auth.uid() = inviter_id AND (
            EXISTS (
                SELECT 1 FROM events
                WHERE id = event_id AND creator_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM event_participants
                WHERE event_id = event_invitations.event_id AND user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Invitees can update their invitation status"
    ON event_invitations FOR UPDATE
    USING (auth.uid() = invitee_id);

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Add function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, username, created_at)
    VALUES (new.id, new.email, '', '', new.email, now());
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--------------------------------------------------------------------------------
-- Create Indexes
--------------------------------------------------------------------------------

-- Course indexes
CREATE INDEX idx_golf_courses_location ON golf_courses(city, state);
CREATE INDEX idx_golf_courses_price ON golf_courses(price_range);
CREATE INDEX idx_golf_courses_type ON golf_courses(course_type);
CREATE INDEX idx_golf_courses_geo ON golf_courses USING GIST(geo_location);
CREATE INDEX idx_course_media_course ON course_media(course_id);
CREATE INDEX idx_course_holes_course ON course_holes(course_id);

-- Social indexes
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_created ON user_activities(created_at);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Performance tracking indexes
CREATE INDEX idx_check_ins_user ON check_ins(user_id);
CREATE INDEX idx_check_ins_course ON check_ins(course_id);
CREATE INDEX idx_check_ins_time ON check_ins(check_in_time);
CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX idx_review_photos_review ON review_photos(review_id);
CREATE INDEX idx_score_cards_user ON score_cards(user_id);
CREATE INDEX idx_score_cards_course ON score_cards(course_id);
CREATE INDEX idx_score_cards_date ON score_cards(play_date);
CREATE INDEX idx_score_card_details_card ON score_card_details(score_card_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- News and events indexes
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_published ON news_articles(published_date);
CREATE INDEX idx_news_articles_featured ON news_articles(is_featured);
CREATE INDEX idx_news_categories_parent ON news_categories(parent_category_id);
CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_entity ON user_bookmarks(entity_type, entity_id);
CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_course ON events(course_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);
CREATE INDEX idx_event_invitations_event ON event_invitations(event_id);
CREATE INDEX idx_event_invitations_invitee ON event_invitations(invitee_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_read ON notifications(is_read); 