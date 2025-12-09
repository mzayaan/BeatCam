document.addEventListener("DOMContentLoaded", () => {

    /* TOOL BUTTONS */
    const toolTrim = document.getElementById("toolTrim");
    const toolFilter = document.getElementById("toolFilter");
    const toolOverlay = document.getElementById("toolOverlay");

    const video = document.getElementById("studioVideo");

    let currentMode = null;


    /* -----------------------------------------------------------
       MASTER MODE SWITCHER
    ----------------------------------------------------------- */
    function setMode(mode) {
        currentMode = mode;
        console.log("[Editor] Mode:", mode);

        resetToolButtons();
        highlightTool(mode);
        hideAllModeUI();  // <<< important
        activateMode(mode);
    }


    /* -----------------------------------------------------------
       RESET BUTTON STYLES
    ----------------------------------------------------------- */
    function resetToolButtons() {
        document.querySelectorAll(".tool-button").forEach(btn => {
            btn.style.background = "#262626";
        });
    }

    function highlightTool(mode) {
        const buttonMap = {
            trim: toolTrim,
            filter: toolFilter,
            overlay: toolOverlay
        };

        const btn = buttonMap[mode];
        if (btn) btn.style.background = "#444";
    }


    /* -----------------------------------------------------------
       HIDE ALL MODE UI ELEMENTS
    ----------------------------------------------------------- */
    function hideAllModeUI() {

        // Hide TRIM handles
        document.querySelector(".trim-left").style.display = "none";
        document.querySelector(".trim-right").style.display = "none";
    }


    /* -----------------------------------------------------------
       ACTIVATE MODE
    ----------------------------------------------------------- */
    function activateMode(mode) {

        switch (mode) {

            /* TRIM MODE */
            case "trim":
                console.log("[Editor] Trim mode activated");

                document.querySelector(".trim-left").style.display = "block";
                document.querySelector(".trim-right").style.display = "block";

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


    function openFilterEditor() {
        const filter = prompt("Choose filter: brightness, contrast, saturate");
        if (!filter) return;

        let css = "";

        if (filter === "brightness") css = "brightness(1.4)";
        if (filter === "contrast") css = "contrast(1.5)";
        if (filter === "saturate") css = "saturate(1.8)";

        video.style.filter = css;
    }


    /* -----------------------------------------------------------
       OVERLAYS
    ----------------------------------------------------------- */
    function openOverlayMenu() {
        const type = prompt("Overlay Type: text, emoji, image?");
        if (!type) return;

        if (type === "text") BeatCamOverlays.addTextOverlay();
        if (type === "emoji") BeatCamOverlays.addEmojiOverlay();
        if (type === "image") BeatCamOverlays.addImageOverlay();
    }


    toolTrim.addEventListener("click", () => setMode("trim"));
    toolFilter.addEventListener("click", () => setMode("filter"));
    toolOverlay.addEventListener("click", () => setMode("overlay"));


    /* PUBLIC API */
    window.BeatCamEditor = {
        setMode,
        getMode: () => currentMode
    };

});
