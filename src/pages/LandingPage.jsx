import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Volume2,
  RotateCw,
  Brain,
  Gamepad2,
  Flame,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Layers,
  Bot,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEMO_CARDS = [
  {
    word: 'sustainable',
    ipa: '/səˈsteɪnəbl/',
    pos: 'adj',
    tag: 'IELTS Band 7.0+',
    meaning: 'bền vững, thân thiện với môi trường lâu dài',
    example: 'Governments must promote sustainable energy sources like solar and wind.',
    exampleVi: 'Các chính phủ phải thúc đẩy các nguồn năng lượng bền vững như mặt trời và gió.',
  },
  {
    word: 'negotiate',
    ipa: '/nɪˈɡəʊʃieɪt/',
    pos: 'v',
    tag: 'TOEIC 650+',
    meaning: 'đàm phán, thương lượng hợp đồng',
    example: 'We need to negotiate a better price with our overseas supplier.',
    exampleVi: 'Chúng ta cần đàm phán một mức giá tốt hơn với nhà cung cấp nước ngoài.',
  },
  {
    word: 'enthusiastic',
    ipa: '/ɪnˌθjuːziˈæstɪk/',
    pos: 'adj',
    tag: 'THPT Quốc Gia',
    meaning: 'nhiệt tình, hào hứng, say mê',
    example: 'The students were very enthusiastic about the volunteer campaign.',
    exampleVi: 'Các bạn học sinh rất hào hứng với chiến dịch tình nguyện.',
  },
];

const REVIEWS = [
  {
    name: 'Minh Anh (IELTS 8.0)',
    avatar: '🐉',
    text: 'Nhờ thuật toán SRS nhắc ôn đúng lúc sắp quên, mình đã nhớ hơn 1.200 từ Academic cho kỳ thi IELTS mà không cần học vẹt!',
  },
  {
    name: 'Hoàng Nam (865 TOEIC)',
    avatar: '🐱',
    text: '6 chế độ game cực cuốn! Nhất là chế độ Nghe & Viết giúp mình cải thiện cả Listening Part 1-2 và nhớ mặt chữ Part 5.',
  },
  {
    name: 'Thảo Nguyên (Lớp 12)',
    avatar: '🧙‍♂️',
    text: 'Tính năng giữ chuỗi Streak chung với bạn thân và đổi xu mua giao diện Hoa Anh Đào rơi làm mình có động lực vào học mỗi tối.',
  },
  {
    name: 'Đức Thịnh (Software Engineer)',
    avatar: '🧑‍🚀',
    text: 'Tính năng AI tạo bộ từ theo chủ đề quá tiện, gõ chủ đề Phỏng vấn IT là có ngay bộ flashcard kèm phiên âm và câu ví dụ chuẩn.',
  },
];

const FAQS = [
  {
    q: 'Luyện Từ có miễn phí không?',
    a: 'Có! Bạn có thể học từ vựng, ôn tập thông minh với thuật toán Spaced Repetition (SRS), tạo bộ từ bằng AI và chơi 6 chế độ game hoàn toàn miễn phí trên Luyện Từ.',
  },
  {
    q: 'Phương pháp Spaced Repetition (SRS) hoạt động như thế nào?',
    a: 'Thay vì học nhồi nhét hàng trăm từ một lúc rồi quên sạch, hệ thống sẽ phân loại từ vựng từ Level 1 đến Level 5 và tự động tính toán thời điểm bạn sắp quên (1 ngày, 3 ngày, 7 ngày, 14 ngày) để nhắc bạn ôn tập.',
  },
  {
    q: 'Luyện Từ có lộ trình cho người ôn thi TOEIC, IELTS và THPT không?',
    a: 'Có đầy đủ! Nền tảng tích hợp sẵn các bộ từ vựng chuẩn hóa: TOEIC (450 - 990), IELTS Academic (Band 5.0 - 8.0+), Từ vựng SGK THPT Quốc Gia và Oxford 3000 thông dụng.',
  },
  {
    q: 'Tôi có thể tự tạo bộ từ vựng cá nhân của riêng mình không?',
    a: 'Hoàn toàn được! Bạn có thể tự thêm từng từ (hệ thống hỗ trợ tự động điền phiên âm IPA & câu ví dụ) hoặc dùng AI tạo nguyên bộ từ vựng theo bất kỳ chủ đề nào chỉ trong 3 giây.',
  },
];

export default function LandingPage() {
  const { speakWord, playSound, dueWords } = useApp();
  const navigate = useNavigate();
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const activeCard = DEMO_CARDS[cardIdx];

  const handleDemoRate = () => {
    playSound('correct');
    setFlipped(false);
    setTimeout(() => {
      setCardIdx((prev) => (prev + 1) % DEMO_CARDS.length);
    }, 180);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1e1b4b]">
      {/* Sticky Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/85 backdrop-blur-md border-b border-indigo-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              L
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#1e1b4b]">
                Luyện Từ
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                luyentu.com
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">
              Tính năng
            </a>
            <a href="#srs" className="hover:text-blue-600 transition">
              Phương pháp SRS
            </a>
            <a href="#games" className="hover:text-blue-600 transition">
              6 Game tương tác
            </a>
            <a href="#reviews" className="hover:text-blue-600 transition">
              Đánh giá
            </a>
            <a href="#faq" className="hover:text-blue-600 transition">
              Câu hỏi thường gặp
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="btn-3d px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <span>Vào học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section matching luyentu.com */}
      <section className="landing-hero-bg pt-28 pb-20 lg:pt-36 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200 shadow-xs text-xs sm:text-sm font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nền tảng học từ vựng tiếng Anh thông minh #1 Việt Nam</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.15] tracking-tight text-[#1e1b4b]">
              Ghi nhớ từ vựng{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                lâu gấp 3 lần
              </span>{' '}
              với Flashcard & SRS
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              Kết hợp thuật toán <strong>Spaced Repetition (Lặp lại ngắt quãng)</strong> tự động
              nhắc ôn đúng thời điểm sắp quên, lộ trình chuẩn hóa{' '}
              <strong>TOEIC • IELTS • THPT</strong> cùng <strong>6 trò chơi tương tác</strong>{' '}
              giúp bạn duy trì chuỗi Streak mỗi ngày mà không bao giờ nhàm chán.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/home')}
                className="btn-3d px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base flex items-center gap-2.5 shadow-xl shadow-blue-600/20"
              >
                <span>Bắt đầu học miễn phí</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/practice')}
                className="btn-3d px-6 py-4 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 border-2 border-indigo-200 font-extrabold text-base flex items-center gap-2"
              >
                <Gamepad2 className="w-5 h-5 text-orange-500" />
                <span>Thử 6 Game Luyện Từ ({dueWords.length} từ cần ôn)</span>
              </button>
            </div>

            {/* Key Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-indigo-200/60 max-w-xl">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">100.000+</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Học viên tin dùng
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-600">6 Chế độ</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Flashcard & Game hóa
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">3.5x</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Tốc độ nhớ dài hạn
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive Live Flashcard Demo */}
          <div className="lg:col-span-5">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border-2 border-indigo-100 shadow-2xl shadow-indigo-900/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  ✨ Trải nghiệm thử Flashcard SRS
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Thẻ {cardIdx + 1}/{DEMO_CARDS.length}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => {
                  playSound('flip');
                  setFlipped(!flipped);
                }}
                className="perspective-1000 cursor-pointer select-none h-72 w-full"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    flipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/60 border-2 border-indigo-100 p-6 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                        {activeCard.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(activeCard.word);
                        }}
                        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center my-auto">
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                        {activeCard.word}
                      </h3>
                      <p className="text-base font-mono text-indigo-600 font-semibold">
                        {activeCard.ipa}{' '}
                        <span className="italic text-slate-500">({activeCard.pos})</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Nhấn vào thẻ để lật xem nghĩa & câu ví dụ</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Nghĩa & Ngữ cảnh thực tế
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(activeCard.example);
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 my-auto">
                      <p className="text-xl font-extrabold text-amber-300">
                        {activeCard.meaning}
                      </p>
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <p className="text-sm font-medium text-white leading-snug">
                          “{activeCard.example}”
                        </p>
                        <p className="text-xs text-indigo-200 italic">
                          → {activeCard.exampleVi}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-center text-indigo-300">
                      Chọn mức độ nhớ bên dưới để thuật toán SRS lên lịch ôn:
                    </p>
                  </div>
                </div>
              </div>

              {/* SRS Rating Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <button
                  onClick={handleDemoRate}
                  className="py-2.5 px-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex flex-col items-center"
                >
                  <span>Quên</span>
                  <span className="text-[10px] opacity-75">10 phút</span>
                </button>
                <button
                  onClick={handleDemoRate}
                  className="py-2.5 px-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs flex flex-col items-center"
                >
                  <span>Khó</span>
                  <span className="text-[10px] opacity-75">1 ngày</span>
                </button>
                <button
                  onClick={handleDemoRate}
                  className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex flex-col items-center"
                >
                  <span>Nhớ tốt</span>
                  <span className="text-[10px] opacity-75">3 ngày</span>
                </button>
                <button
                  onClick={handleDemoRate}
                  className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex flex-col items-center"
                >
                  <span>Quá dễ</span>
                  <span className="text-[10px] opacity-75">7 ngày</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700">
            Hệ sinh thái toàn diện
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 text-[#1e1b4b]">
            Tại sao hơn 100.000+ người học yêu thích Luyện Từ?
          </h2>
          <p className="text-slate-600 mt-3">
            Mọi tính năng đều được thiết kế tối ưu riêng cho người Việt học tiếng Anh: trực quan,
            khoa học và tạo cảm hứng quay lại mỗi ngày.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              color: 'bg-blue-500',
              title: 'Thuật toán Spaced Repetition (SRS)',
              desc: 'Tự động tính toán thời điểm não bộ chuẩn bị quên để đưa từ vựng vào phiên ôn tập hôm nay, chuyển từ sang trí nhớ dài hạn.',
            },
            {
              icon: Gamepad2,
              color: 'bg-orange-500',
              title: '6 Chế độ Game hóa cuốn hút',
              desc: 'Từ Flashcard 3D, Trắc nghiệm tốc độ, Ghép thẻ Memory Match, Sắp xếp từ, Điền từ ngữ cảnh đến Nghe & Viết chính tả.',
            },
            {
              icon: Bot,
              color: 'bg-purple-500',
              title: 'AI Tạo bộ từ vựng trong 3 giây',
              desc: 'Chỉ cần nhập chủ đề bạn muốn (Du lịch, Phỏng vấn, Y tế, Tài chính...), AI tự động tạo bộ từ kèm IPA, nghĩa và ví dụ song ngữ.',
            },
            {
              icon: Layers,
              color: 'bg-emerald-500',
              title: 'Lộ trình TOEIC, IELTS & THPT chuẩn hóa',
              desc: 'Kho từ vựng chia sẵn theo mục tiêu điểm số: TOEIC 450-990, IELTS Academic 5.0-8.0+, SGK THPT Quốc gia & Oxford 3000.',
            },
            {
              icon: Flame,
              color: 'bg-rose-500',
              title: 'Giữ chuỗi Streak & Cặp học chung',
              desc: 'Học cùng bạn bè (Study Buddy), nhắc nhau giữ chuỗi ngày học liên tục và đua top trên Bảng xếp hạng hàng tuần.',
            },
            {
              icon: Trophy,
              color: 'bg-amber-500',
              title: 'Tích Xu đổi Giao diện Tuyết rơi & Hoa rơi',
              desc: 'Mỗi bài luyện tập đều thưởng Xu để mở khóa Avatar độc đáo, Đá Hồi Streak ❄️ và hiệu ứng màn hình sống động.',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feat.color} text-white flex items-center justify-center mb-4 shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SRS 5 Levels Explanation */}
      <section id="srs" className="py-16 bg-white border-y border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
              Khoa học trí nhớ
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              5 Cấp độ ghi nhớ SRS trên Luyện Từ
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Mỗi từ vựng bạn học sẽ đi qua 5 cấp độ từ <strong>Mới học (Level 1)</strong> đến{' '}
              <strong>Đã thuộc lòng (Level 5)</strong>. Khoảng cách giữa các lần ôn tập tăng dần
              giúp bạn tốn ít thời gian nhất nhưng nhớ lâu nhất.
            </p>
            <div className="pt-2">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700"
              >
                <span>Xem biểu đồ SRS của bạn trên Trang chủ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-5 gap-3">
            {[
              { lvl: 'Level 1', title: 'Mới học', time: 'Sau 1 ngày', color: 'border-red-300 bg-red-50 text-red-700', bar: 'h-12 bg-red-500' },
              { lvl: 'Level 2', title: 'Đang nhớ', time: 'Sau 3 ngày', color: 'border-orange-300 bg-orange-50 text-orange-700', bar: 'h-20 bg-orange-500' },
              { lvl: 'Level 3', title: 'Khá vững', time: 'Sau 7 ngày', color: 'border-amber-300 bg-amber-50 text-amber-700', bar: 'h-28 bg-amber-500' },
              { lvl: 'Level 4', title: 'Sắp thuộc', time: 'Sau 14 ngày', color: 'border-blue-300 bg-blue-50 text-blue-700', bar: 'h-36 bg-blue-500' },
              { lvl: 'Level 5', title: 'Đã thuộc lòng', time: 'Nhớ dài hạn', color: 'border-emerald-300 bg-emerald-50 text-emerald-700', bar: 'h-44 bg-emerald-500' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-end items-center text-center"
              >
                <div className="w-full flex items-end justify-center h-44 mb-3">
                  <div className={`w-12 rounded-t-xl ${item.bar} transition-all`} />
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${item.color}`}>
                  {item.lvl}
                </span>
                <p className="font-bold text-sm text-slate-900 mt-1.5">{item.title}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Marquee */}
      <section id="reviews" className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cộng đồng học viên nói gì về Luyện Từ?
          </h2>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee gap-6 px-4">
            {[...REVIEWS, ...REVIEWS].map((rev, i) => (
              <div
                key={i}
                className="w-80 sm:w-96 shrink-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mx-3"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl">
                    {rev.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{rev.name}</p>
                    <p className="text-xs text-amber-500">★★★★★ Học viên tích cực</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">“{rev.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Câu hỏi thường gặp
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full px-6 py-4 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{item.q}</span>
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-center text-white shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Sẵn sàng bứt phá vốn từ vựng tiếng Anh của bạn?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Tham gia học ngay hôm nay với hệ thống Flashcard SRS, 6 trò chơi tương tác và kho từ
            vựng TOEIC/IELTS hoàn toàn miễn phí.
          </p>
          <Link
            to="/home"
            className="btn-3d inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-extrabold text-base hover:bg-blue-50"
          >
            <span>Vào bảng điều khiển học tập</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
