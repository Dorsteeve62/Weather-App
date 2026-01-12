import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Lock, User, Trash2, LogOut, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfileModal({ isOpen, onClose }) {
    const { currentUser, uploadProfilePicture, updateUserPassword, deleteAccount, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Profile Picture State
    const [isUploading, setIsUploading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Delete Account State
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            try {
                setIsUploading(true);
                await uploadProfilePicture(e.target.files[0], currentUser);
                toast.success('Profile picture updated!');
            } catch (error) {
                toast.error('Failed to upload image.');
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserPassword(currentPassword, newPassword);
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            toast.error('Failed to update password. Check current password.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await deleteAccount(deletePassword);
            onClose();
            toast.success('Account deleted.');
        } catch (error) {
            toast.error('Failed to delete account. Incorrect password.');
            console.error(error);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card w-full max-w-lg rounded-2xl overflow-hidden relative border border-white/20 shadow-2xl bg-[#1a1a2e]/90"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'security' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <Lock size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('danger')}
                        className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'danger' ? 'bg-red-500/20 text-red-200' : 'text-white/50 hover:text-red-200'}`}
                    >
                        <Trash2 size={18} /> Danger Zone
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="flex flex-col items-center">
                            <div className="relative group mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                                    {currentUser?.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                                            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    <Camera className="text-white" size={32} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            {isUploading && <p className="text-blue-300 text-sm animate-pulse mb-4">Uploading...</p>}

                            <div className="w-full space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email</label>
                                    <p className="text-white text-lg">{currentUser?.email}</p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 mt-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                                >
                                    <LogOut size={20} /> Log Out
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="glass-input w-full p-3 rounded-xl pr-12"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors cursor-pointer ${currentPassword ? 'text-black/70 hover:text-black' : 'text-white/50 hover:text-white'}`}
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="glass-input w-full p-3 rounded-xl pr-12"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors cursor-pointer ${newPassword ? 'text-black/70 hover:text-black' : 'text-white/50 hover:text-white'}`}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}

                    {/* Danger Tab */}
                    {activeTab === 'danger' && (
                        <div className="space-y-6">
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                                <h3 className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                                    <Trash2 size={20} /> Delete Account
                                </h3>
                                <p className="text-red-200/70 text-sm">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                            </div>

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Delete My Account
                                </button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-white font-medium">Please enter your password to confirm:</p>
                                    <div className="relative">
                                        <input
                                            type={showDeletePassword ? "text" : "password"}
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            className="glass-input w-full p-3 rounded-xl border-red-500/50 focus:ring-red-500 pr-12"
                                            placeholder="Confirm Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                                            className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors cursor-pointer ${deletePassword ? 'text-black/70 hover:text-black' : 'text-white/50 hover:text-white'}`}
                                        >
                                            {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={!deletePassword || loading}
                                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50"
                                        >
                                            {loading ? 'Deleting...' : 'Confirm Delete'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
