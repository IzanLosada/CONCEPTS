// ===== SOUND BUTTON =====
const soundBtn = document.getElementById('sound');
const soundImg = document.getElementById('sound-img');
let muted = false;

soundBtn.addEventListener('click', () => {
    muted = !muted;
    soundImg.src = muted ? 'img/sound_off.svg' : 'img/sound_on.svg';
    if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
});

// Says a text in English with the browser voice (only when the sound is on)
function speak(text) {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'en-GB';
    voice.rate = 0.85;
    window.speechSynthesis.speak(voice);
}

// ===== TUTORIAL =====
const tutorial = document.getElementById('tutorial');

document.getElementById('help').addEventListener('click', () => tutorial.showModal());
document.getElementById('tutorial-close').addEventListener('click', () => tutorial.close());

// ===== GAME =====
const colors = document.querySelectorAll('.color');
const box = document.getElementById('box');
const picked = document.getElementById('picked');
const answer = document.getElementById('answer');
const answerWord = document.getElementById('answer-word');

// Puts the chosen colour in the box, shows its name and says it
function pick(button) {
    colors.forEach((color) => color.classList.toggle('selected', color === button));

    picked.src = button.querySelector('img').src;
    picked.hidden = false;

    answerWord.textContent = button.dataset.color;
    answerWord.style.color = button.dataset.hex;
    answer.hidden = false;

    speak(button.dataset.color);
}

// ===== DRAG AND DROP =====
// A colour only goes in the box when it is DRAGGED there (a tap does nothing).
// Pointer events are used so it works with a mouse and with a finger on the whiteboard.
let drag = null; // { button, ghost } while a colour is being dragged

// True when the pointer is over the box
function isOverBox(event) {
    const area = box.getBoundingClientRect();
    return event.clientX >= area.left && event.clientX <= area.right &&
           event.clientY >= area.top && event.clientY <= area.bottom;
}

// Moves the copy of the colour that follows the pointer
function moveGhost(event) {
    drag.ghost.style.left = event.clientX + 'px';
    drag.ghost.style.top = event.clientY + 'px';
    box.classList.toggle('over', isOverBox(event));
}

function endDrag() {
    drag.ghost.remove();
    drag.button.classList.remove('dragging');
    box.classList.remove('over');
    drag = null;
}

colors.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (drag) endDrag();

        const image = button.querySelector('img');
        const ghost = image.cloneNode();
        ghost.className = 'ghost';
        ghost.style.width = image.getBoundingClientRect().width + 'px';
        document.body.appendChild(ghost);

        drag = { button, ghost };
        button.classList.add('dragging');
        moveGhost(event);

        // Keep receiving the pointer even when it leaves the button
        try { button.setPointerCapture(event.pointerId); } catch (error) { /* not needed */ }
    });

    button.addEventListener('pointermove', (event) => {
        if (drag && drag.button === button) moveGhost(event);
    });

    button.addEventListener('pointerup', (event) => {
        if (!drag || drag.button !== button) return;
        const dropped = isOverBox(event);
        endDrag();
        if (dropped) pick(button);
    });

    button.addEventListener('pointercancel', () => {
        if (drag && drag.button === button) endDrag();
    });
});
