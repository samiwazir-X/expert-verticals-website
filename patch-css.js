const fs = require('fs');
let css = fs.readFileSync('css/main.css', 'utf8');

// Update heights
css = css.replace(/\.hero-track \{\n  height: 380vh;/, ".hero-track {\n  height: 420vh;");
css = css.replace(/@media\(max-width: 768px\) \{\n  \.hero-track \{\n    height: 320vh;\n  \}/, "@media(max-width: 768px) {\n  .hero-track {\n    height: 280vh;\n  }"); // Mobile track height to ~280vh

// Wait, tablet should be 320vh, mobile 240-280vh. Let's make mobile max-width: 480px be 260vh.
css += `
@media(max-width: 480px) {
  .hero-track { height: 260vh; }
}
`;

// Update gradients
// Currently `.hero-scrim` might exist. Let's check it.
