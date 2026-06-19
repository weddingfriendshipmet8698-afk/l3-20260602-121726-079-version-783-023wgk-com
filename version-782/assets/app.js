function initMobileMenu() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function initHeroCarousel() {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initFilters() {
  var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
  forms.forEach(function (form) {
    var section = form.parentElement;
    var list = section ? section.querySelector("[data-filter-list]") : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".filter-card")) : [];
    var keyword = form.querySelector("[data-filter-keyword]");
    var category = form.querySelector("[data-filter-category]");
    var type = form.querySelector("[data-filter-type]");
    var year = form.querySelector("[data-filter-year]");
    var empty = section ? section.querySelector("[data-filter-empty]") : null;

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : "";
    }

    function apply() {
      var query = valueOf(keyword);
      var categoryValue = valueOf(category);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (categoryValue && String(card.dataset.category || "").toLowerCase() !== categoryValue) {
          ok = false;
        }
        if (typeValue && String(card.dataset.type || "").toLowerCase() !== typeValue) {
          ok = false;
        }
        if (yearValue && String(card.dataset.year || "").toLowerCase().indexOf(yearValue) === -1) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [keyword, category, type, year].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
    apply();
  });
}

function initMoviePlayer(videoUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  if (!video || !overlay || !videoUrl) {
    return;
  }
  var loaded = false;
  var hls = null;

  function load() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
    loaded = true;
  }

  function start() {
    load();
    overlay.classList.add("hidden");
    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        overlay.classList.remove("hidden");
      });
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
});
