(function () {
    window.setupMoviePlayer = function (videoSource) {
        const video = document.getElementById('movie-player');
        const cover = document.getElementById('player-cover');
        const button = document.getElementById('player-button');

        if (!video || !cover || !button || !videoSource) {
            return;
        }

        let attached = false;
        let hls = null;

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSource;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoSource);
                hls.attachMedia(video);
                return;
            }

            video.src = videoSource;
        }

        function startPlay() {
            attachSource();
            cover.classList.add('is-hidden');
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', function (event) {
            event.stopPropagation();
            startPlay();
        });

        cover.addEventListener('click', startPlay);

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlay();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
