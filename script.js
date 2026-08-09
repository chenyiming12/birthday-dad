// ===== 幻灯片导航 =====
const slidesContainer = document.getElementById('slides-container');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const navTip = document.getElementById('nav-tip');
const totalSlides = slides.length;
let currentSlide = 0;
const slideTips = [
    '点“下一页”继续',
    '点亮着的蜡烛许愿',
    '上下滑动可看全部提醒',
    '在信纸里上下滑动阅读'
];

function goToSlide(index) {
    if (index < 0) index = 0;
    if (index > totalSlides - 1) index = totalSlides - 1;
    currentSlide = index;
    slidesContainer.style.transform = `translateX(-${index * 100}vw)`;
    dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('active', isActive);
        if (isActive) {
            dot.setAttribute('aria-current', 'page');
        } else {
            dot.removeAttribute('aria-current');
        }
    });
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === totalSlides - 1;
    navTip.textContent = `${slideTips[index]} · 第 ${index + 1} / ${totalSlides} 页`;
    slides[index].scrollTop = 0;
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

// 触摸滑动支持
let touchStartX = 0;
let touchEndX = 0;

slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) {
        goToSlide(currentSlide + 1);
    } else {
        goToSlide(currentSlide - 1);
    }
}

// 键盘左右键
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
});

// 初始化按钮状态
goToSlide(0);

// ===== 倒计时 =====
const birthdayDate = new Date('2026-08-09T00:00:00+08:00');
const countdownBox = document.getElementById('countdown-box');
const birthdayToday = document.getElementById('birthday-today');

function updateCountdown() {
    const now = new Date();
    const diff = birthdayDate - now;

    if (diff <= 0) {
        countdownBox.style.display = 'none';
        birthdayToday.style.display = 'block';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);


// ===== 信件日期 =====
const today = new Date();
const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
document.getElementById('letter-date').textContent = dateStr;


// ===== 五彩纸屑 =====
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas(confettiCanvas);
window.addEventListener('resize', () => {
    resizeCanvas(confettiCanvas);
    resizeCanvas(document.getElementById('fireworks-canvas'));
});

const confettiColors = ['#e8b94a', '#f5d97a', '#e89a3c', '#fff5dc', '#d4853a', '#c84050'];
let confettiParticles = [];

function createConfetti(x, y, count) {
    count = count || 30;
    for (let i = 0; i < count; i++) {
        confettiParticles.push({
            x: x !== undefined ? x : Math.random() * confettiCanvas.width,
            y: y !== undefined ? y : -10,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 7 + 3,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            life: 1
        });
    }
}

// 入场纸屑
setTimeout(() => {
    for (let i = 0; i < 60; i++) createConfetti();
}, 500);

function updateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = confettiParticles.filter(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rotation += p.rotationSpeed;
        p.life -= 0.004;
        if (p.y > confettiCanvas.height + 20 || p.life <= 0) return false;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation * Math.PI / 180);
        confettiCtx.globalAlpha = p.life;
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        confettiCtx.restore();
        return true;
    });
    requestAnimationFrame(updateConfetti);
}
updateConfetti();


// ===== 烟花 =====
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
resizeCanvas(fwCanvas);

let fireworkParticles = [];
let fireworksActive = false;
let fireworksRAF = null;

function launchFirework(x, y) {
    var targetX = x !== undefined ? x : Math.random() * fwCanvas.width;
    var targetY = y !== undefined ? y : Math.random() * fwCanvas.height * 0.5 + 50;
    var startX = targetX + (Math.random() - 0.5) * 100;
    var color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    var rocket = { x: startX, y: fwCanvas.height, targetY: targetY, targetX: targetX, color: color, trail: [] };

    function animateRocket() {
        rocket.trail.push({ x: rocket.x, y: rocket.y, life: 1 });
        if (rocket.trail.length > 8) rocket.trail.shift();
        var dy = rocket.targetY - rocket.y;
        rocket.y += dy * 0.06;
        rocket.x += (rocket.targetX - rocket.x) * 0.06;

        fwCtx.save();
        rocket.trail.forEach(function(t, i) {
            t.life -= 0.12;
            fwCtx.globalAlpha = t.life * 0.5;
            fwCtx.fillStyle = rocket.color;
            fwCtx.beginPath();
            fwCtx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            fwCtx.fill();
        });
        fwCtx.restore();

        if (Math.abs(dy) > 3) {
            requestAnimationFrame(animateRocket);
        } else {
            explodeFirework(rocket.x, rocket.y, rocket.color);
        }
    }
    animateRocket();
}

function explodeFirework(x, y, color) {
    for (var i = 0; i < 50; i++) {
        var angle = (Math.PI * 2 * i) / 50;
        var speed = Math.random() * 4 + 2;
        fireworkParticles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color, life: 1,
            size: Math.random() * 3 + 1
        });
    }
    createConfetti(x, y, 12);
}

function updateFireworks() {
    if (fireworksActive) {
        fwCtx.fillStyle = 'rgba(31, 20, 16, 0.18)';
        fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    } else {
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    }

    fireworkParticles = fireworkParticles.filter(function(p) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.04; p.vx *= 0.99;
        p.life -= 0.01;
        if (p.life <= 0) return false;
        fwCtx.save();
        fwCtx.globalAlpha = p.life;
        fwCtx.fillStyle = p.color;
        fwCtx.shadowBlur = 6;
        fwCtx.shadowColor = p.color;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fwCtx.fill();
        fwCtx.restore();
        return true;
    });

    if (fireworksActive && Math.random() < 0.08) launchFirework();
    fireworksRAF = requestAnimationFrame(updateFireworks);
}
updateFireworks();


// ===== 蜡烛交互 =====
var candles = document.querySelectorAll('.candle');
var wishMessage = document.getElementById('wish-message');
var candleProgress = document.getElementById('candle-progress');
var blownCount = 0;

candles.forEach(function(candle) {
    candle.addEventListener('click', function() {
        if (candle.classList.contains('out')) return;
        candle.classList.add('out');
        candle.setAttribute('aria-pressed', 'true');
        blownCount++;
        var remaining = candles.length - blownCount;
        candleProgress.textContent = remaining > 0 ? `还剩 ${remaining} 根蜡烛` : '蜡烛全部吹灭，愿望马上实现！';
        candleProgress.classList.toggle('complete', remaining === 0);
        var rect = candle.getBoundingClientRect();
        createConfetti(rect.left + rect.width / 2, rect.top, 8);
        playSound('blow');

        if (blownCount === candles.length) {
            setTimeout(function() {
                wishMessage.classList.add('show');
                startFireworks();
                if (!musicPlaying) playBirthdaySong();
                for (var i = 0; i < 5; i++) {
                    (function(idx) {
                        setTimeout(function() {
                            createConfetti(
                                Math.random() * window.innerWidth,
                                Math.random() * window.innerHeight * 0.3,
                                25
                            );
                        }, idx * 300);
                    })(i);
                }
            }, 400);
        }
    });
});

function startFireworks() {
    fireworksActive = true;
    for (var i = 0; i < 3; i++) {
        setTimeout(launchFirework, i * 500);
    }
    setTimeout(function() { fireworksActive = false; }, 15000);
}


// ===== 音频 =====
var audioCtx = null;
var musicPlaying = false;
var birthdaySongTimeout = null;
var oscillatorNodes = [];
var musicBtn = document.getElementById('music-btn');
var musicLabel = document.getElementById('music-label');

function updateMusicButton() {
    musicBtn.classList.toggle('playing', musicPlaying);
    musicBtn.setAttribute('aria-pressed', String(musicPlaying));
    musicBtn.setAttribute('aria-label', musicPlaying ? '暂停生日快乐歌' : '播放生日快乐歌');
    musicLabel.textContent = musicPlaying ? '暂停音乐' : '播放音乐';
}

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playSound(type) {
    var ctx = getAudioCtx();
    if (type === 'blow') {
        var bufferSize = ctx.sampleRate * 0.2;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2) * 0.3;
        }
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        source.connect(filter);
        filter.connect(ctx.destination);
        source.start();
    }
}

// 生日快乐歌旋律
var birthdayMelody = [
    { note: 'G4', d: 0.4 }, { note: 'G4', d: 0.4 },
    { note: 'A4', d: 0.8 }, { note: 'G4', d: 0.8 },
    { note: 'C5', d: 0.8 }, { note: 'B4', d: 1.2 },
    { note: 'G4', d: 0.4 }, { note: 'G4', d: 0.4 },
    { note: 'A4', d: 0.8 }, { note: 'G4', d: 0.8 },
    { note: 'D5', d: 0.8 }, { note: 'C5', d: 1.2 },
    { note: 'G4', d: 0.4 }, { note: 'G4', d: 0.4 },
    { note: 'G5', d: 0.8 }, { note: 'E5', d: 0.8 },
    { note: 'C5', d: 0.8 }, { note: 'B4', d: 0.8 }, { note: 'A4', d: 1.2 },
    { note: 'F5', d: 0.4 }, { note: 'F5', d: 0.4 },
    { note: 'E5', d: 0.8 }, { note: 'C5', d: 0.8 },
    { note: 'D5', d: 0.8 }, { note: 'C5', d: 1.6 }
];

var noteFreqs = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
    'G5': 783.99, 'A5': 880.00
};

function playNote(freq, startTime, duration) {
    var ctx = getAudioCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.18, startTime + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
    oscillatorNodes.push(osc);
}

function playBirthdaySong() {
    var ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
        ctx.resume().then(function() {
            if (!musicPlaying) playBirthdaySong();
        });
        return;
    }
    if (birthdaySongTimeout) clearTimeout(birthdaySongTimeout);
    var currentTime = ctx.currentTime;
    oscillatorNodes = [];

    birthdayMelody.forEach(function(item) {
        var freq = noteFreqs[item.note];
        if (freq) playNote(freq, currentTime, item.d);
        currentTime += item.d;
    });

    musicPlaying = true;
    updateMusicButton();

    var totalDuration = birthdayMelody.reduce(function(sum, n) { return sum + n.d; }, 0);
    birthdaySongTimeout = setTimeout(function() {
        oscillatorNodes = [];
        birthdaySongTimeout = null;
        if (musicPlaying) playBirthdaySong();
    }, totalDuration * 1000);
}

function stopMusic() {
    if (birthdaySongTimeout) {
        clearTimeout(birthdaySongTimeout);
        birthdaySongTimeout = null;
    }
    oscillatorNodes.forEach(function(osc) {
        try { osc.stop(); } catch(e) {}
    });
    oscillatorNodes = [];
    musicPlaying = false;
    updateMusicButton();
}

// 音乐按钮
musicBtn.addEventListener('click', function() {
    if (musicPlaying) {
        stopMusic();
    } else {
        playBirthdaySong();
    }
});

// 页面打开时立即尝试自动播放。若浏览器拦截有声自动播放，
// 点击欢迎页的“知道了，开始看”后会立即开始，并持续循环。
function startAutoMusic() {
    if (musicPlaying) return;
    try {
        var ctx = getAudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume().then(function() {
                if (!musicPlaying) playBirthdaySong();
            }).catch(function() {});
        } else {
            playBirthdaySong();
        }
    } catch (e) {
        // 保留播放按钮作为不支持 Web Audio 浏览器的手动入口。
    }
}

updateMusicButton();
startAutoMusic();

// 若浏览器阻止首次有声自动播放，用户第一次操作页面时立即开始。
function startMusicOnFirstInteraction() {
    startAutoMusic();
    document.removeEventListener('click', startMusicOnFirstInteraction);
    document.removeEventListener('keydown', startMusicOnFirstInteraction);
}

document.addEventListener('click', startMusicOnFirstInteraction, { once: true });
document.addEventListener('keydown', startMusicOnFirstInteraction, { once: true });
