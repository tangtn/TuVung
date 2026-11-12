import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Gamepad2,
  Sparkles,
  Volume2,
  ArrowRight,
  Plus,
  Bot,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const {
    user,
    decks,
    words,
    dueWords,
    masteredWords,
    learningWords,
    speakWord,
    SRS_LEVELS,
    getWordIllustration,
    getFallbackSvgDataUri,
  } = useApp();
  const navigate = useNavigate();

  // Compute SRS distribution across levels 0-5
  const levelCounts = SRS_LEVELS.map((lvl) => ({
    ...lvl,
    count: words.filter((w) => w.level === lvl.level).length,
  }));
  const maxLvlCount = Math.max(1, ...levelCounts.map((l) => l.count));

  return (
    <div className="space-y-8">
      {/* Top Hero Welcome & SRS Call-To-Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Chuỗi {user.streak} ngày học liên tiếp • Duy trì phong độ nhé!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Chào mừng trở lại, {user.avatar} {user.name}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {dueWords.length > 0 ? (
                <>
                  Hệ thống <strong>Spaced Repetition (SRS)</strong> phát hiện bạn có{' '}
                  <span className="underline decoration-amber-300 font-extrabold text-amber-200">
                    {dueWords.length} từ vựng đến hạn cần ôn ngay
                  </span>{' '}
                  để không bị quên.
                </>
              ) : (
                <>
                  Tuyệt vời! Bạn đã hoàn thành hết các từ đến hạn ôn tập hôm nay. Hãy học thêm từ
                  mới hoặc chơi game nhé!
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/practice?mode=flashcard&filter=due')}
              className="btn-3d px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg"
            >
              <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
              <span>
                {dueWords.length > 0
                  ? `Ôn ngay ${dueWords.length} từ đến hạn`
                  : 'Luyện Flashcard ngay'}
              </span>
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="btn-3d px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-sm flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Chơi 6 Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key SRS Metrics Cards (matching luyentu.com Home) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/practice?filter=due')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-orange-200/80 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
              Từ đến hạn
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{dueWords.length}</p>
          <p className="text-xs text-orange-600 font-semibold mt-1">
            🔥 Cần ôn ngay hôm nay
          </p>
        </div>

        <div
          onClick={() => navigate('/words?filter=learning')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-blue-200/80 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Đang ghi nhớ
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{learningWords.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Đang ở SRS Level 1 → 4
          </p>
        </div>

        <div
          onClick={() => navigate('/words?filter=mastered')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              Đã thuộc lòng
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{masteredWords.length}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            ✨ Đạt SRS Level 5 (Dài hạn)
          </p>
        </div>

        <div
          onClick={() => navigate('/words')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-purple-200/80 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600">
              Tổng từ vựng
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{words.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Trong {decks.length} bộ từ vựng
          </p>
        </div>
      </div>

      {/* Middle Row: SRS Memory Level Chart & Weekly Streak Activity */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* SRS Level Pyramid / Bar Distribution */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Tháp trí nhớ Spaced Repetition (SRS)
              </h2>
              <p className="text-xs text-slate-500">
                Phân bổ từ vựng của bạn theo 5 cấp độ ghi nhớ khoa học
              </p>
            </div>
            <Link
              to="/words"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Chi tiết kho từ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {levelCounts.map((lvl) => {
              const widthPct = Math.max(6, Math.round((lvl.count / maxLvlCount) * 100));
              return (
                <div key={lvl.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: lvl.color }}
                      />
                      {lvl.name}
                      <span className="text-slate-400 font-normal hidden sm:inline">
                        — {lvl.desc}
                      </span>
                    </span>
                    <span className="font-extrabold text-slate-900">{lvl.count} từ</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: lvl.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Streak & Study Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Biểu đồ Streak 7 ngày
                </h2>
                <p className="text-xs text-slate-500">
                  Số lượt từ vựng đã ôn tập trong tuần
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>{user.streak} ngày</span>
              </div>
            </div>

            {/* 7-day Vertical Bar Chart */}
            <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2 border-b border-slate-100">
              {user.weeklyActivity.map((item, idx) => {
                const isToday = idx === user.weeklyActivity.length - 1;
                const barH = Math.min(100, Math.max(15, Math.round((item.count / 32) * 100)));
                return (
                  <div
                    key={item.day}
                    className="flex flex-col items-center justify-end h-full gap-1.5"
                  >
                    <span className="text-[11px] font-bold text-slate-600">
                      {item.count}
                    </span>
                    <div className="w-full flex justify-center items-end h-28">
                      <div
                        className={`w-full max-w-[28px] rounded-t-xl transition-all ${
                          isToday
                            ? 'bg-gradient-to-t from-orange-500 to-amber-400 shadow-md shadow-orange-500/20'
                            : 'bg-blue-500/85 hover:bg-blue-600'
                        }`}
                        style={{ height: `${barH}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-orange-600' : 'text-slate-500'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <Link
              to="/category-list?ai=1"
              className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 flex items-center gap-2.5 text-purple-800 font-bold text-xs transition"
            >
              <Bot className="w-5 h-5 text-purple-600 shrink-0" />
              <span>AI Tạo bộ từ mới</span>
            </Link>
            <Link
              to="/leaderboard"
              className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 flex items-center gap-2.5 text-rose-800 font-bold text-xs transition"
            >
              <Trophy className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Cặp học chung & Top</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Words Due Today Section */}
      {dueWords.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>🔥 Từ vựng đến hạn cần ôn tập ngay</span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-extrabold">
                  {dueWords.length} từ
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Ôn tập ngay lúc này giúp tăng gấp đôi khả năng chuyển từ vào trí nhớ dài hạn
              </p>
            </div>
            <Link
              to="/practice?mode=flashcard&filter=due"
              className="btn-3d px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 self-start"
            >
              <span>Ôn tất cả bằng Flashcard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dueWords.slice(0, 6).map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-orange-300 bg-slate-50/60 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={w.image || getWordIllustration(w)}
                      alt={w.word}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackSvgDataUri(w);
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-base text-slate-900">
                        {w.word}
                      </span>
                      <span className="text-xs font-mono text-indigo-600">{w.ipa}</span>
                      <span className="text-[11px] italic text-slate-400">({w.pos})</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                      {w.meaning}
                    </p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                      SRS Level {w.level} • Đến hạn
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => speakWord(w.word)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decks Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Bộ từ vựng & Lộ trình có hình ảnh minh họa
            </h2>
            <p className="text-xs text-slate-500">
              Chọn một bộ từ để học Flashcard trực quan hoặc chơi 6 chế độ Game tương tác
            </p>
          </div>
          <Link
            to="/category-list"
            className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Xem tất cả ({decks.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck) => {
            const deckWords = words.filter((w) => w.deckId === deck.id);
            const mastered = deckWords.filter((w) => w.level === 5).length;
            const due = deckWords.filter(
              (w) => w.level > 0 && w.level < 5 && w.nextReview <= Date.now()
            ).length;
            const pct =
              deckWords.length > 0
                ? Math.round((mastered / deckWords.length) * 100)
                : 0;
            const coverImg =
              deck.coverImage ||
              (deckWords[0] &&
                (deckWords[0].image || getWordIllustration(deckWords[0])));

            return (
              <div
                key={deck.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                    {coverImg && (
                      <img
                        src={coverImg}
                        alt={deck.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackSvgDataUri({
                            word: deck.title,
                            meaning: deck.tag || 'Vocabulary',
                            topicId: 'school',
                          });
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/90 text-slate-900 shadow-xs">
                        {deck.icon} {deck.tag}
                      </span>
                      {due > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-500 text-white shadow-xs">
                          🔥 {due} cần ôn
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[11px] font-bold text-amber-300">
                        📸 Minh họa trực quan • {deckWords.length} từ
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pb-2">
                    <h3 className="font-extrabold text-base text-slate-900 mb-1">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {deck.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      {deckWords.length} từ • Đã thuộc {mastered}
                    </span>
                    <span className="font-extrabold text-emerald-600">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/practice?deck=${deck.id}&mode=flashcard`}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition"
                    >
                      🃏 Học Flashcard
                    </Link>
                    <Link
                      to={`/practice?deck=${deck.id}&mode=quiz`}
                      className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs text-center transition"
                    >
                      🎮 Chơi Game
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
