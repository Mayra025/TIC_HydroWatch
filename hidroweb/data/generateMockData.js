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
    cultivoId: "C0shMFvYlmB5hJ5GE47l",
    userId: "TOe84ZegpXZhj2sV4GnqXWqSKEs1",
    dateTime: formattedDateTime, // dateTime como cadena en formato "YYYY-MM-DD HH:mm:ss"
    temperature: parseFloat((Math.random() * 10 + 20).toFixed(2)), // temperatura como número
    // waterLevel: parseFloat((Math.random() * 20 + 30).toFixed(2)), // nivel de agua como número
    waterLevel: Math.random() < 0.5 ? 0 : 1, // nivel de agua como número

    pH: parseFloat((Math.random() * 2 + 5).toFixed(2)), // pH como número
  };
};

export default generateMockData; // Exporta por defecto