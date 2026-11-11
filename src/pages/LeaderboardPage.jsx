import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Send,
  Users,
  Sparkles,
  CheckCircle2,
  MessageSquareHeart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LeaderboardPage() {
  const {
    user,
    masteredWords,
    INITIAL_LEADERBOARD,
    buddy,
    postCommunityMessage,
    cheerStudyBuddy,
  } = useApp();

  const [rankTab, setRankTab] = useState('xp'); // 'xp' | 'streak' | 'mastered'
  const [msgInput, setMsgInput] = useState('');

  // Combine current user into leaderboard & sort dynamically
  const fullBoard = [
    ...INITIAL_LEADERBOARD,
    {
      id: 'me',
      name: `${user.name} (Bạn)`,
      avatar: user.avatar,
      streak: user.streak,
      mastered: masteredWords.length + 320,
      xp: user.xp,
      badge: 'Đang bứt phá',
      isMe: true,
    },
  ].sort((a, b) => {
    if (rankTab === 'streak') return b.streak - a.streak;
    if (rankTab === 'mastered') return b.mastered - a.mastered;
    return b.xp - a.xp;
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    postCommunityMessage(msgInput);
    setMsgInput('');
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Thi đua & Cộng đồng Luyện Từ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bảng Xếp Hạng & Cặp Học Chung (Study Buddy)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giữ chuỗi Streak chung cùng bạn học và đua top học viên chăm chỉ nhất tuần
          </p>
        </div>

        {/* Ranking Criteria Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'xp', label: '⚡ Điểm XP' },
            { id: 'streak', label: '🔥 Chuỗi Streak' },
            { id: 'mastered', label: '📚 Từ đã thuộc' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRankTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition ${
                rankTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Top Podium & Leaderboard Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 items-end pt-4">
            {/* Top 2 */}
            {fullBoard[1] && (
              <div className="bg-white rounded-3xl p-4 border border-slate-200 text-center space-y-2 shadow-xs">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
                  🥈 Hạng 2
                </span>
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-3xl mx-auto">
                  {fullBoard[1].avatar}
                </div>
                <p className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {fullBoard[1].name}
                </p>
                <p className="text-xs font-bold text-indigo-600">
                  {fullBoard[1].xp.toLocaleString()} XP
                </p>
              </div>
            )}

            {/* Top 1 */}
            {fullBoard[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-5 border-2 border-amber-300 text-center space-y-2 shadow-lg -translate-y-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
                  👑 Quán Quân
                </span>
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-4xl mx-auto">
                  {fullBoard[0].avatar}
                </div>
                <p className="font-extrabold text-sm text-slate-900 line-clamp-1">
                  {fullBoard[0].name}
                </p>
                <p className="text-xs font-extrabold text-amber-700">
                  {fullBoard[0].xp.toLocaleString()} XP • 🔥 {fullBoard[0].streak} ngày
                </p>
              </div>
            )}

            {/* Top 3 */}
            {fullBoard[2] && (
              <div className="bg-white rounded-3xl p-4 border border-orange-200 text-center space-y-2 shadow-xs">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs">
                  🥉 Hạng 3
                </span>
                <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-3xl mx-auto">
                  {fullBoard[2].avatar}
                </div>
                <p className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {fullBoard[2].name}
                </p>
                <p className="text-xs font-bold text-indigo-600">
                  {fullBoard[2].xp.toLocaleString()} XP
                </p>
              </div>
            )}
          </div>

          {/* Full Ranking List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {fullBoard.map((member, idx) => (
                <div
                  key={member.id}
                  className={`p-4 px-5 flex items-center justify-between gap-4 transition ${
                    member.isMe
                      ? 'bg-blue-50/80 font-bold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-200 text-orange-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {member.name}
                        </span>
                        {member.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                            {member.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Đã thuộc {member.mastered} từ • Chuỗi 🔥 {member.streak} ngày
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-sm text-indigo-600">
                      {rankTab === 'streak'
                        ? `🔥 ${member.streak} ngày`
                        : rankTab === 'mastered'
                        ? `📚 ${member.mastered} từ`
                        : `⚡ ${member.xp.toLocaleString()} XP`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Cặp Học Chung (Study Buddy Streak) & Community Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Study Buddy Card matching luyentu.com */}
          <div className="bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Cặp học chung • Chuỗi đôi</span>
              </span>
              <span className="text-xs font-extrabold bg-amber-300 text-slate-950 px-2.5 py-1 rounded-full">
                🔥 {buddy.sharedStreak} ngày chung
              </span>
            </div>

            <div className="flex items-center justify-around py-2 bg-white/10 rounded-2xl p-4 border border-white/15">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-3xl mx-auto">
                  {user.avatar}
                </div>
                <p className="text-xs font-extrabold mt-1.5">Bạn</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold">
                  ✓ Đã học hôm nay
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Flame className="w-8 h-8 text-amber-300 fill-amber-300 animate-bounce" />
                <span className="text-xs font-extrabold mt-1">
                  {buddy.sharedStreak} Ngày
                </span>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-3xl mx-auto">
                  {buddy.partnerAvatar}
                </div>
                <p className="text-xs font-extrabold mt-1.5 line-clamp-1">
                  {buddy.partnerName}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold">
                  ✓ Đã giữ chuỗi
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/15 text-xs leading-relaxed">
              💬 <strong>Lời nhắn hôm nay:</strong> “{buddy.todayMessage}”
            </div>

            <button
              onClick={cheerStudyBuddy}
              className="btn-3d w-full py-3 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>🔥 Đập tay giữ chuỗi chung hôm nay (+25 Xu)</span>
            </button>
          </div>

          {/* Community Activity & Encouragement Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-rose-500" />
                <span>Góc Động Lực Cộng Đồng</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600">
                ● Trực tuyến
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Chia sẻ mục tiêu hôm nay của bạn..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {buddy.feed.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{msg.avatar}</span>
                      <span className="font-extrabold text-xs text-slate-800">
                        {msg.user}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
