import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import SensorCard from '../../componentes/SensorCard/SensorCard';
import CurrentWeather from '../../componentes/CurrentWeather/CurrentWeather';
import FiveDayClimate from '../../componentes/FiveDayClimate/FiveDayClimate';
import { Box as ChakraBox, Grid, useColorModeValue, Select, Button, Flex } from '@chakra-ui/react';
import styled from 'styled-components';
import { RiWaterPercentFill } from "react-icons/ri";
import { PiThermometerFill } from "react-icons/pi";
import { FaArrowCircleDown } from "react-icons/fa";
import { GiAcid } from "react-icons/gi";

const DashboardContainer = styled.div`
  display: grid;
  gap: 20px;
  margin: 25px;
  grid-template-columns: 1fr;
  grid-auto-rows: auto;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const StyledSelect = styled(Select)`
  grid-column: 1 / -1; // Selección ocupa toda la fila
  height: 40px;
  border-radius: 5px;
  margin-right: 10px; // Espacio entre el Select y el mensaje

  color: #06b863;
  background-color: white;

  &:focus {
    border-color: #56b4e9;
    box-shadow: 0 0 0 1px #56b4e9;
  }
`;

const StyledBox = styled(ChakraBox)`
  background: ${(props) => props.bg};
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow: hidden;
`;

const MonitoreoHeader = styled(Flex)`
  margin: 25px;
  align-items: center; // Centra verticalmente los elementos
  justify-content: flex-start; // Alinea a la izquierda
  gap: 10px; // Espacio entre los elementos
  margin-bottom: 20px;

  h2 {
    font-size: 1rem;
    color: #06b863;
    margin: 0;
  }

  p {
    font-size: 1rem;
    margin: 0;
    color: #333;
  }
`;

export const Dashboard = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(74, 85, 104, 0.8)');
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchCultivos = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user ? user.uid : null;

      if (!userId) {
        console.error('No hay usuario autenticado');
        return;
      }

      try {
        const db = getFirestore();
        setUserId(userId);
        const cultivosCollection = collection(db, 'Hidrocultores', userId, 'Cultivos');
        const cultivoDocs = await getDocs(cultivosCollection);
        const cultivosData = cultivoDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCultivos(cultivosData);
        if (cultivosData.length > 0) {
          setSelectedCultivo(cultivosData[0].id);
        }
      } catch (error) {
        console.error('Error al obtener cultivos:', error);
      }
    };

    fetchCultivos();
  }, []);

  const handleCultivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Cultivo seleccionado:', e.target.value);
    setSelectedCultivo(e.target.value);
  };

  return (
    <div>

      <MonitoreoHeader>
        <h2 style={{ color: 'white' }}>Monitoreando:</h2>
        <StyledSelect placeholder="Selecciona un cultivo" onChange={handleCultivoChange} value={selectedCultivo}>
          {cultivos.map(cultivo => (
            <option key={cultivo.id} value={cultivo.id}>
              {cultivo.especie} - {cultivo.variedad} ({cultivo.fase})
            </option>
          ))}
        </StyledSelect>

        <Button
          colorScheme="teal"
          size="md"
          px={6}
          py={2}
          ml="auto"
          onClick={() => document.getElementById('clima')?.scrollIntoView({ behavior: 'smooth' })}
          _hover={{ bg: 'teal.600', transform: 'scale(1.05)' }}
          _active={{ bg: 'teal.700' }} // Estilo al hacer clic
        >
          <p style={{
            display: 'flex', alignItems: 'center', gap: '8px', color: "white"
          }}>
            Ver Clima Actual <FaArrowCircleDown size="20px" />
          </p>
        </Button>
      </MonitoreoHeader>

      <DashboardContainer>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={4}
          gridColumn="1 / -1"
          width="100%"
        >
          <StyledBox bg={cardBg} gridColumn="span 1">
            <SensorCard
              sensorType="pH"
              cultivoId={selectedCultivo}
              icon={<GiAcid style={{ fontSize: '90px' }} />}
              userId={userId}
            />
          </StyledBox>

          <StyledBox bg={cardBg} gridColumn="span 1">
            <SensorCard
              sensorType="Temperatura"
              cultivoId={selectedCultivo}
              icon={<PiThermometerFill style={{ fontSize: '90px' }} />}
              userId={userId}
            />
          </StyledBox>

          <StyledBox bg={cardBg} gridColumn="span 1">
            <SensorCard
              sensorType="Nivel de Agua"
              cultivoId={selectedCultivo}
              icon={<RiWaterPercentFill style={{ fontSize: '90px' }} />}
              userId={userId}
            />
          </StyledBox>
        </Grid>

        {/* Información del clima */}
        <Grid
          id="clima"
          templateColumns={{ base: '1fr', md: '1fr 2fr' }}
          gap={4}
          gridColumn="1 / -1"
        >
          <StyledBox bg={cardBg}>
            <CurrentWeather />
          </StyledBox>
          <StyledBox bg={cardBg}>
            <FiveDayClimate />
          </StyledBox>
        </Grid>
      </DashboardContainer>
    </div>
  );
};