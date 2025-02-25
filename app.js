// Constants for Faraday's law
const molarMassSilver = 107.87; // g/mol
const faradayConstant = 96500;  // C/mol
const z = 1;                    // Electrons transferred

let timeInSeconds = 0;
let remainingTime = 0;
let timerInterval = null;
let audio = null;

function calculateTime() {
    const current = parseFloat(document.getElementById('current').value) || 0;
    const volume = parseFloat(document.getElementById('volume').value) || 0;
    const desiredPpm = parseFloat(document.getElementById('desiredPpm').value) || 0;

    if (current > 0 && volume > 0 && desiredPpm > 0) {
        timeInSeconds = (desiredPpm * volume * z * faradayConstant) / (1000 * current * molarMassSilver);
        remainingTime = timeInSeconds;
        document.getElementById('result').textContent = `Time: ${timeInSeconds.toFixed(2)} seconds`;
        document.getElementById('timer').textContent = `Remaining: ${remainingTime.toFixed(2)} seconds`;
    } else {
        alert('Please enter valid positive numbers.');
    }
}

function startTimer() {
    if (timeInSeconds <= 0 || timerInterval) return;

    document.getElementById('startBtn').disabled = true;
    timerInterval = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').textContent = `Remaining: ${remainingTime.toFixed(2)} seconds`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('startBtn').disabled = false;
            showCompletionAlert();
        }
    }, 1000); // Update every second
}

function showCompletionAlert() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';

    // Play alarm sound
    audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3'); // Ensure alarm.mp3 is in the same folder or use a URL
    //audio = new Audio('alarm.mp3'); // Ensure alarm.mp3 is in the same folder or use a URL
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
}
