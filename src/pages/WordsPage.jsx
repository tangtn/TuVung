import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Volume2,
  Trash2,
  Sparkles,
  X,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  FolderPlus,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAGE_SIZE = 24;

export default function WordsPage() {
  const {
    decks,
    words,
    addWord,
    deleteWord,
    copyWordsToDeck,
    setWordLevelDirect,
    speakWord,
    OXFORD_TOPICS,
    SRS_LEVELS,
    SMART_DICTIONARY,
    showToast,
    getWordIllustration,
    getFallbackSvgDataUri,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedDeck, setSelectedDeck] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Word Multi-Selection State for studying or adding to a custom deck
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [targetDeckForCopy, setTargetDeckForCopy] = useState(
    decks[0]?.id || 'deck-oxford-daily'
  );

  // Add Word Form State
  const [formData, setFormData] = useState({
    deckId: decks[0]?.id || 'deck-oxford-daily',
    word: '',
    ipa: '',
    pos: 'n',
    meaning: '',
    example: '',
    exampleVi: '',
  });

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f === 'due' || f === 'learning' || f === 'mastered') {
      setSelectedFilter(f);
    }
    const d = searchParams.get('deck');
    if (d) {
      setSelectedDeck(d);
    }
  }, [searchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDeck, selectedTopic, selectedFilter, selectedLetter, query]);

  const nowTs = Date.now();

  const filteredWords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      const matchDeck = selectedDeck === 'all' || w.deckId === selectedDeck;
      if (!matchDeck) return false;

      const matchTopic = selectedTopic === 'all' || w.topicId === selectedTopic;
      if (!matchTopic) return false;

      if (selectedLetter !== 'all') {
        const firstChar = (w.word || '').charAt(0).toUpperCase();
        if (firstChar !== selectedLetter) return false;
      }

      if (selectedFilter === 'due') {
        if (!(w.level > 0 && w.level < 5 && w.nextReview <= nowTs)) return false;
      } else if (selectedFilter === 'learning') {
        if (!(w.level >= 1 && w.level <= 4)) return false;
      } else if (selectedFilter === 'mastered') {
        if (w.level !== 5) return false;
      } else if (selectedFilter === 'new') {
        if (w.level !== 0) return false;
      } else if (selectedFilter.startsWith('lvl-')) {
        const targetLvl = Number(selectedFilter.replace('lvl-', ''));
        if (w.level !== targetLvl) return false;
      }

      if (q) {
        const hit =
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          (w.example && w.example.toLowerCase().includes(q));
        if (!hit) return false;
      }

      return true;
    });
  }, [words, selectedDeck, selectedTopic, selectedLetter, selectedFilter, query, nowTs]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedWords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safePage]);

  const toggleSelectWord = (wordId) => {
    setSelectedWordIds((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const isCurrentPageAllSelected =
    paginatedWords.length > 0 &&
    paginatedWords.every((w) => selectedWordIds.includes(w.id));

  const toggleSelectCurrentPage = () => {
    const pageIds = paginatedWords.map((w) => w.id);
    if (isCurrentPageAllSelected) {
      setSelectedWordIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedWordIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleCopySelectedToDeck = () => {
    if (selectedWordIds.length === 0 || !targetDeckForCopy) return;
    const selectedObjs = words.filter((w) => selectedWordIds.includes(w.id));
    copyWordsToDeck(targetDeckForCopy, selectedObjs);
    setSelectedWordIds([]);
  };

  const handlePracticeCurrentFilter = () => {
    if (selectedWordIds.length > 0) {
      navigate(`/practice?ids=${selectedWordIds.join(',')}&mode=flashcard`);
      return;
    }
    const params = new URLSearchParams();
    params.set('deck', selectedDeck);
    params.set('topic', selectedTopic);
    params.set('filter', selectedFilter === 'mastered' || selectedFilter === 'new' || selectedFilter === 'learning' || selectedFilter === 'due' ? selectedFilter : 'all');
    params.set('letter', selectedLetter);
    params.set('mode', 'flashcard');
    navigate(`/practice?${params.toString()}`);
  };

  const handleSmartAutoFill = () => {
    const key = formData.word.trim().toLowerCase();
    if (!key) {
      showToast('Hãy nhập từ tiếng Anh trước để tự động điền!', 'error');
      return;
    }
    const found = SMART_DICTIONARY[key];
    if (found) {
      setFormData((prev) => ({
        ...prev,
        ipa: found.ipa,
        pos: found.pos,
        meaning: found.meaning,
        example: found.example,
        exampleVi: found.exampleVi,
      }));
      showToast(`✨ Đã tự động điền phiên âm, nghĩa & câu ví dụ cho "${formData.word}"!`);
    } else {
      setFormData((prev) => ({
        ...prev,
        ipa: `/${key}/`,
        meaning: prev.meaning || `Nghĩa của từ ${formData.word}`,
        example: `Using the word "${formData.word}" in a sentence helps you remember it.`,
        exampleVi: `Đặt câu với từ "${formData.word}" giúp bạn ghi nhớ từ lâu hơn.`,
      }));
      showToast(`✨ Đã tạo mẫu phiên âm & câu ví dụ cho "${formData.word}"!`);
    }
  };

  const handleCreateWord = (e, studyImmediately = false) => {
    if (e) e.preventDefault();
    if (!formData.word.trim()) return;
    const created = addWord({
      deckId: formData.deckId,
      word: formData.word,
      ipa: formData.ipa,
      pos: formData.pos,
      meaning: formData.meaning,
      example: formData.example,
      exampleVi: formData.exampleVi,
    });
    setFormData((prev) => ({
      ...prev,
      word: '',
      ipa: '',
      meaning: '',
      example: '',
      exampleVi: '',
    }));
    setShowAddModal(false);
    if (studyImmediately && created) {
      navigate(`/practice?deck=${created.deckId}&ids=${created.id}&mode=flashcard`);
    }
  };

  const formatReviewTime = (w) => {
    if (w.level === 5) return 'Đã thuộc, không còn lịch ôn';
    if (w.level === 0) return 'Chưa học';
    const diff = w.nextReview - nowTs;
    if (diff <= 0) return '🔥 Cần ôn ngay bây giờ';
    const days = Math.ceil(diff / (24 * 3600 * 1000));
    return `Ôn sau ${days} ngày`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Kho Từ Vựng Oxford 3000+ & Lịch Ôn SRS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kho Từ Vựng ({filteredWords.length.toLocaleString()} / {words.length.toLocaleString()} từ)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tích chọn các từ vựng bất kỳ để thêm vào bộ từ cá nhân hoặc bấm Học ngay trên 6 chế độ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-3d px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ mới</span>
          </button>
          <button
            onClick={handlePracticeCurrentFilter}
            className="btn-3d px-4 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>
              {selectedWordIds.length > 0
                ? `Học ngay ${selectedWordIds.length} từ đã chọn`
                : `Luyện tập bộ lọc này (${filteredWords.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Multi-Select Action Bar (Appears when words are checked or for quick batch selection) */}
      <div className="bg-indigo-50/90 border border-indigo-200 p-4 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectCurrentPage}
            className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center gap-2 transition"
          >
            {isCurrentPageAllSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {isCurrentPageAllSelected
                ? 'Bỏ chọn trang này'
                : `Chọn cả trang này (${paginatedWords.length} từ)`}
            </span>
          </button>

          <span className="text-xs font-extrabold text-indigo-950">
            Đã chọn:{' '}
            <strong className="text-blue-600">{selectedWordIds.length}</strong> từ
          </span>

          {selectedWordIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedWordIds([])}
              className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
            >
              Xóa lựa chọn
            </button>
          )}
        </div>

        {/* Copy Selected Words to Deck or Study Selected Immediately */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={targetDeckForCopy}
            onChange={(e) => setTargetDeckForCopy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                📁 Đích: {d.icon} {d.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={selectedWordIds.length === 0}
            onClick={handleCopySelectedToDeck}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Thêm vào bộ từ</span>
          </button>

          <button
            type="button"
            disabled={selectedWordIds.length === 0}
            onClick={() =>
              navigate(`/practice?ids=${selectedWordIds.join(',')}&mode=flashcard`)
            }
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Học Flashcard các từ chọn</span>
          </button>

          <button
            type="button"
            disabled={selectedWordIds.length === 0}
            onClick={() =>
              navigate(`/practice?ids=${selectedWordIds.join(',')}&mode=quiz`)
            }
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Chơi Game các từ chọn</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm trong 3.000+ từ (tiếng Anh, nghĩa Việt)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Deck Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">📚 Tất cả bộ từ ({words.length.toLocaleString()} từ)</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.title} ({words.filter((w) => w.deckId === d.id).length} từ)
                </option>
              ))}
            </select>
          </div>

          {/* 29 Oxford Topics Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">🗂️ Tất cả 29 chủ đề Oxford</option>
              {OXFORD_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* SRS Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">🎯 Mọi Level SRS</option>
              <option value="due">🔥 Cần ôn ngay</option>
              <option value="learning">📈 Đang học (Lv 1-4)</option>
              <option value="mastered">✅ Đã thuộc (Lv 5)</option>
              <option value="new">🆕 Chưa học (Lv 0)</option>
              <option value="lvl-1">Level 1</option>
              <option value="lvl-2">Level 2</option>
              <option value="lvl-3">Level 3</option>
              <option value="lvl-4">Level 4</option>
            </select>
          </div>
        </div>

        {/* Alphabet A-Z Quick Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedLetter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
              selectedLetter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            A-Z ({words.length.toLocaleString()})
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-8 h-8 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center justify-center ${
                selectedLetter === letter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination Summary & View Mode Toggle Bar (Top) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs font-bold text-slate-500">
        <span>
          Đang hiển thị từ{' '}
          <strong className="text-slate-900">
            {filteredWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
          </strong>{' '}
          –{' '}
          <strong className="text-slate-900">
            {Math.min(safePage * PAGE_SIZE, filteredWords.length)}
          </strong>{' '}
          trong tổng số{' '}
          <strong className="text-emerald-600">
            {filteredWords.length.toLocaleString()} từ vựng
          </strong>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher: List vs Visual Grid */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Danh sách + Ảnh
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🖼️ Thẻ Ảnh Trực Quan
            </button>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800">
                Trang {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Words List / Visual Grid */}
      {paginatedWords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-base font-bold text-slate-700 mb-1">
            Không tìm thấy từ vựng nào khớp với bộ lọc
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Hãy thử đổi chữ cái, chủ đề hoặc xóa từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => {
              setSelectedDeck('all');
              setSelectedTopic('all');
              setSelectedFilter('all');
              setSelectedLetter('all');
              setQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Đặt lại toàn bộ bộ lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* VISUAL PHOTO CARDS GRID MODE */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedWords.map((w) => {
            const deckObj = decks.find((d) => d.id === w.deckId);
            const lvlInfo =
              SRS_LEVELS.find((l) => l.level === w.level) || SRS_LEVELS[0];
            const isChecked = selectedWordIds.includes(w.id);

            return (
              <div
                key={w.id}
                className={`bg-white rounded-3xl overflow-hidden border transition shadow-xs hover:shadow-xl flex flex-col justify-between group ${
                  isChecked
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={w.image || getWordIllustration(w)}
                      alt={w.word}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackSvgDataUri(w);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleSelectWord(w.id)}
                        className="p-1.5 rounded-xl bg-white/95 text-blue-600 shadow-xs"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs ${lvlInfo.bg}`}
                      >
                        {lvlInfo.name}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-extrabold text-white drop-shadow-xs">
                          {w.word}
                        </h3>
                        <p className="text-xs font-mono text-indigo-200">
                          {w.ipa} ({w.pos})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWord(w.word)}
                        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-base font-extrabold text-blue-700">
                      {w.meaning}
                    </p>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      “{w.example}”
                    </p>
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">
                      → {w.exampleVi}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {deckObj ? (
                    <span className="text-[11px] font-bold text-slate-600 truncate">
                      {deckObj.icon} {deckObj.tag}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/practice?deck=${w.deckId}&ids=${w.id}&mode=flashcard`)
                    }
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shrink-0"
                  >
                    🃏 Học từ này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED LIST MODE WITH ILLUSTRATION THUMBNAILS */
        <div className="space-y-3">
          {paginatedWords.map((w) => {
            const deckObj = decks.find((d) => d.id === w.deckId);
            const lvlInfo =
              SRS_LEVELS.find((l) => l.level === w.level) || SRS_LEVELS[0];
            const isDue = w.level > 0 && w.level < 5 && w.nextReview <= nowTs;
            const isChecked = selectedWordIds.includes(w.id);

            return (
              <div
                key={w.id}
                className={`bg-white rounded-3xl p-5 border transition shadow-xs hover:shadow-md ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/15'
                    : isDue
                    ? 'border-orange-300 bg-orange-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Word Illustration + Details */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    {/* Illustrative Image Thumbnail */}
                    <div
                      onClick={() => speakWord(w.word)}
                      className="relative w-full sm:w-28 h-36 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer group bg-slate-900"
                      title="Bấm vào ảnh để nghe phát âm"
                    >
                      <img
                        src={w.image || getWordIllustration(w)}
                        alt={w.word}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackSvgDataUri(w);
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                        {w.topicIcon || '📸'}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Select Checkbox for studying / copying to deck */}
                        <button
                          type="button"
                          onClick={() => toggleSelectWord(w.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition"
                          title="Tích chọn từ này để học hoặc thêm vào bộ từ"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                          )}
                        </button>

                        <button
                          onClick={() => speakWord(w.word)}
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => speakWord(w.word, true)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
                          title="Nghe phát âm chậm"
                        >
                          🐢 Chậm
                        </button>

                        <h3 className="text-xl font-extrabold text-slate-900">
                          {w.word}
                        </h3>
                        <span className="text-sm font-mono text-indigo-600 font-semibold">
                          {w.ipa}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold italic">
                          {w.pos}
                        </span>

                        {w.topicName && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            {w.topicIcon || '📘'} {w.topicName}
                          </span>
                        )}

                        {deckObj && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                            {deckObj.icon} {deckObj.title}
                          </span>
                        )}
                      </div>

                      <p className="text-base font-extrabold text-blue-700">
                        {w.meaning}
                      </p>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm font-medium text-slate-800">
                            “{w.example}”
                          </p>
                          <button
                            onClick={() => speakWord(w.example)}
                            className="text-slate-400 hover:text-blue-600 shrink-0"
                            title="Đọc câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          → {w.exampleVi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right SRS Controls & Direct Study Button */}
                  <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/practice?deck=${w.deckId}&ids=${w.id}&mode=flashcard`)
                        }
                        className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold transition"
                      >
                        🃏 Học từ này
                      </button>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${lvlInfo.bg}`}
                      >
                        {lvlInfo.name}
                      </span>
                      <button
                        onClick={() => deleteWord(w.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Xóa từ vựng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Direct SRS Level Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">
                        Đổi Level:
                      </span>
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setWordLevelDirect(w.id, lvl)}
                          className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                            w.level === lvl
                              ? 'bg-slate-900 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={
                            lvl === 5
                              ? 'Đánh dấu Đã thuộc lòng'
                              : `Chuyển sang Level ${lvl}`
                          }
                        >
                          {lvl === 5 ? '✓' : lvl}
                        </button>
                      ))}
                    </div>

                    <p
                      className={`text-[11px] font-bold ${
                        isDue
                          ? 'text-orange-600'
                          : w.level === 5
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatReviewTime(w)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500">
            Trang {safePage} / {totalPages} ({filteredWords.length.toLocaleString()} từ)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold"
            >
              Đầu
            </button>
            <button
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>

            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">
              {safePage}
            </span>

            <button
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage(totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold"
            >
              Cuối ({totalPages})
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Personal Vocabulary */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Tạo từ vựng cá nhân mới
                </h3>
                <p className="text-xs text-slate-500">
                  Hỗ trợ tra cứu & tự động điền từ kho từ điển Oxford 3000+ tích hợp sẵn
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateWord(e, false)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Chọn bộ từ vựng để lưu vào
                </label>
                <select
                  value={formData.deckId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deckId: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Từ tiếng Anh *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.word}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, word: e.target.value }))
                    }
                    placeholder="VD: resilient, procrastinate, breakthrough..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSmartAutoFill}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-extrabold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tự điền AI</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Phiên âm IPA
                  </label>
                  <input
                    type="text"
                    value={formData.ipa}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, ipa: e.target.value }))
                    }
                    placeholder="/rɪˈzɪliənt/"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Từ loại
                  </label>
                  <select
                    value={formData.pos}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, pos: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="n">Danh từ (n)</option>
                    <option value="v">Động từ (v)</option>
                    <option value="adj">Tính từ (adj)</option>
                    <option value="adv">Trạng từ (adv)</option>
                    <option value="phr">Cụm từ (phr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nghĩa tiếng Việt (để trống sẽ tự điền)
                </label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meaning: e.target.value }))
                  }
                  placeholder="VD: kiên cường, có khả năng phục hồi nhanh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Câu ví dụ tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.example}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, example: e.target.value }))
                  }
                  placeholder="VD: Children are often remarkably resilient..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Dịch nghĩa câu ví dụ
                </label>
                <input
                  type="text"
                  value={formData.exampleVi}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      exampleVi: e.target.value,
                    }))
                  }
                  placeholder="VD: Trẻ em thường có khả năng thích nghi đáng kinh ngạc..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-3d px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
                >
                  Lưu từ vựng
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateWord(e, true)}
                  className="btn-3d px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold"
                >
                  Lưu & Học ngay →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
