import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const menu = $('[data-mobile-nav]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function setupHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = $$('.hero-slide', hero);
  const dots = $$('.hero-dot', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  let active = 0;
  let timer = null;

  const show = (index) => {
    if (slides.length === 0) {
      return;
    }

    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === active));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === active));
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  prev?.addEventListener('click', () => {
    show(active - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(active + 1);
    restart();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      restart();
    });
  });

  show(0);
  restart();
}

function setupFilters() {
  const panel = $('[data-filter-panel]');

  if (!panel) {
    return;
  }

  const keywordInput = $('[data-filter-keyword]', panel);
  const regionSelect = $('[data-filter-region]', panel);
  const typeSelect = $('[data-filter-type]', panel);
  const yearSelect = $('[data-filter-year]', panel);
  const categorySelect = $('[data-filter-category]', panel);
  const countBox = $('[data-filter-count]', panel);
  const reset = $('[data-filter-reset]', panel);
  const cards = $$('[data-title]');
  const emptyState = $('[data-empty-state]');

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (initialQuery && keywordInput) {
    keywordInput.value = initialQuery;
  }

  const includes = (value, needle) => String(value || '').toLowerCase().includes(String(needle || '').toLowerCase());

  const apply = () => {
    const keyword = keywordInput?.value.trim().toLowerCase() || '';
    const region = regionSelect?.value || '';
    const type = typeSelect?.value || '';
    const year = yearSelect?.value || '';
    const category = categorySelect?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category,
        card.dataset.tags,
        card.textContent,
      ].join(' ').toLowerCase();

      const matched = (!keyword || includes(haystack, keyword))
        && (!region || card.dataset.region === region)
        && (!type || card.dataset.type === type)
        && (!year || card.dataset.year === year)
        && (!category || card.dataset.category === category);

      card.classList.toggle('hidden-by-filter', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (countBox) {
      countBox.textContent = `已显示 ${visible} / ${cards.length} 部`;
    }

    emptyState?.classList.toggle('show', visible === 0);
  };

  [keywordInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });

  reset?.addEventListener('click', () => {
    [keywordInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach((control) => {
      if (control) {
        control.value = '';
      }
    });
    apply();
  });

  apply();
}

function setupPlayers() {
  const players = $$('[data-player]');

  players.forEach((box) => {
    const video = $('video', box);
    const playButton = $('[data-player-play]', box);
    const muteButton = $('[data-player-mute]', box);
    const fullButton = $('[data-player-fullscreen]', box);
    const status = $('[data-player-status]', box);
    const source = box.dataset.src;
    let initialized = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    const setStatus = (text) => {
      if (status) {
        status.textContent = text;
      }
    };

    const initialize = () => {
      if (initialized) {
        return;
      }

      initialized = true;
      setStatus('正在加载播放源…');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('播放源已就绪'));
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络错误，正在尝试重新加载…');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体错误，正在恢复播放…');
            hls.recoverMediaError();
          } else {
            setStatus('播放源暂时不可用，请稍后重试');
            hls.destroy();
          }
        });
      } else {
        video.src = source;
        setStatus('当前浏览器不支持 HLS，已尝试直接加载');
      }
    };

    const togglePlay = async () => {
      initialize();

      try {
        if (video.paused) {
          await video.play();
          box.classList.add('playing');
          setStatus('正在播放');
        } else {
          video.pause();
          box.classList.remove('playing');
          setStatus('已暂停');
        }
      } catch (error) {
        setStatus('浏览器阻止了自动播放，请再次点击播放');
      }
    };

    playButton?.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', () => box.classList.add('playing'));
    video.addEventListener('pause', () => box.classList.remove('playing'));

    muteButton?.addEventListener('click', () => {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    });

    fullButton?.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        box.requestFullscreen?.();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHero();
  setupFilters();
  setupPlayers();
});
