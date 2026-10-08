import type { FC, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Search,
    ShoppingBag,
    MessageSquare,
    Bell,
    User,
    LayoutDashboard,
    LogOut,
    MapPin,
    Calendar
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadNotificationCount } from '../../hooks/useData';
import { AppLogo } from '../ui/AppLogo';

const Sidebar = () => {
    const { user } = useAuthStore();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { data: unreadCount } = useUnreadNotificationCount(user?.id);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Feed', path: '/' },
        { icon: Search, label: 'Lost & Found', path: '/lost-found' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
        { icon: MessageSquare, label: 'Chat', path: '/messages' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0 p-4">
            <div className="flex items-center gap-3 px-2 mb-8">
                <AppLogo size="md" />
                <span className="font-bold text-xl tracking-tight">Campus<span className="text-brand">Connect</span></span>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive
                                ? 'bg-brand/10 text-brand font-semibold'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 && (
                            <span className="absolute right-4 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="pt-4 border-t border-border mt-4">
                {user?.is_admin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-brand/10 text-brand font-semibold'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                    </NavLink>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-1 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const BottomNav = () => {
    const navItems = [
        { icon: Home, label: 'Feed', path: '/' },
        { icon: MapPin, label: 'Lost', path: '/lost-found' },
        { icon: ShoppingBag, label: 'Market', path: '/marketplace' },
        { icon: MessageSquare, label: 'Chat', path: '/messages' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 z-50">
            <div className="flex justify-between items-center max-w-lg mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-brand' : 'text-text-secondary'
                            }`
                        }
                    >
                        <item.icon className={`w-6 h-6 ${({ isActive }: any) => isActive ? 'fill-brand/20' : ''}`} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

const TopBar = () => {
    const { user } = useAuthStore();
    const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="md:hidden flex items-center gap-2">
                    <AppLogo size="sm" />
                    <span className="font-bold text-lg">Campus<span className="text-brand">Connect</span></span>
                </div>

                <div className="hidden md:flex flex-1 max-w-xl mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search anything on campus..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="md:hidden p-2 text-text-secondary">
                        <Search className="w-5 h-5" />
                    </button>
                    <NavLink to="/profile" className="relative group">
                        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-semibold text-xs overflow-hidden">
                                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
                        </button>
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-background text-text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};
