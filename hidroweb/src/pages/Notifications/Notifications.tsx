import { Heading, Text } from "@chakra-ui/react";
import Notif from "../../componentes/Notif/Notif"
import styled from "styled-components";

const Titulo = styled(Heading)`
    color: white;
    text-align: left;
    font-family: "ABeeZee" !important;
    margin-left: 20px;
`;

export const Notifications = () => {
    return (
        <>
            <Titulo size="md">🔔 Notificaciones de Umbrales en Tiempo Real</Titulo>
            <Text
                color="white"
                fontSize="sm"
                margin={4}
                textAlign={{ base: "justify" }}>
                En esta módulo se visualiza una comparativa en tiempo real entre los valores actuales de tus cultivos y los rangos ideales establecidos.
            </Text>
            <Notif></Notif>

        </>
    )
} 