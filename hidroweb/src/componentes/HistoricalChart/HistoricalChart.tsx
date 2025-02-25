import { useEffect, useRef, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

import 'chartjs-adapter-date-fns';
import { getFirestore, collection, doc, getDoc, query, orderBy, onSnapshot, where, } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Button, Box } from '@chakra-ui/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import styled from 'styled-components';
import 'tippy.js/dist/tippy.css';
import HistoricalChartForm from '../HistoricalChartForm/HistoricalChartForm';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);
const ChartContainer = styled(Box)`
  height: 600px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    height: 400px;
  }
  @media (max-width: 480px) {
    height: 300px;
  }
`;

type Requerimientos = {
  nivelAgua: string;
  ph: {
    max: number;
    min: number;
  };
  temperatura: {
    max: number;
    min: number;
  };
};

type CultivoData = {
  especie: string;
  fase: string;
  fechaSiembra: string;
  requerimientos: Requerimientos;
  variedad: string;
};


export default function HistoricalChart() {
  const chartRef = useRef<any>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [_loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<keyof typeof availableAnalyses>('pH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<string>('');
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cultivoData, setCultivoData] = useState<CultivoData | null>(null);
  const [processedSensorData, setProcessedSensorData] = useState<{ dateTime: Date; value: number }[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');

  //  tipos específicos para las claves
  const availableAnalyses = {
    pH: ['daily', 'multiDayComparison', 'historical'],
    temperature: ['daily', 'multiDayComparison', 'historical'],
    waterLevel: ['daily', 'multiDayComparison', 'historical'],
  };
  const calculateDataCount = () => sensorData.length;
  const ChartComponent = selectedSensor === 'waterLevel' ? Bar : Line;



  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const cultivosRef = collection(db, `Hidrocultores/${user.uid}/Cultivos`);
        const unsubscribeCultivos = onSnapshot(
          cultivosRef,
          (snapshot) => {
            const fetchedCultivos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            // console.log("Cultivosexistentes:", fetchedCultivos);

            setCultivos(fetchedCultivos);
          },
          (error) => setError(`Error fetching cultivos: ${error.message}`)
        );
        return () => unsubscribeCultivos();
      } else {
        setUserId(null);
        setCultivos([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (sensorData.length > 0 && selectedAnalysis) {
      handleAnalysisChange(selectedAnalysis);
      setDataLoaded(true);
    }
  }, [sensorData, selectedAnalysis]);

  useEffect(() => {
    if (selectedCultivo && userId) {
      const fetchCultivoData = async () => {
        const db = getFirestore();
        const cultivoDoc = doc(db, `Hidrocultores/${userId}/Cultivos/${selectedCultivo}`);
        const docSnapshot = await getDoc(cultivoDoc);

        if (docSnapshot.exists()) {
          setCultivoData(docSnapshot.data() as CultivoData);
        } else {
          setCultivoData(null);
          setError('No se encontraron datos del cultivo seleccionado.');
        }
      };

      fetchCultivoData();
    }
  }, [selectedCultivo, userId]);

  const fetchData = () => {
    if (!startDate || !endDate || !selectedCultivo || !userId) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);
    setDataLoaded(false);

    const db = getFirestore();
    const sensoresCollection = collection(db, `Hidrocultores/${userId}/Cultivos`, selectedCultivo, 'Sensores');

    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);

    startTimestamp.setHours(0, 0, 0, 0); // Hora local: 00:00:00.000
    endTimestamp.setHours(23, 59, 59, 999); // Hora local: 23:59:59.999
    startTimestamp.setDate(startTimestamp.getDate() + 1);
    endTimestamp.setDate(endTimestamp.getDate() + 1);

    const q = query(
      sensoresCollection,
      where('dateTime', '>=', startTimestamp),
      where('dateTime', '<=', endTimestamp),
      orderBy('dateTime', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            pH: parseFloat(docData.pH),
            temperature: parseFloat(docData.temperature),
            waterLevel: docData.waterLevel,
          };
        });

        setSensorData(data);
        setLoading(false);

        if (data.length === 0) {
          setError('No hay datos disponibles para las fechas seleccionadas.');
          setDataLoaded(false);
          return;
        }

        try {
          let analysisType = "daily"; // Default

          if (data.length >= 168) { // Más de 7 días de datos
            setSelectedAnalysis('historical');
            analysisType = "historical";

          } else if (data.length >= 48) { // Más de 2 días de datos
            setSelectedAnalysis('multiDayComparison');
            analysisType = "multiDayComparison";

          } else if (data.length >= 24) { // Más de 1 día de datos
            setSelectedAnalysis('daily');
            analysisType = "daily";
          } else {
            setError('Datos insuficientes para generar un análisis útil.');
            return;
          }

          handleAnalysisChange(analysisType);
          setDataLoaded(true);
        } catch (error) {
          console.error('Error en el análisis:', error);
          setError('Error al realizar el análisis.');
          setDataLoaded(false);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        setError('Error al obtener datos del servidor.');
        setLoading(false);
        setDataLoaded(false);
      }
    );

    return () => unsubscribe();
  };


  const handleAnalysisChange = (selectedAnalysis: string) => {
    let processedData: { dateTime: Date; value: number }[] = [];
    let errorMessage = '';

    switch (selectedAnalysis) {
      case 'daily':
        //si monitoreo cada hora
        if (calculateDataCount() < 24) {  //48 minimo
          errorMessage = 'Datos insuficientes para calcular una tendencia diaria. Se necesitan al menos 24 mediciones (1 día).';
        } else {
          processedData = processData(sensorData, 1); //cad hora
        }
        break;

      case 'multiDayComparison':
        if (calculateDataCount() < 48) {  //96
          errorMessage = 'Datos insuficientes para comparación multidiaria. Se necesitan al menos 48 mediciones (al menos 2 días).';
        } else {
          processedData = processData(sensorData, 2); //4
        }
        break;


      case 'historical':
        if (calculateDataCount() < 168) { // 7 días, 336 datos
          errorMessage = 'Datos insuficientes para un análisis histórico. Se necesitan al menos 168 mediciones (al menos 1 semana).';
        } else {
          processedData = processData(sensorData, 48);
        }
        break;

      default:
        errorMessage = 'Análisis seleccionado no válido.';
        break;
    }

    if (errorMessage) {
      setError(errorMessage);
      setProcessedSensorData([]);
    } else {
      setError('');
      setProcessedSensorData(processedData);
    }
  };

  const processData = (data: any[], interval: number) => {
    return data
      .filter((d) => d[selectedSensor] !== undefined && d[selectedSensor] !== null)
      .map((d) => ({
        dateTime: new Date(d.dateTime.seconds * 1000),
        value: parseFloat(d[selectedSensor]),
      }))
      .reduce((acc: any[], current, index) => {
        if (index % interval === 0) acc.push(current);
        return acc;
      }, []);
  };

  const getSensorRanges = (sensor: string, requerimientos: any) => {
    if (sensor === 'temperature') {
      return requerimientos.temperatura;
    } else if (sensor === 'pH') {
      return requerimientos.ph;
    }
    return null; // Para sensores sin rangos definidos
  };

  const exportToPDF = () => {
    if (!cultivoData || processedSensorData.length === 0) {
      setError('No hay datos suficientes para exportar el PDF.');
      return;
    }

    const doc = new jsPDF();
    let currentY = 16;
    const pageHeight = doc.internal.pageSize.height;
    const currentDateTime = new Date().toLocaleString(); // Fecha y hora actual

    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - 20) {
        doc.addPage();
        currentY = 16;
      }
    };

    // Título
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte de Monitoreo de ${selectedSensor} del Cultivo NFT`, 14, currentY);
    currentY += 10;

    // Fecha y hora de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generado el: ${currentDateTime}`, 14, currentY);
    currentY += 8;

    // Información general
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información general:', 14, currentY);
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cultivo: ${cultivoData.especie} - ${cultivoData.variedad}`, 14, currentY);
    currentY += 6;
    doc.text(`Fecha de siembra: ${cultivoData.fechaSiembra}`, 14, currentY);
    currentY += 6;
    doc.text(`Fase Actual: ${cultivoData.fase}`, 14, currentY);
    currentY += 6;

    // Requerimientos
    doc.text(`Requerimientos:`, 14, currentY);
    currentY += 6;
    doc.text(`  - Temperatura: ${cultivoData.requerimientos.temperatura.min}°C a ${cultivoData.requerimientos.temperatura.max}°C`, 14, currentY);
    currentY += 6;
    doc.text(`  - pH: ${cultivoData.requerimientos.ph.min} a ${cultivoData.requerimientos.ph.max}`, 14, currentY);
    currentY += 6;
    doc.text(`  - Nivel de Agua: ${cultivoData.requerimientos.nivelAgua}`, 14, currentY);
    currentY += 10;

    // Análisis
    const analysis = analyzeData(
      sensorData,
      // processedSensorData,
      selectedSensor,
      getSensorRanges(selectedSensor, cultivoData.requerimientos)
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Anomalías detectadas:', 14, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');

    const analysisLines = doc.splitTextToSize(analysis.summary, 180);
    addNewPageIfNeeded(analysisLines.length * 6 + 10);
    doc.text(analysisLines, 14, currentY);
    currentY += analysisLines.length * 6 + 10;

    // Tabla de datos
    addNewPageIfNeeded(30);
    autoTable(doc, {
      startY: currentY,
      head: [['Fecha', 'Sensor', 'Valor']],
      body: analysis.data.map((d) => {
        const isAlert = d.isAlert;
        const row = [
          new Date(d.dateTime.seconds * 1000).toLocaleString(),
          selectedSensor,
          d[selectedSensor],
        ];

        return row.map((cell) => ({
          content: cell,
          styles: {
            fillColor: isAlert ? [255, 204, 204] : [204, 255, 204], // Rojo claro para alertas, verde claro para normales
            textColor: [0, 0, 0],
          },
        }));
      }),
      margin: { top: 10, left: 14, right: 14 },
      theme: 'grid',
    });
    currentY = (doc as any).previousAutoTable.finalY + 10;

    // Descripción del procesamiento de datos
    doc.setFont('helvetica', 'bold');
    doc.text('Procesamiento de datos para la Gráfica:', 14, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');

    let processingInfo = '';
    if (selectedAnalysis === 'daily') {
      processingInfo = `Procesamiento Diario - Se han agrupado los datos por hora para identificar tendencias diarias. Se requiere al menos 24 mediciones para calcular la tendencia de un día completo.`;
    } else if (selectedAnalysis === 'multiDayComparison') {
      processingInfo = `Procesamiento Multidía - Se han agrupado los datos en intervalos diarios para comparar variaciones entre diferentes días. Se requieren al menos 48 mediciones (2 días) para una comparación efectiva.`;
    } else if (selectedAnalysis === 'historical') {
      processingInfo = `Procesamiento Histórico - Se ha realizado un análisis histórico con intervalos de 48 horas para evaluar tendencias a largo plazo. Se necesitan al menos 168 mediciones (más de 7 días) para generar un reporte general.`;
    }

    const processingLines = doc.splitTextToSize(processingInfo, 180);
    addNewPageIfNeeded(processingLines.length * 6 + 10);
    doc.text(processingLines, 14, currentY);
    currentY += processingLines.length * 6 + 10;

    // Gráfico (si existe)
    const chartCanvas = chartRef.current?.canvas;
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL('image/png', 1.0);
      const canvasWidth = chartCanvas.width;
      const canvasHeight = chartCanvas.height;

      const maxWidth = 180;
      const maxHeight = 90;
      const aspectRatio = canvasWidth / canvasHeight;
      let imageWidth = maxWidth;
      let imageHeight = maxWidth / aspectRatio;

      if (imageHeight > maxHeight) {
        imageHeight = maxHeight;
        imageWidth = maxHeight * aspectRatio;
      }

      addNewPageIfNeeded(imageHeight + 10);
      doc.addImage(chartImage, 'PNG', 15, currentY, imageWidth, imageHeight);
      currentY += imageHeight + 10;
    }

    doc.save(`Reporte_Cultivo_${cultivoData.especie}_${cultivoData.variedad}_${selectedSensor}.pdf`);
  };


  const analyzeData = (
    data: any[],
    sensor: keyof typeof availableAnalyses,
    ranges: { min?: number; max?: number } | null
  ) => {
    const analyzedData = data.map((d) => ({
      ...d,
      isAlert: false, // Inicialmente, todos los registros no son alertas
    }));

    if (sensor === 'waterLevel') {
      analyzedData.forEach((d) => {
        if (d[sensor] === 0) {
          d.isAlert = true; // Marcar como alerta si el nivel de agua es 0
        }
      });

      const noWater = analyzedData.filter((d) => d.isAlert);
      const percentageNoWater = (noWater.length / analyzedData.length) * 100;

      return {
        summary: `El ${percentageNoWater.toFixed(2)}% de las lecturas indican falta de agua.`,
        data: analyzedData,
      };
    }

    if (!ranges || ranges.min === undefined || ranges.max === undefined) {
      return {
        summary: `El sensor ${sensor} no tiene rangos definidos para análisis.`,
        data: analyzedData,
      };
    }

    const { min, max } = ranges;
    analyzedData.forEach((d) => {
      if (d[sensor] < min || d[sensor] > max) {
        d.isAlert = true; // Marcar como alerta si está fuera de rango
      }
    });

    const outsideRange = analyzedData.filter((d) => d.isAlert);
    const percentageOutside = (outsideRange.length / analyzedData.length) * 100;

    return {
      summary: `El ${percentageOutside.toFixed(2)}% de los datos de ${sensor} estuvieron fuera del rango permitido.`,
      data: analyzedData,
    };
  };


  const resetFields = () => {

    setLoading(false);
    setError(null);
    setCultivoData(null);
    setProcessedSensorData([]);
    setSelectedSensor('pH');
    setStartDate('');
    setEndDate('');
    setSensorData([]);
    setDataLoaded(false);
    setError(null);
    setSelectedCultivo('');
    setSelectedAnalysis('');
  };

  return (
    <Box p={4}>
      <HistoricalChartForm
        cultivos={cultivos}
        selectedCultivo={selectedCultivo}
        setSelectedCultivo={setSelectedCultivo}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}

        availableAnalyses={availableAnalyses}
        selectedSensor={selectedSensor}
        setSelectedSensor={(value: string) => setSelectedSensor(value as 'pH' | 'temperature' | 'waterLevel')}
        setError={setError}
        fetchData={fetchData}
        resetFields={resetFields}
      />

      <Button
        isDisabled={!dataLoaded || !!error}
        colorScheme="teal" onClick={exportToPDF}>
        Exportar PDF
      </Button>

      <ChartContainer>

        {error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
        ) : dataLoaded && processedSensorData.length > 0 ? (

          <ChartComponent
            ref={chartRef}
            data={{
              labels: processedSensorData.map((d) => d.dateTime.toLocaleString()),
              datasets: [
                {
                  label: `Sensor: ${selectedSensor}`,
                  data: selectedAnalysis === 'anomalies'
                    ? processedSensorData.map((d) => ({ x: d.dateTime.getTime(), y: d.value })) // Para scatter
                    : selectedSensor === 'waterLevel'
                      ? processedSensorData.map((d) => ({ x: d.dateTime.getTime(), y: d.value })) // Para bar
                      : processedSensorData.map((d) => ({ x: d.dateTime.getTime(), y: d.value })), // Para line


                  borderColor:
                    selectedSensor === 'waterLevel'
                      ? 'rgba(54, 162, 235, 1)' // Azul para nivel de agua
                      : 'rgba(75, 192, 192, 1)', // General
                  backgroundColor:
                    selectedSensor === 'waterLevel'
                      ? 'rgba(54, 162, 235, 0.2)'
                      : 'rgba(75, 192, 192, 0.2)',
                  showLine: selectedAnalysis !== 'anomalies' && selectedSensor !== 'waterLevel', // Mostrar línea para otros casos
                  barThickness: selectedSensor === 'waterLevel' ? 10 : undefined, // Definir grosor de las barras si es 'waterLevel'
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: `Análisis: ${selectedAnalysis}` },
              },
              scales: {
                x: selectedAnalysis === 'anomalies' ? {
                  type: 'linear', // Usar 'linear' para anomalies y 'time' para los demás
                  title: { display: true, text: 'Fecha y Hora' },
                  ticks: {
                    callback: (value) => new Date(value).toLocaleString(), // Solo aplicar para anomalies
                  },
                } : {},
                y: {
                  title: { display: true, text: 'Valor' },
                },
              },
              elements: {
                bar: {
                  borderWidth: 2,
                },
              },
            }}
          />

        ) : (

          <p>Loading ...
          </p>
        )}
      </ChartContainer>

    </Box>
  );
}