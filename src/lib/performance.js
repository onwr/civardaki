// Performans yardımcı fonksiyonları

// Debounce fonksiyonu
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle fonksiyonu
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy loading için intersection observer
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Veri cache'leme
class DataCache {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 dakika default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
export const dataCache = new DataCache();

// API çağrıları için cache wrapper
export async function cachedApiCall(key, apiCall, ttl = 5 * 60 * 1000) {
  // Cache'den kontrol et
  const cached = dataCache.get(key);
  if (cached) {
    return cached;
  }

  // API çağrısı yap
  try {
    const result = await apiCall();
    dataCache.set(key, result, ttl);
    return result;
  } catch (error) {
    console.error("API çağrısı başarısız:", error);
    throw error;
  }
}

// Sayfa performans metrikleri
export function getPerformanceMetrics() {
  if (typeof window === "undefined") return null;

  const navigation = performance.getEntriesByType("navigation")[0];
  const paint = performance.getEntriesByType("paint");

  return {
    // Sayfa yükleme süresi
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,

    // DOM yüklenme süresi
    domContentLoaded:
      navigation?.domContentLoadedEventEnd -
      navigation?.domContentLoadedEventStart,

    // İlk içerikli boyama
    firstContentfulPaint: paint.find((p) => p.name === "first-contentful-paint")
      ?.startTime,

    // En büyük içerikli boyama
    largestContentfulPaint: performance.getEntriesByType(
      "largest-contentful-paint"
    )[0]?.startTime,

    // İlk etkileşim süresi
    firstInputDelay:
      performance.getEntriesByType("first-input")[0]?.processingStart -
      performance.getEntriesByType("first-input")[0]?.startTime,

    // Toplam blok süresi
    totalBlockingTime:
      performance.getEntriesByType("navigation")[0]?.loadEventEnd -
      performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd,
  };
}

// Performans metriklerini logla
export function logPerformanceMetrics() {
  const metrics = getPerformanceMetrics();
  if (metrics) {
    console.log("Sayfa Performans Metrikleri:", metrics);

    // Performans verilerini analytics servisine gönder
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "performance_metrics", {
        load_time: metrics.loadTime,
        dom_content_loaded: metrics.domContentLoaded,
        first_contentful_paint: metrics.firstContentfulPaint,
        largest_contentful_paint: metrics.largestContentfulPaint,
      });
    }
  }
}

// Resim lazy loading için helper
export function createLazyImageObserver() {
  return createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.classList.remove("lazy");
          img.classList.add("loaded");
        }

        // Observer'ı kaldır
        img.observer?.unobserve(img);
      }
    });
  });
}

// Virtual scrolling için helper
export function calculateVisibleItems({
  containerHeight,
  itemHeight,
  scrollTop,
  overscan = 5,
}) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
}

// Bundle size optimizasyonu için dynamic import
export function lazyLoadComponent(importFunc) {
  return React.lazy(importFunc);
}

// Memory leak önleme
export function cleanupEventListeners(element, events) {
  events.forEach(({ event, handler }) => {
    element.removeEventListener(event, handler);
  });
}

// Form validasyonu için debounced validation
export function createDebouncedValidator(validator, delay = 300) {
  return debounce((value, setError) => {
    const error = validator(value);
    setError(error);
  }, delay);
}

// API rate limiting
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();

    // Eski istekleri temizle
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    // Limit kontrolü
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    // İsteği kaydet
    this.requests.push(now);
    return true;
  }
}

export const apiRateLimiter = new RateLimiter(10, 60000); // 10 istek/dakika

// Performans izleme
export function startPerformanceMonitoring() {
  // Sayfa yüklendiğinde performans metriklerini logla
  window.addEventListener("load", () => {
    setTimeout(logPerformanceMetrics, 1000);
  });

  // Web Vitals izleme
  if (typeof window !== "undefined" && "PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.value}`);
      });
    });

    observer.observe({ entryTypes: ["measure", "navigation", "paint"] });
  }
}
