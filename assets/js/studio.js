// studio.js – BeatCam Studio Logic
document.addEventListener("DOMContentLoaded", () => {
    const videoEl = document.getElementById("studioVideo");
    const trackNameEl = document.getElementById("trackName");
    const beatTimelineEl = document.getElementById("beatTimeline");
    const audioCanvas = document.getElementById("audioTimelineCanvas");

    const playBtn = document.getElementById("playVideoBtn");
    const pauseBtn = document.getElementById("pauseVideoBtn");
    const detectBeatsBtn = document.getElementById("detectBeatsBtn");
    const changeTrackBtn = document.getElementById("changeTrackBtn");

    if (!videoEl || !beatTimelineEl || !audioCanvas) {
        console.error("[Studio] Missing core DOM elements.");
        return;
    }

    const ctx = audioCanvas.getContext("2d");

    let videoSrc = localStorage.getItem("beatcam-latest-video");

    if (!videoSrc) {
        const clips = JSON.parse(localStorage.getItem("beatcam-clips") || "[]");
        if (clips.length > 0) {
            videoSrc = clips[0].url;
        }
    }

    if (videoSrc) {
        videoEl.src = videoSrc;
        trackNameEl.textContent = "Loaded Clip";
    } else {
        trackNameEl.textContent = "No clip found — record one in Capture";
    }

    function initTimelineAndWaveform() {
        if (!videoEl.duration || isNaN(videoEl.duration)) {
            console.warn("[Studio] Video duration unknown, cannot draw timeline yet.");
            return;
        }

        // Beat timeline from BeatSync (if available)
        if (window.BeatSync) {
            BeatSync.renderTimeline(beatTimelineEl, videoEl.duration);
        } else {
            // Fallback: simple evenly spaced markers
            beatTimelineEl.innerHTML = "";
            const beats = Math.max(8, Math.floor(videoEl.duration));
            for (let i = 0; i < beats; i++) {
                const marker = document.createElement("div");
                marker.className = "beat-marker";
                marker.style.left = (i / beats) * 100 + "%";
                beatTimelineEl.appendChild(marker);
            }
        }

        // Draw waveform style visualization
        drawWaveformVisual();
    }

    // When metadata is ready, render timeline and waveform
    videoEl.addEventListener("loadedmetadata", () => {
        initTimelineAndWaveform();
    });

    // If already loaded (e.g. from cache)
    if (videoEl.readyState >= 1) {
        initTimelineAndWaveform();
    }


    playBtn.addEventListener("click", () => {
        if (!videoEl.src) {
            alert("No video loaded.");
            return;
        }
        videoEl.play();
    });

    pauseBtn.addEventListener("click", () => {
        videoEl.pause();
    });


    detectBeatsBtn.addEventListener("click", () => {
        if (!videoEl.src) {
            alert("No video to analyze.");
            return;
        }

        if (window.BeatSync && videoEl.duration) {
            BeatSync.renderTimeline(beatTimelineEl, videoEl.duration);
            alert("Beat markers refreshed from recorded beat data.");
        } else {
            // fallback: re-create simple markers
            beatTimelineEl.innerHTML = "";
            let duration = videoEl.duration || 10;
            let beats = Math.max(8, Math.floor(duration));
            for (let i = 0; i < beats; i++) {
                let marker = document.createElement("div");
                marker.className = "beat-marker";
                marker.style.left = (i / beats) * 100 + "%";
                beatTimelineEl.appendChild(marker);
            }
            alert("Beat markers regenerated (fallback).");
        }
    });


    changeTrackBtn.addEventListener("click", () => {
        window.location.href = "library.html";
    });


    beatTimelineEl.addEventListener("click", (e) => {
        const rect = beatTimelineEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;

        if (!videoEl.duration || isNaN(videoEl.duration)) return;

        const newTime = ratio * videoEl.duration;
        videoEl.currentTime = newTime;
    });


    function drawWaveformVisual() {
        const width = audioCanvas.clientWidth || 300;
        const height = 80;

        audioCanvas.width = width;
        audioCanvas.height = height;

        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "var(--main-color)";
        ctx.lineWidth = 2;
        ctx.beginPath();

        const mid = height / 2;

        // Fake waveform using sine noise (visual)
        for (let x = 0; x < width; x++) {
            const wave =
                Math.sin(x * 0.04) * 15 +
                Math.sin(x * 0.11) * 7 +
                Math.sin(x * 0.02) * 4;
            const y = mid + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }
});
