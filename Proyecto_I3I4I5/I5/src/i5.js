// ===================================================
// ELEMENTOS DE LA PÁGINA
// ===================================================
const soundBtn = document.getElementById('sound');
const soundImg = document.getElementById('sound-img');
const tutorial = document.getElementById('tutorial');
const helpBtn = document.getElementById('help');
const closeTutorialBtn = document.getElementById('tutorial-close');

const wordEl = document.getElementById('word');
const messageEl = document.getElementById('message');
const colorBtns = document.querySelectorAll('.color');
const dots = document.querySelectorAll('.dot');
const playAgainBtn = document.getElementById('play-again');

// ===================================================
// VARIABLES DEL JUEGO
// ===================================================
const COLORS = ['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE'];

let order = [];       // orden de los colores en esta partida
let current = 0;      // posición del color que se pregunta ahora
let muted = false;    // true = sonido desactivado
let waiting = false;  // true = no se puede pulsar (tras un fallo)


// ===================================================
// AUDIO
// ===================================================
// Usamos la "síntesis de voz" del navegador (speechSynthesis).
// No necesita archivos de audio: el navegador lee el texto en voz alta.
function speak(text) {
    // Si el sonido está apagado, no decimos nada
    if (muted) {
        return;
    }

    // Si el navegador no tiene síntesis de voz, no hacemos nada
    if (!('speechSynthesis' in window)) {
        return;
    }

    // Cortamos lo que estuviera diciendo antes, para que no se acumulen frases
    speechSynthesis.cancel();

    // Creamos la frase que se va a leer
    const phrase = new SpeechSynthesisUtterance(text.toLowerCase());
    phrase.lang = 'en-US';  // voz en inglés
    phrase.rate = 0.85;     // un poco más lenta para que se entienda bien

    // La leemos en voz alta
    speechSynthesis.speak(phrase);
}


// ===================================================
// BOTÓN DE SONIDO
// ===================================================
function toggleSound() {
    if (muted) {
        muted = false;
        soundImg.src = '../img/sound_on.svg';
    } else {
        muted = true;
        soundImg.src = '../img/sound_off.svg';
        speechSynthesis.cancel(); // calla la voz al instante
    }
}

soundBtn.addEventListener('click', toggleSound);


// ===================================================
// TUTORIAL
// ===================================================
function openTutorial() {
    tutorial.showModal();
}

function closeTutorial() {
    tutorial.close();
}

helpBtn.addEventListener('click', openTutorial);
closeTutorialBtn.addEventListener('click', closeTutorial);


// ===================================================
// FUNCIONES DEL JUEGO
// ===================================================

// Devuelve una copia de la lista con los elementos desordenados
function shuffle(list) {
    const copy = list.slice();

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        // Intercambiamos las posiciones i y j
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}

// Muestra el mensaje de acierto o fallo debajo de la palabra
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type; // 'good' o 'bad'
}

function hideMessage() {
    messageEl.textContent = '';
    messageEl.className = 'message';
}

// Enseña el color que toca y lo dice en voz alta
function showWord() {
    const color = order[current];
    wordEl.textContent = color;
    speak(color);
}

// Prepara una partida nueva
function startGame() {
    order = shuffle(COLORS);
    current = 0;
    waiting = false;

    // Vuelve a activar todos los círculos de color
    for (let i = 0; i < colorBtns.length; i++) {
        colorBtns[i].classList.remove('done');
        colorBtns[i].disabled = false;
    }

    // Vacía todos los puntos de progreso
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('filled');
        dots[i].style.removeProperty('--c');
    }

    hideMessage();
    playAgainBtn.hidden = true;
    showWord();
}

// Se llama cuando se han acertado los 6 colores
function win() {
    wordEl.textContent = 'YOU WIN!';
    hideMessage();
    speak('You win!');
    playAgainBtn.hidden = false;
}

// El jugador ha pulsado el color correcto
function rightAnswer(btn) {
    const color = order[current];

    // El círculo queda marcado y ya no se puede volver a pulsar
    btn.classList.add('done');
    btn.disabled = true;

    // Rellenamos el punto de progreso con ese color
    dots[current].style.setProperty('--c', 'var(--' + color.toLowerCase() + ')');
    dots[current].classList.add('filled');

    current = current + 1;

    if (current === order.length) {
        win();
    } else {
        showMessage('GOOD!', 'good');
        speak('Good! ' + order[current]); // felicita y dice el siguiente color
        wordEl.textContent = order[current];
    }
}

// El jugador ha pulsado un color equivocado
function wrongAnswer() {
    const color = order[current];

    showMessage('TRY AGAIN!', 'bad');
    speak('Try again. ' + color); // avisa y repite el color que se busca

    // Bloqueamos los clics un momento para que dé tiempo a escuchar
    waiting = true;
    setTimeout(function () {
        waiting = false;
    }, 900);
}

// Se ejecuta al pulsar cualquier círculo de color
function onColorClick(event) {
    const btn = event.currentTarget;

    if (waiting) {
        return;
    }
    if (current >= order.length) {
        return; // la partida ya ha terminado
    }

    if (btn.dataset.color === order[current]) {
        rightAnswer(btn);
    } else {
        wrongAnswer();
    }
}

// Al pulsar la palabra se vuelve a escuchar
function onWordClick() {
    if (current < order.length) {
        speak(order[current]);
    }
}


// ===================================================
// EVENTOS
// ===================================================
for (let i = 0; i < colorBtns.length; i++) {
    colorBtns[i].addEventListener('click', onColorClick);
}

wordEl.addEventListener('click', onWordClick);
playAgainBtn.addEventListener('click', startGame);

// Empezamos la primera partida
startGame();
