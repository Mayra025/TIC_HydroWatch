//Ojo, no aparece nada aen el navegador por fallas de vite y context de react.. 
//hay q reguardar el Context para q aparezca

//2 podria considerar mostrar un mensaje de conoalertas activas 
import { Box, Heading, Grid, GridItem, Stack, StackDivider, Text } from "@chakra-ui/react";
import { useAlerts } from "../../context/AlertContext";

const Notif = () => {
  const { activeAlerts } = useAlerts();

  return (
    <Box w="100%" maxW="1200px" margin="25px">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {activeAlerts.map((alert) => (
          <GridItem key={alert.cultivoId}>
            <Box
              borderColor={alert.color}
              borderWidth={2}
              padding={4}
              boxShadow="lg"
              borderRadius={15}
              // bg={alert.color === "red.500" ? "red.50" : alert.color === "green.500" ? "green.50" : "yellow.50"}
            >
              <Stack divider={<StackDivider />} spacing={4}>
                <Heading size="xs" textTransform="uppercase" color={alert.color}>
                  {`Cultivo: ${alert.especie || "Desconocido"} - ${alert.variedad || "Variedad no especificada"} (${alert.fase})`}
                </Heading>
                fds
                <Text fontSize="sm">
                  <strong>Temperatura requerida:</strong>{" "}
                  {alert.requerimientos?.temperatura?.min ?? "N/A"}°C -{" "}
                  {alert.requerimientos?.temperatura?.max ?? "N/A"}°C
                </Text>
                <Text fontSize="sm">
                  <strong>pH requerido:</strong>{" "}
                  {alert.requerimientos?.ph?.min ?? "N/A"} - {alert.requerimientos?.ph?.max ?? "N/A"}
                </Text>
                <Text fontSize="sm">
                  <strong>Nivel de agua requerido:</strong> {alert.requerimientos?.nivelAgua ?? "N/A"}
                </Text>
                <Text fontSize="sm">
                  <strong>Temperatura actual:</strong>{" "}
                  {alert.currentTemp !== null ? `${alert.currentTemp}°C` : "N/A"}
                </Text>
                <Text fontSize="sm">
                  <strong>pH actual:</strong> {alert.currentPh !== null ? alert.currentPh : "N/A"}
                </Text>
                <Text fontSize="sm">
                  <strong>Nivel de agua actual:</strong>{" "}
                  {alert.currentWaterLevel !== null ? `${alert.currentWaterLevel}%` : "N/A"}
                </Text>
                {alert.error && (
                  <Text fontSize="sm" color="red.500">
                    Error: Los datos no se han actualizado.
                  </Text>
                )}
              </Stack>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Notif;
