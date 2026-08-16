import { useRef, useEffect, useState } from 'react'

export default function Marquee({ text, className = '' }: { text: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth)
      }
    }
    
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [text])

  return (
    <div 
      ref={containerRef} 
      className={`marquee-container ${isOverflowing ? 'is-overflowing' : ''}`}
    >
      <div className="marquee-content">
        <span ref={textRef} className={`marquee-text ${className}`}>
          {text}
        </span>
        {isOverflowing && (
          <span className={`marquee-text ${className}`} aria-hidden="true" style={{ paddingLeft: '2rem' }}>
            {text}
          </span>
        )}
      </div>
    </div>
  )
}
