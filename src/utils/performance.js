/**
 * Performance Optimization Utilities
 * Includes debouncing, throttling, caching, and memoization helpers
 */

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId
  return function debounced(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Simple cache for API calls
 */
class SimpleCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map()
    this.ttl = ttl
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    })
  }

  clear() {
    this.cache.clear()
  }

  delete(key) {
    this.cache.delete(key)
  }
}

export const apiCache = new SimpleCache()

/**
 * Fetch with caching
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise with cached or fetched data
 */
export const cachedFetch = async (url, options = {}) => {
  const cached = apiCache.get(url)
  if (cached) return cached

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    apiCache.set(url, data)
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

/**
 * Image preloader utility
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls = []) => {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

/**
 * Performance mark for debugging
 * @param {string} name - Mark name
 */
export const performanceMark = (name) => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(name)
  }
}

/**
 * Get performance measure
 * @param {string} name - Measure name
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 */
export const performanceMeasure = (name, startMark, endMark) => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.measure(name, startMark, endMark)
    const measure = window.performance.getEntriesByName(name)[0]
    console.log(`${name}: ${measure.duration.toFixed(2)}ms`)
  }
}

/**
 * Request idle callback fallback
 * @param {Function} callback - Callback function
 */
export const requestIdleCallback = (callback) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * Intersection observer for visibility
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback when visible
 * @param {Object} options - Observer options
 */
export const observeVisibility = (element, callback, options = {}) => {
  if (!('IntersectionObserver' in window)) {
    callback()
    return
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      callback()
      observer.unobserve(element)
    }
  }, { rootMargin: '50px', ...options })

  observer.observe(element)
  return observer
}

/**
 * Lazy load component helper
 * @param {Function} importStatement - Dynamic import
 * @returns {Promise} Promise with component
 */
export const lazyLoadComponent = async (importStatement) => {
  try {
    const module = await importStatement()
    return module.default
  } catch (error) {
    console.error('Failed to lazy load component:', error)
    return null
  }
}

export default {
  debounce,
  throttle,
  apiCache,
  cachedFetch,
  preloadImages,
  performanceMark,
  performanceMeasure,
  requestIdleCallback,
  observeVisibility,
  lazyLoadComponent
}
