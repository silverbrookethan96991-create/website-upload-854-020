(function () {
  function initMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-start]");
    if (!video || !source) {
      return;
    }

    var hls = null;
    var attached = false;
    var pending = false;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function play() {
      hideOverlay();
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (video.paused) {
            showOverlay();
          }
        });
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          capLevelToPlayerSize: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pending) {
            play();
          }
        });
      } else {
        video.src = source;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      pending = true;
      attach();
      play();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        showOverlay();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
