import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface BarChartProps {
  sensorType: string;
  userId: string;
  cultivoId: string;
}

const BarChart: React.FC<BarChartProps> = ({ sensorType, userId, cultivoId }) => {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !cultivoId) {
      console.error("userId o cultivoId están vacíos");
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      const db = getFirestore();
      const sensoresCollection = collection(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}/Sensores`);
      const q = query(sensoresCollection, orderBy('dateTime', 'desc'), limit(10));

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const data = querySnapshot.docs.map((doc) => doc.data());
          setSensorData(data.reverse());
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching data:', error);
          setError('Error fetching data');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up Firebase subscription:", err);
      setError('Error setting up subscription');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, cultivoId]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  if (loading) return <p role="status">Loading...</p>;

  if (error) return <p>{error}</p>;

  const minDate = sensorData.length > 0
    ? new Date(sensorData[0].dateTime.seconds * 1000)
    : null;

  const maxDate = sensorData.length > 0
    ? new Date(sensorData[sensorData.length - 1].dateTime.seconds * 1000)
    : null;

  const formattedMinDate = minDate?.toLocaleDateString('es-ES');
  const formattedMaxDate = maxDate?.toLocaleDateString('es-ES');

  const title = minDate && maxDate && formattedMinDate === formattedMaxDate
    ? `Mediciones del ${formattedMinDate}`
    : `Mediciones del ${formattedMinDate} al ${formattedMaxDate}`;

  const yAxisTitle = (() => {
    switch (sensorType.toLowerCase()) {
      case 'ph':
        return 'pH (Unidades)';
      case 'temperatura':
        return 'Temperatura (°C)';
      case 'nivel de agua':
        return 'Nivel de agua (cm)';
      default:
        return 'Unidades';
    }
  })();

  const xAxisTitle = 'Hora';

  const midata = {
    labels: sensorData.map((data) => {
      if (data.dateTime && data.dateTime.seconds) {
        return new Date(data.dateTime.seconds * 1000).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      } else {
        return 'No Timestamp';
      }
    }),
    datasets: [
      {
        label: '',
        data: sensorData.map((data) => {
          switch (sensorType.toLowerCase()) {
            case 'nivel de agua':
              return parseFloat(data.waterLevel || '0');
            case 'ph':
              return parseFloat(data.pH || '0');
            case 'temperature':
              return parseFloat(data.temperature || '0');
            default:
              return 0;
          }
        }),
        borderColor: 'rgba(75, 192, 75, 1)', // Verde
        backgroundColor: 'rgba(75, 192, 75, 0.2)', // Verde translúcido
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisTitle,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle, // Título dinámico para el eje Y
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar ref={chartRef} data={midata} options={options} />;
};

export default BarChart;
