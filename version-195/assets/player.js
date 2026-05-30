function setupMoviePlayer(source) {
  const video = document.getElementById("movie-player");
  const overlay = document.getElementById("player-overlay");
  const message = document.getElementById("player-message");
  const playButton = document.querySelector("[data-player-play]");
  const muteButton = document.querySelector("[data-player-mute]");
  const fullscreenButton = document.querySelector("[data-player-fullscreen]");
  let loaded = false;
  let hls = null;

  if (!video) {
    return;
  }

  function showMessage() {
    if (message) {
      message.hidden = false;
    }
  }

  function hideMessage() {
    if (message) {
      message.hidden = true;
    }
  }

  function attach() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (!source) {
      showMessage();
      return;
    }

    if (source.indexOf(".m3u8") !== -1) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        hideMessage();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideMessage();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else {
        showMessage();
      }
    } else {
      video.src = source;
      hideMessage();
    }
  }

  function play() {
    attach();
    hideMessage();
    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        showMessage();
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  function togglePlay() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", togglePlay);
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (playButton) {
      playButton.textContent = "暂停";
    }
  });
  video.addEventListener("pause", function () {
    if (playButton) {
      playButton.textContent = "播放";
    }
  });
  video.addEventListener("error", showMessage);

  if (playButton) {
    playButton.addEventListener("click", togglePlay);
  }

  if (muteButton) {
    muteButton.addEventListener("click", function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? "取消静音" : "静音";
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", function () {
      const shell = video.closest(".player-shell") || video;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
