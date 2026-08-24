import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, ThumbsUp, Send, Trash2, Reply } from 'lucide-react';

export default function StepComments({ roadmapId, stepOrder }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [roadmapId, stepOrder]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${roadmapId}/step/${stepOrder}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/comments/${roadmapId}/step/${stepOrder}`, {
        content: newComment.trim(),
      });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment');
    }
  };

  const postReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await axios.post(`/api/comments/${roadmapId}/step/${stepOrder}`, {
        content: replyContent.trim(),
        parentComment: parentId,
      });
      setComments(comments.map((c) =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), res.data] }
          : c
      ));
      setReplyContent('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to post reply');
    }
  };

  const toggleLike = async (commentId) => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/comments/${commentId}/like`);
      setComments(comments.map((c) => {
        if (c._id === commentId) {
          const liked = res.data.liked;
          const likes = liked
            ? [...(c.likes || []), user.id]
            : (c.likes || []).filter((id) => id !== user.id);
          return { ...c, likes };
        }
        return c;
      }));
    } catch (err) {
      console.error('Failed to toggle like');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="mt-4 pt-4 border-t c-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="c3" />
        <span className="text-sm font-medium c2">Discussion ({comments.length})</span>
      </div>

      {/* New Comment */}
      {user && (
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center c1 text-xs flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              placeholder="Share a tip or ask a question..."
              className="flex-1 px-4 py-2 c-input border c-border-h rounded-lg text-sm c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={postComment}
              disabled={!newComment.trim()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 c1 rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-sm c3 py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm c3 py-4">No comments yet. Start the discussion!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="group">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center c2 text-xs flex-shrink-0">
                  {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium c2">{comment.user?.name || 'Anonymous'}</span>
                    <span className="text-xs c3">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm c2 leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {user && (
                      <button
                        onClick={() => toggleLike(comment._id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.likes?.includes(user.id) ? 'text-indigo-400' : 'c3 hover:c2'
                        }`}
                      >
                        <ThumbsUp size={12} />
                        {comment.likes?.length > 0 && comment.likes.length}
                      </button>
                    )}
                    {user && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                        className="flex items-center gap-1 text-xs c3 hover:c2 transition-colors"
                      >
                        <Reply size={12} /> Reply
                      </button>
                    )}
                    {user && user.id === comment.user?._id && (
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="text-xs c3 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyTo === comment._id && (
                    <div className="flex gap-2 mt-2">
                      <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && postReply(comment._id)}
                        placeholder="Write a reply..."
                        autoFocus
                        className="flex-1 px-3 py-1.5 c-input border c-border-h rounded-lg text-xs c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => postReply(comment._id)}
                        className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 c1 rounded-lg text-xs"
                      >
                        <Send size={10} />
                      </button>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="mt-3 pl-4 border-l c-border space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center c2 text-[10px] flex-shrink-0">
                            {reply.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium c2">{reply.user?.name || 'Anonymous'}</span>
                              <span className="text-[10px] c3">{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs c2 leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
