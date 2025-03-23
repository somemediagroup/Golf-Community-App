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

-- Set up RLS policies

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

-- Create indexes
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