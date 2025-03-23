// This script downloads placeholder profile images for testimonials
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images/testimonials');

// Ensure the directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  console.log(`Creating directory: ${IMAGES_DIR}`);
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Define our testimonial profiles
const profiles = [
  {
    filename: 'michael.jpg',
    url: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Michael Johnson'
  },
  {
    filename: 'sarah.jpg',
    url: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sarah Thompson'
  },
  {
    filename: 'david.jpg',
    url: 'https://randomuser.me/api/portraits/men/68.jpg',
    name: 'David Rodriguez'
  }
];

// Download each image
profiles.forEach(profile => {
  const filePath = path.join(IMAGES_DIR, profile.filename);
  
  console.log(`Downloading ${profile.name}'s photo to ${filePath}...`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(profile.url, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`✅ Downloaded ${profile.filename}`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {}); // Delete the file if there was an error
    console.error(`❌ Error downloading ${profile.filename}: ${err.message}`);
  });
});

console.log('\nNOTE: These are placeholder images from randomuser.me.');
console.log('For production, replace them with appropriate photos that match your brand and testimonials.'); 