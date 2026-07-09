import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/dateHelper';
import { cleanVideoTitle, formatCount } from '../utils/videoHelper';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';

const TABS = [
  { key: 'stats', label: 'Tổng quan' },
  { key: 'users', label: 'Người dùng' },
  { key: 'videos', label: 'Video' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()]).then(([statsRes, usersRes]) => {
      if (cancelled) return;
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUserCount(usersRes.data.data.length);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!stats) return <p className="text-gray-500 text-sm">Không thể tải thống kê</p>;

  const cards = [
    { label: 'Tổng video', value: stats.totalVideos, icon: '🎬' },
    { label: 'Người dùng', value: userCount ?? '—', icon: '👤' },
    { label: 'Tổng lượt xem', value: formatCount(stats.totalViews), icon: '👁️' },
    { label: 'Dung lượng lưu trữ', value: formatBytes(stats.totalStorageBytes), icon: '💾' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-[#141414] rounded-xl border border-white/[0.06] p-5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
        <div className="bg-[#141414] rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Trạng thái video</h3>
          <div className="flex gap-6 flex-wrap">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-sm text-gray-400">
                <span className="text-white font-medium">{count}</span> {status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await adminAPI.getUsers();
        if (!cancelled && res.data.success) setUsers(res.data.data);
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách người dùng');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.patchUser(u.id, { role: newRole });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
      toast.success(`Đã cập nhật quyền cho ${u.username}`);
    } catch {
      toast.error('Không thể cập nhật quyền');
    }
  };

  const toggleActive = async (u) => {
    try {
      await adminAPI.patchUser(u.id, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="bg-[#141414] rounded-xl border border-white/[0.06] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-gray-500 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">Người dùng</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{u.username}</td>
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-[#E50914]/15 text-[#E50914]' : 'bg-white/5 text-gray-400'}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                <button onClick={() => toggleRole(u)} className="text-xs text-gray-400 hover:text-white transition-colors">
                  {u.role === 'admin' ? 'Bỏ admin' : 'Cấp admin'}
                </button>
                <button onClick={() => toggleActive(u)} className="text-xs text-gray-400 hover:text-white transition-colors">
                  {u.is_active ? 'Khóa' : 'Mở khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VideosTab() {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await adminAPI.getVideos({ limit: 50 });
        if (!cancelled && res.data.success) setVideos(res.data.data);
      } catch {
        if (!cancelled) toast.error('Không thể tải danh sách video');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteVideo(deleteTarget.id);
      setVideos(prev => prev.filter(v => v.id !== deleteTarget.id));
      toast.success('Đã xóa video');
    } catch {
      toast.error('Không thể xóa video');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <>
      <div className="bg-[#141414] rounded-xl border border-white/[0.06] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Người tải lên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Lượt xem</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{cleanVideoTitle(v.title)}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{v.userId}</td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{v.status}</td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatCount(v.viewCount)}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(v.createdAt)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setDeleteTarget(v)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} title="Xác nhận xóa"
        actions={<><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Hủy</Button><Button variant="danger" onClick={confirmDelete} loading={deleting}>Xóa</Button></>}>
        Xóa video <span className="text-white font-medium">"{deleteTarget && cleanVideoTitle(deleteTarget.title)}"</span>? Hành động không thể hoàn tác.
      </Modal>
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-xl border border-white/10 w-fit mb-8">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'videos' && <VideosTab />}
    </div>
  );
}
