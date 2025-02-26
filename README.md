# SilverTimer

Basic web version of the [SilverTimer app](https://www.holzapfel-online.de/silvertimer/)

SilverTimer is a Progressive Web App (PWA) designed to calculate the time required to achieve a desired silver concentration (in parts per million, PPM) in water using Faraday's law of electrolysis. It’s ideal for users working with electrochemical processes involving silver nanoparticles.

The app calculates the time based on the current (from predefined devices), water volume, and desired PPM, then runs a timer to notify users when the concentration is reached. It supports English and German languages, day/night mode, and persists user settings across sessions.

## Supported devices:
|Device|Current|
|---|---|
|Maximus Smart 10|10 mA|
|Maximus Smart 20|20 mA|
|Maximus 20|20 mA|
|Ionic Pulser|5 mA|

(New devices can be added easily on demand.)

**Live demo:** (https://ceotjoe.github.io/SilverTimer_PWA/)[https://ceotjoe.github.io/SilverTimer_PWA/]

## Features
- **Time Calculation:** Uses Faraday’s law to compute the time needed to reach a specified silver PPM based on current (mA), volume (mL), and desired PPM.
- **Device Selection:** Choose from predefined devices with fixed current values via a dropdown.
- **Timer:** Runs a countdown timer with a stop option, playing an alarm when complete.
- **Multi-Language:** Supports English and German, auto-detected from browser settings.
- **Day/Night Mode:** Adapts to device light/dark mode preferences.
- **Persistent Settings:** Saves device, volume, and PPM inputs between sessions using localStorage.
- **PWA:** Installable on Android, iOS, and desktop with offline support via a service worker.
- **Auto-Updates:** Updates immediately after deployment, delayed until the timer finishes if running.
- **Documentation Link:** Includes a link to this README at the bottom of the app.

## Installation
### Running Locally
1. **Clone the Repository:**

```
git clone https://github.com/ceotjoe/SilverTimer_PWA.git
cd SilverTimer_PWA
```

2. **Serve the App:**

Use a local server (e.g., with Node.js or Python):

Node.js: npx http-server . -p 8000
Python: python -m http.server 8000

3. **Open in Browser:**

Visit http://localhost:8000/SilverTimer_PWA/ to test locally.

## Deployment
The app is hosted on GitHub Pages at (https://ceotjoe.github.io/SilverTimer_PWA/)[https://ceotjoe.github.io/SilverTimer_PWA/]. 

To deploy your own version:
1. Fork or clone this repository.
2. Push changes to your GitHub repository’s main branch.
3. Enable GitHub Pages in Settings > Pages, setting the source to main branch and root directory (/).

## Usage
- **Select a Device:** Choose a device from the dropdown (e.g., "Device C (500 mA)").
- **Enter Volume:** Input the water volume in milliliters (e.g., "1000" for 1 liter).
- **Enter Desired PPM:** Input the target silver concentration (e.g., "10").
- **Calculate Time:** Click "Calculate Time" (or "Zeit Berechnen" in German) to see the required time in hh:mm:ss.
- **Start Timer:** Click "Start Timer" to begin the countdown. Stop it anytime with "Stop Timer".
- **Completion:** When the timer reaches zero, an alarm sounds until you click "Stop Alarm".
- **Read Documentation:** Click the "Readme" (or "Liesmich") link at the bottom for more info.

Your device, volume, and PPM selections are saved for the next session.

## File Structure

```
SilverTimer_PWA/
├── index.html         # Main HTML file
├── styles.css         # CSS for styling and day/night mode
├── app.js             # JavaScript for logic and i18n
├── manifest.json      # PWA manifest
├── sw.js              # Service Worker for caching and updates
├── alarm.mp3          # Alarm sound file
├── icon-192x192.png   # PWA icon (192x192)
├── icon-512x512.png   # PWA icon (512x512)
├── devices.json       # Device current values
├── locales/
│   ├── en.json        # English translations
│   └── de.json        # German translations
└── README.md          # This file
```

## Technical Details

- **Faraday’s Law:** Calculates time as `t = (desiredPpm * volume * z * F) / (1000 * current * M)`, where:
  - `desiredPpm:` Target concentration (mg/L).
  - `volume:` Water volume (L, converted from mL).
  - `z:` Electrons transferred (1 for Ag⁺).
  - `F:` Faraday’s constant (96500 C/mol).
  - `current:` Current (A, converted from mA).
  - `M:` Molar mass of silver (107.87 g/mol).
- **PWA Features:** Uses a service worker for offline caching and immediate updates (delayed if a timer is running).
- **i18n:** Translations stored in JSON files, applied dynamically based on browser language.
- **Storage:** localStorage persists device, volume, and PPM inputs.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push to your fork: `git push origin feature/your-feature`.
5. Open a pull request.

Please ensure your changes are tested locally before submitting.

## License
This project is licensed under the MIT License. See the LICENSE file for details. (Note: Add a LICENSE file if you choose this license.)

## Acknowledgments
- Built with HTML, CSS, and JavaScript.
- Hosted on GitHub Pages.
- Inspired by electrochemical applications of silver concentration.

>[!NOTE]
>This app was developed just as a proof of concept for AI supported development with the help of [Grok AI](https://grok.com). 

>[!IMPORTANT]
>If you're using the timer function, this is currently only working in the foreground. Means the page needs to be open all the time until the timer is finished.
>DISCLAIMER: The PPM within the dispersion will be different due to certain circrumstances while electrolysis. It can only be really measured by probing a sample in laboratory.This app can only replace the >tables which are usually delivered by the manufacturer of the device.
