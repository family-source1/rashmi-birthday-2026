// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== COUNTDOWN =====
const cdDays  = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins  = document.getElementById('cd-mins');
const cdSecs  = document.getElementById('cd-secs');
const TARGET  = new Date('2026-10-25T00:00:00').getTime();
let birthdayFired = false;

function updateCountdown() {
  const diff = TARGET - Date.now();
  if (diff <= 0) {
    document.getElementById('countdown').style.display = 'none';
    document.getElementById('bday-msg').style.display  = 'block';
    if (!birthdayFired) {
      birthdayFired = true;
      launchConfetti(document.getElementById('confettiCanvas'));
    }
    return;
  }
  cdDays.textContent  = String(Math.floor(diff / 86400000)).padStart(2, '0');
  cdHours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  cdMins.textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  cdSecs.textContent  = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== FLIP CARDS =====
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// ===== FLOATING PETALS =====
(function () {
  const canvas = document.getElementById('petalCanvas');
  const ctx    = canvas.getContext('2d');
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const MAX_PARTICLES = isMobile ? 8 : 14;
  const emojis = ['🌻', '🌸', '✨', '💛', '🌼'];
  let particles = [];
  let paused = false;
  let rafId = null;
  let frameCount = 0;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && !rafId) rafId = requestAnimationFrame(animate);
  });

  function spawn() {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     -40,
      size:  Math.random() * 12 + 10,
      speed: Math.random() * 0.6 + 0.3,
      drift: (Math.random() - 0.5) * 0.5,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.015,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      alpha: Math.random() * 0.35 + 0.25,
      font:  ''
    });
    const p = particles[particles.length - 1];
    p.font = `${Math.round(p.size)}px serif`;
  }

  function animate() {
    rafId = null;
    if (paused) return;

    // Run at ~30fps by skipping every other frame on mobile
    frameCount++;
    if (isMobile && frameCount % 2 !== 0) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Iterate backwards so splice doesn't skip elements
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y   += p.speed;
      p.x   += p.drift;
      p.rot += p.rotV;
      if (p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = p.font;
      ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
      ctx.restore();
    }

    if (particles.length < MAX_PARTICLES && Math.random() < 0.03) spawn();

    rafId = requestAnimationFrame(animate);
  }
  rafId = requestAnimationFrame(animate);
})();

// ===== SPARKLE CURSOR TRAIL (desktop only) =====
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const container = document.getElementById('sparkleContainer');
  const MAX_SPARKLES = 12;
  let pendingX = null, pendingY = null, rafPending = false;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkFade {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-80%) scale(0); }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('mousemove', (e) => {
    pendingX = e.clientX;
    pendingY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(createSparkle);
    }
  });

  function createSparkle() {
    rafPending = false;
    if (container.childElementCount >= MAX_SPARKLES) return;
    const s = document.createElement('div');
    s.style.cssText = `
      position:fixed;left:${pendingX}px;top:${pendingY}px;
      width:7px;height:7px;border-radius:50%;
      background:radial-gradient(circle,#ffd000,#ff9800);
      pointer-events:none;animation:sparkFade 0.6s forwards;
    `;
    container.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }
})();

// ===== MOBILE HEART TAP =====
(function () {
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  const MAX_HEARTS = 4;
  let activeHearts = 0;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatHeart {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-110px) scale(1.4); }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('click', (e) => {
    if (activeHearts >= MAX_HEARTS) return;
    activeHearts++;
    const heart = document.createElement('div');
    heart.textContent = '💛';
    heart.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      font-size:1.8rem;pointer-events:none;z-index:9999;
      animation:floatHeart 1s forwards;
    `;
    document.body.appendChild(heart);
    setTimeout(() => { heart.remove(); activeHearts--; }, 1000);
  });
})();

// ===== CONFETTI =====
function launchConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth  || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;

  const colors = ['#ffd000','#ff9800','#c0392b','#fff8e1','#7b3f00','#ffe082'];
  const emojiShapes = ['🌻','💛','✨'];

  // Fewer pieces, fewer emoji (emoji are slow to draw)
  const pieces = Array.from({ length: 80 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height - canvas.height,
    vx:    (Math.random() - 0.5) * 3.5,
    vy:    Math.random() * 2.5 + 1.5,
    rot:   Math.random() * 360,
    rotV:  (Math.random() - 0.5) * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    size:  Math.random() * 9 + 5,
    // Only ~25% are emoji to keep rendering fast
    emoji: Math.random() > 0.75 ? emojiShapes[Math.floor(Math.random() * emojiShapes.length)] : null,
  }));

  let frames = 0;
  let rafId = null;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      p.vy  += 0.04;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      if (p.emoji) {
        ctx.font = `${p.size * 1.4}px serif`;
        ctx.globalAlpha = 0.9;
        ctx.fillText(p.emoji, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      }
      ctx.restore();
    }
    frames++;
    if (frames < 180 && !document.hidden) {
      rafId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (rafId) cancelAnimationFrame(rafId);
    }
  }
  draw();
}

document.getElementById('confettiBtn').addEventListener('click', () => {
  launchConfetti(document.getElementById('confettiCanvas'));
});
