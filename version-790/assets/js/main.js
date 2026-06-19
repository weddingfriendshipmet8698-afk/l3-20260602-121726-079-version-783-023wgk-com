(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = panel.hasAttribute('hidden');
      if (opened) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(opened));
    });
  }

  function setupImages() {
    qsa('img[data-image-fallback]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      });
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = qsa('[data-filter-input]');
    inputs.forEach(function (input) {
      var key = input.getAttribute('data-filter-input');
      var list = qs('[data-filter-list="' + key + '"]');
      var yearSelect = qs('[data-year-select="' + key + '"]');
      if (!list) {
        return;
      }

      var query = '';
      if (input.hasAttribute('data-auto-query')) {
        var params = new URLSearchParams(window.location.search);
        query = params.get('q') || '';
        input.value = query;
      }

      function apply() {
        var keyword = (input.value || '').trim().toLowerCase();
        var year = yearSelect ? yearSelect.value : '';
        qsa('[data-search]', list).forEach(function (item) {
          var text = (item.getAttribute('data-search') || '').toLowerCase();
          var itemYear = item.getAttribute('data-year') || '';
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !year || itemYear === year;
          item.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear));
        });
      }

      input.addEventListener('input', apply);
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupPlayer() {
    qsa('.video-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.play-cover', shell);
      var videoUrl = shell.getAttribute('data-video-url');
      var hls = null;
      var initialized = false;

      function prepare() {
        if (!video || !videoUrl || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
      }

      function play() {
        prepare();
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
