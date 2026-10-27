import React, { useState } from 'react';
import { Clock3, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { trashExpiryMillis } from '../services/profileTrash';
import { describeProfileDeletionError } from '../services/profileDeletion';

export const ProfileTrashPanel: React.FC = () => {
  const { trashProfiles, trashError, restoreProfile, purgeProfile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const action = async (id: string, name: string, permanent: boolean) => {
    if (busy) return;
    if (permanent) {
      const given = window.prompt(`XÓA VĨNH VIỄN bé ${name} và tất cả lịch sử học tập. KHÔNG thể khôi phục!\nNhập chính xác tên bé để xác nhận:`);
      if (given !== name) return;
    }
    setBusy(id); setError(null); setMessage(null);
    try {
      if (permanent) await purgeProfile(id);
      else await restoreProfile(id);
      setMessage(permanent
        ? `Đã xóa vĩnh viễn hồ sơ ${name} và lịch sử học tập.`
        : `Đã khôi phục hồ sơ ${name}, toàn bộ điểm, huy hiệu và lịch sử học tập.`);
    } catch (err) { setError(describeProfileDeletionError(err)); }
    finally { setBusy(null); }
  };

  return (
    <div className="mb-5">
      <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}
        className="flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-800 hover:bg-orange-100">
        <span className="flex items-center gap-2"><Trash2 size={18}/> Thùng rác ({trashProfiles.length})</span>
        <span>{expanded ? 'Thu gọn ▲' : 'Xem hồ sơ ▼'}</span>
      </button>
      {(error || message) && <div role={error ? 'alert' : 'status'} className={`mt-3 rounded-xl p-3 text-sm font-semibold ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{error || message}</div>}
      {expanded && (
        <section aria-label="Thùng rác học sinh 30 ngày" className="mt-3 space-y-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <h3 className="flex items-center gap-2 font-black text-slate-800"><Clock3 size={18}/> Khôi phục trong 30 ngày</h3>
          {trashError && <p role="alert" className="rounded-xl bg-amber-100 p-3 text-sm text-amber-900">{trashError}</p>}
          {trashProfiles.length === 0 && <p className="text-sm text-slate-500">Chưa có hồ sơ nào trong Thùng rác.</p>}
          {trashProfiles.map(p => {
            const expires = trashExpiryMillis(p);
            const remaining = expires == null ? 0 : Math.ceil((expires - Date.now()) / 86400000);
            const expired = remaining <= 0;
            return (
              <article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-800">{p.displayName} · Lớp {p.grade}</div>
                  <p className={`text-xs font-semibold ${expired ? 'text-red-600' : 'text-amber-700'}`}>
                    {expired ? 'Hết thời hạn khôi phục · chờ dọn dữ liệu' : `Còn ${remaining} ngày để khôi phục`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Điểm và lịch sử vẫn được giữ nguyên trong thời hạn lưu.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={!!busy || expired} onClick={() => void action(p.id,p.displayName,false)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-40">
                    <RotateCcw size={14}/> Khôi phục
                  </button>
                  <button type="button" disabled={!!busy} onClick={() => void action(p.id,p.displayName,true)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">
                    Xóa vĩnh viễn
                  </button>
                </div>
              </article>
            );
          })}
          <p className="text-xs leading-relaxed text-amber-900">Hồ sơ quá hạn không thể khôi phục. Bản miễn phí dọn dữ liệu quá hạn khi phụ huynh mở Học Vui; không có tác vụ chạy khi website đóng.</p>
        </section>
      )}
    </div>
  );
};
