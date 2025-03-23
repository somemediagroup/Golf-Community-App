// Setup test user in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://afnjampjswjkgaewybji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbmphbXBqc3dqa2dhZXd5YmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NjY2NTcsImV4cCI6MjA1ODI0MjY1N30.NHeyE9XsNwfcU-X1EipJDxUGcCFG4V0R8ocX-O0SQm4';

// Create a single supabase client for interacting with the database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser() {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: 'john.smith@example.com',
      password: 'password123',
    });

    if (existingUser.user) {
      console.log('Test user already exists');
      return;
    }

    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email: 'john.smith@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'John',
          last_name: 'Smith',
        },
      },
    });

    if (error) {
      throw error;
    }

    console.log('Test user created:', data.user);

    // Create profile if user was created
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: 'John',
          last_name: 'Smith',
          username: 'johnsmith',
          email: 'john.smith@example.com',
          handicap: 12.5,
          bio: 'Golf enthusiast with 10 years of experience. Love playing on challenging courses.',
          location: 'Boston, MA',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('Profile created for test user');
      }
    }

    // Also create a second test user
    const { data: data2, error: error2 } = await supabase.auth.signUp({
      email: 'emma.johnson@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Emma',
          last_name: 'Johnson',
        },
      },
    });

    if (error2) {
      console.error('Error creating second test user:', error2);
    } else {
      console.log('Second test user created:', data2.user);

      // Create profile if user was created
      if (data2.user) {
        const { error: profileError2 } = await supabase
          .from('profiles')
          .insert({
            id: data2.user.id,
            first_name: 'Emma',
            last_name: 'Johnson',
            username: 'emmaj',
            email: 'emma.johnson@example.com',
            handicap: 8.2,
            bio: 'Professional golfer with a passion for teaching others. 5-time club champion.',
            location: 'San Diego, CA',
          });

        if (profileError2) {
          console.error('Error creating second profile:', profileError2);
        } else {
          console.log('Profile created for second test user');
        }
      }
    }
  } catch (error) {
    console.error('Error setting up test users:', error);
  }
}

// Run the function
createTestUser(); 