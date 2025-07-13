/**
 * Booking model
 * Represents a user booking for equipment or a workout session.
 *
 * Fields:
 *  - id {string} Firestore document id (optional)
 *  - userId {string}
 *  - equipmentId {string|null}
 *  - startTime {Date}
 *  - endTime {Date}
 *  - status {'pending'|'confirmed'|'completed'|'cancelled'}
 *  - createdAt {Date}
 */

import { Timestamp } from 'firebase/firestore'
import { generateHash } from '../utils/id.js'

export default class Booking {
  constructor({
    id,
    userId = '',
    equipmentId = null,
    startTime = new Date(),
    endTime = new Date(),
    remind = true,
    status = 'active',
    createdAt = new Date()
  } = {}) {
    this.id = id ?? Booking.generateId(userId)
    this.userId = userId
    this.equipmentId = equipmentId
    this.startTime = startTime instanceof Date
      ? startTime
      : startTime?.toDate?.() || new Date()
    this.endTime = endTime instanceof Date
      ? endTime
      : endTime?.toDate?.() || new Date()
    this.remind = remind
    this.status = status
    this.createdAt = createdAt instanceof Date
      ? createdAt
      : createdAt?.toDate?.() || new Date()
  }

  /**
   * The Firestore collection name for bookings.
   */
  static collectionName() {
    return 'bookings'
  }

  /**
   * Generate a unique booking id based on user id and current time.
   * @param {string} userId
   * @returns {string}
   */
  static generateId(userId = '') {
    return generateHash(userId)
  }

  /**
   * Get the duration of the booking in milliseconds.
   */
  durationMs() {
    return this.endTime - this.startTime
  }

  /**
   * Determine if the booking is active at the given time.
   * @param {Date} [now=new Date()] The time to compare against.
   */
  isActive(now = new Date()) {
    return now >= this.startTime && now <= this.endTime
  }

  /**
   * Convert the model into a plain object suitable for Firestore writes.
   */
  toFirestore() {
    return {
      userId: this.userId,
      equipmentId: this.equipmentId,
      startTime: Timestamp.fromDate(this.startTime),
      endTime: Timestamp.fromDate(this.endTime),
      remind: this.remind,
      status: this.status,
      createdAt: Timestamp.fromDate(this.createdAt)
    }
  }

  /**
   * Create a Booking instance from a Firestore document.
   * @param {import('firebase/firestore').QueryDocumentSnapshot} doc
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new Booking({
      id: doc.id,
      userId: data.userId,
      equipmentId: data.equipmentId,
      startTime: data.startTime?.toDate?.() || new Date(),
      endTime: data.endTime?.toDate?.() || new Date(),
      remind: data.remind ?? true,
      status: data.status ?? 'active',
      createdAt: data.createdAt?.toDate?.() || new Date()
    })
  }
}
