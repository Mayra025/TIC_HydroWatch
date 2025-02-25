import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';

interface WeatherIcon {
    icon: string;
    description: string;
}

interface ForecastData {
    list: Array<{
        dt_txt: string;
        main: {
            temp: number;
            humidity: number;
        };
        weather: WeatherIcon[];
    }>;
}

const FiveDayClimate = () => {
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchForecast(lat, lon);
            },
            () => {
                setError('No se pudo obtener la ubicación.');
                setLoading(false);
            }
        );
    }, []);

    const fetchForecast = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/weathers/forecast?lat=${lat}&lon=${lon}`
            );
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            // setForecastData(data);
            // setLoading(false);
            // Verifica que la respuesta tenga datos válidos
            if (!data.list || data.list.length === 0) {
                throw new Error('Respuesta vacía de la API');
            }

            setForecastData(data);
            setLoading(false);
        } catch (error: any) {
            // console.error('Error fetching the forecast data', error);
            setError('Error al obtener los datos del pronóstico');
            setLoading(false);
        }
    };


    if (loading) {
        return <p>Cargando pronóstico...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    // if (!forecastData) {
    //     return <p>No se pudieron cargar los datos del pronóstico.</p>;
    // }

    // const dailyForecasts = forecastData.list.filter((reading) =>
    //     reading.dt_txt.includes('12:00:00')
    // ).slice(0, 5); // Solo mostrar los próximos 5 días


    // Filtrar para mostrar los 5 días siguientes a partir de mañana
    const dailyForecasts = forecastData?.list.filter((reading) =>
        reading.dt_txt.includes('12:00:00')
    ).slice(0, 5) || []; // Solo mostrar los próximos 5 días

    const settings = {
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <SampleNextArrow />, // Flecha de navegación
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <Container>
            <SliderWrapper>
                <Slider {...settings}>
                    {dailyForecasts.map((forecast, index) => (
                        <Item key={index}>
                            <h3>
                                {new Date(forecast.dt_txt).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                })}
                            </h3>
                            <WeatherIconImage
                                src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                                alt={forecast.weather[0].description}
                            />
                            <p data-testid="weather-description">{forecast.weather[0].description}</p>

                            <p>🌡️: {forecast.main.temp} °C</p>
                            <p>💧: {forecast.main.humidity}%</p>
                        </Item>
                    ))}
                </Slider>
            </SliderWrapper>
        </Container>
    );
};

// Flecha de navegación personalizada (Siguiente)
const SampleNextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <Arrow className={className} style={{ ...style }} onClick={onClick}>
            ➡️
        </Arrow>
    );
};

// Styled-components para los estilos
const Container = styled.div`
    color: black;
    padding: 20px;
    position: relative;
    overflow: hidden;
    width: 100%;
`;

const SliderWrapper = styled.div`
    width: 100%;
    overflow: hidden;
`;

const Item = styled.div`
    border-radius: 8px;
    text-align: center;
    min-width: 150px;
    width: 100%;
    margin: 0 15px;
    font-size: 12px;
    flex-shrink: 0;
`;

const WeatherIconImage = styled.img`
    display: block;
    margin: 0 auto 10px;
`;

const Arrow = styled.div`
    display: block;
    padding: 20px;
    cursor: pointer;
    margin: 30px;
`;

export default FiveDayClimate;
