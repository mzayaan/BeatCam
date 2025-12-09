/*
   MICROPHONE.JS (Final version)
   Handles: Live waveform, volume meter, beat detection → BeatSync API
*/

let audioContext;
let analyser;
let dataArray;
let source;
let beatTimestamps = [];
let beatIntervalID = null;
let volumeIntervalID = null;

// UI elements
const waveformCanvas = document.getElementById("waveformCanvas");
const volumeBar = document.getElementById("volumeBar");
const beatFlash = document.getElementById("beatFlash");

// Canvas setup
const canvasCtx = waveformCanvas.getContext("2d");
waveformCanvas.width = waveformCanvas.offsetWidth;
waveformCanvas.height = waveformCanvas.offsetHeight;

// Beat detection variables
let lastBeatTime = 0;
const beatThreshold = 170;   // Sensitivity
const beatMinInterval = 140; // Minimum ms between beats


function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    if (!analyser) return;

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "#1A1A1A";
    canvasCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "var(--main-color)";
    canvasCtx.beginPath();

    const sliceWidth = waveformCanvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128;
        const y = (v * waveformCanvas.height) / 2;

        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);

        x += sliceWidth;
    }

    canvasCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    canvasCtx.stroke();
}
function startVolumeMeter() {
    clearInterval(volumeIntervalID);

    volumeIntervalID = setInterval(() => {
        if (!analyser) return;

        analyser.getByteFrequencyData(dataArray);
        const volume = Math.max(...dataArray);

        const percent = (volume / 255) * 100;
        volumeBar.style.width = percent + "%";

        // Color intensity
        if (volume < 90) volumeBar.style.background = "#00D97E";
        else if (volume < 150) volumeBar.style.background = "#FFC107";
        else volumeBar.style.background = "#FF2E88";

    }, 50);
}
function startBeatDetection() {
    clearInterval(beatIntervalID);

    beatIntervalID = setInterval(() => {
        if (!analyser) return;

        analyser.getByteFrequencyData(dataArray);

        const volume = Math.max(...dataArray);
        const timestamp = audioContext.currentTime * 1000; // ms

        if (volume > beatThreshold && timestamp - lastBeatTime > beatMinInterval) {
            lastBeatTime = timestamp;

            beatTimestamps.push(timestamp);

            // Store beat in BeatSync global session
            if (window.BeatSync) {
                BeatSync.recordBeat(timestamp);
            }

            // Flash visual
            beatFlash.style.opacity = 1;
            setTimeout(() => beatFlash.style.opacity = 0.25, 120);
        }

    }, 20);
}

