const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG content
const svgContent = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#0A0E14"/>
  <circle cx="256" cy="256" r="180" fill="url(#grad)" opacity="0.2"/>
  <path d="M 256 150 L 350 350 L 162 350 Z" fill="url(#grad)" opacity="0.8"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#10B981" text-anchor="middle">V</text>
</svg>
`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error);
    }
  }
  
  console.log('All icons generated successfully!');
}

generateIcons();
