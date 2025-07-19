/**
 * Equipment model
 * Represents workout equipment in the gym.
 *
 * Fields:
 *  - id {string} Firestore document id (optional)
 *  - name {string}
 *  - type {string} e.g. 'cardio', 'strength'
 *  - available {number}
 *  - description {string}
 *  - imageUrl {string}
 *  - videoUrl {string}
 *  - tags {string[]}
 *  - isAvailable {boolean}
 *  - lastService {Date}
 */

import { Timestamp } from 'firebase/firestore'
import { generateHash } from '../utils/id.js'

export default class Equipment {
  constructor({
    id,
    name = '',
    name_cn = '',
    type = '',
    available = 1,
    description = '',
    description_cn = '',
    imageUrl = '',
    videoUrl = '',
    tags = [],
    tags_cn = [],
    isAvailable = true,
    lastService = new Date()
  } = {}) {
    this.id = id ?? Equipment.generateId(name)
    this.name = name
    this.name_cn = name_cn
    this.type = type
    this.available = available
    this.description = description
    this.description_cn = description_cn
    this.imageUrl = imageUrl
    this.videoUrl = videoUrl
    this.tags = tags
    this.tags_cn = tags_cn
    this.isAvailable = isAvailable
    // Ensure lastService is a Date instance
    this.lastService = lastService instanceof Date
      ? lastService
      : lastService?.toDate?.() || new Date()
  }

  /**
   * The Firestore collection name for equipment.
   */
  static collectionName() {
    return 'equipment'
  }

  /**
   * Generate a unique equipment id based on name and current time.
   * @param {string} name
   * @returns {string}
   */
  static generateId(name = '') {
    return generateHash(name)
  }

  /**
   * Mark this equipment as unavailable.
   */
  markUnavailable() {
    this.isAvailable = false
  }

  /**
   * Mark this equipment as available.
   */
  markAvailable() {
    this.isAvailable = true
  }

  /**
   * Convert the model into a plain object suitable for Firestore writes.
   */
  toFirestore() {
    return {
      name: this.name,
      name_cn: this.name_cn,
      type: this.type,
      available: this.available,
      description: this.description,
      description_cn: this.description_cn,
      imageUrl: this.imageUrl,
      videoUrl: this.videoUrl,
      tags: this.tags,
      tags_cn: this.tags_cn,
      isAvailable: this.isAvailable,
      lastService: Timestamp.fromDate(this.lastService)
    }
  }

  /**
   * Create an Equipment instance from a Firestore document.
   * @param {import('firebase/firestore').QueryDocumentSnapshot} doc
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new Equipment({
      id: doc.id,
      name: data.name,
      name_cn: data.name_cn ?? '',
      type: data.type,
      available: data.available,
      description: data.description,
      description_cn: data.description_cn ?? '',
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      tags: data.tags ?? [],
      tags_cn: data.tags_cn ?? [],
      isAvailable: data.isAvailable,
      lastService: data.lastService?.toDate?.() || new Date()
    })
  }
}
