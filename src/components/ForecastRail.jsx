import React from 'react';
import { motion } from 'framer-motion';

export default function ForecastRail({ forecast }) {
    if (!forecast || forecast.length === 0) return null;

    // Filter for one forecast per day (around noon)
    const dailyForecast = forecast.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

    return (
        <div className="w-full mt-8 overflow-x-auto pb-6 px-4 no-scrollbar">
            <div className="flex space-x-4 min-w-max mx-auto justify-center">
                {dailyForecast.map((day, index) => {
                    const date = new Date(day.dt * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                        <motion.div
                            key={day.dt}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-4 rounded-2xl flex flex-col items-center min-w-[100px] hover:scale-105 transition-transform"
                        >
                            <span className="font-semibold mb-2">{dayName}</span>
                            <img
                                src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                alt={day.weather[0].description}
                                className="w-10 h-10 mb-2"
                            />
                            <span className="text-xl font-bold">{Math.round(day.main.temp)}°</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
