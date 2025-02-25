import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    GridItem,
    Grid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
    Heading,
    useColorModeValue,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderTrack,
    Badge,

} from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import styled from 'styled-components';


const ScrollableModalBody = styled(ModalBody)`
  overflow-y: auto;
  max-height: 80vh;  
  padding-right: 15px; //  mostrar el scroll 
`;
interface Cultivo {
    id: string;
    especie: string;
    variedad: string;
    fase: string;
    fechaSiembra: string;
    fotoVariedad?: string;
}

interface FormCProps {
    isOpen: boolean;
    onClose: () => void;
    crop: Cultivo | null;
    isCreating: boolean;
    onSave: () => void;
}

const variedadesLechuga = ["Lollo Rossa", "Butterhead", "Romaine", "Iceberg", "Batavia"];
const fasesLechuga = ["Germinación", "Crecimiento", "Maduración", "Cosecha"];


const requerimientosNutricionales: Record<string, any> = {
    'Lollo Rossa': {
        Germinación: {
            temperatura: { min: 20, max: 22 },
            ph: { min: 5.6, max: 6.0 },
            nivelAgua: "El agua debe cubrir el medio de germinación sin saturar la semilla."
        },
        Crecimiento: {
            temperatura: { min: 20, max: 22 },
            ph: { min: 5.9, max: 6.1 },
            nivelAgua: "Mantener un flujo continuo que cubra las raíces sin causar asfixia"
        },
        Maduración: {
            temperatura: { min: 18, max: 22 },
            ph: { min: 5.9, max: 6.2 },
            nivelAgua: "Mantener un flujo continuo, alta oxigenación para mantener el color rojizo brillante."
        },
        Cosecha: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.5, max: 6.2 },
            nivelAgua: "Mantener un flujo adecuado para garantizar acceso continuo a nutrientes"
        }
    },
    Butterhead: {
        Germinación: {
            temperatura: { min: 18, max: 20 },
            ph: { min: 5.8, max: 6.2 },
            nivelAgua: " El agua debe cubrir el medio de germinación sin saturar la semilla."
        },
        Crecimiento: {
            temperatura: { min: 18, max: 20 },
            ph: { min: 5.8, max: 6.0 },
            nivelAgua: "Flujo constante que mantenga las raíces húmedas pero bien oxigenadas"
        },
        Maduración: {
            temperatura: { min: 16, max: 18 },
            ph: { min: 5.8, max: 6.1 },
            nivelAgua: "Mantener un flujo continuo, evita el estrés para lograr hojas suaves y tiernas."
        },
        Cosecha: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.5, max: 6.2 },
            nivelAgua: "Mantener el flujo adecuado de la solución nutritiva sin encharcamiento."
        }
    },
    Romaine: {
        Germinación: {
            temperatura: { min: 20, max: 22 },
            ph: { min: 5.5, max: 5.9 },
            nivelAgua: " El agua debe cubrir el medio de germinación sin saturar la semilla."
        },
        Crecimiento: {
            temperatura: { min: 18, max: 22 },
            ph: { min: 5.7, max: 5.9 },
            nivelAgua: "Flujo constante para evitar la deshidratación de las raíces."
        },
        Maduración: {
            temperatura: { min: 18, max: 20 },
            ph: { min: 5.7, max: 6.0 },
            nivelAgua: "Mantener un flujo continuo, favorece raíces aireadas para un crecimiento robusto."
        },
        Cosecha: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.5, max: 6.2 },
            nivelAgua: "Fluir de manera constante para suministrar nutrientes, sin ahogar las raíces"
        }
    },
    Iceberg: {
        Germinación: {
            temperatura: { min: 21, max: 24 },
            ph: { min: 5.8, max: 6.3 },
            nivelAgua: " El agua debe cubrir el medio de germinación sin saturar la semilla."
        },
        Crecimiento: {
            temperatura: { min: 20, max: 23 },
            ph: { min: 5.9, max: 6.2 },
            nivelAgua: "Flujo constante y continuo para mantener las raíces oxigenadas y nutridas."
        },
        Maduración: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.9, max: 6.3 },
            nivelAgua: "Mantener un flujo continuo, requiere humedad constante para formar cabezas compactas."
        },
        Cosecha: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.5, max: 6.2 },
            nivelAgua: "Flujo adecuado para mantener un buen suministro de nutrientes sin causar encharcamiento."
        }
    },
    Batavia: {
        Germinación: {
            temperatura: { min: 19, max: 22 },
            ph: { min: 5.7, max: 6.1 },
            nivelAgua: " El agua debe cubrir el medio de germinación sin saturar la semilla."
        },
        Crecimiento: {
            temperatura: { min: 19, max: 21 },
            ph: { min: 5.8, max: 6.0 },
            nivelAgua: "Mantener un flujo continuo que cubra las raíces sin causar encharcamiento"
        },
        Maduración: {
            temperatura: { min: 18, max: 20 },
            ph: { min: 5.8, max: 6.1 },
            nivelAgua: "Mantener un flujo continuo, buena circulación y control de oxigenación."
        },
        Cosecha: {
            temperatura: { min: 16, max: 20 },
            ph: { min: 5.5, max: 6.2 },
            nivelAgua: "Flujo adecuado para evitar la deshidratación de las raíces y proveer suficiente oxígeno."
        }
    },
};

const imagenesVariedades: Record<string, string> = {
    "Lollo Rossa": "/images/lolloRosa.jpg",
    "Butterhead": "/images/butterhead.jpg",
    "Romaine": "/images/romaine.png",
    "Iceberg": "/images/iceberg.jpg",
    "Batavia": "/images/batavia.jpg",
};


const FormC: React.FC<FormCProps> = ({ isOpen, onClose, crop, isCreating, onSave }) => {
    const [especie, setEspecie] = useState<string>("Lechuga");
    const [variedad, setVariedad] = useState<string>(isCreating ? "" : crop?.variedad || "");
    const [fase, setFase] = useState<string>(isCreating ? "" : crop?.fase || "");
    const [fechaSiembra, setFechaSiembra] = useState<string>(isCreating ? "" : crop?.fechaSiembra || "");
    const [fotoVariedad, setFotoVariedad] = useState<string>(imagenesVariedades[variedad] || "");
    const [uid, setUid] = useState<string | null>(null);

    useEffect(() => {
        setFotoVariedad(imagenesVariedades[variedad] || "");
    }, [variedad]);

    const [requerimientos, setRequerimientos] = useState({
        ph: { min: 0, max: 0 },
        temperatura: { min: 0, max: 0 },
        nivelAgua: ""
    });


    useEffect(() => {
        if (isOpen) {
            if (isCreating) {
                setEspecie("Lechuga");
                setUid("************");

                setVariedad("");
                setFase("");
                setFechaSiembra("");
                setRequerimientos({

                    ph: { min: 0, max: 0 },
                    temperatura: { min: 0, max: 0 },
                    nivelAgua: ""
                });
            } else if (crop) {
                setEspecie(crop.especie || "Lechuga");
                setVariedad(crop.variedad || "");
                setFase(crop.fase || "");
                setFechaSiembra(crop.fechaSiembra || "");
                setUid(crop.id);
                const req = requerimientosNutricionales[crop.variedad]?.[crop.fase] || {
                    ph: { min: 0, max: 0 },
                    temperatura: { min: 0, max: 0 },
                    nivelAgua: ""
                };
                setRequerimientos(req);

            }
        }
    }, [isOpen, isCreating, crop]);

    useEffect(() => {

        if (variedad && fase) {
            const req = requerimientosNutricionales[variedad]?.[fase] || {
                ph: { min: 0, max: 0 },
                temperatura: { min: 0, max: 0 },
                nivelAgua: ""
            };
            setRequerimientos(req);
        }
    }, [variedad, fase]);

    const handleSaveChanges = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        const firestore = getFirestore();

        if (!user) return;

        const cultivoData = {
            cultivoId: isCreating ? "" : crop?.id || "",
            especie,
            variedad,
            fase,
            fechaSiembra,
            fotoVariedad,
            requerimientos,
        };

        if (isCreating) {
            const newDocRef = doc(collection(firestore, `Hidrocultores/${user.uid}/Cultivos`));
            cultivoData.cultivoId = newDocRef.id;

            await setDoc(newDocRef, cultivoData);
        } else if (crop?.id) {
            const docRef = doc(firestore, `Hidrocultores/${user.uid}/Cultivos/${crop.id}`);
            await setDoc(docRef, cultivoData, { merge: true }); // merge para no sobrescribir campos no incluidos
        }

        onSave();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="1xl">
            <ModalOverlay />
            <ModalContent sx={{ fontFamily: "ABeeZee, sans-serif", maxW: "800px" }}>
                <ScrollableModalBody>
                    <ModalHeader>{isCreating ? "Crear Nuevo Cultivo" : `Editar Cultivo: ${especie}`}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody overflowY="auto">

                        <Box bg={useColorModeValue("white", "gray.700")} p={8} rounded="lg">
                            <Heading as="h3" size="lg" mb={4}>🥬 Información Básica del Cultivo NFT
                                <Tippy
                                    content={
                                        <div style={{ textAlign: 'left', maxWidth: '1000px' }}>
                                            <strong>💧 ¡Riego constante sin desperdicio!</strong>
                                            <br />
                                            En el cultivo hidropónico NFT, una fina capa de agua en movimiento lleva los nutrientes directamente a las raíces.
                                            Ideal para tus lechugas! 🥬✨
                                        </div>
                                    }
                                    allowHTML={true}
                                >
                                    <i className="fas fa-circle-info" style={{ marginLeft: '30px', cursor: 'pointer' }} />
                                </Tippy>
                            </Heading>

                            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                <GridItem colSpan={1}>
                                    <FormControl id="especie">
                                        <Text><b>Especie de planta: </b> {especie}</Text>
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <FormControl id="uid">
                                        <Text><b>ID Cultivo: </b> {uid}</Text>
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <Box
                                        width="120px"
                                        height="120px"
                                        borderRadius="full"
                                        overflow="hidden"
                                        boxShadow="0 0 10px rgba(0,0,0,0.1)"
                                        marginLeft={"80px"}
                                    >
                                        <img
                                            src={fotoVariedad}
                                            alt="Variedad seleccionada"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </Box>
                                </GridItem>

                                <GridItem colSpan={1}>
                                    <FormControl id="variedad" isRequired>
                                        <FormLabel>Variedad de la especie
                                            <Tippy
                                                content={
                                                    <div style={{ textAlign: 'left', maxWidth: '500px' }}>
                                                        <strong>🥬 ¿Cómo se ve cada tipo de lechuga?</strong>
                                                        <br />
                                                        <em>- Lollo Rossa:</em> Hojas rizadas y sueltas con un tono rojo intenso en los bordes.
                                                        <br /><br />
                                                        <em>- Butterhead:</em> Hojas suaves, lisas y redondeadas, formando una cabeza suelta. De color verde claro.
                                                        <br /><br />
                                                        <em>- Romaine:</em> Hojas alargadas, firmes y con nervaduras marcadas. De color verde intenso.
                                                        <br /><br />
                                                        <em>- Iceberg:</em> Cabeza compacta y esférica con hojas apretadas y gruesas. De color verde pálido casi blanco.
                                                        <br /><br />
                                                        <em>- Batavia:</em> Similar a la Iceberg, pero con hojas más onduladas y abiertas, mezcla de tonos verdes.
                                                    </div>
                                                }
                                                allowHTML={true}
                                                placement="right"
                                            >
                                                <i className="fas fa-question-circle" style={{ marginLeft: '10px', cursor: 'pointer' }} />
                                            </Tippy>

                                        </FormLabel>
                                        <Select
                                            placeholder="Seleccione la variedad"
                                            value={variedad}
                                            onChange={(e) => setVariedad(e.target.value)}
                                            isDisabled={!isCreating}
                                        >
                                            {variedadesLechuga.map((v) => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </GridItem>

                                <GridItem colSpan={1}>
                                    <FormControl id="fase" isRequired>
                                        <FormLabel>Fase de crecimiento
                                            <Tippy
                                                content={
                                                    <div style={{ textAlign: 'left', maxWidth: '550px' }}>
                                                        <strong>🥬 ¿En qué etapa está tu lechuga? </strong>
                                                        <br />
                                                        <em>- Germinación (3-7 días):</em> La semilla despierta 🌱, absorbe agua y brotan las primeras raíces y hojitas.
                                                        <br /><br />
                                                        <em>- Crecimiento (2-3 semanas):</em> La plántula ya tiene hojas reales y raíces fuertes. ¡Está lista para ser transferida a un cultivo hidropónico!
                                                        <br /><br />
                                                        <em>- Maduración (2-3 semanas):</em> La lechuga forma su cabeza o roseta, dependiendo de la variedad. Aquí necesita más cuidados para crecer sana.
                                                        <br /><br />
                                                        <em>- Cosecha (6-8 semanas desde Germinación):</em> ¡Momento de disfrutar! 🥬 Dependiendo de la variedad, tu lechuga está lista en 30-60 días.
                                                    </div>
                                                }
                                                allowHTML={true}
                                                placement="right"
                                            >
                                                <i className="fas fa-question-circle" style={{ marginLeft: '10px', cursor: 'pointer' }} />
                                            </Tippy>

                                        </FormLabel>
                                        <Select
                                            id="fase"
                                            placeholder="Seleccione la fase"
                                            value={fase}
                                            onChange={(e) => setFase(e.target.value)}
                                        >
                                            {fasesLechuga.map((f) => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <FormControl id="fechaSiembra" isRequired>
                                        <FormLabel htmlFor="fechaSiembra">Fecha de Siembra
                                            <Tippy
                                                content={
                                                    <div style={{ textAlign: 'left', maxWidth: '250px' }}>
                                                        <strong>📆 ¡Registrar la fecha te ayuda a llevar un mejor control!</strong>
                                                        <br />
                                                        - Te dice en qué fase está tu lechuga.
                                                        <br />
                                                        - Ayuda a saber cuándo estará lista para la cosecha.
                                                        <br />
                                                        - Facilita el monitoreo y mejora el rendimiento del cultivo. 🚀
                                                    </div>
                                                }
                                                allowHTML={true}
                                            >
                                                <i className="fas fa-circle-info" style={{ marginLeft: '10px', cursor: 'pointer' }} />

                                            </Tippy>
                                        </FormLabel>
                                        <Input
                                            id="fechaSiembra"
                                            type="date"
                                            value={fechaSiembra}
                                            onChange={(e) => setFechaSiembra(e.target.value)}
                                            isReadOnly={!isCreating}
                                        />
                                    </FormControl>
                                </GridItem>
                            </Grid>

                            <Heading as="h4" size="md" mt={8} mb={4}>
                                Rangos recomendados para el cultivo
                                <Tippy
                                    content={
                                        <div style={{ textAlign: 'left', maxWidth: '550px' }}>
                                            <strong> 📈 ¡Cuida estos rangos para un cultivo saludable! </strong>
                                            <br />
                                            - <strong>pH:</strong> Si el pH no es el adecuado, las raíces no pueden absorber bien los nutrientes. ¡Es como comer sin digerir!
                                            <br /> <br />
                                            - <strong>Temperatura:</strong> Si hace demasiado frío o calor, la lechuga crece lento o se estresa. ¡Ni congelada ni sofocada!
                                            <br /> <br />
                                            - <strong>Nivel de agua:</strong> Mucha agua puede ahogar las raíces, y poca deja a la planta sin alimento. ¡El equilibrio es clave!
                                            <br /> <br />
                                            Mantén estos valores en su punto y tus lechugas estarán en su mejor momento. 🚀🥬
                                        </div>
                                    }
                                    allowHTML={true}
                                    placement="right"
                                >
                                    <i className="fas fa-circle-info" style={{ marginLeft: '10px', cursor: 'pointer' }} />
                                </Tippy>

                            </Heading>
                            <Grid templateColumns="repeat(2, 1fr)" gap={6}>

                                <GridItem>
                                    <FormControl>
                                        <FormLabel><b> 🧪pH Óptimo</b> </FormLabel>
                                        <Box width="100%" maxW="100%">
                                            <Slider
                                                aria-label="slider-ph"
                                                min={0}
                                                max={14}
                                                value={requerimientos.ph.min}
                                                isReadOnly
                                                colorScheme="green"
                                            >
                                                <SliderMark value={requerimientos.ph.max} mt="2" ml="-2.5" fontSize="sm">
                                                    {requerimientos.ph.max}
                                                </SliderMark>
                                                <SliderTrack>
                                                    <SliderFilledTrack />
                                                </SliderTrack>
                                            </Slider>
                                            <Text fontSize="sm" mt={8}>{`Mínimo: ${requerimientos.ph.min}, Máximo: ${requerimientos.ph.max}`}</Text>
                                        </Box>
                                    </FormControl>
                                </GridItem>

                                <GridItem>
                                    <FormControl>
                                        <FormLabel> <b>🌡️ Temperatura Óptima</b></FormLabel>
                                        <Box width="100%" maxW="100%">
                                            <Slider
                                                aria-label="slider-temp"
                                                min={0}
                                                max={40}
                                                value={requerimientos.temperatura.min}
                                                isReadOnly
                                                colorScheme="green"
                                            >
                                                <SliderMark value={requerimientos.temperatura.max} mt="2" ml="-2.5" fontSize="sm">
                                                    {requerimientos.temperatura.max}°C
                                                </SliderMark>
                                                <SliderTrack>
                                                    <SliderFilledTrack />
                                                </SliderTrack>
                                            </Slider>
                                            <Text fontSize="sm" mt={8}>{`Mínima: ${requerimientos.temperatura.min}°C, Máxima: ${requerimientos.temperatura.max}°C`}</Text>
                                        </Box>
                                    </FormControl>
                                </GridItem>
                            </Grid>

                            <br />
                            <Grid>
                                <GridItem>
                                    <FormControl>
                                        <FormLabel><b>💧 Nivel de Agua</b></FormLabel>

                                        <Badge colorScheme={requerimientos.nivelAgua === "Bajo" ? "red" : "green"}>
                                            {requerimientos.nivelAgua}
                                        </Badge>
                                    </FormControl>
                                </GridItem>
                            </Grid>

                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            data-testid="boton-cambios"
                            colorScheme="blue"
                            onClick={handleSaveChanges}
                            isDisabled={!variedad || !fase || !fechaSiembra}
                        >
                            {isCreating ? "Crear Cultivo" : "Guardar Cambios"}
                        </Button>
                    </ModalFooter>
                </ScrollableModalBody>

            </ModalContent>
        </Modal>
    );
};

export default FormC;