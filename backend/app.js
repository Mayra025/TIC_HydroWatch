require('dotenv').config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 
const weatherRoutes = require("./routes/weatherRoutes"); 
const telegramRoutes = require('./routes/telegramRoutes'); 

const app = express();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Usa las rutas definidas
app.use("/api/auth", authRoutes); 
app.use("/api/weathers", weatherRoutes);
app.use('/api/telegram', telegramRoutes); 


// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});