(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.getElementById('nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function setSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('active', index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('active', index === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot') || '0');
                setSlide(index);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function bindSearch(form) {
        var input = form.querySelector('input[type="search"]');
        var list = document.querySelector('.searchable-list') || document.getElementById('search-results');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.searchable-card')) : [];

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var meta = normalize(card.getAttribute('data-meta'));
                var matched = !keyword || title.indexOf(keyword) !== -1 || meta.indexOf(keyword) !== -1;
                card.classList.toggle('is-filtered-out', !matched);
            });
        }

        if (!input || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            input.value = query;
            applyFilter();
        }

        input.addEventListener('input', applyFilter);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-search], [data-global-search]')).forEach(bindSearch);

    var video = document.getElementById('movie-player');
    var playButton = document.getElementById('play-button');

    if (video && playButton) {
        var hlsInstance = null;
        var initialized = false;

        function initPlayer() {
            var source = video.getAttribute('data-video-url');

            if (!source) {
                return Promise.resolve();
            }

            if (!initialized) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                initialized = true;
            }

            playButton.classList.add('is-hidden');
            return video.play().catch(function () {
                playButton.classList.remove('is-hidden');
            });
        }

        playButton.addEventListener('click', initPlayer);
        video.addEventListener('click', function () {
            if (!initialized || video.paused) {
                initPlayer();
            }
        });
        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                playButton.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
