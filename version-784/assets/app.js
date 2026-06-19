(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var hero = document.querySelector('.hero-carousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('.empty-state');

  function runFilter() {
    if (!filterForm || cards.length === 0) {
      return;
    }

    var queryInput = filterForm.querySelector('[name="keyword"]');
    var yearSelect = filterForm.querySelector('[name="year"]');
    var categorySelect = filterForm.querySelector('[name="category"]');
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var shown = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });

    Array.prototype.slice.call(filterForm.elements).forEach(function (element) {
      element.addEventListener('input', runFilter);
      element.addEventListener('change', runFilter);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var queryInput = filterForm.querySelector('[name="keyword"]');

    if (q && queryInput) {
      queryInput.value = q;
    }

    runFilter();
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var source = video ? video.getAttribute('data-hls') : '';

    if (!video || !source) {
      return;
    }

    shell.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        video._hlsInstance = new window.Hls();
        video._hlsInstance.loadSource(source);
        video._hlsInstance.attachMedia(video);
      }
      video.play().catch(function () {});
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var cover = shell.querySelector('.play-cover');
    var button = shell.querySelector('.play-cover button');

    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayer(shell);
      });
    }
  });
})();
