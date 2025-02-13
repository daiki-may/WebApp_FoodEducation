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


// #######################################################################

document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const experimentButtons = document.querySelectorAll(".experiment-btn");
    const preloadVideosContainer = document.getElementById("preload-videos");
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    let selectedExperiment = "VVP_German"; // ✅ Ex3をデフォルト選択
    let preloadedVideos = {};
    let loadedVideos = 0;
    let totalVideos = 0;
    let currentPlayingVideo = null;

    // ✅ 初期状態で Ex3 ボタンを選択、他のボタンは無効化
    experimentButtons.forEach(button => {
        const exp = button.getAttribute("data-experiment");
        if (exp !== "VVP_German") {
            button.classList.add("disabled");
            button.disabled = true;
        } else {
            button.classList.add("selected");
        }
    });

    // 🎯 Experiment ボタンのクリックイベント（Ex3 以外はクリック不可）
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
            const videoUrl = fruit.getAttribute(`data-video-VVP_German`); // ✅ Ex3 のみ
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

    // 🍓 フルーツ画像のクリックイベント（Ex3 以外は無効）
    fruitImages.forEach(fruit => {
        fruit.addEventListener("click", function () {
            if (selectedExperiment !== "VVP_German") return; // 🚫 Ex3 以外ではクリック無効

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

