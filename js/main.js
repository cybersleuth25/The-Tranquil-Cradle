/* ============================================================
   THE TRANQUIL CRADLE — Main JavaScript
   Scroll-driven parallax hero, reveal animations, navigation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initScrollZoomVideo();
  initScrollReveal();
  initTextReveal();
  initScrollProgress();
  initSectionParallax();
  initGallerySwiper();
  initGalleryLightbox();
  initSmoothScroll();
  initMobileMenu();
  initComingSoonForm();
  fetchWeather();
});

/* ============================================================
   NAVBAR — Scroll-triggered background change
   ============================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================================
   SCROLL-ZOOM VIDEO — The hero cinematic effect
   As the user scrolls, the video zooms in from 1x to 2.5x,
   creating a "flying into the resort" feeling.
   ============================================================ */
function initScrollZoomVideo() {
  const heroWrapper = document.querySelector('.hero-wrapper');
  const heroVideo = document.querySelector('.hero-video');
  const heroContent = document.querySelector('.hero-editorial');
  const heroOverlay = document.querySelector('.hero-overlay');
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');

  if (!heroWrapper || !heroVideo) return;

  // Cut the video to play only between 5s and 30s
  if (heroVideo.tagName === 'VIDEO') {
    let hasSetStartTime = false;
    const START_TIME = 5;
    const END_TIME = 30;

    const setStartTime = () => {
      if (hasSetStartTime) return;
      const duration = heroVideo.duration;
      if (!isNaN(duration) && isFinite(duration) && duration > 0) {
        heroVideo.currentTime = START_TIME;
        hasSetStartTime = true;
      }
    };

    // If metadata is already loaded, set current time immediately. Otherwise, listen to event.
    if (heroVideo.readyState >= 1) {
      setStartTime();
    } else {
      heroVideo.addEventListener('loadedmetadata', setStartTime);
    }

    // Also trigger when video starts playing (handles browser autoplay timing)
    heroVideo.addEventListener('playing', setStartTime);

    heroVideo.play().catch(() => {
      // Autoplay blocked — that's fine, we'll show the fallback image
      console.log('Video autoplay blocked, showing fallback image.');
    });

    // Detect when video reaches 20s or loops, force it back to 8s
    heroVideo.addEventListener('timeupdate', () => {
      // If we already set the start time and playhead goes past END_TIME or resets near 0
      if (hasSetStartTime && (heroVideo.currentTime >= END_TIME || heroVideo.currentTime < START_TIME - 0.5)) {
        heroVideo.currentTime = START_TIME;
        heroVideo.play();
      }
    });
  }

  // Initial call to set correct zoom state on load
  updateHeroZoom(heroWrapper, heroVideo, heroContent, heroOverlay, scrollIndicator);

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeroZoom(heroWrapper, heroVideo, heroContent, heroOverlay, scrollIndicator);
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateHeroZoom(heroWrapper, heroVideo, heroContent, heroOverlay, scrollIndicator) {
  const rect = heroWrapper.getBoundingClientRect();
  const wrapperHeight = heroWrapper.offsetHeight;
  const viewportHeight = window.innerHeight;

  // How far through the hero-wrapper we've scrolled (0 to 1)
  const scrolled = Math.max(0, -rect.top);
  const scrollRange = wrapperHeight - viewportHeight;
  const progress = Math.min(1, Math.max(0, scrolled / scrollRange));

  // Scale: starts at 1.8 (zoomed in), ends at 1.0 (zoomed out to show surrounding)
  const scale = 1.8 - (progress * 0.8);
  
  if (heroVideo) {
    heroVideo.style.transform = `scale(${scale})`;
  }

  // Also scale fallback image to keep them synchronized
  const heroFallback = document.querySelector('.hero-fallback');
  if (heroFallback) {
    heroFallback.style.transform = `scale(${scale})`;
  }

  // Fade out hero content as user scrolls
  if (heroContent) {
    const contentFadePoint = 0.15; // Start fading at 15% scroll
    if (progress > contentFadePoint) {
      const fadeProgress = Math.min(1, (progress - contentFadePoint) / 0.25);
      heroContent.style.opacity = 1 - fadeProgress;
      heroContent.style.transform = `translateY(${-fadeProgress * 40}px) scale(${1 - fadeProgress * 0.05})`;
    } else {
      heroContent.style.opacity = 1;
      heroContent.style.transform = 'translateY(0) scale(1)';
    }
  }

  // Darken overlay as we zoom out (cinematic effect)
  if (heroOverlay) {
    const overlayOpacity = 0.4 + (progress * 0.4);
    heroOverlay.style.background = `linear-gradient(135deg, 
      rgba(7, 13, 7, ${overlayOpacity * 0.9}) 0%, 
      rgba(7, 13, 7, ${overlayOpacity * 0.5}) 50%,
      rgba(7, 13, 7, ${overlayOpacity * 0.7}) 100%)`;
  }

  // Hide scroll indicator permanently after first scroll
  if (scrollIndicator && progress > 0.02 && !scrollIndicator.classList.contains('hidden')) {
    scrollIndicator.classList.add('hidden');
  }
}

/* ============================================================
   SCROLL REVEAL — Fade-in elements as they enter viewport
   ============================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (!lightbox || !galleryItems.length) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ============================================================
   GALLERY SWIPER
   ============================================================ */
function initGallerySwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper('.gallery-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      grabCursor: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      }
    });
  }
}

/* ============================================================
   SMOOTH SCROLL — For nav link clicks
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        const navToggle = document.querySelector('.nav-toggle');
        if (navLinks?.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle?.classList.remove('active');
        }

        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
}

/* ============================================================
   COMING SOON FORM — Simple email capture with animation
   ============================================================ */
function initComingSoonForm() {
  const form = document.querySelector('.cta-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.cta-input');
    const btn = form.querySelector('.btn');
    
    if (input && input.value.trim()) {
      // Simulate submission
      btn.textContent = '✓ SUBSCRIBED';
      btn.style.background = 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))';
      input.value = '';
      input.placeholder = 'Thank you! We\'ll be in touch.';
      input.disabled = true;
      
      setTimeout(() => {
        btn.textContent = 'NOTIFY ME';
        btn.style.background = '';
        input.placeholder = 'Enter your email';
        input.disabled = false;
      }, 3000);
    }
  });
}

/* ============================================================
   COUNTER ANIMATION — Animate stat numbers
   ============================================================ */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      
      counter.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  });
}

// Trigger counter animation when stats section enters viewport
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.about-stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  
  const fadeOut = () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 500); // Small delay to let animations sync
  };

  // If already loaded, dismiss immediately. Otherwise, wait for load event.
  if (document.readyState === 'complete') {
    fadeOut();
  } else {
    window.addEventListener('load', fadeOut);
  }
}

/* ============================================================
   SECTION PARALLAX
   ============================================================ */
function initSectionParallax() {
  const images = document.querySelectorAll('.about-image-wrapper img, .room-card-image img');
  if (!images.length) return;

  images.forEach(img => {
    // Dynamically wrap the image for parallax so we don't break CSS hover transitions
    const wrapper = document.createElement('div');
    wrapper.className = 'parallax-inner-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '115%'; // Taller than container for parallax headroom
    wrapper.style.position = 'relative';
    wrapper.style.top = '-7.5%'; // Centered offset
    
    // Replace img with wrapper, then append img into wrapper
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    
    wrapper.dataset.parallax = 'true';
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.parallax-inner-wrapper').forEach(wrapper => {
          const containerRect = wrapper.parentElement.getBoundingClientRect();
          // If container is in viewport
          if (containerRect.top <= windowHeight && containerRect.bottom >= 0) {
            // Scroll progress from 0 (just entered bottom) to 1 (just left top)
            const progress = (windowHeight - containerRect.top) / (windowHeight + containerRect.height);
            // Move wrapper from +7.5% to -7.5%
            const yOffset = (0.5 - progress) * 15; 
            wrapper.style.transform = `translateY(${yOffset}%)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================================
   WEATHER WIDGET FETCH
   ============================================================ */
async function fetchWeather() {
  const widget = document.getElementById('weather-widget');
  if (!widget) return;
  
  const loading = widget.querySelector('.weather-loading');
  const dataContainer = widget.querySelector('.weather-data');
  const tempSpan = document.getElementById('wt-temp');
  const humSpan = document.getElementById('wt-hum');
  
  // Chikkamagaluru coordinates: Lat 13.3153, Lon 75.7754
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=13.3153&longitude=75.7754&current=temperature_2m,relative_humidity_2m');
    const data = await res.json();
    
    if (data && data.current) {
      const temp = Math.round(data.current.temperature_2m);
      const hum = data.current.relative_humidity_2m;
      
      tempSpan.textContent = `${temp}°C`;
      humSpan.textContent = `${hum}%`;
      
      loading.style.display = 'none';
      dataContainer.style.display = 'flex';
    }
  } catch (err) {
    console.error("Failed to fetch weather:", err);
    loading.textContent = "Weather data unavailable";
  }
}

/* ============================================================
   SCROLL PROGRESS INDICATOR
   Thin gold line at the very top of the viewport that fills
   from left to right as the user scrolls down the page.
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  });

  update(); // Set initial state
}

/* ============================================================
   TEXT REVEAL — Cinematic Word-by-Word Animation
   Splits .section-title text nodes into individually masked
   words that slide up sequentially when they enter the viewport.
   ============================================================ */
function initTextReveal() {
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  titles.forEach(title => {
    // Skip if already processed or is inside the hero (hero has its own animation)
    if (title.dataset.textReveal === 'done') return;
    if (title.closest('.hero')) return;

    // Get the raw text content, preserving <br> tags
    const html = title.innerHTML;
    
    // Split by <br> to preserve line breaks
    const lines = html.split(/<br\s*\/?>/i);
    
    let wordIndex = 0;
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';
      
      // Split line into words
      const words = trimmedLine.split(/\s+/);
      const wrappedWords = words.map(word => {
        const delay = wordIndex * 0.08; // 80ms stagger between each word
        wordIndex++;
        return `<span class="text-reveal-word" style="transition-delay: ${delay}s"><span class="word-inner">${word}</span></span>`;
      });
      return wrappedWords.join(' ');
    });

    title.innerHTML = processedLines.join('<br>');
    title.dataset.textReveal = 'done';
  });

  // Observe each title for viewport entry
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const words = entry.target.querySelectorAll('.text-reveal-word');
        words.forEach(word => word.classList.add('revealed'));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });

  titles.forEach(title => observer.observe(title));
}
