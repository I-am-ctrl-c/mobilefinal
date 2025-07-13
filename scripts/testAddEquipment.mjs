import FirebaseService from '../src/services/firebaseService.js'
import { Equipment } from '../src/models/index.js'

// Ensure we have initialised FirebaseService (reuse same config as src/main.js)
const firebaseConfig = {
  apiKey: 'AIzaSyAxafUmq6EOwlCrZLXVcHDV5S7Vu7ngSAg',
  authDomain: 'xgym-5047b.firebaseapp.com',
  projectId: 'xgym-5047b',
  storageBucket: 'xgym-5047b.firebasestorage.app',
  messagingSenderId: '342530982524',
  appId: '1:342530982524:web:3622b8ba91010338a27ff9'
}

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
