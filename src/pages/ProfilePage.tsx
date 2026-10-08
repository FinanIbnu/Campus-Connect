import { useState } from 'react';
import { Mail, Briefcase, Calendar, Settings, Edit3, Grid, ShoppingBag, MapPin, X, Loader2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { useUserPosts, useUserLostFound, useUserMarketplace } from '../hooks/useData';
import { ProfileService } from '../services/api';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentDepartment: string;
    onSave: (name: string, department: string) => Promise<void>;
}

const EditProfileModal = ({ isOpen, onClose, currentName, currentDepartment, onSave }: EditProfileModalProps) => {
    const [name, setName] = useState(currentName);
    const [department, setDepartment] = useState(currentDepartment);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(name, department);
            onClose();
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleSave} isLoading={isSaving}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const ProfilePage = () => {
    const { user, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'posts' | 'lost-found' | 'listings'>('posts');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: posts, isLoading: loadingPosts } = useUserPosts(user?.id);
    const { data: lostFoundItems, isLoading: loadingLostFound } = useUserLostFound(user?.id);
    const { data: listings, isLoading: loadingListings } = useUserMarketplace(user?.id);

    const handleUpdateProfile = async (name: string, department: string) => {
        if (!user) return;
        await ProfileService.update({ name, department });
        updateProfile({ name, department });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Not logged in</h2>
                    <p className="text-text-secondary">Please sign in to view your profile.</p>
                </div>
            </div>
        );
    }

    const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Profile Info */}
            <div className="card relative overflow-visible mt-16">
                <div className="h-32 bg-brand/10 w-full" />
                <div className="px-8 pb-8">
                    <div className="absolute -top-12 left-8 w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl border border-border">
                        <div className="w-full h-full rounded-[1.25rem] bg-brand/10 flex items-center justify-center text-brand font-bold text-3xl overflow-hidden">
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="pt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-text-secondary text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" />
                                    <span className="font-medium">{user.email}</span>
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded">Verified</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    {user.department}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Joined {joinedDate}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" leftIcon={Settings}>Settings</Button>
                            <Button size="sm" leftIcon={Edit3} onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Content Section */}
            <div className="space-y-6">
                <div className="flex border-b border-border gap-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-1 py-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'posts' ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-brand'
                            }`}
                    >
                        <Grid className="w-4 h-4" /> Posts ({posts?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('lost-found')}
                        className={`px-1 py-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'lost-found' ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-brand'
                            }`}
                    >
                        <MapPin className="w-4 h-4" /> Lost & Found ({lostFoundItems?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-1 py-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'listings' ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-brand'
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Listings ({listings?.length || 0})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'posts' && (
                    loadingPosts ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        </div>
                    ) : posts && posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map(post => (
                                <div key={post.id} className="card p-6">
                                    <div className="text-xs text-text-secondary mb-2">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-3">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                                        <span>{post.likes_count} Likes</span>
                                        <span>{post.comments_count} Comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-border border-dashed">
                            <Grid className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-text-secondary">No posts yet</p>
                        </div>
                    )
                )}

                {activeTab === 'lost-found' && (
                    loadingLostFound ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        </div>
                    ) : lostFoundItems && lostFoundItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {lostFoundItems.map(item => (
                                <div key={item.id} className="card p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'found' ? 'bg-green-100 text-green-700' :
                                            item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-text-secondary">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
                                        <MapPin className="w-3 h-3" /> {item.location}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-border border-dashed">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-text-secondary">No lost & found items</p>
                        </div>
                    )
                )}

                {activeTab === 'listings' && (
                    loadingListings ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        </div>
                    ) : listings && listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listings.map(item => (
                                <div key={item.id} className="card p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                        <span className="font-bold text-brand">₹{item.price}</span>
                                    </div>
                                    <h3 className="font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
                                        <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-border border-dashed">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-text-secondary">No marketplace listings</p>
                        </div>
                    )
                )}
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentName={user.name}
                currentDepartment={user.department}
                onSave={handleUpdateProfile}
            />
        </div>
    );
};
