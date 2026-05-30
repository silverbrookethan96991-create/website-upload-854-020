(function () {
    function preparePlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var errorBox = shell.querySelector('.player-error');
        var source = shell.getAttribute('data-video-src');
        var loaded = false;
        var hlsInstance = null;

        function setError(message) {
            if (errorBox) {
                errorBox.textContent = message;
            }
            shell.classList.add('has-error');
        }

        function loadSource() {
            if (loaded || !video || !source) {
                return;
            }
            loaded = true;
            video.controls = true;

            if (source.indexOf('.m3u8') !== -1) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            setError('播放暂时不可用，请稍后再试');
                        }
                    });
                } else {
                    setError('播放暂时不可用，请稍后再试');
                }
            } else {
                video.src = source;
            }

            shell.classList.add('is-loaded');
        }

        function start() {
            loadSource();
            if (!video) {
                return;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    shell.classList.add('is-playing');
                }).catch(function () {
                    shell.classList.remove('is-playing');
                });
            } else {
                shell.classList.add('is-playing');
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(preparePlayer);
})();
