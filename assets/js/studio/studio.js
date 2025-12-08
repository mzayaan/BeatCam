// studio.js – BeatCam Studio (Phase 7)

document.addEventListener("DOMContentLoaded", async () => {

    const videoEl = document.getElementById("studioVideo");

    if (!videoEl) {
        console.error("[Studio] Video element missing.");
        return;
    }

    /* ----------------------------------------------------
       LOAD VIDEO CLIP FROM Capture or Library
    ---------------------------------------------------- */
    let clipId = parseInt(sessionStorage.getItem("selected-clip-id"));

    let clip = null;
    let videoSrc = null;

    try {
        if (clipId) {
            clip = await loadClip(clipId);
            videoSrc = URL.createObjectURL(clip.blob);
        }
    } catch (err) {
        console.warn("[Studio] Failed to load selected clip:", err);
    }

    if (!videoSrc) {
        const clips = listClips();
        if (clips.length > 0) videoSrc = clips[0].url;
    }

    if (!videoSrc) {
        alert("No clip found. Please record a video in Capture.");
        return;
    }

    videoEl.src = videoSrc;

    /* ----------------------------------------------------
       INITIALIZE TIMELINE WHEN VIDEO IS READY
    ---------------------------------------------------- */
    videoEl.addEventListener("loadedmetadata", () => {
        if (window.BeatCamTimeline) {
            // timeline auto-updates playhead
            console.log("[Studio] Timeline initialized.");
        }
    });

});
