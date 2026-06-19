import { H as Hls } from "./hls.js";

const ready = (handler) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handler);
  } else {
    handler();
  }
};

const normalize = (value) => String(value || "").toLowerCase().trim();

const safe = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function bindMenu() {
  const button = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".mobile-panel");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function bindHero() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const previous = document.querySelector(".hero-prev");
  const next = document.querySelector(".hero-next");
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };
  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  previous?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      restart();
    });
  });
  restart();
}

function bindLocalFilters() {
  const controls = Array.from(document.querySelectorAll(".site-search, .site-kind-filter"));
  if (!controls.length) {
    return;
  }
  const run = () => {
    const targets = new Set();
    controls.forEach((control) => {
      document.querySelectorAll(control.dataset.target || ".movie-card").forEach((item) => targets.add(item));
    });
    const keyword = normalize(document.querySelector(".site-search")?.value || "");
    const filter = normalize(document.querySelector(".site-kind-filter")?.value || "");
    targets.forEach((card) => {
      const text = normalize(card.dataset.search || card.textContent);
      const okKeyword = !keyword || text.includes(keyword);
      const okFilter = !filter || text.includes(filter);
      card.classList.toggle("is-filtered-out", !(okKeyword && okFilter));
    });
  };
  controls.forEach((control) => {
    control.addEventListener("input", run);
    control.addEventListener("change", run);
  });
}

function renderSearchResult(movie) {
  const article = document.createElement("article");
  article.className = "movie-card";
  article.innerHTML = `
    <a class="poster-wrap" href="${safe(movie.url)}" aria-label="${safe(movie.title)}">
      <img src="${safe(movie.image)}" alt="${safe(movie.title)}" loading="lazy">
      <div class="score-pill">热度 ${safe(movie.score)}</div>
    </a>
    <div class="card-body compact">
      <div class="card-meta">
        <span>${safe(movie.year)}</span>
        <span>${safe(movie.region)}</span>
        <span>${safe(movie.type)}</span>
      </div>
      <h2><a href="${safe(movie.url)}">${safe(movie.title)}</a></h2>
      <p>${safe(movie.oneLine)}</p>
      <div class="tag-row"><span>${safe(movie.category)}</span><span>${safe(movie.genre)}</span></div>
      <a class="text-link" href="${safe(movie.url)}">查看详情</a>
    </div>
  `;
  return article;
}

function bindGlobalSearch() {
  const input = document.getElementById("global-search");
  const results = document.getElementById("global-search-results");
  if (!input || !results || !Array.isArray(window.SITE_SEARCH)) {
    return;
  }
  const show = () => {
    const keyword = normalize(input.value);
    const source = window.SITE_SEARCH;
    const matches = keyword
      ? source.filter((movie) => normalize(movie.search).includes(keyword)).slice(0, 96)
      : source.slice(0, 36);
    results.innerHTML = "";
    matches.forEach((movie) => results.appendChild(renderSearchResult(movie)));
  };
  input.addEventListener("input", show);
  show();
}

export function initMoviePlayer(videoId, overlayId, videoUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video || !overlay || !videoUrl) {
    return;
  }
  let initialized = false;
  const start = () => {
    if (!initialized) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      initialized = true;
    }
    overlay.classList.add("is-hidden");
    video.play().catch(() => {});
  };
  overlay.addEventListener("click", start);
  video.addEventListener("click", () => {
    if (!initialized) {
      start();
    }
  });
}

ready(() => {
  bindMenu();
  bindHero();
  bindLocalFilters();
  bindGlobalSearch();
});
