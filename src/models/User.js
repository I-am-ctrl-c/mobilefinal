/**
 * User model
 * Represents an application user in Firestore.
 *
 * Fields:
 *  - id {string} Firestore document id (optional)
 *  - name {string}
 *  - email {string}
 *  - role {'user'|'admin'|'coach'}
 *  - gender {'male'|'female'|'other'}
 *  - createTime {Date}
 */

import { Timestamp } from 'firebase/firestore'
import { generateHash } from '../utils/id.js'

export default class User {
  constructor({
    id,
    name = '',
    email = '',
    role = 'user',
    isAdmin = false,
    gender = 'other',
    age = null,
    createTime = new Date()
  } = {}) {
    this.id = id ?? User.generateId(name)
    this.name = name
    this.email = email
    this.role = role
    this.isAdmin = isAdmin || role === 'admin'
    this.gender = gender
    this.age = age
    // Ensure createTime is a Date instance
    this.createTime = createTime instanceof Date
      ? createTime
      : createTime?.toDate?.() || new Date()
  }

  /**
   * The Firestore collection name for users.
   */
  static collectionName() {
    return 'users'
  }

  /**
   * Generate a unique user id based on name and current time.
   * @param {string} name
   * @returns {string}
   */
  static generateId(name = '') {
    return generateHash(name)
  }

  /**
   * Helper to check if the user has admin privileges.
   */
  // The isAdmin boolean property already indicates admin privileges.

  /**
   * Convert the model into a plain object suitable for Firestore writes.
   */
  toFirestore() {
    return {
      name: this.name,
      email: this.email,
      role: this.role,
      isAdmin: this.isAdmin,
      gender: this.gender,
      age: this.age,
      createTime: Timestamp.fromDate(this.createTime)
    }
  }

  /**
   * Create a User instance from a Firestore document.
   * @param {import('firebase/firestore').QueryDocumentSnapshot} doc
   */
  static fromFirestore(doc) {
    const data = doc.data()
    return new User({
      id: doc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      isAdmin: data.isAdmin ?? (data.role === 'admin'),
      gender: data.gender,
      age: data.age,
      createTime: data.createTime?.toDate?.() || new Date()
    })
  }
}
