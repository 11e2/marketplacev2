const sharp = require("sharp");

const svgContent = `
<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="100" rx="16" fill="white" fill-opacity="0.75"/>
  <rect x="2" y="2" width="396" height="96" rx="14" fill="none" stroke="#6C5CE7" stroke-width="2" stroke-opacity="0.5"/>
  <circle cx="50" cy="50" r="8" fill="#6C5CE7" fill-opacity="0.8"/>
  <polygon points="50,38 53,46 62,46 55,51 58,60 50,54 42,60 45,51 38,46 47,46" fill="#6C5CE7" fill-opacity="0.9"/>
  <text x="210" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#6C5CE7" text-anchor="middle">BRAND DEMO</text>
</svg>
`;

sharp(Buffer.from(svgContent))
  .png()
  .toFile("public/demo-overlay.png")
  .then(() => console.log("Demo overlay created: public/demo-overlay.png"))
  .catch(console.error);
