
document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const videoContainer = document.getElementById("video-container");
    const youtubeVideo = document.getElementById("youtube-video");
    const experimentButtons = document.querySelectorAll(".experiment-btn");
    let selectedExperiment = null; // 初期状態は未選択
    let hideTimeout; // 動画非表示タイマー

    // 🎯 Experiment ボタンのクリックイベント
    experimentButtons.forEach(button => {
        button.addEventListener("click", function () {
            selectedExperiment = this.getAttribute("data-experiment");

            // 動画を強制的に消す
            videoContainer.style.display = "none";
            youtubeVideo.src = "";

            // ボタンのスタイルを更新（選択されたボタンを強調）
            experimentButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    // 🍓 フルーツ画像のクリックイベント（ボタンが押されていないと無効）
    fruitImages.forEach(fruit => {
        fruit.addEventListener("click", function () {
            if (!selectedExperiment) {
                alert("Please select an experiment first!");
                return;
            }

            const videoId = this.getAttribute(`data-video-${selectedExperiment}`);
            const duration = parseInt(this.getAttribute(`data-duration-${selectedExperiment}`), 10) || 50000;

            if (!videoId) return;

            youtubeVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

            // 動画を表示
            videoContainer.style.display = "block";

            // 🔴 クリックしたフルーツの範囲を一時的に赤枠で表示
            fruitImages.forEach(f => f.style.border = "2px solid transparent"); // 他の枠をリセット
            this.style.border = "2px solid red"; 
            setTimeout(() => {
                this.style.border = "2px solid transparent"; // 1秒後に戻す
            }, 1000);

            // 既存のタイマーをクリア（連続クリック対策）
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }

            // 指定時間後に動画を非表示
            hideTimeout = setTimeout(() => {
                videoContainer.style.display = "none";
                youtubeVideo.src = ""; // 動画をリセット
            }, duration);
        });
    });
});
