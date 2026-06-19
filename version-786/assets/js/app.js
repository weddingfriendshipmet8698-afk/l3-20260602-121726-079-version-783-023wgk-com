import { H as Hls } from "./hls.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const menuButton = $("[data-menu-toggle]");
const mobilePanel = $("[data-mobile-panel]");

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    mobilePanel.classList.toggle("open");
  });
}

const backTop = $("[data-back-top]");

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 500);
  });
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const hero = $("[data-hero]");

if (hero) {
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  let current = 0;

  const showSlide = (index) => {
    if (slides.length === 0) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  };

  const next = () => showSlide(current + 1);
  const prev = () => showSlide(current - 1);

  const nextButton = $("[data-hero-next]", hero);
  const prevButton = $("[data-hero-prev]", hero);

  if (nextButton) nextButton.addEventListener("click", next);
  if (prevButton) prevButton.addEventListener("click", prev);

  dots.forEach((dot) => {
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.heroDot || 0)));
  });

  setInterval(next, 5200);
}

const normalize = (value) => String(value || "").trim().toLowerCase();

$$('[data-filter-scope]').forEach((scope) => {
  const searchInput = $('[data-local-search]', scope);
  const cards = $$('[data-card]');
  const resultCount = $('[data-result-count]');
  let activeYear = "all";
  let activeCategory = "all";

  const apply = () => {
    const q = normalize(searchInput ? searchInput.value : "");
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.category,
        card.textContent
      ].join(" "));
      const matchQuery = !q || haystack.includes(q);
      const matchYear = activeYear === "all" || card.dataset.year === activeYear;
      const matchCategory = activeCategory === "all" || card.dataset.category === activeCategory;
      const ok = matchQuery && matchYear && matchCategory;
      card.classList.toggle("hidden", !ok);
      if (ok) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = `当前显示 ${visible} 部影片`;
    }
  };

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) searchInput.value = q;
    searchInput.addEventListener("input", apply);
  }

  $$('[data-filter-year]', scope).forEach((button) => {
    button.addEventListener("click", () => {
      activeYear = button.dataset.filterYear || "all";
      $$('[data-filter-year]', scope).forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      apply();
    });
  });

  $$('[data-filter-category]', scope).forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.filterCategory || "all";
      $$('[data-filter-category]', scope).forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      apply();
    });
  });

  apply();
});

$$('[data-player]').forEach((shell) => {
  const video = $('video', shell);
  const button = $('[data-play-button]', shell);
  const source = shell.dataset.src;
  let prepared = false;

  const prepare = async () => {
    if (!video || !source) return;
    if (!prepared) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      prepared = true;
    }
    shell.classList.add("is-playing");
    try {
      await video.play();
    } catch (error) {
      shell.classList.remove("is-playing");
    }
  };

  if (button) button.addEventListener("click", prepare);
  if (video) video.addEventListener("click", () => shell.classList.add("is-playing"));
});
