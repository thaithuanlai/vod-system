import { useEffect, useState } from 'react';
import { videoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/dateHelper';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';

const PAGE_SIZE = 10;

export default function CommentSection({ videoId, initialCommentCount = 0 }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(initialCommentCount);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await videoAPI.getComments(videoId, { limit: PAGE_SIZE });
        if (!cancelled && res.data.success) {
          setComments(res.data.data);
          setHasMore(res.data.data.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error('Lỗi tải bình luận:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [videoId]);

  const loadMore = async () => {
    if (loadingMore || comments.length === 0) return;
    setLoadingMore(true);
    try {
      const lastId = comments[comments.length - 1].id;
      const res = await videoAPI.getComments(videoId, { limit: PAGE_SIZE, startAfterId: lastId });
      if (res.data.success) {
        setComments(prev => [...prev, ...res.data.data]);
        setHasMore(res.data.data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Lỗi tải thêm bình luận:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const res = await videoAPI.postComment(videoId, { text: text.trim(), username: user?.username });
      if (res.data.success) {
        setComments(prev => [res.data.data, ...prev]);
        setCount(c => c + 1);
        setText('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await videoAPI.deleteComment(videoId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCount(c => Math.max(0, c - 1));
    } catch {
      toast.error('Không thể xóa bình luận');
    }
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Bình luận ({count})</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Viết bình luận..."
          maxLength={500}
          className="flex-1 px-3.5 py-2.5 bg-[#0f0f0f] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-white/30 outline-none transition-all"
        />
        <Button type="submit" size="md" loading={posting} disabled={!text.trim()}>Gửi</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="md" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-6">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {comment.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{comment.username}</span>
                    <span className="text-[11px] text-gray-600">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-0.5 break-words">{comment.text}</p>
                </div>
                {(comment.userId === user?.id || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Xóa bình luận"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-white transition-colors"
            >
              {loadingMore ? 'Đang tải...' : 'Xem thêm bình luận'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
