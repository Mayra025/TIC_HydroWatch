const generateMockData = () => {
  const now = new Date();

  // Obtener los componentes de la fecha y hora
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses desde 0
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Formatear dateTime
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return {
    sensorId: "sensor123",
    cultivoId: "0raF77dr97gDOEK1KSSR",
    userId: "bffCUNu77yRTufg0GCAM1XyA8nD3",
    dateTime: formattedDateTime, // dateTime como cadena en formato "YYYY-MM-DD HH:mm:ss"
    // temperature: parseFloat((Math.random() * 10 + 20).toFixed(2)), // temperatura como número 
    // waterLevel: Math.random() < 0.5 ? 0 : 1, // nivel de agua como número 
    // pH: parseFloat((Math.random() * 2 + 5).toFixed(2)), // pH como número 

    temperature: parseFloat((Math.random() * 2 + 20).toFixed(2)), // Temperatura entre 20 y 22
    waterLevel: 1, // Nivel de agua fijo en 1
    pH: parseFloat((Math.random() * 0.2 + 5.9).toFixed(2)) // pH entre 5.9 y 6.1
  };
};

export default generateMockData; // Exporta por defecto