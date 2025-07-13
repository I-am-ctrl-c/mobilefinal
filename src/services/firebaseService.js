/*
 * FirebaseService
 *  A singleton wrapper around Firebase Firestore & Storage that mirrors the
 *  functionality of the original Dart `firebase_service.dart` file.
 *
 *  NOTE: Call `FirebaseService.init(firebaseConfig)` at app start-up (once) to
 *  initialise Firebase. Afterwards use `FirebaseService.getInstance()` to gain
 *  access.
 */

import {
  initializeApp,
  getApps,
  getApp
} from 'firebase/app'

import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  onSnapshot,
  writeBatch,
  FieldPath
} from 'firebase/firestore'

import {
  getStorage,
  ref as storageRef,
  getDownloadURL
} from 'firebase/storage'

import { generateHash } from '../utils/id.js'
import { User, Equipment, Booking } from '../models/index.js'

export default class FirebaseService {
  /** @type {FirebaseService | null} */
  static _instance = null

  /**
   * Initialise Firebase (only once) and return the singleton instance.
   * @param {object} firebaseConfig – Your Firebase project config object
   */
  static init(firebaseConfig) {
    if (!getApps().length) {
      initializeApp(firebaseConfig)
    }
    if (!FirebaseService._instance) {
      FirebaseService._instance = new FirebaseService()
    }
    return FirebaseService._instance
  }

  /**
   * Get the already-initialised singleton. Throws if `init` not called first.
   */
  static getInstance() {
    if (!FirebaseService._instance) {
      throw new Error('FirebaseService not initialised – call FirebaseService.init(config) first')
    }
    return FirebaseService._instance
  }

  constructor() {
    const app = getApp()
    /** @type {import('firebase/firestore').Firestore} */
    this._db = getFirestore(app)
    /** @type {import('firebase/storage').FirebaseStorage} */
    this._storage = getStorage(app)
  }

  /** ─────────────────────────── Helpers ─────────────────────────── */

  get db() { return this._db }

  /**
   * Convert gs:// URI → https download URL (or return unchanged http URL).
   * @param {string | undefined | null} raw
   * @returns {Promise<string>}
   */
  async _safeToHttp(raw) {
    if (!raw) return ''
    const t = raw.trim()
    if (!t) return ''
    if (t.startsWith('http')) return t
    if (t.startsWith('gs://')) {
      try {
        return await getDownloadURL(storageRef(this._storage, t))
      } catch (e) {
        console.warn('[FirebaseService] Failed to getDownloadURL', e)
        return ''
      }
    }
    return ''
  }

  /**
   * Generate a unique hex hash ID using prefix + current epoch seconds.
   * Mirrors the Dart implementation but uses our generateHash util.
   * @param {string} prefix
   */
  _generateId(prefix) {
    return generateHash(`${prefix}`)
  }

  /** @param {string} col @param {string} id */
  _ref(col, id) { return doc(this._db, col, id) }

  /** ─────────────────────────── User CRUD ─────────────────────────── */

  /**
   * @param {User} user
   * @param {{autoId?: boolean}} opts
   * @returns {Promise<string>} id
   */
  async addUser(user, { autoId = false } = {}) {
    if (autoId) {
      const docRef = await addDoc(collection(this._db, 'users'), user.toFirestore())
      return docRef.id
    }
    const id = user.id ?? this._generateId('users')
    await setDoc(this._ref('users', id), user.toFirestore())
    return id
  }

  /** @param {string} id @returns {Promise<User>} */
  async getUser(id) {
    const snap = await getDoc(this._ref('users', id))
    if (!snap.exists()) throw new Error(`User not found: ${id}`)
    return User.fromFirestore(snap)
  }

  /** @param {User} user */
  async updateUser(user) {
    await updateDoc(this._ref('users', user.id), user.toFirestore())
  }

  async deleteUser(id) {
    await deleteDoc(this._ref('users', id))
  }

  /** ─────────────────────────── Equipment CRUD ─────────────────────────── */

  /**
   * @param {Equipment} eq
   * @param {{autoId?: boolean}} opts
   * @returns {Promise<string>}
   */
  async addEquipment(eq, { autoId = false } = {}) {
    // Clean & parse as per Dart implementation
    const cleanedDesc = (eq.description || '').replaceAll('\n', '\n')
    const parsedTags = (eq.tags || []).flatMap(t => t.split('|')).map(t => t.trim()).filter(Boolean)

    if (autoId) {
      const docRef = await addDoc(collection(this._db, 'equipment'), {
        name: eq.name,
        description: cleanedDesc,
        imageUrl: eq.imageUrl,
        videoUrl: eq.videoUrl,
        available: eq.available,
        tags: parsedTags
      })
      return docRef.id
    }
    const id = eq.id ?? this._generateId('equipment')
    await setDoc(this._ref('equipment', id), {
      name: eq.name,
      description: cleanedDesc,
      imageUrl: eq.imageUrl,
      videoUrl: eq.videoUrl,
      available: eq.available,
      tags: parsedTags
    })
    return id
  }

  /** @param {string} id @returns {Promise<Equipment>} */
  async getEquipment(id) {
    const snap = await getDoc(this._ref('equipment', id))
    if (!snap.exists()) throw new Error(`Equipment not found: ${id}`)
    const data = snap.data()
    const imageUrl = await this._safeToHttp(data.imageUrl)
    const videoUrl = await this._safeToHttp(data.videoUrl)
    return new Equipment({
      id: snap.id,
      name: data.name ?? '',
      description: data.description ?? '',
      imageUrl,
      videoUrl,
      available: (data.available ?? 0),
      tags: data.tags ?? []
    })
  }

  /** @param {Equipment} eq */
  async updateEquipment(eq) {
    await updateDoc(this._ref('equipment', eq.id), eq.toFirestore())
  }

  async deleteEquipment(id) {
    await deleteDoc(this._ref('equipment', id))
  }

  /** ─────────────────────────── Booking CRUD ─────────────────────────── */

  /** @param {string} userId @returns {Promise<Booking|null>} */
  async getNextUpcomingBooking(userId) {
    const now = new Date()
    const q = query(
      collection(this._db, 'bookings'),
      where('status', '==', 'active'),
      where('userId', '==', userId),
      where('startTime', '>=', Timestamp.fromDate(now)),
      orderBy('startTime'),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      return Booking.fromFirestore(docSnap)
    }
    return null
  }

  /** @param {Booking} bk @param {{autoId?: boolean}} opts */
  async addBooking(bk, { autoId = false } = {}) {
    if (autoId) {
      const docRef = await addDoc(collection(this._db, 'bookings'), bk.toFirestore())
      return docRef.id
    }
    const id = bk.id ?? this._generateId('bookings')
    await setDoc(this._ref('bookings', id), bk.toFirestore())
    return id
  }

  /** @param {string} id @returns {Promise<Booking>} */
  async getBooking(id) {
    const snap = await getDoc(this._ref('bookings', id))
    if (!snap.exists()) throw new Error(`Booking not found: ${id}`)
    return Booking.fromFirestore(snap)
  }

  /** @param {Booking} bk */
  async updateBooking(bk) {
    await updateDoc(this._ref('bookings', bk.id), bk.toFirestore())
  }

  async deleteBooking(id) {
    await deleteDoc(this._ref('bookings', id))
  }

  /** ─────────────────────────── Streams ─────────────────────────── */

  /**
   * @param {string} userId
   * @param {(bookings: Booking[]) => void} callback
   * @returns {() => void} unsubscribe
   */
  streamBookingsByUser(userId, callback) {
    const q = query(collection(this._db, 'bookings'), where('userId', '==', userId))
    return onSnapshot(q, snap => {
      callback(snap.docs.map(docSnap => Booking.fromFirestore(docSnap)))
    })
  }

  streamBookingsByEquipment(eqId, callback) {
    const q = query(collection(this._db, 'bookings'), where('equipmentId', '==', eqId))
    return onSnapshot(q, snap => {
      callback(snap.docs.map(docSnap => Booking.fromFirestore(docSnap)))
    })
  }

  /**
   * Load all equipment once.
   * @returns {Promise<Equipment[]>}
   */
  async loadAllEquipment() {
    const snapshot = await getDocs(collection(this._db, 'equipment'))
    const promises = snapshot.docs.map(async docSnap => {
      const data = docSnap.data()
      const imageUrl = await this._safeToHttp(data.imageUrl)
      const videoUrl = await this._safeToHttp(data.videoUrl)
      return new Equipment({
        id: docSnap.id,
        name: data.name ?? '',
        description: data.description ?? '',
        imageUrl,
        videoUrl,
        available: data.available ?? 0,
        tags: data.tags ?? []
      })
    })
    return Promise.all(promises)
  }

  /**
   * Real-time stream of all equipment. Callback receives Equipment[] on each update.
   * @param {(eq: Equipment[]) => void} callback
   * @returns {() => void} unsubscribe
   */
  streamAllEquipment(callback) {
    return onSnapshot(collection(this._db, 'equipment'), async snap => {
      const promises = snap.docs.map(async docSnap => {
        const data = docSnap.data()
        const imageUrl = await this._safeToHttp(data.imageUrl)
        const videoUrl = await this._safeToHttp(data.videoUrl)
        return new Equipment({
          id: docSnap.id,
          name: data.name ?? '',
          description: data.description ?? '',
          imageUrl,
          videoUrl,
          available: data.available ?? 0,
          tags: data.tags ?? []
        })
      })
      callback(await Promise.all(promises))
    })
  }

  /** ─────────────────────────── Daily Stats ─────────────────────────── */

  _dailyStatsRef(userId, date) {
    const dateStr = date.toISOString().split('T')[0]
    return doc(this._db, 'users', userId, 'dailyStats', dateStr)
  }

  async fetchDailyStats(userId, date) {
    const snap = await getDoc(this._dailyStatsRef(userId, date))
    return snap.data() ?? null
  }

  async updateCalories(userId, date, current, goal) {
    await setDoc(this._dailyStatsRef(userId, date), {
      caloriesCurrent: current,
      caloriesGoal: goal
    }, { merge: true })
  }

  async updateBMI(userId, date, { height, weight, value }) {
    await setDoc(this._dailyStatsRef(userId, date), {
      bmi: { height, weight, value }
    }, { merge: true })
  }

  async updateActivities(userId, date, activities) {
    await setDoc(this._dailyStatsRef(userId, date), { activities }, { merge: true })
  }

  async fetchLatestBMI(userId, date) {
    const dateStr = date.toISOString().split('T')[0]
    const q = query(
      collection(this._db, 'users', userId, 'dailyStats'),
      where(FieldPath.documentId(), '<=', dateStr),
      orderBy(FieldPath.documentId(), 'desc'),
      limit(1)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    return snap.docs[0].data().bmi ?? null
  }

  async updateBMIDouble(userId, date, height, weight, value) {
    return this.updateBMI(userId, date, {
      height: Math.round(height),
      weight: Math.round(weight),
      value
    })
  }

  /* ================= Propagation helpers ================= */

  async _propagateBMIForward(uid, fromDate, bmiData) {
    const fromId = fromDate.toISOString().split('T')[0]
    const col = collection(this._db, 'users', uid, 'dailyStats')
    const q = query(col, where(FieldPath.documentId(), '>', fromId), orderBy(FieldPath.documentId()))
    const snap = await getDocs(q)
    const batch = writeBatch(this._db)
    for (const docSnap of snap.docs) {
      if (docSnap.data().bmi) break
      batch.set(docSnap.ref, { bmi: bmiData }, { merge: true })
    }
    await batch.commit()
  }

  async updateBMIDoubleAndPropagate(uid, date, height, weight, value) {
    await this.updateBMI(uid, date, {
      height: Math.round(height),
      weight: Math.round(weight),
      value
    })
    await this._propagateBMIForward(uid, date, {
      height: Math.round(height),
      weight: Math.round(weight),
      value
    })
  }

  async _propagateGoalForward(uid, fromDate, goal, overwriteFuture = false) {
    const fromId = fromDate.toISOString().split('T')[0]
    const col = collection(this._db, 'users', uid, 'dailyStats')
    const q = query(col, where(FieldPath.documentId(), '>', fromId), orderBy(FieldPath.documentId()))
    const snap = await getDocs(q)
    const batch = writeBatch(this._db)
    for (const docSnap of snap.docs) {
      const hasGoal = typeof docSnap.data().caloriesGoal === 'number' && docSnap.data().caloriesGoal > 0
      if (!overwriteFuture && hasGoal) break
      batch.set(docSnap.ref, { caloriesGoal: goal }, { merge: true })
    }
    await batch.commit()
  }

  async updateCaloriesGoalAndPropagate(uid, date, current, goal, { overwriteFuture = false } = {}) {
    await this.updateCalories(uid, date, current, goal)
    await this._propagateGoalForward(uid, date, goal, overwriteFuture)
  }

  async fetchLatestCaloriesGoal(uid, date) {
    const dateStr = date.toISOString().split('T')[0]
    const q = query(
      collection(this._db, 'users', uid, 'dailyStats'),
      where(FieldPath.documentId(), '<=', dateStr),
      where('caloriesGoal', '>', 0),
      orderBy(FieldPath.documentId(), 'desc'),
      limit(1)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    return snap.docs[0].data().caloriesGoal
  }

  /**
   * Count active bookings within a time range for the given user.
   * @returns {Promise<number>}
   */
  async countUpcomingBookings({ userId, now, weekLater }) {
    const q = query(
      collection(this._db, 'bookings'),
      where('status', '==', 'active'),
      where('userId', '==', userId),
      where('startTime', '>=', Timestamp.fromDate(now)),
      where('startTime', '<=', Timestamp.fromDate(weekLater))
    )
    const snap = await getDocs(q)
    return snap.size
  }
}
