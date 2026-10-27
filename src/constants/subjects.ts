import { Calculator, BookOpen, Languages, FlaskConical, Globe, Monitor, HeartHandshake, Sprout, Dumbbell, Palette, Sparkles } from 'lucide-react';
import { Subject } from '../types';

export interface SubjectConfig {
  title: string;
  icon: any;
  color: string;
  hoverColor: string;
  description: string;
  relatedGames: string[];
}
export const SUBJECT_CONFIG: Record<Subject, SubjectConfig> = {
  math: {title:'Toán', icon:Calculator,color:'bg-blue-500',hoverColor:'hover:bg-blue-600',description:'Khám phá những con số và phép tính.',relatedGames:['puzzle','memory']},
  vietnamese: {title:'Tiếng Việt',icon:BookOpen,color:'bg-orange-500',hoverColor:'hover:bg-orange-600',description:'Đọc, viết và kể những câu chuyện hay.',relatedGames:['memory']},
  english: {title:'Tiếng Anh',icon:Languages,color:'bg-green-500',hoverColor:'hover:bg-green-600',description:'Học nghe, nói, đọc, viết theo lớp.',relatedGames:['memory']},
  ethics: {title:'Đạo đức',icon:HeartHandshake,color:'bg-pink-500',hoverColor:'hover:bg-pink-600',description:'Biết yêu thương và cư xử đúng mực.',relatedGames:['memory']},
  nature: {title:'Tự nhiên và Xã hội',icon:Sprout,color:'bg-teal-500',hoverColor:'hover:bg-teal-600',description:'Tìm hiểu môi trường quanh em (lớp 1–3).',relatedGames:['memory']},
  science: {title:'Khoa học',icon:FlaskConical,color:'bg-purple-500',hoverColor:'hover:bg-purple-600',description:'Khám phá thế giới tự nhiên (lớp 4–5).',relatedGames:['chicken','airplane']},
  history_geo: {title:'Lịch sử và Địa lí',icon:Globe,color:'bg-red-500',hoverColor:'hover:bg-red-600',description:'Hiểu đất nước và lịch sử (lớp 4–5).',relatedGames:['racing']},
  it: {title:'Tin học và Công nghệ',icon:Monitor,color:'bg-indigo-500',hoverColor:'hover:bg-indigo-600',description:'Sử dụng công nghệ an toàn (lớp 3–5).',relatedGames:['tank']},
  physical: {title:'Giáo dục thể chất',icon:Dumbbell,color:'bg-lime-600',hoverColor:'hover:bg-lime-700',description:'Rèn luyện thân thể, an toàn vận động.',relatedGames:['racing']},
  arts: {title:'Nghệ thuật',icon:Palette,color:'bg-fuchsia-500',hoverColor:'hover:bg-fuchsia-600',description:'Âm nhạc và Mĩ thuật.',relatedGames:['puzzle']},
  experiential: {title:'Hoạt động trải nghiệm',icon:Sparkles,color:'bg-amber-500',hoverColor:'hover:bg-amber-600',description:'Khám phá bản thân và cộng đồng.',relatedGames:['memory']}
};
