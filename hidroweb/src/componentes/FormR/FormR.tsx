import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import axios from "axios";

const FormR: React.FC = () => {
    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = useColorModeValue("gray.400", "gray.500");
    const brandStars = useColorModeValue("brand.500", "brand.400");
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [_isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.target as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        // if (!name || !email || !password) {
        //     setErrorMessage("Todos los campos son obligatorios.");
        //     return;
        // }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
            });

            setSuccessMessage("¡Registro exitoso! Redirigiendo...");
            setErrorMessage(null);

            if (response.status === 201) {
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErrorMessage("Error en el registro. Inténtalo de nuevo.");
            } else {
                setErrorMessage("Error desconocido en el registro.");
            }
            setSuccessMessage(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex
            as="form"
            onSubmit={handleRegister}
            direction="column"
            w={{ base: "100%", md: "50%", lg: "35%" }}
            maxW="100%"
            background={useColorModeValue("white", "gray.700")}
            borderRadius="15px"
            p="25px"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
            {successMessage && (
                <Alert status="success" mb="24px">
                    <AlertIcon />
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert status="error" mb="24px">
                    <AlertIcon />
                    {errorMessage}
                </Alert>
            )}

            <FormControl>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                    <Flex as="span" align="center">
                        Alias<Text as="span" color={brandStars} ml="1"> *</Text>
                    </Flex>
                </FormLabel>
                <Input
                    isRequired
                    variant="outline"
                    fontSize="sm"
                    type="text"
                    id="name-field"
                    placeholder="Tu nombre o un alias"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    name="name"
                />
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                    <Flex as="span" align="center">
                        Email<Text as="span" color={brandStars} ml="1"> *</Text>
                    </Flex>
                </FormLabel>
                <Input
                    isRequired
                    variant="outline"
                    fontSize="sm"
                    type="email"
                    id="email-field"
                    placeholder="mail@simmmple.com"
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    name="email"
                />
                <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                    <Flex as="span" align="center">
                        Contraseña<Text as="span" color={brandStars} ml="1"> *</Text>
                    </Flex>
                </FormLabel>
                <InputGroup size="md" mb="24px">
                    <Input
                        isRequired
                        fontSize="sm"
                        placeholder="Min. 8 characters"
                        type={showPassword ? "text" : "password"}
                        id="password-field"
                        variant="outline"
                        name="password"
                    />
                    <InputRightElement>
                        <Icon
                            color={textColorSecondary}
                            cursor="pointer"
                            as={showPassword ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                            onClick={handleClickShowPassword}
                        />
                    </InputRightElement>
                </InputGroup>
                <Button
                    type="submit"
                    fontSize="sm"
                    variant="solid"
                    fontWeight="500"
                    w="100%"
                    h="50px"
                    mb="24px"
                    backgroundColor={"#06b863"}
                    color={"white"}
                    _hover={{ backgroundColor: "#05a354" }}
                >
                    Regístrate
                </Button>
            </FormControl>
            <Flex flexDirection="column" justifyContent="center" alignItems="center">
                <Text color={textColorSecondary} fontWeight="400" fontSize="14px">
                    ¿Ya tienes una cuenta?
                    <NavLink to="/login">
                        <Text color={"#06b863"} as="span" ms="5px" fontWeight="500"
                            _hover={{ color: "#05a354" }}>
                            Ingresa aquí
                        </Text>
                    </NavLink>
                </Text>
            </Flex>
        </Flex>
    );
};

export default FormR;

