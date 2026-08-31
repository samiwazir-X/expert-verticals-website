const fs = require('fs');
let css = fs.readFileSync('css/main.css', 'utf8');

if (!css.includes('.hero-btns')) {
  css += `
.hero-btns {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.hero-btns .btn {
  padding: 12px 24px;
  font-weight: 500;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}
.hero-btns .btn-red {
  background: var(--red);
  color: #fff;
}
.hero-btns .btn-red:hover {
  background: #c3181f;
}
.hero-btns .btn-out {
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
}
.hero-btns .btn-out:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.4);
}
@media(max-width: 480px) {
  .hero-btns { flex-direction: column; width: 100%; gap: 12px; }
  .hero-btns .btn { width: 100%; text-align: center; }
}
`;
  fs.writeFileSync('css/main.css', css);
  console.log('Added .hero-btns to css/main.css');
}
