import { Box, Select, Input, FormLabel, Button, Grid, GridItem } from '@chakra-ui/react';
import Tippy from '@tippyjs/react';
import React from 'react';

interface FormProps {
  cultivos: any[];
  selectedCultivo: string;
  setSelectedCultivo: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  availableAnalyses: Record<string, string[]>;
  selectedSensor: string;
  setSelectedSensor: (value: string) => void;
  fetchData: () => void;
  resetFields: () => void;
  setError: (value: string | null) => void;

}

const HistoricalChartForm: React.FC<FormProps> = ({
  cultivos,
  selectedCultivo,
  setSelectedCultivo,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  availableAnalyses,
  selectedSensor,
  setSelectedSensor,
  fetchData,
  resetFields,
  setError
}) => {


  return (
    <Box as="form" mb={4}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <FormLabel htmlFor="cultivo">Cultivo:</FormLabel>
          <Select
            id="cultivo"
            value={selectedCultivo}
            onChange={(e) => setSelectedCultivo(e.target.value)}
            placeholder="Selecciona un cultivo"
          >
            {cultivos.map((cultivo) => (
              <option key={cultivo.id} value={cultivo.id}>
                {cultivo.especie} - {cultivo.variedad}
              </option>
            ))}
          </Select>
        </GridItem>

        <GridItem colSpan={1}>
          <FormLabel htmlFor="sensor">Sensor:          </FormLabel>
          <Select
            id="sensor"
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
          >
            {Object.keys(availableAnalyses).map((sensor) => (
              <option key={sensor} value={sensor}>
                {sensor}
              </option>
            ))}
          </Select>
        </GridItem>

        <GridItem colSpan={1}>
          <FormLabel htmlFor="startDate">Fecha de inicio:
            <Tippy
              content={
                <div style={{ textAlign: 'left', maxWidth: '400px' }}>
                  <strong> 📅 ¿Qué período de tiempo elegir para ver las tendencias?</strong>
                  <br />
                  <ul>
                    <li><em> - pH:</em> Es sensible a cambios rápidos. Para corregir variaciones antes de que afecten
                      tu cultivo, ¡analízalo entre 1 y 3 días!</li>
                    <br />
                    <li><em> - Temperatura:</em> Cambia más lentamente. Si lo revisas semanalmente, podrás detectar
                      tendencias o picos anómalos antes de que se conviertan en problemas.</li>
                    <br />
                    <li><em> - Nivel de Agua:</em> Un análisis cada 1 a 3 días asegura que el agua esté siempre al
                      nivel correcto y te avisa si hay problemas, como niveles bajos.</li>
                  </ul>

                </div>
              }
              allowHTML={true}
              placement="right"
            >
              <i className="fas fa-question-circle" style={{ marginLeft: '20px', cursor: 'pointer' }} />
            </Tippy>
          </FormLabel>

          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              const date = e.target.value;
              setStartDate(date);
              if (endDate && new Date(date) > new Date(endDate)) {
                setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
                setStartDate('');
              } else {
                setError(null);
              }
            }}
          />
        </GridItem>

        <GridItem colSpan={1}>
          <FormLabel htmlFor="endDate">Fecha de fin:       </FormLabel>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => {
              const date = e.target.value;
              setEndDate(date);
              if (startDate && new Date(date) < new Date(startDate)) {
                setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
                setEndDate('');
              } else {
                setError(null);
              }
            }}
          />
        </GridItem>
      </Grid>
      <Button mt={4} colorScheme="blue" onClick={fetchData}>
        Generar
      </Button>
      <Tippy
        content={
          <div style={{ textAlign: 'left', maxWidth: '400px' }}>
            <strong>🔍 ¡La gráfica muestra datos que se procesan según el período que eliges!</strong>
            <br />
            <ul>
              <li>- <em>Si eliges un día:</em> Los datos se procesan por hora. Necesitamos al menos 24 mediciones
                (un día completo) para ver una tendencia.</li>
              <br />
              <li>- <em>De 2 a 7 días:</em> El procesamiento será por intervalos de varios días. Esto te ayudará a
                comparar varios días entre sí y encontrar patrones.</li>
              <br />
              <li>- <em>Más de 7 días:</em> Se hará un procesamiento histórico, ideal para ver las tendencias a largo
                plazo. Con 168 mediciones (al menos una semana), podremos darte un panorama completo.</li>
            </ul>
          </div>
        }
        allowHTML={true}
        placement="right"
      >
        <i className="fas fa-circle-info" aria-label="Información" style={{ marginLeft: '10px', cursor: 'pointer' }} />
      </Tippy>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Button mt={4} ml={2} colorScheme="gray" onClick={resetFields}>
        Limpiar
      </Button>
    </Box>
  );
};

export default HistoricalChartForm;
