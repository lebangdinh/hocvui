import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Activity } from '../types';
import { SUBJECT_CONFIG } from '../constants/subjects';
import { format, startOfDay, subDays, isWithinInterval, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export const ReportModule: React.FC = () => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchActivities = async () => {
      if (!profile) return;
      setLoading(true);
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', profile.uid),
        where('profileId', '==', profile.id),
        orderBy('timestamp', 'desc')
      );
      
      try {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
        setActivities(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [profile]);

  const getFilteredData = () => {
    const now = new Date();
    let start: Date;

    switch (timeRange) {
      case 'day': start = startOfDay(now); break;
      case 'week': start = startOfWeek(now); break;
      case 'month': start = startOfMonth(now); break;
      case 'year': start = startOfYear(now); break;
    }

    const filtered = activities.filter(a => new Date(a.timestamp) >= start);
    
    // Group by subject
    interface GroupedData {
      name: string;
      score: number;
      count: number;
    }

    const grouped = filtered.reduce((acc, curr) => {
      const subject = SUBJECT_CONFIG[curr.subject]?.title || curr.subject;
      if (!acc[subject]) {
        acc[subject] = { name: subject, score: 0, count: 0 };
      }
      acc[subject].score += (curr.score / Math.max(1,curr.totalQuestions)) * 100;
      acc[subject].count += 1;
      return acc;
    }, {} as Record<string, GroupedData>);

    return (Object.values(grouped) as GroupedData[]).map(g => ({
      ...g,
      average: Math.round(g.score / g.count)
    }));
  };

  const getTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'dd/MM');
    }).reverse();

    return last7Days.map(dateStr => {
      const dayActivities = activities.filter(a => format(new Date(a.timestamp), 'dd/MM') === dateStr);
      const avgScore = dayActivities.length > 0 
        ? dayActivities.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / dayActivities.length
        : 0;
      return { date: dateStr, score: Math.round(avgScore) };
    });
  };

  if (loading) return <div className="p-8 text-center">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo học tập</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['day', 'week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Điểm trung bình theo môn</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Điểm TB (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Tiến độ 7 ngày qua</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                  name="Điểm TB (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
