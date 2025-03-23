# Golf Community App Component Library

## Overview

This document outlines the component library and design system for the Golf Community App. All UI components should follow these guidelines to maintain consistency across the application.

## Color System

The Golf Community App uses a simple, elegant color palette inspired by golf courses and natural elements:

| Color Name    | Hex       | Usage                                        |
|---------------|-----------|----------------------------------------------|
| Black         | #1F1E1F   | Text, headings, and high-contrast elements   |
| White         | #FBFCFB   | Backgrounds and light elements               |
| Muted Green   | #448460   | Primary actions, logos, and accents          |

### Usage in Components

- **Text**: Use Black (#1F1E1F) for all body text and headings to ensure readability
- **Backgrounds**: Use White (#FBFCFB) as the primary background color
- **Accents & CTAs**: Use Muted Green (#448460) for buttons, links, and accent elements

## Typography

The application uses a clean, modern typography system:

- **Headings**: Inter (Sans-serif), font weights 600-700
- **Body**: Inter (Sans-serif), font weights 400-500
- **UI Elements**: Inter (Sans-serif), font weights 400-600

## Component Categories

### Core UI Components

1. **Typography Components**
   - Headings (h1-h6)
   - Body text
   - Links

2. **Button Variants**
   - Primary (Muted Green background with White text)
   - Secondary (Black background with White text)
   - Outline (White background with border and Black text)
   - Ghost (Transparent background, reveals on hover)
   - Icon buttons

3. **Form Elements**
   - Text inputs
   - Selects/Dropdowns
   - Checkboxes and Radio buttons
   - Textareas
   - Date pickers

4. **Cards**
   - Standard content cards
   - Profile cards
   - Course cards
   - Feature cards

5. **Dialogs & Modals**
   - Standard dialogs
   - Confirmation dialogs
   - Form dialogs

### Layout Components

1. **Grid System**
   - Container
   - Row/Column layout components
   - Responsive breakpoints

2. **Navigation Components**
   - Header
   - Footer
   - Sidebar
   - Tabs
   - Breadcrumbs

3. **Feedback Components**
   - Toast notifications
   - Alert banners
   - Progress indicators
   - Skeletons for loading states

### Interactive Components

1. **Course Explorer Components**
   - Map components
   - Course listings
   - Filters

2. **Social Engagement Components**
   - Post cards
   - Comment sections
   - User profiles
   - Friend recommendations

3. **Performance Visualization**
   - Stat cards
   - Charts and graphs
   - Score tracking

## Accessibility Guidelines

All components must:
- Maintain a minimum contrast ratio of 4.5:1 for normal text
- Support keyboard navigation
- Include appropriate ARIA attributes when needed
- Be tested with screen readers

## Responsive Design

Components should adapt to different screen sizes:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px and above

## Implementation Notes

- Use Tailwind CSS for styling components
- Use the shadcn/ui component library as a foundation
- Customize components to match our design system
- Create reusable components for common patterns 