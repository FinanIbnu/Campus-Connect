import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    attendees: number;
    image?: string;
}

// Mock events data - can be replaced with API call later
const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Tech Talk: AI & Machine Learning',
        description: 'Join us for an exciting discussion on the latest advancements in AI and machine learning technologies.',
        date: '2026-03-28',
        time: '2:00 PM',
        location: 'Auditorium A',
        category: 'Technology',
        attendees: 234,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
    },
    {
        id: '2',
        title: 'Annual Sports Festival',
        description: 'Get ready for our biggest sports event of the year with competitions, games, and entertainment!',
        date: '2026-03-30',
        time: '9:00 AM',
        location: 'Sports Complex',
        category: 'Sports',
        attendees: 456,
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop'
    },
    {
        id: '3',
        title: 'Cultural Night 2026',
        description: 'Celebrate diverse cultures through music, dance, food, and art from around the world.',
        date: '2026-04-05',
        time: '6:00 PM',
        location: 'Main Hall',
        category: 'Culture',
        attendees: 312,
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=250&fit=crop'
    },
    {
        id: '4',
        title: 'Entrepreneurship Workshop',
        description: 'Learn how to turn your ideas into successful startups with industry experts and mentors.',
        date: '2026-04-08',
        time: '10:00 AM',
        location: 'Innovation Hub',
        category: 'Workshop',
        attendees: 128,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
    },
    {
        id: '5',
        title: 'Music Concert Series',
        description: 'Experience amazing performances by talented student musicians and guest artists.',
        date: '2026-04-12',
        time: '7:00 PM',
        location: 'Concert Hall',
        category: 'Music',
        attendees: 389,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=250&fit=crop'
    },
    {
        id: '6',
        title: 'Career Fair 2026',
        description: 'Meet top companies and explore career opportunities across various industries.',
        date: '2026-04-15',
        time: '11:00 AM',
        location: 'Convention Center',
        category: 'Career',
        attendees: 567,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
    },
];

const CATEGORIES = ['All', 'Technology', 'Sports', 'Culture', 'Workshop', 'Music', 'Career'];

export const EventsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = MOCK_EVENTS.filter(event => {
        const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;
        const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Technology': 'bg-blue-100 text-blue-700',
            'Sports': 'bg-green-100 text-green-700',
            'Culture': 'bg-purple-100 text-purple-700',
            'Workshop': 'bg-orange-100 text-orange-700',
            'Music': 'bg-pink-100 text-pink-700',
            'Career': 'bg-indigo-100 text-indigo-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campus Events</h1>
                    <p className="text-text-secondary mt-1">Discover and join exciting events happening on campus.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-text-secondary">Categories</h3>
                        <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-left text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-text-secondary hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
                        />
                    </div>

                    {sortedEvents.length > 0 ? (
                        <div className="space-y-4">
                            {sortedEvents.map((event) => (
                                <div key={event.id} className="card p-6 hover:border-brand/40 transition-all">
                                    <div className="flex gap-6">
                                        {event.image && (
                                            <div className="hidden sm:block w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg hover:text-brand transition-colors">{event.title}</h3>
                                                    <p className="text-xs text-text-secondary mt-1">{event.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getCategoryColor(event.category)}`}>
                                                    {event.category}
                                                </span>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-border/50 text-sm text-text-secondary">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-brand" />
                                                    {formatDate(event.date)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-brand" />
                                                    {event.time}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-brand" />
                                                    {event.location}
                                                </div>
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <Users className="w-4 h-4 text-brand" />
                                                    {event.attendees} attending
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button size="sm">Attend Event</Button>
                                                <Button variant="ghost" size="sm">Learn More</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">No events found</h3>
                            <p className="text-text-secondary mt-2">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
