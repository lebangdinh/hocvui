import React from 'react';
import { useAuth } from '../AuthContext';
import { awardGamePoints } from '../services/progressLedger';

export function useGameReward() {
  const { profile } = useAuth();
  const [status, setStatus] = React.useState('');
  const claimed = React.useRef(false);
  const generation = React.useRef(0);
  React.useEffect(() => () => { generation.current++; }, []);
  const reset = () => { claimed.current = false; generation.current++; setStatus(''); };
  const award = async (points: number, badge?: string) => {
    if (claimed.current || !profile) return;
    claimed.current = true;
    const request = generation.current;
    setStatus('Đang lưu sao trò chơi…');
    try {
      await awardGamePoints(profile.id, points, badge);
      if (request === generation.current) setStatus(`Đã lưu ${points} sao trò chơi.`);
    } catch {
      if (request === generation.current) setStatus('Chưa xác nhận lưu sao trò chơi. Kiểm tra mạng và số sao trong hồ sơ.');
    }
  };
  return { award, reset, status };
}
