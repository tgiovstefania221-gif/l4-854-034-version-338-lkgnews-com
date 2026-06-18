(() => {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", () => {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get("q") || "";
  const globalSearchInputs = document.querySelectorAll("[data-global-search]");

  globalSearchInputs.forEach((input) => {
    input.value = queryValue;
  });

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const grid = document.querySelector("[data-card-grid]");

  if (grid) {
    const cards = Array.from(grid.querySelectorAll("[data-card]"));
    const keywordInput = document.querySelector("[data-grid-search]");
    const filterControls = Array.from(document.querySelectorAll("[data-filter]"));
    const visibleCount = document.querySelector("[data-visible-count]");

    if (keywordInput && queryValue) {
      keywordInput.value = queryValue;
    }

    const applyFilters = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const filters = Object.fromEntries(
        filterControls.map((control) => [control.dataset.filter, normalize(control.value)])
      );
      let shown = 0;

      cards.forEach((card) => {
        const text = normalize(card.dataset.search);
        const type = normalize(card.dataset.type);
        const year = normalize(card.dataset.year);
        const region = normalize(card.dataset.region);
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesType = !filters.type || type === filters.type;
        const matchesYear = !filters.year || year === filters.year;
        const matchesRegion = !filters.region || region === filters.region;
        const visible = matchesKeyword && matchesType && matchesYear && matchesRegion;

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(shown);
      }
    };

    if (keywordInput) {
      keywordInput.addEventListener("input", applyFilters);
    }

    filterControls.forEach((control) => {
      control.addEventListener("change", applyFilters);
    });

    applyFilters();
  }

  document.querySelectorAll("[data-hero-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => show(dotIndex));
    });

    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5200);
    }
  });
})();
