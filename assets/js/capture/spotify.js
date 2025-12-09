const SPOTIFY_CLIENT_ID = "260e523c8d1e430899632bd0f233e2ce";
let breakLoop = false;
// Dynamically match current domain (desktop OR phone)
const SPOTIFY_REDIRECT_URI = `${window.location.origin + window.location.pathname}`;

console.log(SPOTIFY_REDIRECT_URI)
function generateCodeVerifier() {
    let text = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 128; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function connectSpotify() {
    const verifier = generateCodeVerifier();
    localStorage.setItem("spotify_verifier", verifier);

    const challenge = await generateCodeChallenge(verifier);

    const scope = [
        "user-read-currently-playing",
        "user-read-playback-state",
        "user-read-private"
    ].join(" ");

    window.location.href = "https://accounts.spotify.com/authorize" +
        `?client_id=${SPOTIFY_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
        "&code_challenge_method=S256" +
        `&code_challenge=${challenge}` +
        `&scope=${encodeURIComponent(scope)}`;
}

async function fetchAccessToken(code) {
    const verifier = localStorage.getItem("spotify_verifier");

    const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
    });

    const json = await response.json();

    if (json.access_token) {
        localStorage.setItem("spotify_access_token", json.access_token);
        localStorage.setItem("spotify_refresh_token", json.refresh_token);
        localStorage.setItem("spotify_expires_at", Date.now() + json.expires_in * 1000);
    }

    return json;
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return null;

    const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
    });

    const json = await response.json();

    if (json.access_token) {
        localStorage.setItem("spotify_access_token", json.access_token);
        localStorage.setItem("spotify_expires_at", Date.now() + json.expires_in * 1000);
    }

    return json;
}

async function getValidAccessToken() {
    const expires = localStorage.getItem("spotify_expires_at");

    if (!expires || Date.now() > expires) {
        console.log("🔄 Refreshing Spotify token...");
        await refreshAccessToken();
    }

    return localStorage.getItem("spotify_access_token");
}

async function getCurrentlyPlaying() {
    const token = await getValidAccessToken();
    if (!token) return null;

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: "Bearer " + token }
    });

    if (response.status === 204) return null; // No song playing

    return await response.json();
}

function showSongOverlay(song) {
    if (!song || !song.item) return;

    const title = song.item.name;
    const artist = song.item.artists.map(a => a.name).join(", ");
    const img = song.item.album.images[1].url;

    let old = document.getElementById("spotifyOverlay");
    if (old) old.remove();

    const html = `
        <div id="spotifyOverlay" 
             style="
                position: fixed;
                bottom: 80px;
                min-width: 250px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.75);
                padding: 12px 20px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
                font-size: 15px;
                backdrop-filter: blur(6px);
                z-index: 9999;
             ">
            <img src="${img}" width="55" height="55" style="border-radius: 8px;">
            <div>
                <div><strong>${title}</strong></div>
                <div style="opacity:0.8;">${artist}</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
}

async function updateSpotifyOverlay() {
    if (breakLoop) return;
    const song = await getCurrentlyPlaying();
    showSongOverlay(song);
    setTimeout(updateSpotifyOverlay, 12000);
}

function startDisplayLoop() {
    if (localStorage.getItem("spotify_access_token")) {
        updateSpotifyOverlay();
        const btn = document.getElementById("spotifyConnectBtn");
        btn.classList.remove("btn-success");
        btn.classList.add("btn-danger");
        btn.innerText = "❌ Disconnect from Spotify";
    } else {
        breakLoop = true;
    }
}