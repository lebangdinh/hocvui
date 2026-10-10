import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, query, where, getDocsFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import type { Activity } from '../types';
import { SUBJECT_CONFIG } from '../constants/subjects';
import { buildLearningReport, type ReportRange } from '../services/learningReport';

export const ReportModule: React.FC = () => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [timeRange, setTimeRange] = useState<ReportRange>('week');
  const [reload, setReload] = useState(0);
  const [loadedAt, setLoadedAt] = useState(new Date());

  useEffect(() => {
    let cancelled = false;
    setActivities([]);
    setLoadError('');
    setLoading(true);
    const fetchActivities = async () => {
      if (!profile) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const snapshot = await getDocsFromServer(query(
          collection(db, 'activities'),
          where('userId', '==', profile.uid)
        ));
        if (cancelled) return;
        const data = snapshot.docs
          .map(item => ({ ...item.data(), id: item.id } as Activity))
          .filter(item => item.profileId === profile.id);
        setActivities(data);
        setLoadedAt(new Date());
      } catch (error) {
        if (cancelled) return;
        const code = error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: unknown }).code) : '';
        setLoadError(code === 'permission-denied'
          ? 'Tài khoản hiện chưa có quyền đọc lịch sử của bé.'
          : 'Không tải được lịch sử học tập. Hãy kiểm tra mạng rồi thử lại.');
        console.warn('Report load failed:', code || 'unknown');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchActivities();
    return () => { cancelled = true; };
  }, [profile?.uid, profile?.id, reload]);

  if (loading) return <div role="status" className="p-8 text-center">Đang tải báo cáo...</div>;
  if (loadError) return (
    <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="mb-3 text-sm font-semibold text-amber-900">{loadError}</p>
      <button type="button" onClick={() => setReload(n => n + 1)} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white">Tải lại báo cáo</button>
    </div>
  );
  if (!profile) return <p className="p-8 text-center">Chọn hồ sơ bé để xem báo cáo.</p>;
  const report = buildLearningReport(activities, profile, timeRange, loadedAt);
  const chartSubjects = report.subjects.map(s => ({ ...s, name: SUBJECT_CONFIG[s.subject].title }));
  const dateLabel = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Báo cáo của {profile.displayName}</h2>
          <p className="mt-1 text-xs text-gray-500">{dateLabel(report.start)} – {dateLabel(report.today)} · Giờ Việt Nam · Tuần bắt đầu thứ Hai</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl" role="group" aria-label="Khoảng thời gian báo cáo">
            {(['day', 'week', 'month', 'year'] as const).map(range => (
              <button key={range} type="button" aria-pressed={timeRange === range} onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${timeRange === range ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
                {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setReload(n => n + 1)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Cập nhật</button>
        </div>
      </div>
      {report.count === 0 ? (
        <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-gray-800">Chưa có bài học đã lưu trong khoảng này</h3>
          <p className="mt-2 text-sm text-gray-600">Anh/chị có thể chọn khoảng thời gian khác. Kết quả sẽ xuất hiện khi bé hoàn thành bài và lưu thành công.</p>
        </div>
      ) : <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Lượt học đã lưu', report.count], ['Ngày có học', report.activeDays],
            ['Câu trả lời đúng', `${report.correct}/${report.total}`], ['Tỷ lệ đúng', `${report.accuracy}%`]
          ].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl bg-white border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-1 break-words text-2xl font-black text-blue-700">{value}</p>
          </div>)}
        </div>
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-bold text-lg text-blue-900">Nhận xét từ kết quả đã lưu</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">Trong khoảng đã chọn, bé hoàn thành {report.count} lượt học ở {report.subjects.length} môn, trả lời đúng {report.correct}/{report.total} câu ({report.accuracy}%).</p>
          {report.count < 3 && <p className="mt-2 text-sm text-amber-900">Mới có {report.count} lượt học: chưa đủ dữ liệu để nhận xét ổn định về từng chủ đề.</p>}
          {report.reviewTopics.length > 0 ? <div className="mt-3 space-y-3">
            {report.reviewTopics.map(t => <div key={`${t.grade}-${t.subject}-${t.name}`} className="rounded-xl bg-white p-3 text-sm">
              <p className="font-bold text-gray-800">Nên ôn thêm: {t.name} · {SUBJECT_CONFIG[t.subject].title} lớp {t.grade}</p>
              <p className="mt-1 text-gray-600">Đúng {t.correct}/{t.total} câu ({t.accuracy}%) qua {t.count} lượt. Gợi ý: cùng bé xem lại câu sai, rồi luyện thêm một lượt ở mức dễ.</p>
            </div>)}
          </div> : <p className="mt-2 text-sm text-gray-700">{report.topics.some(t => t.count >= 3)
            ? 'Các chủ đề có ít nhất 3 lượt đều đạt từ 80% câu đúng trong khoảng này. Bé có thể tiếp tục luyện tập; đây chưa phải kết luận đã thành thạo.'
            : 'Chưa có chủ đề nào đủ 3 lượt để đề xuất ưu tiên ôn. Trước mắt, phụ huynh có thể cùng bé xem lại các câu sai bên dưới.'}</p>}
          <p className="mt-3 text-xs text-gray-500">Ưu tiên ôn khi chủ đề có ít nhất 3 lượt và tỷ lệ đúng dưới 80%. Các lượt có thể khác độ khó; kết quả luyện tập không thay thế đánh giá của giáo viên.</p>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="min-w-0 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Tỷ lệ đúng theo môn</h3>
            <div style={{ height: Math.max(220, chartSubjects.length * 50) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSubjects} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11 }} />
                  <Tooltip /><Bar dataKey="accuracy" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Tỷ lệ đúng (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="min-w-0 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Tỷ lệ đúng {timeRange === 'year' ? 'theo tháng' : 'theo ngày'}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.timeline} margin={{ left: -15, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={20} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip /><Line type="linear" dataKey="accuracy" connectNulls={false} stroke="#059669" strokeWidth={3} dot={{ r: 4 }} name="Tỷ lệ đúng (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-gray-500">Khoảng trống là ngày/tháng không có bài đã lưu, không phải điểm 0. Tỷ lệ đúng = tổng câu đúng ÷ tổng câu đã làm.</p>
          </section>
        </div>
        <details className="rounded-3xl bg-white border border-gray-100 p-5">
          <summary className="cursor-pointer font-bold text-gray-800">Chi tiết theo môn · {report.subjects.length} môn</summary>
          <div className="mt-3 space-y-2">
            {report.subjects.map(s => <div key={s.subject} className="flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
              <span className="font-bold">{SUBJECT_CONFIG[s.subject].title}</span><span>{s.count} lượt · {s.correct}/{s.total} câu đúng · {s.accuracy}%</span>
            </div>)}
          </div>
        </details>
        <section className="rounded-3xl bg-white border border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-800">Cùng bé xem lại câu sai</h3>
          <p className="mt-1 text-xs text-gray-500">Tối đa 5 câu khác nhau gần nhất trong khoảng đã chọn. Đáp án bên dưới lấy từ bài đã lưu.</p>
          {report.recentMistakes.length ? <div className="mt-3 space-y-2">{report.recentMistakes.map((q, i) => <details key={i} className="rounded-xl border border-orange-100 bg-orange-50 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800 break-words">{q.text}</summary>
            <div className="mt-2 space-y-1 text-sm break-words">
              <p className="text-xs text-gray-500">{SUBJECT_CONFIG[q.subject].title} · Lớp {q.grade}</p>
              <p>Bé đã chọn: {q.userAnswer || 'Chưa trả lời'}</p>
              <p className="font-semibold text-green-800">Đáp án trong bài: {q.correctAnswer}</p>
            </div>
          </details>)}</div> : <p className="mt-3 text-sm text-gray-600">Chưa có chi tiết câu sai được lưu trong khoảng này.</p>}
        </section>
      </>}
    </div>
  );
};
