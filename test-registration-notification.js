// Test script per verificare le notifiche di registrazione
const { sendNewUserNotificationEmail } = require('./server/bird');

async function testNotification() {
  console.log('Testing new user registration notification...');
  
  try {
    const result = await sendNewUserNotificationEmail(
      'Mario Rossi', 
      'mario.rossi@example.com'
    );
    
    if (result) {
      console.log('✅ Email di notifica inviata con successo a g.ingrosso@gabhub.it');
    } else {
      console.log('❌ Errore nell\'invio dell\'email di notifica');
    }
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testNotification();