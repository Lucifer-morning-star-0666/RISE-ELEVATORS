(function () {
  const app = window.RiseElevators || {};
  const body = document.body;
  const hero = document.querySelector(".hero");
  const navbar = document.getElementById("navbar");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const navPanel = document.getElementById("nav-menu");
  const menuToggle = document.getElementById("menu-toggle");
  const backToTopButton = document.getElementById("back-to-top");
  const toast = document.getElementById("toast");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showToast(message, isError) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");
    toast.style.background = isError ? "rgba(231, 76, 60, 0.95)" : "rgba(16, 26, 49, 0.96)";

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }

  app.showToast = showToast;

  function toggleScrolledState() {
    const isScrolled = window.scrollY > 80;
    navbar.classList.toggle("scrolled", isScrolled);
    backToTopButton.classList.toggle("is-visible", window.scrollY > 300);
  }

  function closeMobileMenu() {
    navPanel.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = navPanel.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  backToTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", toggleScrolledState, { passive: true });
  toggleScrolledState();

  function setHeroMotion(offsetX, offsetY, xPercent, yPercent) {
    if (!hero) {
      return;
    }

    hero.style.setProperty("--hero-offset-x", `${offsetX}px`);
    hero.style.setProperty("--hero-offset-y", `${offsetY}px`);
    hero.style.setProperty("--hero-x", `${xPercent}%`);
    hero.style.setProperty("--hero-y", `${yPercent}%`);
  }

  if (hero && !prefersReducedMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const offsetX = (x - 0.5) * 42;
      const offsetY = (y - 0.5) * 34;

      setHeroMotion(offsetX, offsetY, x * 100, y * 100);
    });

    hero.addEventListener("pointerleave", () => {
      setHeroMotion(0, 0, 50, 38);
    });
  }

  const sections = Array.from(document.querySelectorAll("main section[id], header[id], header section[id]"));
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0.1 }
  );

  sections.forEach((section) => activeObserver.observe(section));

  const animatedItems = Array.from(document.querySelectorAll("[data-animate]"));
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) {
          return;
        }

        const delay = prefersReducedMotion ? 0 : Math.min(index * 100, 300);
        window.setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  animatedItems.forEach((item) => revealObserver.observe(item));

  function observeNewAnimatedItems(root) {
    root.querySelectorAll?.("[data-animate]").forEach((item) => {
      if (!item.classList.contains("is-visible")) {
        revealObserver.observe(item);
      }
    });
  }

  function attachImageLoading(root, selector) {
    root.querySelectorAll?.(selector).forEach((image) => {
      const markLoaded = () => image.classList.add("is-loaded");

      if (image.complete) {
        markLoaded();
        return;
      }

      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", markLoaded, { once: true });
    });
  }

  const counters = Array.from(document.querySelectorAll(".counter"));

  function animateCounter(counter) {
    const target = Number(counter.dataset.target || 0);
    const duration = prefersReducedMotion ? 0 : 1500;

    if (!duration) {
      counter.textContent = `${target}+`;
      return;
    }

    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.round(target * progress);
      counter.textContent = `${value}+`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const productGrid = document.getElementById("product-grid");
  const modal = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function openModal(product) {
    modalBody.innerHTML = `
      <div class="modal-image-wrap">
        <img class="modal-image" src="${product.image}" alt="${product.alt}">
      </div>
      <span class="product-meta">${product.category}</span>
      <h3 id="modal-title">${product.name}</h3>
      <p>${product.description}</p>
      <h4>Highlights</h4>
      <ul>
        ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
      <p class="modal-credit">Image source: <a href="${product.creditUrl}" target="_blank" rel="noreferrer">${product.creditLabel}</a></p>
    `;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  }

  if (productGrid && Array.isArray(app.products)) {
    productGrid.innerHTML = app.products
      .map(
        (product, index) => `
          <article class="product-card fade-up" data-animate data-product-index="${index}">
            <div class="product-media">
              <img src="${product.image}" alt="${product.alt}" loading="lazy">
            </div>
            <div class="product-card-body">
              <span class="product-meta">${product.category}</span>
              <h3>${product.name}</h3>
              <p>${product.shortDescription}</p>
              <button class="product-link" type="button" data-product-trigger="${index}">Learn More</button>
            </div>
          </article>
        `
      )
      .join("");

    productGrid.querySelectorAll("[data-product-trigger]").forEach((button) => {
      button.addEventListener("click", () => {
        const productIndex = Number(button.dataset.productTrigger);
        openModal(app.products[productIndex]);
      });
    });

    attachImageLoading(productGrid, ".product-media img");
    observeNewAnimatedItems(productGrid);
  }

  modalClose?.addEventListener("click", closeModal);
  modal?.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);

  const galleryGrid = document.getElementById("gallery-grid");
  const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxVisual = document.getElementById("lightbox-visual");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(item) {
    lightboxVisual.innerHTML = `<img src="${item.image}" alt="${item.alt}">`;
    lightboxCaption.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <p class="modal-credit">Image source: <a href="${item.creditUrl}" target="_blank" rel="noreferrer">${item.creditLabel}</a></p>
    `;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
  }

  function closeLightbox() {
    lightboxVisual.innerHTML = "";
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  }

  if (galleryGrid && Array.isArray(app.galleryItems)) {
    galleryGrid.innerHTML = app.galleryItems
      .map(
        (item, index) => `
          <article class="gallery-card fade-up" data-animate data-category="${item.category}" data-gallery-index="${index}">
            <button class="gallery-visual" type="button" aria-label="Open ${item.title}">
              <img src="${item.image}" alt="${item.alt}" loading="lazy">
            </button>
            <div class="gallery-card-body">
              <div class="gallery-tag">${item.label}</div>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </div>
          </article>
        `
      )
      .join("");

    galleryGrid.querySelectorAll(".gallery-card").forEach((card) => {
      card.querySelector(".gallery-visual").addEventListener("click", () => {
        const itemIndex = Number(card.dataset.galleryIndex);
        openLightbox(app.galleryItems[itemIndex]);
      });
    });

    attachImageLoading(galleryGrid, ".gallery-visual img");
    observeNewAnimatedItems(galleryGrid);
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      filterTabs.forEach((button) => button.classList.toggle("active", button === tab));

      galleryGrid?.querySelectorAll(".gallery-card").forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.dataset.hidden = shouldShow ? "false" : "true";
      });
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.querySelector("[data-close-lightbox]")?.addEventListener("click", closeLightbox);

  const testimonialTrack = document.getElementById("testimonial-track");
  const testimonialDots = document.getElementById("testimonial-dots");
  const testimonialWrap = document.getElementById("testimonial-wrap");
  const testimonialPrev = document.getElementById("testimonial-prev");
  const testimonialNext = document.getElementById("testimonial-next");
  let currentSlide = 0;
  let autoplayId;

  function renderTestimonials() {
    if (!testimonialTrack || !Array.isArray(app.testimonials)) {
      return;
    }

    testimonialTrack.innerHTML = app.testimonials
      .map(
        (testimonial) => `
          <article class="testimonial-card">
            <div class="rating" aria-label="5 star rating">★★★★★</div>
            <p>${testimonial.quote}</p>
            <div class="client-name">${testimonial.name}</div>
            <div class="client-city">${testimonial.city}</div>
          </article>
        `
      )
      .join("");

    testimonialDots.innerHTML = app.testimonials
      .map(
        (_, index) =>
          `<button type="button" data-dot-index="${index}" aria-label="Go to testimonial ${index + 1}"></button>`
      )
      .join("");

    testimonialDots.querySelectorAll("[data-dot-index]").forEach((dot) => {
      dot.addEventListener("click", () => {
        updateSlide(Number(dot.dataset.dotIndex));
        restartAutoplay();
      });
    });
  }

  function updateSlide(nextIndex) {
    if (!testimonialTrack || !Array.isArray(app.testimonials) || !app.testimonials.length) {
      return;
    }

    currentSlide = (nextIndex + app.testimonials.length) % app.testimonials.length;
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    testimonialDots.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function startAutoplay() {
    if (!Array.isArray(app.testimonials) || app.testimonials.length < 2) {
      return;
    }

    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => {
      updateSlide(currentSlide + 1);
    }, 5000);
  }

  function restartAutoplay() {
    window.clearInterval(autoplayId);
    startAutoplay();
  }

  renderTestimonials();
  updateSlide(0);
  startAutoplay();
  attachImageLoading(document, ".portrait-frame img");

  testimonialPrev?.addEventListener("click", () => {
    updateSlide(currentSlide - 1);
    restartAutoplay();
  });

  testimonialNext?.addEventListener("click", () => {
    updateSlide(currentSlide + 1);
    restartAutoplay();
  });

  testimonialWrap?.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
  testimonialWrap?.addEventListener("mouseleave", startAutoplay);

  const contactForm = document.getElementById("contact-form");

  function validateForm(form) {
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const interest = String(formData.get("interest") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const errors = [];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;

    form.querySelectorAll(".field-error").forEach((field) => field.classList.remove("field-error"));

    if (!name) {
      errors.push("Please enter your name.");
      form.elements.name.classList.add("field-error");
    }

    if (!phonePattern.test(phone)) {
      errors.push("Phone number must be 10 digits.");
      form.elements.phone.classList.add("field-error");
    }

    if (!emailPattern.test(email)) {
      errors.push("Please enter a valid email address.");
      form.elements.email.classList.add("field-error");
    }

    if (!interest) {
      errors.push("Please select a product interest.");
      form.elements.interest.classList.add("field-error");
    }

    if (!message) {
      errors.push("Please add a short message.");
      form.elements.message.classList.add("field-error");
    }

    return { errors, values: { name, phone, email, interest, message } };
  }

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = validateForm(contactForm);
    if (result.errors.length) {
      showToast(result.errors[0], true);
      return;
    }

    const { recipient, subject, whatsappNumber } = app.formConfig || {};
    const lines = [
      `Name: ${result.values.name}`,
      `Phone: ${result.values.phone}`,
      `Email: ${result.values.email}`,
      `Product Interest: ${result.values.interest}`,
      "",
      result.values.message
    ];
    const whatsappText = [subject, "", ...lines].join("\n");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappText)}`;

    showToast("Enquiry ready. Opening WhatsApp now.", false);
    window.location.href = whatsappUrl;
    contactForm.reset();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (modal.classList.contains("is-open")) {
      closeModal();
    }

    if (lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();
