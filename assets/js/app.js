document.addEventListener("DOMContentLoaded", async () => {
    loadHeader();
    loadFooter();
    loadBottomNav();
});

/* Load Header */
function loadHeader() {
    const container = document.getElementById("master-header");
    if (container) {
        fetch("/BeatCam/partials/header.html")
            .then(res => res.text())
            .then(html => container.innerHTML = html)
            .catch(err => console.error("Header load error:", err));
    }
}

/* Load Footer */
function loadFooter() {
    const container = document.getElementById("master-footer");
    if (container) {
        fetch("/BeatCam/partials/footer.html")
            .then(res => res.text())
            .then(html => container.innerHTML = html)
            .catch(err => console.error("Footer load error:", err));
    }
}

/* Load Bottom Navigation */
function loadBottomNav() {
    const container = document.getElementById("bottomNav");
    if (container) {
        fetch("/BeatCam/partials/bottom-nav.html")
            .then(res => res.text())
            .then(html => {
                container.innerHTML = html;
                highlightActiveTab();
            })
            .catch(err => console.error("Bottom nav load error:", err));
    }
}

/* ----------------------------------------
   FIXED: Highlight Active Tab
   ---------------------------------------- */
function highlightActiveTab() {
    // Get the filename of the current page
    const currentPage = window.location.pathname.split("/BeatCam/").pop();

    const navLinks = document.querySelectorAll(".bottom-nav a");

    navLinks.forEach(link => {
        // Normalize "/BeatCam/" or "/BeatCam/" → leave only the file name
        let linkPage = link.getAttribute("href")
            ?.replace(/^\.\//, "")      // remove "/BeatCam/"
            ?.replace(/^\.\.\//, "");   // remove "/BeatCam/"

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
}

/* Fade In Animation Wrapper */
function fadeIn(element) {
    element.style.opacity = 0;
    element.style.transition = "opacity 0.4s";
    setTimeout(() => {
        element.style.opacity = 1;
    }, 10);
}


/* Database Functions */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("BeatCamDB", 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("clips")) {
                db.createObjectStore("clips", { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}
async function saveClip(blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("clips", "readwrite");
        const store = tx.objectStore("clips");
        const request = store.add({ blob, createdAt: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}
async function deleteClip(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("clips", "readwrite");
        const store = tx.objectStore("clips");
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}
async function loadClip(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("clips", "readonly");
        const store = tx.objectStore("clips");
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}
async function listClips() {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction("clips", "readonly");
        const store = tx.objectStore("clips");
        const result = [];
        store.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                result.push({ id: cursor.key, ...cursor.value });
                cursor.continue();
            } else {
                resolve(result);
            }
        };
    });
}
async function deleteAllClips() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("clips", "readonly");
        const store = tx.objectStore("clips");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}


/* App Ready Log */
console.log("app.js loaded successfully");


// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("SW registration failed:", err));
}
