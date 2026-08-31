const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Bump versions to v=10
html = html.replace(/v=\d+/g, 'v=10');

// 2. Add hero-fallback
if (!html.includes('class="hero-fallback"')) {
    html = html.replace(/<canvas class="hero-gl" id="heroGL"><\/canvas>/, 
        '<div class="hero-fallback"></div>\n        <canvas class="hero-gl" id="heroGL"></canvas>');
}

// 3. Add .lead to paragraphs inside hero scenes
const scenes = ['s1', 's2', 's3', 's4', 's5'];
scenes.forEach(s => {
    const sRegex = new RegExp(`(<div class="hero-s ${s}[^>]*>[\\s\\S]*?<p)(>[\\s\\S]*?<\\/div>)`, 'g');
    html = html.replace(sRegex, (match, p1, p2) => {
        // Only replace the main description paragraph, not the eyebrow which has class="eyebrow"
        return match.replace(/<p(?! class="eyebrow")>/g, '<p class="lead">');
    });
});

// 4. Pre-populate floor indicator
if (html.includes('<ul id="floorReel"></ul>')) {
    html = html.replace('<ul id="floorReel"></ul>', 
        '<ul id="floorReel"><li>G</li><li>01</li><li>02</li><li>03</li><li>04</li><li>05</li><li>06</li></ul>');
} else if (html.includes('<ul id="floorReel">')) {
    // Replace whatever is inside
    html = html.replace(/<ul id="floorReel">[\s\S]*?<\/ul>/, 
        '<ul id="floorReel"><li>G</li><li>01</li><li>02</li><li>03</li><li>04</li><li>05</li><li>06</li></ul>');
}

fs.writeFileSync('index.html', html);
console.log('index.html patched for v10');
