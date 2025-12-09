document.addEventListener("DOMContentLoaded", () => {

    /* TOOL BUTTONS */
    const toolTrim = document.getElementById("toolTrim");
    const toolCrop = document.getElementById("toolCrop");
    const toolFilter = document.getElementById("toolFilter");
    const toolOverlay = document.getElementById("toolOverlay");

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
            overlay: toolOverlay
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
        }
    }

    /* TOOL CLICK EVENTS */
    toolTrim.addEventListener("click", () => setMode("trim"));
    toolCrop.addEventListener("click", () => setMode("crop"));
    toolFilter.addEventListener("click", () => setMode("filter"));
    toolOverlay.addEventListener("click", () => setMode("overlay"));


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
    }

    function openFilterEditor() {
        const filter = prompt("Choose filter: brightness, contrast, saturate");
        if (!filter) return;

        let css = "";

        if (filter === "brightness") css = "brightness(1.4)";
        if (filter === "contrast") css = "contrast(1.5)";
        if (filter === "saturate") css = "saturate(1.8)";

        video.style.filter = css;
    }


    function openOverlayMenu() {
        const type = prompt("Overlay Type: text, emoji, image?");
        if (!type) return;

        if (type === "text") BeatCamOverlays.addTextOverlay();
        if (type === "emoji") BeatCamOverlays.addEmojiOverlay();
        if (type === "image") BeatCamOverlays.addImageOverlay();
    }

    /* PUBLIC API */
    window.BeatCamEditor = {
        setMode,
        getMode: () => currentMode
    };

});
