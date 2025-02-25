// Constants for Faraday's law
const molarMassSilver = 107.87; // g/mol
const faradayConstant = 96500;  // C/mol
const z = 1;                    // Electrons transferred

let timeInSeconds = 0;
let remainingTime = 0;
let timerInterval = null;
let audio = null;

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
        // Convert mA to A and mL to L
        const current = currentMa / 1000; // mA to A
        const volume = volumeMl / 1000;   // mL to L
        // Faraday's law: time = (ppm * volume * z * F) / (1000 * I * M)
        timeInSeconds = (desiredPpm * volume * z * faradayConstant) / (1000 * current * molarMassSilver);
        remainingTime = timeInSeconds;
        document.getElementById('result').textContent = `Time: ${formatTime(timeInSeconds)}`;
        document.getElementById('timer').textContent = `Remaining: ${formatTime(remainingTime)}`;
    } else {
        alert('Please enter valid positive numbers.');
    }
}

function startTimer() {
    if (timeInSeconds <= 0 || timerInterval) return;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    timerInterval = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').textContent = `Remaining: ${formatTime(remainingTime)}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            showCompletionAlert();
        }
    }, 1000); // Update every second
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('timer').textContent = `Remaining: ${formatTime(remainingTime)}`;
    }
}

function showCompletionAlert() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';

    // Play alarm sound
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
    stopTimer(); // Ensure timer stops if alarm is acknowledged
}
