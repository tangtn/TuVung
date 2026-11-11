import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  BookOpen,
  Gamepad2,
  Compass,
  ShoppingBag,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  {
    path: '/home',
    label: 'Trang chủ',
    icon: Home,
    color: '#1cb0f6',
    bgActive: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    path: '/category-list',
    label: 'Bộ từ vựng',
    icon: FolderKanban,
    color: '#ce82ff',
    bgActive: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  {
    path: '/words',
    label: 'Từ vựng',
    icon: BookOpen,
    color: '#23ac38',
    bgActive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    path: '/practice',
    label: 'Học từ vựng',
    icon: Gamepad2,
    color: '#ff9600',
    bgActive: 'bg-orange-50 text-orange-600 border-orange-200',
    badgeKey: 'due',
  },
  {
    path: '/roadmap',
    label: 'Lộ trình học',
    icon: Compass,
    color: '#4f46e5',
    bgActive: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    path: '/store',
    label: 'Cửa hàng',
    icon: ShoppingBag,
    color: '#eab308',
    bgActive: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    path: '/leaderboard',
    label: 'Xếp hạng',
    icon: Trophy,
    color: '#ff4b4b',
    bgActive: 'bg-rose-50 text-rose-600 border-rose-200',
  },
];

export default function AppLayout() {
  const { user, setUser, dueWords, toast, resetDemoData, STORE_ITEMS } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentThemeObj =
    STORE_ITEMS.find((i) => i.id === user.activeTheme) || STORE_ITEMS[3];

  const renderThemeParticles = () => {
    if (!currentThemeObj?.effect || currentThemeObj.effect === 'none') return null;
    const symbol =
      currentThemeObj.effect === 'snow'
        ? '❄️'
        : currentThemeObj.effect === 'sakura'
        ? '🌸'
        : '✨';
    const items = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${(i * 7.3) % 98}%`,
      delay: `${(i * 1.4) % 10}s`,
      duration: `${10 + (i % 6) * 2.5}s`,
      size: `${14 + (i % 3) * 4}px`,
    }));

    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-30">
        {items.map((p) => (
          <span
            key={p.id}
            className="particle-fall select-none"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              fontSize: p.size,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>
    );
  };

  const dailyPct = Math.min(100, Math.round((user.todayLearned / user.dailyGoal) * 100));

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row bg-gradient-to-br ${
        currentThemeObj?.previewBg || 'from-slate-50 via-blue-50/30 to-indigo-50/20'
      } text-slate-900`}
    >
      {renderThemeParticles()}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 font-medium text-sm ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (Luyện Từ Style) */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white/95 backdrop-blur border-r border-slate-200/80 z-30 select-none">
        {/* Brand Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <span className="text-2xl font-extrabold tracking-tight">L</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Luyện Từ
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Spaced Repetition SRS</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/home' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  isActive
                    ? `${item.bgActive} shadow-sm`
                    : 'border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badgeKey === 'due' && dueWords.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                    {dueWords.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Daily Goal Progress Widget in Sidebar */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 border border-blue-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
              🎯 Mục tiêu hôm nay
            </span>
            <span className="text-xs font-extrabold text-blue-600">
              {user.todayLearned}/{user.dailyGoal} từ
            </span>
          </div>
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-blue-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            {dailyPct >= 100
              ? '🎉 Xuất sắc! Bạn đã hoàn thành mục tiêu ngày!'
              : `Chỉ còn ${Math.max(0, user.dailyGoal - user.todayLearned)} từ nữa để đạt mục tiêu!`}
          </p>
        </div>

        {/* Bottom User Profile & Reset Demo */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Link to="/store" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition">
              {user.avatar}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {user.xp.toLocaleString()} XP • Đổi Avatar
              </p>
            </div>
          </Link>
          <button
            onClick={resetDemoData}
            title="Khôi phục dữ liệu mẫu"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 lg:h-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile menu button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center">
                L
              </div>
              <span className="font-extrabold text-base text-slate-900">Luyện Từ</span>
            </Link>

            {/* Quick SRS Due Callout on Desktop */}
            {dueWords.length > 0 ? (
              <Link
                to="/practice"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span>🔥 Cần ôn ngay: {dueWords.length} từ đến hạn SRS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <span>✅ Đã ôn hết từ đến hạn hôm nay!</span>
              </div>
            )}
          </div>

          {/* Right Status Pills: Streak, Coins, XP, Sound */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Pill */}
            <Link
              to="/leaderboard"
              title={`Chuỗi ${user.streak} ngày học liên tiếp • Đang có ${user.streakFreezes} Đá Hồi Streak ❄️`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-200/80 transition"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-extrabold text-xs sm:text-sm text-orange-600">
                {user.streak}
              </span>
              <span className="hidden md:inline text-xs font-semibold text-orange-600/80">
                ngày
              </span>
              {user.streakFreezes > 0 && (
                <span className="text-xs ml-0.5" title="Đã trang bị Đá bảo vệ Streak">
                  ❄️
                </span>
              )}
            </Link>

            {/* Coins Pill */}
            <Link
              to="/store"
              title="Xu thưởng - Dùng để mua Avatar, Giao diện & Đá Hồi Streak"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition"
            >
              <span className="text-sm">🪙</span>
              <span className="font-extrabold text-xs sm:text-sm text-amber-700">
                {user.coins.toLocaleString()}
              </span>
              <span className="hidden md:inline text-xs font-semibold text-amber-600">
                xu
              </span>
            </Link>

            {/* XP Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200/80">
              <span className="text-sm">⚡</span>
              <span className="font-extrabold text-xs sm:text-sm text-indigo-700">
                {user.xp.toLocaleString()} XP
              </span>
              {user.xpBoostActive && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[10px] font-bold">
                  x2
                </span>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() =>
                setUser((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              title={user.soundEnabled ? 'Đang bật âm thanh' : 'Đang tắt âm thanh'}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
            >
              {user.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Landing Page Link */}
            <Link
              to="/landing"
              className="hidden xl:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              Giới thiệu
            </Link>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[82vw] bg-white h-full flex flex-col p-4 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center">
                    L
                  </div>
                  <span className="font-extrabold text-lg">Luyện Từ</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm ${
                          isActive
                            ? item.bgActive
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.badgeKey === 'due' && dueWords.length > 0 && (
                        <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-red-500 text-white">
                          {dueWords.length}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
