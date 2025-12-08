document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("studioVideo");

    /*  MAIN PUBLIC FUNCTION
       BeatCamFFT.detectBeats(videoElement) */
    async function detectBeats(videoEl) {
        if (!videoEl || !videoEl.src) {
            console.warn("[BeatFFT] No video loaded for beat detection.");
            return [];
        }

        console.log("[BeatFFT] Extracting audio...");

        const audioBuffer = await extractAudioFromVideo(videoEl);

        console.log("[BeatFFT] Running FFT + Peak Detection...");

        const peaks = detectPeaks(audioBuffer);

        console.log("[BeatFFT] Calculating BPM...");
        const bpm = estimateBPM(peaks);

        console.log(`🎵 [BeatFFT] BPM Detected: ${Math.round(bpm)} BPM`);

        // Convert sample index → time
        const beatTimes = peaks.map(i => i / audioBuffer.sampleRate);

        console.log("[BeatFFT] Total beats:", beatTimes.length);

        return beatTimes;
    }

    /* Extract Audio from Video (via MediaElementSource)*/
    async function extractAudioFromVideo(videoEl) {
        return new Promise((resolve) => {

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(videoEl);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);

            let samples = [];

            processor.onaudioprocess = (event) => {
                const input = event.inputBuffer.getChannelData(0);
                samples.push(new Float32Array(input));
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            videoEl.currentTime = 0;
            videoEl.play();

            // Stop after video finishes
            videoEl.onended = () => {
                processor.disconnect();
                source.disconnect();

                // Flatten samples
                const full = flattenSamples(samples);
                const audioBuffer = audioCtx.createBuffer(
                    1,
                    full.length,
                    audioCtx.sampleRate
                );
                audioBuffer.getChannelData(0).set(full);

                resolve(audioBuffer);
            };
        });
    }

    function flattenSamples(sampleArrays) {
        let length = sampleArrays.reduce((acc, arr) => acc + arr.length, 0);
        let full = new Float32Array(length);

        let offset = 0;
        for (let arr of sampleArrays) {
            full.set(arr, offset);
            offset += arr.length;
        }
        return full;
    }

    /* DETECT PEAKS (energy spike detection) */
    function detectPeaks(audioBuffer) {
        const data = audioBuffer.getChannelData(0);

        const threshold = 0.35; // Sensitivity
        const minGap = 3000;    // Samples between peaks

        let peaks = [];
        let lastPeak = 0;

        for (let i = 0; i < data.length; i++) {
            if (data[i] > threshold && i - lastPeak > minGap) {
                peaks.push(i);
                lastPeak = i;
            }
        }

        console.log("[BeatFFT] Peaks found:", peaks.length);
        return peaks;
    }

    /* ESTIMATE BPM FROM PEAK INTERVALS */
    function estimateBPM(peaks) {
        if (peaks.length < 2) return 0;

        let intervals = [];

        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;

        // samples → seconds → BPM
        const secondsPerBeat = avgInterval / 44100;
        return 60 / secondsPerBeat;
    }

    /* PUBLIC API EXPORTED TO WINDOW */
    window.BeatCamFFT = {
        detectBeats
    };

});
