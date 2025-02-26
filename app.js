// Constants for Faraday's law
const molarMassSilver = 107.87; // g/mol
const faradayConstant = 96500;  // C/mol
const z = 1;                    // Electrons transferred

let timeInSeconds = 0;
let remainingTime = 0;
let timerInterval = null;
let audio = null;
let translations = {};

// Load translations based on browser language
async function loadTranslations() {
    const userLang = (navigator.language || navigator.languages[0]).startsWith('de') ? 'de' : 'en';
    const response = await fetch(`/SilverTimer_PWA/locales/${userLang}.json`);
    translations = await response.json();
    updateUIText();
}

// Update UI with translations
function updateUIText(params = {}) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let text = translations[key] || key;
        const paramStr = element.getAttribute('data-i18n-params');
        if (paramStr) {
            const paramsObj = Object.fromEntries(paramStr.split(',').map(p => p.split(':')));
            for (const [param, value] of Object.entries(paramsObj)) {
                text = text.replace(`{${param}}`, params[param] || value);
            }
        }
        element.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = translations[key] || key;
    });
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
        updateUIText({ time: formatTime(timeInSeconds) });
    } else {
        alert(translations.error);
    }
}

function startTimer() {
    if (timeInSeconds <= 0 || timerInterval) return;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    timerInterval = setInterval(() => {
        remainingTime--;
        updateUIText({ time: formatTime(remainingTime) });

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
        updateUIText({ time: formatTime(remainingTime) });
    }
}

function showCompletionAlert() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'); // Ensure alarm.mp3 is in the same folder or use a URL
    //audio = new Audio('/SilverTimer_PWA/alarm.mp3');
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

// Initialize with translations
window.onload = loadTranslations;
