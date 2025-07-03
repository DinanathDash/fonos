import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * AudioVisualizer - A component that visualizes audio playing through the app
 * 
 * @param {Object} props
 * @param {boolean} props.isPlaying - Whether audio is currently playing
 * @param {number} props.intensity - Intensity of the visualization (0-1)
 * @param {string} [props.className] - Additional CSS classes to apply
 * @param {string} [props.baseColor] - Base color for the visualizer
 * @param {string} [props.activeColor] - Active color for the visualizer
 * @param {number} [props.barCount=27] - Number of bars to display
 * @param {number} [props.minHeight=2] - Minimum bar height in pixels
 * @param {number} [props.maxHeight=15] - Maximum bar height in pixels
 * @param {number} [props.speed=1] - Animation speed multiplier
 */
const AudioVisualizer = ({ 
  isPlaying = false,
  intensity = 0.8,
  className,
  baseColor = 'bg-primary/20',
  activeColor = 'bg-primary',
  barCount = 27,
  minHeight = 2,
  maxHeight = 15,
  speed = 1
}) => {
  const barsRef = useRef([]);
  const animationRef = useRef(null);
  
  // Initialize the bars with random heights
  useEffect(() => {
    barsRef.current = Array(barCount)
      .fill()
      .map(() => ({
        height: Math.random() * (maxHeight - minHeight) + minHeight,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: (Math.random() * 0.2 + 0.1) * speed
      }));
  }, [barCount, minHeight, maxHeight, speed]);
  
  // Animation effect
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const animate = () => {
      barsRef.current = barsRef.current.map((bar) => {
        // Update height based on direction
        let newHeight = bar.height + bar.direction * bar.speed * intensity;
        
        // Reverse direction if reaching min/max height
        if (newHeight > maxHeight || newHeight < minHeight) {
          return {
            ...bar,
            height: newHeight > maxHeight ? maxHeight : minHeight,
            direction: -bar.direction,
            speed: (Math.random() * 0.2 + 0.1) * speed // Randomize speed on bounce
          };
        }
        
        return {
          ...bar,
          height: newHeight
        };
      });
      
      // Force re-render
      setBarHeights([...barsRef.current]);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, intensity, minHeight, maxHeight, speed]);
  
  // State for bar heights (used to force re-renders)
  const [barHeights, setBarHeights] = React.useState([]);
  
  return (
    <div className={cn("flex items-end justify-center gap-[2px] h-[15px]", className)}>
      {barHeights.map((bar, index) => (
        <div
          key={index}
          className={cn(
            "w-[2px] rounded-sm transition-all duration-75",
            isPlaying ? activeColor : baseColor
          )}
          style={{
            height: `${bar.height}px`,
            opacity: isPlaying ? 0.4 + (bar.height / maxHeight) * 0.6 : 0.4
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
