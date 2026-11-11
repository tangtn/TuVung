import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_FOLDERS,
  INITIAL_DECKS,
  INITIAL_WORDS,
  OXFORD_TOPICS,
  SRS_LEVELS,
  STORE_ITEMS,
  AI_TOPIC_BANK,
  SMART_DICTIONARY,
  INITIAL_LEADERBOARD,
  INITIAL_BUDDY,
  ROADMAPS,
} from '../data/initialData';

const AppContext = createContext(null);

const STORAGE_KEY = 'luyentu_app_state_v2_3000';

const DEFAULT_USER = {
  name: 'Bạn (Học viên Pro)',
  email: 'hocvien@luyentu.com',
  avatar: '🦉',
  activeTheme: 'theme-default',
  soundEnabled: true,
  mechKeyboard: false,
  coins: 680,
  xp: 8650,
  streak: 14,
  streakFreezes: 1,
  xpBoostActive: false,
  dailyGoal: 20,
  todayLearned: 14,
  unlockedItems: ['theme-default', 'avatar-owl'],
  weeklyActivity: [
    { day: 'T2', count: 18 },
    { day: 'T3', count: 24 },
    { day: 'T4', count: 16 },
    { day: 'T5', count: 25 },
    { day: 'T6', count: 21 },
    { day: 'T7', count: 28 },
    { day: 'CN', count: 14 },
  ],
};

function safeGetStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = safeGetStorage();
    return saved?.user ? { ...DEFAULT_USER, ...saved.user } : DEFAULT_USER;
  });

  const [folders, setFolders] = useState(() => {
    const saved = safeGetStorage();
    return saved?.folders?.length ? saved.folders : INITIAL_FOLDERS;
  });

  const [decks, setDecks] = useState(() => {
    const saved = safeGetStorage();
    return saved?.decks?.length ? saved.decks : INITIAL_DECKS;
  });

  const [words, setWords] = useState(() => {
    const saved = safeGetStorage();
    if (!saved) return INITIAL_WORDS;
    const overrides = saved.wordOverrides || {};
    const deletedSet = new Set(saved.deletedWordIds || []);
    const customWords = saved.customWords || [];

    const mergedBase = INITIAL_WORDS.filter((w) => !deletedSet.has(w.id)).map((w) =>
      overrides[w.id] ? { ...w, ...overrides[w.id] } : w
    );
    return [...customWords, ...mergedBase];
  });

  const [buddy, setBuddy] = useState(() => {
    const saved = safeGetStorage();
    return saved?.buddy || INITIAL_BUDDY;
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Save compact state to localStorage (avoids duplicating 3,375 base words in localStorage)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const baseIds = new Set(INITIAL_WORDS.map((w) => w.id));
      const currentIds = new Set(words.map((w) => w.id));
      const deletedWordIds = INITIAL_WORDS.filter((w) => !currentIds.has(w.id)).map(
        (w) => w.id
      );
      const customWords = words.filter((w) => !baseIds.has(w.id));
      const wordOverrides = {};

      words.forEach((w) => {
        if (baseIds.has(w.id) && (w.level > 0 || w.wrongCount > 0)) {
          wordOverrides[w.id] = {
            level: w.level,
            nextReview: w.nextReview,
            wrongCount: w.wrongCount || 0,
          };
        }
      });

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          folders,
          decks,
          buddy,
          customWords,
          deletedWordIds,
          wordOverrides,
        })
      );
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [user, folders, decks, words, buddy]);

  // Web Audio Synthesizer for Game & SRS feedback
  const playSound = useCallback(
    (type = 'correct') => {
      if (!user.soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const makeTone = (freq, start, duration, wave = 'sine', gainVal = 0.12) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(gainVal, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };

        if (type === 'correct') {
          makeTone(523.25, now, 0.12, 'triangle', 0.15);
          makeTone(659.25, now + 0.08, 0.18, 'triangle', 0.15);
          makeTone(783.99, now + 0.16, 0.25, 'triangle', 0.15);
        } else if (type === 'wrong') {
          makeTone(220, now, 0.15, 'sawtooth', 0.1);
          makeTone(174.61, now + 0.12, 0.25, 'sawtooth', 0.1);
        } else if (type === 'flip') {
          makeTone(440, now, 0.06, 'sine', 0.06);
        } else if (type === 'key') {
          makeTone(user.mechKeyboard ? 680 : 500, now, 0.03, 'square', 0.04);
        } else if (type === 'win') {
          makeTone(523.25, now, 0.12, 'triangle', 0.16);
          makeTone(659.25, now + 0.1, 0.12, 'triangle', 0.16);
          makeTone(783.99, now + 0.2, 0.12, 'triangle', 0.16);
          makeTone(1046.5, now + 0.3, 0.4, 'triangle', 0.2);
        } else if (type === 'buy') {
          makeTone(880, now, 0.08, 'sine', 0.15);
          makeTone(1174.66, now + 0.08, 0.25, 'sine', 0.15);
        }
      } catch (e) {}
    },
    [user.soundEnabled, user.mechKeyboard]
  );

  // Text-to-Speech Pronunciation (US / UK)
  const speakWord = useCallback((text, slow = false) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = slow ? 0.6 : 0.92;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Microsoft'))
      );
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  }, []);

  // Derived SRS Statistics
  const nowTs = Date.now();
  const dueWords = words.filter((w) => w.level > 0 && w.level < 5 && w.nextReview <= nowTs);
  const newWords = words.filter((w) => w.level === 0);
  const masteredWords = words.filter((w) => w.level === 5);
  const learningWords = words.filter((w) => w.level >= 1 && w.level <= 4);

  // Update SRS Level for a word
  const reviewWord = useCallback(
    (wordId, rating = 'good') => {
      const DAY_MS = 24 * 3600 * 1000;
      const HOUR_MS = 3600 * 1000;

      setWords((prev) =>
        prev.map((w) => {
          if (w.id !== wordId) return w;
          let nextLvl = w.level;
          let nextRev = Date.now();
          let wrongCount = w.wrongCount || 0;

          if (rating === 'again') {
            nextLvl = 1;
            nextRev = Date.now() + 10 * 60 * 1000;
            wrongCount += 1;
          } else if (rating === 'hard') {
            nextLvl = Math.max(1, w.level === 0 ? 1 : w.level);
            nextRev = Date.now() + 12 * HOUR_MS;
          } else if (rating === 'good') {
            nextLvl = Math.min(5, (w.level || 0) + 1);
            const intervals = [0, 1, 3, 7, 14, 365];
            nextRev = Date.now() + intervals[nextLvl] * DAY_MS;
          } else if (rating === 'easy') {
            nextLvl = Math.min(5, (w.level || 0) + 2);
            const intervals = [0, 1, 3, 7, 14, 365];
            nextRev = Date.now() + intervals[nextLvl] * DAY_MS;
          }

          return {
            ...w,
            level: nextLvl,
            nextReview: nextRev,
            wrongCount,
          };
        })
      );

      const boost = user.xpBoostActive ? 2 : 1;
      const gainedCoins = (rating === 'again' ? 2 : rating === 'easy' ? 10 : 6) * boost;
      const gainedXp = (rating === 'again' ? 5 : rating === 'easy' ? 20 : 12) * boost;

      setUser((prev) => {
        const updatedWeekly = [...prev.weeklyActivity];
        if (updatedWeekly.length > 0) {
          const lastIdx = updatedWeekly.length - 1;
          updatedWeekly[lastIdx] = {
            ...updatedWeekly[lastIdx],
            count: updatedWeekly[lastIdx].count + 1,
          };
        }
        return {
          ...prev,
          coins: prev.coins + gainedCoins,
          xp: prev.xp + gainedXp,
          todayLearned: prev.todayLearned + 1,
          weeklyActivity: updatedWeekly,
        };
      });

      if (rating === 'again') {
        playSound('wrong');
      } else {
        playSound('correct');
      }
    },
    [playSound, user.xpBoostActive]
  );

  // Set SRS level directly from Words table / Practice settings
  const setWordLevelDirect = useCallback(
    (wordId, newLevel) => {
      const lvl = Math.max(0, Math.min(5, Number(newLevel)));
      const DAY_MS = 24 * 3600 * 1000;
      const intervals = [0, 1, 3, 7, 14, 365];
      setWords((prev) =>
        prev.map((w) =>
          w.id === wordId
            ? {
                ...w,
                level: lvl,
                nextReview: lvl === 0 ? Date.now() : Date.now() + intervals[lvl] * DAY_MS,
              }
            : w
        )
      );
      showToast(
        lvl === 5
          ? '🎉 Đã đánh dấu thuộc lòng từ vựng!'
          : `Đã cập nhật cấp độ nhớ sang Level ${lvl}`
      );
    },
    [showToast]
  );

  // Reward after completing a Game
  const rewardGameCompletion = useCallback(
    ({ correctCount, totalCount, gameName }) => {
      const boost = user.xpBoostActive ? 2 : 1;
      const coinsEarned = Math.max(10, correctCount * 8) * boost;
      const xpEarned = Math.max(20, correctCount * 15) * boost;

      setUser((prev) => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        xp: prev.xp + xpEarned,
        todayLearned: prev.todayLearned + Math.max(1, Math.ceil(correctCount / 2)),
      }));

      playSound('win');
      showToast(`🏆 Hoàn thành ${gameName}! +${coinsEarned} Xu & +${xpEarned} XP`);
      return { coinsEarned, xpEarned };
    },
    [playSound, showToast, user.xpBoostActive]
  );

  // Deck CRUD
  const createDeck = useCallback(
    ({ title, description, icon = '📘', tag = 'Cá nhân', levelTag = 'Tùy chỉnh', folderId = 'folder-personal' }) => {
      const newDeck = {
        id: `deck-${Date.now()}`,
        title,
        description: description || 'Bộ từ vựng cá nhân do bạn tự tạo.',
        icon,
        tag,
        levelTag,
        folderId,
        color: 'from-blue-500 to-indigo-600',
        isSystem: false,
        downloads: 1,
        author: user.name,
      };
      setDecks((prev) => [newDeck, ...prev]);
      showToast(`✨ Đã tạo bộ từ "${title}" thành công!`);
      return newDeck;
    },
    [showToast, user.name]
  );

  const deleteDeck = useCallback(
    (deckId) => {
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      setWords((prev) => prev.filter((w) => w.deckId !== deckId));
      showToast('🗑️ Đã xóa bộ từ vựng.');
    },
    [showToast]
  );

  const duplicateDeck = useCallback(
    (deckId) => {
      const target = decks.find((d) => d.id === deckId);
      if (!target) return;
      const newDeckId = `deck-copy-${Date.now()}`;
      const newDeck = {
        ...target,
        id: newDeckId,
        title: `${target.title} (Bản sao)`,
        isSystem: false,
        folderId: 'folder-personal',
      };
      const deckWords = words
        .filter((w) => w.deckId === deckId)
        .slice(0, 100)
        .map((w, idx) => ({
          ...w,
          id: `w-copy-${Date.now()}-${idx}`,
          deckId: newDeckId,
          level: 0,
          nextReview: Date.now(),
        }));
      setDecks((prev) => [newDeck, ...prev]);
      setWords((prev) => [...deckWords, ...prev]);
      showToast(`📋 Đã sao chép bộ từ "${target.title}"!`);
    },
    [decks, words, showToast]
  );

  // AI Smart Deck Generator
  const generateAIDeck = useCallback(
    (topicQuery, levelChoice = 'B1 - B2') => {
      const q = (topicQuery || '').toLowerCase();
      let templateKey = 'travel';
      if (q.includes('phỏng vấn') || q.includes('cv') || q.includes('job') || q.includes('công việc') || q.includes('work')) {
        templateKey = 'interview';
      } else if (q.includes('tài chính') || q.includes('ngân hàng') || q.includes('kinh tế') || q.includes('finance') || q.includes('money')) {
        templateKey = 'finance';
      } else if (q.includes('sức khỏe') || q.includes('y tế') || q.includes('health') || q.includes('bệnh') || q.includes('đời sống')) {
        templateKey = 'health';
      } else if (q.includes('du lịch') || q.includes('sân bay') || q.includes('travel') || q.includes('hotel')) {
        templateKey = 'travel';
      }

      const template = AI_TOPIC_BANK[templateKey];
      const customTitle = topicQuery?.trim()
        ? `AI: ${topicQuery.trim()} (${levelChoice})`
        : `${template.title}`;

      const newDeckId = `deck-ai-${Date.now()}`;
      const newDeck = {
        id: newDeckId,
        title: customTitle,
        description: `Bộ từ vựng được AI Luyện Từ tự động biên soạn theo chủ đề "${topicQuery || template.title}" kèm phiên âm IPA và câu ví dụ song ngữ.`,
        icon: '🤖',
        tag: 'AI Tạo',
        levelTag: levelChoice,
        folderId: 'folder-personal',
        color: 'from-violet-500 to-fuchsia-600',
        isSystem: false,
        downloads: 1,
        author: 'Luyện Từ AI',
      };

      const generatedWords = template.words.map((item, idx) => ({
        id: `w-ai-${Date.now()}-${idx}`,
        deckId: newDeckId,
        word: item.word,
        ipa: item.ipa,
        pos: item.pos,
        meaning: item.meaning,
        topicId: 'other',
        topicName: 'AI Tạo theo chủ đề',
        topicIcon: '🤖',
        example: item.example,
        exampleVi: item.exampleVi,
        synonyms: [],
        level: 1,
        nextReview: Date.now(),
        wrongCount: 0,
      }));

      setDecks((prev) => [newDeck, ...prev]);
      setWords((prev) => [...generatedWords, ...prev]);
      playSound('win');
      showToast(`🤖 AI đã tạo bộ từ "${customTitle}" với ${generatedWords.length} từ vựng!`);
      return newDeck;
    },
    [playSound, showToast]
  );

  // Word CRUD
  const addWord = useCallback(
    ({ deckId, word, ipa, pos, meaning, example, exampleVi }) => {
      const cleanWord = word.trim();
      const dictMatch = SMART_DICTIONARY[cleanWord.toLowerCase()];
      const newW = {
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        deckId: deckId || decks[0]?.id || 'deck-oxford-daily',
        word: cleanWord,
        ipa: ipa?.trim() || dictMatch?.ipa || `/${cleanWord.toLowerCase()}/`,
        pos: pos || dictMatch?.pos || 'n',
        meaning: meaning?.trim() || dictMatch?.meaning || 'Nghĩa từ vựng',
        topicId: 'other',
        topicName: 'Từ vựng cá nhân',
        topicIcon: '✨',
        example:
          example?.trim() ||
          dictMatch?.example ||
          `Checking the meaning of "${cleanWord}" helps you remember it longer.`,
        exampleVi:
          exampleVi?.trim() ||
          dictMatch?.exampleVi ||
          `Tra cứu ngữ cảnh của từ "${cleanWord}" giúp bạn nhớ lâu hơn.`,
        synonyms: [],
        level: 1,
        nextReview: Date.now(),
        wrongCount: 0,
      };
      setWords((prev) => [newW, ...prev]);
      playSound('correct');
      showToast(`➕ Đã thêm từ "${cleanWord}" vào bộ từ!`);
      return newW;
    },
    [decks, playSound, showToast]
  );

  const deleteWord = useCallback(
    (wordId) => {
      setWords((prev) => prev.filter((w) => w.id !== wordId));
      showToast('🗑️ Đã xóa từ vựng.');
    },
    [showToast]
  );

  // Store Actions
  const buyStoreItem = useCallback(
    (item) => {
      if (user.coins < item.price) {
        playSound('wrong');
        showToast(`⚠️ Chưa đủ xu! Cần ${item.price} xu để mua "${item.name}".`, 'error');
        return false;
      }

      playSound('buy');

      if (item.id === 'item-streak-freeze') {
        setUser((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          streakFreezes: prev.streakFreezes + 1,
          streak: prev.streak + 1,
        }));
        showToast('❄️ Đã mua & kích hoạt Đá Hồi Streak (+1 ngày bảo vệ chuỗi)!');
        return true;
      }

      if (item.id === 'item-xp-boost') {
        setUser((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          xpBoostActive: true,
        }));
        showToast('⚡ Đã bật Nhân Đôi Xu & XP cho các bài luyện tập!');
        return true;
      }

      if (item.id === 'item-sound-mech') {
        setUser((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          mechKeyboard: true,
          unlockedItems: [...new Set([...prev.unlockedItems, item.id])],
        }));
        showToast('🎵 Đã mở khóa & bật âm thanh Bàn phím cơ!');
        return true;
      }

      setUser((prev) => {
        const nextUnlocked = [...new Set([...prev.unlockedItems, item.id])];
        return {
          ...prev,
          coins: prev.coins - item.price,
          unlockedItems: nextUnlocked,
          activeTheme: item.category === 'theme' ? item.id : prev.activeTheme,
          avatar: item.category === 'avatar' ? item.icon : prev.avatar,
        };
      });

      showToast(`🎉 Mua thành công và đã áp dụng "${item.name}"!`);
      return true;
    },
    [user.coins, playSound, showToast]
  );

  const equipStoreItem = useCallback(
    (item) => {
      if (item.category === 'theme') {
        setUser((prev) => ({ ...prev, activeTheme: item.id }));
        showToast(`🎨 Đã áp dụng giao diện "${item.name}"!`);
      } else if (item.category === 'avatar') {
        setUser((prev) => ({ ...prev, avatar: item.icon }));
        showToast(`✨ Đã đổi ảnh đại diện sang ${item.name}!`);
      } else if (item.id === 'item-sound-mech') {
        setUser((prev) => ({ ...prev, mechKeyboard: !prev.mechKeyboard }));
        showToast('🎵 Đã chuyển đổi chế độ âm thanh bàn phím cơ!');
      }
    },
    [showToast]
  );

  const postCommunityMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      const newMsg = {
        id: `m-${Date.now()}`,
        user: user.name,
        avatar: user.avatar,
        time: 'Vừa xong',
        text: text.trim(),
      };
      setBuddy((prev) => ({
        ...prev,
        feed: [newMsg, ...prev.feed],
      }));
      showToast('💬 Đã gửi thông điệp tới cộng đồng học tập!');
    },
    [user.name, user.avatar, showToast]
  );

  const cheerStudyBuddy = useCallback(() => {
    setBuddy((prev) => ({
      ...prev,
      sharedStreak: prev.sharedStreak + 1,
      todayMessage: 'Tuyệt vời! Hai bạn đã giữ chuỗi học chung thành công hôm nay! 🔥🎉',
    }));
    setUser((prev) => ({ ...prev, coins: prev.coins + 25 }));
    playSound('win');
    showToast('🔥 Đã đập tay giữ chuỗi học chung! Bạn nhận được +25 Xu thưởng!');
  }, [playSound, showToast]);

  const resetDemoData = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUser(DEFAULT_USER);
    setFolders(INITIAL_FOLDERS);
    setDecks(INITIAL_DECKS);
    setWords(INITIAL_WORDS);
    setBuddy(INITIAL_BUDDY);
    showToast('🔄 Đã khôi phục kho 3.000+ từ vựng ban đầu!');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        folders,
        setFolders,
        decks,
        words,
        dueWords,
        newWords,
        masteredWords,
        learningWords,
        buddy,
        toast,
        showToast,
        playSound,
        speakWord,
        reviewWord,
        setWordLevelDirect,
        rewardGameCompletion,
        createDeck,
        deleteDeck,
        duplicateDeck,
        generateAIDeck,
        addWord,
        deleteWord,
        buyStoreItem,
        equipStoreItem,
        postCommunityMessage,
        cheerStudyBuddy,
        resetDemoData,
        OXFORD_TOPICS,
        SRS_LEVELS,
        STORE_ITEMS,
        INITIAL_LEADERBOARD,
        ROADMAPS,
        SMART_DICTIONARY,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
