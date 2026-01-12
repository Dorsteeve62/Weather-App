import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import WeatherHero from '../components/WeatherHero';
import BentoGrid from '../components/BentoGrid';
import ForecastRail from '../components/ForecastRail';
import SearchBar from '../components/SearchBar';
import UserProfileModal from '../components/UserProfileModal';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [bgClass, setBgClass] = useState('from-blue-500 to-cyan-400'); // Default Clear/Blue
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load persisted city on mount
    useEffect(() => {
        const loadUserCity = async () => {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().lastCity) {
                        fetchWeather(docSnap.data().lastCity);
                    } else {
                        // Default city if none saved
                        fetchWeather('New York');
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                    fetchWeather('New York');
                }
            }
        };
        loadUserCity();
    }, [currentUser]);

    const fetchWeather = async (city) => {
        setLoading(true);
        try {
            // Current Weather
            const weatherRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`
            );
            setWeather(weatherRes.data);
            updateBackground(weatherRes.data);

            // Forecast
            const forecastRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`
            );
            setForecast(forecastRes.data);

            // Persist to Firestore
            if (currentUser) {
                await setDoc(doc(db, "users", currentUser.uid), {
                    lastCity: city
                }, { merge: true });
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "City not found");
            // Don't crash, just stop loading
        }
        setLoading(false);
    };

    const updateBackground = (data) => {
        const condition = data.weather[0].main.toLowerCase();
        const icon = data.weather[0].icon;
        const isNight = icon.includes('n');

        if (isNight) {
            setBgClass('from-indigo-900 to-black');
        } else if (condition.includes('rain') || condition.includes('drizzle')) {
            setBgClass('from-blue-900 to-purple-800');
        } else if (condition.includes('cloud')) {
            setBgClass('from-gray-500 to-slate-700');
        } else {
            setBgClass('from-blue-500 to-cyan-400');
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${bgClass} flex flex-col items-center p-4`}>
            {/* Top Bar */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-8 pt-4">
                <h2 className="text-xl font-semibold opacity-80">WeatherApp</h2>

                {/* User Avatar */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition-all shadow-lg"
                >
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner">
                            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="w-full max-w-md mb-8">
                <SearchBar onSearch={fetchWeather} />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
            ) : (
                <div className="w-full max-w-6xl flex flex-col items-center space-y-8 flex-1">
                    <WeatherHero weather={weather} />
                    <BentoGrid weather={weather} />
                    <ForecastRail forecast={forecast} />
                </div>
            )}

            <UserProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
