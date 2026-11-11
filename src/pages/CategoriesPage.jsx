import React, { useState, useEffect, useMemo } from 'react';
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
  CheckSquare,
  Square,
  FilePlus2,
  Library,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const EMOJI_OPTIONS = ['📘', '💼', '🌍', '🎓', '✈️', '💻', '🩺', '📈', '🔥', '🎯', '🚀', '💬'];

export default function CategoriesPage() {
  const {
    folders,
    decks,
    words,
    OXFORD_TOPICS,
    createDeck,
    deleteDeck,
    duplicateDeck,
    generateAIDeck,
    addWord,
    deleteWord,
    copyWordsToDeck,
    bulkAddWordsToDeck,
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
  const [seedTopicId, setSeedTopicId] = useState('none');
  const [rawWordsText, setRawWordsText] = useState('');

  // AI Generator Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiLevel, setAiLevel] = useState('B1 - B2 (TOEIC 650+ / IELTS 6.0)');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Modal 3 (CategoryViewModal) Tabs & States
  const [modalTab, setModalTab] = useState('list'); // 'list' | 'pick' | 'bulk'
  const [quickWord, setQuickWord] = useState('');
  const [quickMeaning, setQuickMeaning] = useState('');
  const [deckSearch, setDeckSearch] = useState('');

  // Pick from Oxford 3000+ Bank state inside Modal 3
  const [bankQuery, setBankQuery] = useState('');
  const [bankTopic, setBankTopic] = useState('all');
  const [selectedBankWordIds, setSelectedBankWordIds] = useState([]);

  // Bulk import state inside Modal 3
  const [bulkText, setBulkText] = useState('');

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

  // Words belonging to the currently inspected deck
  const viewingDeckWords = useMemo(() => {
    if (!viewingDeck) return [];
    const list = words.filter((w) => w.deckId === viewingDeck.id);
    if (!deckSearch.trim()) return list;
    const q = deckSearch.trim().toLowerCase();
    return list.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
    );
  }, [words, viewingDeck, deckSearch]);

  // Words from the global bank available to pick into viewingDeck
  const bankWordsPool = useMemo(() => {
    if (!viewingDeck) return [];
    const existingSet = new Set(
      words
        .filter((w) => w.deckId === viewingDeck.id)
        .map((w) => w.word.toLowerCase())
    );
    const q = bankQuery.trim().toLowerCase();

    // Deduplicate by lowercase word
    const seen = new Set();
    const result = [];
    for (const w of words) {
      const lw = (w.word || '').toLowerCase();
      if (!lw || existingSet.has(lw) || seen.has(lw)) continue;
      if (bankTopic !== 'all' && w.topicId !== bankTopic) continue;
      if (
        q &&
        !lw.includes(q) &&
        !(w.meaning || '').toLowerCase().includes(q)
      ) {
        continue;
      }
      seen.add(lw);
      result.push(w);
      if (result.length >= 60) break;
    }
    return result;
  }, [words, viewingDeck, bankQuery, bankTopic]);

  const openDeckModal = (deck, initialTab = 'list') => {
    setViewingDeck(deck);
    setModalTab(initialTab);
    setDeckSearch('');
    setBankQuery('');
    setSelectedBankWordIds([]);
  };

  const handleManualCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createDeck({
      title: newTitle.trim(),
      description: newDesc.trim(),
      icon: newIcon,
      tag: newTag,
      folderId: newFolderId,
      seedTopicId,
      rawWordsText,
    });
    setNewTitle('');
    setNewDesc('');
    setSeedTopicId('none');
    setRawWordsText('');
    setShowCreateModal(false);
    openDeckModal(created, 'list');
  };

  const handleAIGenerate = (e) => {
    e.preventDefault();
    setAiGenerating(true);
    setTimeout(() => {
      const created = generateAIDeck(aiTopic || 'Du lịch & Sân bay', aiLevel);
      setAiGenerating(false);
      setShowAIModal(false);
      setAiTopic('');
      openDeckModal(created, 'list');
    }, 500);
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

  const toggleBankWordSelection = (wordId) => {
    setSelectedBankWordIds((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleCopySelectedBankWords = () => {
    if (!viewingDeck || selectedBankWordIds.length === 0) return;
    const selectedObjs = words.filter((w) => selectedBankWordIds.includes(w.id));
    copyWordsToDeck(viewingDeck.id, selectedObjs);
    setSelectedBankWordIds([]);
    setModalTab('list');
  };

  const handleBulkImportSubmit = (e) => {
    e.preventDefault();
    if (!viewingDeck || !bulkText.trim()) return;
    const count = bulkAddWordsToDeck(viewingDeck.id, bulkText);
    if (count > 0) {
      setBulkText('');
      setModalTab('list');
    }
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
            Tạo bộ từ mới, chọn từ kho 3.000+ từ Oxford hoặc dùng AI tạo bộ từ và bấm Học ngay trên mọi chế độ
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
            placeholder="Tìm bộ từ TOEIC, IELTS, Cá nhân..."
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
                      onClick={() => openDeckModal(deck, 'list')}
                      title="Xem & thêm từ vựng vào bộ"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeckModal(deck, 'pick')}
                      title="Chọn thêm từ kho 3000+ từ"
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <Plus className="w-4 h-4" />
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
                  onClick={() => openDeckModal(deck, 'list')}
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
                    📚 {deckWords.length.toLocaleString()} từ vựng
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
                    onClick={() => openDeckModal(deck, 'list')}
                    className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Quản lý từ
                  </button>
                  <button
                    onClick={() => navigate(`/practice?deck=${deck.id}&mode=flashcard`)}
                    className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    🃏 Học ngay
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
                    Tự động sinh từ vựng, phiên âm IPA và câu ví dụ song ngữ để học ngay
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
                  placeholder="VD: Du lịch sân bay, Phỏng vấn xin việc, Tài chính, Y tế, Công nghệ..."
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
                    '💻 Công nghệ & Phần mềm',
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

      {/* MODAL 2: Manual Create Deck (With Topic Seeding & Initial Words Input) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Tạo bộ từ vựng mới
                </h3>
                <p className="text-xs text-slate-500">
                  Có thể nhập danh sách từ hoặc lấy từ chủ đề Oxford 3000+ để học được ngay
                </p>
              </div>
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
                  placeholder="VD: Từ vựng Reading Cam 18, Từ vựng Họp tiếng Anh..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả mục tiêu học của bộ từ này..."
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
                    Thư mục lưu trữ
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

              {/* Optional Seed from 29 Oxford Topics */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <label className="block text-xs font-extrabold text-indigo-900">
                  📚 Khởi tạo nhanh từ Kho Chủ đề Oxford 3000+ (Tùy chọn)
                </label>
                <select
                  value={seedTopicId}
                  onChange={(e) => setSeedTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800"
                >
                  <option value="none">
                    -- Tự thêm từ thủ công (Không lấy tự động theo chủ đề) --
                  </option>
                  {OXFORD_TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} Nạp sẵn 35 từ chủ đề: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Bulk Paste Initial Words */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  ⚡ Nhập danh sách từ vựng ban đầu (Tùy chọn - Mỗi dòng 1 từ)
                </label>
                <textarea
                  rows={4}
                  value={rawWordsText}
                  onChange={(e) => setRawWordsText(e.target.value)}
                  placeholder={`Gõ từ tiếng Anh hoặc "từ : nghĩa" (hệ thống tự động tra IPA & ví dụ):\nresilient\nbreakthrough : bước đột phá\nsustainable`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Mẹo: Bạn chỉ cần gõ từ tiếng Anh (VD: <code className="text-indigo-600">abandon</code>, <code className="text-indigo-600">negotiate</code>), hệ thống sẽ tự điền nghĩa Việt & IPA từ kho 3.375 từ!
                </p>
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
                  Tạo bộ từ & Mở danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CategoryViewModal (Inspect, Pick from 3000+ Bank, Bulk Import, & Practice) */}
      {viewingDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                  {viewingDeck.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {viewingDeck.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {words.filter((w) => w.deckId === viewingDeck.id).length} từ vựng
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 mt-0.5">
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

            {/* Modal Sub-navigation Tabs */}
            <div className="px-6 pt-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setModalTab('list')}
                className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'list'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  Danh sách từ trong bộ (
                  {words.filter((w) => w.deckId === viewingDeck.id).length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('pick')}
                className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'pick'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Library className="w-4 h-4" />
                <span>+ Chọn từ Kho 3000+ từ Oxford</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('bulk')}
                className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'bulk'
                    ? 'border-purple-600 text-purple-700 bg-purple-50/60'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FilePlus2 className="w-4 h-4" />
                <span>⚡ Nhập nhanh nhiều từ</span>
              </button>
            </div>

            {/* TAB 1: WORD LIST & QUICK ADD */}
            {modalTab === 'list' && (
              <>
                <form
                  onSubmit={handleQuickAddWord}
                  className="px-6 py-3 bg-indigo-50/60 border-b border-indigo-100 flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    value={quickWord}
                    onChange={(e) => setQuickWord(e.target.value)}
                    placeholder="Thêm nhanh từ tiếng Anh (VD: resilient, Deadline)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={quickMeaning}
                    onChange={(e) => setQuickMeaning(e.target.value)}
                    placeholder="Nghĩa tiếng Việt (để trống tự tra từ điển Oxford)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shrink-0"
                  >
                    + Thêm từ vào bộ
                  </button>
                </form>

                {/* Filter inside deck */}
                {words.filter((w) => w.deckId === viewingDeck.id).length > 5 && (
                  <div className="px-6 pt-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={deckSearch}
                        onChange={(e) => setDeckSearch(e.target.value)}
                        placeholder="Tìm kiếm từ trong bộ này..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {viewingDeckWords.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                      <p className="text-base font-extrabold text-slate-800">
                        Bộ từ này chưa có từ vựng nào!
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Hãy thêm từ ở thanh bên trên, hoặc chọn nhanh từ kho 3.375 từ Oxford có sẵn để bắt đầu luyện tập.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setModalTab('pick')}
                          className="btn-3d px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
                        >
                          📚 Chọn từ Kho 3000+ từ Oxford
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalTab('bulk')}
                          className="btn-3d px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold"
                        >
                          ⚡ Nhập hàng loạt từ danh sách
                        </button>
                      </div>
                    </div>
                  ) : (
                    viewingDeckWords.slice(0, 80).map((w, idx) => (
                      <div
                        key={w.id}
                        className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 flex items-start justify-between gap-4 bg-white transition"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="font-extrabold text-base text-slate-900">
                              {w.word}
                            </span>
                            <span className="text-xs font-mono text-indigo-600">
                              {w.ipa}
                            </span>
                            <span className="text-xs italic text-slate-500">
                              ({w.pos})
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700">
                              SRS Level {w.level}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-blue-700">
                            {w.meaning}
                          </p>
                          <p className="text-xs text-slate-600">“{w.example}”</p>
                          <p className="text-xs text-slate-400 italic">
                            → {w.exampleVi}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakWord(w.word)}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWord(w.id)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa từ khỏi bộ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* TAB 2: PICK WORDS FROM 3000+ OXFORD BANK */}
            {modalTab === 'pick' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 px-6 bg-emerald-50/60 border-b border-emerald-100 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={bankQuery}
                        onChange={(e) => setBankQuery(e.target.value)}
                        placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <select
                      value={bankTopic}
                      onChange={(e) => setBankTopic(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      <option value="all">🗂️ Tất cả 29 chủ đề Oxford 3000+</option>
                      {OXFORD_TOPICS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const pageIds = bankWordsPool.slice(0, 20).map((w) => w.id);
                          setSelectedBankWordIds(pageIds);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 font-bold text-xs hover:bg-emerald-100"
                      >
                        ✓ Chọn nhanh 20 từ đầu
                      </button>
                      {selectedBankWordIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedBankWordIds([])}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/60"
                        >
                          Bỏ chọn ({selectedBankWordIds.length})
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={selectedBankWordIds.length === 0}
                      onClick={handleCopySelectedBankWords}
                      className="btn-3d px-4 py-2 rounded-xl bg-emerald-600 disabled:opacity-40 text-white font-extrabold text-xs"
                    >
                      + Thêm {selectedBankWordIds.length} từ đã chọn vào bộ này
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid sm:grid-cols-2 gap-2.5">
                  {bankWordsPool.map((w) => {
                    const checked = selectedBankWordIds.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        onClick={() => toggleBankWordSelection(w.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                          checked
                            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-emerald-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-900">
                                {w.word}
                              </span>
                              <span className="text-[11px] font-mono text-indigo-600">
                                {w.ipa}
                              </span>
                              <span className="text-[10px] italic text-slate-400">
                                ({w.pos})
                              </span>
                            </div>
                            <p className="text-xs font-bold text-blue-700 mt-0.5">
                              {w.meaning}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyWordsToDeck(viewingDeck.id, [w]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[11px] shrink-0"
                        >
                          + Thêm
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: BULK IMPORT TEXT */}
            {modalTab === 'bulk' && (
              <form
                onSubmit={handleBulkImportSubmit}
                className="flex-1 p-6 flex flex-col justify-between space-y-4 overflow-y-auto"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-extrabold text-slate-800">
                    ⚡ Dán danh sách từ vựng muốn thêm vào bộ “{viewingDeck.title}”
                  </label>
                  <p className="text-xs text-slate-500">
                    Mỗi dòng 1 từ theo cú pháp <code className="text-indigo-600 font-bold">từ tiếng Anh : nghĩa tiếng Việt</code>, hoặc chỉ cần gõ danh sách từ tiếng Anh (hệ thống tự động tra cứu IPA, từ loại, nghĩa & câu ví dụ từ kho Oxford 3000+).
                  </p>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Ví dụ:\naccomplish\nnegotiate : đàm phán, thương lượng\nsustainable : bền vững\ndeadline\nresilient`}
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('list')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Quay lại danh sách
                  </button>
                  <button
                    type="submit"
                    className="btn-3d px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs"
                  >
                    + Nhập tất cả vào bộ từ
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500">
                Tổng cộng trong bộ:{' '}
                <strong className="text-slate-900">
                  {words.filter((w) => w.deckId === viewingDeck.id).length} từ vựng
                </strong>
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
                  <span>Học Flashcard bộ này</span>
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
                  <span>Chơi 6 Game bộ này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
