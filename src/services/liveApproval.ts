import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import fingerprint from '../../content/bank-fingerprint.json';

/** Browser displays only server-published approvals with an identical version hash. */
export function useTopicApproval(topicId?: string): boolean {
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    setApproved(false);
    if (!topicId) return;
    const unsub = onSnapshot(doc(db, 'contentApprovals', topicId), snapshot => {
      const data = snapshot.data();
      setApproved(data?.status === 'approved' && data.fingerprint === fingerprint.hash &&
        typeof data.reviewedBy === 'string' && typeof data.evidenceId === 'string');
    }, () => setApproved(false));
    return () => unsub();
  }, [topicId]);
  return approved;
}
