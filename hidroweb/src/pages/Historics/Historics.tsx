import { Box, Grid, Heading, useColorModeValue, Text } from "@chakra-ui/react";
import styled from "styled-components";
import HistoricalChart from '../../componentes/HistoricalChart/HistoricalChart';

const Titulo = styled(Heading)`
  color: white;
  text-align: left;
  font-family: "ABeeZee" !important;
  margin-left: 20px;
`;

// Estilos para el grid principal
const HistoricsGrid = styled(Grid)`
  gap: 20px;
  margin: 25px;
  grid-auto-rows: minmax(180px, auto);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
`;

// Estilos para las cajas
const BoxStyled = styled(Box)`
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;  
`;

export const Historics = () => {

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(74, 85, 104, 0.8)');

  return (
    <>
      <Titulo size="md"> 📊 Consulta de Datos Monitoreados de tu Cultivo NFT</Titulo>
      <Text
        color="white"
        fontSize="sm"
        margin={4}
        marginLeft={7}
        textAlign={{ base: "justify" }}>
        Para realizar consultas, selecciona el cultivo y parámetro que deseas explorar, define el rango de fechas que te interesa,
        y obtén los datos correspondientes.
      </Text>
      <HistoricsGrid>
        <BoxStyled bg={bgColor}>
          <HistoricalChart />
        </BoxStyled>
      </HistoricsGrid>
    </>

  );
};

export default Historics;

