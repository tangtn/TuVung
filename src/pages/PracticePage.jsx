import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Gamepad2,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
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
    speakWord,
    playSound,
    reviewWord,
    setWordLevelDirect,
    rewardGameCompletion,
    SRS_LEVELS,
  } = useApp();

  const [searchParams] = useSearchParams();

  // Filter & Mode Selection
  const [activeMode, setActiveMode] = useState(
    searchParams.get('mode') || 'flashcard'
  );
  const [selectedDeckId, setSelectedDeckId] = useState(
    searchParams.get('deck') || 'all'
  );
  const [srsFilter, setSrsFilter] = useState(
    searchParams.get('filter') || 'all'
  );

  // Pool of words for the session
  const sessionPool = useMemo(() => {
    const nowTs = Date.now();
    let list = words.filter((w) =>
      selectedDeckId === 'all' ? true : w.deckId === selectedDeckId
    );
    if (srsFilter === 'due') {
      const due = list.filter((w) => w.level > 0 && w.level < 5 && w.nextReview <= nowTs);
      if (due.length > 0) list = due;
    } else if (srsFilter === 'learning') {
      const lrn = list.filter((w) => w.level >= 1 && w.level <= 4);
      if (lrn.length > 0) list = lrn;
    } else if (srsFilter === 'unmastered') {
      const unm = list.filter((w) => w.level < 5);
      if (unm.length > 0) list = unm;
    }
    return list.length > 0 ? list : words;
  }, [words, selectedDeckId, srsFilter]);

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
  const [scrambleStatus, setScrambleStatus] = useState(null); // 'correct' | 'wrong' | null

  // Spelling & Listening State
  const [typedInput, setTypedInput] = useState('');
  const [typingStatus, setTypingStatus] = useState(null); // 'correct' | 'wrong' | null
  const [hintCount, setHintCount] = useState(0);

  const currentWord = sessionPool[currentIndex] || sessionPool[0];

  // Reset session when mode, deck, or filter changes
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

    if (customMode === 'match') {
      const sample = shuffleArray(sessionPool).slice(0, 6);
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
    }
  };

  useEffect(() => {
    startNewSession(activeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, selectedDeckId, srsFilter]);

  // Prepare Quiz / Scramble / Listening per question
  useEffect(() => {
    if (!currentWord || sessionFinished) return;

    if (activeMode === 'quiz') {
      const distractors = shuffleArray(
        words.filter((w) => w.id !== currentWord.id)
      ).slice(0, 3);
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
  }, [currentIndex, activeMode, currentWord, sessionFinished, words, speakWord]);

  // Keyboard shortcuts for Flashcard mode
  useEffect(() => {
    if (activeMode !== 'flashcard' || sessionFinished) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
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

    if (currentIndex + 1 >= Math.min(sessionPool.length, 10)) {
      finishSession(nextCorrect.length, Math.min(sessionPool.length, 10));
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
    if (selectedQuizAnswer) return;
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

    // Check if same wordId & opposite type
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
    if (scrambleStatus === 'correct') return;
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
    if (!typedInput.trim() || typingStatus === 'correct') return;
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
    const nextHintLen = Math.min(currentWord.word.length, hintCount + 2);
    setHintCount(nextHintLen);
    setTypedInput(currentWord.word.slice(0, nextHintLen));
    playSound('key');
  };

  // Mask target word inside example sentence for Context Cloze
  const getMaskedExample = (w) => {
    if (!w?.example) return '___';
    const regex = new RegExp(w.word, 'gi');
    if (regex.test(w.example)) {
      return w.example.replace(regex, '_______');
    }
    return `${w.example} (_______)`;
  };

  const totalSessionQuestions = Math.min(sessionPool.length, 10);
  const progressPct = Math.round(((currentIndex + 1) / totalSessionQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Top Game Mode Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>Trung tâm Luyện Từ & 6 Chế độ Tương tác</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Học Từ Vựng Thông Minh (SRS & Game hóa)
            </h1>
          </div>

          {/* Deck & SRS Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <option value="all">📚 Tất cả bộ từ ({words.length} từ)</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.title}
                </option>
              ))}
            </select>

            <select
              value={srsFilter}
              onChange={(e) => setSrsFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-extrabold text-orange-700"
            >
              <option value="all">🎯 Tất cả từ trong bộ</option>
              <option value="due">🔥 Từ đến hạn cần ôn ({dueWords.length})</option>
              <option value="unmastered">📈 Từ chưa thuộc (Level 0 - 4)</option>
            </select>
          </div>
        </div>

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

      {/* GAME RESULT SCREEN */}
      {sessionFinished ? (
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
              Hệ thống Spaced Repetition đã tự động cập nhật thời điểm ôn tập tiếp theo cho từng từ.
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
        /* ACTIVE GAME CONTAINER */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl mx-auto space-y-6">
          {/* Session Progress Header */}
          {activeMode !== 'match' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-600">
                  Từ {currentIndex + 1} / {totalSessionQuestions}
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

                    {/* Direct SRS Level Switcher on Card Back (matching luyentu.com) */}
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
                      style = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
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
    </div>
  );
}
