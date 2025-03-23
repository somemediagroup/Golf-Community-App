import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const SUPABASE_URL = 'https://kfszldwebviuvipihcwh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3psZHdlYnZpdXZpcGloY3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjY2NjM2NSwiZXhwIjoyMDU4MjQyMzY1fQ.CRUKsI0KoWkrpc0SlbTzSQJxOGipuCB7oJPVFxRABqE';

// Create a supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync('./schema.sql', 'utf8');
    
    // Split the SQL into separate statements
    const statements = schemaSQL
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.slice(0, 50)}...`);
        const { error } = await supabase.rpc('pgaudit.exec_sql', { query: statement });
        
        if (error) {
          console.error(`Error executing statement: ${error.message}`);
        }
      } catch (err) {
        console.error(`Error executing statement: ${err.message}`);
      }
    }
    
    console.log('Database setup completed successfully');
    
    // Now insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample data...');
    
    // Sample golf courses
    const courses = [
      {
        name: 'Pine Valley Golf Club',
        description: 'Consistently ranked as one of the top courses in the world, Pine Valley offers a challenging experience through pine barrens and sandy areas.',
        location: 'Pine Valley, NJ',
        address: '1 E Atlantic Ave',
        city: 'Pine Valley',
        state: 'NJ',
        zip: '08021',
        country: 'USA',
        website: 'https://www.pinevalleygolfclub.com',
        phone: '(856) 783-3000',
        image_url: 'https://golf-pass.brightspotcdn.com/dims4/default/3f5a2d7/2147483647/strip/true/crop/1440x920+0+0/resize/930x594!/quality/90/?url=https%3A%2F%2Fgolf-pass-brightspot.s3.amazonaws.com%2Ff8%2F94%2Fc5acdeef1dd9152d56c9d4ccc283%2F38502.jpg',
        price_range: '$$$$$',
        difficulty: 'Pro',
        holes: 18,
        course_type: 'Private',
        par: 72,
        length_yards: 7181
      },
      {
        name: 'Pebble Beach Golf Links',
        description: 'One of the most beautiful courses in the world, featuring dramatic coastal views and challenging play.',
        location: 'Pebble Beach, CA',
        address: '1700 17-Mile Drive',
        city: 'Pebble Beach',
        state: 'CA',
        zip: '93953',
        country: 'USA',
        website: 'https://www.pebblebeach.com',
        phone: '(800) 654-9300',
        image_url: 'https://www.pebblebeach.com/content/uploads/PB7-1920x1114-1.jpg',
        price_range: '$$$$$',
        difficulty: 'Challenging',
        holes: 18,
        course_type: 'Resort',
        par: 72,
        length_yards: 7075
      },
      {
        name: 'St. Andrews Links (Old Course)',
        description: 'Known worldwide as the "Home of Golf" and the oldest golf course in the world.',
        location: 'St Andrews, Scotland',
        address: 'St Andrews',
        city: 'St Andrews',
        state: 'Fife',
        zip: 'KY16 9JD',
        country: 'Scotland',
        website: 'https://www.standrews.com',
        phone: '+44 1334 466666',
        image_url: 'https://www.standrews.com/media/pz4hdnks/the-old-course.jpg',
        price_range: '$$$$',
        difficulty: 'Moderate',
        holes: 18,
        course_type: 'Public',
        par: 72,
        length_yards: 6721
      },
      {
        name: 'Augusta National Golf Club',
        description: 'Home of the Masters Tournament, Augusta National is known for its beauty and perfectly manicured conditions.',
        location: 'Augusta, GA',
        address: '2604 Washington Rd',
        city: 'Augusta',
        state: 'GA',
        zip: '30904',
        country: 'USA',
        website: 'https://www.augusta.com',
        phone: '(706) 667-6000',
        image_url: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2020/08/AugustaHedge.jpg.rend.hgtvcom.1280.853.suffix/1596803763211.jpeg',
        price_range: '$$$$$',
        difficulty: 'Pro',
        holes: 18,
        course_type: 'Private',
        par: 72,
        length_yards: 7435
      },
      {
        name: 'Oakmont Country Club',
        description: 'Known for its challenging greens and bunkers, Oakmont has hosted more U.S. Opens than any other course.',
        location: 'Oakmont, PA',
        address: '1233 Hulton Rd',
        city: 'Oakmont',
        state: 'PA',
        zip: '15139',
        country: 'USA',
        website: 'https://www.oakmont-countryclub.org',
        phone: '(412) 828-8000',
        image_url: 'https://www.golfdigest.com/content/dam/images/golfdigest/fullset/2018/02/5a8f2cb5a3066628018b53d2_18_Oakmont-Church-Pews.jpg',
        price_range: '$$$$',
        difficulty: 'Challenging',
        holes: 18,
        course_type: 'Private',
        par: 71,
        length_yards: 7255
      }
    ];
    
    // Insert courses
    for (const course of courses) {
      const { error } = await supabase
        .from('courses')
        .upsert(course, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error inserting course ${course.name}: ${error.message}`);
      } else {
        console.log(`Inserted course: ${course.name}`);
      }
    }
    
    // Sample news articles
    const newsArticles = [
      {
        title: 'Scottie Scheffler Wins Second Masters Title',
        excerpt: 'Scottie Scheffler claimed his second green jacket with a dominant performance at Augusta National.',
        content: 'World number one Scottie Scheffler produced a masterclass final round to win his second Masters title. Scheffler, who also won in 2022, carded a final-round 68 to finish at 11-under par, four shots clear of his nearest competitor. The victory cements his position at the top of world golf and adds another major championship to his growing collection.',
        author: 'James Corrigan',
        author_title: 'Golf Correspondent',
        category: 'Tournaments',
        publish_date: new Date(),
        read_time: '3 min',
        image_url: 'https://i.guim.co.uk/img/media/d55a1ebf6a72a79d9e77ab2a09ae7025a66b56c5/0_98_5107_3064/master/5107.jpg?width=620&quality=45&auto=format&fit=max&dpr=2&s=d39913f395f3c8caf23f883c21393231',
        source: 'Golf Digest',
        source_url: 'https://www.golfdigest.com',
        featured: true
      },
      {
        title: 'New Golf Technology Set to Revolutionize the Game',
        excerpt: 'Cutting-edge launch monitors and AI coaching are making professional-level analysis accessible to all golfers.',
        content: 'The latest wave of golf technology is bridging the gap between amateurs and professionals. Affordable launch monitors like the Garmin Approach R10 and Rapsodo MLM2PRO are bringing professional-level swing analysis to everyday golfers. Meanwhile, AI-powered coaching apps can now provide instant feedback on your swing using just your smartphone\'s camera. These technological advancements are democratizing access to high-quality instruction and helping golfers of all levels improve their game more efficiently.',
        author: 'Kellie Stenzel',
        author_title: 'Technology Editor',
        category: 'Equipment',
        publish_date: new Date(),
        read_time: '5 min',
        image_url: 'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fwp-content%2Fblogs.dir%2F6%2Ffiles%2F2021%2F08%2Fgarmin-approach-r10-launch-monitor-golf-simulator-1.jpg?fit=max&cbr=1&q=90&w=750&h=500',
        source: 'Golf Monthly',
        source_url: 'https://www.golfmonthly.com',
        featured: false
      },
      {
        title: 'Top 10 Public Golf Courses You Must Play in 2025',
        excerpt: 'From coastal gems to desert masterpieces, these accessible courses offer world-class experiences.',
        content: 'While private clubs often dominate world rankings, there are plenty of extraordinary public courses offering unforgettable experiences. Pebble Beach Golf Links tops our list with its stunning coastal views and challenging layout. Pinehurst No. 2, host of multiple U.S. Opens, offers a masterclass in strategic design. TPC Sawgrass, with its iconic island green 17th hole, presents a test worthy of the best players in the world. Rounding out the top five are Bethpage Black, known for its difficulty, and Whistling Straits, with its spectacular Lake Michigan views. Whether you\'re planning a golf trip or building your bucket list, these courses deserve your attention.',
        author: 'Matt Ginella',
        author_title: 'Travel Editor',
        category: 'Travel',
        publish_date: new Date(),
        read_time: '7 min',
        image_url: 'https://golfweek.usatoday.com/wp-content/uploads/sites/87/2018/10/636155210215178721-pebblebeach-7.jpg',
        source: 'Golf Magazine',
        source_url: 'https://golf.com',
        featured: true
      }
    ];
    
    // Insert news articles
    for (const article of newsArticles) {
      const { error } = await supabase
        .from('news_articles')
        .upsert(article, { onConflict: 'title' });
      
      if (error) {
        console.error(`Error inserting article ${article.title}: ${error.message}`);
      } else {
        console.log(`Inserted article: ${article.title}`);
      }
    }
    
    // Sample golf tips
    const golfTips = [
      {
        title: 'Perfecting Your Grip: The Foundation of a Good Swing',
        excerpt: 'Learn how a proper grip can dramatically improve your ball striking and consistency.',
        category: 'Fundamentals',
        author: 'Butch Harmon',
        author_avatar: 'https://www.golfdigest.com/content/dam/images/golfdigest/fullset/2018/09/12/5b9973722c3e61584f8dc75f_butch-harmon.png',
        image_url: 'https://www.golfdigest.com/content/dam/images/golfdigest/fullset/2023/1/HOW-TO-GRIP-IT-TIGER-WOODS.png',
        content: 'The grip is your only connection to the golf club, making it perhaps the most fundamental aspect of your swing. Start by placing the club in your fingers, not your palm. For a neutral grip, you should see two knuckles on your left hand (for right-handed golfers) when looking down. Your right hand should complement your left, with the V between your thumb and index finger pointing toward your right shoulder. Common mistakes include gripping too tightly, which restricts wrist hinge, or too weakly, which can lead to inconsistent face control. Practice your grip regularly, even without hitting balls, to build muscle memory.'
      },
      {
        title: 'Three Keys to Better Putting Under Pressure',
        excerpt: 'Simple techniques to keep your putting stroke smooth when the stakes are high.',
        category: 'Putting',
        author: 'Dave Stockton',
        author_avatar: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2020/07/dave-stockton.jpg.rend.hgtvcom.966.644.suffix/1596027634377.jpeg',
        image_url: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2020/09/rory-mcilroy-putting-2020-bmw.jpg.rend.hgtvcom.1280.914.suffix/1599742744362.jpeg',
        content: '1. Simplify your pre-putt routine: Under pressure, stick to a consistent, simple routine. I recommend looking at the hole, looking at the ball, and making a smooth stroke without delay.\n\n2. Focus on tempo, not mechanics: When nerves kick in, thinking about mechanics often makes things worse. Instead, focus on maintaining an even tempo in your stroke—back and through at the same pace.\n\n3. Commit to a line and speed: Indecision is a killer under pressure. Once you've read the putt, fully commit to your line and speed. A confident stroke with full commitment on a slightly misread line is often better than a tentative stroke on the perfect line.'
      },
      {
        title: 'How to Add 20 Yards to Your Drives',
        excerpt: 'Practical tips to increase your driving distance without swinging harder.',
        category: 'Distance',
        author: 'Mike Austin',
        author_avatar: 'https://www.golfchannel.com/sites/default/files/2019/01/09/graves_970_mayers_distance.jpg',
        image_url: 'https://www.golfdigest.com/content/dam/images/golfdigest/fullset/2021/Cameron%20Champ%20driver.jpg',
        content: 'Adding distance isn't just about swinging harder—it's about swinging smarter. Start by optimizing your driver: make sure you're using a loft that maximizes your distance based on your swing speed. Most amateurs play too little loft.\n\nNext, focus on creating width in your backswing by extending your arms away from your body, which increases your arc and potential for speed. At impact, concentrate on hitting up on the ball (positive attack angle), which can add significant distance with the same swing speed.\n\nFinally, work on your weight transfer. A proper shift from your back foot to your front foot throughout the swing will help you use ground forces to generate more power. Practice these elements separately before combining them, and you'll see distance gains without feeling like you're swinging out of your shoes.'
      }
    ];
    
    // Insert golf tips
    for (const tip of golfTips) {
      const { error } = await supabase
        .from('golf_tips')
        .upsert(tip, { onConflict: 'title' });
      
      if (error) {
        console.error(`Error inserting tip ${tip.title}: ${error.message}`);
      } else {
        console.log(`Inserted tip: ${tip.title}`);
      }
    }
    
    // Sample tournaments
    const tournaments = [
      {
        name: 'The Masters',
        location: 'Augusta National Golf Club, Augusta, GA',
        start_date: new Date('2025-04-10'),
        end_date: new Date('2025-04-13'),
        image_url: 'https://e0.365dm.com/22/04/2048x1152/skysports-masters-augusta_5735256.jpg',
        prize: '$20,000,000',
        featured: true,
        leaderboard: JSON.stringify({
          leaders: [
            { position: 1, player: 'Scottie Scheffler', score: -10, today: -3 },
            { position: 2, player: 'Rory McIlroy', score: -7, today: -5 },
            { position: 3, player: 'Cameron Smith', score: -6, today: -2 },
            { position: 'T4', player: 'Shane Lowry', score: -5, today: -1 },
            { position: 'T4', player: 'Collin Morikawa', score: -5, today: -2 }
          ]
        })
      },
      {
        name: 'U.S. Open',
        location: 'Pinehurst No. 2, Pinehurst, NC',
        start_date: new Date('2025-06-12'),
        end_date: new Date('2025-06-15'),
        image_url: 'https://usga.org/content/dam/usga/images/championships/2022/us-open/the-country-club/grounds/220526-tcc-drone-14-beauty2.jpg',
        prize: '$20,000,000',
        featured: false,
        leaderboard: null
      },
      {
        name: 'The Open Championship',
        location: 'Royal Portrush Golf Club, Northern Ireland',
        start_date: new Date('2025-07-17'),
        end_date: new Date('2025-07-20'),
        image_url: 'https://www.sportingnews.com/us/golf-news/royaltroon/18th-hole-royal-troon-open-championship-bvi4zmabubq31k6z7yc7w62m.jpg',
        prize: '$19,000,000',
        featured: false,
        leaderboard: null
      }
    ];
    
    // Insert tournaments
    for (const tournament of tournaments) {
      const { error } = await supabase
        .from('tournaments')
        .upsert(tournament, { onConflict: 'name' });
      
      if (error) {
        console.error(`Error inserting tournament ${tournament.name}: ${error.message}`);
      } else {
        console.log(`Inserted tournament: ${tournament.name}`);
      }
    }
    
    console.log('Sample data insertion completed');
    
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('Database setup process completed');
}); 