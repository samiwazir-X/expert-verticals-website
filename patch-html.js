const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const heroContent = `
        <div class="hero-s s1 on" id="hs1">
          <p class="eyebrow">Expert Verticals <b>/</b> Vertical Mobility</p>
          <h1>We Engineer<br>Movement<span class="rdot">.</span></h1>
          <p>Elevator, lift and vertical mobility solutions for builders, developers, corporations, institutions and public-sector projects.</p>
          <div class="hero-btns">
            <a href="#contact" class="btn btn-red">Request a Project Proposal</a>
            <a href="solutions.html" class="btn btn-out">Explore Our Solutions</a>
          </div>
        </div>

        <div class="hero-s s2" id="hs2">
          <p class="eyebrow">Scene 02 — Ascending</p>
          <h2>Built Around<br>Your Building.</h2>
          <p>Every shaft we coordinate begins with the building itself—its structure, its traffic and its people.</p>
        </div>

        <div class="hero-s s3" id="hs3">
          <p class="eyebrow">Scene 03 — Engineering</p>
          <h2>Details Drive<br>Reliability.</h2>
          <p>Guide rails, drives, controllers and door systems—precision between the floors is what passengers never see, and always feel.</p>
        </div>

        <div class="hero-s s4" id="hs4">
          <p class="eyebrow">Scene 04 — Environments</p>
          <h2>One System.<br>Many Environments.</h2>
          <p>Offices, hospitals, hotels, residences and factories—each building moves differently.</p>
        </div>

        <div class="hero-s s5" id="hs5">
          <p class="eyebrow">Destination</p>
          <h2>Let’s Move Your<br>Project Forward.</h2>
          <p>Tell us what needs to move—people, patients, goods or an entire building project.</p>
          <div class="hero-btns">
            <a href="#contact" class="btn btn-red">Request a Proposal</a>
            <a href="#bid" class="btn btn-out">Invite Us to Bid</a>
          </div>
        </div>
`;

// Replace everything inside <div class="hero-ui"> up to <!-- Elevator Floor Indicator -->
const startMarker = '<div class="hero-ui">';
const endMarker = '<!-- Elevator Floor Indicator -->';
const startIndex = html.indexOf(startMarker) + startMarker.length;
const endIndex = html.indexOf(endMarker);

html = html.substring(0, startIndex) + '\n' + heroContent + '\n      </div>\n\n      ' + html.substring(endIndex);

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
