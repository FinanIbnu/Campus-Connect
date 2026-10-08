import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Loader2, Heart, MessageCircle, Share2, Bell, CheckCheck, ImagePlus, X } from 'lucide-react';
import axios from 'axios';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { LostFoundPage } from './pages/LostFoundPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { EventsPage } from './pages/EventsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { usePosts, useNotifications, useClubs } from './hooks/useData';
import { useAuthStore } from './store/authStore';
import { PostService, NotificationService, ClubService } from './services/api';
import { Button } from './components/ui/Button';
import type { Post } from './types';

// Main Feed Page
const Feed = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: posts, isLoading, refetch } = usePosts();
  const { data: clubs } = useClubs();
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Please select an image smaller than 3MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPostImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setNewPostImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && !newPostImage) || !user) return;
    setIsPosting(true);
    try {
      await PostService.create({
        content: newPostContent.trim(),
        image_url: newPostImage || undefined,
      });
      setNewPostContent('');
      clearSelectedImage();
      refetch();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to create post:', error.response?.data?.message || error.message);
      } else {
        console.error('Failed to create post:', error);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) return;
    try {
      if (likedPosts.has(post.id)) {
        await PostService.unlike(post.id);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      } else {
        await PostService.like(post.id);
        setLikedPosts(prev => new Set(prev).add(post.id));
      }
      refetch();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) return;
    try {
      await ClubService.join(clubId);
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Feed</h1>
          <p className="text-text-secondary mt-1">What's happening on campus today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          {user && (
            <div className="card p-6 bg-brand/5 border-dashed border-brand/30">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center font-bold text-brand overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share something with your campus..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-16 focus:outline-none"
                  />
                  {newPostImage && (
                    <div className="mt-3 relative w-full max-w-sm">
                      <img src={newPostImage} alt="Selected" className="w-full rounded-xl border border-border" />
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/70 transition-colors"
                        aria-label="Remove selected image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-brand/10">
                    <div className="flex gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 hover:bg-white rounded-lg transition-all text-text-secondary"
                        aria-label="Add image"
                      >
                        <ImagePlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg transition-all text-text-secondary">📍</button>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreatePost}
                      disabled={(!newPostContent.trim() && !newPostImage) || isPosting}
                      isLoading={isPosting}
                    >
                      Post Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="card p-6 hover:border-brand/30 transition-all">
                <div className="flex gap-3 items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-text-secondary flex items-center justify-center font-bold overflow-hidden">
                    {post.author?.avatar_url ? (
                      <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'user'}`} alt="avatar" className="rounded-xl" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{post.author?.name || 'Anonymous'}</div>
                    <div className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                      {post.author?.department || 'Unknown'} • {formatTime(post.created_at)}
                    </div>
                  </div>
                  {post.is_pinned && (
                    <span className="ml-auto px-2 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded uppercase">Pinned</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full rounded-xl mb-4" />
                )}
                <div className="flex items-center gap-6 text-text-secondary text-[11px] font-bold uppercase tracking-widest pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 hover:text-brand transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    {post.likes_count} Likes
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-brand transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count} Comments
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-brand transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-text-secondary">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6">Trending Clubs</h3>
            <div className="space-y-5">
              {clubs && clubs.length > 0 ? (
                clubs.slice(0, 5).map(club => (
                  <div key={club.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        {club.icon || '🎯'}
                      </div>
                      <div>
                        <div className="text-sm font-bold group-hover:text-brand transition-colors">{club.name}</div>
                        <div className="text-[10px] text-text-secondary font-medium">{club.category} • {club.members_count} members</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="text-[10px] text-brand font-bold uppercase tracking-wider hover:underline px-3 py-1 bg-brand/5 rounded-lg"
                    >
                      Join
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">No clubs yet</p>
              )}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-brand to-brand-dark text-white border-none shadow-xl shadow-brand/20">
            <h3 className="font-bold text-lg mb-2">Campus Events</h3>
            <p className="text-xs text-white/80 mb-6 leading-relaxed">
              Don't miss out on exciting events happening this week!
            </p>
            <button onClick={() => navigate('/events')} className="w-full py-3 bg-white text-brand rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { user } = useAuthStore();
  const { data: notifications, isLoading, refetch } = useNotifications(user?.id);

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      refetch();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead();
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'message': return '✉️';
      case 'announcement': return '📢';
      case 'marketplace': return '🛍️';
      case 'lost_found': return '🔍';
      default: return '🔔';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to view notifications</h2>
          <p className="text-text-secondary">You need to be logged in to see your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        {notifications && notifications.some(n => !n.is_read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              className={`card p-5 flex gap-4 hover:border-brand/20 transition-all cursor-pointer ${!notification.is_read ? 'bg-brand/5 border-brand/20' : ''
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${!notification.is_read ? 'bg-brand text-white' : 'bg-gray-100'
                }`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm">{notification.title}</h3>
                  <span className="text-[10px] text-text-secondary font-medium uppercase">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{notification.content}</p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No notifications</h3>
          <p className="text-text-secondary">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  // Initialize auth listener
  useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><MainLayout><Feed /></MainLayout></ProtectedRoute>} />
        <Route path="/lost-found" element={<ProtectedRoute><MainLayout><LostFoundPage /></MainLayout></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><MainLayout><MarketplacePage /></MainLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MainLayout><MessagesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><MainLayout><EventsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
