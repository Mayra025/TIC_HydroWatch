import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, DocumentData, Timestamp, doc, getDoc } from 'firebase/firestore';
import LineChart from '../LineChart/LineChart';
import BarChart from '../BarChart/BarChart';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

// Animación para el fade-down
const fadeDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Contenedor del sensor
const Container = styled.div`
  width: 100%;
  // height: s360px;   ////ojoooo
  height: auto; // Automático para adaptarse al contenido
  flex: 1; // cada card crezca proporcionalmente
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 1.5rem;
  padding: 2rem 1rem;
  position: relative;
  animation: ${fadeDown} 0.8s;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    padding: 1rem;
  }
`;

// Estilo del título del sensor
const SensorTitle = styled.span`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
`;

// Estilo de los datos del sensor
const SensorData = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0;
  text-align: center;
`;

// Estilo del ícono
const SensorIcon = styled.div`
  margin-bottom: 1rem;
  
`;

interface SensorCardProps {
  userId: string;    // ID del usuario
  cultivoId: string; // ID del cultivo
  sensorType: string;
  icon: React.ReactNode;
  color?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ userId, cultivoId, sensorType, icon, }) => {

  const [sensorData, setSensorData] = useState<{ value: string; unit: string; timestamp: number; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecent, setIsRecent] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const graficaMessages: Record<string, string> = {
    ph: `
      <strong>🧪 ¡El pH nunca duerme!</strong>
      <br />
      Las plantas consumen nutrientes y eso puede cambiar el pH rápidamente.  
      <br />
      
      <br />
      <em>📉 Tipo de gráfico:</em> Una <strong>gráfica de líneas</strong> para ver cómo cambia el pH durante las últimas diez mediciones.
      <br />
      - <strong>Eje x</strong>: Frecuencia de monitoreo cada hora.
      <br />
      - <strong>Eje y</strong>: El pH toma valores entre <strong>0 y 14</strong>, pero en hidroponía se busca mantenerlo en el rango óptimo (5.5-6.5).
    `,
    temperatura: `
      <strong>🌡️ ¡Controlando el clima bajo el agua!</strong>
      <br />
      La temperatura del agua es clave para el crecimiento de la lechuga.  
      <br />
      <br />
      <em>📊 Tipo de gráfico:</em> Una <strong>gráfica de líneas</strong> para detectar cambios en la temperatura durante las últimas diez mediciones.
      <br />
      - <strong>Eje x</strong>: Frecuencia de monitoreo cada hora.
      <br />
      - <strong>Eje y</strong>: La temperatura del agua puede tener valores entre <strong>0 y 50 °C</strong>, pero fuera del rango óptimo (18 - 24 °C) puede afectar el crecimiento.
    `,
    'nivel de agua': `
      <strong>💧 ¡Sin agua, no hay cultivos!</strong>
      <br />
      En cultivos NFT, el agua debe fluir constantemente.  
      <br />
      <br />
     
      <em>📊 Tipo de gráfico:</em> Una <strong>gráfica de barras</strong> para mostrar si el nivel bajó durante las últimas diez mediciones.  
     <br />
      - <strong>Eje x</strong>: Frecuencia de monitoreo cada hora.
      <br />
      - <strong>Eje y</strong>: Se mide la presencia de agua. <strong>1</strong> si la cantidad de agua es normal, y <strong>0</strong> ¡Alerta! Hubo reducción de agua.
    `,
  };

  const monitoreoMessages: Record<string, string> = {
    ph: `
    <strong>🧪 ¿Por qué es importante monitorear el pH del agua?</strong>
    <br />
    En cultivos hidropónicos NFT, el pH debe estar entre <strong>5.5 y 6.5</strong> para que las raíces absorban los nutrientes correctamente.  
    <br />
    <br/>
    <em>⚠️ Riesgo:</em> Si el pH está fuera de este rango, las plantas podrían crecer débiles o no aprovechar los nutrientes disponibles.  
    <br />
    <em>⏳ Frecuencia:</em> Se monitorea cada hora para evitar cambios bruscos.
  `,
    temperatura: `
     <strong>🌡️ ¿Por qué es importante monitorear la Temperatura del agua?</strong>
    <br />
    En cultivos hidropónicos NFT, la temperatura del agua debe estar entre <strong>18 y 24 °C</strong> para un crecimiento saludable.  
    <br />
    <br/>
    <em>⚠️ Riesgo:</em> Si el agua está muy caliente, las raíces pueden dañarse. Si está muy fría, el crecimiento se ralentiza.  
    <br />
    <em>⏳ Frecuencia:</em> Se mide cada hora para detectar cambios a tiempo.
  `,

    'nivel de agua': `
     <strong>💧 ¿Por qué es importante monitorear el Nivel de Agua?</strong>
    <br />
    En cultivos hidropónicos NFT, el agua debe fluir constantemente para que las raíces no se sequen.  
    <br />
    <br />
    <em>⚠️ Riesgo:</em> Un nivel de agua en "0" significa que no hay flujo, lo que puede ser fatal para las plantas.  
    <br />
    <em>⏳ Frecuencia:</em> Se monitorea cada hora para garantizar un flujo constante.
  `,
  };

  useEffect(() => {
    console.log('Props recibidas en SensorCard:', { userId, cultivoId, sensorType });

    if (!userId || !cultivoId) {
      console.error('Faltan userId o cultivoId');
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const cultivoRef = doc(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}`);
    const sensorsCollection = collection(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}/Sensores`);
    const q = query(sensorsCollection, orderBy('dateTime', 'desc'), limit(1));

    // Recuperamos los requerimientos del cultivo
    getDoc(cultivoRef).then((docSnapshot) => {
      const cultivoData = docSnapshot.data();
      const requisitos = cultivoData?.requerimientos;
      let value;
      let status = "✅";

      // Consultamos el último dato del sensor
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0].data() as DocumentData;

          // Validar que el campo dateTime exista y sea un Timestamp
          const timestamp = latestDoc.dateTime instanceof Timestamp ? latestDoc.dateTime.toMillis() : null;
          if (!timestamp) {
            console.warn('El documento no tiene un campo dateTime válido');
            setSensorData(null);
            setLoading(false);
            return;
          }

          const now = Date.now();
          const timeDifference = now - timestamp;

          switch (sensorType.toLowerCase()) {
            case 'ph':
              value = latestDoc.pH;
              if (value < requisitos?.ph.min || value > requisitos?.ph.max) {
                status = "⚠️Fuera del umbral";
              }
              break;
            case 'temperatura':
              value = latestDoc.temperature;
              if (value < requisitos?.temperatura.min || value > requisitos?.temperatura.max) {
                status = "⚠️Fuera del umbral";
              }
              break;
            case 'nivel de agua':
              value = latestDoc.waterLevel === 1.00 ? 'Normal' : latestDoc.waterLevel;
              // Asumimos que "Normal" es el valor dentro del umbral
              if (value != 1.00) {
                status = "⚠️Fuera del umbral";
              }
              break;
            default:
              value = undefined;
          }

          if (value !== undefined) {
            setSensorData({
              value: value as string,
              unit: sensorType === 'pH' ? 'pH' : sensorType === 'Temperatura' ? '°C' : '',
              timestamp,
              status,
            });

            setIsRecent(timeDifference <= 300000); // 5 minutos
          } else {
            setSensorData(null);
          }
        } else {
          console.warn('No hay datos en la colección de sensores para este cultivo.');
          setSensorData(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [userId, cultivoId, sensorType]);

  return (
    <Container>
      <Tippy
        content={
          <div style={{ textAlign: 'left', maxWidth: '400px' }}>
            <div dangerouslySetInnerHTML={{ __html: monitoreoMessages[sensorType.toLowerCase()] }} />
          </div>
        }
        allowHTML={true}
      >
        <i className="fas fa-circle-info" aria-label="Información" style={{ marginLeft: '300px', cursor: 'pointer' }} />

      </Tippy>
      <SensorTitle>{sensorType}</SensorTitle>
      <SensorIcon >{icon}</SensorIcon>

      <SensorData>
        {loading
          ? 'Cargando...'
          : sensorData
            ? isRecent
              ? `Actual: ${sensorData.value} ${sensorData.unit} - ${sensorData.status}`
              : `Última conexión: ${sensorData.value} ${sensorData.unit} - ${sensorData.status}`
            : 'No hay datos disponibles'}
      </SensorData>

      <Button
        bg="#06b863"
        color="white"
        _hover={{ bg: "#05a354" }}
        width="100%"
        onClick={onOpen}
        aria-label={`Ver más detalles del sensor ${sensorType}`}
        isDisabled={loading || !sensorData}   // ojo Deshabilitar si está cargando o no hay datos
      >
        Ver gráfico
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered >
        <ModalOverlay />

        <ModalContent
          sx={{
            fontFamily: "ABeeZee, sans-serif",
          }}
        >
          <ModalHeader>Parámetro: {sensorType}</ModalHeader>

          <Tippy
            content={
              <div style={{ textAlign: 'left', maxWidth: '400px' }}>
                <div dangerouslySetInnerHTML={{ __html: graficaMessages[sensorType.toLowerCase()] }} />
              </div>
            }
            allowHTML={true}
          >
            <i className="fas fa-question-circle" style={{ marginLeft: '500px', cursor: 'pointer' }} />
          </Tippy>
          <ModalCloseButton />
          <ModalBody>

            <div style={{ height: '400px' }}>
              {sensorType === 'Nivel de Agua' ? (
                //  para Nivel de Agua
                <BarChart sensorType={sensorType} userId={userId} cultivoId={cultivoId} />
              ) : (
                // Para pH y temperatura, mantener LineChart
                <LineChart sensorType={sensorType} userId={userId} cultivoId={cultivoId} />
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SensorCard;
