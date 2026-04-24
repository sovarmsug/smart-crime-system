import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CameraIcon,
  DocumentTextIcon,
  TrophyIcon,
  LightBulbIcon,
  HandRaisedIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isPinned: boolean;
  tags: string[];
  type: 'update' | 'alert' | 'tip' | 'discussion' | 'achievement';
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  type: 'meeting' | 'workshop' | 'patrol' | 'awareness';
  isRegistered: boolean;
}

interface CommunityTip {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'safety' | 'prevention' | 'response' | 'awareness';
  upvotes: number;
  isUpvoted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CommunityEngagementProps {
  className?: string;
}

const CommunityEngagement: React.FC<CommunityEngagementProps> = ({ className }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'tips' | 'neighbors'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCommunityData();
    
    if (socket) {
      socket.on('new-post', handleNewPost);
      socket.on('post-liked', handlePostLiked);
      socket.on('new-comment', handleNewComment);
      socket.on('event-registered', handleEventRegistered);
    }

    return () => {
      if (socket) {
        socket.off('new-post', handleNewPost);
        socket.off('post-liked', handlePostLiked);
        socket.off('new-comment', handleNewComment);
        socket.off('event-registered', handleEventRegistered);
      }
    };
  }, [socket]);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          authorId: 'user1',
          authorName: 'Sarah Johnson',
          content: 'Just noticed increased police patrol in our neighborhood. Great to see the community working together!',
          location: 'Kampala Central',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          likes: 24,
          comments: 8,
          shares: 3,
          isLiked: false,
          isPinned: false,
          tags: ['community', 'safety'],
          type: 'update'
        },
        {
          id: '2',
          authorId: 'user2',
          authorName: 'Police Officer Mike',
          content: 'Reminder: Lock your vehicles and remove valuables from sight. We\'ve seen a spike in car break-ins this week.',
          location: 'Wakiso District',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes: 45,
          comments: 12,
          shares: 15,
          isLiked: true,
          isPinned: true,
          tags: ['safety', 'prevention', 'theft'],
          type: 'alert'
        },
        {
          id: '3',
          authorId: 'user3',
          authorName: 'Community Watch',
          content: 'Safety tip: Install motion sensor lights around your property. They\'re effective deterrents and relatively inexpensive.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          likes: 67,
          comments: 23,
          shares: 31,
          isLiked: false,
          isPinned: false,
          tags: ['safety', 'prevention', 'tips'],
          type: 'tip'
        }
      ];

      const mockEvents: CommunityEvent[] = [
        {
          id: '1',
          title: 'Community Safety Meeting',
          description: 'Monthly meeting to discuss neighborhood safety concerns and initiatives',
          date: '2024-01-25',
          time: '18:00',
          location: 'Kampala Community Center',
          organizer: 'Community Watch Association',
          attendees: 45,
          maxAttendees: 100,
          type: 'meeting',
          isRegistered: false
        },
        {
          id: '2',
          title: 'Self-Defense Workshop',
          description: 'Learn basic self-defense techniques for personal safety',
          date: '2024-01-28',
          time: '14:00',
          location: 'Entebbe Sports Complex',
          organizer: 'Police Department',
          attendees: 28,
          maxAttendees: 50,
          type: 'workshop',
          isRegistered: true
        }
      ];

      const mockTips: CommunityTip[] = [
        {
          id: '1',
          title: 'Home Security Basics',
          content: 'Install deadbolt locks on all exterior doors. Use window locks and security film on ground-floor windows.',
          author: 'Security Expert',
          category: 'safety',
          upvotes: 89,
          isUpvoted: false,
          difficulty: 'easy'
        },
        {
          id: '2',
          title: 'Recognizing Suspicious Activity',
          content: 'Look for unusual behavior, people loitering, vehicles circling repeatedly, or attempts to access restricted areas.',
          author: 'Police Department',
          category: 'awareness',
          upvotes: 156,
          isUpvoted: true,
          difficulty: 'medium'
        }
      ];

      setPosts(mockPosts);
      setEvents(mockEvents);
      setTips(mockTips);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (post: CommunityPost) => {
    setPosts(prev => [post, ...prev]);
    toast.success('New community post added!');
  };

  const handlePostLiked = (data: { postId: string; likes: number; isLiked: boolean }) => {
    setPosts(prev => prev.map(post => 
      post.id === data.postId 
        ? { ...post, likes: data.likes, isLiked: data.isLiked }
        : post
    ));
  };

  const handleNewComment = (data: { postId: string; comments: number }) => {
    setPosts(prev => prev.map(post => 
      post.id === data.postId 
        ? { ...post, comments: data.comments }
        : post
    ));
  };

  const handleEventRegistered = (data: { eventId: string; attendees: number }) => {
    setEvents(prev => prev.map(event => 
      event.id === data.eventId 
        ? { ...event, attendees: data.attendees, isRegistered: true }
        : event
    ));
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      const post: CommunityPost = {
        id: `post-${Date.now()}`,
        authorId: user?.id || 'anonymous',
        authorName: `${user?.first_name} ${user?.last_name}` || 'Anonymous',
        content: newPost,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isPinned: false,
        tags: [],
        type: 'update'
      };

      if (socket) {
        socket.emit('create-post', post);
      }

      setNewPost('');
      setShowPostForm(false);
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
      const newIsLiked = !post.isLiked;

      if (socket) {
        socket.emit('like-post', { postId, likes: newLikes, isLiked: newIsLiked });
      }

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes: newLikes, isLiked: newIsLiked }
          : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const sharePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (navigator.share) {
        await navigator.share({
          title: 'Community Post',
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(post.content);
        toast.success('Post copied to clipboard!');
      }

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, shares: p.shares + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (socket) {
        socket.emit('register-event', { eventId, userId: user?.id });
      }

      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, attendees: e.attendees + 1, isRegistered: true }
          : e
      ));

      toast.success('Registered for event successfully!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  const upvoteTip = async (tipId: string) => {
    try {
      const tip = tips.find(t => t.id === tipId);
      if (!tip) return;

      const newUpvotes = tip.isUpvoted ? tip.upvotes - 1 : tip.upvotes + 1;
      const newIsUpvoted = !tip.isUpvoted;

      setTips(prev => prev.map(t => 
        t.id === tipId 
          ? { ...t, upvotes: newUpvotes, isUpvoted: newIsUpvoted }
          : t
      ));

      toast.success(tip.isUpvoted ? 'Upvote removed' : 'Tip upvoted!');
    } catch (error) {
      console.error('Error upvoting tip:', error);
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-800';
      case 'tip': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-purple-100 text-purple-800';
      case 'discussion': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'patrol': return 'bg-orange-100 text-orange-800';
      case 'awareness': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Hub</h1>
            <p className="text-gray-600 mt-1">Connect, share, and stay safe together</p>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
            Share Update
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200">
          {[
            { id: 'feed', label: 'Community Feed', icon: ChatBubbleLeftRightIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon },
            { id: 'tips', label: 'Safety Tips', icon: LightBulbIcon },
            { id: 'neighbors', label: 'Neighbors', icon: UserGroupIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post Creation Form */}
      {showPostForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share with Community</h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What would you like to share with your neighbors?"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <CameraIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MapPinIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPostForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {post.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                      {post.isPinned && (
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Pinned
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                        {post.type}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                    {post.location && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {post.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-800 mb-4">{post.content}</p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-green-600"
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </div>
                <div className="text-sm text-gray-500">
                  {event.attendees}/{event.maxAttendees || '∞'} attending
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Organized by {event.organizer}
                </div>
              </div>
              
              <button
                onClick={() => registerForEvent(event.id)}
                disabled={event.isRegistered}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  event.isRegistered
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {event.isRegistered ? 'Registered ✓' : 'Register'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Safety Tips */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                      {tip.difficulty}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{tip.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      By {tip.author} • {tip.category}
                    </div>
                    <button
                      onClick={() => upvoteTip(tip.id)}
                      className={`flex items-center space-x-1 ${tip.isUpvoted ? 'text-orange-600' : 'text-gray-500'} hover:text-orange-600`}
                    >
                      {tip.isUpvoted ? (
                        <StarSolidIcon className="h-5 w-5" />
                      ) : (
                        <StarIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm">{tip.upvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Neighbors */}
      {activeTab === 'neighbors' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Neighbors</h3>
            <p className="text-gray-600 mb-4">
              Build a safer community by connecting with your neighbors
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Find Neighbors
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityEngagement;
