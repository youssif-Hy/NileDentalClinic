const header = document.querySelector("[data-elevate]");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a, .header-cta");
const heroTitle = document.querySelector("#hero-title");
const heroVisual = document.querySelector(".hero-visual");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = window.matchMedia("(pointer: coarse)");
const prefersReducedMotion = motionQuery.matches;

const revealGroups = [
  [".specialty-item", "depth"],
  [".clinic-photo-placeholder", "mask"],
  [".about .text-block", "from-left"],
  [".story-ribbon", "depth"],
  [".story-ribbon article", "from-right"],
  [".advantage-list article", "from-left"],
  [".service-stack article", "depth"],
  [".contact-surface", "depth"],
];

const setIndexedChildren = (selector) => {
  document.querySelectorAll(selector).forEach((item, index) => {
    item.style.setProperty("--item-index", index);
  });
};

const splitHeroTitle = () => {
  if (!heroTitle || heroTitle.dataset.split === "true") return;

  const words = heroTitle.textContent.trim().split(/\s+/);
  heroTitle.textContent = "";
  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "word";
    span.style.setProperty("--word-index", index);
    span.textContent = word;
    heroTitle.append(span);
    if (index < words.length - 1) heroTitle.append(document.createTextNode(" "));
  });
  heroTitle.dataset.split = "true";
};

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-elevated", window.scrollY > 20);
  document.documentElement.style.setProperty("--scroll-flow", Math.min(window.scrollY, 1600).toFixed(0));
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuButton && header) {
  menuButton.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

setIndexedChildren(".hero-specialties a");
setIndexedChildren(".hero-actions .button");
setIndexedChildren(".light-atlas span");

const revealTargets = [];
revealGroups.forEach(([selector, type]) => {
  document.querySelectorAll(selector).forEach((target, index) => {
    target.setAttribute("data-reveal", type);
    target.style.setProperty("--reveal-index", index % 4);
    revealTargets.push(target);
  });
});

if (!prefersReducedMotion) {
  splitHeroTitle();
  requestAnimationFrame(() => document.body.classList.add("motion-ready"));
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

if (!prefersReducedMotion && !coarsePointer.matches && heroVisual) {
  let rafId = 0;
  let nextX = 0;
  let nextY = 0;

  const applyParallax = () => {
    heroVisual.style.setProperty("--parallax-x", nextX.toFixed(2));
    heroVisual.style.setProperty("--parallax-y", nextY.toFixed(2));
    rafId = 0;
  };

  heroVisual.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    nextX = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    nextY = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  });

  heroVisual.addEventListener("pointerleave", () => {
    nextX = 0;
    nextY = 0;
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  });
} else if (heroVisual) {
  heroVisual.style.setProperty("--parallax-x", "0");
  heroVisual.style.setProperty("--parallax-y", "0");
}
