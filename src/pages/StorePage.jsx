import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Volume2,
  Flame,
  Palette,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StorePage() {
  const {
    user,
    STORE_ITEMS,
    buyStoreItem,
    equipStoreItem,
    playSound,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: '🛍️ Tất cả vật phẩm' },
    { id: 'special', label: '❄️ Đặc biệt & Streak' },
    { id: 'theme', label: '🎨 Hình nền & Hiệu ứng' },
    { id: 'avatar', label: '🦉 Ảnh đại diện' },
  ];

  const filteredItems = STORE_ITEMS.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const isEquipped = (item) => {
    if (item.category === 'theme') return user.activeTheme === item.id;
    if (item.category === 'avatar') return user.avatar === item.icon;
    if (item.id === 'item-sound-mech') return user.mechKeyboard;
    return false;
  };

  return (
    <div className="space-y-7">
      {/* Store Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold">
              <ShoppingBag className="w-4 h-4" />
              <span>Cửa hàng Vật phẩm & Trang trí Luyện Từ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Đổi Xu Thưởng • Làm Mới Không Gian Học Tập
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
              Dùng Xu tích lũy khi học Flashcard & chơi Game để mở khóa Đá Hồi Streak ❄️, Hình
              nền Tuyết rơi / Hoa anh đào rơi 🌸 và Avatar độc quyền!
            </p>
          </div>

          {/* Current Wallet Card */}
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5 flex items-center gap-5 shrink-0">
            <div>
              <p className="text-xs font-bold text-amber-100">Số dư hiện tại</p>
              <p className="text-3xl font-extrabold flex items-center gap-1.5 mt-0.5">
                <span>🪙</span>
                <span>{user.coins.toLocaleString()}</span>
                <span className="text-sm font-bold">xu</span>
              </p>
            </div>
            <div className="h-10 w-px bg-white/25" />
            <div>
              <p className="text-xs font-bold text-amber-100">Đá Hồi Streak</p>
              <p className="text-2xl font-extrabold flex items-center gap-1 mt-0.5">
                <span>❄️</span>
                <span>{user.streakFreezes}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition border ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const unlocked = user.unlockedItems.includes(item.id);
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border-2 transition flex flex-col justify-between shadow-xs hover:shadow-lg ${
                equipped
                  ? 'border-amber-400 ring-4 ring-amber-400/15'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Preview Area */}
                <div
                  className={`h-28 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden border border-slate-100 bg-gradient-to-br ${
                    item.previewBg || 'from-slate-50 via-indigo-50/40 to-amber-50/40'
                  }`}
                >
                  <span className="text-5xl select-none drop-shadow-xs">
                    {item.icon}
                  </span>

                  {item.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-extrabold">
                      {item.badge}
                    </span>
                  )}

                  {equipped && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Đang dùng
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {item.price === 0 ? (
                    <span className="text-xs font-extrabold text-emerald-600">
                      Miễn phí
                    </span>
                  ) : (
                    <span className="font-extrabold text-sm text-amber-700 flex items-center gap-1">
                      🪙 {item.price.toLocaleString()} xu
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.id === 'item-sound-mech' && (
                    <button
                      type="button"
                      onClick={() => playSound('key')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe thử</span>
                    </button>
                  )}

                  {unlocked && !item.consumable ? (
                    <button
                      onClick={() => equipStoreItem(item)}
                      disabled={equipped && item.id !== 'item-sound-mech'}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition ${
                        equipped
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {equipped ? '✓ Đang dùng' : 'Áp dụng ngay'}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyStoreItem(item)}
                      className="btn-3d px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {item.id === 'item-streak-freeze'
                          ? '❄️ Sử dụng'
                          : 'Mua ngay'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
