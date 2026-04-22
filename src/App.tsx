import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { 
  Sparkles, 
  Trophy, 
  Timer, 
  Star, 
  RotateCcw, 
  Play, 
  List, 
  Music, 
  Zap, 
  Laugh, 
  BookOpen, 
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Upload,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  LogOut
} from 'lucide-react';
import { CHALLENGES as DEFAULT_CHALLENGES, Challenge, SOUND_EFFECTS, STUDENTS as DEFAULT_STUDENTS } from './constants';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  
  // Setup State
  const [isUploadingStudents, setIsUploadingStudents] = useState(false);
  const [isUploadingChallenges, setIsUploadingChallenges] = useState(false);
  const [studentFileLoaded, setStudentFileLoaded] = useState(false);
  const [challengeFileLoaded, setChallengeFileLoaded] = useState(false);
  const [studentFileName, setStudentFileName] = useState<string | null>(null);
  const [challengeFileName, setChallengeFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [challengeLimit, setChallengeLimit] = useState<number>(0);

  // Playing State
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [availableStudents, setAvailableStudents] = useState<string[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullList, setShowFullList] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  const playSound = (soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.play().catch(() => {});
  };

  const toggleMusic = () => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio(SOUND_EFFECTS.bgMusic);
      bgMusicRef.current.loop = true;
    }
    if (isMusicPlaying) {
      bgMusicRef.current.pause();
    } else {
      bgMusicRef.current.play().catch(() => {});
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const fireConfetti = (isFireworks = false) => {
    if (isFireworks) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let lastY: number | undefined;
      let text = '';
      for (const item of textContent.items as any) {
        if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
          text += '\n';
        }
        text += item.str;
        lastY = item.transform[5];
      }
      fullText += text + '\n';
    }
    return fullText;
  };

  const handleStudentUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setStudentFileName(file.name);
    setIsUploadingStudents(true);
    try {
      const text = await extractTextFromPDF(file);
      const parsedStudents = text.split(/[\n,;]/)
        .map(s => s.trim())
        .filter(s => s.length > 2 && !s.match(/^\d+\.?$/));
      
      if (parsedStudents.length > 0) {
        setStudents(parsedStudents);
        setStudentFileLoaded(true);
        playSound(SOUND_EFFECTS.generate);
      } else {
        setUploadError("Không tìm thấy tên học sinh trong file PDF.");
        setStudentFileLoaded(false);
      }
    } catch (error) {
      console.error("Error parsing students PDF:", error);
      setUploadError("Lỗi khi đọc file PDF học sinh.");
    } finally {
      setIsUploadingStudents(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleChallengeUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setChallengeFileName(file.name);
    setIsUploadingChallenges(true);
    try {
      const text = await extractTextFromPDF(file);
      
      // More robust parsing: look for numbers followed by . or ) or just a new line
      let newChallenges: Challenge[] = [];
      
      // Try splitting by numbered pattern first
      const parts = text.split(/(?:\n|^|\s{2,})\s*(\d+)[.)]\s+/);
      if (parts.length > 2) {
        for (let i = 1; i < parts.length; i += 2) {
          const idStr = parts[i];
          const contentRaw = parts[i + 1];
          if (contentRaw) {
            const content = contentRaw.trim().replace(/\s+/g, ' ');
            if (content.length > 3) {
              const timeMatch = content.match(/(\d+)\s*giây/);
              newChallenges.push({
                id: parseInt(idStr) || (newChallenges.length + 1),
                content,
                time: timeMatch ? `${timeMatch[1]} giây` : "15 giây",
                stars: Math.floor(Math.random() * 3) + 3,
                category: 'Funny',
                cheer: "Cố lên!",
                emojis: ["✨"]
              });
            }
          }
        }
      }

      // Fallback 1: Split by lines if no numbered items found
      if (newChallenges.length === 0) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10);
        lines.forEach((line, index) => {
          newChallenges.push({
            id: index + 1,
            content: line,
            time: "15 giây",
            stars: 3,
            category: 'Funny',
            cheer: "Cố lên!",
            emojis: ["✨"]
          });
        });
      }

      if (newChallenges.length > 0) {
        setChallenges(newChallenges);
        setChallengeFileLoaded(true);
        playSound(SOUND_EFFECTS.generate);
      } else {
        setUploadError("Không tìm thấy câu hỏi nào trong file PDF.");
        setChallengeFileLoaded(false);
      }
    } catch (error) {
      console.error("Error parsing challenges PDF:", error);
      setUploadError("Lỗi khi đọc file PDF câu hỏi.");
    } finally {
      setIsUploadingChallenges(false);
      e.target.value = ''; // Reset input
    }
  };

  const addManualChallenge = () => {
    const newId = challenges.length > 0 ? Math.max(...challenges.map(c => c.id)) + 1 : 1;
    setChallenges([...challenges, {
      id: newId,
      content: "Thử thách mới",
      time: "15 giây",
      stars: 3,
      category: 'Funny',
      cheer: "Cố lên!",
      emojis: ["✨"]
    }]);
    setChallengeFileLoaded(true);
  };

  const updateChallenge = (id: number, field: keyof Challenge, value: any) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const startGame = () => {
    const finalStudents = students.length > 0 ? students : DEFAULT_STUDENTS;
    let finalChallenges = challenges.length > 0 ? challenges : DEFAULT_CHALLENGES;
    
    if (challengeLimit > 0) {
      finalChallenges = finalChallenges.slice(0, challengeLimit);
    }
    
    setStudents(finalStudents);
    setChallenges(finalChallenges);
    setAvailableStudents([...finalStudents]);
    setAvailableChallenges([...finalChallenges]);
    setGameState('playing');
    playSound(SOUND_EFFECTS.click);
    fireConfetti();
  };

  const generateChallenge = () => {
    if (availableChallenges.length === 0 && currentChallenge !== null) {
      setGameState('finished');
      playSound(SOUND_EFFECTS.end);
      fireConfetti(true);
      return;
    }

    if (availableStudents.length === 0) {
      setAvailableStudents([...students]);
      playSound(SOUND_EFFECTS.click);
      return;
    }

    // Determine challenge pool
    let pool = availableChallenges;
    if (pool.length === 0) {
      pool = challenges;
    }

    playSound(SOUND_EFFECTS.upbeat);
    setIsGenerating(true);
    setCurrentChallenge(null);
    setSelectedStudent(null);
    setTimeLeft(null);
    if (timerRef.current) clearInterval(timerRef.current);

    let revealCount = 0;
    const revealInterval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * availableStudents.length);
      setSelectedStudent(availableStudents[tempIndex]);
      revealCount++;
      if (revealCount >= 10) clearInterval(revealInterval);
    }, 80);

    setTimeout(() => {
      const randomChallengeIndex = Math.floor(Math.random() * pool.length);
      const randomStudentIndex = Math.floor(Math.random() * availableStudents.length);
      
      const challenge = pool[randomChallengeIndex];
      const student = availableStudents[randomStudentIndex];
      
      setCurrentChallenge(challenge);
      setSelectedStudent(student);
      
      // Update available lists
      setAvailableStudents(prev => prev.filter(s => s !== student));
      setAvailableChallenges(() => {
        const baseList = availableChallenges.length === 0 ? challenges : availableChallenges;
        return baseList.filter(c => c.id !== challenge.id);
      });

      setIsGenerating(false);
      playSound(SOUND_EFFECTS.generate);
      fireConfetti(true);
    }, 800);
  };

  const startTimer = (timeStr: string) => {
    playSound(SOUND_EFFECTS.click);
    const seconds = parseInt(timeStr.split(' ')[0]);
    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          playSound(SOUND_EFFECTS.end);
          fireConfetti(true);
          return 0;
        }
        playSound(SOUND_EFFECTS.tick);
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bgMusicRef.current) bgMusicRef.current.pause();
    };
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Arts': return <Music className="w-5 h-5 text-pink-500" />;
      case 'Reflex': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Funny': return <Laugh className="w-5 h-5 text-orange-500" />;
      case 'Knowledge': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Communication': return <MessageCircle className="w-5 h-5 text-green-500" />;
      default: return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>CÀI ĐẶT TRÒ CHƠI</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-emerald-600 uppercase tracking-tight">
              Chuẩn bị thử thách
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload Section */}
            <div className="space-y-6">
              <div className="glass-card rounded-3xl p-8 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Danh sách học sinh</h3>
                    <p className="text-sm text-slate-500">Tải file PDF chứa tên học sinh</p>
                  </div>
                </div>
                
                <label className="relative flex flex-col items-center justify-center w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-all group">
                  <input type="file" accept=".pdf" className="hidden" onChange={handleStudentUpload} />
                  {isUploadingStudents ? (
                    <RotateCcw className="w-8 h-8 text-indigo-600 animate-spin" />
                  ) : studentFileLoaded ? (
                    <div className="flex flex-col items-center text-indigo-600 bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-full relative group">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setStudentFileLoaded(false);
                          setStudentFileName(null);
                          setStudents([]);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors cursor-pointer z-10"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="font-bold text-slate-700">Đã tải danh sách hs ({students.length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-xs w-full">
                        <FileText className="w-4 h-4 shrink-0 text-indigo-400" />
                        <span className="truncate font-medium">{studentFileName}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                      <span className="text-sm font-medium text-slate-500">Nhấn để chọn file PDF</span>
                    </>
                  )}
                </label>
              </div>

              <div className="glass-card rounded-3xl p-8 border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Danh sách câu hỏi</h3>
                    <p className="text-sm text-slate-500">Tải file PDF chứa các thử thách</p>
                  </div>
                </div>
                
                <label className="relative flex flex-col items-center justify-center w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-all group">
                  <input type="file" accept=".pdf" className="hidden" onChange={handleChallengeUpload} />
                  {isUploadingChallenges ? (
                    <RotateCcw className="w-8 h-8 text-purple-600 animate-spin" />
                  ) : challengeFileLoaded ? (
                    <div className="flex flex-col items-center text-indigo-600 bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-full relative group">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setChallengeFileLoaded(false);
                          setChallengeFileName(null);
                          setChallenges([]);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors cursor-pointer z-10"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="font-bold text-slate-700">Đã tải danh sách câu hỏi ({challenges.length})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-xs w-full">
                        <FileText className="w-4 h-4 shrink-0 text-indigo-400" />
                        <span className="truncate font-medium">{challengeFileName}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-2 transition-colors" />
                      <span className="text-sm font-medium text-slate-500">Nhấn để chọn file PDF</span>
                    </>
                  )}
                </label>
              </div>

              <div className="glass-card rounded-3xl p-8 border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Số lượng thử thách</h3>
                    <p className="text-xs text-slate-500">Giới hạn số câu hỏi cho lượt chơi này</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max={challenges.length > 0 ? challenges.length : 50} 
                    value={challengeLimit} 
                    onChange={(e) => setChallengeLimit(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max={challenges.length > 0 ? challenges.length : 100}
                      value={challengeLimit} 
                      onChange={(e) => setChallengeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 px-2 py-1 text-center font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase">Câu</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium">
                  * 0 = Sử dụng tất cả câu hỏi ({challenges.length > 0 ? challenges.length : 'Mặc định'})
                </p>
              </div>

              {uploadError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGame}
                className="w-full py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-display font-bold text-xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 group cursor-pointer"
              >
                BẮT ĐẦU TRÒ CHƠI
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Right: Preview Section */}
            <div className="glass-card rounded-3xl p-8 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-600" />
                  Xem trước thử thách
                </h3>
                <div className="flex items-center gap-2">
                  {challengeFileLoaded && (
                    <button 
                      onClick={addManualChallenge}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Thêm mới
                    </button>
                  )}
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                    {challenges.length} CÂU HỎI
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {challenges.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <FileText className="w-12 h-12 mb-4" />
                    <p className="font-medium">Chưa có câu hỏi nào được tải</p>
                  </div>
                ) : (
                  challenges.map((c, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={c.id} 
                      className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group/item"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          #{c.id}
                        </span>
                        <div className="flex-1 space-y-3">
                          <textarea
                            value={c.content}
                            onChange={(e) => updateChallenge(c.id, 'content', e.target.value)}
                            className="w-full text-slate-700 font-medium leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none custom-scrollbar cursor-text"
                            rows={2}
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                              <Timer className="w-3 h-3 text-indigo-600" />
                              <input 
                                type="text"
                                value={c.time}
                                onChange={(e) => updateChallenge(c.id, 'time', e.target.value)}
                                className="w-16 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-transparent border-none focus:ring-0 p-0 cursor-text"
                              />
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, starIdx) => (
                                <button
                                  key={starIdx}
                                  onClick={() => updateChallenge(c.id, 'stars', starIdx + 1)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                  <Star 
                                    className={`w-3.5 h-3.5 ${starIdx < c.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-600 to-purple-700 font-sans flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 md:p-16 max-w-xl w-full text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-400 via-orange-500 to-red-500"></div>
          
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 rounded-3xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-orange-200 border-4 border-white"
          >
            <Trophy className="w-14 h-14 drop-shadow-md" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-4 uppercase tracking-tight">
            Kết thúc trò chơi
          </h1>
          
          <p className="text-slate-500 mb-12 text-lg md:text-xl font-medium leading-relaxed">
            Bạn đã hoàn thành tất cả các thử thách!<br/>
            <span className="text-indigo-600 font-bold">Chúc mừng cả lớp mình! 🥳</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setGameState('setup');
                setStudentFileLoaded(false);
                setChallengeFileLoaded(false);
                setStudentFileName(null);
                setChallengeFileName(null);
                setStudents([]);
                setChallenges([]);
                setAvailableChallenges([]);
                setTimeLeft(null);
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
              }}
              className="py-4 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-display font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Cài đặt lại
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-display font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Thoát khỏi trò chơi
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="relative overflow-hidden bg-indigo-600 py-12 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6 gap-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setGameState('setup');
                setStudentFileLoaded(false);
                setChallengeFileLoaded(false);
                setStudentFileName(null);
                setChallengeFileName(null);
                setStudents([]);
                setChallenges([]);
                setAvailableChallenges([]);
                setTimeLeft(null);
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
              }}
              className="p-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Cài đặt lại
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={toggleMusic}
              className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title={isMusicPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
            >
              {isMusicPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <Music className="w-4 h-4 opacity-50" />}
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl md:text-5xl font-display font-extrabold text-white mb-4 tracking-tight uppercase"
          >
            Thử thách siêu vui
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-100 text-lg md:text-xl font-medium"
          >
            Gắn kết lớp mình – Vui vẻ mỗi ngày!
          </motion.p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-10">
        {/* Generator Section */}
        <section className="glass-card rounded-3xl p-8 mb-12 relative z-10">
          <div className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateChallenge}
              disabled={isGenerating}
              className={`
                relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-xl shadow-lg transition-all cursor-pointer
                ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-200'}
              `}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-6 h-6 animate-spin" />
                  Đang tạo...
                </>
              ) : availableChallenges.length === 0 && currentChallenge !== null ? (
                <>
                  <Trophy className="w-6 h-6" />
                  Kết thúc
                </>
              ) : availableStudents.length === 0 ? (
                <>
                  <RotateCcw className="w-6 h-6" />
                  Làm mới HS
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Tạo thử thách
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { type: "spring", damping: 10 }
                  }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  className="mt-6 flex flex-col items-center w-full"
                >
                  <div className="flex flex-col gap-2 w-full max-w-md mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Học sinh:</p>
                      <div className="flex items-center gap-1.5 px-3 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          Còn lại: {availableStudents.length} / {students.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Câu hỏi:</p>
                      <div className="flex items-center gap-1.5 px-3 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          Còn lại: {availableChallenges.length === 0 && currentChallenge ? 0 : (availableChallenges.length || challenges.length)} / {challenges.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    animate={isGenerating ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : { 
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: isGenerating ? 0.2 : 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="px-8 py-3 bg-linear-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-200 border-2 border-white"
                  >
                    <span className="text-2xl font-display font-black text-white drop-shadow-sm">
                      ✨ {selectedStudent} ✨
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {currentChallenge && (
                <motion.div
                  key={currentChallenge.id}
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.8, y: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    duration: 0.6
                  }}
                  className="mt-10 w-full perspective-1000"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div className="relative bg-white rounded-3xl p-6 md:p-10 border border-indigo-100 shadow-2xl overflow-hidden">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-4 right-4 pointer-events-none"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-400/30 animate-pulse" />
                      </motion.div>

                      <div className="flex items-center justify-between mb-8">
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm"
                        >
                          {getCategoryIcon(currentChallenge.category)}
                          <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                            {currentChallenge.category}
                          </span>
                        </motion.div>
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-1.5"
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < currentChallenge.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-10 leading-tight text-center md:text-left">
                          <span className="inline-block mr-2 text-4xl">🎯</span>
                          <span className="bg-clip-text text-transparent bg-linear-to-br from-slate-900 to-slate-600">
                            {currentChallenge.content}
                          </span>
                        </h2>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 group/timer"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover/timer:scale-110 transition-transform">
                            <Timer className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Thời gian</p>
                            <p className="text-xl font-bold text-slate-800">⏱ {currentChallenge.time}</p>
                          </div>
                          <div className="flex items-center">
                            {timeLeft !== null ? (
                              <div className={`text-4xl font-black tabular-nums ${timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-indigo-600'}`}>
                                {timeLeft}s
                              </div>
                            ) : (
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => startTimer(currentChallenge.time)}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 uppercase tracking-wider cursor-pointer"
                              >
                                Bắt đầu
                              </motion.button>
                            )}
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 group/emoji overflow-hidden relative"
                        >
                          <div className="flex gap-4">
                            {currentChallenge.emojis.map((emoji, index) => (
                              <motion.span 
                                key={index}
                                animate={{ 
                                  rotate: index % 2 === 0 ? [0, 20, -20, 0] : [0, -20, 20, 0],
                                  y: [0, -10, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                  repeat: Infinity, 
                                  duration: 1.5 + (index * 0.2),
                                  delay: index * 0.1
                                }}
                                className="text-4xl"
                              >
                                {emoji}
                              </motion.span>
                            ))}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cổ vũ nhiệt tình!</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!currentChallenge && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 text-center text-slate-400"
              >
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Nhấn nút để nhận thử thách ngẫu nhiên!</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 text-center text-slate-400 text-sm">
        <p>© 2026 AI Challenge Generator • Dành cho lớp học sáng tạo</p>
      </footer>
    </div>
  );
}
