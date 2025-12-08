document.addEventListener("DOMContentLoaded", () => {

    /* TOOL BUTTONS */
    const toolTrim = document.getElementById("toolTrim");
    const toolCrop = document.getElementById("toolCrop");
    const toolFilter = document.getElementById("toolFilter");
    const toolOverlay = document.getElementById("toolOverlay");
    const toolBeat = document.getElementById("toolBeat");
    const toolExport = document.getElementById("toolExport");

    const video = document.getElementById("studioVideo");

    /* EDITOR STATE */
    let currentMode = null;


    function setMode(mode) {
        currentMode = mode;
        console.log("[Editor] Mode:", mode);

        resetToolButtons();
        highlightTool(mode);
        activateMode(mode);
    }

    function resetToolButtons() {
        document.querySelectorAll(".tool-button").forEach(btn => {
            btn.style.background = "#262626";
        });
    }

    function highlightTool(mode) {
        const buttonMap = {
            trim: toolTrim,
            crop: toolCrop,
            filter: toolFilter,
            overlay: toolOverlay,
            beat: toolBeat,
            export: toolExport
        };

        const btn = buttonMap[mode];
        if (btn) btn.style.background = "#444";
    }


    function activateMode(mode) {
        switch (mode) {

            /* TRIM MODE */
            case "trim":
                console.log("[Editor] Trim mode activated");
                document.querySelector(".trim-left").style.display = "block";
                document.querySelector(".trim-right").style.display = "block";
                break;

            /* CROP MODE */
            case "crop":
                console.log("[Editor] Crop mode activated");
                enableCropUI();
                break;

            /* FILTER MODE */
            case "filter":
                console.log("[Editor] Filter mode activated");
                openFilterEditor();
                break;

            /* OVERLAY MODE */
            case "overlay":
                console.log("[Editor] Overlay mode activated");
                openOverlayMenu();
                break;

            /* BEAT SYNC MODE (FFT BEATS + TIMELINE) */
            case "beat":
                console.log("[Editor] Beat Sync mode activated");
                activateBeatSync();
                break;

            /* EXPORT MODE */
            case "export":
                console.log("[Editor] Export mode activated");
                if (window.BeatCamExporter) {
                    BeatCamExporter.prepareExport();
                } else {
                    alert("Exporter not initialized yet.");
                }
                break;
        }
    }


    toolTrim.addEventListener("click", () => setMode("trim"));
    toolCrop.addEventListener("click", () => setMode("crop"));
    toolFilter.addEventListener("click", () => setMode("filter"));
    toolOverlay.addEventListener("click", () => setMode("overlay"));
    toolBeat.addEventListener("click", () => setMode("beat"));
    toolExport.addEventListener("click", () => setMode("export"));


    function enableCropUI() {
        if (document.getElementById("cropBox")) return;

        const cropBox = document.createElement("div");
        cropBox.id = "cropBox";
        cropBox.style.position = "absolute";
        cropBox.style.border = "2px dashed #ffcc00";
        cropBox.style.top = "20%";
        cropBox.style.left = "20%";
        cropBox.style.width = "60%";
        cropBox.style.height = "60%";
        cropBox.style.zIndex = "200";
        cropBox.style.pointerEvents = "auto";

        document.getElementById("videoPreviewContainer").appendChild(cropBox);

        // STORE FOR EXPORT ENGINE
        window.BeatCamCropBox = {
            getCropValues: () => {
                const rect = cropBox.getBoundingClientRect();
                return {
                    x: Math.round(rect.left),
                    y: Math.round(rect.top),
                    w: Math.round(rect.width),
                    h: Math.round(rect.height)
                };
            }
        };
    }


    function openFilterEditor() {
        const filter = prompt("Choose filter: brightness, contrast, saturate");
        if (!filter) return;

        let css = "";

        if (filter === "brightness") css = "brightness(1.4)";
        if (filter === "contrast") css = "contrast(1.5)";
        if (filter === "saturate") css = "saturate(1.8)";

        video.style.filter = css;

        // Pass value to export engine
        window.BeatCamFilters = {
            getFilterString: () => {
                if (filter === "brightness") return "eq=brightness=0.3";
                if (filter === "contrast") return "eq=contrast=1.4";
                if (filter === "saturate") return "eq=saturation=2";
                return "";
            }
        };
    }


    function openOverlayMenu() {
        const type = prompt("Overlay Type: text, emoji, image?");
        if (!type) return;

        if (type === "text") BeatCamOverlays.addTextOverlay();
        if (type === "emoji") BeatCamOverlays.addEmojiOverlay();
        if (type === "image") BeatCamOverlays.addImageOverlay();
    }


    function activateBeatSync() {
        if (!window.BeatCamFFT) {
            alert("FFT Module missing!");
            return;
        }

        BeatCamFFT.detectBeats(video).then(beats => {
            const duration = video.duration;
            BeatCamTimeline.renderBeatMarkersOnTimeline(beats, duration);

            console.log("[BeatSync] Auto-cutting at beats...");
            autoCutTimelineMarkers(beats);
        });
    }


    function autoCutTimelineMarkers(beats) {
        const track = document.getElementById("videoTrack");

        document.querySelectorAll(".cut-marker").forEach(el => el.remove());

        beats.forEach(t => {
            const mk = document.createElement("div");
            mk.classList.add("cut-marker");

            mk.style.position = "absolute";
            mk.style.background = "cyan";
            mk.style.width = "2px";
            mk.style.height = "100%";
            mk.style.left = (t / video.duration) * 100 + "%";
            mk.style.boxShadow = "0 0 4px cyan";

            track.appendChild(mk);
        });
    }

    window.BeatCamEditor = {
        setMode,
        getMode: () => currentMode
    };

});
