import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate, formatRelativeTime, formatDuration } from '../utils/dateHelper';
import { cleanVideoTitle } from '../utils/videoHelper';
import VideoStatusBadge from '../components/Video/VideoStatusBadge';
import VideoPlayer from '../components/Video/VideoPlayer';
import LikeButton from '../components/Video/LikeButton';
import FavoriteButton from '../components/Video/FavoriteButton';
import RatingStars from '../components/Video/RatingStars';
import CommentSection from '../components/Video/CommentSection';
import RelatedVideos from '../components/Video/RelatedVideos';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Spinner from '../components/UI/Spinner';
import { API_URL } from '../config';

const STREAMING_URL = import.meta.env.VITE_STREAMING_SERVICE_URL || API_URL;

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const viewRecordedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await videoAPI.getById(id);
        if (!cancelled && res.data.success) setVideo(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải video');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    videoAPI.getProgress(id).then(res => {
      if (!cancelled && res.data.success && res.data.data) {
        setInitialPosition(res.data.data.positionSeconds || 0);
      }
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (video?.status === 'READY' && !viewRecordedRef.current) {
      viewRecordedRef.current = true;
      videoAPI.recordView(id).catch(() => {});
    }
  }, [video?.status, id]);

  useEffect(() => {
    if (!video || (video.status !== 'PROCESSING' && video.status !== 'UPLOADING')) return;
    const poll = setInterval(async () => {
      try {
        const res = await videoAPI.getById(id);
        if (res.data.success) {
          setVideo(res.data.data);
          if (res.data.data.status === 'READY' || res.data.data.status === 'ERROR') {
            clearInterval(poll);
            if (res.data.data.status === 'READY') toast.success('Video đã xử lý xong!');
          }
        }
      } catch (err) { console.error('Lỗi polling:', err); }
    }, 10000);
    return () => clearInterval(poll);
  }, [id, video?.status, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await videoAPI.delete(id);
      toast.success('Đã xóa video thành công');
      navigate('/videos');
    } catch (err) {
      toast.error('Lỗi khi xóa video');
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Đã copy link!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-medium text-white mb-2">Lỗi tải video</h2>
        <p className="text-gray-500 mb-5">{error || 'Video không tồn tại'}</p>
        <Button onClick={() => navigate('/videos')}>Quay lại</Button>
      </div>
    );
  }

  const cleanTitle = cleanVideoTitle(video.title, 100);
  const hlsSrc = `${STREAMING_URL}/stream/${video.videoId || video.id}/master.m3u8`;
  const duration = formatDuration(video.duration);

  const metaItems = [
    { icon: '⏱', label: 'Thời lượng', value: duration || '—' },
    { icon: '📅', label: 'Ngày tải lên', value: formatDate(video.createdAt || video.created_at) },
    { icon: '🕐', label: 'Thời gian', value: formatRelativeTime(video.createdAt || video.created_at) },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6">
    <div className="lg:flex lg:gap-6 lg:items-start">
      {/* Player */}
      <div className="lg:flex-1 mb-6 lg:mb-0">
        <div className="w-full bg-black rounded-xl border border-white/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          {video.status === 'READY' ? (
            <VideoPlayer src={hlsSrc} poster={video.thumbnailUrl} videoId={video.id || video.videoId} initialPosition={initialPosition} />
          ) : video.status === 'PROCESSING' ? (
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#141414] to-black">
              <Spinner size="lg" className="mb-5 border-yellow-500" />
              <h3 className="text-lg text-white font-medium mb-2">Đang xử lý video</h3>
              <p className="text-gray-500 text-sm max-w-md text-center">Hệ thống đang tạo HLS (360p/720p/1080p) và trích xuất thumbnail.</p>
            </div>
          ) : video.status === 'UPLOADING' ? (
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#141414] to-black">
              <div className="text-4xl mb-4 animate-bounce">⬆️</div>
              <h3 className="text-lg text-white font-medium">Đang tải lên...</h3>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#141414] to-black">
              <div className="text-5xl mb-4">❌</div>
              <h3 className="text-lg text-red-400 font-medium">Lỗi xử lý</h3>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-[320px] lg:flex-shrink-0 space-y-3">
        {/* Info Card */}
        <div className="bg-[#141414] rounded-xl border border-white/[0.06] p-5">
          <VideoStatusBadge status={video.status} className="mb-3" />
          <h1 className="text-lg font-bold text-white leading-snug mb-4">{cleanTitle}</h1>

          <div className="space-y-0">
            {metaItems.map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="text-[11px]">{icon}</span> {label}
                </span>
                <span className="text-xs text-gray-400 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {video.description && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Mô tả</p>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{video.description}</p>
            </div>
          )}

          {video.status === 'READY' && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <RatingStars videoId={video.id || video.videoId} avgRating={video.avgRating} ratingCount={video.ratingCount} />
            </div>
          )}
        </div>

        {/* Like / Favorite */}
        {video.status === 'READY' && (
          <div className="flex gap-2">
            <LikeButton videoId={video.id || video.videoId} initialLikeCount={video.likeCount} />
            <div className="flex-1"><FavoriteButton videoId={video.id || video.videoId} /></div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#141414] border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12] transition-all">
            {copied ? (
              <><svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span className="text-green-400">Đã copy!</span></>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy link</>
            )}
          </button>

          <button onClick={() => navigate('/videos')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#141414] border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12] transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Về danh sách
          </button>

          <button onClick={() => setDeleteModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Xóa video
          </button>
        </div>
      </div>
    </div>

      {video.status === 'READY' && (
        <>
          <div className="mt-8 max-w-3xl">
            <CommentSection videoId={video.id || video.videoId} initialCommentCount={video.commentCount} />
          </div>

          <div className="mt-10">
            <RelatedVideos videoId={video.id || video.videoId} />
          </div>
        </>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={() => !isDeleting && setDeleteModalOpen(false)} title="Xác nhận xóa"
        actions={<><Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Hủy</Button><Button variant="danger" onClick={handleDelete} loading={isDeleting}>Xóa</Button></>}>
        Xóa video <span className="text-white font-medium">"{cleanTitle}"</span>? Hành động không thể hoàn tác.
      </Modal>
    </div>
  );
}
