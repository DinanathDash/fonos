import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds into a human-readable time format (mm:ss or hh:mm:ss)
 * @param {number} seconds - Total seconds to format
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Abbreviate large numbers with K, M, B suffixes
 * @param {number} num - Number to abbreviate
 * @returns {string} Abbreviated number string
 */
export function abbreviateNumber(num) {
  if (!num) return '0';
  
  const abbreviations = [
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' }
  ];
  
  for (const { value, symbol } of abbreviations) {
    if (num >= value) {
      // Round to 1 decimal place and remove trailing .0 if present
      const rounded = Math.round((num / value) * 10) / 10;
      return rounded % 1 === 0 
        ? Math.floor(rounded) + symbol 
        : rounded + symbol;
    }
  }
  
  return num.toString();
}
