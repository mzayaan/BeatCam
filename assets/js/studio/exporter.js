document.addEventListener("DOMContentLoaded", () => {

    let ffmpeg;
    let isFFmpegLoaded = false;

    /*  LOAD FFMPEG WASM */
    async function loadFFmpeg() {
        if (isFFmpegLoaded) return ffmpeg;

        console.log("[FFmpeg] Loading FFmpeg WASM...");

        ffmpeg = await FFmpeg.createFFmpeg({
            log: true,
            corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
        });

        await ffmpeg.load();

        console.log("%c[FFmpeg] Ready!", "color:#00ff00");
        isFFmpegLoaded = true;

        return ffmpeg;
    }

    /* PREPARE EXPORT*/
    async function prepareExport() {
        alert("Preparing export... Processing video now.");

        const videoEl = document.getElementById("studioVideo");
        const fileBlob = await fetch(videoEl.src).then(r => r.blob());

        const trim = BeatCamTimeline.getTrimBounds();

        const cropData = window.BeatCamCropBox
            ? window.BeatCamCropBox.getCropValues()
            : null;

        const filters = window.BeatCamFilters
            ? window.BeatCamFilters.getFilterString()
            : "";

        return await exportVideo(fileBlob, trim, cropData, filters);
    }

    /* EXPORT VIDEO USING FFMPEG */
    async function exportVideo(blob, trim, cropVal, filterString) {

        ffmpeg = await loadFFmpeg();

        console.log("[Export] Converting Blob to FFmpeg file...");
        const uint8 = new Uint8Array(await blob.arrayBuffer());

        /* Write input video to FFmpeg FS */
        ffmpeg.FS("writeFile", "input.mp4", uint8);

        /*Build FFmpeg Filter Chain */
        let vf = [];

        if (cropVal) {
            vf.push(`crop=${cropVal.w}:${cropVal.h}:${cropVal.x}:${cropVal.y}`);
        }

        if (filterString) {
            vf.push(filterString);
        }

        let filterCmd = [];
        if (vf.length > 0) {
            filterCmd = ["-vf", vf.join(",")];
        }

        /*Trim Arguments */
        const trimArgs = [
            "-ss", trim.start.toFixed(2),
            "-to", trim.end.toFixed(2)
        ];

        /* Full FFmpeg Command */
        const args = [
            "-i", "input.mp4",
            ...trimArgs,
            ...filterCmd,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "output.mp4"
        ];

        console.log("[FFmpeg] Running command:", args.join(" "));

        await ffmpeg.run(...args);

        /* Retrieve exported video */
        const data = ffmpeg.FS("readFile", "output.mp4");
        const outBlob = new Blob([data.buffer], { type: "video/mp4" });

        downloadOutput(outBlob);

        return outBlob;
    }

    /* DOWNLOAD EXPORTED VIDEO */
    function downloadOutput(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "BeatCam_Export.mp4";
        a.click();

        URL.revokeObjectURL(url);
        console.log("[Export] Video downloaded.");
    }

    /* PUBLIC API */
    window.BeatCamExporter = {
        prepareExport
    };

});
