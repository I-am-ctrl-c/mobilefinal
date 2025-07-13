/**
 * ID generation utilities
 *
 * Provides a simple hash-based unique ID generator that combines the current
 * timestamp (ms precision), optional extra seed information, and a random
 * component. The algorithm uses the FNV-1a 32-bit hash for speed and to keep
 * dependencies minimal.
 *
 * Example usage:
 *   import { generateUserId, generateBookingId, generateEquipmentId } from '../utils/id.js'
 *
 *   const newUserId = generateUserId(userName)
 *   const bookingId = generateBookingId(userId)
 */

// FNV-1a 32-bit hash
function fnv1a(str) {
  let hash = 0x811c9dc5 // offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    // 32-bit multiplication with FNV prime 16777619
    hash = Math.imul(hash, 0x1000193)
  }
  // Convert to unsigned 32-bit hex string
  return (hash >>> 0).toString(16)
}

/**
 * Generate a hash string using provided seed.
 * @param {string} seed Additional string data to mix into the hash (e.g., name, userId).
 * @returns {string} Hexadecimal hash suitable for use as an ID.
 */
export function generateHash(seed = '') {
  // Use high-resolution time and a random value for extra uniqueness
  const base = `${seed}-${Date.now()}-${Math.random()}`
  return fnv1a(base)
}

export const generateUserId = (name = '') => generateHash(name)
export const generateBookingId = (userId = '') => generateHash(userId)
export const generateEquipmentId = (name = '') => generateHash(name) 