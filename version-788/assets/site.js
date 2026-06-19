(function() {
  var mobilePanel = document.querySelector(".mobile-panel");
  var menuToggle = document.querySelector(".menu-toggle");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("open");
    });
  }

  document.querySelectorAll(".site-search-form").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        input && input.focus();
        return;
      }
      event.preventDefault();
      window.location.href = "search.html?q=" + encodeURIComponent(value);
    });
  });

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function(slide, i) {
      slide.classList.toggle("active", i === heroIndex);
    });
    heroDots.forEach(function(dot, i) {
      dot.classList.toggle("active", i === heroIndex);
    });
  }

  if (heroSlides.length) {
    heroDots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showHeroSlide(i);
      });
    });
    setInterval(function() {
      showHeroSlide(heroIndex + 1);
    }, 5600);
  }

  var localSearch = document.querySelector("[data-local-search]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var sortFilter = document.querySelector("[data-sort-filter]");
  var cardContainer = document.querySelector("[data-card-container]");

  function applyLocalFilters() {
    if (!cardContainer) {
      return;
    }
    var query = localSearch ? localSearch.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var cards = Array.prototype.slice.call(cardContainer.querySelectorAll(".searchable-card"));

    cards.forEach(function(card) {
      var text = [
        card.dataset.title || "",
        card.dataset.genre || "",
        card.dataset.region || "",
        card.dataset.year || ""
      ].join(" ").toLowerCase();
      var matchesText = !query || text.indexOf(query) >= 0;
      var matchesYear = !year || (card.dataset.year || "") === year;
      card.style.display = matchesText && matchesYear ? "" : "none";
    });

    if (sortFilter) {
      var mode = sortFilter.value;
      var sorted = cards.slice().sort(function(a, b) {
        if (mode === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === "title") {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        }
        return 0;
      });
      sorted.forEach(function(card) {
        cardContainer.appendChild(card);
      });
    }
  }

  [localSearch, yearFilter, sortFilter].forEach(function(control) {
    if (control) {
      control.addEventListener("input", applyLocalFilters);
      control.addEventListener("change", applyLocalFilters);
    }
  });

  async function preparePlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var source = shell.dataset.videoUrl;

    if (!video || !source) {
      return;
    }

    if (!video.dataset.ready) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        try {
          var mod = await import("./hls-dru42stk.js");
          var Hls = mod.H;
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
          } else {
            video.src = source;
          }
        } catch (error) {
          video.src = source;
        }
      }
      video.dataset.ready = "1";
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {});
    }
  }

  document.querySelectorAll(".video-shell").forEach(function(shell) {
    var overlay = shell.querySelector(".play-overlay");
    var video = shell.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function() {
        preparePlayer(shell);
      });
    }

    shell.addEventListener("click", function(event) {
      if (event.target === video) {
        return;
      }
      if (event.target.closest && event.target.closest(".play-overlay")) {
        return;
      }
      preparePlayer(shell);
    });
  });

  function runSearchPage() {
    var resultNode = document.querySelector("[data-search-results]");
    var infoNode = document.querySelector("[data-search-info]");
    var input = document.querySelector("[data-search-input]");

    if (!resultNode || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (input) {
      input.value = query;
    }

    if (!query) {
      resultNode.innerHTML = '<div class="empty-state">输入影片名称、地区、类型、标签或年份后即可检索片库。</div>';
      if (infoNode) {
        infoNode.textContent = "影片搜索";
      }
      return;
    }

    var q = query.toLowerCase();
    var results = window.MOVIE_SEARCH_INDEX.filter(function(item) {
      return [
        item.title,
        item.year,
        item.region,
        item.genre,
        item.tags
      ].join(" ").toLowerCase().indexOf(q) >= 0;
    }).slice(0, 120);

    if (infoNode) {
      infoNode.textContent = "与“" + query + "”相关的影片";
    }

    if (!results.length) {
      resultNode.innerHTML = '<div class="empty-state">没有找到匹配内容，可尝试更换关键词。</div>';
      return;
    }

    resultNode.innerHTML = results.map(function(item) {
      return [
        '<a class="movie-card" href="' + item.url + '">',
        '  <div class="poster">',
        '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
        '    <span class="rating">' + item.rating + '</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <h3>' + item.title + '</h3>',
        '    <p>' + item.desc + '</p>',
        '    <div class="meta-row">',
        '      <span>' + item.year + '</span>',
        '      <span>' + item.region + '</span>',
        '      <span>' + item.type + '</span>',
        '    </div>',
        '    <div class="tag-list"><span>' + item.category + '</span></div>',
        '  </div>',
        '</a>'
      ].join("");
    }).join("");
  }

  runSearchPage();

  var backTop = document.querySelector(".back-to-top");
  if (backTop) {
    window.addEventListener("scroll", function() {
      backTop.classList.toggle("visible", window.scrollY > 500);
    });
    backTop.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
})();
