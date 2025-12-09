document.addEventListener("DOMContentLoaded", () => {

    const overlayTrack = document.getElementById("overlayTrack");
    const videoPreview = document.getElementById("videoPreviewContainer");

    let overlays = []; // stored overlays



    function addTextOverlay() {
        const text = prompt("Enter text:");
        if (!text) return;

        overlays.push(createOverlayElement("text", text));
    }

    function addEmojiOverlay() {
        const emoji = prompt("Enter emoji:");
        if (!emoji) return;

        overlays.push(createOverlayElement("emoji", emoji));
    }

    function addImageOverlay() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = () => {
            const file = input.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);

            overlays.push(createOverlayElement("image", url));
        };

        input.click();
    }

    function createOverlayElement(type, content) {

        const el = document.createElement("div");
        el.classList.add("overlay-item");
        el.style.position = "absolute";
        el.style.left = "40%";
        el.style.top = "40%";
        el.style.fontSize = "26px";
        el.style.zIndex = 300;
        el.style.cursor = "move";

        if (type === "text") el.innerText = content;
        if (type === "emoji") el.innerText = content;
        if (type === "image") {
            el.innerHTML = `<img src="${content}" class="overlay-img" style="max-width:150px;">`;
        }

        // Enable interactions
        makeOverlayDraggable(el);
        addResizeHandle(el);
        enablePinchZoom(el);

        videoPreview.appendChild(el);

        /* TIMELINE BLOCK */
        const block = document.createElement("div");
        block.classList.add("overlay-block");
        block.style.width = "60px";
        block.style.height = "20px";
        block.style.background = "#ff44aa";
        block.style.marginRight = "6px";
        block.style.borderRadius = "4px";

        overlayTrack.appendChild(block);

        return { type, content, element: el, block };
    }

    function makeOverlayDraggable(el) {

        let isDragging = false;
        let startX = 0, startY = 0;
        let origX = 0, origY = 0;

        function start(e) {
            isDragging = true;
            const evt = e.touches ? e.touches[0] : e;

            startX = evt.clientX;
            startY = evt.clientY;

            origX = el.offsetLeft;
            origY = el.offsetTop;

            el.classList.add("no-select");
        }

        function move(e) {
            if (!isDragging) return;

            const evt = e.touches ? e.touches[0] : e;

            const dx = evt.clientX - startX;
            const dy = evt.clientY - startY;

            el.style.left = origX + dx + "px";
            el.style.top = origY + dy + "px";
        }

        function end() {
            isDragging = false;
            el.classList.remove("no-select");
        }

        // Mouse
        el.addEventListener("mousedown", start);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);

        // Touch
        el.addEventListener("touchstart", start);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    }


    function addResizeHandle(el) {
        const handle = document.createElement("div");
        handle.classList.add("resize-handle");

        // styling
        handle.style.width = "20px";
        handle.style.height = "20px";
        handle.style.position = "absolute";
        handle.style.right = "0";
        handle.style.bottom = "0";
        handle.style.background = "rgba(255,255,255,0.5)";
        handle.style.borderRadius = "4px";
        handle.style.cursor = "nwse-resize";
        handle.style.zIndex = "500";

        el.appendChild(handle);

        let resizing = false;
        let startX = 0, startY = 0;
        let startW = 0, startH = 0;

        handle.addEventListener("mousedown", e => {
            resizing = true;

            startX = e.clientX;
            startY = e.clientY;

            const rect = el.getBoundingClientRect();
            startW = rect.width;
            startH = rect.height;

            e.stopPropagation();
        });

        window.addEventListener("mousemove", e => {
            if (!resizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            el.style.width = (startW + dx) + "px";
            el.style.height = (startH + dy) + "px";
        });

        window.addEventListener("mouseup", () => resizing = false);
    }


    function enablePinchZoom(el) {
        let initialDist = 0;
        let initialWidth = 0;

        el.addEventListener("touchstart", e => {
            if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;

                initialDist = Math.sqrt(dx*dx + dy*dy);
                initialWidth = el.offsetWidth;
            }
        });

        el.addEventListener("touchmove", e => {
            if (e.touches.length === 2) {
                const dx = e.touches[1].clientX - e.touches[0].clientX;
                const dy = e.touches[1].clientY - e.touches[0].clientY;

                const newDist = Math.sqrt(dx*dx + dy*dy);
                const scale = newDist / initialDist;

                el.style.width = (initialWidth * scale) + "px";

                e.preventDefault();
            }
        });
    }


    window.BeatCamOverlays = {
        addTextOverlay,
        addEmojiOverlay,
        addImageOverlay
    };

});
