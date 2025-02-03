const { admin } = require('../firebaseAdmin');
const TelegramBot = require('node-telegram-bot-api');

// Inicializa el bot de Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const firestore = admin.firestore();

// Controlador para capturar el ID de Telegram cuando el usuario hace /start
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id; // ID del chat de Telegram
  const uid = match[1]; // UID del usuario de la app web

  try {
    const usersRef = firestore.collection('Hidrocultores');

    // Buscar el usuario en Firestore usando el UID
    const snapshot = await usersRef.where('userId', '==', uid).get();

    if (!snapshot.empty) {
      snapshot.forEach(async (doc) => {
        // Si existe el usuario en Firestore, guarda el ID de Telegram
        await usersRef.doc(doc.id).update({
          telegramUserId: chatId // Guardar el ID de Telegram
        });
        bot.sendMessage(chatId, 'Tu ID de Telegram ha sido registrado correctamente.');
      });
    } else {
      bot.sendMessage(chatId, 'Usuario no encontrado.');
    }
  } catch (error) {
    console.error('Error al guardar el ID de Telegram:', error);
  }
});


const sendTelegramAlert = async (req, res) => {
  const {
    uid,
    cultivoId,
    especie,
    variedad,
    fase,
    fechaSiembra,
    tempAlert,
    phAlert,
    waterLevelAlert,
    actualTemp,
    actualPh,
    actualWaterLevel,
  } = req.body;

  try {
    const firestore = admin.firestore();

    if (!uid || !cultivoId) {
      return res.status(400).json({ message: "UID o CultivoID no proporcionado" });
    }

    console.log(`UID: ${uid}, CultivoID: ${cultivoId}`);

    // Obtener el documento del usuario en la colección 'Hidrocultores'
    const userRef = firestore.collection("Hidrocultores").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userData = userDoc.data();
    const telegramId = userData.telegramUserId; // ID de Telegram guardado en la colección de usuarios

    if (!telegramId) {
      return res.status(400).json({ message: "No se encontró el Telegram ID" });
    }

    // Obtener el cultivo por ID
    const cultivoRef = userRef.collection("Cultivos").doc(cultivoId);
    const cultivoDoc = await cultivoRef.get();

    if (!cultivoDoc.exists) {
      return res.status(404).json({ message: "Cultivo no encontrado" });
    }

    const cultivoData = cultivoDoc.data();

    const { temperatura, ph, nivelAgua } = cultivoData.requerimientos;


    let alertMessage = `🚨 *¡Alerta en tu cultivo!*\n\n` +
      `*Cultivo*: ${especie} ${variedad}\n` +
      `*Fecha de siembra*: ${fechaSiembra}\n` +
      `*Fase actual*: ${fase}\n\n`;

    // Verificar si la temperatura está fuera del rango
    if (tempAlert && (actualTemp > temperatura.max || actualTemp < temperatura.min)) {
      alertMessage += `🔥 *Temperatura fuera del rango permitido:* ${temperatura.min}°C - ${temperatura.max}°C\n` +
        `   - Actual: ${actualTemp}°C\n\n`;
      // `   - Rango permitido: ${temperatura.min}°C - ${temperatura.max}°C\n\n`;
    }

    // Verificar si el pH está fuera del rango
    if (phAlert && (actualPh > ph.max || actualPh < ph.min)) {
      alertMessage += `⚗️ *pH fuera del rango permitido:* ${ph.min} - ${ph.max}\n` +
        `   - Actual: ${actualPh}\n\n`;
      // `   - Rango permitido: ${ph.min} - ${ph.max}\n\n`;
    }

    // Verificar si el nivel de agua está fuera del umbral
    if (waterLevelAlert && actualWaterLevel === 0) {
      alertMessage += `💧 *Alerta de agua:*\n` +
        `   - No hay agua disponible en el sistema.\n\n`;
    } else if (waterLevelAlert) {
      alertMessage += `💧 *Nivel de agua fuera de los umbrales:*\n` +
        `   - Actual: ${actualWaterLevel}%\n\n`;
      // `   - Estado esperado: Suficiente\n\n`;
    }

    // Enviar notificación por Telegram
    await bot.sendMessage(telegramId, alertMessage, { parse_mode: "Markdown" });
    console.log(`Mensaje enviado a Telegram ID: ${telegramId}`);
    return res.status(200).json({ message: "Alerta enviada correctamente" });
  } catch (error) {
    console.error("Error al enviar la alerta:", error);
    res.status(500).json({ message: "Error al enviar la alerta" });
  }
};

module.exports = { sendTelegramAlert };

