import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Bot,
  Search,
  Copy,
  Share2,
  Trash2,
  Eye,
  Volume2,
  Sparkles,
  X,
  BookOpen,
  Gamepad2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const EMOJI_OPTIONS = ['📘', '💼', '🌍', '🎓', '✈️', '💻', '🩺', '📈', '🔥', '🎯', '🚀', '💬'];

export default function CategoriesPage() {
  const {
    folders,
    decks,
    words,
    createDeck,
    deleteDeck,
    duplicateDeck,
    generateAIDeck,
    addWord,
    speakWord,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [viewingDeck, setViewingDeck] = useState(null);

  // Create Deck Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('📘');
  const [newTag, setNewTag] = useState('Cá nhân');
  const [newFolderId, setNewFolderId] = useState('folder-personal');

  // AI Generator Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiLevel, setAiLevel] = useState('B1 - B2 (Trung cấp)');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Quick Add Word inside Deck View Modal
  const [quickWord, setQuickWord] = useState('');
  const [quickMeaning, setQuickMeaning] = useState('');

  useEffect(() => {
    if (searchParams.get('ai') === '1') {
      setShowAIModal(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filteredDecks = decks.filter((d) => {
    const matchFolder = selectedFolder === 'all' || d.folderId === selectedFolder;
    const matchQuery =
      !searchQuery.trim() ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchQuery;
  });

  const handleManualCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createDeck({
      title: newTitle.trim(),
      description: newDesc.trim(),
      icon: newIcon,
      tag: newTag,
      folderId: newFolderId,
    });
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
    setViewingDeck(created);
  };

  const handleAIGenerate = (e) => {
    e.preventDefault();
    setAiGenerating(true);
    setTimeout(() => {
      const created = generateAIDeck(aiTopic || 'Du lịch & Sân bay', aiLevel);
      setAiGenerating(false);
      setShowAIModal(false);
      setAiTopic('');
      setViewingDeck(created);
    }, 650);
  };

  const handleShareDeck = (deck) => {
    const shareUrl = `${window.location.origin}/category-list?shared=${deck.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showToast('🔗 Đã sao chép link chia sẻ bộ từ! Chia sẻ với bạn bè nhé!');
  };

  const handleQuickAddWord = (e) => {
    e.preventDefault();
    if (!quickWord.trim() || !viewingDeck) return;
    addWord({
      deckId: viewingDeck.id,
      word: quickWord,
      meaning: quickMeaning,
    });
    setQuickWord('');
    setQuickMeaning('');
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Quản lý Thư mục & Bộ từ vựng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kho Bộ Từ Vựng Chuẩn Hóa & Cá Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Khám phá các bộ từ TOEIC, IELTS, THPT có sẵn hoặc dùng AI tạo bộ từ theo chủ đề riêng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAIModal(true)}
            className="btn-3d px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-500/20"
          >
            <Bot className="w-4 h-4" />
            <span>✨ Tạo bộ từ bằng AI</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-3d px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ từ mới</span>
          </button>
        </div>
      </div>

      {/* Folder Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition border ${
              selectedFolder === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🗂️ Tất cả ({decks.length})
          </button>
          {folders.map((folder) => {
            const count = decks.filter((d) => d.folderId === folder.id).length;
            const active = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{folder.icon}</span>
                <span>{folder.name}</span>
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bộ từ TOEIC, IELTS, IT..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => {
          const deckWords = words.filter((w) => w.deckId === deck.id);
          const masteredCount = deckWords.filter((w) => w.level === 5).length;
          const dueCount = deckWords.filter(
            (w) => w.level > 0 && w.level < 5 && w.nextReview <= Date.now()
          ).length;
          const pct =
            deckWords.length > 0
              ? Math.round((masteredCount / deckWords.length) * 100)
              : 0;

          return (
            <div
              key={deck.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-13 h-13 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl flex items-center justify-center">
                    {deck.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingDeck(deck)}
                      title="Xem danh sách từ"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateDeck(deck.id)}
                      title="Sao chép bộ từ"
                      className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareDeck(deck)}
                      title="Chia sẻ link bộ từ"
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {!deck.isSystem && (
                      <button
                        onClick={() => deleteDeck(deck.id)}
                        title="Xóa bộ từ"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {deck.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    {deck.levelTag}
                  </span>
                  {dueCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-700">
                      🔥 {dueCount} đến hạn
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setViewingDeck(deck)}
                  className="font-extrabold text-lg text-slate-900 hover:text-blue-600 cursor-pointer transition mb-1.5"
                >
                  {deck.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {deck.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    📚 {deckWords.length} từ vựng
                  </span>
                  <span className="font-extrabold text-emerald-600">
                    Đã thuộc {masteredCount}/{deckWords.length} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => setViewingDeck(deck)}
                    className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => navigate(`/practice?deck=${deck.id}&mode=flashcard`)}
                    className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    🃏 Flashcard
                  </button>
                  <button
                    onClick={() => navigate(`/practice?deck=${deck.id}&mode=quiz`)}
                    className="py-2.5 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                  >
                    🎮 6 Game
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: AI Smart Deck Generator */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    AI Tạo Bộ Từ Vựng Thông Minh
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tự động sinh từ vựng, phiên âm IPA và câu ví dụ song ngữ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAIGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Chủ đề bạn muốn học là gì?
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="VD: Du lịch sân bay, Phỏng vấn xin việc, Tài chính, Y tế..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Quick Topic Pills */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-2">
                  Gợi ý chủ đề phổ biến:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '✈️ Du lịch & Sân bay',
                    '🤝 Phỏng vấn xin việc & CV',
                    '📈 Tài chính & Đầu tư',
                    '🩺 Sức khỏe & Y tế',
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAiTopic(preset)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Cấp độ từ vựng (CEFR / IELTS / TOEIC)
                </label>
                <select
                  value={aiLevel}
                  onChange={(e) => setAiLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="A1 - A2 (Cơ bản)">A1 - A2 (Giao tiếp cơ bản)</option>
                  <option value="B1 - B2 (TOEIC 650+ / IELTS 6.0)">
                    B1 - B2 (TOEIC 650+ / IELTS 6.0)
                  </option>
                  <option value="C1 - C2 (TOEIC 850+ / IELTS 7.5+)">
                    C1 - C2 (Học thuật & Chuyên sâu)
                  </option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="btn-3d px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {aiGenerating ? 'AI đang biên soạn bộ từ...' : 'Tạo bộ từ bằng AI ngay'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Create Deck */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-slate-900">Tạo bộ từ vựng mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Tên bộ từ *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Từ vựng Reading Cam 18..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả về bộ từ này..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Nhãn (Tag)
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="Cá nhân">Cá nhân</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="IELTS">IELTS</option>
                    <option value="THPT">THPT</option>
                    <option value="Giao tiếp">Giao tiếp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Thư mục
                  </label>
                  <select
                    value={newFolderId}
                    onChange={(e) => setNewFolderId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Biểu tượng
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      type="button"
                      key={emo}
                      onClick={() => setNewIcon(emo)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border ${
                        newIcon === emo
                          ? 'border-blue-600 bg-blue-50 scale-110'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-3d px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CategoryViewModal (Inspect Deck Words & Quick Add) */}
      {viewingDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                  {viewingDeck.icon}
                </div>
                <div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {viewingDeck.tag}
                  </span>
                  <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                    {viewingDeck.title}
                  </h3>
                  <p className="text-xs text-slate-500">{viewingDeck.description}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDeck(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Word Bar inside Deck */}
            <form
              onSubmit={handleQuickAddWord}
              className="px-6 py-3.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={quickWord}
                onChange={(e) => setQuickWord(e.target.value)}
                placeholder="Nhập từ tiếng Anh mới (VD: resilient)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
              />
              <input
                type="text"
                value={quickMeaning}
                onChange={(e) => setQuickMeaning(e.target.value)}
                placeholder="Nghĩa tiếng Việt (để trống sẽ tự điền)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shrink-0"
              >
                + Thêm từ vào bộ
              </button>
            </form>

            {/* Word List inside Deck (Preview first 50 for instant speed) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {words
                .filter((w) => w.deckId === viewingDeck.id)
                .slice(0, 50)
                .map((w, idx) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 flex items-start justify-between gap-4 bg-white transition"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-extrabold text-base text-slate-900">
                          {w.word}
                        </span>
                        <span className="text-xs font-mono text-indigo-600">{w.ipa}</span>
                        <span className="text-xs italic text-slate-500">({w.pos})</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700">
                          SRS Level {w.level}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-blue-700">{w.meaning}</p>
                      <p className="text-xs text-slate-600">“{w.example}”</p>
                      <p className="text-xs text-slate-400 italic">→ {w.exampleVi}</p>
                    </div>
                    <button
                      onClick={() => speakWord(w.word)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {words.filter((w) => w.deckId === viewingDeck.id).length > 50 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setViewingDeck(null);
                      navigate('/words');
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs"
                  >
                    Xem toàn bộ {words.filter((w) => w.deckId === viewingDeck.id).length.toLocaleString()} từ trong mục Từ Vựng →
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Tổng cộng:{' '}
                {words.filter((w) => w.deckId === viewingDeck.id).length} từ vựng
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const id = viewingDeck.id;
                    setViewingDeck(null);
                    navigate(`/practice?deck=${id}&mode=flashcard`);
                  }}
                  className="btn-3d px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Học Flashcard</span>
                </button>
                <button
                  onClick={() => {
                    const id = viewingDeck.id;
                    setViewingDeck(null);
                    navigate(`/practice?deck=${id}&mode=quiz`);
                  }}
                  className="btn-3d px-5 py-2.5 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Chơi Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
