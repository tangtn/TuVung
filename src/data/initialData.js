import oxfordRaw from './oxford3000Data.json';
import {
  CORE_DECK_COVERS,
  VISUAL_DECKS,
  VISUAL_CURATED_WORDS,
  getWordIllustration,
} from './visualDecksData';

const now = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export const SRS_LEVELS = [
  { level: 0, name: 'Chưa học', color: '#94a3b8', bg: 'bg-slate-100 text-slate-700', intervalDays: 0, desc: 'Từ mới chưa qua lượt học nào' },
  { level: 1, name: 'Level 1 • Mới học', color: '#ef4444', bg: 'bg-red-100 text-red-700', intervalDays: 1, desc: 'Ôn lại sau 1 ngày' },
  { level: 2, name: 'Level 2 • Đang nhớ', color: '#f97316', bg: 'bg-orange-100 text-orange-700', intervalDays: 3, desc: 'Ôn lại sau 3 ngày' },
  { level: 3, name: 'Level 3 • Khá vững', color: '#eab308', bg: 'bg-amber-100 text-amber-700', intervalDays: 7, desc: 'Ôn lại sau 7 ngày' },
  { level: 4, name: 'Level 4 • Sắp thuộc', color: '#3b82f6', bg: 'bg-blue-100 text-blue-700', intervalDays: 14, desc: 'Ôn lại sau 14 ngày' },
  { level: 5, name: 'Đã thuộc lòng', color: '#10b981', bg: 'bg-emerald-100 text-emerald-700', intervalDays: 999, desc: 'Đã chuyển vào trí nhớ dài hạn' },
];

export const OXFORD_TOPICS = oxfordRaw.topics || [];

export const INITIAL_FOLDERS = [
  { id: 'folder-visual', name: 'Từ vựng Hình ảnh Trực quan', icon: '📸', color: '#e11d48' },
  { id: 'folder-school', name: 'Oxford 3000 & THPT Quốc Gia', icon: '📚', color: '#16a34a' },
  { id: 'folder-toeic', name: 'Lộ trình TOEIC 450 - 990', icon: '🎯', color: '#2563eb' },
  { id: 'folder-ielts', name: 'Lộ trình IELTS Academic', icon: '🎓', color: '#9333ea' },
  { id: 'folder-personal', name: 'Bộ từ cá nhân & Chuyên ngành', icon: '✨', color: '#ea580c' },
];

export const INITIAL_DECKS = [
  ...VISUAL_DECKS,
  {
    id: 'deck-oxford-daily',
    title: 'Oxford 3000 • Từ Vựng Tiếng Anh Thông Dụng Nhất',
    description: 'Trọn bộ từ vựng cốt lõi Oxford 3000 giúp bạn nắm vững 90% giao tiếp và văn bản tiếng Anh hàng ngày.',
    icon: '💬',
    tag: 'Oxford 3000',
    levelTag: 'A1 - B2',
    folderId: 'folder-school',
    color: 'from-amber-500 to-orange-600',
    coverImage: CORE_DECK_COVERS['deck-oxford-daily'],
    hasImages: true,
    isSystem: true,
    downloads: 128400,
    author: 'Luyện Từ Official',
  },
  {
    id: 'deck-toeic-business',
    title: 'TOEIC 650+ • Công việc, Kinh doanh & Tài chính',
    description: 'Bộ từ vựng cốt lõi thường gặp nhất trong Part 5, 6, 7 đề thi TOEIC chủ đề Contracts, Business & Money.',
    icon: '💼',
    tag: 'TOEIC',
    levelTag: '650 - 800+',
    folderId: 'folder-toeic',
    color: 'from-blue-500 to-indigo-600',
    coverImage: CORE_DECK_COVERS['deck-toeic-business'],
    hasImages: true,
    isSystem: true,
    downloads: 54200,
    author: 'Luyện Từ Official',
  },
  {
    id: 'deck-ielts-academic',
    title: 'IELTS Academic • Thiên nhiên, Khoa học & Xã hội',
    description: 'Từ vựng học thuật chủ đề Environment, Science, Society & Thinking cho IELTS Reading và Writing Task 2.',
    icon: '🌍',
    tag: 'IELTS',
    levelTag: 'Band 6.5 - 8.0+',
    folderId: 'folder-ielts',
    color: 'from-purple-500 to-fuchsia-600',
    coverImage: CORE_DECK_COVERS['deck-ielts-academic'],
    hasImages: true,
    isSystem: true,
    downloads: 46390,
    author: 'Luyện Từ Official',
  },
  {
    id: 'deck-thpt-core',
    title: 'Từ vựng Trọng tâm THPT Quốc Gia & Giáo dục',
    description: 'Tổng hợp từ vựng Giáo dục, Cảm xúc, Khái niệm và Cụm động từ (Phrasal Verbs) trọng tâm thi THPT.',
    icon: '🏫',
    tag: 'THPT',
    levelTag: 'Lớp 10 - 12',
    folderId: 'folder-school',
    color: 'from-emerald-500 to-teal-600',
    coverImage: CORE_DECK_COVERS['deck-thpt-core'],
    hasImages: true,
    isSystem: true,
    downloads: 62100,
    author: 'Luyện Từ Official',
  },
  {
    id: 'deck-tech-it',
    title: 'Tiếng Anh Công nghệ & Truyền thông (IT/Media)',
    description: 'Thuật ngữ và từ vựng chuyên ngành Công nghệ thông tin, Phần mềm và Truyền thông hiện đại.',
    icon: '💻',
    tag: 'Chuyên ngành',
    levelTag: 'B1 - C1',
    folderId: 'folder-personal',
    color: 'from-cyan-500 to-blue-600',
    coverImage: CORE_DECK_COVERS['deck-tech-it'],
    hasImages: true,
    isSystem: true,
    downloads: 28750,
    author: 'Luyện Từ Official',
  },
];

// Curated high-priority words (with hand-crafted examples & active SRS due dates)
const CURATED_WORDS = [
  {
    id: 'w-1',
    deckId: 'deck-toeic-business',
    word: 'agreement',
    ipa: '/əˈɡriːmənt/',
    pos: 'n',
    topicId: 'work',
    topicName: 'Công việc & kinh doanh',
    topicIcon: '💼',
    meaning: 'hợp đồng, sự thỏa thuận, sự đồng ý',
    example: 'Both parties signed the commercial agreement yesterday.',
    exampleVi: 'Cả hai bên đã ký hợp đồng thương mại vào ngày hôm qua.',
    level: 2,
    nextReview: now - 2 * HOUR,
  },
  {
    id: 'w-2',
    deckId: 'deck-toeic-business',
    word: 'negotiate',
    ipa: '/nɪˈɡəʊʃieɪt/',
    pos: 'v',
    topicId: 'work',
    topicName: 'Công việc & kinh doanh',
    topicIcon: '💼',
    meaning: 'đàm phán, thương lượng',
    example: 'We need to negotiate a better price with our supplier.',
    exampleVi: 'Chúng ta cần đàm phán một mức giá tốt hơn với nhà cung cấp.',
    level: 1,
    nextReview: now - 5 * HOUR,
  },
  {
    id: 'w-3',
    deckId: 'deck-toeic-business',
    word: 'assurance',
    ipa: '/əˈʃʊərəns/',
    pos: 'n',
    topicId: 'work',
    topicName: 'Công việc & kinh doanh',
    topicIcon: '💼',
    meaning: 'sự cam đoan, sự bảo đảm chắc chắn',
    example: 'The manager gave his assurance that the project would be completed on time.',
    exampleVi: 'Người quản lý đã cam đoan rằng dự án sẽ được hoàn thành đúng hạn.',
    level: 1,
    nextReview: now - 1 * HOUR,
  },
  {
    id: 'w-4',
    deckId: 'deck-toeic-business',
    word: 'comply',
    ipa: '/kəmˈplaɪ/',
    pos: 'v',
    topicId: 'work',
    topicName: 'Công việc & kinh doanh',
    topicIcon: '💼',
    meaning: 'tuân thủ, làm theo (quy định, luật lệ)',
    example: 'All employees must comply with the company safety regulations.',
    exampleVi: 'Tất cả nhân viên phải tuân thủ các quy định an toàn của công ty.',
    level: 3,
    nextReview: now - 30 * 60 * 1000,
  },
  {
    id: 'w-5',
    deckId: 'deck-toeic-business',
    word: 'implement',
    ipa: '/ˈɪmplɪment/',
    pos: 'v',
    topicId: 'work',
    topicName: 'Công việc & kinh doanh',
    topicIcon: '💼',
    meaning: 'triển khai, thực thi (kế hoạch, chính sách)',
    example: 'The board decided to implement the new marketing strategy next month.',
    exampleVi: 'Hội đồng quản trị đã quyết định triển khai chiến lược tiếp thị mới vào tháng tới.',
    level: 4,
    nextReview: now + 5 * DAY,
  },
  {
    id: 'w-6',
    deckId: 'deck-toeic-business',
    word: 'reimburse',
    ipa: '/ˌriːɪmˈbɜːs/',
    pos: 'v',
    topicId: 'money',
    topicName: 'Tiền bạc & mua sắm',
    topicIcon: '💰',
    meaning: 'hoàn trả lại tiền, bồi hoàn chi phí',
    example: 'The company will reimburse you for all travel expenses.',
    exampleVi: 'Công ty sẽ hoàn trả cho bạn toàn bộ chi phí đi lại.',
    level: 1,
    nextReview: now - 3 * HOUR,
  },
  {
    id: 'w-11',
    deckId: 'deck-ielts-academic',
    word: 'sustainable',
    ipa: '/səˈsteɪnəbl/',
    pos: 'adj',
    topicId: 'nature',
    topicName: 'Thiên nhiên, động vật & thời tiết',
    topicIcon: '🌿',
    meaning: 'bền vững, không gây hại cho môi trường',
    example: 'Governments must promote sustainable energy sources like solar and wind.',
    exampleVi: 'Các chính phủ phải thúc đẩy các nguồn năng lượng bền vững như mặt trời và gió.',
    level: 3,
    nextReview: now - 4 * HOUR,
  },
  {
    id: 'w-12',
    deckId: 'deck-ielts-academic',
    word: 'mitigate',
    ipa: '/ˈmɪtɪɡeɪt/',
    pos: 'v',
    topicId: 'nature',
    topicName: 'Thiên nhiên, động vật & thời tiết',
    topicIcon: '🌿',
    meaning: 'giảm thiểu, làm dịu bớt (tác động xấu)',
    example: 'Planting more trees helps mitigate the effects of climate change.',
    exampleVi: 'Trồng thêm cây xanh giúp giảm thiểu tác động của biến đổi khí hậu.',
    level: 2,
    nextReview: now - 1 * HOUR,
  },
  {
    id: 'w-13',
    deckId: 'deck-ielts-academic',
    word: 'ubiquitous',
    ipa: '/juːˈbɪkwɪtəs/',
    pos: 'adj',
    topicId: 'tech',
    topicName: 'Công nghệ & truyền thông',
    topicIcon: '💻',
    meaning: 'phổ biến khắp mọi nơi, đâu đâu cũng có',
    example: 'Smartphones have become ubiquitous in modern society.',
    exampleVi: 'Điện thoại thông minh đã trở nên phổ biến khắp mọi nơi trong xã hội hiện đại.',
    level: 1,
    nextReview: now - 2 * HOUR,
  },
  {
    id: 'w-19',
    deckId: 'deck-thpt-core',
    word: 'enthusiastic',
    ipa: '/ɪnˌθjuːziˈæstɪk/',
    pos: 'adj',
    topicId: 'feelings',
    topicName: 'Cảm xúc & tính cách',
    topicIcon: '😊',
    meaning: 'nhiệt tình, hào hứng, say mê',
    example: 'The students were very enthusiastic about the volunteer trip.',
    exampleVi: 'Các bạn học sinh rất hào hứng với chuyến đi tình nguyện.',
    level: 2,
    nextReview: now - 3 * HOUR,
  },
  {
    id: 'w-21',
    deckId: 'deck-thpt-core',
    word: 'vulnerable',
    ipa: '/ˈvʌlnərəbl/',
    pos: 'adj',
    topicId: 'society',
    topicName: 'Xã hội, chính trị & pháp luật',
    topicIcon: '⚖️',
    meaning: 'dễ bị tổn thương, nhạy cảm',
    example: 'Coastal cities are particularly vulnerable to rising sea levels.',
    exampleVi: 'Các thành phố ven biển đặc biệt dễ bị tổn thương trước mực nước biển dâng cao.',
    level: 1,
    nextReview: now - 2 * HOUR,
  },
  {
    id: 'w-27',
    deckId: 'deck-oxford-daily',
    word: 'confident',
    ipa: '/ˈkɒnfɪdənt/',
    pos: 'adj',
    topicId: 'feelings',
    topicName: 'Cảm xúc & tính cách',
    topicIcon: '😊',
    meaning: 'tự tin, tin chắc',
    example: 'Daily practice makes me feel much more confident when speaking English.',
    exampleVi: 'Luyện tập hàng ngày giúp tôi cảm thấy tự tin hơn nhiều khi nói tiếng Anh.',
    level: 3,
    nextReview: now - 1 * HOUR,
  },
  {
    id: 'w-29',
    deckId: 'deck-oxford-daily',
    word: 'recommend',
    ipa: '/ˌrekəˈmend/',
    pos: 'v',
    topicId: 'communication',
    topicName: 'Giao tiếp & ngôn ngữ',
    topicIcon: '💬',
    meaning: 'gợi ý, giới thiệu, khuyên dùng',
    example: 'Can you recommend a good restaurant near the city center?',
    exampleVi: 'Bạn có thể giới thiệu một nhà hàng ngon gần trung tâm thành phố không?',
    level: 1,
    nextReview: now - 6 * HOUR,
  },
  {
    id: 'w-31',
    deckId: 'deck-tech-it',
    word: 'scalable',
    ipa: '/ˈskeɪləbl/',
    pos: 'adj',
    topicId: 'tech',
    topicName: 'Công nghệ & truyền thông',
    topicIcon: '💻',
    meaning: 'có khả năng mở rộng (hệ thống, quy mô)',
    example: 'We built a scalable cloud architecture to handle millions of users.',
    exampleVi: 'Chúng tôi đã xây dựng kiến trúc đám mây có khả năng mở rộng để xử lý hàng triệu người dùng.',
    level: 2,
    nextReview: now - 4 * HOUR,
  },
  {
    id: 'w-34',
    deckId: 'deck-tech-it',
    word: 'latency',
    ipa: '/ˈleɪtnsi/',
    pos: 'n',
    topicId: 'tech',
    topicName: 'Công nghệ & truyền thông',
    topicIcon: '💻',
    meaning: 'độ trễ (mạng, phản hồi hệ thống)',
    example: 'Low latency is critical for real-time multiplayer games.',
    exampleVi: 'Độ trễ thấp là yếu tố sống còn đối với các trò chơi nhiều người chơi thời gian thực.',
    level: 1,
    nextReview: now - 2 * HOUR,
  },
];

// Map topic index from oxford3000Data.json to our 5 decks
function mapTopicToDeckId(topicIdx) {
  if (topicIdx === 8 || topicIdx === 9) return 'deck-toeic-business';
  if (topicIdx === 11 || topicIdx === 15 || topicIdx === 16 || topicIdx === 19) return 'deck-ielts-academic';
  if (topicIdx === 7 || topicIdx === 18 || topicIdx === 24 || topicIdx === 25) return 'deck-thpt-core';
  if (topicIdx === 14) return 'deck-tech-it';
  return 'deck-oxford-daily';
}

// Generate natural bilingual example sentence containing the word
function generateContextualExample(word, pos, meaning, topicName) {
  const firstMeaning = (meaning || '').split(',')[0].split(';')[0].trim();
  const primaryPos = (pos || 'n').split(',')[0].trim();

  if (primaryPos === 'v') {
    return {
      example: `In daily communication, people often use "${word}" when they want to ${word} effectively.`,
      exampleVi: `Trong giao tiếp hàng ngày, người ta thường dùng "${word}" để diễn đạt hành động "${firstMeaning}".`,
    };
  }
  if (primaryPos === 'adj') {
    return {
      example: `This situation is considered very ${word} in the context of modern life.`,
      exampleVi: `Tình huống này được xem là rất "${firstMeaning}" trong bối cảnh cuộc sống hiện đại.`,
    };
  }
  if (primaryPos === 'adv') {
    return {
      example: `She handled the task ${word} and achieved great results.`,
      exampleVi: `Cô ấy đã xử lý công việc một cách "${firstMeaning}" và đạt kết quả tốt.`,
    };
  }
  return {
    example: `Understanding the concept of "${word}" is very important in ${topicName?.toLowerCase() || 'English'}.`,
    exampleVi: `Hiểu rõ từ "${word}" (${firstMeaning}) rất quan trọng trong chủ đề ${topicName?.toLowerCase() || 'tiếng Anh'}.`,
  };
}

// Build complete 3,450+ words list combining visual curated words + core curated words + Oxford 3000 dataset
const allCuratedList = [
  ...VISUAL_CURATED_WORDS.map((w) => ({
    ...w,
    image: w.image || getWordIllustration(w),
    wrongCount: 0,
  })),
  ...CURATED_WORDS.map((w) => ({
    ...w,
    image: w.image || getWordIllustration(w),
    wrongCount: 0,
  })),
];

const curatedWordSet = new Set(allCuratedList.map((w) => w.word.toLowerCase()));

const oxfordMappedWords = (oxfordRaw.words || [])
  .filter((row) => row && row[0] && !curatedWordSet.has(String(row[0]).toLowerCase()))
  .map((row, idx) => {
    const [rawWord, rawPos, rawIpa, rawMeaning, topicIdx] = row;
    const topicObj = OXFORD_TOPICS[topicIdx] || {
      id: 'other',
      icon: '📦',
      name: 'Từ thông dụng khác',
    };
    const deckId = mapTopicToDeckId(topicIdx);
    const formattedIpa = rawIpa
      ? rawIpa.startsWith('/')
        ? rawIpa
        : `/${rawIpa}/`
      : `/${rawWord}/`;

    const { example, exampleVi } = generateContextualExample(
      rawWord,
      rawPos,
      rawMeaning,
      topicObj.name
    );

    // Give initial progress to the first 60 words so the user has a realistic SRS pyramid
    let level = 0;
    let nextReview = now;
    if (idx < 15) {
      level = 5; // Mastered
      nextReview = now + 365 * DAY;
    } else if (idx < 30) {
      level = 4;
      nextReview = now + 10 * DAY;
    } else if (idx < 45) {
      level = 3;
      nextReview = now + 5 * DAY;
    } else if (idx < 65) {
      level = 2;
      nextReview = now + 2 * DAY;
    }

    const baseObj = {
      id: `ox-${idx + 1}`,
      deckId,
      word: rawWord,
      ipa: formattedIpa,
      pos: rawPos || 'n',
      meaning: rawMeaning || 'Từ vựng thông dụng',
      topicId: topicObj.id,
      topicName: topicObj.name,
      topicIcon: topicObj.icon,
      example,
      exampleVi,
      level,
      nextReview,
      wrongCount: 0,
    };

    return {
      ...baseObj,
      image: getWordIllustration(baseObj),
    };
  });

// Also populate the 8 visual decks with additional Oxford 3000 words matching their topic so each visual deck has 30+ words
const VISUAL_DECK_TOPIC_MAP = {
  'deck-visual-food': ['food'],
  'deck-visual-travel': ['travel'],
  'deck-visual-nature': ['nature'],
  'deck-visual-medical': ['body'],
  'deck-visual-office': ['work', 'money'],
  'deck-visual-home': ['home', 'clothes'],
  'deck-visual-sports': ['sport', 'art'],
  'deck-visual-science': ['science', 'tech'],
};

const visualExtraWords = [];
Object.entries(VISUAL_DECK_TOPIC_MAP).forEach(([vDeckId, topicIds]) => {
  const matches = oxfordMappedWords
    .filter((w) => topicIds.includes(w.topicId))
    .slice(0, 24);
  matches.forEach((w, idx) => {
    visualExtraWords.push({
      ...w,
      id: `ox-vis-${vDeckId}-${idx + 1}`,
      deckId: vDeckId,
    });
  });
});

export const INITIAL_WORDS = [
  ...allCuratedList,
  ...visualExtraWords,
  ...oxfordMappedWords,
];

// --- ROADMAPS (Lộ trình học chuẩn hóa) ---
export const ROADMAPS = [
  {
    id: 'toeic',
    title: 'Lộ trình Chinh phục TOEIC 450 → 990',
    subtitle: 'Từ mất gốc đến thành thạo từ vựng thương mại & công sở quốc tế',
    badge: 'Phổ biến nhất',
    color: 'blue',
    learners: 45200,
    totalWords: 1200,
    stages: [
      {
        id: 'toeic-1',
        title: 'Chặng 1: Nền tảng TOEIC 450+',
        desc: 'Làm quen từ vựng văn phòng, lịch trình, thư tín và mua sắm cơ bản.',
        targetScore: '450+',
        deckId: 'deck-oxford-daily',
        status: 'completed',
        progress: 100,
      },
      {
        id: 'toeic-2',
        title: 'Chặng 2: Bứt phá TOEIC 650+',
        desc: 'Chinh phục từ vựng Hợp đồng (Contracts), Đàm phán (Negotiations) và Marketing.',
        targetScore: '650+',
        deckId: 'deck-toeic-business',
        status: 'active',
        progress: 65,
      },
      {
        id: 'toeic-3',
        title: 'Chặng 3: Làm chủ TOEIC 800+',
        desc: 'Từ vựng Tài chính, Kế toán, Nhân sự và Quản trị doanh nghiệp nâng cao.',
        targetScore: '800+',
        deckId: 'deck-toeic-business',
        status: 'unlocked',
        progress: 20,
      },
      {
        id: 'toeic-4',
        title: 'Chặng 4: Đỉnh cao TOEIC 900 - 990',
        desc: 'Collocations khó, từ đồng nghĩa bẫy trong Part 5 & Part 7 đọc hiểu chuyên sâu.',
        targetScore: '990',
        deckId: 'deck-toeic-business',
        status: 'locked',
        progress: 0,
      },
    ],
  },
  {
    id: 'ielts',
    title: 'Lộ trình IELTS Academic Band 5.0 → 8.0+',
    subtitle: 'Hệ thống từ vựng học thuật theo 12 chủ đề trọng tâm Writing & Reading',
    badge: 'Học thuật',
    color: 'purple',
    learners: 32800,
    totalWords: 1500,
    stages: [
      {
        id: 'ielts-1',
        title: 'Chặng 1: Foundation (Band 5.0 - 5.5)',
        desc: 'Từ vựng chủ đề Education, Family, Health và Lifestyle.',
        targetScore: '5.5',
        deckId: 'deck-thpt-core',
        status: 'completed',
        progress: 100,
      },
      {
        id: 'ielts-2',
        title: 'Chặng 2: Upper-Intermediate (Band 6.0 - 6.5)',
        desc: 'Từ vựng học thuật Environment, Climate Change, Urbanization & Society.',
        targetScore: '6.5',
        deckId: 'deck-ielts-academic',
        status: 'active',
        progress: 55,
      },
      {
        id: 'ielts-3',
        title: 'Chặng 3: Advanced (Band 7.0 - 8.0+)',
        desc: 'Từ vựng C1-C2 sắc bén cho IELTS Writing Task 2 & Speaking Part 3.',
        targetScore: '8.0+',
        deckId: 'deck-ielts-academic',
        status: 'unlocked',
        progress: 15,
      },
    ],
  },
  {
    id: 'thpt',
    title: 'Lộ trình Điểm 9+ Tiếng Anh THPT Quốc Gia',
    subtitle: 'Bám sát chương trình SGK mới & đề minh họa của Bộ GD&ĐT',
    badge: 'Học sinh THPT',
    color: 'emerald',
    learners: 28900,
    totalWords: 900,
    stages: [
      {
        id: 'thpt-1',
        title: 'Chặng 1: Từ vựng SGK Lớp 10 - 11 - 12',
        desc: 'Nắm chắc toàn bộ từ vựng cốt lõi theo từng Unit trong sách giáo khoa.',
        targetScore: '7.5+',
        deckId: 'deck-thpt-core',
        status: 'active',
        progress: 70,
      },
      {
        id: 'thpt-2',
        title: 'Chặng 2: Phrasal Verbs & Collocations Ăn Điểm',
        desc: 'Các cụm động từ và cụm từ cố định phân loại thí sinh đạt 8.5 - 10 điểm.',
        targetScore: '9.5+',
        deckId: 'deck-thpt-core',
        status: 'unlocked',
        progress: 30,
      },
    ],
  },
];

// --- STORE ITEMS ---
export const STORE_ITEMS = [
  {
    id: 'item-streak-freeze',
    category: 'special',
    name: '❄️ Đá Hồi & Bảo Vệ Streak',
    description: 'Bảo vệ chuỗi ngày học liên tục hoặc khôi phục ngay lập tức chuỗi Streak vừa bị đứt.',
    price: 300,
    icon: '❄️',
    badge: 'Bán chạy nhất',
    consumable: true,
  },
  {
    id: 'item-xp-boost',
    category: 'special',
    name: '⚡ Bình Nhân Đôi Xu & XP',
    description: 'Nhận gấp đôi lượng Xu và điểm XP khi hoàn thành các bài luyện tập và trò chơi.',
    price: 250,
    icon: '⚡',
    badge: 'Tăng tốc',
    consumable: true,
  },
  {
    id: 'item-sound-mech',
    category: 'special',
    name: '⌨️ Âm thanh Bàn phím Cơ & Meme Đúng',
    description: 'Bật hiệu ứng âm thanh gõ phím cơ cực đã tai và tiếng tinh tinh vui nhộn khi trả lời đúng.',
    price: 200,
    icon: '🎵',
    badge: 'Âm thanh',
    consumable: false,
  },
  {
    id: 'theme-default',
    category: 'theme',
    name: '🌤️ Luyện Từ Classic (Mặc định)',
    description: 'Giao diện sáng trong trẻo, tối ưu sự tập trung khi học flashcard.',
    price: 0,
    icon: '🌤️',
    previewBg: 'from-blue-50 via-indigo-50 to-amber-50',
    effect: 'none',
  },
  {
    id: 'theme-snow',
    category: 'theme',
    name: '❄️ Mùa Đông Bắc Âu (Có tuyết rơi)',
    description: 'Không gian học tập mát dịu kèm hiệu ứng bông tuyết rơi nhẹ nhàng trên màn hình.',
    price: 400,
    icon: '🌨️',
    previewBg: 'from-sky-100 via-blue-50 to-indigo-100',
    effect: 'snow',
    badge: 'Có tuyết rơi',
  },
  {
    id: 'theme-sakura',
    category: 'theme',
    name: '🌸 Mùa Hoa Anh Đào Kyoto (Có hoa rơi)',
    description: 'Giao diện hồng pastel lãng mạn với những cánh hoa anh đào bay trong gió.',
    price: 450,
    icon: '🌸',
    previewBg: 'from-rose-100 via-pink-50 to-amber-50',
    effect: 'sakura',
    badge: 'Có hoa rơi',
  },
  {
    id: 'theme-aurora',
    category: 'theme',
    name: '🌌 Cực Quang Bắc Cực (Aurora)',
    description: 'Sự pha trộn huyền ảo giữa sắc xanh ngọc lục bảo và tím ngân hà.',
    price: 500,
    icon: '🌌',
    previewBg: 'from-emerald-100 via-teal-50 to-purple-100',
    effect: 'stars',
    badge: 'VIP',
  },
  {
    id: 'avatar-owl',
    category: 'avatar',
    name: '🦉 Cú Thông Thái',
    description: 'Biểu tượng của sự kiên trì và trí tuệ vượt trội.',
    price: 0,
    icon: '🦉',
  },
  {
    id: 'avatar-shiba',
    category: 'avatar',
    name: '🐕 Shiba Chăm Chỉ',
    description: 'Luôn tràn đầy năng lượng cày từ vựng mỗi sáng.',
    price: 180,
    icon: '🐕',
  },
  {
    id: 'avatar-cat',
    category: 'avatar',
    name: '🐱 Mèo Học Bá 990 TOEIC',
    description: 'Chuyên gia săn điểm tối đa trong mọi bài Quiz tốc độ.',
    price: 220,
    icon: '🐱',
  },
  {
    id: 'avatar-dragon',
    category: 'avatar',
    name: '🐉 Rồng Lửa IELTS 8.5',
    description: 'Khẳng định đẳng cấp bậc thầy từ vựng học thuật.',
    price: 400,
    icon: '🐉',
    badge: 'Hiếm',
  },
  {
    id: 'avatar-astro',
    category: 'avatar',
    name: '🧑‍🚀 Phi Hành Gia Ngôn Ngữ',
    description: 'Chinh phục vũ trụ từ vựng không giới hạn.',
    price: 320,
    icon: '🧑‍🚀',
  },
  {
    id: 'avatar-wizard',
    category: 'avatar',
    name: '🧙‍♂️ Phù Thủy Spaced Repetition',
    description: 'Ghi nhớ mọi từ vựng chỉ sau một lần lật thẻ.',
    price: 350,
    icon: '🧙‍♂️',
  },
];

// --- AI TOPIC GENERATOR BANK ---
export const AI_TOPIC_BANK = {
  travel: {
    title: 'Du lịch & Sân bay Quốc tế (Travel & Aviation)',
    icon: '✈️',
    tag: 'Giao tiếp',
    words: [
      { word: 'itinerary', ipa: '/aɪˈtɪnərəri/', pos: 'n', meaning: 'lịch trình chuyến đi', example: 'Our tour guide sent us the detailed travel itinerary.', exampleVi: 'Hướng dẫn viên đã gửi cho chúng tôi lịch trình chuyến đi chi tiết.' },
      { word: 'boarding pass', ipa: '/ˈbɔːdɪŋ pɑːs/', pos: 'n', meaning: 'thẻ lên máy bay', example: 'Please show your passport and boarding pass at the gate.', exampleVi: 'Vui lòng xuất trình hộ chiếu và thẻ lên máy bay tại cổng.' },
      { word: 'accommodation', ipa: '/əˌkɒməˈdeɪʃn/', pos: 'n', meaning: 'chỗ ở, nơi lưu trú', example: 'Hotel accommodation is included in the tour package.', exampleVi: 'Chỗ ở khách sạn đã được bao gồm trong gói du lịch.' },
      { word: 'customs', ipa: '/ˈkʌstəmz/', pos: 'n', meaning: 'hải quan', example: 'It took us thirty minutes to clear customs at the airport.', exampleVi: 'Chúng tôi mất ba mươi phút để làm thủ tục hải quan tại sân bay.' },
      { word: 'souvenir', ipa: '/ˌsuːvəˈnɪə(r)/', pos: 'n', meaning: 'quà lưu niệm', example: 'I bought a handmade souvenir for my family in Kyoto.', exampleVi: 'Tôi đã mua một món quà lưu niệm thủ công cho gia đình ở Kyoto.' },
      { word: 'destination', ipa: '/ˌdestɪˈneɪʃn/', pos: 'n', meaning: 'điểm đến', example: 'Da Nang is a popular tourist destination in Vietnam.', exampleVi: 'Đà Nẵng là một điểm đến du lịch nổi tiếng tại Việt Nam.' },
    ],
  },
  interview: {
    title: 'Phỏng vấn Xin việc & CV (Job Interview)',
    icon: '🤝',
    tag: 'TOEIC / Công sở',
    words: [
      { word: 'qualification', ipa: '/ˌkwɒlɪfɪˈkeɪʃn/', pos: 'n', meaning: 'bằng cấp, trình độ chuyên môn', example: 'She has all the right qualifications for the manager role.', exampleVi: 'Cô ấy có đầy đủ bằng cấp chuyên môn phù hợp cho vị trí quản lý.' },
      { word: 'proficient', ipa: '/prəˈfɪʃnt/', pos: 'adj', meaning: 'thành thạo, giỏi (kỹ năng, ngoại ngữ)', example: 'Candidates must be proficient in both written and spoken English.', exampleVi: 'Ứng viên phải thành thạo cả tiếng Anh viết và nói.' },
      { word: 'collaborate', ipa: '/kəˈlæbəreɪt/', pos: 'v', meaning: 'hợp tác, cộng tác làm việc', example: 'I enjoy collaborating with cross-functional teams.', exampleVi: 'Tôi thích cộng tác làm việc với các nhóm liên phòng ban.' },
      { word: 'initiative', ipa: '/ɪˈnɪʃətɪv/', pos: 'n', meaning: 'sự chủ động, sáng kiến', example: 'Employers value staff who show initiative and problem-solving skills.', exampleVi: 'Nhà tuyển dụng đánh giá cao nhân sự thể hiện sự chủ động và kỹ năng giải quyết vấn đề.' },
      { word: 'remuneration', ipa: '/rɪˌmjuːnəˈreɪʃn/', pos: 'n', meaning: 'tiền lương, thù lao đãi ngộ', example: 'The company offers a competitive remuneration package.', exampleVi: 'Công ty đưa ra gói đãi ngộ lương thưởng rất cạnh tranh.' },
      { word: 'adaptable', ipa: '/əˈdæptəbl/', pos: 'adj', meaning: 'dễ thích nghi, linh hoạt', example: 'Being adaptable is essential in a fast-paced startup environment.', exampleVi: 'Khả năng thích nghi là điều thiết yếu trong môi trường startup nhịp độ nhanh.' },
    ],
  },
  finance: {
    title: 'Tài chính, Đầu tư & Ngân hàng (Finance & Banking)',
    icon: '📈',
    tag: 'TOEIC / Kinh tế',
    words: [
      { word: 'inflation', ipa: '/ɪnˈfleɪʃn/', pos: 'n', meaning: 'lạm phát', example: 'High inflation has reduced consumers’ purchasing power.', exampleVi: 'Lạm phát cao đã làm giảm sức mua của người tiêu dùng.' },
      { word: 'revenue', ipa: '/ˈrevənjuː/', pos: 'n', meaning: 'doanh thu', example: 'The company’s annual revenue exceeded 50 million dollars.', exampleVi: 'Doanh thu hàng năm của công ty đã vượt mức 50 triệu đô la.' },
      { word: 'dividend', ipa: '/ˈdɪvɪdend/', pos: 'n', meaning: 'cổ tức', example: 'Shareholders will receive a higher dividend this quarter.', exampleVi: 'Các cổ đông sẽ nhận được mức cổ tức cao hơn trong quý này.' },
      { word: 'liability', ipa: '/ˌlaɪəˈbɪləti/', pos: 'n', meaning: 'khoản nợ, trách nhiệm pháp lý', example: 'The firm is trying to reduce its financial liabilities.', exampleVi: 'Công ty đang cố gắng cắt giảm các khoản nợ tài chính.' },
      { word: 'portfolio', ipa: '/pɔːtˈfəʊliəʊ/', pos: 'n', meaning: 'danh mục đầu tư / hồ sơ năng lực', example: 'Diversifying your investment portfolio helps minimize risk.', exampleVi: 'Đa dạng hóa danh mục đầu tư giúp giảm thiểu rủi ro.' },
      { word: 'transaction', ipa: '/trænˈzækʃn/', pos: 'n', meaning: 'giao dịch', example: 'All online banking transactions are encrypted for safety.', exampleVi: 'Tất cả các giao dịch ngân hàng trực tuyến đều được mã hóa để đảm bảo an toàn.' },
    ],
  },
  health: {
    title: 'Sức khỏe, Y tế & Lối sống (Health & Wellbeing)',
    icon: '🩺',
    tag: 'IELTS / Đời sống',
    words: [
      { word: 'sedentary', ipa: '/ˈsedntri/', pos: 'adj', meaning: 'ít vận động, ngồi nhiều', example: 'A sedentary lifestyle can lead to obesity and heart disease.', exampleVi: 'Lối sống ít vận động có thể dẫn đến béo phì và bệnh tim mạch.' },
      { word: 'immune', ipa: '/ɪˈmjuːn/', pos: 'adj', meaning: 'miễn dịch', example: 'Vitamin C helps strengthen your immune system.', exampleVi: 'Vitamin C giúp củng cố hệ miễn dịch của bạn.' },
      { word: 'symptom', ipa: '/ˈsɪmptəm/', pos: 'n', meaning: 'triệu chứng', example: 'If symptoms persist for more than three days, consult a doctor.', exampleVi: 'Nếu các triệu chứng kéo dài hơn ba ngày, hãy hỏi ý kiến bác sĩ.' },
      { word: 'nutritious', ipa: '/njuˈtrɪʃəs/', pos: 'adj', meaning: 'bổ dưỡng, giàu dinh dưỡng', example: 'Home-cooked meals are usually more nutritious than fast food.', exampleVi: 'Bữa ăn nấu tại nhà thường giàu dinh dưỡng hơn đồ ăn nhanh.' },
      { word: 'longevity', ipa: '/lɒnˈdʒevəti/', pos: 'n', meaning: 'tuổi thọ, sự sống lâu', example: 'Regular exercise and a balanced diet promote longevity.', exampleVi: 'Tập thể dục đều đặn và chế độ ăn cân bằng giúp tăng tuổi thọ.' },
      { word: 'remedy', ipa: '/ˈremədi/', pos: 'n', meaning: 'phương thuốc, cách chữa trị', example: 'Warm honey lemon water is a popular natural remedy for a sore throat.', exampleVi: 'Nước chanh mật ong ấm là phương thuốc tự nhiên phổ biến trị đau họng.' },
    ],
  },
};

// Build fast lookup dictionary from all 3,375+ words for instant Auto-Fill
export const SMART_DICTIONARY = {
  resilient: { ipa: '/rɪˈzɪliənt/', pos: 'adj', meaning: 'kiên cường, có khả năng phục hồi nhanh', example: 'Children are often remarkably resilient in the face of change.', exampleVi: 'Trẻ em thường có khả năng thích nghi và phục hồi đáng kinh ngạc trước sự thay đổi.' },
  procrastinate: { ipa: '/prəˈkræstɪneɪt/', pos: 'v', meaning: 'trì hoãn, chần chừ', example: 'Stop procrastinating and start reviewing your flashcards today!', exampleVi: 'Đừng trì hoãn nữa và hãy bắt đầu ôn tập thẻ từ vựng ngay hôm nay!' },
  eloquent: { ipa: '/ˈeləkwənt/', pos: 'adj', meaning: 'hùng hồn, có tài ăn nói lưu loát', example: 'She gave an eloquent speech that moved the entire audience.', exampleVi: 'Cô ấy đã có một bài phát biểu hùng hồn làm xúc động cả khán phòng.' },
  diligent: { ipa: '/ˈdɪlɪdʒənt/', pos: 'adj', meaning: 'chăm chỉ, cần cù, siêng năng', example: 'Diligent students review their vocabulary every single day.', exampleVi: 'Những học sinh chăm chỉ ôn tập từ vựng mỗi ngày.' },
  ambitious: { ipa: '/æmˈbɪʃəs/', pos: 'adj', meaning: 'giàu tham vọng, có hoài bão lớn', example: 'He is an ambitious young engineer aiming to work at Google.', exampleVi: 'Anh ấy là một kỹ sư trẻ đầy hoài bão với mục tiêu làm việc tại Google.' },
  perspective: { ipa: '/pəˈspektɪv/', pos: 'n', meaning: 'góc nhìn, quan điểm', example: 'Learning a foreign language gives you a new perspective on the world.', exampleVi: 'Học ngoại ngữ mang lại cho bạn một góc nhìn mới về thế giới.' },
  inevitable: { ipa: '/ɪnˈevɪtəbl/', pos: 'adj', meaning: 'không thể tránh khỏi, tất yếu', example: 'Forgetting is inevitable without spaced repetition review.', exampleVi: 'Việc quên từ là điều tất yếu nếu không ôn tập lặp lại ngắt quãng.' },
  breakthrough: { ipa: '/ˈbreɪkθruː/', pos: 'n', meaning: 'bước đột phá', example: 'Scientists have made a major breakthrough in cancer treatment.', exampleVi: 'Các nhà khoa học đã tạo ra bước đột phá lớn trong điều trị ung thư.' },
};

// Also populate SMART_DICTIONARY with all Oxford 3000 & Visual words so any word typed gets real IPA, meaning & illustration!
INITIAL_WORDS.forEach((w) => {
  const k = w.word.toLowerCase();
  if (!SMART_DICTIONARY[k] || !SMART_DICTIONARY[k].image) {
    SMART_DICTIONARY[k] = {
      ipa: SMART_DICTIONARY[k]?.ipa || w.ipa,
      pos: SMART_DICTIONARY[k]?.pos || w.pos,
      meaning: SMART_DICTIONARY[k]?.meaning || w.meaning,
      example: SMART_DICTIONARY[k]?.example || w.example,
      exampleVi: SMART_DICTIONARY[k]?.exampleVi || w.exampleVi,
      image: w.image,
    };
  }
});

// --- LEADERBOARD & STUDY BUDDY ---
export const INITIAL_LEADERBOARD = [
  { id: 'u-1', name: 'Minh Anh • IELTS 8.0', avatar: '🐉', streak: 64, mastered: 842, xp: 14520, badge: 'Quán quân Tuần' },
  { id: 'u-2', name: 'Hoàng Nam TOEIC', avatar: '🐱', streak: 49, mastered: 710, xp: 12890, badge: 'Top 2' },
  { id: 'u-3', name: 'Thảo Nguyên 2k8', avatar: '🧙‍♂️', streak: 38, mastered: 635, xp: 11240, badge: 'Top 3' },
  { id: 'u-4', name: 'Đức Thịnh Dev', avatar: '🧑‍🚀', streak: 27, mastered: 512, xp: 9450, badge: 'Chăm chỉ' },
  { id: 'u-5', name: 'Khánh Linh', avatar: '🐕', streak: 21, mastered: 430, xp: 8120, badge: 'Bứt phá' },
  { id: 'u-6', name: 'Quốc Bảo Bách Khoa', avatar: '🦉', streak: 16, mastered: 345, xp: 6780, badge: '' },
  { id: 'u-7', name: 'Ngọc Trâm', avatar: '🌸', streak: 9, mastered: 210, xp: 4300, badge: '' },
];

export const INITIAL_BUDDY = {
  partnerName: 'Minh Anh • IELTS 8.0',
  partnerAvatar: '🐉',
  sharedStreak: 14,
  partnerStudiedToday: true,
  todayMessage: 'Hôm nay mình đã ôn xong 20 từ IELTS rồi, cậu cùng học để giữ chuỗi 15 ngày nhé! 🔥',
  feed: [
    { id: 'm-1', user: 'Minh Anh • IELTS 8.0', avatar: '🐉', time: '10 phút trước', text: 'Vừa hoàn thành 100% bài Nghe & Viết bộ từ IELTS Academic! 🎯' },
    { id: 'm-2', user: 'Hoàng Nam TOEIC', avatar: '🐱', time: '25 phút trước', text: 'Thuật toán SRS nhắc ôn đúng mấy từ Part 5 hay nhầm thật sự 👏' },
    { id: 'm-3', user: 'Thảo Nguyên 2k8', avatar: '🧙‍♂️', time: '1 giờ trước', text: 'Mới đổi được giao diện Hoa Anh Đào rơi trong Cửa hàng đẹp mê ly 🌸' },
  ],
};
