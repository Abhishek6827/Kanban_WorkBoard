import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Merge multiple class names using clsx and tailwind-merge
 * @param  {...string} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
/**
 * Format a date to a readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length of the string
 * @returns {string} - Truncated string
 */
export function truncateString(str, length) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait before calling the function
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate a random color
 * @returns {string} - Random color in hexadecimal format
 */
export function generateRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16)
}

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - True if the object is empty, false otherwise
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}