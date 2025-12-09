document.addEventListener("DOMContentLoaded", async () => {

    const videoEl = document.getElementById("studioVideo");

    if (!videoEl) {
        console.error("[Studio] Video element missing.");
        return;
    }


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

    // Fallback: load from saved library
    if (!videoSrc) {
        const clips = listClips();
        if (clips.length > 0) {
            videoSrc = clips[0].url;
        }
    }

    // No video available at all
    if (!videoSrc) {
        setTimeout(() => {
            alert("No clip found. Please record a video in Capture.");
        }, 600);
        return;
    }

    // Set video source
    videoEl.src = videoSrc;



    videoEl.addEventListener("loadedmetadata", () => {
        if (window.BeatCamTimeline) {
            console.log("[Studio] Timeline ready.");
        }
    });

});
