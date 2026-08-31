const fs = require('fs');
let css = fs.readFileSync('css/main.css', 'utf8');

// 1. Add html, body overflow-x: clip
if (!css.includes('overflow-x: clip')) {
    css = css.replace(/body \{/, "html, body {\n  width: 100%;\n  max-width: 100%;\n  overflow-x: clip;\n}\nbody {");
}

// 2. Add hero-fallback styling
const fallbackCss = `
body.no3d .hero-fallback {
  display: block;
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    rgba(17,19,21,.96) 0%,
    rgba(17,19,21,.74) 38%,
    rgba(17,19,21,.10) 72%
  ), url("../assets/expert-verticals-elevator-hero.png");
  background-size: cover;
  background-position: 68% center;
  background-repeat: no-repeat;
}
@media (max-width: 767px) {
  body.no3d .hero-fallback {
    background-image: linear-gradient(
      0deg,
      rgba(17,19,21,.96) 0%,
      rgba(17,19,21,.74) 45%,
      rgba(17,19,21,.10) 80%
    ), url("../assets/expert-verticals-elevator-hero.png");
    background-position: 66% center;
  }
}
.hero-fallback { display: none; }
`;
if (!css.includes('.hero-fallback')) {
    css += fallbackCss;
}

// 3. Add .hero-s > p.lead rules
const pLeadCss = `
.hero-s > p.lead {
  color: #d8dcdf;
  font-size: clamp(1rem, 1.35vw, 1.15rem);
  max-width: 48ch;
  line-height: 1.6;
}
@media (max-width: 767px) {
  .hero-s > p.lead {
    color: #c9ced2;
    font-size: 0.9rem;
    line-height: 1.48;
  }
}
`;
if (!css.includes('.hero-s > p.lead')) {
    css += pLeadCss;
}

// 4. Repair Mobile Layout (.hero-s)
// Remove existing mobile .hero-s rules if they rely on missing containers
css = css.replace(/@media \(max-width: 768px\) \{[\s\S]*?\.hero-s\s*\{[\s\S]*?left:\s*0;[\s\S]*?width:\s*100%;[\s\S]*?\}/g, (match) => {
    return match; // Leave it for now, we will override it securely
});

const mobileHeroSCss = `
@media (max-width: 767px) {
  .hero-s {
    left: 0;
    right: 0;
    width: 100%;
    padding-inline: 18px !important;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px)) !important;
    bottom: 2rem !important;
  }
}
`;
if (!css.includes('padding-inline: 18px !important;')) {
    css += mobileHeroSCss;
}

fs.writeFileSync('css/main.css', css);
console.log('css/main.css patched for v10');
