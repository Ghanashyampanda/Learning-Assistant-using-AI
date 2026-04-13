import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, User, Menu, Moon, Sun } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    return <header className="sticky top-0 z-40 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 transition-colors duration-200">
        <div className="flex items-center justify-between px-6 h-full">
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                aria-label="Toggle sidebar"
            >
                <Menu size={24} />
            </button>

            <div className="hidden md:block"></div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleTheme}
                    className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group"
                    aria-label="Toggle dark mode"
                >
                    {isDark ? (
                        <Sun size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
                    ) : (
                        <Moon size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
                    )}
                </button>

                <button className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group">
                    <Bell size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer group">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
};

export default Header
