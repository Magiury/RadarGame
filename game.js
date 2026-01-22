const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");
const info = document.getElementById("trackInfo");

const tracks = [];
let selectedTrack = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

class Track {
  constructor() {
    this.x = rand(0, 600);
    this.y = rand(0, 600);
    this.vx = rand(-0.3, 0.3);
    this.vy = rand(-0.3, 0.3);

    this.altitude = rand(8000, 36000);
    this.speed = rand(200, 550);

    this.trueType = Math.random() < 0.7 ? "CIVILIAN" : "MILITARY";
    this.transponder = this.trueType === "CIVILIAN";

    this.confidence = rand(20, 50);
    this.ew = this.trueType === "MILITARY" ? rand(0, 1) : 0;
    this.visible = true;
  }

  update() {
    // Movement
    this.x += this.vx;
    this.y += this.vy;

    // Wrap
    this.x = (this.x + 600) % 600;
    this.y = (this.y + 600) % 600;

    // EW effects
    if (this.ew > 0 && Math.random() < 0.02) {
      this.visible = false;
      setTimeout(() => this.visible = true, rand(500, 1500));
    }

    // Confidence logic
    let delta = 0;
    delta += this.transponder ? 0.05 : -0.1;
    delta += Math.abs(this.vx) < 0.2 ? 0.03 : -0.05;
    delta -= this.ew * 0.1;

    this.confidence += delta;
    this.confidence = Math.max(0, Math.min(this.confidence, this.trueType === "MILITARY" ? 70 : 100));
  }

  draw() {
    if (!this.visible) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#7fdcff";
    ctx.fill();
  }
}

// Spawn initial tracks
for (let i = 0; i < 8; i++) {
  tracks.push(new Track());
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  selectedTrack = tracks.find(t =>
    Math.hypot(t.x - mx, t.y - my) < 6
  );
});

function draw() {
  ctx.clearRect(0, 0, 600, 600);

  // Radar sweep
  ctx.strokeStyle = "#0a2a3a";
  for (let r = 50; r <= 300; r += 50) {
    ctx.beginPath();
    ctx.arc(300, 300, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  tracks.forEach(t => {
    t.update();
    t.draw();
  });

  if (selectedTrack) {
    info.innerHTML = `
      Altitude: ${selectedTrack.visible ? selectedTrack.altitude.toFixed(0) : "—"} ft<br>
      Speed: ${selectedTrack.visible ? selectedTrack.speed.toFixed(0) : "—"} kts<br>
      Transponder: ${selectedTrack.transponder ? "ON" : "OFF"}<br>
      Identification Confidence: ${selectedTrack.confidence.toFixed(1)}%
    `;
  }

  requestAnimationFrame(draw);
}

draw();
