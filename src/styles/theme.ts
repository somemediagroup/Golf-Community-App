// Golf Community App Color Palette
// A tailwind-compatible color theme with golf-inspired colors

export const theme = {
  colors: {
    // Main accent color - pale green like fresh golf course grass
    primary: {
      50: '#f0f9f0',
      100: '#dcf0dc',
      200: '#bce3bc',
      300: '#94d294',
      400: '#6aba6a',
      500: '#4c9e4c', // Main brand color
      600: '#3f8c3f',
      700: '#377137',
      800: '#305930',
      900: '#294a29',
      950: '#132a13',
    },
    
    // Sand trap / bunker colors
    sand: {
      50: '#fbf9f1',
      100: '#f6f0dc',
      200: '#efe2be',
      300: '#e5ce96',
      400: '#d9b668',
      500: '#cfa147',
      600: '#b78235',
      700: '#94652d',
      800: '#7a5229',
      900: '#644526',
      950: '#382513',
    },
    
    // Water hazard blues
    water: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#b9e6fe',
      300: '#7cd4fd',
      400: '#36bffa',
      500: '#0ca5e9',
      600: '#0284c7',
      700: '#036ba1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    
    // Course green/brown for fairways
    fairway: {
      50: '#f7f9f1',
      100: '#ecf0dc',
      200: '#d9e3bc',
      300: '#c0d294',
      400: '#a7be72',
      500: '#8ea64f',
      600: '#75883d',
      700: '#5c6a31',
      800: '#4b562c',
      900: '#404828',
      950: '#212713',
    },
    
    // Score colors
    score: {
      // Birdie or better (good)
      good: '#4ade80',  // Green
      // Par (neutral)
      par: '#facc15',   // Yellow
      // Bogey or worse (bad)
      bad: '#f87171',   // Red
    },
  },
  
  // Border radius for rounded elements
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Font families
  fontFamily: {
    // Modern sans-serif for most text
    sans: ['Inter', 'sans-serif'],
    // Classic serif for headings
    serif: ['Playfair Display', 'serif'],
    // Monospace for scores and statistics
    mono: ['Source Code Pro', 'monospace'],
  },
  
  // Shadow styles
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
};

export default theme; 