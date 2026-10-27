import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { pendingLessons, syncPendingLessons, unreadablePendingCount } from '../services/pendingLessons';

export function PendingLessonsStatus() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [unreadable, setUnreadable] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    setCount(0); setUnreadable(0); setError('');
    if (!user) return;
    let disposed = false;
    let running = false;
    const refresh = () => { if (!disposed) { setCount(pendingLessons(user.uid).length); setUnreadable(unreadablePendingCount(user.uid)); } };
    const sync = async () => {
      if (running || !navigator.onLine) return;
      running = true;
      try { await syncPendingLessons(user.uid); if (!disposed) setError(''); }
      catch { if (!disposed) setError('Chưa đồng bộ được. Kiểm tra mạng hoặc quyền Firebase; bản chờ vẫn được giữ trên trình duyệt này.'); }
      finally { running = false; refresh(); }
    };
    refresh(); void sync();
    const online = () => { void sync(); };
    window.addEventListener('online', online);
    window.addEventListener('hocvui-pending', refresh);
    window.addEventListener('storage', refresh);
    const timer = setInterval(online, 30000);
    return () => {
      disposed = true; clearInterval(timer);
      window.removeEventListener('online', online);
      window.removeEventListener('hocvui-pending', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [user?.uid]);
  if (!count && !unreadable) return null;
  return <div role="status" className="bg-amber-50 p-3 text-center text-sm text-amber-900">
    Có {count} kết quả chờ lưu. App tự thử lại khi có mạng. Không xóa dữ liệu trình duyệt trước khi đồng bộ.
    {unreadable > 0 && <p>Có {unreadable} bản chờ bị lỗi định dạng. Dữ liệu vẫn được giữ; cần hỗ trợ kiểm tra trước khi xóa dữ liệu trình duyệt.</p>}
    {error && <p>{error}</p>}
  </div>;
}
