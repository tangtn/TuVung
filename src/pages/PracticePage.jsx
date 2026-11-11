import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  Flame,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Layers,
  Headphones,
  Keyboard,
  Puzzle,
  Shuffle,
  HelpCircle,
  Trophy,
  Plus,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const GAME_MODES = [
  {
    id: 'flashcard',
    name: 'Flashcard SRS',
    subtitle: 'Lật thẻ 3D & Lặp lại ngắt quãng',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Cốt lõi SRS',
  },
  {
    id: 'quiz',
    name: 'Trắc nghiệm (Quiz)',
    subtitle: 'Chọn nhanh nghĩa đúng • Săn Combo',
    icon: HelpCircle,
    color: 'from-orange-500 to-amber-500',
    badge: 'Phản xạ',
  },
  {
    id: 'match',
    name: 'Ghép thẻ (Memory Match)',
    subtitle: 'Nối cặp Từ tiếng Anh ↔ Nghĩa tiếng Việt',
    icon: Puzzle,
    color: 'from-purple-500 to-fuchsia-600',
    badge: 'Trò chơi',
  },
  {
    id: 'scramble',
    name: 'Sắp xếp từ (Word Scramble)',
    subtitle: 'Ghép các chữ cái xáo trộn thành từ đúng',
    icon: Shuffle,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Nhớ mặt chữ',
  },
  {
    id: 'spelling',
    name: 'Gõ từ ngữ cảnh (Spelling)',
    subtitle: 'Điền từ tiếng Anh vào câu ví dụ khuyết',
    icon: Keyboard,
    color: 'from-rose-500 to-pink-600',
    badge: 'Viết & Ngữ cảnh',
  },
  {
    id: 'listening',
    name: 'Nghe & Viết (Listening)',
    subtitle: 'Nghe phát âm chuẩn và gõ lại chính tả',
    icon: Headphones,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Luyện nghe',
  },
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PracticePage() {
  const {
    decks,
    words,
    dueWords,
    OXFORD_TOPICS,
    speakWord,
    playSound,
    reviewWord,
    setWordLevelDirect,
    rewardGameCompletion,
    addWord,
    copyWordsToDeck,
    SRS_LEVELS,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filter & Mode Selection
  const [activeMode, setActiveMode] = useState(
    searchParams.get('mode') || 'flashcard'
  );
  const [selectedDeckId, setSelectedDeckId] = useState(
    searchParams.get('deck') || 'all'
  );
  const [selectedTopic, setSelectedTopic] = useState(
    searchParams.get('topic') || 'all'
  );
  const [srsFilter, setSrsFilter] = useState(
    searchParams.get('filter') || 'all'
  );
  const [selectedLetter, setSelectedLetter] = useState(
    searchParams.get('letter') || 'all'
  );
  const [sessionLimit, setSessionLimit] = useState(20);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Specific word selection (checked word IDs in the selector panel)
  const [excludedWordIds, setExcludedWordIds] = useState([]);
  const [urlPickedIds, setUrlPickedIds] = useState([]);

  // Inline Quick Add Word state for the currently selected deck
  const [quickWord, setQuickWord] = useState('');
  const [quickMeaning, setQuickMeaning] = useState('');

  // Sync state when URL query params change
  useEffect(() => {
    const m = searchParams.get('mode');
    const d = searchParams.get('deck');
    const t = searchParams.get('topic');
    const f = searchParams.get('filter');
    const l = searchParams.get('letter');
    const idsParam = searchParams.get('ids');

    if (m && GAME_MODES.some((gm) => gm.id === m)) setActiveMode(m);
    if (d) setSelectedDeckId(d);
    if (t) setSelectedTopic(t);
    if (f) setSrsFilter(f);
    if (l) setSelectedLetter(l);
    if (idsParam) {
      setUrlPickedIds(idsParam.split(',').filter(Boolean));
    } else {
      setUrlPickedIds([]);
    }
    setExcludedWordIds([]);
  }, [searchParams]);

  // Base words matching the chosen Deck / Topic / Letter / URL IDs
  const baseDeckWords = useMemo(() => {
    if (urlPickedIds.length > 0) {
      const idSet = new Set(urlPickedIds);
      const picked = words.filter((w) => idSet.has(w.id));
      if (picked.length > 0) return picked;
    }

    return words.filter((w) => {
      if (selectedDeckId !== 'all' && w.deckId !== selectedDeckId) return false;
      if (selectedTopic !== 'all' && w.topicId !== selectedTopic) return false;
      if (selectedLetter !== 'all') {
        const first = (w.word || '').charAt(0).toUpperCase();
        if (first !== selectedLetter) return false;
      }
      return true;
    });
  }, [words, selectedDeckId, selectedTopic, selectedLetter, urlPickedIds]);

  // Apply SRS filter (with smart notice if filter has 0 matches inside a non-empty deck)
  const { filteredDeckWords, filterFallbackUsed } = useMemo(() => {
    if (baseDeckWords.length === 0) {
      return { filteredDeckWords: [], filterFallbackUsed: false };
    }
    const nowTs = Date.now();
    let list = baseDeckWords;

    if (srsFilter === 'due') {
      list = baseDeckWords.filter(
        (w) => w.level > 0 && w.level < 5 && w.nextReview <= nowTs
      );
    } else if (srsFilter === 'learning') {
      list = baseDeckWords.filter((w) => w.level >= 1 && w.level <= 4);
    } else if (srsFilter === 'unmastered') {
      list = baseDeckWords.filter((w) => w.level < 5);
    } else if (srsFilter === 'new') {
      list = baseDeckWords.filter((w) => w.level === 0);
    } else if (srsFilter === 'mastered') {
      list = baseDeckWords.filter((w) => w.level === 5);
    }

    if (list.length === 0 && srsFilter !== 'all') {
      return { filteredDeckWords: baseDeckWords, filterFallbackUsed: true };
    }
    return { filteredDeckWords: list, filterFallbackUsed: false };
  }, [baseDeckWords, srsFilter]);

  // Active session pool after user checkboxes & shuffle
  const sessionPool = useMemo(() => {
    const active = filteredDeckWords.filter(
      (w) => !excludedWordIds.includes(w.id)
    );
    const pool = active.length > 0 ? active : filteredDeckWords;
    if (shuffleSeed > 0) {
      return shuffleArray(pool);
    }
    return pool;
  }, [filteredDeckWords, excludedWordIds, shuffleSeed]);

  // Shared Game Session State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [correctIds, setCorrectIds] = useState([]);
  const [wrongIds, setWrongIds] = useState([]);
  const [combo, setCombo] = useState(0);
  const [earnedReward, setEarnedReward] = useState(null);

  // Quiz Mode State
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);

  // Memory Match Mode State
  const [matchCards, setMatchCards] = useState([]);
  const [selectedMatchTile, setSelectedMatchTile] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongPairIds, setWrongPairIds] = useState([]);
  const [matchMoves, setMatchMoves] = useState(0);

  // Word Scramble State
  const [scrambleLetters, setScrambleLetters] = useState([]);
  const [pickedLetters, setPickedLetters] = useState([]);
  const [scrambleStatus, setScrambleStatus] = useState(null);

  // Spelling & Listening State
  const [typedInput, setTypedInput] = useState('');
  const [typingStatus, setTypingStatus] = useState(null);
  const [hintCount, setHintCount] = useState(0);

  const totalSessionQuestions = Math.max(
    1,
    Math.min(sessionPool.length, sessionLimit)
  );
  const safeIndex =
    sessionPool.length > 0
      ? Math.min(currentIndex, sessionPool.length - 1)
      : 0;
  const currentWord = sessionPool[safeIndex] || sessionPool[0];

  // Build Memory Match board helper
  const buildMatchBoard = (pool) => {
    const sample = shuffleArray(pool).slice(0, Math.min(6, pool.length));
    const tiles = [];
    sample.forEach((w) => {
      tiles.push({
        tileId: `en-${w.id}`,
        wordId: w.id,
        type: 'en',
        text: w.word,
        sub: w.ipa,
      });
      tiles.push({
        tileId: `vi-${w.id}`,
        wordId: w.id,
        type: 'vi',
        text: w.meaning,
        sub: `(${w.pos})`,
      });
    });
    setMatchCards(shuffleArray(tiles));
    setSelectedMatchTile(null);
    setMatchedIds([]);
    setWrongPairIds([]);
    setMatchMoves(0);
  };

  // Reset session when mode, deck, topic, or filter changes
  const startNewSession = (customMode = activeMode) => {
    setCurrentIndex(0);
    setFlipped(false);
    setSessionFinished(false);
    setCorrectIds([]);
    setWrongIds([]);
    setCombo(0);
    setEarnedReward(null);
    setSelectedQuizAnswer(null);
    setTypedInput('');
    setTypingStatus(null);
    setHintCount(0);

    if (customMode === 'match' && sessionPool.length > 0) {
      buildMatchBoard(sessionPool);
    }
  };

  useEffect(() => {
    startNewSession(activeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeMode,
    selectedDeckId,
    selectedTopic,
    srsFilter,
    selectedLetter,
    sessionLimit,
    shuffleSeed,
    urlPickedIds,
  ]);

  // Rebuild match board if words are added or toggled in match mode
  useEffect(() => {
    if (activeMode === 'match' && sessionPool.length > 0 && matchCards.length === 0) {
      buildMatchBoard(sessionPool);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, sessionPool]);

  // Prepare Quiz / Scramble / Listening per question
  useEffect(() => {
    if (!currentWord || sessionFinished) return;

    if (activeMode === 'quiz') {
      // Draw distractors from same deck first, then global words if deck has < 4 words
      const sameDeckOthers = baseDeckWords.filter(
        (w) => w.id !== currentWord.id && w.meaning !== currentWord.meaning
      );
      const globalOthers = words.filter(
        (w) => w.id !== currentWord.id && w.meaning !== currentWord.meaning
      );
      const sourcePool =
        sameDeckOthers.length >= 3 ? sameDeckOthers : globalOthers;
      const distractors = shuffleArray(sourcePool).slice(0, 3);
      const opts = shuffleArray([currentWord, ...distractors]);
      setQuizOptions(opts);
      setSelectedQuizAnswer(null);
    } else if (activeMode === 'scramble') {
      const cleanChars = currentWord.word.split('').map((ch, idx) => ({
        id: `${idx}-${ch}`,
        char: ch,
      }));
      setScrambleLetters(shuffleArray(cleanChars));
      setPickedLetters([]);
      setScrambleStatus(null);
    } else if (activeMode === 'spelling' || activeMode === 'listening') {
      setTypedInput('');
      setTypingStatus(null);
      setHintCount(0);
      if (activeMode === 'listening') {
        setTimeout(() => speakWord(currentWord.word), 250);
      }
    }
  }, [
    safeIndex,
    activeMode,
    currentWord,
    sessionFinished,
    baseDeckWords,
    words,
    speakWord,
  ]);

  // Keyboard shortcuts for Flashcard mode
  useEffect(() => {
    if (activeMode !== 'flashcard' || sessionFinished || !currentWord) return;
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'SELECT' ||
        e.target.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        playSound('flip');
        setFlipped((f) => !f);
      } else if (e.key === '1') {
        handleFlashcardRate('again');
      } else if (e.key === '2') {
        handleFlashcardRate('hard');
      } else if (e.key === '3') {
        handleFlashcardRate('good');
      } else if (e.key === '4') {
        handleFlashcardRate('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const finishSession = (finalCorrectCount, totalCount) => {
    const modeObj = GAME_MODES.find((m) => m.id === activeMode);
    const reward = rewardGameCompletion({
      correctCount: finalCorrectCount,
      totalCount,
      gameName: modeObj?.name || 'Bài luyện tập',
    });
    setEarnedReward(reward);
    setSessionFinished(true);
  };

  const advanceQuestion = (wasCorrect) => {
    if (!currentWord) return;
    const nextCorrect = wasCorrect
      ? [...correctIds, currentWord.id]
      : correctIds;
    const nextWrong = !wasCorrect ? [...wrongIds, currentWord.id] : wrongIds;

    if (wasCorrect) {
      setCorrectIds(nextCorrect);
      setCombo((c) => c + 1);
    } else {
      setWrongIds(nextWrong);
      setCombo(0);
    }

    if (safeIndex + 1 >= totalSessionQuestions) {
      finishSession(nextCorrect.length, totalSessionQuestions);
    } else {
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  };

  // --- MODE 1: FLASHCARD HANDLER ---
  const handleFlashcardRate = (rating) => {
    if (!currentWord) return;
    reviewWord(currentWord.id, rating);
    advanceQuestion(rating !== 'again');
  };

  // --- MODE 2: QUIZ HANDLER ---
  const handleSelectQuizOption = (option) => {
    if (selectedQuizAnswer || !currentWord) return;
    setSelectedQuizAnswer(option.id);
    const isCorrect = option.id === currentWord.id;
    speakWord(currentWord.word);
    reviewWord(currentWord.id, isCorrect ? 'good' : 'again');
  };

  // --- MODE 3: MEMORY MATCH HANDLER ---
  const handleTileClick = (tile) => {
    if (matchedIds.includes(tile.wordId)) return;
    if (selectedMatchTile?.tileId === tile.tileId) {
      setSelectedMatchTile(null);
      return;
    }

    if (!selectedMatchTile) {
      playSound('flip');
      if (tile.type === 'en') speakWord(tile.text);
      setSelectedMatchTile(tile);
      return;
    }

    setMatchMoves((m) => m + 1);

    if (
      selectedMatchTile.wordId === tile.wordId &&
      selectedMatchTile.type !== tile.type
    ) {
      playSound('correct');
      const nextMatched = [...matchedIds, tile.wordId];
      setMatchedIds(nextMatched);
      setSelectedMatchTile(null);
      reviewWord(tile.wordId, 'good');

      const totalPairs = matchCards.length / 2;
      if (nextMatched.length >= totalPairs) {
        setTimeout(() => {
          setCorrectIds(nextMatched);
          finishSession(totalPairs, totalPairs);
        }, 450);
      }
    } else {
      playSound('wrong');
      setWrongPairIds([selectedMatchTile.tileId, tile.tileId]);
      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedMatchTile(null);
      }, 550);
    }
  };

  // --- MODE 4: WORD SCRAMBLE HANDLER ---
  const handlePickScrambleLetter = (letterObj) => {
    if (scrambleStatus === 'correct' || !currentWord) return;
    playSound('key');
    const nextPicked = [...pickedLetters, letterObj];
    setPickedLetters(nextPicked);
    setScrambleLetters((prev) => prev.filter((l) => l.id !== letterObj.id));

    const formed = nextPicked.map((l) => l.char).join('');
    if (formed.length === currentWord.word.length) {
      if (formed.toLowerCase() === currentWord.word.toLowerCase()) {
        setScrambleStatus('correct');
        speakWord(currentWord.word);
        reviewWord(currentWord.id, 'good');
      } else {
        setScrambleStatus('wrong');
        playSound('wrong');
      }
    }
  };

  const handleUnpickScrambleLetter = (letterObj) => {
    if (scrambleStatus === 'correct') return;
    playSound('key');
    setPickedLetters((prev) => prev.filter((l) => l.id !== letterObj.id));
    setScrambleLetters((prev) => [...prev, letterObj]);
    setScrambleStatus(null);
  };

  // --- MODE 5 & 6: SPELLING & LISTENING HANDLER ---
  const handleCheckTyping = (e) => {
    e.preventDefault();
    if (!typedInput.trim() || typingStatus === 'correct' || !currentWord) return;
    const isCorrect =
      typedInput.trim().toLowerCase() === currentWord.word.trim().toLowerCase();
    if (isCorrect) {
      setTypingStatus('correct');
      speakWord(currentWord.word);
      reviewWord(currentWord.id, 'good');
    } else {
      setTypingStatus('wrong');
      playSound('wrong');
    }
  };

  const handleGiveHint = () => {
    if (!currentWord) return;
    const nextHintLen = Math.min(currentWord.word.length, hintCount + 2);
    setHintCount(nextHintLen);
    setTypedInput(currentWord.word.slice(0, nextHintLen));
    playSound('key');
  };

  const getMaskedExample = (w) => {
    if (!w?.example) return '___';
    const escaped = w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(w.example)) {
      return w.example.replace(regex, '_______');
    }
    return `${w.example} (_______)`;
  };

  const handleInlineAddWord = (e) => {
    e.preventDefault();
    if (!quickWord.trim()) return;
    const targetDeck =
      selectedDeckId !== 'all'
        ? selectedDeckId
        : decks[0]?.id || 'deck-oxford-daily';
    const created = addWord({
      deckId: targetDeck,
      word: quickWord,
      meaning: quickMeaning,
    });
    setQuickWord('');
    setQuickMeaning('');
    if (created) {
      setCurrentIndex(0);
    }
  };

  const toggleWordIncluded = (wordId) => {
    setExcludedWordIds((prev) => {
      if (prev.includes(wordId)) {
        return prev.filter((id) => id !== wordId);
      }
      // Prevent unchecking the very last remaining word
      if (filteredDeckWords.length - prev.length <= 1) {
        return prev;
      }
      return [...prev, wordId];
    });
    setCurrentIndex(0);
  };

  const progressPct = Math.round(
    ((safeIndex + 1) / totalSessionQuestions) * 100
  );
  const currentDeckObj = decks.find((d) => d.id === selectedDeckId);

  return (
    <div className="space-y-6">
      {/* Top Game Mode & Deck/Topic Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>Trung tâm Luyện Từ & 6 Chế độ Tương tác</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {currentDeckObj
                ? `Đang học: ${currentDeckObj.icon} ${currentDeckObj.title} (${baseDeckWords.length} từ)`
                : `Học Từ Vựng Thông Minh (${sessionPool.length.toLocaleString()} từ đang chọn)`}
            </h1>
          </div>

          {/* Comprehensive Selectors: Deck, Topic, SRS Filter, Session Size, Shuffle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Deck Selector */}
            <select
              value={selectedDeckId}
              onChange={(e) => {
                setUrlPickedIds([]);
                setSelectedDeckId(e.target.value);
              }}
              className="px-3 py-2 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs font-extrabold text-blue-900 focus:outline-none focus:border-blue-500"
            >
              <option value="all">
                📚 Tất cả bộ từ ({words.length.toLocaleString()} từ)
              </option>
              {decks.map((d) => {
                const cnt = words.filter((w) => w.deckId === d.id).length;
                return (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.title} ({cnt} từ)
                  </option>
                );
              })}
            </select>

            {/* 2. Oxford 29 Topic Selector */}
            <select
              value={selectedTopic}
              onChange={(e) => {
                setUrlPickedIds([]);
                setSelectedTopic(e.target.value);
              }}
              className="px-3 py-2 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs font-extrabold text-emerald-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">🗂️ Mọi chủ đề Oxford (29)</option>
              {OXFORD_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>

            {/* 3. SRS Filter Selector */}
            <select
              value={srsFilter}
              onChange={(e) => setSrsFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-extrabold text-orange-800 focus:outline-none"
            >
              <option value="all">🎯 Tất cả trạng thái SRS</option>
              <option value="due">🔥 Cần ôn ngay ({dueWords.length})</option>
              <option value="unmastered">📈 Chưa thuộc (Level 0 - 4)</option>
              <option value="new">🆕 Từ mới (Level 0)</option>
              <option value="learning">⏳ Đang học (Level 1 - 4)</option>
              <option value="mastered">✅ Đã thuộc (Level 5)</option>
            </select>

            {/* 4. Session Word Count Selector */}
            <select
              value={sessionLimit}
              onChange={(e) => setSessionLimit(Number(e.target.value))}
              className="px-3 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700"
            >
              <option value={10}>⚡ 10 từ / lượt</option>
              <option value={20}>⚡ 20 từ / lượt</option>
              <option value={50}>⚡ 50 từ / lượt</option>
              <option value={9999}>♾️ Tất cả ({sessionPool.length} từ)</option>
            </select>

            {/* 5. Shuffle Button */}
            <button
              type="button"
              onClick={() => setShuffleSeed((s) => s + 1)}
              className="px-3 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold text-xs flex items-center gap-1.5 transition"
              title="Trộn ngẫu nhiên thứ tự từ vựng"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Trộn từ</span>
            </button>
          </div>
        </div>

        {/* Notice if custom URL selection or fallback filter is active */}
        {(urlPickedIds.length > 0 || filterFallbackUsed) && (
          <div className="px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            {urlPickedIds.length > 0 ? (
              <span className="font-bold text-indigo-800">
                🎯 Bạn đang luyện tập danh sách <strong>{urlPickedIds.length} từ vựng</strong> vừa đánh dấu chọn từ Kho Từ Vựng.
              </span>
            ) : (
              <span className="font-bold text-indigo-800">
                💡 Bộ từ này chưa có từ nào ở trạng thái lọc vừa chọn nên hệ thống đang hiển thị toàn bộ <strong>{baseDeckWords.length} từ</strong> trong bộ để bạn học ngay.
              </span>
            )}
            {urlPickedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setUrlPickedIds([])}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-extrabold text-[11px]"
              >
                Học toàn bộ bộ từ
              </button>
            )}
          </div>
        )}

        {/* 6 Interactive Game Modes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {GAME_MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {m.badge}
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {m.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CASE 1: SELECTED DECK IS EMPTY (0 WORDS) -> INLINE POPULATE & ADD */}
      {sessionPool.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            {currentDeckObj?.icon || '📘'}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              Bộ từ “{currentDeckObj?.title || 'Đang chọn'}” hiện chưa có từ vựng nào
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Hãy thêm nhanh từ mới bên dưới hoặc nạp 25 từ từ kho Oxford 3000+ vào bộ này để bắt đầu học ngay!
            </p>
          </div>

          <form
            onSubmit={handleInlineAddWord}
            className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
          >
            <input
              type="text"
              required
              value={quickWord}
              onChange={(e) => setQuickWord(e.target.value)}
              placeholder="Gõ từ tiếng Anh (VD: resilient)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
            />
            <input
              type="text"
              value={quickMeaning}
              onChange={(e) => setQuickMeaning(e.target.value)}
              placeholder="Nghĩa Việt (trống = tự điền)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
            />
            <button
              type="submit"
              className="btn-3d px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shrink-0"
            >
              + Thêm & Học ngay
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {selectedDeckId !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  const sample = shuffleArray(words).slice(0, 25);
                  copyWordsToDeck(selectedDeckId, sample);
                }}
                className="btn-3d px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs"
              >
                ⚡ Nạp nhanh 25 từ Oxford vào bộ này
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/category-list')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Quản lý trong mục Bộ từ vựng
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDeckId('all');
                setSelectedTopic('all');
                setSrsFilter('all');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs"
            >
              Chuyển sang học Tất cả bộ từ
            </button>
          </div>
        </div>
      ) : sessionFinished ? (
        /* CASE 2: GAME RESULT SCREEN */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold uppercase">
              🎉 Hoàn thành xuất sắc phiên luyện tập!
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Kết quả đã được đồng bộ vào lịch ôn SRS
            </h2>
            <p className="text-sm text-slate-500">
              Hệ thống Spaced Repetition đã tự động cập nhật thời điểm ôn tập tiếp theo cho từng từ trong bộ.
            </p>
          </div>

          {/* Score Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-2xl font-extrabold text-emerald-700">
                {correctIds.length}
              </p>
              <p className="text-xs font-bold text-emerald-600">Từ nhớ tốt</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-2xl font-extrabold text-amber-700">
                +{earnedReward?.coinsEarned || 40} 🪙
              </p>
              <p className="text-xs font-bold text-amber-600">Xu thưởng</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
              <p className="text-2xl font-extrabold text-indigo-700">
                +{earnedReward?.xpEarned || 80} ⚡
              </p>
              <p className="text-xs font-bold text-indigo-600">Điểm XP</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startNewSession(activeMode)}
              className="btn-3d px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Luyện tập lượt mới</span>
            </button>
            <button
              onClick={() => {
                const nextIdx =
                  (GAME_MODES.findIndex((m) => m.id === activeMode) + 1) %
                  GAME_MODES.length;
                setActiveMode(GAME_MODES[nextIdx].id);
              }}
              className="btn-3d px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Chuyển sang chế độ Game tiếp theo</span>
            </button>
          </div>
        </div>
      ) : (
        /* CASE 3: ACTIVE GAME CONTAINER */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl mx-auto space-y-6">
          {/* Session Progress Header */}
          {activeMode !== 'match' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-600">
                  Từ {safeIndex + 1} / {totalSessionQuestions}{' '}
                  <span className="text-slate-400 font-semibold">
                    (Tổng bộ lọc: {sessionPool.length} từ)
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  {combo > 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 animate-bounce">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      Combo x{combo}
                    </span>
                  )}
                  <span className="text-blue-600">{progressPct}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. FLASHCARD SRS MODE */}
          {/* ============================================================== */}
          {activeMode === 'flashcard' && currentWord && (
            <div className="space-y-6">
              <div
                onClick={() => {
                  playSound('flip');
                  setFlipped(!flipped);
                }}
                className="perspective-1000 cursor-pointer select-none h-80 sm:h-96 w-full max-w-2xl mx-auto"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                    flipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Card Front */}
                  <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 border-2 border-indigo-100 p-8 flex flex-col justify-between shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold">
                        SRS Level {currentWord.level} •{' '}
                        {SRS_LEVELS[currentWord.level]?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(currentWord.word, true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        >
                          🐢 Chậm
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(currentWord.word);
                          }}
                          className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-center my-auto space-y-2">
                      <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        {currentWord.word}
                      </h2>
                      <p className="text-lg font-mono text-indigo-600 font-semibold">
                        {currentWord.ipa}{' '}
                        <span className="italic text-slate-500">
                          ({currentWord.pos})
                        </span>
                      </p>
                      {currentWord.topicName && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          {currentWord.topicIcon || '📘'} {currentWord.topicName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                      <RotateCw className="w-4 h-4" />
                      <span>Nhấn vào thẻ hoặc phím [Space] để lật xem nghĩa</span>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-8 flex flex-col justify-between shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-white">
                          {currentWord.word}
                        </span>
                        <span className="text-xs font-mono text-indigo-300">
                          {currentWord.ipa}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(currentWord.example);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Đọc câu ví dụ</span>
                      </button>
                    </div>

                    <div className="space-y-4 my-auto">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
                          Nghĩa tiếng Việt ({currentWord.pos})
                        </span>
                        <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-0.5">
                          {currentWord.meaning}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
                        <p className="text-sm sm:text-base font-medium text-white">
                          “{currentWord.example}”
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-200 italic">
                          → {currentWord.exampleVi}
                        </p>
                      </div>
                    </div>

                    {/* Direct SRS Level Switcher on Card Back */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs"
                    >
                      <span className="text-indigo-200 font-medium">
                        {currentWord.level === 5
                          ? 'Đã thuộc, không còn lịch ôn'
                          : `Cấp độ hiện tại: Level ${currentWord.level}`}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setWordLevelDirect(currentWord.id, lvl)}
                            className={`px-2 py-1 rounded-lg font-extrabold text-[11px] ${
                              currentWord.level === lvl
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {lvl === 5 ? 'Đã thuộc' : `Lv.${lvl}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 SRS Rating Buttons */}
              <div className="max-w-2xl mx-auto">
                <p className="text-center text-xs font-bold text-slate-500 mb-3">
                  Đánh giá mức độ ghi nhớ của bạn để thuật toán SRS xếp lịch ôn:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleFlashcardRate('again')}
                    className="btn-3d p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 flex flex-col items-center"
                  >
                    <span className="font-extrabold text-sm">1. Quên rồi</span>
                    <span className="text-[11px] font-semibold opacity-80 mt-0.5">
                      Ôn lại sau 10 phút
                    </span>
                  </button>
                  <button
                    onClick={() => handleFlashcardRate('hard')}
                    className="btn-3d p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 text-orange-700 flex flex-col items-center"
                  >
                    <span className="font-extrabold text-sm">2. Hơi khó</span>
                    <span className="text-[11px] font-semibold opacity-80 mt-0.5">
                      Ôn lại sau 12 giờ
                    </span>
                  </button>
                  <button
                    onClick={() => handleFlashcardRate('good')}
                    className="btn-3d p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 flex flex-col items-center"
                  >
                    <span className="font-extrabold text-sm">3. Nhớ tốt</span>
                    <span className="text-[11px] font-semibold opacity-80 mt-0.5">
                      Tăng 1 Level SRS
                    </span>
                  </button>
                  <button
                    onClick={() => handleFlashcardRate('easy')}
                    className="btn-3d p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-700 flex flex-col items-center"
                  >
                    <span className="font-extrabold text-sm">4. Quá dễ</span>
                    <span className="text-[11px] font-semibold opacity-80 mt-0.5">
                      Nhảy 2 Level SRS
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. MULTIPLE CHOICE QUIZ MODE */}
          {/* ============================================================== */}
          {activeMode === 'quiz' && currentWord && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-extrabold">
                    Chọn nghĩa đúng của từ
                  </span>
                  <button
                    onClick={() => speakWord(currentWord.word)}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {currentWord.word}
                </h2>
                <p className="text-sm font-mono text-indigo-600">
                  {currentWord.ipa} ({currentWord.pos})
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {quizOptions.map((opt, idx) => {
                  const isPicked = selectedQuizAnswer === opt.id;
                  const isRight = opt.id === currentWord.id;
                  let style =
                    'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                  if (selectedQuizAnswer) {
                    if (isRight) {
                      style =
                        'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
                    } else if (isPicked) {
                      style = 'bg-red-50 border-red-400 text-red-800';
                    } else {
                      style =
                        'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={Boolean(selectedQuizAnswer)}
                      onClick={() => handleSelectQuizOption(opt)}
                      className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition flex items-start justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt.meaning}</span>
                      </div>
                      {selectedQuizAnswer && isRight && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {selectedQuizAnswer && isPicked && !isRight && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-800">
                      Ví dụ: “{currentWord.example}”
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      → {currentWord.exampleVi}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      advanceQuestion(selectedQuizAnswer === currentWord.id)
                    }
                    className="btn-3d px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. MEMORY MATCH MODE */}
          {/* ============================================================== */}
          {activeMode === 'match' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    🧩 Ghép cặp Từ tiếng Anh ↔ Nghĩa tiếng Việt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn 1 ô từ vựng và 1 ô nghĩa tương ứng để làm biến mất cặp thẻ
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-xs">
                    Đã ghép: {matchedIds.length}/{matchCards.length / 2} cặp
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                    Lượt lật: {matchMoves}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {matchCards.map((tile) => {
                  const isMatched = matchedIds.includes(tile.wordId);
                  const isSelected = selectedMatchTile?.tileId === tile.tileId;
                  const isWrong = wrongPairIds.includes(tile.tileId);

                  return (
                    <button
                      key={tile.tileId}
                      disabled={isMatched}
                      onClick={() => handleTileClick(tile)}
                      className={`h-28 p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                        isMatched
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-400 scale-95 opacity-35'
                          : isWrong
                          ? 'bg-red-50 border-red-500 text-red-700 animate-pulse'
                          : isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                          : tile.type === 'en'
                          ? 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200 text-slate-900'
                          : 'bg-amber-50/50 hover:bg-amber-50 border-amber-200 text-slate-800'
                      }`}
                    >
                      <span className="font-extrabold text-sm line-clamp-2">
                        {tile.text}
                      </span>
                      <span
                        className={`text-[11px] mt-1 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {tile.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. WORD SCRAMBLE MODE */}
          {/* ============================================================== */}
          {activeMode === 'scramble' && currentWord && (
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="px-3 py-0.5 rounded-full bg-white text-emerald-700 text-xs font-extrabold">
                  Sắp xếp các chữ cái thành từ đúng ({currentWord.pos})
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {currentWord.meaning}
                </h2>
                <p className="text-xs font-mono text-emerald-700">
                  Gợi ý phiên âm: {currentWord.ipa}
                </p>
              </div>

              {/* Picked Letters Answer Slots */}
              <div className="min-h-16 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2">
                {pickedLetters.length === 0 ? (
                  <span className="text-xs font-semibold text-slate-400">
                    Nhấn vào các chữ cái bên dưới để ghép thành từ...
                  </span>
                ) : (
                  pickedLetters.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleUnpickScrambleLetter(item)}
                      className={`w-11 h-11 rounded-xl font-extrabold text-lg uppercase shadow-xs transition ${
                        scrambleStatus === 'correct'
                          ? 'bg-emerald-500 text-white'
                          : scrambleStatus === 'wrong'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {item.char}
                    </button>
                  ))
                )}
              </div>

              {/* Available Scrambled Letters */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {scrambleLetters.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePickScrambleLetter(item)}
                    className="btn-3d w-11 h-11 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-900 font-extrabold text-lg uppercase"
                  >
                    {item.char}
                  </button>
                ))}
              </div>

              {scrambleStatus === 'wrong' && (
                <p className="text-xs font-bold text-red-600">
                  Chưa chính xác! Nhấn vào chữ cái ở ô trên để xếp lại nhé.
                </p>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => speakWord(currentWord.word)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe gợi ý</span>
                </button>
                {scrambleStatus === 'correct' && (
                  <button
                    onClick={() => advanceQuestion(true)}
                    className="btn-3d px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <span>Chính xác! Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5 & 6. SPELLING CONTEXT CLOZE & LISTENING CHALLENGE */}
          {/* ============================================================== */}
          {(activeMode === 'spelling' || activeMode === 'listening') &&
            currentWord && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center space-y-4">
                  {activeMode === 'listening' ? (
                    <>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-extrabold">
                        🎧 Nghe phát âm và gõ lại từ tiếng Anh
                      </span>
                      <div className="flex items-center justify-center gap-3 py-2">
                        <button
                          type="button"
                          onClick={() => speakWord(currentWord.word)}
                          className="btn-3d px-6 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm flex items-center gap-2"
                        >
                          <Volume2 className="w-6 h-6" />
                          <span>Nghe chuẩn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakWord(currentWord.word, true)}
                          className="btn-3d px-4 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm"
                        >
                          🐢 Nghe chậm
                        </button>
                      </div>
                      <p className="text-sm text-amber-300 font-bold">
                        Nghĩa gợi ý ({currentWord.pos}): {currentWord.meaning}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-extrabold">
                        ⌨️ Điền từ vựng đúng vào ngữ cảnh
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                        {currentWord.meaning} ({currentWord.pos})
                      </h2>
                      <div className="p-4 rounded-2xl bg-white/10 text-left space-y-1">
                        <p className="text-sm sm:text-base font-semibold text-white">
                          “{getMaskedExample(currentWord)}”
                        </p>
                        <p className="text-xs text-indigo-200 italic">
                          → {currentWord.exampleVi}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <form onSubmit={handleCheckTyping} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={typedInput}
                      onChange={(e) => {
                        playSound('key');
                        setTypedInput(e.target.value);
                        if (typingStatus === 'wrong') setTypingStatus(null);
                      }}
                      placeholder={`Gõ từ gồm ${currentWord.word.length} chữ cái...`}
                      className={`flex-1 px-5 py-4 rounded-2xl border-2 text-lg font-extrabold tracking-wide focus:outline-none ${
                        typingStatus === 'correct'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : typingStatus === 'wrong'
                          ? 'border-red-400 bg-red-50 text-red-800'
                          : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleGiveHint}
                      className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-extrabold text-xs flex items-center gap-1.5"
                      title="Gợi ý 2 chữ cái tiếp theo"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Gợi ý</span>
                    </button>
                  </div>

                  {typingStatus === 'wrong' && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs font-bold text-red-700">
                      <span>
                        Chưa khớp! Gợi ý chữ đầu:{' '}
                        <strong className="underline">
                          {currentWord.word.slice(0, 2)}...
                        </strong>{' '}
                        ({currentWord.ipa})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTypedInput(currentWord.word);
                          setTypingStatus('correct');
                        }}
                        className="underline text-red-800"
                      >
                        Xem đáp án
                      </button>
                    </div>
                  )}

                  {typingStatus === 'correct' ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-emerald-800 text-sm">
                          🎉 Chính xác: {currentWord.word} ({currentWord.ipa})
                        </p>
                        <p className="text-xs text-emerald-700">
                          “{currentWord.example}”
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => advanceQuestion(true)}
                        className="btn-3d px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5"
                      >
                        <span>Tiếp tục</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="btn-3d w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm"
                    >
                      Kiểm tra đáp án (Enter)
                    </button>
                  )}
                </form>
              </div>
            )}
        </div>
      )}

      {/* ================================================================== */}
      {/* INTERACTIVE WORD SELECTOR & INLINE QUICK-ADD FOR CURRENT DECK      */}
      {/* ================================================================== */}
      {filteredDeckWords.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Danh sách từ vựng đang chọn học ({sessionPool.length} /{' '}
                  {filteredDeckWords.length} từ)
                </h3>
                <p className="text-xs text-slate-500">
                  Tích chọn/bỏ chọn các từ bạn muốn ôn tập hoặc bấm trực tiếp vào từ bất kỳ để học ngay từ đó
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {excludedWordIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExcludedWordIds([])}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs"
                >
                  ✓ Chọn tất cả ({filteredDeckWords.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const masteredIds = filteredDeckWords
                    .filter((w) => w.level === 5)
                    .map((w) => w.id);
                  if (masteredIds.length < filteredDeckWords.length) {
                    setExcludedWordIds(masteredIds);
                    setCurrentIndex(0);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Chỉ chọn từ chưa thuộc
              </button>
            </div>
          </div>

          {/* Inline Quick Add Word directly into current deck */}
          <form
            onSubmit={handleInlineAddWord}
            className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70"
          >
            <input
              type="text"
              value={quickWord}
              onChange={(e) => setQuickWord(e.target.value)}
              placeholder={`Thêm nhanh từ mới vào ${
                currentDeckObj ? `"${currentDeckObj.title}"` : 'bộ từ hiện tại'
              } (VD: deadline, negotiate)...`}
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm & Học ngay</span>
            </button>
          </form>

          {/* Selectable & Jumpable Word Pills Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredDeckWords.slice(0, 90).map((w) => {
              const isIncluded = !excludedWordIds.includes(w.id);
              const activeIdx = sessionPool.findIndex((item) => item.id === w.id);
              const isCurrent = currentWord?.id === w.id && !sessionFinished;

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    if (!isIncluded) {
                      toggleWordIncluded(w.id);
                    } else if (activeIdx !== -1) {
                      setSessionFinished(false);
                      setFlipped(false);
                      setCurrentIndex(activeIdx);
                    }
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : isIncluded
                      ? 'border-slate-200 hover:border-blue-300 bg-white'
                      : 'border-slate-100 bg-slate-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWordIncluded(w.id);
                      }}
                      className="text-blue-600 shrink-0"
                      title={isIncluded ? 'Bỏ chọn từ này' : 'Chọn học từ này'}
                    >
                      {isIncluded ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {w.word}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          Lv.{w.level}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-blue-700 truncate">
                        {w.meaning}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(w.word);
                    }}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
