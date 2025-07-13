/* eslint-env node */
import FirebaseService from '../src/services/firebaseService.js'
import { Equipment } from '../src/models/index.js'
import firebaseConfig from '../src/firebaseConfig.local.js'

// Initialise FirebaseService with local config

FirebaseService.init(firebaseConfig)

// Construct a sample equipment
const eq = new Equipment({
  name: 'Test Bench Press',
  description: 'A heavy-duty bench press for testing purposes',
  imageUrl: '',
  videoUrl: '',
  available: 3,
  tags: ['strength', 'bench']
})

try {
  const fs = FirebaseService.getInstance()
  const id = await fs.addEquipment(eq)
  console.log('✅ Added equipment with id:', id)
} catch (err) {
  console.error('❌ Failed to add equipment:', err)
  /* handle as needed */
}
