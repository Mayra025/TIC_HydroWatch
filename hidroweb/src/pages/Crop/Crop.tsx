import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardBody,
    Grid,
    GridItem,
    Heading,
    Stack,
    StackDivider,
    Text,
    useDisclosure,
    useBreakpointValue,
} from "@chakra-ui/react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormC from "../../componentes/FormC/FormC";
import styled from "styled-components";

interface Cultivo {
    id: string;
    especie: string;
    variedad: string;
    fase: string;
    fechaSiembra: string;
}

// Styled-components para estilos personalizados
const CropContainer = styled(Box)`
  display: grid;
  gap: 20px;
  margin-left: 25px;
  min-height: 80vh;

  @media (max-width: 1024px) {
    margin: 15px;
    padding: 5px;
  }

  @media (max-width: 768px) {
    margin: 10px;
    padding: 4px;
  }
`;

const CultivoHeading = styled(Heading)`
  color: white;
  margin-bottom: 25px;
  font-family: "ABeeZee" !important;
`;
const Titulo = styled(Text)`
  color: white;
  margin-bottom: 20px;
  font-family: "ABeeZee" !important;
  display: flex;
  justify-content: center;
  width: 100%;
`;


const ResponsiveGrid = styled(Grid) <{ columns: number }>`
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Crop: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [cultivos, setCultivos] = useState<Cultivo[]>([]);
    const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const auth = getAuth();
    const firestore = getFirestore();

    useEffect(() => {
        const fetchCultivos = async () => {
            const user = auth.currentUser;
            if (user) {
                const cultivosCollection = collection(firestore, `Hidrocultores/${user.uid}/Cultivos`);
                const cultivosSnap = await getDocs(cultivosCollection);
                const cultivosList = cultivosSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Cultivo[];
                setCultivos(cultivosList);
            }
        };

        fetchCultivos();
    }, [auth, firestore]);

    const handleEditClick = (cultivo: Cultivo) => {
        setSelectedCultivo(cultivo);
        setIsCreating(false);
        onOpen();
    };

    const handleDeleteClick = async (cultivoId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este cultivo?");
        if (!confirmDelete) {
            return;
        }

        const user = auth.currentUser;
        if (user) {
            try {
                await deleteDoc(doc(firestore, `Hidrocultores/${user.uid}/Cultivos/${cultivoId}`));
                setCultivos(cultivos.filter((cultivo) => cultivo.id !== cultivoId));
                toast.success("Cultivo eliminado con éxito.", { position: "bottom-right" });
            } catch (error) {
                toast.error("Ocurrió un error al eliminar el cultivo.", { position: "bottom-right" });
            }
        }
    };

    const handleAddClick = () => {
        setSelectedCultivo(null);
        setIsCreating(true);
        onOpen();
    };

    const handleSave = async () => {
        onClose();
        const user = auth.currentUser;
        if (!user) return;

        try {
            const cultivosCollection = collection(firestore, `Hidrocultores/${user.uid}/Cultivos`);
            const cultivosSnap = await getDocs(cultivosCollection);
            const cultivosList = cultivosSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Cultivo[];
            setCultivos(cultivosList);
            toast.success("Cultivo guardado con éxito.", { position: "bottom-right" });
        } catch (error) {
            toast.error("Ocurrió un error al guardar el cultivo.", { position: "bottom-right" });
        }
    };

    const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

    return (
        <CropContainer>
            <ResponsiveGrid columns={columns || 1}>
                <GridItem colSpan={3}>
                    <CultivoHeading size="md">
                        🥬 Registro y Gestión de Cultivos Hidropónicos NFT
                    </CultivoHeading>
                    <Text
                        color="white"
                        fontSize="sm"

                        margin={4}
                        textAlign={{ base: "justify" }}>
                        En este módulo podrás registrar nuevos cultivos, gestionar los ya existentes,
                        editarlos si es necesario o eliminarlos cuando ya no los necesites.
                    </Text>

                    <Button
                        size="sm"
                        mb={4}
                        backgroundColor="#06b863"
                        color="white"
                        onClick={handleAddClick}
                        _hover={{ backgroundColor: "#05a354" }}
                    >
                        Agregar Cultivo
                    </Button>

                    <Titulo size="md">Listado de Cultivos registrados</Titulo>

                    <Card>
                        <CardBody>
                            <Stack divider={<StackDivider />} spacing="4">
                                {cultivos.map((cultivo) => (
                                    <Box key={cultivo.id}>
                                        <Grid templateColumns="repeat(4, 1fr)" gap={4} alignItems="center">
                                            <GridItem>
                                                <Heading size="sm">CULTIVO NFT</Heading>
                                                <Text pt="2" fontSize="sm" >
                                                    {cultivo.especie} - {cultivo.variedad}
                                                </Text>
                                            </GridItem>
                                            <GridItem>
                                                <Heading size="sm">FECHA DE SIEMBRA</Heading>

                                                <Text pt="2" fontSize="sm">
                                                    {cultivo.fechaSiembra}
                                                </Text>
                                            </GridItem>
                                            <GridItem>
                                                <Heading size="sm">FASE</Heading>

                                                <Text pt="2" fontSize="sm">
                                                    {cultivo.fase}
                                                </Text>
                                            </GridItem>
                                            <GridItem textAlign="right">
                                                <Button
                                                    size="sm"
                                                    mt={2}
                                                    backgroundColor="teal"
                                                    color="white"
                                                    onClick={() => handleEditClick(cultivo)}
                                                    _hover={{ backgroundColor: "teal.700" }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    mt={2}
                                                    ml={2}
                                                    backgroundColor="red"
                                                    color="white"
                                                    onClick={() => handleDeleteClick(cultivo.id)}
                                                    _hover={{ backgroundColor: "#BB1A1A" }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </GridItem>
                                        </Grid>
                                    </Box>
                                ))}
                            </Stack>
                        </CardBody>
                    </Card>
                </GridItem>
            </ResponsiveGrid>
            <FormC isOpen={isOpen} onClose={onClose} crop={selectedCultivo} isCreating={isCreating} onSave={handleSave} />
        </CropContainer>
    );
};
