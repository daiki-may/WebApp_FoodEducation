// document.addEventListener("DOMContentLoaded", function () {
//     const fruitImages = document.querySelectorAll(".fruit");
//     const experimentButtons = document.querySelectorAll(".experiment-btn");
//     const preloadVideosContainer = document.getElementById("preload-videos");
//     const loadingScreen = document.getElementById("loading-screen");
//     const progressBar = document.getElementById("progress-bar");
//     let selectedExperiment = null;
//     let preloadedVideos = {};
//     let loadedVideos = 0;
//     let totalVideos = 0;
//     let currentPlayingVideo = null; // 現在再生中の動画
//     let startTime = null;
//     let progress = 0;
//     let animationFrameId = null;
//     let firstLoadTime = null;
//     let estimatedTotalTime = null;

//     // 🎯 Experiment ボタンのクリックイベント（動画を強制停止 & 実験モード切り替え）
//     experimentButtons.forEach(button => {
//         button.addEventListener("click", function () {
//             selectedExperiment = this.getAttribute("data-experiment");

//             // 🔴 再生中の動画があれば強制停止してリセット
//             if (currentPlayingVideo) {
//                 resetVideo(currentPlayingVideo);
//             }

//             // ボタンのスタイル更新
//             experimentButtons.forEach(btn => btn.classList.remove("selected"));
//             this.classList.add("selected");
//         });
//     });

//     // 🎬 事前に動画をロードし、進捗を表示
//     function preloadVideos() {
//         const promises = [];
//         startTime = performance.now();

//         fruitImages.forEach(fruit => {
//             experimentButtons.forEach(button => {
//                 const exp = button.getAttribute("data-experiment");
//                 const videoUrl = fruit.getAttribute(`data-video-${exp}`);

//                 if (videoUrl && !preloadedVideos[videoUrl]) {
//                     totalVideos++;
//                     const video = document.createElement("video");
//                     video.src = videoUrl;
//                     video.preload = "auto";
//                     video.muted = true;
//                     video.loop = false;
//                     video.style.display = "none";
//                     video.style.zIndex = "-1";
//                     video.setAttribute("data-video", videoUrl);
//                     preloadVideosContainer.appendChild(video);
//                     preloadedVideos[videoUrl] = video;

//                     // 🎬 最初の動画のロード時間を測定
//                     const videoLoadPromise = new Promise(resolve => {
//                         video.addEventListener("canplaythrough", () => {
//                             if (firstLoadTime === null) {
//                                 firstLoadTime = performance.now() - startTime;
//                                 estimatedTotalTime = firstLoadTime * totalVideos;
//                                 startProgressAnimation(estimatedTotalTime);
//                             }
//                             loadedVideos++;
//                             updateActualProgress();
//                             resolve();
//                         });
//                     });

//                     promises.push(videoLoadPromise);
//                 }
//             });
//         });

//         // 🔴 すべての動画がロード完了したら Now Loading... を消す
//         Promise.all(promises).then(() => {
//             cancelAnimationFrame(animationFrameId);
//             progressBar.style.width = "100%";
//             setTimeout(() => {
//                 loadingScreen.style.opacity = "0";
//                 setTimeout(() => {
//                     loadingScreen.style.display = "none";
//                 }, 500);
//             }, 500);
//         });
//     }

//     // 🔵 進捗バーのアニメーションを開始
//     function startProgressAnimation(totalTime) {
//         let startAnimationTime = performance.now();

//         function updateProgress() {
//             let currentTime = performance.now();
//             let elapsed = currentTime - startAnimationTime;
//             let estimatedProgress = Math.min((elapsed / totalTime) * 100, 100);
//             let actualProgress = (loadedVideos / totalVideos) * 100;

//             progress = Math.max(progress, estimatedProgress, actualProgress);
//             progressBar.style.width = `${progress}%`;

//             if (progress < 100) {
//                 animationFrameId = requestAnimationFrame(updateProgress);
//             }
//         }
//         animationFrameId = requestAnimationFrame(updateProgress);
//     }

//     // 🔵 実際の進捗バー更新（動画ごと）
//     function updateActualProgress() {
//         let actualProgress = (loadedVideos / totalVideos) * 100;
//         progress = Math.max(progress, actualProgress);
//         progressBar.style.width = `${progress}%`;
//     }

//     // 🍓 フルーツ画像のクリックイベント（ボタンが押されていないと無効）
//     fruitImages.forEach(fruit => {
//         fruit.addEventListener("click", function () {
//             if (!selectedExperiment) {
//                 alert("Please select an experiment first!");
//                 return;
//             }

//             const videoUrl = this.getAttribute(`data-video-${selectedExperiment}`);
//             const duration = parseInt(this.getAttribute(`data-duration`), 10) || 50000;

//             if (!videoUrl) return;

//             // 🔴 再生中の動画があれば強制停止してリセット
//             if (currentPlayingVideo) {
//                 resetVideo(currentPlayingVideo);
//             }

//             // すべての事前ロード動画を隠す
//             Object.values(preloadedVideos).forEach(video => {
//                 video.style.display = "none";
//                 video.style.zIndex = "-1";
//                 video.pause();
//             });

//             // 🎬 選択した動画を `front.png` の前に表示
//             const selectedVideo = preloadedVideos[videoUrl];
//             if (selectedVideo) {
//                 selectedVideo.style.display = "block";
//                 selectedVideo.style.zIndex = "2";
//                 selectedVideo.muted = false;
//                 selectedVideo.play().catch(error => {
//                     console.warn("Playback failed, retrying:", error);
//                     selectedVideo.muted = false;
//                     selectedVideo.play();
//                 });

//                 // 現在再生中の動画を更新
//                 currentPlayingVideo = selectedVideo;
//             }

//             // ✅ 動画終了時に非表示にする
//             selectedVideo.onended = function () {
//                 hideVideo(selectedVideo);
//             };

//             // ⏳ 指定時間後に動画を非表示
//             setTimeout(() => {
//                 hideVideo(selectedVideo);
//             }, duration);
//         });
//     });

//     // 🎯 動画を非表示にする関数
//     function hideVideo(video) {
//         video.pause();
//         video.style.display = "none";
//         video.style.zIndex = "-1";
//         video.currentTime = 0; // 🔴 次回再生時は最初から
//         currentPlayingVideo = null;
//     }

//     // 🎯 動画をリセットする関数（途中で止められた場合に最初に戻す）
//     function resetVideo(video) {
//         video.pause();
//         video.currentTime = 0; // 🔴 途中再生のままにしない
//         video.style.display = "none";
//         video.style.zIndex = "-1";
//     }

//     preloadVideos();
// });

document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const preloadVideosContainer = document.getElementById("preload-videos");
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    const videoContainer = document.getElementById("video-container");
    const videoElement = document.getElementById("experiment-video");
    const videoSource = document.getElementById("video-source");

    let selectedExperiment = null;
    let preloadedVideos = {};
    let loadedVideos = 0;
    let totalVideos = 0;
    let currentPlayingVideo = null;

    // 🌟 ブランチ名ごとに実験モードを設定
    const hostname = window.location.hostname;
    if (hostname.includes("experiment-1")) {
        selectedExperiment = "V_German";
    } else if (hostname.includes("experiment-2")) {
        selectedExperiment = "VV_German";
    } else if (hostname.includes("experiment-3")) {
        selectedExperiment = "VVP_German";
    } else {
        selectedExperiment = "V_German"; // デフォルト（ローカル or main）
    }

    console.log(`Selected experiment: ${selectedExperiment}`);

    // 🎬 事前に動画をロード（ex3ならVVP_Germanのみロード）
    function preloadVideos() {
        const promises = [];
        loadedVideos = 0;  // 初期化
        totalVideos = 0;    // 初期化

        fruitImages.forEach(fruit => {
            const videoUrl = fruit.getAttribute(`data-video-${selectedExperiment}`);
            if (videoUrl && !preloadedVideos[videoUrl]) {
                totalVideos++;
                const video = document.createElement("video");
                video.src = videoUrl;
                video.preload = "auto";
                video.muted = true;
                video.loop = false;
                video.style.display = "none";
                video.setAttribute("data-video", videoUrl);
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
            console.log("All videos preloaded successfully.");
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
            const videoUrl = this.getAttribute(`data-video-${selectedExperiment}`);
            if (!videoUrl) {
                console.error("動画が見つかりません:", this);
                return;
            }

            // 🔴 再生中の動画があれば停止
            if (currentPlayingVideo) {
                resetVideo(currentPlayingVideo);
            }

            // 🎬 動画をセットして再生
            videoSource.src = videoUrl;
            videoElement.load();  // **これで新しい動画を確実にロード**
            videoElement.play();  // **新しい動画を確実に再生**

            // ✅ **動画を表示**
            videoContainer.style.display = "block";  // `display: none;` を解除
            videoContainer.style.zIndex = "5";      // `z-index` を上げて前面に表示

            // 現在の動画を更新
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
        videoContainer.style.display = "none";  // **動画コンテナも非表示に**
        video.currentTime = 0;
        currentPlayingVideo = null;
    }

    // 🎯 動画をリセットする関数
    function resetVideo(video) {
        video.pause();
        video.currentTime = 0;
        video.style.display = "none";
        videoContainer.style.display = "none";  // **動画コンテナも非表示に**
    }

    preloadVideos();
});
