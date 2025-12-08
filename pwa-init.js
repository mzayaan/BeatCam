console.log("%c[PWA] Initializing…", "color:var(--main-color); font-weight:bold;");

// Detect Standalone Mode (Android + iOS)
const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

if (isStandalone) {
    console.log("%c[PWA] Running in standalone mode", "color:#22dd88");
} else {
    console.log("%c[PWA] Running in browser tab", "color:#999");
}

// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then((reg) => {
                console.log("%c[PWA] Service Worker registered", "color:#22dd88");

                if (reg.waiting) {
                    showUpdatePopup(reg);
                }

                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            showUpdatePopup(reg);
                        }
                    });
                });
            })
            .catch((err) => {
                console.error("[PWA] SW registration failed:", err);
            });
    });
}

// Install Prompt
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    console.log("%c[PWA] Install prompt available", "color:#ffc107");

    const btn = document.getElementById("pwaInstallBtn");
    if (btn) btn.style.display = "block";
});

function triggerInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choice) => {
        console.log("[PWA] User choice:", choice.outcome);
        deferredPrompt = null;
    });
}

// Offline/Online Events
function showOfflineBanner() {
    if (document.getElementById("offlineBanner")) return;

    let div = document.createElement("div");
    div.id = "offlineBanner";
    div.innerText = "You are offline";
    div.style = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ff4444;
        padding: 12px;
        text-align: center;
        color: white;
        font-weight: bold;
        z-index: 9999;
    `;
    document.body.appendChild(div);
}

function hideOfflineBanner() {
    const el = document.getElementById("offlineBanner");
    if (el) el.remove();
}

window.addEventListener("offline", () => {
    console.warn("[PWA] Offline mode");
    showOfflineBanner();
});

window.addEventListener("online", () => {
    console.log("%c[PWA] Back online", "color:#22dd88");
    hideOfflineBanner();
});

// Update popup
function showUpdatePopup(registration) {
    if (document.getElementById("updatePopup")) return;

    const div = document.createElement("div");
    div.id = "updatePopup";

    div.innerHTML = `
        <div style="
            position:fixed;
            bottom:25px;
            left:50%;
            transform:translateX(-50%);
            background:var(--main-color);
            color:white;
            padding:14px 22px;
            border-radius:12px;
            font-size:16px;
            box-shadow:0 0 10px rgba(130,43,217,0.5);
            z-index:99999;
        ">
            New version available
            <button id="updateAppBtn" style="
                margin-left:12px;
                background:white;
                color:var(--main-color);
                border:none;
                padding:6px 12px;
                font-weight:bold;
                border-radius:6px;
            ">Update</button>
        </div>
    `;

    document.body.appendChild(div);

    document.getElementById("updateAppBtn").addEventListener("click", () => {
        if (registration.waiting) {
            registration.waiting.postMessage({ action: "skipWaiting" });
        }
    });
}

// New SW activated
navigator.serviceWorker?.addEventListener("controllerchange", () => {
    console.log("%c[PWA] New service worker activated", "color:#22dd88");
    window.location.reload();
});

// First Launch Logging
if (!localStorage.getItem("pwa-first-launch")) {
    localStorage.setItem("pwa-first-launch", new Date().toISOString());
    console.log("%c[PWA] First launch detected", "color:#6cf");
}
