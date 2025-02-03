import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { RiEyeCloseLine } from "react-icons/ri";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const FormL: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const brandStars = useColorModeValue("brand.500", "brand.400");

    const navigate = useNavigate();

    const handleClick = () => setShow(!show);

    const handleLogin = async () => {
        const auth = getAuth(); //instancia de autenticación de Firebase
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken(); // token

            // Guardar token en sessionStorage
            sessionStorage.setItem("Auth Token", token);

            // autenticación es exitosa, navega al dashboard
            navigate("/app/dashboard");
            console.log("-----------------------Usuario autenticado: ", userCredential.user, "-----------------------");
        } catch (error) {
            setError("Error al iniciar sesión. Verifica tu email y contraseña.");
        }
    };

    return (
        <Flex
            maxW={{ base: "100%", md: "max-content" }}
            w="100%"
            mx={{ base: "auto", lg: "0px" }}
            me="auto"
            h="100%"
            alignItems="start"
            justifyContent="center"
            mb={{ base: "30px", md: "60px" }}
            px={{ base: "25px", md: "0px" }}
            mt={{ base: "40px", md: "14vh" }}
            flexDirection="column"
        >
            <Box me="auto">
                <Heading color={"#06b863"} fontSize="36px" mb="10px" fontFamily={'ABeeZee'}>
                    Iniciar sesión
                </Heading>
                <Text mb="36px" ms="4px" color={textColorSecondary} fontWeight="400" fontSize="md">
                    Ingresa tu email y contraseña para ingresar.
                </Text>
            </Box>
            <Flex
                zIndex="2"
                direction="column"
                w={{ base: "100%", md: "420px" }}
                maxW="100%"
                background="transparent"
                borderRadius="15px"
                mx={{ base: "auto", lg: "unset" }}
                me="auto"
                mb={{ base: "20px", md: "auto" }}
            >
                <FormControl>
                    <FormLabel htmlFor="email-field" display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                        Email <Text color={brandStars}> *</Text>
                    </FormLabel>
                    <Input
                        isRequired
                        fontSize="sm"
                        ms={{ base: "0px", md: "0px" }}
                        type="email"
                        id="email-field"
                        placeholder="mail@simmmple.com"
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        border="1px solid"
                        borderColor="gray.300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormLabel htmlFor="password-field" ms="4px" fontSize="sm" fontWeight="500" color={textColor} display="flex">
                        Contraseña <Text color={brandStars}> *</Text>
                    </FormLabel>
                    <InputGroup size="md">
                        <Input
                            isRequired
                            fontSize="sm"
                            placeholder="Min. 8 characters"
                            mb="24px"
                            size="lg"
                            type={show ? "text" : "password"}
                            id="password-field"
                            border="1px solid"
                            borderColor="gray.300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement display="flex" alignItems="center" mt="4px">
                            <RiEyeCloseLine onClick={handleClick} />
                        </InputRightElement>
                    </InputGroup>
                    {error && <Text color="red.500" mb="24px">{error}</Text>}
                    <Button fontSize="sm" variant="brand" fontWeight="500" w="100%" h="50" mb="24px" onClick={handleLogin}
                        backgroundColor={"#06b863"}
                        color={"white"}
                        _hover={{ backgroundColor: "#05a354" }}>
                        Ingresar
                    </Button>
                </FormControl>
                <Flex flexDirection="column" justifyContent="center" alignItems="start" maxW="100%" mt="0px">
                    <Text color="gray.400" fontWeight="400" fontSize="14px">
                        No tienes una cuenta?
                        <NavLink to="/register">
                            <Text color={"#06b863"} as="span" ms="5px" fontWeight="500"
                                _hover={{ color: "#05a354" }}
                            >
                                Regístrate.
                            </Text>
                        </NavLink>
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default FormL;
