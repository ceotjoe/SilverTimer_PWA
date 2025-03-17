// Constants for Faraday's law
const molarMassSilver = 107.87; // g/mol
const faradayConstant = 96500;  // C/mol
const z = 1;                    // Electrons transferred

let timeInSeconds = 0;
let remainingTime = 0;
let timerInterval = null;
let audio = null;
let translations = {};
let devices = [];
let updatePending = false;

// Load translations and devices
async function loadTranslationsAndDevices() {
    let userLang = navigator.language || navigator.languages[0];
    userLang = userLang.split('-')[0];
    const supportedLangs = ['en', 'de'];
    const lang = supportedLangs.includes(userLang) ? userLang : 'en';

    try {
        const [transResponse, devicesResponse] = await Promise.all([
            fetch(`/SilverTimer_PWA/locales/${lang}.json`),
            fetch('/SilverTimer_PWA/devices.json')
        ]);
        translations = await transResponse.json();
        devices = await devicesResponse.json();
        populateDeviceDropdown();
        restoreInputValues(); // Restore saved inputs after loading translations
        updateUIText();
    } catch (error) {
        console.error('Failed to load resources, falling back to English:', error);
        const transResponse = await fetch('/SilverTimer_PWA/locales/en.json');
        translations = await transResponse.json();
        const devicesResponse = await fetch('/SilverTimer_PWA/devices.json');
        devices = await devicesResponse.json();
        populateDeviceDropdown();
        restoreInputValues();
        updateUIText();
    }
}

// Populate the device dropdown and restore saved selection
function populateDeviceDropdown() {
    const select = document.getElementById('device');
    select.innerHTML = '<option value="" disabled>' + translations.devicePlaceholder + '</option>';
    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.currentMa;
        option.textContent = `${device.name} (${device.currentMa} mA)`;
        select.appendChild(option);
    });

    const savedDevice = localStorage.getItem('selectedDevice');
    if (savedDevice && devices.some(d => d.currentMa.toString() === savedDevice)) {
        select.value = savedDevice;
    } else {
        select.selectedIndex = 0;
    }

    select.addEventListener('change', () => {
        localStorage.setItem('selectedDevice', select.value);
    });
}

// Restore saved input values for volume and PPM
function restoreInputValues() {
    const volumeInput = document.getElementById('volume');
    const ppmInput = document.getElementById('desiredPpm');

    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
        volumeInput.value = savedVolume;
    }

    const savedPpm = localStorage.getItem('desiredPpm');
    if (savedPpm) {
        ppmInput.value = savedPpm;
    }

    // Save volume on change
    volumeInput.addEventListener('input', () => {
        localStorage.setItem('volume', volumeInput.value);
    });

    // Save PPM on change
    ppmInput.addEventListener('input', () => {
        localStorage.setItem('desiredPpm', ppmInput.value);
    });
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

// Function to record usage data
function recordUsage(deviceName, currentMa, duration, volume, ppm) {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const usage = { date, time, device: deviceName, currentMa, duration, volume, ppm };

    let stats = JSON.parse(localStorage.getItem('usageStats')) || [];
    stats.push(usage);
    localStorage.setItem('usageStats', JSON.stringify(stats));
}

// Updated calculateTime to record usage
function calculateTime() {
    const deviceSelect = document.getElementById('device');
    const currentMa = parseFloat(deviceSelect.value) || 0;
    const volumeMl = parseFloat(document.getElementById('volume').value) || 0;
    const desiredPpm = parseFloat(document.getElementById('desiredPpm').value) || 0;

    if (currentMa > 0 && volumeMl > 0 && desiredPpm > 0) {
        const current = currentMa / 1000; // Convert mA to A
        const volume = volumeMl / 1000;   // Convert mL to L
        timeInSeconds = (desiredPpm * volume * z * faradayConstant) / (1000 * current * molarMassSilver);
        remainingTime = timeInSeconds;
        const duration = formatTime(timeInSeconds);
        updateUIText({ time: duration });

        // Record the usage
        const deviceName = deviceSelect.options[deviceSelect.selectedIndex].text.split(' (')[0];
        recordUsage(deviceName, currentMa, duration, volumeMl, desiredPpm);
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
            checkForPendingUpdate();
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
        checkForPendingUpdate();
    }
}

function showCompletionAlert() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    audio = new Audio('/SilverTimer_PWA/alarm.mp3');
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

// Check if an update is pending and reload if timer isn’t running
function checkForPendingUpdate() {
    if (updatePending && !timerInterval) {
        console.log('Timer finished or stopped, applying pending update...');
        window.location.reload();
    }
}

// Service Worker update handling
function handleServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/SilverTimer_PWA/sw.js').then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New service worker found, update pending...');
                        updatePending = true;
                        checkForPendingUpdate();
                    }
                });
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!timerInterval) {
                    console.log('Service worker updated, reloading...');
                    window.location.reload();
                } else {
                    console.log('Service worker updated, waiting for timer to finish...');
                    updatePending = true;
                }
            });
        }).catch(err => console.error('Service Worker registration failed:', err));
    }
}

// Function to show the statistics screen
function showStatistics() {
    const statsContainer = document.getElementById('statistics');
    const mainContainer = document.querySelector('.container');
    mainContainer.style.display = 'none';
    statsContainer.style.display = 'block';

    const statsBody = document.getElementById('statsBody');
    statsBody.innerHTML = '';

    const stats = JSON.parse(localStorage.getItem('usageStats')) || [];
    stats.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.date}</td>
            <td>${stat.time}</td>
            <td>${stat.device}</td>
            <td>${stat.currentMa}</td>
            <td>${stat.duration}</td>
            <td>${stat.volume}</td>
            <td>${stat.ppm}</td>
        `;
        statsBody.appendChild(row);
    });
}

// Function to hide the statistics screen
function hideStatistics() {
    const statsContainer = document.getElementById('statistics');
    const mainContainer = document.querySelector('.container');
    statsContainer.style.display = 'none';
    mainContainer.style.display = 'block';
}

// Function to export statistics as CSV
function exportCSV() {
    const stats = JSON.parse(localStorage.getItem('usageStats')) || [];
    if (stats.length === 0) {
        alert(translations.noData);
        return;
    }

    const headers = 'Date,Time,Device,Current (mA),Duration (hh:mm:ss),Volume (mL),PPM\n';
    const csvRows = stats.map(stat => 
        `${stat.date},${stat.time},${stat.device},${stat.currentMa},${stat.duration},${stat.volume},${stat.ppm}`
    );
    const csvContent = headers + csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SilverTimer_Usage_Statistics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize with translations, devices, and SW update handling
window.onload = () => {
    loadTranslationsAndDevices();
    handleServiceWorkerUpdates();
};
