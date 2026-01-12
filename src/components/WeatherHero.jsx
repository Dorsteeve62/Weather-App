import React from 'react';
import { motion } from 'framer-motion';

export default function WeatherHero({ weather }) {
    if (!weather) return null;

    return (
        <div className="flex flex-col items-center justify-center py-8 text-center text-white">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">{weather.name}</h1>
                <div className="flex items-center justify-center space-x-4">
                    {weather.weather && weather.weather[0] && (
                        <img
                            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                            alt={weather.weather[0].description}
                            className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
                        />
                    )}
                    <span className="text-6xl md:text-8xl font-thin tracking-tighter">
                        {Math.round(weather.main?.temp)}°
                    </span>
                </div>
                <p className="text-xl md:text-2xl capitalize font-light opacity-90">
                    {weather.weather?.[0]?.description}
                </p>
            </motion.div>
        </div>
    );
}
