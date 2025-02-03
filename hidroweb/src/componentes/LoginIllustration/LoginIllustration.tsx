import React, { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LogoStyles } from "./LoginIllustration.styles";
import Icon from "../../assets/lo.png";

interface AuthIllustrationProps {
    children: ReactNode;
    illustrationBackground: string;
}

const LoginIllustration: React.FC<AuthIllustrationProps> = ({ children, illustrationBackground }) => {
    return (
        <Flex position="relative" h="max-content">
            <Flex
                h={{ sm: "initial", md: "unset", lg: "100vh", xl: "97vh" }}
                w="100%"
                maxW={{ md: "66%", lg: "1313px" }}
                mx="auto"
                pt={{ sm: "50px", md: "0px" }}
                px={{ lg: "30px", xl: "0px" }}
                ps={{ xl: "70px" }}
                justifyContent="start"
                direction="column"
            >
                {children}
                <Box
                    display={{ base: "none", md: "block" }}
                    h="100%"
                    minH="100vh"
                    w={{ lg: "50vw", "2xl": "44vw" }}
                    position="absolute"
                    right="0px"
                >
                    <div style={LogoStyles}>
                        <img src={Icon} alt="PNG icon" className="App-logo" width={80} height={80} />
                        <Text ml="10px" fontStyle={"italic"}>
                            HydroWatch
                        </Text>
                    </div>

                    <Text
                        style={{
                            position: "absolute",
                            top: "51%",  // Un poco más abajo del logo
                            left: "32%",
                            transform: "translateY(-50%)", // Para centrar mejor verticalmente
                            color: "rgba(255, 255, 255, 0.5)", // Un color blanco tenue
                            fontSize: "12px",
                            textAlign: "center",
                            maxWidth: "60%",
                            zIndex: 1,
                            fontStyle: "italic",

                        }}
                    >
                        La app que monitorea en tiempo real tus cultivos hidropónicos NFT
                    </Text>

                    <Flex
                        data-testid="illustration-box"
                        bg={`url(${illustrationBackground})`}
                        justify="center"
                        align="end"
                        w="100%"
                        h="100%"
                        bgSize="cover"
                        bgPosition="50%"
                        position="absolute"
                        borderBottomLeftRadius={{ lg: "120px", xl: "200px" }}
                    ></Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default LoginIllustration;
