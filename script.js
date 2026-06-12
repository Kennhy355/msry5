/* ============================================================
   MONTHSARY WEBSITE - SCRIPT
   Handles: envelope opening, floating hearts, typewriter
   effect, background decorations, music toggle, and replay.
============================================================ */

// ----- DOM REFERENCES -----
const envelope = document.getElementById('envelope');
const letter = document.getElementById('letter');
const letterMessage = document.getElementById('letterMessage');
const floatingHearts = document.getElementById('floatingHearts');
const replayBtn = document.getElementById('replayBtn');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const backgroundDecor = document.getElementById('backgroundDecor');
const clickHint = document.getElementById('clickHint');
const backdropOverlay = document.querySelector('.backdrop-overlay');

// The original full message (used for typewriter + replay reset)
const originalMessage = letterMessage.textContent.trim();

// State flags to prevent breaking on repeated clicks
let isAnimating = false;
let isOpened = false;
let typewriterTimeout = null;

/* ============================================================
   1. BACKGROUND DECORATIONS (floating hearts & sparkles)
============================================================ */
function createBackgroundDecor() {
    const symbols = ['🥰', '💕', '👦🏿', '🌸', '😋😋'];
    const total = 18;

    for (let i = 0; i < total; i++) {
        const item = document.createElement('div');
        item.classList.add('decor-item');
        item.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        // Randomize size, position, timing for organic movement
        const size = 0.8 + Math.random() * 1.6; // 0.8rem - 2.4rem
        const left = Math.random() * 100; // vw
        const duration = 12 + Math.random() * 18; // 12s - 30s
        const delay = Math.random() * 20; // stagger starts
        const drift = (Math.random() * 200 - 100) + 'px'; // horizontal drift

        item.style.fontSize = size + 'rem';
        item.style.left = left + 'vw';
        item.style.animationDuration = duration + 's';
        item.style.animationDelay = '-' + delay + 's';
        item.style.setProperty('--drift', drift);

        backgroundDecor.appendChild(item);
    }
}

/* ============================================================
   2. ENVELOPE OPEN / CLOSE LOGIC
============================================================ */
envelope.addEventListener('click', () => {
    // Guard against rapid repeated clicks breaking the animation
    if (isAnimating) return;

    if (!isOpened) {
        openEnvelope();
    }
});

function openEnvelope() {
    isAnimating = true;
    isOpened = true;

    // Clear the message text IMMEDIATELY so it doesn't flash before typewriter starts
    letterMessage.textContent = '';

    envelope.classList.add('opened');
    document.body.classList.add('opened-active');

    // Launch the heart burst shortly after flap starts opening
    setTimeout(() => {
        launchFloatingHearts(18);
    }, 300);

    // Start typewriter effect once the letter has slid out
    // (matches the letter transition duration + delay in CSS: ~0.35s delay + 1.1s transition)
    setTimeout(() => {
        startTypewriter();
    }, 1300);

    // Show the replay button after the typewriter finishes
    // (1300ms wait + message length * 22ms per char + buffer)
    const typewriterDuration = 1300 + (originalMessage.length * 22) + 500;
    setTimeout(() => {
        replayBtn.classList.add('visible');
        isAnimating = false;
    }, typewriterDuration);
}

function resetEnvelope() {
    isAnimating = true;

    // Hide replay button immediately
    replayBtn.classList.remove('visible');

    // Cancel any in-progress typewriter effect
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }

    // Reset letter text and remove cursor styling
    letterMessage.textContent = '';
    letterMessage.classList.remove('typing');

    // Close envelope (reverse animation)
    envelope.classList.remove('opened');
    document.body.classList.remove('opened-active');
    isOpened = false;

    // Wait for closing animation to fully finish before allowing reopen
    setTimeout(() => {
        letterMessage.textContent = originalMessage;
        isAnimating = false;
    }, 1300);
}

replayBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't trigger envelope click
    if (isAnimating) return;
    resetEnvelope();

    // After reset completes, automatically reopen for a nice "replay" feel
    setTimeout(() => {
        openEnvelope();
    }, 1400);
});

/* ============================================================
   3. FLOATING HEARTS BURST (on envelope open)
============================================================ */
function launchFloatingHearts(count) {
    const hearts = ['❤️', '💖', '💕', '💗', '💝'];

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.classList.add('heart-burst');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        // Randomize starting position near center/bottom
        const startX = 40 + Math.random() * 20; // 40% - 60% across screen
        const drift = (Math.random() * 240 - 120) + 'px';
        const rotation = (Math.random() * 60 - 30) + 'deg';
        const duration = 2.8 + Math.random() * 1.8; // 2.8s - 4.6s
        const delay = Math.random() * 0.6;
        const size = 1.1 + Math.random() * 1.4;

        heart.style.left = startX + '%';
        heart.style.fontSize = size + 'rem';
        heart.style.setProperty('--drift', drift);
        heart.style.setProperty('--rot', rotation);
        heart.style.animationDuration = duration + 's';
        heart.style.animationDelay = delay + 's';

        floatingHearts.appendChild(heart);

        // Clean up DOM after animation finishes
        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000 + 200);
    }
}

/* ============================================================
   4. TYPEWRITER EFFECT FOR LETTER MESSAGE
============================================================ */
function startTypewriter() {
    letterMessage.textContent = '';
    letterMessage.classList.add('typing');

    let index = 0;
    const speed = 22; // ms per character — adjust for faster/slower typing

    function typeNextChar() {
        if (index < originalMessage.length) {
            letterMessage.textContent += originalMessage.charAt(index);
            index++;
            typewriterTimeout = setTimeout(typeNextChar, speed);
        } else {
            // Typing complete — remove blinking cursor
            letterMessage.classList.remove('typing');
        }
    }

    typeNextChar();
}

/* ============================================================
   5. BACKGROUND MUSIC TOGGLE (Play / Pause)
============================================================ */
let isMusicPlaying = false;

musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!isMusicPlaying) {
        // Attempt to play
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            musicBtn.textContent = 'pause';
            musicBtn.title = 'Pause Music';
            musicBtn.classList.add('playing');
        }).catch((err) => {
            console.warn('Could not play music:', err.message);
            musicBtn.textContent = '❌';
            setTimeout(() => {
                musicBtn.textContent = 'play';
                musicBtn.title = 'Play Music';
            }, 1200);
        });
    } else {
        // Pause
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.textContent = 'play';
        musicBtn.title = 'Play Music';
        musicBtn.classList.remove('playing');
    }
});

/* ============================================================
   6. INITIALIZE ON LOAD
============================================================ */
function startMusicPlaying() {
    if (isMusicPlaying) return;
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicBtn.textContent = 'play';
        musicBtn.title = 'Pause Music';
        musicBtn.classList.add('playing');
    }).catch(() => {
        // Autoplay blocked — will try again on first user interaction
    });
}

window.addEventListener('DOMContentLoaded', () => {
    createBackgroundDecor();

    // Try to autoplay music immediately
    startMusicPlaying();

    // Fallback: if autoplay was blocked, play on first user interaction
    function playOnFirstInteraction() {
        startMusicPlaying();
        document.removeEventListener('click', playOnFirstInteraction);
        document.removeEventListener('touchstart', playOnFirstInteraction);
    }
    document.addEventListener('click', playOnFirstInteraction);
    document.addEventListener('touchstart', playOnFirstInteraction);
});