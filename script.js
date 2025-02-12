document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const experimentButtons = document.querySelectorAll(".experiment-btn");
    const preloadVideosContainer = document.getElementById("preload-videos");
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    let selectedExperiment = null;
    let preloadedVideos = {};
    let loadedVideos = 0;
    let totalVideos = 0;
    let currentPlayingVideo = null; // 現在再生中の動画
    let startTime = null;
    let progress = 0;
    let animationFrameId = null;
    let firstLoadTime = null;
    let estimatedTotalTime = null;

    // 🌟 ブランチ名ごとに異なる実験モードを設定
    const hostname = window.location.hostname;

    if (hostname.includes("experiment-1")) {
        selectedExperiment = "experiment-1";
    } else if (hostname.includes("experiment-2")) {
        selectedExperiment = "experiment-2";
    } else if (hostname.includes("experiment-3")) {
        selectedExperiment = "experiment-3";
    } else {
        selectedExperiment = "default"; // `main` ブランチやローカル環境用
    }

    // 🎯 Experiment ボタンのクリックイベント（ボタンは非表示または削除する）
    experimentButtons.forEach(button => button.style.display = "none"); // ボタンを非表示にする

    // 🎯 初期設定時にボタンのスタイルを適用（選択された実験を適用）
    experimentButtons.forEach(button => {
        if (button.getAttribute("data-experiment") === selectedExperiment) {
            button.classList.add("selected");
        }
    });

    // 実験に応じた処理を適用
    applyExperiment(selectedExperiment);

    // 🔥 実験に応じた処理
    function applyExperiment(experiment) {
        if (experiment === "experiment-1") {
            console.log("Experiment 1: 特定の設定を適用");
            // Experiment 1の処理を書く
        } else if (experiment === "experiment-2") {
            console.log("Experiment 2: 別の設定を適用");
            // Experiment 2の処理を書く
        } else if (experiment === "experiment-3") {
            console.log("Experiment 3: 異なる設定を適用");
            // Experiment 3の処理を書く
        } else {
            console.log("Default モード");
            // デフォルトの処理
        }
    }


    // 🎬 事前に動画をロードし、進捗を表示
    function preloadVideos() {
        const promises = [];
        startTime = performance.now();

        fruitImages.forEach(fruit => {
            experimentButtons.forEach(button => {
                const exp = button.getAttribute("data-experiment");
                const videoUrl = fruit.getAttribute(`data-video-${exp}`);

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
                            if (firstLoadTime === null) {
                                firstLoadTime = performance.now() - startTime;
                                estimatedTotalTime = firstLoadTime * totalVideos;
                                startProgressAnimation(estimatedTotalTime);
                            }
                            loadedVideos++;
                            updateActualProgress();
                            resolve();
                        });
                    });

                    promises.push(videoLoadPromise);
                }
            });
        });

        // 🔴 すべての動画がロード完了したら Now Loading... を消す
        Promise.all(promises).then(() => {
            cancelAnimationFrame(animationFrameId);
            progressBar.style.width = "100%";
            setTimeout(() => {
                loadingScreen.style.opacity = "0";
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                }, 500);
            }, 500);
        });
    }

    // 🔵 進捗バーのアニメーションを開始
    function startProgressAnimation(totalTime) {
        let startAnimationTime = performance.now();

        function updateProgress() {
            let currentTime = performance.now();
            let elapsed = currentTime - startAnimationTime;
            let estimatedProgress = Math.min((elapsed / totalTime) * 100, 100);
            let actualProgress = (loadedVideos / totalVideos) * 100;

            progress = Math.max(progress, estimatedProgress, actualProgress);
            progressBar.style.width = `${progress}%`;

            if (progress < 100) {
                animationFrameId = requestAnimationFrame(updateProgress);
            }
        }
        animationFrameId = requestAnimationFrame(updateProgress);
    }

    // 🔵 実際の進捗バー更新（動画ごと）
    function updateActualProgress() {
        let actualProgress = (loadedVideos / totalVideos) * 100;
        progress = Math.max(progress, actualProgress);
        progressBar.style.width = `${progress}%`;
    }

    // 🍓 フルーツ画像のクリックイベント（ボタンが押されていないと無効）
    fruitImages.forEach(fruit => {
        fruit.addEventListener("click", function () {
            if (!selectedExperiment) {
                alert("Please select an experiment first!");
                return;
            }

            const videoUrl = this.getAttribute(`data-video-${selectedExperiment}`);
            const duration = parseInt(this.getAttribute(`data-duration`), 10) || 50000;

            if (!videoUrl) return;

            // 🔴 再生中の動画があれば強制停止してリセット
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
