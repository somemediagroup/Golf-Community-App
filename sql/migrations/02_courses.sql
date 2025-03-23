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

-- Set up RLS policies for courses
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

-- Set up RLS policies for course media
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

-- Set up RLS policies for course holes
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

-- Create indexes
CREATE INDEX idx_golf_courses_location ON golf_courses(city, state);
CREATE INDEX idx_golf_courses_price ON golf_courses(price_range);
CREATE INDEX idx_golf_courses_type ON golf_courses(course_type);
CREATE INDEX idx_golf_courses_geo ON golf_courses USING GIST(geo_location);
CREATE INDEX idx_course_media_course ON course_media(course_id);
CREATE INDEX idx_course_holes_course ON course_holes(course_id); 