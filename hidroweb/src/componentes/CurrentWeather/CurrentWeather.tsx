import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const WeatherContainer = styled.div`
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0; //  márgenes no deseados
    padding: 0; 
`;

const WeatherIcon = styled.img`
    margin-bottom: 10px;
`;

interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
}

const CurrentWeather = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat: number = position.coords.latitude;
                const lon: number = position.coords.longitude;
                fetchWeather(lat, lon);
            },
            () => {
                setError('No se pudo obtener la ubicación.');
                setLoading(false);
            }
        );
    }, []);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/weathers/weather?lat=${lat}&lon=${lon}`
            );
            if (!response.ok) {
                throw new Error('Error al obtener los datos del clima');
            }
            const data: WeatherData = await response.json();
            setWeatherData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching the weather data', error);
            setError('Error al obtener los datos del clima');
            setLoading(false);
        }
    };


    if (loading) {
        return <p>Cargando datos del clima...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!weatherData || !weatherData.main || !weatherData.weather) {
        return <p>No se pudieron cargar los datos del clima.</p>;
    }

    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

    return (
        <WeatherContainer>

            <Tippy
                content={
                    <div style={{ textAlign: 'left', maxWidth: '400px' }}>
                        <strong> 🌦️ ¿Por qué es importante conocer el clima actual y la predicción a 5 días?</strong>
                        <br />
                        Para evitar sorpresas que afecten a la cosecha. Conocer el clima ayuda a mantener condiciones óptimas del cultivo.
                    </div>
                }
                allowHTML={true}
            >
                <i className="fas fa-circle-info" style={{ marginLeft: '300px', cursor: 'pointer' }} />
            </Tippy>
            <h2>Clima Actual en tu zona: {weatherData.name}</h2>
            <WeatherIcon
                src={iconUrl}
                alt={weatherData.weather[0].description}
            />
            <p>🌡️ Temperatura: {weatherData.main.temp} °C</p>
            <p>💧 Humedad: {weatherData.main.humidity}%</p>
            <p>☁️ Condición: {weatherData.weather[0].description}</p>
        </WeatherContainer>
    );
};

export default CurrentWeather;

