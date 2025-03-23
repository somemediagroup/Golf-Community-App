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

-- Set up RLS policies

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

-- Create indexes
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