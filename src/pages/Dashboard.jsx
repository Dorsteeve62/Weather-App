import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';
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

    const [userName, setUserName] = useState('');

    // Always get real-time location on mount, and fetch user name
    useEffect(() => {
        const loadUserData = async () => {
            if (currentUser) {
                try {
                    // Get location
                    getUserLocation();

                    // Get User Name from Firestore
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Use Firestore first name, or Google display name, or fallback
                        setUserName(data.firstName || currentUser.displayName?.split(' ')[0] || 'Friend');
                    } else {
                        setUserName(currentUser.displayName?.split(' ')[0] || 'Friend');
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                    setUserName(currentUser.displayName?.split(' ')[0] || 'Friend');
                    getUserLocation();
                }
            }
        };
        loadUserData();
    }, [currentUser]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getUserLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Location error:", error);
                    toast.error("Location access denied. Defaulting to New York.");
                    fetchWeather('New York');
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
            fetchWeather('New York');
        }
    };

    const fetchWeather = async (query) => {
        setLoading(true);
        try {
            let weatherUrl, forecastUrl;

            // Determine API URL based on query type (string vs object)
            if (typeof query === 'string') {
                weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=imperial&appid=${API_KEY}`;
                forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=imperial&appid=${API_KEY}`;
            } else if (query.lat && query.lon) {
                weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=imperial&appid=${API_KEY}`;
                forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&units=imperial&appid=${API_KEY}`;
            } else {
                return; // Invalid query
            }

            // Current Weather
            const weatherRes = await axios.get(weatherUrl);
            setWeather(weatherRes.data);
            updateBackground(weatherRes.data);

            // Forecast
            const forecastRes = await axios.get(forecastUrl);
            setForecast(forecastRes.data);

            // Persist to Firestore (save the city name returned by the API)
            if (currentUser) {
                await setDoc(doc(db, "users", currentUser.uid), {
                    lastCity: weatherRes.data.name
                }, { merge: true });
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error fetching weather");
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
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        {getGreeting()}, {userName}
                    </h2>
                    <p className="text-white/60 text-sm">Welcome back</p>
                </div>

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

            {/* Search & Location */}
            <div className="w-full max-w-md mb-8 flex items-center gap-2">
                <div className="flex-1">
                    <SearchBar onSearch={fetchWeather} />
                </div>
                <button
                    onClick={getUserLocation}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all shadow-lg backdrop-blur-md"
                    title="Use My Location"
                >
                    <MapPin size={22} />
                </button>
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
