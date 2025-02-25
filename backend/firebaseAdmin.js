const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); //archivo de clave de servicio.

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hidroweb-data.firebaseio.com", // base de datos.
});

const db = admin.firestore();



db.collection('Sensores').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
            const sensorData = change.doc.data();
            const { userId, cultivoId, pH, temperature, waterLevel, dateTime } = sensorData;

            try {
                // Validar que dateTime esté definido
                if (!dateTime) {
                    throw new Error("dateTime no está definido.");
                }

                // Convertir dateTime de cadena a objeto Date, sin la "Z" para evitar UTC
                const dateObject = new Date(dateTime.replace(" ", "T")); // Evitar agregar "Z" al final

                // Verificar si la fecha es válida
                if (isNaN(dateObject.getTime())) {
                    throw new Error("dateTime no es un formato de fecha válido.");
                }

                // Obtener componentes de la fecha
                const year = dateObject.getFullYear();
                const month = dateObject.toLocaleString('es-ES', { month: 'long' });
                const day = String(dateObject.getDate()).padStart(2, '0');

                // Obtener componentes de la hora en formato 24 horas
                let hours = dateObject.getHours(); // Ahora en la hora local correcta
                const minutes = String(dateObject.getMinutes()).padStart(2, '0');
                const seconds = String(dateObject.getSeconds()).padStart(2, '0');

                // Convertir a formato 12 horas con AM/PM
                const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
                hours = hours % 12;
                hours = hours ? hours : 12; // El "0" se debe convertir a "12" en el formato de 12 horas

                // Formatear la fecha y hora en el formato deseado (solo para mostrar si lo deseas)
                const finalDateTime = `${day} de ${month} de ${year}, ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;

                // Convertir a objeto Firestore Timestamp usando Admin SDK
                const firestoreTimestamp = admin.firestore.Timestamp.fromDate(dateObject);

                // Convertir los tipos de datos
                const formattedPH = pH.toFixed(2).toString();
                const formattedTemperature = temperature.toFixed(2).toString();
                const formattedWaterLevel = waterLevel.toFixed(2).toString();

                // Mover los datos a la subcolección Sensores dentro del cultivo correspondiente
                await db.collection('Hidrocultores')
                    .doc(userId)
                    .collection('Cultivos')
                    .doc(cultivoId)
                    .collection('Sensores')
                    .add({
                        pH: formattedPH,
                        temperature: formattedTemperature,
                        waterLevel: formattedWaterLevel,
                        dateTime: firestoreTimestamp,
                    });

                console.log(`Datos del sensor movidos al cultivo ${cultivoId} del usuario ${userId}`);
            } catch (error) {
                console.error('Error al mover los datos del sensor:', error);
            }

            // Eliminar los datos de la colección general Sensores después de moverlos
            try {
                await db.collection('Sensores').doc(change.doc.id).delete();
                console.log(`Datos del sensor ${change.doc.id} eliminados de la colección general Sensores`);
            } catch (error) {
                console.error('Error al eliminar los datos del sensor:', error);
            }
        }
    });
});

module.exports = { admin, db };


