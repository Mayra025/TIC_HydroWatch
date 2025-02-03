import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extensiones para dayjs
dayjs.extend(utc);
dayjs.extend(customParseFormat);

interface AlertContextData {
  activeAlerts: any[];
}

const AlertContext = createContext<AlertContextData | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [alertSent, setAlertSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const firestore = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const unsubscribeSensoresArray: (() => void)[] = [];
      const unsubscribeCultivos = onSnapshot(
        collection(firestore, `Hidrocultores/${user.uid}/Cultivos`),
        (snapshot) => {
          const cultivosData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              cultivoId: doc.id,
              especie: data.especie || "Especie desconocida",
              variedad: data.variedad || "Variedad no especificada",
              requerimientos: data.requerimientos || {},
              fase: data.fase || "Fase no especificada",
              fechaSiembra: data.fechaSiembra || "Fecha no especificada",
            };
          });
          console.log("Cultivos obtenidos:", cultivosData); // Debug

          setActiveAlerts(
            cultivosData.map((cultivo) => ({
              cultivoId: cultivo.cultivoId,
              especie: cultivo.especie,
              variedad: cultivo.variedad,
              fase: cultivo.fase,
              requerimientos: {
                ph: {
                  min: cultivo.requerimientos?.ph?.min ?? null,
                  max: cultivo.requerimientos?.ph?.max ?? null,
                },
                temperatura: {
                  min: cultivo.requerimientos?.temperatura?.min ?? null,
                  max: cultivo.requerimientos?.temperatura?.max ?? null,
                },
                nivelAgua: cultivo.requerimientos?.nivelAgua ?? "Desconocido",
              },
              color: "gray.500",
              currentTemp: null,
              currentPh: null,
              currentWaterLevel: null,
              error: false,
            }))
          );
          console.log("activeAlerts actualizado:", activeAlerts); // Debug

          cultivosData.forEach((cultivo) => {
            const q = query(
              collection(firestore, `Hidrocultores/${user.uid}/Cultivos/${cultivo.cultivoId}/Sensores`),
              orderBy("dateTime", "desc"),
              limit(1)
            );

            const unsubscribeSensores = onSnapshot(q, (sensorSnapshot) => {
              const sensorData = sensorSnapshot.docs.map((doc) => ({
                ...doc.data(),
                dateTime: dayjs(doc.data().dateTime.toDate()).format(),
              }));

              verificarAlertas(user.uid, sensorData, cultivo);
            });

            unsubscribeSensoresArray.push(unsubscribeSensores);
          });
        }
      );

      return () => {
        unsubscribeCultivos();
        unsubscribeSensoresArray.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, []);

  const verificarAlertas = async (uid: string, sensorData: any[], cultivo: any) => {
    const currentTime = dayjs();
    const timeLimit = currentTime.subtract(5, "minutes");

    sensorData.forEach(async (sensor) => {
      const sensorTime = dayjs(sensor.dateTime);
      const isRecent = sensorTime.isAfter(timeLimit);

      if (isRecent) {
        const tempAlert =
          sensor.temperature > cultivo.requerimientos.temperatura.max ||
          sensor.temperature < cultivo.requerimientos.temperatura.min;

        const phAlert =
          sensor.pH > cultivo.requerimientos.ph.max ||
          sensor.pH < cultivo.requerimientos.ph.min;

        const waterLevelAlert = sensor.waterLevel === 0;

        if (tempAlert || phAlert || waterLevelAlert) {
          if (!alertSent[cultivo.cultivoId]) {
            const detalles: string[] = [];

            if (tempAlert) {
              detalles.push(
                `Temperatura fuera de rango: esperado (${cultivo.requerimientos.temperatura.min}°C - ${cultivo.requerimientos.temperatura.max}°C), actual ${sensor.temperature}°C.`
              );
            }

            if (phAlert) {
              detalles.push(
                `pH fuera de rango: esperado (${cultivo.requerimientos.ph.min} - ${cultivo.requerimientos.ph.max}), actual ${sensor.pH}.`
              );
            }

            if (waterLevelAlert) {
              detalles.push(`Nivel de agua crítico: no se detecta agua.`);
            }

            const mensaje = `Alerta en el cultivo "${cultivo.especie} ${cultivo.variedad}":<br>` +
              `- Fase actual: ${cultivo.fase}<br>` +
              `- Fecha de siembra: ${cultivo.fechaSiembra}<br><br>` +
              detalles.join("<br>");

            toast.error(<div dangerouslySetInnerHTML={{ __html: mensaje }} />);


            // Enviar alerta a Telegram
            await enviarNotificacionTelegram({
              uid,
              cultivoId: cultivo.cultivoId,
              especie: cultivo.especie,
              variedad: cultivo.variedad,
              fase: cultivo.fase,
              fechaSiembra: cultivo.fechaSiembra,
              tempAlert,
              phAlert,
              waterLevelAlert,
              actualTemp: sensor.temperature,
              actualPh: sensor.pH,
              actualWaterLevel: sensor.waterLevel,
            });

            setAlertSent((prev) => ({ ...prev, [cultivo.cultivoId]: true }));
          }
        } else if (alertSent[cultivo.cultivoId]) {
          toast.info(`✅ Alerta resuelta para el cultivo "${cultivo.especie}".`);
          setAlertSent((prev) => ({ ...prev, [cultivo.cultivoId]: false }));
        }

        setActiveAlerts((prev) =>
          prev.map((alert) =>
            alert.cultivoId === cultivo.cultivoId
              ? {
                ...alert,
                currentTemp: sensor.temperature,
                currentPh: sensor.pH,
                currentWaterLevel: sensor.waterLevel,
                color: obtenerColor(tempAlert, phAlert, waterLevelAlert),
                error: false,
              }
              : alert
          )
        );
      } else {
        setActiveAlerts((prev) =>
          prev.map((alert) =>
            alert.cultivoId === cultivo.cultivoId
              ? { ...alert, error: true }
              : alert
          )
        );
      }
    });
  };

  const obtenerColor = (tempAlert: boolean, phAlert: boolean, waterLevelAlert: boolean) => {
    if (tempAlert || phAlert || waterLevelAlert) return "red.500";
    return "green.500";
  };


  const enviarNotificacionTelegram = async (alerta: {
    uid: string;
    cultivoId: string;
    especie: string;
    variedad: string,
    fase: string;
    fechaSiembra: string;
    tempAlert: boolean;
    phAlert: boolean;
    waterLevelAlert: boolean;
    actualTemp: number | null;
    actualPh: number | null;
    actualWaterLevel: number | null;
  }) => {
    try {
      const response = await fetch("http://localhost:5000/api/telegram/send-telegram-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alerta),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al enviar la alerta a Telegram:", errorText);
      } else {
        console.log("Alerta enviada exitosamente a Telegram");
      }
    } catch (error) {
      console.error("Error en el fetch para enviar alerta:", error);
    }
  };

  return (
    <AlertContext.Provider value={{ activeAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};