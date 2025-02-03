// import React, { useEffect, useRef, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   // CategoryScale,
//   // LinearScale,
//   // PointElement,
//   // LineElement,
//   // Title,
//   // Tooltip,
//   // Legend,
//   // TimeScale,
// } from 'chart.js';

// // Registrar los componentes de chart.js
// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   LineElement,
// //   PointElement,
// //   Title,
// //   Tooltip,
// //   Legend
// // );
// import 'chartjs-adapter-date-fns';
// import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// //   TimeScale
// // );

// interface LineChartProps {
//   sensorType: string;
//   userId: string;
//   cultivoId: string;
// }

// const LineChart: React.FC<LineChartProps> = ({ sensorType, userId, cultivoId }) => {
//   const chartRef = useRef<ChartJS<'line'> | null>(null);
//   const [sensorData, setSensorData] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   // useEffect(() => {
//   //   if (!userId || !cultivoId) {
//   //     console.error("userId o cultivoId están vacíos");
//   //     return;
//   //   }

//   //   const db = getFirestore();
//   //   const sensoresCollection = collection(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}/Sensores`);
//   //   const q = query(sensoresCollection, orderBy('dateTime', 'desc'), limit(10));
//   //   setLoading(true);

//   //   const unsubscribe = onSnapshot(q, (querySnapshot) => {

//   //     const data = querySnapshot.docs.map((doc) => doc.data());
//   //     console.log(loading);  

//   //     //  orden de los datos para que se muestren de la más antigua a la más reciente
//   //     setSensorData(data.reverse());
//   //     setLoading(false);
//   //   },
//   //     (error) => {
//   //       console.error('Error fetching data:', error);
//   //       setError('Error fetching data');
//   //       setLoading(false);
//   //     }
//   //   );

//   //   return () => unsubscribe();
//   // }, [userId, cultivoId]);


//   useEffect(() => {
//     if (!userId || !cultivoId) {
//       console.error("userId o cultivoId están vacíos");
//       return;
//     }
  
//     const db = getFirestore();
//     const sensoresCollection = collection(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}/Sensores`);
//     const q = query(sensoresCollection, orderBy('dateTime', 'desc'), limit(10));
//     setLoading(true);
  
//     const unsubscribe = onSnapshot(
//       q,
//       (querySnapshot) => {
//         const data = querySnapshot.docs.map((doc) => doc.data());
//         setSensorData(data.reverse());
//         setError(null); // Asegura que se limpie cualquier error previo
//         setLoading(false);
//       },
//       (error) => {
//         console.error('Error fetching data:', error);
//         setError('Error fetching data');
//         setLoading(false);
//       }
//     );
  
//     return () => unsubscribe();
//   }, [userId, cultivoId]);
  
//   useEffect(() => {
//     return () => {
//       if (chartRef.current) {
//         chartRef.current.destroy();
//         chartRef.current = null;
//       }
//     };
//   }, []);

//   if (loading) return <p role="status">loading</p>;

//   if (error) return <p>{error}</p>;

//   // fechas mínima y máxima de los datos
//   const minDate = sensorData.length > 0
//     ? new Date(sensorData[0].dateTime.seconds * 1000)
//     : null;

//   const maxDate = sensorData.length > 0
//     ? new Date(sensorData[sensorData.length - 1].dateTime.seconds * 1000)
//     : null;

//   const formattedMinDate = minDate?.toLocaleDateString('es-ES');
//   const formattedMaxDate = maxDate?.toLocaleDateString('es-ES');

//   const title = minDate && maxDate && formattedMinDate === formattedMaxDate
//     ? `Mediciones del ${formattedMinDate}`
//     : `Mediciones del ${formattedMinDate} al ${formattedMaxDate}`;

//   // Títulos dinámicos de los ejes
//   const yAxisTitle = (() => {
//     switch (sensorType.toLowerCase()) {
//       case 'ph':
//         return 'pH (Unidades)';
//       case 'temperatura':
//         return 'Temperatura (°C)';
//       case 'nivel de agua':
//         return 'Nivel de agua (cm)';
//       default:
//         return 'Unidades';
//     }
//   })();

//   const xAxisTitle = 'Hora';

//   const midata = {
//     labels: sensorData.map((data) => {
//       if (data.dateTime && data.dateTime.seconds) {
//         return new Date(data.dateTime.seconds * 1000).toLocaleTimeString('es-ES', {
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit',
//         });
//       } else {
//         return 'No Timestamp';
//       }
//     }),
//     datasets: [
//       {
//         label: '',
//         data: sensorData.map((data) => {
//           switch (sensorType.toLowerCase()) {
//             case 'waterlevel':
//               return parseFloat(data.waterLevel || '0');
//             case 'ph':
//               return parseFloat(data.pH || '0');
//             case 'temperatura':
//               return parseFloat(data.temperature || '0');
//             default:
//               return 0;
//           }
//         }),
//         // borderColor: sensorType === 'ph' ? 'rgba(255, 206, 86, 1)' :
//         //               sensorType === 'temperature' ? 'rgba(255, 99, 132, 1)' :
//         //               'rgba(54, 162, 235, 1)',
//         // backgroundColor: sensorType === 'ph' ? 'rgba(255, 206, 86, 0.2)' :
//         //               sensorType === 'temperature' ? 'rgba(255, 99, 132, 0.2)' :
//         //               'rgba(54, 162, 235, 0.2)',
//         // fill: false,
//         // tension: 0.1,

//         borderColor: 'rgba(75, 192, 75, 1)',
//         backgroundColor: 'rgba(75, 192, 75, 0.2)',
//         fill: false,
//         tension: 0.1,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: xAxisTitle,
//         },

//       },
//       y: {
//         title: {
//           display: true,
//           text: yAxisTitle,

//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },
//       title: {
//         display: true,
//         text: title,
//       },
//     },
//   };

//   return <Line ref={chartRef} data={midata} options={options} >

//   </Line>;
// };

// export default LineChart;

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  sensorType: string;
  userId: string;
  cultivoId: string;
}

const LineChart: React.FC<LineChartProps> = ({ sensorType, userId, cultivoId }) => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !cultivoId) {
      console.error('userId o cultivoId están vacíos');
      return;
    }

    const db = getFirestore();
    const sensoresCollection = collection(db, `Hidrocultores/${userId}/Cultivos/${cultivoId}/Sensores`);
    const q = query(sensoresCollection, orderBy('dateTime', 'desc'), limit(10));
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.data());
        setSensorData(data.reverse());
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, cultivoId]);

  if (loading) return <p role="status">loading</p>;
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
      }
      return 'No Timestamp';
    }),
    datasets: [
      {
        label: '',
        data: sensorData.map((data) => {
          switch (sensorType.toLowerCase()) {
            case 'waterlevel':
              return parseFloat(data.waterLevel || '0');
            case 'ph':
              return parseFloat(data.pH || '0');
            case 'temperatura':
              return parseFloat(data.temperature || '0');
            default:
              return 0;
          }
        }),
        borderColor: 'rgba(75, 192, 75, 1)',
        backgroundColor: 'rgba(75, 192, 75, 0.2)',
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
          text: yAxisTitle,
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

  return <Line data={midata} options={options} />;
};

export default LineChart;
