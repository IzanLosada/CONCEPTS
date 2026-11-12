// ===== BOTÓN DE SONIDO =====
const soundBtn = document.getElementById('sound');
const soundImg = document.getElementById('sound-img');
let muted = false;

soundBtn.addEventListener('click', () => {
    muted = !muted;
    soundImg.src = muted ? '../img/sound_off.svg' : '../img/sound_on.svg';
});

// ===== TUTORIAL =====
const tutorial = document.getElementById('tutorial');

document.getElementById('help').addEventListener('click', () => tutorial.showModal());
document.getElementById('tutorial-close').addEventListener('click', () => tutorial.close());
