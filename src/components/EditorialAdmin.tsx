import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase';
import { useAuth } from '../AuthContext';
import queue from '../../content/alignment-review-queue.json';
import fingerprint from '../../content/bank-fingerprint.json';
import { getEditorialPreview } from '../services/questionBank';
import type { Subject } from '../types';

/** Staff-only frontend convenience; real permission checks run in Functions and Firestore rules. */
export function EditorialAdmin() {
  const { role } = useAuth();
  const [topicId, setTopicId] = useState('1-math-1');
  const [reviewerName, setReviewerName] = useState('');
  const [evidenceId, setEvidenceId] = useState('');
  const [lesson, setLesson] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reviewChecklist, setReviewChecklist] = useState({eachQuestionChecked:false,answersVerified:false,curriculumMatched:false});
  const [learningOutcome, setLearningOutcome] = useState('');
  const [outcomeSource, setOutcomeSource] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [current, setCurrent] = useState<Record<string, any>>({});
  const eligible = queue.items.filter(x => x.questionMode === 'local_bank');
  const selected = eligible.find(x => x.topicId === topicId);
  const preview = useMemo(()=>selected ? getEditorialPreview(selected.grade, selected.subject as Subject,topicId) : [],[selected,topicId]);
  const approved = current[topicId]?.status === 'approved' && current[topicId]?.fingerprint === fingerprint.hash;
  useEffect(() => {
    if (role !== 'admin' && role !== 'reviewer') return;
    getDocs(collection(db, 'contentApprovals')).then(s => {
      setCurrent(Object.fromEntries(s.docs.map(d => [d.id,d.data()])));
    }).catch(() => setNotice('Không đọc được hồ sơ duyệt. Kiểm tra quyền truy cập.'));
  }, [role]);
  if (role !== 'admin' && role !== 'reviewer') return null;
  const act = async (action:'approve'|'revoke') => {
    setSaving(true); setNotice('');
    try {
      const callable = httpsCallable<any,{ok:boolean}>(functions,'reviewCurriculumTopic');
      await callable({topicId, action, reviewerName, evidenceId, evidenceUrl, lesson, learningOutcome, outcomeSource, reviewChecklist, reason});
      const refresh = await getDocs(collection(db,'contentApprovals'));
      setCurrent(Object.fromEntries(refresh.docs.map(d => [d.id,d.data()])));
      setNotice(action === 'approve' ? 'Đã ghi hồ sơ duyệt lên Firebase.' : 'Đã thu hồi duyệt và ghi nhật ký.');
    } catch (e) { setNotice(`Không thực hiện được: ${e instanceof Error ? e.message : 'lỗi không xác định'}`); }
    finally {setSaving(false);}
  };
  return <section className="mx-auto max-w-3xl rounded-3xl border border-indigo-200 bg-white p-6 space-y-4">
    <h2 className="text-2xl font-black text-indigo-800">Quản trị học liệu · {role === 'admin' ? 'Quản trị viên' : 'Người duyệt'}</h2>
    <p className="text-sm text-slate-600">Duyệt chỉ sau khi giáo viên đã đối chiếu từng câu, đáp án, yêu cầu cần đạt và bài SGK gốc. Không tự duyệt câu hỏi do AI sinh.</p>
    <div className="rounded-lg bg-amber-50 text-amber-900 p-3 text-sm">Bản học liệu: {fingerprint.hash.slice(0,12)}. Sửa ngân hàng câu hỏi sẽ làm hết hiệu lực duyệt cũ.</div>
    <label className="block font-bold">Chủ đề<select className="mt-2 block w-full rounded-lg border p-3" value={topicId} onChange={e=>{setTopicId(e.target.value);setReviewChecklist({eachQuestionChecked:false,answersVerified:false,curriculumMatched:false});setNotice('');}}>{eligible.map(x=><option key={x.topicId} value={x.topicId}>{x.grade} · {x.subject} · {x.topicName}</option>)}</select></label>
    <div className="text-sm">Trạng thái: <b>{approved ? 'Đã có hồ sơ duyệt đúng phiên bản' : 'Chưa duyệt / hết hiệu lực'}</b></div>
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{selected?.scope}</div>
    <details className="rounded-xl border p-3" open>
      <summary className="font-bold cursor-pointer">Danh sách câu hỏi cần kiểm duyệt ({preview.length} {selected?.subject === 'math' ? 'câu mẫu do thuật toán sinh' : 'câu hỏi tĩnh'})</summary>
      {selected?.subject === 'math' && <p className="my-3 text-sm text-amber-800">Toán sinh đề vô hạn: 20 mẫu sau đây chỉ là ví dụ. Giáo viên phải kiểm tra thêm thuật toán, phạm vi và lời giải.</p>}
      <ol className="mt-3 space-y-3 list-decimal pl-5">{preview.map((q,i)=><li key={`${q.id}-${i}`} className="rounded-lg bg-slate-50 p-3 text-sm">
        <div className="font-bold">{q.text}</div><div>Đáp án: <strong>{q.correctAnswer}</strong></div>
        <div className="text-slate-600">Lựa chọn: {q.options.join(' · ')}</div><div className="text-slate-600">Giải thích: {q.explanation}</div>
      </li>)}</ol>
    </details>
    {[['Tên giáo viên/người duyệt',reviewerName,setReviewerName],['Mã biên bản / minh chứng',evidenceId,setEvidenceId],['Liên kết minh chứng HTTPS',evidenceUrl,setEvidenceUrl],['Tên bài SGK đã đối chiếu',lesson,setLesson],['Yêu cầu cần đạt đã xác minh',learningOutcome,setLearningOutcome],['URL nguồn chuẩn HTTPS',outcomeSource,setOutcomeSource],['Lý do thu hồi',reason,setReason]].map(([label,value,setter])=><label key={label as string} className="block text-sm font-semibold">{label as string}<input className="mt-1 w-full rounded-lg border p-3" value={value as string} onChange={e=>(setter as (s:string)=>void)(e.target.value)} /></label>)}
    <fieldset className="rounded-lg border border-amber-300 p-3 text-sm space-y-2"><legend className="font-bold">Xác nhận đã thẩm định thủ công</legend>
      {([['eachQuestionChecked','Đã đọc từng câu hỏi và lời giải'],['answersVerified','Đã đối chiếu từng đáp án'],['curriculumMatched','Đã đối chiếu yêu cầu cần đạt với sách/chương trình']] as const).map(([key,label]) => <label key={key} className="flex gap-2 items-start"><input type="checkbox" checked={reviewChecklist[key]} onChange={e=>setReviewChecklist(old=>({...old,[key]:e.target.checked}))} />{label}</label>)}
    </fieldset>
    {notice && <p role="status" className="rounded-lg bg-indigo-50 p-3 text-sm">{notice}</p>}
    <div className="flex flex-wrap gap-3"><button disabled={saving || !Object.values(reviewChecklist).every(Boolean)} onClick={()=>act('approve')} className="rounded-lg bg-indigo-700 text-white px-5 py-3 disabled:opacity-50">Phê duyệt</button><button disabled={saving} onClick={()=>act('revoke')} className="rounded-lg bg-rose-700 text-white px-5 py-3 disabled:opacity-50">Thu hồi</button></div>
  </section>;
}
