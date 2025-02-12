document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const preloadVideosContainer = document.getElementById("preload-videos");
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    const videoContainer = document.getElementById("video-container");
    const videoElement = document.getElementById("experiment-video");
    const videoSource = document.getElementById("video-source");

    let preloadedVideos = {};
    let loadedVideos = 0;
    let totalVideos = 6; // VVP_Germanの動画6つ
    let currentPlayingVideo = null;

    console.log("Experiment 3 mode: Preloading VVP_German videos...");

    // 🎬 事前に動画をロード
    function preloadVideos() {
        const promises = [];

        fruitImages.forEach(fruit => {
            const videoUrl = fruit.getAttribute(`data-video-VVP_German`);
            if (videoUrl && !preloadedVideos[videoUrl]) {
                const video = document.createElement("video");
                video.src = videoUrl;
                video.preload = "auto";
                video.muted = true;
                video.loop = false;
                video.style.display = "none";
                preloadVideosContainer.appendChild(video);
                preloadedVideos[videoUrl] = video;

                const videoLoadPromise = new Promise(resolve => {
                    video.addEventListener("canplaythrough", () => {
                        loadedVideos++;
                        updateProgressBar();
                        resolve();
                    });
                });

                promises.push(videoLoadPromise);
            }
        });

        // 🎯 すべての動画がロードされたらローディング画面を非表示
        Promise.all(promises).then(() => {
            console.log("All VVP_German videos preloaded successfully.");
            setTimeout(() => {
                loadingScreen.style.opacity = "0";
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                }, 500);
            }, 500);
        });
    }

    // 🎯 進捗バーの更新
    function updateProgressBar() {
        let progress = (loadedVideos / totalVideos) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // 🍓 フルーツ画像のクリックイベント
    fruitImages.forEach(fruit => {
        fruit.addEventListener("click", function () {
            const videoUrl = this.getAttribute(`data-video-VVP_German`);
            if (!videoUrl) {
                console.error("動画が見つかりません:", this);
                return;
            }

            // 🔴 **現在の動画が再生中なら強制終了**
            if (currentPlayingVideo) {
                resetVideo(currentPlayingVideo);
            }

            // 🎬 **新しい動画をセット**
            videoSource.src = videoUrl;
            videoElement.load();

            // ✅ **動画の準備ができたら再生**
            videoElement.addEventListener("canplaythrough", function playVideoOnce() {
                videoElement.play();
                videoElement.removeEventListener("canplaythrough", playVideoOnce);
            });

            // ✅ **動画を確実に表示**
            videoContainer.style.display = "block";  
            videoContainer.style.zIndex = "5";      

            // ✅ **新しい動画を現在の動画としてセット**
            currentPlayingVideo = videoElement;

            // ✅ 動画終了時に非表示
            videoElement.onended = function () {
                hideVideo(videoElement);
            };
        });
    });

    // 🎯 動画を非表示にする関数
    function hideVideo(video) {
        video.pause();
        video.style.display = "none";
        videoContainer.style.display = "none";  
        video.currentTime = 0;
        currentPlayingVideo = null;
    }

    // 🎯 **動画を強制終了する関数**
    function resetVideo(video) {
        console.log("Resetting current video...");
        video.pause();
        video.currentTime = 0;
        video.load();
        video.style.display = "none";
        videoContainer.style.display = "none";  
    }

    preloadVideos();
});
