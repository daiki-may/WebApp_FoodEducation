document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const experimentButtons = document.querySelectorAll(".experiment-btn");
    const preloadVideosContainer = document.getElementById("preload-videos");
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    let selectedExperiment = "VV_German"; // ✅ Ex2をデフォルト選択
    let preloadedVideos = {};
    let loadedVideos = 0;
    let totalVideos = 0;
    let currentPlayingVideo = null;

    // ✅ 初期状態で Ex2 ボタンを選択、他のボタンは無効化
    experimentButtons.forEach(button => {
        const exp = button.getAttribute("data-experiment");
        if (exp !== "VV_German") {
            button.classList.add("disabled");
            button.disabled = true;
        } else {
            button.classList.add("selected");
        }
    });

    // 🎯 Experiment ボタンのクリックイベント（Ex2 以外はクリック不可）
    experimentButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (this.classList.contains("disabled")) return; // 🚫 無効化されたボタンは無視

            selectedExperiment = this.getAttribute("data-experiment");

            // 🔴 現在再生中の動画があれば強制終了
            if (currentPlayingVideo) {
                resetVideo(currentPlayingVideo);
            }

            // ボタンのスタイル更新
            experimentButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    // 🎬 事前に Ex3 の動画 6 つをロードし、進捗を表示
    function preloadVideos() {
        const promises = [];
        let startTime = performance.now();

        fruitImages.forEach(fruit => {
            const videoUrl = fruit.getAttribute(`data-video-VV_German`); // ✅ Ex2 のみ
            if (videoUrl && !preloadedVideos[videoUrl]) {
                totalVideos++;
                const video = document.createElement("video");
                video.src = videoUrl;
                video.preload = "auto";
                video.muted = true;
                video.loop = false;
                video.style.display = "none";
                video.style.zIndex = "-1";
                video.setAttribute("data-video", videoUrl);
                preloadVideosContainer.appendChild(video);
                preloadedVideos[videoUrl] = video;

                // 🎬 最初の動画のロード時間を測定
                const videoLoadPromise = new Promise(resolve => {
                    video.addEventListener("canplaythrough", () => {
                        loadedVideos++;
                        updateActualProgress();
                        resolve();
                    });
                });

                promises.push(videoLoadPromise);
            }
        });

        // 🔴 すべての動画がロード完了したら Now Loading... を消す
        Promise.all(promises).then(() => {
            if (progressBar) {
                progressBar.style.width = "100%";
            }
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = "0";
                    setTimeout(() => {
                        loadingScreen.style.display = "none";
                    }, 500);
                }
            }, 500);
        });
    }

    // 🔵 実際の進捗バー更新（動画ごと）
    function updateActualProgress() {
        if (progressBar) {
            let actualProgress = (loadedVideos / totalVideos) * 100;
            progressBar.style.width = `${actualProgress}%`;
        }
    }

    // 🍓 フルーツ画像のクリックイベント（Ex2 以外は無効）
    fruitImages.forEach(fruit => {
        fruit.addEventListener("click", function () {
            if (selectedExperiment !== "VV_German") return; // 🚫 Ex2 以外ではクリック無効

            const videoUrl = this.getAttribute(`data-video-${selectedExperiment}`);
            const duration = parseInt(this.getAttribute(`data-duration`), 10) || 50000;

            if (!videoUrl) return;

            // 🔴 現在再生中の動画があれば強制終了
            if (currentPlayingVideo) {
                resetVideo(currentPlayingVideo);
            }

            // すべての事前ロード動画を隠す
            Object.values(preloadedVideos).forEach(video => {
                video.style.display = "none";
                video.style.zIndex = "-1";
                video.pause();
            });

            // 🎬 選択した動画を `front.png` の前に表示
            const selectedVideo = preloadedVideos[videoUrl];
            if (selectedVideo) {
                selectedVideo.style.display = "block";
                selectedVideo.style.zIndex = "2";
                selectedVideo.muted = false;
                selectedVideo.play().catch(error => {
                    console.warn("Playback failed, retrying:", error);
                    selectedVideo.muted = false;
                    selectedVideo.play();
                });

                // 現在再生中の動画を更新
                currentPlayingVideo = selectedVideo;
            }

            // ✅ 動画終了時に非表示にする
            selectedVideo.onended = function () {
                hideVideo(selectedVideo);
            };

            // ⏳ 指定時間後に動画を非表示
            setTimeout(() => {
                hideVideo(selectedVideo);
            }, duration);
        });
    });

    // 🎯 動画を非表示にする関数
    function hideVideo(video) {
        video.pause();
        video.style.display = "none";
        video.style.zIndex = "-1";
        video.currentTime = 0; // 🔴 次回再生時は最初から
        currentPlayingVideo = null;
    }

    // 🎯 動画をリセットする関数（途中で止められた場合に最初に戻す）
    function resetVideo(video) {
        video.pause();
        video.currentTime = 0; // 🔴 途中再生のままにしない
        video.style.display = "none";
        video.style.zIndex = "-1";
    }

    preloadVideos();
});