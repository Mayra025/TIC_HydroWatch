import { db } from './firebaseAdmin.js'; 
import generateMockData from './generateMockData.js';

const sendMockData = async () => {
  try {
    const data = generateMockData();    
    const docRef = db.collection('Sensores').doc();
    await docRef.set(data);
    console.log('Mock data sent:', data);
  } catch (error) {
    console.error('Error sending mock data:', error);
  }
};

// Enviar datos simulados cada 5 segundos -5000 -120000 - 3600000
setInterval(sendMockData, 3600000 );

// node data/sendMockData.js