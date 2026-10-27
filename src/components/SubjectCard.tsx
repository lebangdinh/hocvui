import React from 'react';
import { motion } from 'motion/react';
import { Subject } from '../types';
import { SUBJECT_CONFIG } from '../constants/subjects';
import { getSubjectAvailability } from '../constants/curriculum';
import { useAuth } from '../AuthContext';

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const { profile } = useAuth();
  const config = SUBJECT_CONFIG[subject];
  const Icon = config.icon;

  const subjectPoints = profile?.subjectPoints?.[subject] || 0;
  const level = Math.floor(subjectPoints / 100) + 1;
  const progress = (subjectPoints % 100);

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${config.color} ${config.hoverColor} text-white p-6 rounded-[32px] shadow-lg flex flex-col items-center text-center gap-4 transition-all w-full relative overflow-hidden group`}
    >
      <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
        {getSubjectAvailability(profile?.grade || 2, subject) === 'optional' ? 'Tự chọn · ' : ''}Cấp {level}
      </div>
      
      <div className="bg-white/20 p-5 rounded-3xl group-hover:scale-110 transition-transform duration-300">
        <Icon size={48} />
      </div>
      
      <div>
        <h3 className="text-2xl font-black">{config.title}</h3>
        <p className="text-sm opacity-80 mt-1 font-medium">{config.description}</p>
      </div>

      <div className="w-full mt-2">
        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white"
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-bold opacity-70">
          <span>Tiến độ</span>
          <span>{progress}%</span>
        </div>
      </div>
    </motion.button>
  );
};
