function startAccelerometer() {

    // iOS Safari requires permission request inside user gesture
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {

        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    console.log("Motion permission granted (iOS)");
                    window.addEventListener("devicemotion", sendAccelerationData);

                    // Hide the button once permissions are granted
                    const btn = document.getElementById("enableMotionBtn");
                    if (btn) btn.style.display = "none";
                } else {
                    console.log("Permission for motion denied.");
                }
            })
            .catch(error => {
                console.log("Error requesting motion permission:", error);
            });

    } else {
        // Android / desktop
        console.log("Motion permission not required");
        window.addEventListener("devicemotion", sendAccelerationData);

        const btn = document.getElementById("enableMotionBtn");
        if (btn) btn.style.display = "none";
    }
}
const accX = document.getElementById("accX");
const accY = document.getElementById("accY");
const accZ = document.getElementById("accZ");

function sendAccelerationData(event) {

    if (!event.accelerationIncludingGravity) return;

    let a = event.accelerationIncludingGravity;

    let x = a.x || 0;
    let y = a.y || 0;
    let z = a.z || 0;

    let newEvent = new CustomEvent("acceleration", {
        detail: { x, y, z }
    });

    document.dispatchEvent(newEvent);

    accX.innerHTML = a.x + ""
    accY.innerHTML = a.y + ""
    accZ.innerHTML = a.z + ""
}
