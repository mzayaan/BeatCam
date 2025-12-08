document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("studioVideo");

    const videoTrack = document.getElementById("videoTrack");
    const beatTrack = document.getElementById("beatTrack");
    const overlayTrack = document.getElementById("overlayTrack");

    const playhead = document.getElementById("playhead");

    const trimLeft = document.querySelector(".trim-left");
    const trimRight = document.querySelector(".trim-right");

    let trimStartSec = 0;
    let trimEndSec = null;

    // Store last detected beats for snapping
    window.lastDetectedBeats = [];

    /* ============================================================
       SMOOTH PLAYHEAD UPDATES
    ============================================================ */
    function updatePlayhead() {
        if (!video.duration) return;

        const percent = (video.currentTime / video.duration) * 100;

        playhead.style.transition = "left 0.04s linear";
        playhead.style.left = percent + "%";
    }

    video.addEventListener("timeupdate", updatePlayhead);

    /* ============================================================
       SCRUB TIMELINE
    ============================================================ */
    function scrubTo(e) {
        const rect = videoTrack.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const ratio = x / rect.width;

        if (video.duration) {
            video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
        }
    }

    videoTrack.addEventListener("click", scrubTo);

    videoTrack.addEventListener("touchstart", scrubTo);
    videoTrack.addEventListener("touchmove", scrubTo);

    /* ============================================================
       SNAP TO NEAREST BEAT
    ============================================================ */
    function snapToNearestBeat(time) {
        const beats = window.lastDetectedBeats;
        if (!beats || beats.length === 0) return time;

        let closest = time;
        let minDiff = Infinity;

        beats.forEach(b => {
            const diff = Math.abs(b - time);
            if (diff < minDiff && diff < 0.2) { // snap threshold = 0.2 sec
                closest = b;
                minDiff = diff;
            }
        });

        return closest;
    }

    /* ============================================================
       TRIM HANDLE DRAGGING (Mouse + Touch + Beat Snap)
    ============================================================ */
    function handleTrimDrag(handleEl, isLeft) {

        let dragging = false;

        function start(e) {
            dragging = true;
            e.preventDefault();
        }

        function end() {
            dragging = false;
        }

        function move(e) {
            if (!dragging) return;

            const rect = videoTrack.getBoundingClientRect();
            const evt = e.touches ? e.touches[0] : e;

            let x = evt.clientX - rect.left;

            x = Math.max(0, Math.min(rect.width, x));

            const percent = (x / rect.width) * 100;
            handleEl.style.left = percent + "%";

            if (video.duration) {
                let time = (x / rect.width) * video.duration;

                // SNAP TO BEATS
                time = snapToNearestBeat(time);

                if (isLeft) {
                    trimStartSec = time;
                } else {
                    trimEndSec = time;
                }
            }
        }

        // Mouse
        handleEl.addEventListener("mousedown", start);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);

        // Touch
        handleEl.addEventListener("touchstart", start);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    }

    handleTrimDrag(trimLeft, true);
    handleTrimDrag(trimRight, false);

    video.addEventListener("loadedmetadata", () => {
        trimEndSec = video.duration;
    });

    /* ============================================================
       BEAT MARKER RENDERING
    ============================================================ */
    window.renderBeatMarkersOnTimeline = function (beats, durationSec) {

        beatTrack.innerHTML = "";
        window.lastDetectedBeats = beats; // store for snapping

        beats.forEach(time => {
            const marker = document.createElement("div");
            marker.classList.add("beat-marker");

            const percent = (time / durationSec) * 100;
            marker.style.left = percent + "%";

            beatTrack.appendChild(marker);
        });
    };

    /* ============================================================
       PUBLIC API
    ============================================================ */
    window.BeatCamTimeline = {
        updatePlayhead,
        renderBeatMarkersOnTimeline,
        getTrimBounds: () => ({
            start: trimStartSec,
            end: trimEndSec
        })
    };

});
