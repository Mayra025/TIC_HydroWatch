import { Box, Flex, Heading, } from "@chakra-ui/react";
import FormR from "../../componentes/FormR/FormR";
import illustration from "../../assets/w.jpg";
import Logo from "../../assets/lo.png";
export const Register = () => {
    return (
        <Flex
            alignItems="center"
            justifyContent="center"
            height="100vh"
            p="20px"
            background={`url(${illustration})`}
            bgSize="cover"
            bgPosition="center"
            position="relative"  // Para posicionar el Box dentro del Flex
            fontFamily={'ABeeZee'}
        >
            <Box
                position="absolute"
                top="40px"
                left="30px"
                display="flex"
                alignItems="center"
            >
                <img src={Logo} alt="PNG icon" className="App-logo" width={40} height={40} />
                <Heading color="white" fontSize="36px" fontFamily={'ABeeZee'} fontStyle={"italic"} margin={2}>
                    HydroWatch
                </Heading>
            </Box>
            <FormR />
        </Flex>
    );
};
