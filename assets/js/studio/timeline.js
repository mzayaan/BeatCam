document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("studioVideo");

    const videoTrack = document.getElementById("videoTrack");
    const overlayTrack = document.getElementById("overlayTrack");
    const playhead = document.getElementById("playhead");

    const trimLeft = document.querySelector(".trim-left");
    const trimRight = document.querySelector(".trim-right");

    let trimStartSec = 0;
    let trimEndSec = null;


    function updatePlayhead() {
        if (!video.duration) return;

        const percent = (video.currentTime / video.duration) * 100;

        playhead.style.transition = "left 0.04s linear";
        playhead.style.left = percent + "%";
    }

    video.addEventListener("timeupdate", updatePlayhead);



    function scrubTo(e) {
        const rect = videoTrack.getBoundingClientRect();
        const pos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;

        const ratio = pos / rect.width;

        if (video.duration) {
            video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
        }
    }

    videoTrack.addEventListener("click", scrubTo);

    // Touch scrubbing
    videoTrack.addEventListener("touchstart", scrubTo, { passive: false });
    videoTrack.addEventListener("touchmove", scrubTo, { passive: false });



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
                const time = (x / rect.width) * video.duration;

                if (isLeft) trimStartSec = time;
                else trimEndSec = time;
            }
        }

        // Mouse events
        handleEl.addEventListener("mousedown", start);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup",   end);

        // Touch events
        handleEl.addEventListener("touchstart", start);
        window.addEventListener("touchmove",  move, { passive: false });
        window.addEventListener("touchend",   end);
    }

    handleTrimDrag(trimLeft, true);
    handleTrimDrag(trimRight, false);

    video.addEventListener("loadedmetadata", () => {
        trimEndSec = video.duration;
    });



    window.BeatCamTimeline = {
        updatePlayhead,
        getTrimBounds: () => ({
            start: trimStartSec,
            end: trimEndSec
        })
    };

});
