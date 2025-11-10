# PWA Icons TODO

The PWA manifest file (`public/manifest.json`) references several icon sizes that need to be created:

## Required Icon Sizes
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Icon Location
All icons should be placed in: `public/icons/`

## Icon Format
- Format: PNG
- Purpose: any maskable
- Content: OPT Plus logo with transparent or colored background
- Design: Simple, recognizable icon suitable for app icon

## How to Generate Icons
You can use tools like:
- **Online:** https://realfavicongenerator.net/
- **CLI:** `npm install -g pwa-asset-generator`
- **Design Tools:** Figma, Adobe Illustrator, or Canva

## Temporary Placeholder
For development, you can create a simple colored square PNG in each size with the text "OPT+" using any image editor.

## Screenshot Placeholders
Also needed (optional for MVP):
- `public/screenshots/dashboard.png` (1280x720)
- `public/screenshots/mobile-measurement.png` (750x1334)
