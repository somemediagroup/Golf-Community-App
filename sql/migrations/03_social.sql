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

-- Set up RLS policies

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

-- Create indexes
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