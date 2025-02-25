// Constants for Faraday's law
const molarMassSilver = 107.87; // g/mol
const faradayConstant = 96500;  // C/mol
const z = 1;                    // Electrons transferred

let timeInSeconds = 0;
let remainingTime = 0;
let timerInterval = null;
let audio = null;

// Language translations
const translations = {
    en: {
        appTitle: "SilverTimer",
        currentPlaceholder: "Current (mA)",
        volumePlaceholder: "Volume (mL)",
        ppmPlaceholder: "Desired PPM",
        calcBtn: "Calculate Time",
        startBtn: "Start Timer",
        stopBtn: "Stop Timer",
        result: "Time: {time}",
        timer: "Remaining: {time}",
        modalTitle: "Concentration Reached!",
        modalText: "The desired silver PPM has been achieved.",
        modalBtn: "Stop Alarm",
        error: "Please enter valid positive numbers."
    },
    de: {
        appTitle: "SilberTimer",
        currentPlaceholder: "Strom (mA)",
        volumePlaceholder: "Volumen (mL)",
        ppmPlaceholder: "Gewünschte PPM",
        calcBtn: "Zeit Berechnen",
        startBtn: "Timer Starten",
        stopBtn: "Timer Stoppen",
        result: "Zeit: {time}",
        timer: "Verbleibend: {time}",
        modalTitle: "Konzentration Erreicht!",
        modalText: "Die gewünschte Silber-PPM wurde erreicht.",
        modalBtn: "Alarm Stoppen",
        error: "Bitte geben Sie gültige positive Zahlen ein."
    }
};

// Detect browser language
const userLang = (navigator.language || navigator.languages[0]).startsWith('de') ? 'de' : 'en';
const lang = translations[userLang];

// Function to set UI text based on language
function updateUIText() {
    document.getElementById('app-title').textContent = lang.appTitle;
    document.getElementById('current').placeholder = lang.currentPlaceholder;
    document.getElementById('volume').placeholder = lang.volumePlaceholder;
    document.getElementById('desiredPpm').placeholder = lang.ppmPlaceholder;
    document.getElementById('calc-btn').textContent = lang.calcBtn;
    document.getElementById('startBtn').textContent = lang.startBtn;
    document.getElementById('stopBtn').textContent = lang.stopBtn;
    document.getElementById('result').textContent = lang.result.replace('{time}', '00:00:00');
    document.getElementById('timer').textContent = lang.timer.replace('{time}', '00:00:00');
    document.getElementById('modal-title').textContent = lang.modalTitle;
    document.getElementById('modal-text').textContent = lang.modalText;
    document.getElementById('modal-btn').textContent = lang.modalBtn;
}

// Convert seconds to hh:mm:ss format
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function calculateTime() {
    const currentMa = parseFloat(document.getElementById('current').value) || 0; // Current in mA
    const volumeMl = parseFloat(document.getElementById('volume').value) || 0;   // Volume in mL
    const desiredPpm = parseFloat(document.getElementById('desiredPpm').value) || 0;

    if (currentMa > 0 && volumeMl > 0 && desiredPpm > 0) {
        const current = currentMa / 1000; // mA to A
        const volume = volumeMl / 1000;   // mL to L
        timeInSeconds = (desiredPpm * volume * z * faradayConstant) / (1000 * current * molarMassSilver);
        remainingTime = timeInSeconds;
        document.getElementById('result').textContent = lang.result.replace('{time}', formatTime(timeInSeconds));
        document.getElementById('timer').textContent = lang.timer.replace('{time}', formatTime(remainingTime));
    } else {
        alert(lang.error);
    }
}

function startTimer() {
    if (timeInSeconds <= 0 || timerInterval) return;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    timerInterval = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').textContent = lang.timer.replace('{time}', formatTime(remainingTime));

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            showCompletionAlert();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('timer').textContent = lang.timer.replace('{time}', formatTime(remainingTime));
    }
}

function showCompletionAlert() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'); // Ensure alarm.mp3 is in the same folder or use a URL
    //audio = new Audio('alarm.wav'); // Ensure alarm.mp3 is in the folder or use a URL
    audio.loop = true;
    audio.play();
}

function stopAlarm() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    if (audio) {
        audio.pause();
        audio = null;
    }
    stopTimer();
}
