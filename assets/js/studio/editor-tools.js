document.addEventListener("DOMContentLoaded", () => {

    /* TOOL BUTTONS */
    const toolTrim = document.getElementById("toolTrim");
    const toolFilter = document.getElementById("toolFilter");
    const toolOverlay = document.getElementById("toolOverlay");
    const video = document.getElementById("studioVideo");

    let currentMode = null;


    /* ======================================================
       MODAL SYSTEM (NEW)
    ====================================================== */
    function openEditorModal(title, buttons) {
        document.getElementById("editorModalTitle").innerText = title;

        const container = document.getElementById("editorModalButtons");
        container.innerHTML = "";

        buttons.forEach(btn => {
            const el = document.createElement("button");
            el.innerText = btn.label;
            el.style.cssText =
                "padding:10px 20px; background:#262626; color:white;" +
                "border:1px solid #444; border-radius:6px; cursor:pointer; font-size:15px;";
            el.onclick = () => {
                btn.action();
                closeEditorModal();
            };
            container.appendChild(el);
        });

        document.getElementById("editorModal").style.display = "block";
    }

    function closeEditorModal() {
        document.getElementById("editorModal").style.display = "none";
    }


    /* ======================================================
       MASTER MODE SWITCHER
    ====================================================== */
    function setMode(mode) {
        currentMode = mode;

        resetToolButtons();
        highlightTool(mode);
        hideAllModeUI();
        activateMode(mode);
    }


    /* RESET BUTTON COLORS */
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


    /* HIDE UI FOR ALL MODES */
    function hideAllModeUI() {
        document.querySelector(".trim-left").style.display = "none";
        document.querySelector(".trim-right").style.display = "none";
    }


    /* ACTIVATE SPECIFIC MODE */
    function activateMode(mode) {

        switch (mode) {

            case "trim":
                document.querySelector(".trim-left").style.display = "block";
                document.querySelector(".trim-right").style.display = "block";
                break;

            case "filter":
                openFilterEditor();
                break;

            case "overlay":
                openOverlayMenu();
                break;
        }
    }


    /* ======================================================
       FILTERS (UPDATED, NO PROMPT)
    ====================================================== */
    function openFilterEditor() {

        openEditorModal("Choose Filter", [
            { label: "Brightness", action: () => video.style.filter = "brightness(1.4)" },
            { label: "Contrast", action: () => video.style.filter = "contrast(1.5)" },
            { label: "Saturate", action: () => video.style.filter = "saturate(1.8)" },
            { label: "None", action: () => video.style.filter = "none" }
        ]);
    }


    /* ======================================================
       OVERLAYS (UPDATED, NO PROMPT)
    ====================================================== */
    function openOverlayMenu() {

        openEditorModal("Add Overlay", [
            { label: "Text", action: () => BeatCamOverlays.addTextOverlay() },
            { label: "Emoji", action: () => BeatCamOverlays.addEmojiOverlay() },
            { label: "Image", action: () => BeatCamOverlays.addImageOverlay() }
        ]);
    }


    /* BUTTON CLICK EVENTS */
    toolTrim.addEventListener("click", () => setMode("trim"));
    toolFilter.addEventListener("click", () => setMode("filter"));
    toolOverlay.addEventListener("click", () => setMode("overlay"));


    /* PUBLIC API */
    window.BeatCamEditor = {
        setMode,
        getMode: () => currentMode
    };

});
