import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Phone, Video, Info, Search, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useConversations, useMessages } from '../hooks/useData';
import { useAuthStore } from '../store/authStore';
import { MessageService } from '../services/api';
import type { Conversation } from '../types';

export const MessagesPage = () => {
    const { user } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: conversations, isLoading: loadingConversations, refetch: refetchConversations } = useConversations(user?.id);
    const { data: messages, isLoading: loadingMessages, setData: setMessages } = useMessages(selectedConversation?.id);

    useEffect(() => {
        const conversationId = searchParams.get('conversationId');
        if (!conversationId || !conversations?.length) return;

        const targetConversation = conversations.find((conv) => conv.id === conversationId);
        if (targetConversation) {
            setSelectedConversation(targetConversation);
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete('conversationId');
                return next;
            }, { replace: true });
        }
    }, [conversations, searchParams, setSearchParams]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages
    useEffect(() => {
        if (!selectedConversation?.id) return;

        const pollInterval = setInterval(async () => {
            try {
                const newMessages = await MessageService.getMessages(selectedConversation.id);
                setMessages(newMessages);
            } catch (error) {
                console.error('Failed to poll messages:', error);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [selectedConversation?.id, setMessages]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedConversation || !user) return;

        setIsSending(true);
        try {
            await MessageService.sendMessage(selectedConversation.id, message.trim());
            setMessage('');
            // Immediately fetch new messages
            const newMessages = await MessageService.getMessages(selectedConversation.id);
            setMessages(newMessages);
            refetchConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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

    const filteredConversations = conversations?.filter(conv =>
        conv.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Sign in to view messages</h2>
                    <p className="text-text-secondary">You need to be logged in to access your messages.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            {/* Sidebar - Chat List */}
            <div className="w-full md:w-80 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-brand" />
                        </div>
                    ) : filteredConversations && filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-all text-left ${selectedConversation?.id === conv.id ? 'bg-brand/5 border-r-4 border-brand' : ''
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold relative flex-shrink-0">
                                    {conv.other_user?.avatar_url ? (
                                        <img src={conv.other_user.avatar_url} alt={conv.other_user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        conv.other_user?.name?.charAt(0) || '?'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-sm truncate">{conv.other_user?.name || 'Unknown'}</h3>
                                        <span className="text-[10px] text-text-secondary">{formatTime(conv.last_message_at)}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary truncate">
                                        {typeof conv.last_message === 'string'
                                            ? conv.last_message
                                            : conv.last_message?.content || 'No messages yet'}
                                    </p>
                                </div>
                                {(conv.unread_count ?? 0) > 0 && (
                                    <div className="w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {conv.unread_count}
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-text-secondary">No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="hidden md:flex flex-1 flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                                    {selectedConversation.other_user?.avatar_url ? (
                                        <img src={selectedConversation.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        selectedConversation.other_user?.name?.charAt(0) || '?'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{selectedConversation.other_user?.name || 'Unknown'}</h3>
                                    <span className="text-[10px] text-text-secondary font-medium">
                                        {selectedConversation.other_user?.department}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-text-secondary hover:text-brand transition-colors"><Phone className="w-5 h-5" /></button>
                                <button className="p-2 text-text-secondary hover:text-brand transition-colors"><Video className="w-5 h-5" /></button>
                                <button className="p-2 text-text-secondary hover:text-brand transition-colors"><Info className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Message Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                                </div>
                            ) : messages && messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.sender_id === user.id
                                                ? 'bg-brand text-white rounded-tr-none'
                                                : 'bg-white border border-border rounded-tl-none'
                                                }`}
                                        >
                                            {msg.content}
                                            <div
                                                className={`text-[10px] mt-1 text-right ${msg.sender_id === user.id ? 'text-brand-light opacity-80' : 'text-text-secondary'
                                                    }`}
                                            >
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-text-secondary text-sm">No messages yet. Start the conversation!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-sm"
                                />
                                <Button
                                    className="px-5"
                                    aria-label="Send message"
                                    onClick={handleSendMessage}
                                    disabled={!message.trim() || isSending}
                                    isLoading={isSending}
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Select a conversation</h3>
                            <p className="text-text-secondary">Choose a chat from the sidebar to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
