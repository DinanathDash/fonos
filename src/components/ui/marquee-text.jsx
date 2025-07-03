import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const MarqueeText = ({ 
  children, 
  className, 
  scrollSpeed = 40, // pixels per second - lower is slower
  scrollDelay = 700, // ms before starting the animation
  ...props 
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Check if text is overflowing and update dimensions
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !textRef.current) return;
      
      const containerW = containerRef.current.clientWidth;
      const textW = textRef.current.scrollWidth;
      
      setContainerWidth(containerW);
      setContentWidth(textW);
      setIsOverflowing(textW > containerW);
    };

    // Run check
    checkOverflow();
    
    // Set up resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [children]);

  // Animation using requestAnimationFrame for smooth scrolling
  useEffect(() => {
    if (!isHovering || !isOverflowing) {
      cancelAnimationFrame(animationRef.current);
      setScrollPosition(0);
      return;
    }

    let startTime = null;
    let pauseTimeout = null;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        pauseTimeout = setTimeout(() => {
          startTime = timestamp;
          animate();
        }, scrollDelay);
        return;
      }

      const elapsed = timestamp - startTime;
      const distance = (elapsed * scrollSpeed) / 1000; // pixels per millisecond

      // Create a true continuous ticker effect - when it reaches content width + gap (50px),
      // wrap back to position that creates a seamless effect
      const scrollWidth = contentWidth + 100; // content width + gap
      
      // Use modulo to create continuous wrapping effect
      setScrollPosition(distance % scrollWidth);
      
      animationRef.current = requestAnimationFrame(step);
    };

    const animate = () => {
      animationRef.current = requestAnimationFrame(step);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(pauseTimeout);
    };
  }, [isHovering, isOverflowing, contentWidth, scrollSpeed, scrollDelay]);

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <div 
        className="inline-flex whitespace-nowrap"
        style={{
          transform: isHovering && isOverflowing ? `translateX(-${scrollPosition}px)` : 'none',
          transition: !isHovering ? 'transform 0.3s ease-out' : 'none',
          width: 'fit-content'
        }}
      >
        {/* First copy of content */}
        <span ref={textRef} className="inline-block">
          {children}
        </span>
        
        {/* Second copy to create continuous scroll effect */}
        {isOverflowing && isHovering && (
          <span className="inline-block" style={{ marginLeft: '100px' }}>
            {children}
          </span>
        )}
        
        {/* Third copy for longer text to ensure continuous loop */}
        {isOverflowing && isHovering && (
          <span className="inline-block" style={{ marginLeft: '100px' }}>
            {children}
          </span>
        )}
      </div>
    </div>
  );
};

export default MarqueeText;
