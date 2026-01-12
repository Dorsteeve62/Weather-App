import React from 'react';
import { Droplets, Wind, Thermometer, Eye } from 'lucide-react';

const BentoCard = ({ icon: Icon, label, value, unit }) => (
    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center aspect-square md:aspect-auto hover:bg-white/20 transition-all duration-300">
        <div className="bg-white/20 p-3 rounded-full mb-3">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium opacity-70 mb-1">{label}</span>
        <span className="text-2xl font-bold tracking-wide">
            {value} <span className="text-sm font-normal opacity-70">{unit}</span>
        </span>
    </div>
);

export default function BentoGrid({ weather }) {
    if (!weather) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-8 px-4">
            <BentoCard
                icon={Droplets}
                label="Humidity"
                value={weather.main?.humidity}
                unit="%"
            />
            <BentoCard
                icon={Wind}
                label="Wind Speed"
                value={Math.round(weather.wind?.speed)}
                unit="mph"
            />
            <BentoCard
                icon={Thermometer}
                label="Feels Like"
                value={Math.round(weather.main?.feels_like)}
                unit="°"
            />
            <BentoCard
                icon={Eye}
                label="Visibility"
                value={(weather.visibility / 1000).toFixed(1)}
                unit="km"
            />
        </div>
    );
}
