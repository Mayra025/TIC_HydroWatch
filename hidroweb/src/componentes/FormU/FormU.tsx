import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Grid,
    GridItem,
    Heading,
    useColorModeValue,
} from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const FormU: React.FC = () => {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telegramUserId, setTelegramUserId] = useState("");
    const [fotoURL, setFotoURL] = useState<string | null>(null);
    const [foto, setFoto] = useState<File | null>(null);
    const [uid, setUid] = useState<string | null>(null);

    const auth = getAuth();
    const firestore = getFirestore();
    const storage = getStorage();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(firestore, "Hidrocultores", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setNombre(data.nombre || "");
                    setEmail(data.correo || "");
                    setTelegramUserId(data.telegramUserId || "");
                    setFotoURL(data.photoURL || null);
                    setUid(user.uid);

                }
            }
        };

        fetchUserData();
    }, [auth, firestore]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFoto(e.target.files[0]);
        }
    };

    const isFormValid = () =>
        nombre && email;

    const handleSaveChanges = async () => {
        if (!isFormValid()) return;

        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(firestore, "Hidrocultores", user.uid);

                // Subida de la foto solo si se seleccionó una
                let newPhotoURL = fotoURL;
                if (foto) {
                    const photoRef = ref(storage, `profile_pics/${user.uid}`);
                    const snapshot = await uploadBytes(photoRef, foto);
                    newPhotoURL = await getDownloadURL(snapshot.ref);
                }

                const finalPhotoURL = newPhotoURL || 'default-photo-url'; // Valor predeterminado si es null
                const finalTelegramUserId = telegramUserId || ''; // Valor vacío si no se ha proporcionado

                // Actualiza Firestore
                await setDoc(userRef, {
                    nombre,
                    correo: email,
                    photoURL: finalPhotoURL,
                    telegramUserId: finalTelegramUserId,
                }, { merge: true });

                alert("Cambios guardados");
            }

        } catch (error) {
            console.error("Error al guardar los cambios: ", error);
        }
    };

    const handleTelegramConfig = async () => {
        const user = auth.currentUser;
        if (user) {
            // Abrir el bot de Telegram con el UID
            window.open(`https://t.me/smartgreennotif_bot?start=${user.uid}`, '_blank');
        } else {
            alert("Debes estar autenticado para configurar Telegram.");
        }
    };



    return (
        <Flex align="center" justify="center" minH="100vh">
            <Box
                color={"black"}
                bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(74, 85, 104, 0.8)')}
                p={8}
                rounded="lg"
                shadow="lg"
                maxWidth="800px"
                width="100%"
                position="relative"
            >
                {fotoURL && (
                    <Box
                        position="absolute"
                        top="16px"
                        right="16px"
                        width="80px"
                        height="80px"
                        borderRadius="50%"
                        overflow="hidden"
                        boxShadow="0 0 10px rgba(0,0,0,0.1)"
                    >
                        <img
                            src={fotoURL}
                            alt="Foto de perfil"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>
                )}
                <Heading as="h3" size="md" mb={4} fontFamily={"ABeeZee"}>
                    Perfil de Usuario
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem>
                        <FormControl id="nombre" isRequired>
                            <FormLabel>Nombre</FormLabel>
                            <Input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </FormControl>
                    </GridItem>
                    <GridItem>
                        <FormControl id="uid" >
                            <FormLabel>ID Usuario</FormLabel>
                            <Input
                                type="text"
                                isReadOnly

                                value={uid || ""}
                                onChange={(e) => setUid(e.target.value)}
                                backgroundColor={"gray.400"}

                            />
                        </FormControl>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <FormControl id="email">
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                isReadOnly
                                onChange={(e) => setEmail(e.target.value)}
                                backgroundColor={"gray.400"}
                            />
                        </FormControl>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <FormControl id="telefono">
                            <FormLabel>ID de Telegram

                                <Tippy
                                    content={
                                        <div style={{ textAlign: 'left', maxWidth: '550px' }}>
                                            <strong>📢 ¡Recibe alertas instantáneas en Telegram! 🚀</strong>
                                            <br />

                                            Al registrar tu ID de Telegram, recibirás notificaciones automáticas en tu teléfono sobre cambios importantes en tu cultivo.
                                            <br /> <br />
                                            ¡Así podrás actuar a tiempo y asegurarte de que todo esté bajo control! 🔔✨
                                        </div>
                                    }
                                    allowHTML={true}
                                >
                                    <i className="fas fa-circle-info" style={{ marginLeft: '10px', cursor: 'pointer' }} />
                                </Tippy>

                            </FormLabel>
                            <Input
                                type="password"
                                value={telegramUserId}
                                isReadOnly // no editable
                                backgroundColor={"gray.400"}
                            />
                            <Button
                                mt={2}
                                colorScheme="teal"
                                onClick={handleTelegramConfig}
                            >
                                Configurar Telegram
                            </Button>
                        </FormControl>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <FormControl id="foto">
                            <FormLabel>Foto</FormLabel>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </FormControl>
                    </GridItem>
                </Grid>

                <Button
                    mt={6}
                    backgroundColor={"#06b863"}
                    color="white"
                    _hover={{ backgroundColor: "#05a354" }}
                    isDisabled={!isFormValid()}
                    onClick={handleSaveChanges}
                >
                    Guardar Cambios
                </Button>
            </Box>
        </Flex>
    );
};

export default FormU;

// function setLoading(arg0: boolean) {
//     throw new Error("Function not implemented.");
// }
