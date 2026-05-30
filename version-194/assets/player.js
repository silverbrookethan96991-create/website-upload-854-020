(function () {
    function canPlayNative(video) {
        return Boolean(video.canPlayType('application/vnd.apple.mpegurl')) || Boolean(video.canPlayType('application/x-mpegURL'));
    }

    function startVideo(shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        const stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }

        if (!video.dataset.ready) {
            if (canPlayNative(video)) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = stream;
            }
            video.dataset.ready = 'true';
        }

        if (button) {
            button.classList.add('is-hidden');
        }

        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
        const button = shell.querySelector('[data-play-button]');
        const video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                startVideo(shell);
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && !video.currentTime) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    });
})();
