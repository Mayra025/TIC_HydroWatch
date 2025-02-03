const express = require('express');
const { sendTelegramAlert } = require('../controllers/telegramController');

const router = express.Router();

// No ruta explícita aquí, ya que el bot de Telegram maneja las interacciones

// Ruta para enviar alertas a Telegram
router.post('/send-telegram-alert', sendTelegramAlert);

module.exports = router;
