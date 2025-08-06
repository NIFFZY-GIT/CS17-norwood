const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function makeUserAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(process.env.MONGODB_DB_NAME);
    const users = db.collection('users');
    
    // Update the user to admin
    const result = await users.updateOne(
      { email: 'admin@norwood.com' },
      { $set: { role: 'admin' } }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount > 0) {
      console.log('✅ User admin@norwood.com has been promoted to admin');
    } else {
      console.log('❌ User admin@norwood.com not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

makeUserAdmin();
