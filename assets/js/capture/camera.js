let cameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

let currentFacingMode = "environment";
let currentResolution = "720p";
let currentFilter = "none";

// Timer vars
let timerInterval = null;
let seconds = 0;


/* START/STOP CAMERA + CONSTRAINTS */
function getCameraConstraints() {
    let resolution;
    switch (currentResolution) {
        case "480p":
            resolution = { width: { ideal: 640 }, height: { ideal: 480 } };
            break;
        case "1080p":
            resolution = { width: { ideal: 1920 }, height: { ideal: 1080 } };
            break;
        default:
            resolution = { width: { ideal: 1280 }, height: { ideal: 720 } };
    }
    return {
        audio: false,
        video: {
            facingMode: currentFacingMode,
            ...resolution
        }
    };
}
async function startCamera() {
    try {
        if (cameraStream) stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());

        const videoElement = document.getElementById("cameraView");
        if (videoElement) {
            videoElement.srcObject = cameraStream;
            applyFilter();
        }

        console.log("📷 Camera started");
    } catch (err) {
        console.error("Camera error:", err);
        alert("Please allow camera permissions in your browser to use BeatCam.");
    }
}
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
}


/* SWITCH CAMERA / RESOLUTION PICKER / VIDEO FILTERS / SHAKE EFFECT (Accelerometer) */
document.addEventListener("DOMContentLoaded", () => {
    const switchBtn = document.getElementById("switchCamera");
    if (!switchBtn) return;

    switchBtn.addEventListener("click", async () => {
        currentFacingMode =
            currentFacingMode === "environment" ? "user" : "environment";

        await startCamera();
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const resSelect = document.getElementById("resolutionSelect");
    if (!resSelect) return;

    resSelect.addEventListener("change", async () => {
        currentResolution = resSelect.value;
        await startCamera();
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const filterSelect = document.getElementById("filterSelect");
    if (!filterSelect) return;

    filterSelect.addEventListener("change", () => {
        currentFilter = filterSelect.value;
        applyFilter();
    });
});
document.addEventListener("acceleration", e => {
    if (isRecording && e.detail) {
        applyShakeEffect(e.detail.x, e.detail.y, e.detail.z);
    }
});
function applyFilter() {
    const video = document.getElementById("cameraView");
    if (!video) return;

    switch (currentFilter) {
        case "bw":
            video.style.filter = "grayscale(100%)";
            break;
        case "vivid":
            video.style.filter = "contrast(135%) saturate(140%)";
            break;
        case "purple":
            video.style.filter = "hue-rotate(260deg) saturate(150%)";
            break;
        case "blur":
            video.style.filter = "blur(2px)";
            break;
        default:
            video.style.filter = "none";
    }
}
function applyShakeEffect(x, y, z) {
    const video = document.getElementById("cameraView");
    if (!video) return;

    video.style.transform = `translate(${x}px, ${y}px)`;

    setTimeout(() => {
        video.style.transform = "translate(0, 0)";
    }, 50);
}


/* TIMER FUNCTIONS */
function startTimer() {
    seconds = 0;

    const timerEl = document.getElementById("recordTimer");
    if (timerEl) timerEl.innerText = "00:00";

    timerInterval = setInterval(() => {
        seconds++;
        let min = String(Math.floor(seconds / 60)).padStart(2, "0");
        let sec = String(seconds % 60).padStart(2, "0");
        if (timerEl) timerEl.innerText = `${min}:${sec}`;
    }, 1000);
}
function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}


/* RECORDING - SAVE CLIP TO LIBRARY (Stores Blob URLs, NOT base64 👍) */
function startRecording() {
    // Reset beat tracking for new recording
    if (window.BeatSync) {
        BeatSync.clearBeats();
    }
    mediaRecorder = new MediaRecorder(cameraStream, {
        mimeType: "video/webm"
    });
    recordedChunks = [];
    mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    isRecording = true;
    console.log("🔴 Recording started");
}
async function saveRecording() {
    const blob = new Blob(recordedChunks, {type: "video/webm"});

    // store the blob in the DB
    const clipId = await saveClip(blob);
    sessionStorage.setItem("selected-clip-id", clipId + "")

    // Redirect to studio
    window.location.href = "studio.html";
}