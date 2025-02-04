document.addEventListener("DOMContentLoaded", function () {
    const fruitImages = document.querySelectorAll(".fruit");
    const videoContainer = document.getElementById("video-container");
    const experimentVideo = document.getElementById("experiment-video");
    const experimentButtons = document.querySelectorAll(".experiment-btn");
    let selectedExperiment = null; // 初期状態は未選択
    let hideTimeout; // 動画非表示タイマー

    // 🎯 Experiment ボタンのクリックイベント
    experimentButtons.forEach(button => {
        button.addEventListener("click", function () {
            selectedExperiment = this.getAttribute("data-experiment");

            // 動画を停止して非表示にする
            experimentVideo.pause();
            experimentVideo.src = "";
            experimentVideo.load(); // 次の再生のためにリセット
            videoContainer.style.opacity = "0"; // フェードアウト
            setTimeout(() => {
                videoContainer.style.visibility = "hidden";
            }, 300);

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

            const videoUrl = this.getAttribute(`data-video-${selectedExperiment}`);
            const duration = parseInt(this.getAttribute(`data-duration`), 10) || 50000;

            if (!videoUrl) return;

            // 🎬 すでに動画が再生中なら強制的に停止して新しい動画を再生
            experimentVideo.pause();
            experimentVideo.src = videoUrl;
            experimentVideo.load(); // 新しい動画の読み込み
            experimentVideo.play();

            // 動画コンテナを表示（透明→可視化をスムーズに）
            videoContainer.style.visibility = "visible";
            videoContainer.style.opacity = "1";

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

            // ✅ 動画終了時に非表示にする
            experimentVideo.onended = function () {
                experimentVideo.pause();
                experimentVideo.src = "";
                experimentVideo.load();
                videoContainer.style.opacity = "0";
                setTimeout(() => {
                    videoContainer.style.visibility = "hidden";
                }, 300);
            };

            // 指定時間後に動画を非表示（万が一 `onended` が効かない場合の保険）
            hideTimeout = setTimeout(() => {
                experimentVideo.pause();
                experimentVideo.src = "";
                experimentVideo.load();
                videoContainer.style.opacity = "0";
                setTimeout(() => {
                    videoContainer.style.visibility = "hidden";
                }, 300);
            }, duration);
        });
    });
});
