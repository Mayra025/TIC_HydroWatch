const { admin, db } = require("../firebaseAdmin");

const signIn = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await admin.auth().getUserByEmail(email);

        // Crear token de sesión personalizado
        const token = await admin.auth().createCustomToken(user.uid);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ error: "Error al iniciar sesión. Verifica tu email y contraseña." });
    }
};

const signOn = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        // Crear usuario en Firebase Auth
        const userCredential = await admin.auth().createUser({
            email,
            password,
            displayName: `${name}`,

        });

        // Guardar datos adicionales en Firestore
        await db.collection("Hidrocultores").doc(userCredential.uid).set({
            userId: userCredential.uid,

            nombre: name,
            correo: email,
        });

        res.status(201).json({ message: "¡Registro exitoso!" });
        console.log("¡Registro exitoso!");
    } catch (error) {
        res.status(500).json({ error: "Error en el registro: " + error.message });
        console.log("Error en el registro: " + error.message);
    }
};

module.exports = { signIn, signOn };
