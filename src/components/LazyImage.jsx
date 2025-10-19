import { useState, useEffect, useRef } from 'react'

export default function LazyImage({ 
  src, 
  alt = '', 
  placeholder = null,
  className = '',
  width,
  height,
  onLoad = null
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.onload = () => {
            setLoaded(true)
            onLoad?.()
          }
          img.onerror = () => setError(true)
          observer.unobserve(img)
        }
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [onLoad])

  return (
    <div className={`lazy-image-wrapper ${className}`} style={{ width, height }}>
      {!loaded && placeholder && <div className="lazy-placeholder">{placeholder}</div>}
      <img
        ref={imgRef}
        data-src={src}
        alt={alt}
        className={`lazy-image ${loaded ? 'loaded' : 'loading'} ${error ? 'error' : ''}`}
        width={width}
        height={height}
      />
    </div>
  )
}
