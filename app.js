/**
 * LinguaFlow HCI - Core Application Logic
 * Implements interactive learning experiences, navigation, speech synthesis,
 * audio chimes, profile management, and interactive database operations.
 */

// ==================== STATE MANAGEMENT ====================
const state = {
  currentScreen: 'screen-auth',
  selectedLanguage: 'Kannada',
  flashcardIndex: 0,
  flashcardsList: [],
  isCardFlipped: false,
  quizCurrentIndex: 0,
  quizScore: 0,
  quizQuestions: [],
  lastQuizQuestionIds: [],
  activeDbTab: 'activity_logs',
  dbSearchQuery: '',
  dbLanguageFilter: 'All',
  editingRecord: null, // for modal edit
  editingTable: null,
  authMode: 'signin',
  matchCards: [],
  matchSelected: [],
  matchPairs: 0,
  matchRound: 1,
  matchTotalPairs: 0,
  matchUsedVocabularyIds: []
};

let phoneConfirmationResult = null;
let phoneRecaptchaVerifier = null;
let authMethod = 'email';

// ==================== AUDIO & SOUND SYNTHESIZER ====================
// Web Audio API for feedback chimes (HCI: Visibility of System Status & Multimodal Feedback)
const AudioFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  },
  playTone(frequency, type = 'sine', duration = 0.15, delay = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  },
  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0);       // C5
    this.playTone(659.25, 'sine', 0.1, 0.08);    // E5
    this.playTone(783.99, 'sine', 0.25, 0.16);   // G5
  },
  playError() {
    this.playTone(300, 'triangle', 0.15, 0);
    this.playTone(240, 'triangle', 0.2, 0.12);
  },
  playFlip() {
    this.playTone(440, 'sine', 0.06, 0);
  },
  playClick() {
    this.playTone(600, 'sine', 0.04, 0);
  }
};

// Web Speech API for authentic native pronunciation
const VoiceEngine = {
  langLocales: {
    'English': 'en-IN',
    'Kannada': 'kn-IN',
    'Hindi': 'hi-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Malayalam': 'ml-IN',
    'Marathi': 'mr-IN',
    'Bengali': 'bn-IN',
    'Gujarati': 'gu-IN',
    'Punjabi': 'pa-IN',
    'Odia': 'or-IN',
    'Urdu': 'ur-IN',
    'Sanskrit': 'hi-IN',
    'Assamese': 'as-IN',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Japanese': 'ja-JP',
    'Italian': 'it-IT'
  },
  speak(text, language = 'Kannada') {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = this.langLocales[language] || 'en-IN';
    utterance.lang = locale;
    utterance.rate = 0.85; // Slightly slower for better learnability (HCI)

    // Visual feedback for speech playing
    const audioAnim = document.getElementById('flashcard-audio-anim');
    if (audioAnim) audioAnim.classList.remove('hidden');

    utterance.onend = () => {
      if (audioAnim) audioAnim.classList.add('hidden');
    };
    utterance.onerror = () => {
      if (audioAnim) audioAnim.classList.add('hidden');
    };

    window.speechSynthesis.speak(utterance);
  }
};

// ==================== SCREEN NAVIGATION ====================
function showScreen(screenId) {
  const protectedScreens = [
    'screen-learn', 'screen-flashcards', 'screen-quiz', 'screen-match',
    'screen-languages', 'screen-profile', 'screen-database'
  ];
  const currentUser = window.db && window.db.getCurrentUser ? window.db.getCurrentUser() : null;
  if (protectedScreens.includes(screenId) && !currentUser) {
    screenId = 'screen-auth';
    showToast('Please sign in or continue as Guest to access the app.');
  }

  AudioFX.playClick();
  state.currentScreen = screenId;

  const appNavigation = document.getElementById('app-navigation');
  const headerActions = document.getElementById('header-app-actions');
  const mobileNavigationContainer = document.getElementById('mobile-app-navigation');
  const isAuthenticated = screenId !== 'screen-auth'
    && Boolean(window.db && window.db.getCurrentUser && window.db.getCurrentUser());
  if (appNavigation) {
    appNavigation.classList.toggle('hidden', !isAuthenticated);
    appNavigation.classList.toggle('md:flex', isAuthenticated);
  }
  if (headerActions) headerActions.classList.toggle('hidden', !isAuthenticated);
  if (mobileNavigationContainer) mobileNavigationContainer.classList.toggle('hidden', !isAuthenticated);

  const mobileNavigation = document.getElementById('mobile-screen-nav');
  if (mobileNavigation) mobileNavigation.value = screenId;
  if (screenId === 'screen-auth') {
    clearAuthForm();
    if (window.db) window.db.setCurrentUser(null);
    if (window.firebaseAuth) window.firebaseAuth.signOut().catch(() => {});
  }

  // Hide all screens
  document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));

  // Show target screen
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update navigation link highlights
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const dest = btn.getAttribute('data-screen');
    if (dest === screenId) {
      btn.classList.add('bg-indigo-50', 'text-indigo-600', 'font-semibold');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
    } else {
      btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'font-semibold');
      btn.classList.add('text-slate-600', 'hover:bg-slate-50');
    }
  });

  // Screen-specific setup
  if (screenId === 'screen-flashcards') {
    initFlashcards();
  } else if (screenId === 'screen-quiz') {
    initQuiz();
  } else if (screenId === 'screen-database') {
    renderDatabaseTable();
  } else if (screenId === 'screen-profile') {
    renderProfileView();
  } else if (screenId === 'screen-learn') {
    renderLearnDashboard();
  } else if (screenId === 'screen-languages') {
    renderLanguagesHub();
  } else if (screenId === 'screen-match') {
    initMatchGame();
  }

  // Update HCI Inspector button badge for the current view
  updateHciInspectorContent();
}

// ==================== LANGUAGE SELECTION ====================
const AVAILABLE_LANGUAGES = [
  // Major Indian Languages
  { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ', desc: 'Classical Dravidian tongue of Karnataka with 2,000+ years of literary heritage.', level: 'Beginner to Advanced' },
  { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी', desc: 'Widely spoken across India in Devanagari script, rich with poetry and folk tradition.', level: 'Beginner to Advanced' },
  { name: 'English', flag: '🌐', native: 'English', desc: 'Global lingua franca and official medium of higher education and tech across India.', level: 'Conversational' },
  { name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்', desc: 'Ancient classical language with Sangam poetry, celebrated for its phonetic precision.', level: 'Beginner to Advanced' },
  { name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు', desc: 'Mellifluous language praised as the "Italian of the East" with vowel-ending words.', level: 'Beginner to Advanced' },
  { name: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം', desc: 'Language of Kerala, noted for literary refinement and palindromic name.', level: 'Beginner to Advanced' },
  { name: 'Marathi', flag: '🇮🇳', native: 'मराठी', desc: 'Historic language of Maharashtra celebrated for Sant literature and cinema.', level: 'Beginner to Advanced' },
  { name: 'Bengali', flag: '🇮🇳', native: 'বাংলা', desc: 'Language of Rabindranath Tagore, known for lyrical sweetness and renaissance arts.', level: 'Beginner to Advanced' },
  { name: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી', desc: 'Language of Mahatma Gandhi, commerce, folklore, and vibrant Garba culture.', level: 'Beginner to Advanced' },
  { name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ', desc: 'Energetic tonal language of Punjab written in Gurmukhi with rich folk songs.', level: 'Beginner to Advanced' },
  { name: 'Odia', flag: '🇮🇳', native: 'ଓଡ଼ିଆ', desc: 'Classical language of Odisha with distinctive rounded script and ancient epics.', level: 'Beginner to Advanced' },
  { name: 'Urdu', flag: '🇮🇳', native: 'اردو', desc: 'Lyrical Nastaliq script celebrated for ghazals, courtly etiquette, and poetry.', level: 'Beginner to Advanced' },
  { name: 'Sanskrit', flag: '🇮🇳', native: 'संस्कृतम्', desc: 'The sacred mother language of ancient India, root of philosophy, yoga, and mantras.', level: 'Classical Heritage' },
  { name: 'Assamese', flag: '🇮🇳', native: 'অসমীয়া', desc: 'Vibrant Indo-Aryan language along the Brahmaputra with Bihu musical folklore.', level: 'Beginner to Advanced' },

  // International Languages
  { name: 'Spanish', flag: '🇪🇸', native: 'Español', desc: '460M+ global speakers. Known for rhythmic clarity and expressive warmth.', level: 'A1 - Beginner' },
  { name: 'French', flag: '🇫🇷', native: 'Français', desc: 'The language of diplomacy, gastronomy, and literature.', level: 'A1 - Beginner' },
  { name: 'German', flag: '🇩🇪', native: 'Deutsch', desc: 'Engineered precision and rich compound descriptive vocabulary.', level: 'A1 - Beginner' },
  { name: 'Japanese', flag: '🇯🇵', native: '日本語', desc: 'Polite honorifics, Hiragana, Katakana, and expressive Kanji characters.', level: 'A1 - Beginner' },
  { name: 'Italian', flag: '🇮🇹', native: 'Italiano', desc: 'Musical phonetics, open vowels, and vibrant cultural expressiveness.', level: 'A1 - Beginner' }
];

function setLanguage(langName) {
  state.selectedLanguage = langName;
  const user = window.db.getCurrentUser();
  if (user) {
    window.db.updateUser(user.id, { targetLanguage: langName });
  }

  // Update header display
  updateHeaderUserInfo();
  window.db.logActivity('Language Selected', langName, `Switched focus language to ${langName}`, 5, '100%', 2);

  // If on flashcards or quiz, reload for current language
  if (state.currentScreen === 'screen-flashcards') initFlashcards();
  if (state.currentScreen === 'screen-quiz') initQuiz();
  if (state.currentScreen === 'screen-languages') renderLanguagesHub();

  showToast(`Language switched to ${langName}!`);
}

function renderLanguagesHub() {
  const container = document.getElementById('languages-grid');
  if (!container) return;

  const vocab = window.db.getVocabulary();

  container.innerHTML = AVAILABLE_LANGUAGES.map(lang => {
    const isSelected = state.selectedLanguage.toLowerCase() === lang.name.toLowerCase();
    const wordsCount = vocab.filter(v => v.language.toLowerCase() === lang.name.toLowerCase()).length;

    return `
      <div class="p-6 rounded-2xl border-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' 
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
      }" onclick="setLanguage('${lang.name}')">
        <div class="flex items-start justify-between mb-4">
          <span class="text-5xl select-none">${lang.flag}</span>
          ${
            isSelected
              ? '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">✓ Active Focus</span>'
              : '<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Click to Select</span>'
          }
        </div>
        <h3 class="text-xl font-bold text-slate-800">${lang.name} <span class="text-sm font-normal text-slate-500">(${lang.native})</span></h3>
        <p class="text-xs text-slate-500 mt-1 mb-3">${lang.desc}</p>
        <div class="flex items-center justify-between text-xs font-semibold text-slate-600 pt-3 border-t border-slate-100">
          <span>${wordsCount} Vocabulary Words</span>
          <span class="text-indigo-600">${lang.level}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== FLASHCARDS ENGINE ====================
function initFlashcards() {
  state.flashcardsList = window.db.getVocabulary(state.selectedLanguage);
  if (state.flashcardsList.length === 0) {
    state.flashcardsList = window.db.getVocabulary('Spanish'); // fallback
  }
  state.flashcardIndex = 0;
  state.isCardFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  const card = state.flashcardsList[state.flashcardIndex];
  if (!card) return;

  const cardInner = document.getElementById('flashcard-inner');
  const wordFront = document.getElementById('card-word-front');
  const phoneticFront = document.getElementById('card-phonetic-front');
  const categoryFront = document.getElementById('card-category-front');
  const langFront = document.getElementById('card-lang-front');

  const translationBack = document.getElementById('card-translation-back');
  const wordBack = document.getElementById('card-word-back');
  const masteryBack = document.getElementById('card-mastery-back');

  const counter = document.getElementById('flashcard-counter');
  const progressBar = document.getElementById('flashcard-progress-bar');

  // Reset flip
  state.isCardFlipped = false;
  if (cardInner) cardInner.classList.remove('is-flipped');

  // Fill content
  if (wordFront) wordFront.textContent = card.word;
  if (phoneticFront) phoneticFront.textContent = `/${card.phonetic || '...'}/`;
  if (categoryFront) categoryFront.textContent = card.category || 'General';
  if (langFront) langFront.textContent = card.language;

  if (translationBack) translationBack.textContent = card.translation;
  if (wordBack) wordBack.textContent = card.word;
  if (masteryBack) masteryBack.textContent = `Mastery: ${card.mastery || 50}%`;

  if (counter) counter.textContent = `Card ${state.flashcardIndex + 1} of ${state.flashcardsList.length}`;
  if (progressBar) {
    const pct = Math.round(((state.flashcardIndex + 1) / state.flashcardsList.length) * 100);
    progressBar.style.width = `${pct}%`;
  }
}

function flipCard() {
  AudioFX.playFlip();
  const cardInner = document.getElementById('flashcard-inner');
  if (cardInner) {
    state.isCardFlipped = !state.isCardFlipped;
    cardInner.classList.toggle('is-flipped', state.isCardFlipped);
  }
}

function playCardAudio(e) {
  if (e) e.stopPropagation();
  const card = state.flashcardsList[state.flashcardIndex];
  if (card) {
    VoiceEngine.speak(card.word, card.language);
  }
}

function rateCardConfidence(rating) {
  const card = state.flashcardsList[state.flashcardIndex];
  if (!card) return;

  let scoreGained = 5;
  let masteryDelta = 5;
  if (rating === 'easy') {
    scoreGained = 10;
    masteryDelta = 10;
    AudioFX.playSuccess();
  } else if (rating === 'medium') {
    scoreGained = 5;
    masteryDelta = 4;
    AudioFX.playClick();
  } else {
    scoreGained = 2;
    masteryDelta = -5;
    AudioFX.playError();
  }

  const updatedMastery = Math.min(100, Math.max(10, (card.mastery || 50) + masteryDelta));
  const updatedReviews = (card.reviews || 0) + 1;

  // Update in Database (CRUD Update)
  window.db.updateVocabularyItem(card.id, {
    mastery: updatedMastery,
    reviews: updatedReviews
  });

  // Log Activity in Database (Professor's core requirement)
  window.db.logActivity(
    'Flashcard Review',
    card.language,
    `Practiced "${card.word}" (${card.translation}) - Rated ${rating.toUpperCase()}`,
    scoreGained,
    rating === 'easy' ? '100%' : (rating === 'medium' ? '75%' : '40%'),
    8
  );
  updateDailyChallenge(1);

  // Next card
  nextCard();
}

function nextCard() {
  if (state.flashcardIndex < state.flashcardsList.length - 1) {
    state.flashcardIndex++;
    renderFlashcard();
  } else {
    showToast('🎉 All flashcards in this set completed!');
    state.flashcardIndex = 0;
    renderFlashcard();
  }
}

function prevCard() {
  if (state.flashcardIndex > 0) {
    state.flashcardIndex--;
    renderFlashcard();
  }
}

// ==================== QUIZ & CHALLENGE ENGINE ====================
function generateQuizQuestions(language) {
  const vocab = window.db.getVocabulary(language);
  const questions = [];

  if (vocab.length < 3) return [];

  const shuffledVocabulary = [...vocab].sort(() => Math.random() - 0.5);
  let selectedVocabulary = shuffledVocabulary.slice(0, Math.min(4, shuffledVocabulary.length));
  const selectedIds = selectedVocabulary.map(item => item.id).sort();
  const repeatedSet = selectedIds.length === state.lastQuizQuestionIds.length
    && selectedIds.every((id, index) => id === state.lastQuizQuestionIds[index]);

  if (repeatedSet && shuffledVocabulary.length > selectedVocabulary.length) {
    const replacement = shuffledVocabulary.find(item => !selectedIds.includes(item.id));
    selectedVocabulary = [replacement, ...selectedVocabulary.slice(1)];
  }

  state.lastQuizQuestionIds = selectedVocabulary.map(item => item.id).sort();

  // Generate dynamic multiple-choice questions from a new shuffled vocabulary set
  selectedVocabulary.forEach((item, idx) => {
    // Pick 3 wrong distractors from other words
    const distractors = vocab
      .filter(v => v.id !== item.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(v => v.translation);

    const options = [...distractors, item.translation].sort(() => 0.5 - Math.random());

    questions.push({
      id: `q-${idx}`,
      type: 'multiple-choice',
      prompt: `What is the meaning of "${item.word}" in ${item.language}?`,
      targetWord: item.word,
      correctAnswer: item.translation,
      options: options,
      phonetic: item.phonetic,
      language: item.language
    });
  });

  return questions;
}

function initQuiz() {
  state.quizQuestions = generateQuizQuestions(state.selectedLanguage);
  state.quizCurrentIndex = 0;
  state.quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quizContainer = document.getElementById('quiz-question-card');
  const resultContainer = document.getElementById('quiz-result-card');
  const progress = document.getElementById('quiz-stepper-progress');

  if (!quizContainer) return;

  if (state.quizQuestions.length === 0) {
    quizContainer.innerHTML = `
      <div class="text-center py-12">
        <p class="text-slate-500">Not enough vocabulary words to generate a quiz for ${state.selectedLanguage}.</p>
        <button onclick="showScreen('screen-database')" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
          Add Words in Database
        </button>
      </div>
    `;
    return;
  }

  // Check if finished
  if (state.quizCurrentIndex >= state.quizQuestions.length) {
    showQuizResults();
    return;
  }

  quizContainer.classList.remove('hidden');
  if (resultContainer) resultContainer.classList.add('hidden');

  const q = state.quizQuestions[state.quizCurrentIndex];
  const pct = Math.round(((state.quizCurrentIndex) / state.quizQuestions.length) * 100);
  if (progress) progress.style.width = `${pct}%`;

  document.getElementById('quiz-question-number').textContent = `Question ${state.quizCurrentIndex + 1} of ${state.quizQuestions.length}`;
  document.getElementById('quiz-question-prompt').textContent = q.prompt;
  document.getElementById('quiz-word-display').textContent = q.targetWord;
  document.getElementById('quiz-phonetic-display').textContent = `/${q.phonetic || ''}/`;

  const optionsGrid = document.getElementById('quiz-options-grid');
  optionsGrid.innerHTML = q.options.map((opt, i) => `
    <button 
      class="quiz-option w-full p-4 text-left font-medium text-slate-800 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all flex items-center justify-between"
      onclick="submitQuizAnswer('${opt.replace(/'/g, "\\'")}', this)"
    >
      <span class="flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">${['A', 'B', 'C', 'D'][i]}</span>
        <span>${opt}</span>
      </span>
      <span class="text-sm opacity-0 option-indicator">✓</span>
    </button>
  `).join('');
}

function submitQuizAnswer(selectedOption, buttonEl) {
  const q = state.quizQuestions[state.quizCurrentIndex];
  const isCorrect = selectedOption === q.correctAnswer;

  // Disable all options
  document.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);

  if (isCorrect) {
    AudioFX.playSuccess();
    buttonEl.classList.add('correct');
    state.quizScore += 25;
  } else {
    AudioFX.playError();
    buttonEl.classList.add('incorrect');
    // Highlight correct answer
    document.querySelectorAll('.quiz-option').forEach(btn => {
      if (btn.textContent.includes(q.correctAnswer)) {
        btn.classList.add('correct');
      }
    });
  }

  // Next question after brief pause for feedback (HCI: Visibility of System Status)
  setTimeout(() => {
    state.quizCurrentIndex++;
    renderQuizQuestion();
  }, 1200);
}

function showQuizResults() {
  const quizContainer = document.getElementById('quiz-question-card');
  const resultContainer = document.getElementById('quiz-result-card');
  const progress = document.getElementById('quiz-stepper-progress');

  if (quizContainer) quizContainer.classList.add('hidden');
  if (resultContainer) resultContainer.classList.remove('hidden');
  if (progress) progress.style.width = '100%';

  const totalQuestions = state.quizQuestions.length;
  const accuracy = Math.round((state.quizScore / (totalQuestions * 25)) * 100);

  document.getElementById('quiz-final-score').textContent = `${state.quizScore} XP`;
  document.getElementById('quiz-final-accuracy').textContent = `${accuracy}%`;

  // Log complete quiz activity into Database (Professor's requirement)
  window.db.logActivity(
    'Quiz Completed',
    state.selectedLanguage,
    `Completed ${state.selectedLanguage} Challenge (${accuracy}% Accuracy, +${state.quizScore} XP)`,
    state.quizScore,
    `${accuracy}%`,
    45
  );
  updateDailyChallenge(Math.min(state.quizQuestions.length, 5));
  AudioFX.playSuccess();
  showToast(`Quiz completed! ${state.quizScore} XP saved to database.`);
}


// ==================== DAILY CHALLENGE & ACHIEVEMENTS ====================
function getDailyChallengeKey() {
  const user = window.db.getCurrentUser();
  return `linguaflow_daily_${user ? user.id : 'guest'}_${new Date().toISOString().slice(0, 10)}`;
}

function getDailyChallengeProgress() {
  return Number(localStorage.getItem(getDailyChallengeKey()) || 0);
}

function updateDailyChallenge(amount = 0) {
  const nextProgress = Math.min(5, getDailyChallengeProgress() + amount);
  localStorage.setItem(getDailyChallengeKey(), String(nextProgress));
  renderDailyChallenge();
  if (nextProgress === 5 && amount > 0) {
    AudioFX.playSuccess();
    showToast('🏅 Daily challenge completed!');
  }
}

function renderDailyChallenge() {
  const progress = getDailyChallengeProgress();
  const progressBar = document.getElementById('daily-challenge-progress');
  const status = document.getElementById('daily-challenge-status');
  const action = document.getElementById('daily-challenge-action');
  if (progressBar) progressBar.style.width = `${progress * 20}%`;
  if (status) status.textContent = `${progress} / 5 words reviewed`;
  if (action) {
    action.textContent = progress >= 5 ? 'Completed' : 'Start Challenge';
    action.disabled = progress >= 5;
    action.classList.toggle('opacity-60', progress >= 5);
  }
}

function startDailyChallenge() {
  if (getDailyChallengeProgress() >= 5) return;
  showScreen('screen-flashcards');
  showToast('Review five cards to complete today\'s challenge.');
}

function renderAchievements() {
  const user = window.db.getCurrentUser() || {};
  const vocab = window.db.getVocabulary(state.selectedLanguage);
  const mastered = vocab.filter(item => Number(item.mastery) >= 80).length;
  const badges = [
    { icon: '🌱', title: 'First Steps', earned: vocab.length > 0 },
    { icon: '🔥', title: 'Streak', earned: Number(user.streak) >= 3 },
    { icon: '⭐', title: 'XP 100', earned: Number(user.totalXP) >= 100 },
    { icon: '📚', title: 'Word Builder', earned: mastered >= 5 },
    { icon: '🎯', title: 'Quizzer', earned: Boolean(window.db.getActivityLogs().some(log => log.actionType === 'Quiz Completed')) },
    { icon: '🏆', title: 'Daily Win', earned: getDailyChallengeProgress() >= 5 }
  ];
  const container = document.getElementById('achievement-list');
  if (!container) return;
  container.innerHTML = badges.map(badge => `
    <div class="achievement-badge ${badge.earned ? 'earned' : ''}" title="${badge.title}">
      <span class="text-xl ${badge.earned ? '' : 'grayscale opacity-40'}">${badge.icon}</span>
      <span class="text-[10px] font-bold ${badge.earned ? 'text-slate-700' : 'text-slate-400'}">${badge.title}</span>
    </div>
  `).join('');
}

// ==================== VOCABULARY MATCHING GAME ====================
function initMatchGame() {
  state.matchRound = 1;
  state.matchTotalPairs = 0;
  state.matchUsedVocabularyIds = [];
  startMatchRound();
}

function startMatchRound() {
  const allVocabulary = window.db.getVocabulary(state.selectedLanguage);
  const pairCount = state.matchRound + 2;
  const unusedVocabulary = allVocabulary.filter(item => !state.matchUsedVocabularyIds.includes(item.id));
  const vocab = [...unusedVocabulary].sort(() => Math.random() - 0.5).slice(0, pairCount);
  const board = document.getElementById('match-board');
  const completePanel = document.getElementById('match-complete-panel');
  if (!board) return;
  if (vocab.length < pairCount) {
    board.innerHTML = '<p class="col-span-full text-center text-sm text-slate-500 py-8">Add more vocabulary to continue this round.</p>';
    return;
  }
  state.matchSelected = [];
  state.matchPairs = 0;
  state.matchTotalPairs = pairCount;
  state.matchUsedVocabularyIds.push(...vocab.map(item => item.id));
  state.matchCards = vocab.flatMap((item, index) => [
    { id: `word-${index}`, pair: index, label: item.word, type: 'word' },
    { id: `meaning-${index}`, pair: index, label: item.translation, type: 'meaning' }
  ]).sort(() => Math.random() - 0.5);
  if (completePanel) completePanel.classList.add('hidden');
  const roundLabel = document.getElementById('match-round-label');
  if (roundLabel) roundLabel.textContent = `Round ${state.matchRound} of 5 · ${pairCount} pairs`;
  board.innerHTML = state.matchCards.map(card => `
    <button id="match-${card.id}" onclick="selectMatchCard('${card.id}')" class="match-card min-h-24 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-slate-700 transition-all">
      <span class="match-card-label">?</span>
    </button>
  `).join('');
  updateMatchLabels();
}

function selectMatchCard(cardId) {
  if (state.matchSelected.some(card => card.id === cardId) || state.matchSelected.length >= 2) return;
  const card = state.matchCards.find(item => item.id === cardId);
  const button = document.getElementById(`match-${cardId}`);
  if (!card || !button) return;
  button.querySelector('.match-card-label').textContent = card.label;
  button.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-800');
  state.matchSelected.push(card);
  if (state.matchSelected.length < 2) return;

  const [first, second] = state.matchSelected;
  if (first.pair === second.pair && first.type !== second.type) {
    AudioFX.playSuccess();
    [first, second].forEach(cardItem => document.getElementById(`match-${cardItem.id}`)?.classList.add('matched'));
    state.matchPairs++;
    updateDailyChallenge(1);
    state.matchSelected = [];
    updateMatchLabels();
    if (state.matchPairs === state.matchTotalPairs) {
      document.getElementById('match-complete-panel')?.classList.remove('hidden');
      const isFinalRound = state.matchRound === 5;
      document.getElementById('match-complete-text').textContent = isFinalRound
        ? `You completed all five rounds in ${state.selectedLanguage}.`
        : `Round ${state.matchRound} complete. The next round is tougher.`;
      const nextButton = document.getElementById('match-next-round-btn');
      const restartButton = document.getElementById('match-restart-btn');
      if (nextButton) nextButton.classList.toggle('hidden', isFinalRound);
      if (restartButton) restartButton.classList.toggle('hidden', !isFinalRound);
      window.db.logActivity('Matching Game', state.selectedLanguage, `Completed Match Game round ${state.matchRound} (${state.matchTotalPairs} pairs)`, 10 + state.matchRound * 5, '100%', 30);
      if (isFinalRound) showToast('🏆 Match Game completed! All five rounds finished.');
    }
  } else {
    AudioFX.playError();
    setTimeout(() => {
      [first, second].forEach(cardItem => {
        const cardButton = document.getElementById(`match-${cardItem.id}`);
        if (cardButton) {
          cardButton.querySelector('.match-card-label').textContent = '?';
          cardButton.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-800');
        }
      });
      state.matchSelected = [];
    }, 650);
  }
}

function updateMatchLabels() {
  const score = document.getElementById('match-score-label');
  if (score) score.textContent = `${state.matchPairs} / ${state.matchTotalPairs} pairs matched`;
}

function nextMatchRound() {
  if (state.matchRound >= 5) return;
  state.matchRound++;
  startMatchRound();
}

// ==================== PROFILE & SETTINGS ====================
function renderProfileView() {
  const user = window.db.getCurrentUser();
  if (!user) return;

  document.getElementById('profile-avatar-display').textContent = user.avatar || '👨‍🎓';
  document.getElementById('profile-name-input').value = user.name || '';
  document.getElementById('profile-email-input').value = user.email || '';
  document.getElementById('profile-bio-input').value = user.bio || '';
  document.getElementById('profile-goal-select').value = user.dailyGoal || 15;
  document.getElementById('profile-role-badge').textContent = user.role || 'Student Learner';

  // Stats
  document.getElementById('profile-stat-xp').textContent = `${user.totalXP || 0} XP`;
  const isGuest = user.role && user.role.includes('Guest');
  document.getElementById('profile-stat-streak').textContent = isGuest
    ? '0 Days'
    : `${user.streak || 1} Days`;
  document.getElementById('profile-stat-words').textContent = isGuest
    ? 'Temporary'
    : `${user.wordsMastered || 0} Words`;

  // Language focus in profile
  document.getElementById('profile-lang-focus').textContent = user.targetLanguage || state.selectedLanguage;
}

function saveProfileChanges(e) {
  if (e) e.preventDefault();
  const user = window.db.getCurrentUser();
  if (!user) return;

  const updatedName = document.getElementById('profile-name-input').value.trim();
  const updatedEmail = document.getElementById('profile-email-input').value.trim();
  const updatedBio = document.getElementById('profile-bio-input').value.trim();
  const updatedGoal = Number(document.getElementById('profile-goal-select').value);

  if (!updatedName) {
    alert('Name cannot be empty.');
    return;
  }

  // Update in Database (CRUD Operation)
  const updated = window.db.updateUser(user.id, {
    name: updatedName,
    email: updatedEmail,
    bio: updatedBio,
    dailyGoal: updatedGoal
  });

  // Log Activity to Database
  window.db.logActivity(
    'Profile Updated',
    user.targetLanguage,
    `Updated profile info for ${updatedName}`,
    10,
    '100%',
    5
  );

  updateHeaderUserInfo();
  AudioFX.playSuccess();
  showToast('✓ Profile successfully updated in database!');
}

function selectAvatar(avatarEmoji) {
  const user = window.db.getCurrentUser();
  if (user) {
    window.db.updateUser(user.id, { avatar: avatarEmoji });
    document.getElementById('profile-avatar-display').textContent = avatarEmoji;
    updateHeaderUserInfo();
    AudioFX.playClick();
  }
}

// ==================== AUTHENTICATION & OAUTH CONTROLLERS ====================

function switchAuthTab(tab) {
  AudioFX.playClick();
  state.authMode = tab;

  const tabSignIn = document.getElementById('auth-tab-signin');
  const tabRegister = document.getElementById('auth-tab-register');
  const nameBox = document.getElementById('auth-name-container');
  const nameInput = document.getElementById('auth-name-input');
  const confirmPasswordBox = document.getElementById('auth-confirm-container');
  const confirmPasswordInput = document.getElementById('auth-confirm-password-input');
  const passwordMeter = document.getElementById('auth-password-meter');
  const title = document.getElementById('auth-main-title');
  const subtitle = document.getElementById('auth-main-subtitle');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (tab === 'signin') {
    if (tabSignIn) {
      tabSignIn.classList.add('bg-white', 'text-indigo-700', 'shadow-sm');
      tabSignIn.classList.remove('text-slate-500');
    }
    if (tabRegister) {
      tabRegister.classList.remove('bg-white', 'text-indigo-700', 'shadow-sm');
      tabRegister.classList.add('text-slate-500');
    }
    if (nameBox) nameBox.classList.add('hidden');
    if (nameInput) nameInput.removeAttribute('required');
    if (confirmPasswordBox) confirmPasswordBox.classList.add('hidden');
    if (confirmPasswordInput) {
      confirmPasswordInput.value = '';
      confirmPasswordInput.removeAttribute('required');
    }
    if (passwordMeter) passwordMeter.classList.add('hidden');
    if (title) title.textContent = 'Welcome to LinguaFlow';
    if (subtitle) subtitle.textContent = 'Sign in to sync your language journey & database logs';
    if (submitBtn) submitBtn.textContent = 'Sign In to LinguaFlow';
  } else {
    if (tabRegister) {
      tabRegister.classList.add('bg-white', 'text-indigo-700', 'shadow-sm');
      tabRegister.classList.remove('text-slate-500');
    }
    if (tabSignIn) {
      tabSignIn.classList.remove('bg-white', 'text-indigo-700', 'shadow-sm');
      tabSignIn.classList.add('text-slate-500');
    }
    if (nameBox) nameBox.classList.remove('hidden');
    if (nameInput) nameInput.setAttribute('required', 'true');
    if (confirmPasswordBox) confirmPasswordBox.classList.remove('hidden');
    if (confirmPasswordInput) confirmPasswordInput.setAttribute('required', 'true');
    if (passwordMeter) passwordMeter.classList.remove('hidden');
    if (title) title.textContent = 'Create your Account';
    if (subtitle) subtitle.textContent = 'Start learning languages & track your database progress';
    if (submitBtn) submitBtn.textContent = 'Create Free Account';
  }

  const phoneName = document.getElementById('phone-name-container');
  const phoneNameInput = document.getElementById('auth-phone-name-input');
  if (phoneName) phoneName.classList.toggle('hidden', authMethod !== 'phone' || tab !== 'register');
  if (phoneNameInput) phoneNameInput.toggleAttribute('required', authMethod === 'phone' && tab === 'register');
}

function switchAuthMethod(method) {
  AudioFX.playClick();
  authMethod = method;
  const emailForm = document.querySelector('form[onsubmit="handleEmailAuthFormSubmit(event)"]');
  const phoneForm = document.getElementById('phone-auth-form');
  const emailTab = document.getElementById('auth-method-email');
  const phoneTab = document.getElementById('auth-method-phone');
  const phoneName = document.getElementById('phone-name-container');
  const phoneNameInput = document.getElementById('auth-phone-name-input');

  if (emailForm) emailForm.classList.toggle('hidden', method !== 'email');
  if (phoneForm) phoneForm.classList.toggle('hidden', method !== 'phone');
  if (emailTab) {
    emailTab.classList.toggle('bg-white', method === 'email');
    emailTab.classList.toggle('text-indigo-700', method === 'email');
    emailTab.classList.toggle('shadow-sm', method === 'email');
    emailTab.classList.toggle('text-slate-500', method !== 'email');
    emailTab.setAttribute('aria-selected', String(method === 'email'));
  }
  if (phoneTab) {
    phoneTab.classList.toggle('bg-white', method === 'phone');
    phoneTab.classList.toggle('text-indigo-700', method === 'phone');
    phoneTab.classList.toggle('shadow-sm', method === 'phone');
    phoneTab.classList.toggle('text-slate-500', method !== 'phone');
    phoneTab.setAttribute('aria-selected', String(method === 'phone'));
  }
  if (phoneName) phoneName.classList.toggle('hidden', state.authMode !== 'register');
  if (phoneNameInput) phoneNameInput.toggleAttribute('required', state.authMode === 'register');
  if (method === 'phone') setupPhoneRecaptcha();
}

function setupPhoneRecaptcha() {
  if (!window.firebaseAuth || phoneRecaptchaVerifier || !document.getElementById('phone-recaptcha-container')) return;
  try {
    phoneRecaptchaVerifier = new firebase.auth.RecaptchaVerifier('phone-recaptcha-container', { size: 'normal' });
    phoneRecaptchaVerifier.render();
  } catch (error) {
    showAuthError('Phone verification could not start. Refresh the page and try again.');
  }
}

async function handlePhoneAuthFormSubmit(e) {
  if (e) e.preventDefault();
  const phoneInput = document.getElementById('auth-phone-input');
  const enteredPhone = phoneInput ? phoneInput.value.trim() : '';
  const digits = enteredPhone.replace(/\D/g, '');
  const phone = enteredPhone.startsWith('+')
    ? `+${digits}`
    : digits.length === 10
      ? `+91${digits}`
      : digits.startsWith('91')
        ? `+${digits}`
        : '';
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    showAuthError('Enter a valid phone number, such as 9876543210, 919876543210, or +919876543210.');
    return;
  }
  if (!window.firebaseAuth) {
    showAuthError('Firebase is not available. Open the app from the deployed site or Live Server.');
    return;
  }
  setupPhoneRecaptcha();
  if (!phoneRecaptchaVerifier) return;
  try {
    phoneConfirmationResult = await window.firebaseAuth.signInWithPhoneNumber(phone, phoneRecaptchaVerifier);
    document.getElementById('phone-code-container')?.classList.remove('hidden');
    document.getElementById('phone-send-code-btn')?.classList.add('hidden');
    document.getElementById('phone-confirm-code-btn')?.classList.remove('hidden');
    showAuthSuccess('Verification code sent. Check your phone.');
  } catch (error) {
    if (phoneRecaptchaVerifier) phoneRecaptchaVerifier.clear();
    phoneRecaptchaVerifier = null;
    const message = error.code === 'auth/operation-not-allowed'
      ? 'Phone login is not enabled in Firebase Authentication yet.'
      : error.code === 'auth/billing-not-enabled'
        ? 'Real SMS OTP requires Firebase billing. For a free demo, add a Firebase test phone number in Authentication settings.'
        : error.message;
    showAuthError(message);
  }
}

async function confirmPhoneCode() {
  const codeInput = document.getElementById('auth-phone-code-input');
  const code = codeInput ? codeInput.value.trim() : '';
  const confirmButton = document.getElementById('phone-confirm-code-btn');
  if (!phoneConfirmationResult || !/^\d{6}$/.test(code)) {
    showAuthError('Enter the 6-digit verification code sent to your phone.');
    return;
  }
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = 'Opening your learning space...';
  }
  try {
    const credentialResult = await phoneConfirmationResult.confirm(code);
    const phoneName = document.getElementById('auth-phone-name-input')?.value.trim();
    const user = await window.db.saveFirebaseUser(credentialResult.user, {
      name: phoneName || credentialResult.user.displayName || 'Phone Learner',
      targetLanguage: state.selectedLanguage || 'Kannada',
      authProvider: 'Firebase Phone OTP'
    });
    window.db.setCurrentUser(user);
    state.selectedLanguage = user.targetLanguage || 'Kannada';
    window.db.logActivity('User Login', state.selectedLanguage, `User ${user.name} signed in with phone verification`, 10, '100%', 5);
    clearAuthForm();
    AudioFX.playSuccess();
    updateHeaderUserInfo();
    showScreen('screen-learn');
    showToast(`Welcome, ${user.name}!`);
  } catch (error) {
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Verify and Continue';
    }
    showAuthError(error.code === 'auth/invalid-verification-code' ? 'That verification code is incorrect.' : error.message);
  }
}

function showAuthError(message) {
  const banner = document.getElementById('auth-error-banner');
  const text = document.getElementById('auth-error-text');
  if (text) text.textContent = message;
  if (banner) banner.classList.remove('hidden');
}

function showAuthSuccess(message) {
  const banner = document.getElementById('auth-success-banner');
  const text = document.getElementById('auth-success-text');
  if (text) text.textContent = message;
  if (banner) banner.classList.remove('hidden');
}

function togglePasswordVisibility(inputId, btnEl) {
  AudioFX.playClick();
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (btnEl) btnEl.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btnEl) btnEl.textContent = '👁️';
  }
}

function updatePasswordStrength(password) {
  const bar = document.getElementById('password-strength-bar');
  const text = document.getElementById('password-strength-text');
  if (!bar || !text) return;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength++;

  if (strength === 0) {
    bar.style.width = '20%';
    bar.className = 'bg-rose-500 h-1.5 rounded-full transition-all';
    text.textContent = 'Password strength: Weak (min 6 characters)';
    text.className = 'text-[10px] text-rose-500 font-semibold mt-1';
  } else if (strength === 1) {
    bar.style.width = '50%';
    bar.className = 'bg-amber-500 h-1.5 rounded-full transition-all';
    text.textContent = 'Password strength: Fair';
    text.className = 'text-[10px] text-amber-600 font-semibold mt-1';
  } else {
    bar.style.width = '100%';
    bar.className = 'bg-emerald-500 h-1.5 rounded-full transition-all';
    text.textContent = 'Password strength: Strong ✓';
    text.className = 'text-[10px] text-emerald-600 font-semibold mt-1';
  }
}

// ==================== GOOGLE / GMAIL OAUTH SIMULATOR ====================
function openGoogleOAuthModal() {
  AudioFX.playClick();
  const modal = document.getElementById('google-oauth-modal');
  const loading = document.getElementById('google-loading-state');
  const list = document.getElementById('google-accounts-list');
  const customBox = document.getElementById('google-custom-input-box');

  if (loading) loading.classList.add('hidden');
  if (list) list.classList.remove('hidden');
  if (customBox) customBox.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
}

function closeGoogleOAuthModal() {
  const modal = document.getElementById('google-oauth-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleCustomGoogleInput() {
  AudioFX.playClick();
  const customBox = document.getElementById('google-custom-input-box');
  if (customBox) customBox.classList.toggle('hidden');
}

function submitCustomGoogleAccount() {
  const input = document.getElementById('google-custom-email-input');
  const email = input ? input.value.trim() : '';

  if (!email || !email.includes('@')) {
    alert('Please enter a valid Gmail address.');
    return;
  }

  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  selectGoogleAccount(email, name, '🌐');
}

function selectGoogleAccount(email, name, avatar) {
  AudioFX.playClick();
  const loading = document.getElementById('google-loading-state');
  const list = document.getElementById('google-accounts-list');

  if (list) list.classList.add('hidden');
  if (loading) loading.classList.remove('hidden');

  // Realistic OAuth simulation delay
  setTimeout(() => {
    const user = window.db.loginWithOAuth('Google', email, name, avatar || '🌐');
    state.selectedLanguage = user.targetLanguage || 'Kannada';

    AudioFX.playSuccess();
    closeGoogleOAuthModal();
    updateHeaderUserInfo();
    showScreen('screen-learn');
    showToast(`✓ Signed in with Google (${email})`);
  }, 900);
}

// ==================== FACEBOOK OAUTH SIMULATOR ====================
function openFacebookOAuthModal() {
  AudioFX.playClick();
  const modal = document.getElementById('fb-oauth-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeFacebookOAuthModal() {
  const modal = document.getElementById('fb-oauth-modal');
  if (modal) modal.classList.add('hidden');
}

function confirmFacebookOAuthLogin() {
  AudioFX.playSuccess();
  const user = window.db.loginWithOAuth('Facebook', 'facebook.user@fbmail.com', 'Facebook Learner', '📱');
  state.selectedLanguage = user.targetLanguage || 'Kannada';

  closeFacebookOAuthModal();
  updateHeaderUserInfo();
  showScreen('screen-learn');
  showToast('✓ Successfully authenticated via Facebook!');
}

// ==================== GENERIC OAUTH (APPLE, GITHUB) ====================
function simulateOAuthLogin(provider, defaultEmail, defaultName, avatar) {
  AudioFX.playSuccess();
  const user = window.db.loginWithOAuth(provider, defaultEmail, defaultName, avatar);
  state.selectedLanguage = user.targetLanguage || 'Kannada';

  updateHeaderUserInfo();
  showScreen('screen-learn');
  showToast(`✓ Successfully signed in via ${provider}!`);
}

// ==================== EMAIL & PASSWORD SUBMIT ====================
function clearAuthForm() {
  const inputIds = [
    'auth-name-input',
    'auth-email-input',
    'auth-password-input',
    'auth-confirm-password-input'
  ];

  inputIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });

  const successBanner = document.getElementById('auth-success-banner');
  const errorBanner = document.getElementById('auth-error-banner');
  const passwordMeter = document.getElementById('auth-password-meter');
  if (successBanner) successBanner.classList.add('hidden');
  if (errorBanner) errorBanner.classList.add('hidden');
  if (passwordMeter) passwordMeter.classList.add('hidden');
}

async function handleEmailAuthFormSubmit(e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');
  const nameInput = document.getElementById('auth-name-input');
  const confirmPasswordInput = document.getElementById('auth-confirm-password-input');
  const errorBanner = document.getElementById('auth-error-banner');
  const errorText = document.getElementById('auth-error-text');
  const successBanner = document.getElementById('auth-success-banner');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const name = nameInput ? nameInput.value.trim() : 'Student Learner';
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

  if (errorBanner) errorBanner.classList.add('hidden');
  if (successBanner) successBanner.classList.add('hidden');

  const showAuthError = message => {
    if (errorText) errorText.textContent = message;
    if (errorBanner) errorBanner.classList.remove('hidden');
  };

  if (!email || !email.includes('@')) {
    showAuthError('Please enter a valid email address.');
    return;
  }
  if (!password || password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  let user;

  if (state.authMode === 'register') {
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match. Please re-enter them.');
      return;
    }

    const result = await window.db.registerFirebaseUser(
      name || 'Student Learner',
      email,
      password,
      state.selectedLanguage || 'Kannada'
    );

    if (!result.success) {
      showAuthError(result.message);
      return;
    }

    user = result.user;
    if (successBanner) successBanner.classList.remove('hidden');
  } else {
    const result = await window.db.authenticateFirebaseUser(email, password);
    if (!result.success) {
      showAuthError(result.message);
      return;
    }

    user = result.user;
  }

  window.db.setCurrentUser(user);
  state.selectedLanguage = user.targetLanguage || 'Kannada';
  clearAuthForm();

  AudioFX.playSuccess();
  updateHeaderUserInfo();
  showScreen('screen-learn');
  showToast(`Welcome back, ${user.name}!`);
}

// ==================== GUEST EVALUATOR LOGIN ====================
function continueAsGuest() {
  AudioFX.playSuccess();
  let users = window.db.getUsers();
  let guest = users.find(u => u.role.includes('Guest') || u.email.includes('guest'));

  if (!guest) {
    guest = window.db.addUser({
      name: 'Professor / Guest Evaluator',
      email: 'evaluator@hci-review.edu',
      role: 'Guest / Evaluator',
      avatar: '👨‍🏫',
      authProvider: 'Guest Access',
      targetLanguage: state.selectedLanguage || 'Kannada',
      dailyGoal: 15,
      level: 'Advanced'
    });
  }

  window.db.setCurrentUser(guest);
  state.selectedLanguage = guest.targetLanguage || 'Kannada';

  updateHeaderUserInfo();
  showScreen('screen-learn');
  showToast(`Welcome! Logged in as Guest Evaluator`);
}

// ==================== FORGOT PASSWORD MODAL ====================
function openForgotPasswordModal() {
  AudioFX.playClick();
  const modal = document.getElementById('forgot-password-modal');
  const alertBox = document.getElementById('forgot-feedback-alert');
  if (alertBox) alertBox.classList.add('hidden');
  if (modal) modal.classList.remove('hidden');
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('hidden');
}

function handleForgotPasswordSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('forgot-email-input');
  const email = input ? input.value.trim() : '';

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  const alertBox = document.getElementById('forgot-feedback-alert');
  if (alertBox) alertBox.classList.remove('hidden');
  AudioFX.playSuccess();

  setTimeout(() => {
    closeForgotPasswordModal();
    showToast(`Password reset link dispatched to ${email}`);
  }, 1800);
}

function updateHeaderUserInfo() {
  const user = window.db.getCurrentUser();
  const guestModeFooter = document.getElementById('guest-mode-footer');
  if (!user) {
    if (guestModeFooter) guestModeFooter.classList.add('hidden');
    return;
  }

  const headerUserBtn = document.getElementById('header-user-name');
  const headerAvatar = document.getElementById('header-user-avatar');
  const headerXp = document.getElementById('header-user-xp');
  const headerStreak = document.getElementById('header-user-streak');
  const headerLang = document.getElementById('header-active-lang');
  const isGuest = user.role && user.role.includes('Guest');

  if (guestModeFooter) guestModeFooter.classList.toggle('hidden', !isGuest);

  const displayName = user.role && user.role.includes('Guest') ? 'Login / Guest' : user.name;
  if (headerUserBtn) headerUserBtn.textContent = displayName;
  if (headerAvatar) headerAvatar.textContent = user.avatar || '👨‍🎓';
  if (headerXp) headerXp.textContent = `${user.totalXP || 0} XP`;
  if (headerStreak) headerStreak.textContent = `${isGuest ? 0 : (user.streak || 1)} 🔥`;
  if (headerLang) {
    const langObj = AVAILABLE_LANGUAGES.find(l => l.name.toLowerCase() === state.selectedLanguage.toLowerCase());
    headerLang.innerHTML = `<span class="mr-1">${langObj ? langObj.flag : '🌍'}</span> ${state.selectedLanguage}`;
  }
}

// ==================== LEARN DASHBOARD ====================
function renderLearnDashboard() {
  updateHeaderUserInfo();
  const user = window.db.getCurrentUser();
  const vocab = window.db.getVocabulary(state.selectedLanguage);

  document.getElementById('dash-lang-title').textContent = `${state.selectedLanguage} Mastery`;
  document.getElementById('dash-vocab-count').textContent = `${vocab.length} Words Available`;
  document.getElementById('dash-welcome-name').textContent = user ? user.name : 'Learner';
  renderDailyChallenge();
  renderAchievements();
}

// ==================== DATABASE CONSOLE / MANAGER (Professor's Core Requirement) ====================
function switchDatabaseTab(tableName) {
  AudioFX.playClick();
  state.activeDbTab = tableName;

  document.querySelectorAll('.db-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-table') === tableName) {
      btn.classList.add('border-indigo-600', 'text-indigo-600', 'font-bold');
      btn.classList.remove('border-transparent', 'text-slate-500');
    } else {
      btn.classList.remove('border-indigo-600', 'text-indigo-600', 'font-bold');
      btn.classList.add('border-transparent', 'text-slate-500');
    }
  });

  renderDatabaseTable();
}

function renderDatabaseTable() {
  const tableContainer = document.getElementById('db-table-content');
  const badgeCount = document.getElementById('db-records-count');
  if (!tableContainer) return;

  const query = state.dbSearchQuery.toLowerCase();

  if (state.activeDbTab === 'activity_logs') {
    let logs = window.db.getActivityLogs();
    if (query) {
      logs = logs.filter(l => 
        (l.actionType && l.actionType.toLowerCase().includes(query)) ||
        (l.userName && l.userName.toLowerCase().includes(query)) ||
        (l.language && l.language.toLowerCase().includes(query)) ||
        (l.details && l.details.toLowerCase().includes(query))
      );
    }
    if (badgeCount) badgeCount.textContent = `${logs.length} Activity Entries`;

    tableContainer.innerHTML = `
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider sticky top-0">
          <tr>
            <th class="p-3">Time</th>
            <th class="p-3">User</th>
            <th class="p-3">Action Type</th>
            <th class="p-3">Language</th>
            <th class="p-3">Details</th>
            <th class="p-3 text-center">Score</th>
            <th class="p-3 text-center">Accuracy</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${logs.length === 0 ? '<tr><td colspan="8" class="p-8 text-center text-slate-400">No activity logs found.</td></tr>' : ''}
          ${logs.map(log => `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
              <td class="p-3 font-medium text-slate-800">${log.userName || 'Guest'}</td>
              <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">${log.actionType}</span></td>
              <td class="p-3 font-semibold text-slate-700">${log.language}</td>
              <td class="p-3 text-slate-600 max-w-xs truncate" title="${log.details}">${log.details}</td>
              <td class="p-3 text-center font-bold text-emerald-600">+${log.score} XP</td>
              <td class="p-3 text-center font-medium">${log.accuracy}</td>
              <td class="p-3 text-right whitespace-nowrap">
                <button onclick="openEditModal('activity_logs', '${log.id}')" class="px-2 py-1 text-indigo-600 hover:text-indigo-800 font-semibold mr-1">Edit</button>
                <button onclick="deleteDatabaseRecord('activity_logs', '${log.id}')" class="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (state.activeDbTab === 'vocabulary') {
    let vocab = window.db.getVocabulary();
    if (state.dbLanguageFilter !== 'All') {
      vocab = vocab.filter(v => v.language.toLowerCase() === state.dbLanguageFilter.toLowerCase());
    }
    if (query) {
      vocab = vocab.filter(v => 
        (v.word && v.word.toLowerCase().includes(query)) ||
        (v.translation && v.translation.toLowerCase().includes(query)) ||
        (v.category && v.category.toLowerCase().includes(query))
      );
    }
    if (badgeCount) badgeCount.textContent = `${vocab.length} Words in Database`;

    tableContainer.innerHTML = `
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider sticky top-0">
          <tr>
            <th class="p-3">Language</th>
            <th class="p-3">Word</th>
            <th class="p-3">Translation</th>
            <th class="p-3">Phonetic</th>
            <th class="p-3">Category</th>
            <th class="p-3">Difficulty</th>
            <th class="p-3 text-center">Mastery</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${vocab.length === 0 ? '<tr><td colspan="8" class="p-8 text-center text-slate-400">No vocabulary found.</td></tr>' : ''}
          ${vocab.map(v => `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="p-3 font-semibold text-slate-700">${v.language}</td>
              <td class="p-3 font-bold text-slate-900">${v.word}</td>
              <td class="p-3 text-slate-700">${v.translation}</td>
              <td class="p-3 text-slate-500 font-mono text-[11px]">/${v.phonetic}/</td>
              <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">${v.category}</span></td>
              <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ${v.difficulty === 'Beginner' ? 'badge-beginner' : 'badge-intermediate'}">${v.difficulty}</span></td>
              <td class="p-3 text-center">
                <div class="inline-flex items-center gap-1.5">
                  <div class="w-12 bg-slate-200 rounded-full h-1.5">
                    <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${v.mastery || 0}%"></div>
                  </div>
                  <span class="font-bold text-[11px]">${v.mastery || 0}%</span>
                </div>
              </td>
              <td class="p-3 text-right whitespace-nowrap">
                <button onclick="openEditModal('vocabulary', '${v.id}')" class="px-2 py-1 text-indigo-600 hover:text-indigo-800 font-semibold mr-1">Edit</button>
                <button onclick="deleteDatabaseRecord('vocabulary', '${v.id}')" class="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (state.activeDbTab === 'users') {
    let users = window.db.getUsers();
    if (query) {
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.role && u.role.toLowerCase().includes(query))
      );
    }
    if (badgeCount) badgeCount.textContent = `${users.length} Registered Users`;

    tableContainer.innerHTML = `
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider sticky top-0">
          <tr>
            <th class="p-3">Avatar & Name</th>
            <th class="p-3">Email</th>
            <th class="p-3">Role</th>
            <th class="p-3">Focus Language</th>
            <th class="p-3 text-center">Streak</th>
            <th class="p-3 text-center">Total XP</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${users.map(u => `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="p-3 font-semibold text-slate-900 flex items-center gap-2">
                <span class="text-xl">${u.avatar || '👤'}</span>
                <span>${u.name}</span>
              </td>
              <td class="p-3 text-slate-600 font-mono text-[11px]">${u.email}</td>
              <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold ${u.role.includes('Guest') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">${u.role}</span></td>
              <td class="p-3 font-medium text-slate-700">${u.targetLanguage || 'Spanish'}</td>
              <td class="p-3 text-center font-bold">${u.streak || 1} 🔥</td>
              <td class="p-3 text-center font-bold text-indigo-600">${u.totalXP || 0} XP</td>
              <td class="p-3 text-right whitespace-nowrap">
                <button onclick="switchActiveUser('${u.id}')" class="px-2 py-1 text-emerald-600 hover:text-emerald-800 font-semibold mr-1">Switch To</button>
                <button onclick="openEditModal('users', '${u.id}')" class="px-2 py-1 text-indigo-600 hover:text-indigo-800 font-semibold mr-1">Edit</button>
                <button onclick="deleteDatabaseRecord('users', '${u.id}')" class="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

function handleDbSearch(e) {
  state.dbSearchQuery = e.target.value;
  renderDatabaseTable();
}

function handleDbLangFilter(e) {
  state.dbLanguageFilter = e.target.value;
  renderDatabaseTable();
}

function switchActiveUser(userId) {
  const users = window.db.getUsers();
  const target = users.find(u => u.id === userId);
  if (target) {
    window.db.setCurrentUser(target);
    state.selectedLanguage = target.targetLanguage || 'Spanish';
    updateHeaderUserInfo();
    renderDatabaseTable();
    showToast(`Switched active user to ${target.name}`);
  }
}

// ==================== DATABASE RECORD MODAL (EDIT & ADD) ====================
function openEditModal(table, recordId) {
  state.editingTable = table;
  let record = null;

  if (table === 'activity_logs') {
    record = window.db.getActivityLogs().find(r => r.id === recordId);
  } else if (table === 'vocabulary') {
    record = window.db.getVocabulary().find(r => r.id === recordId);
  } else if (table === 'users') {
    record = window.db.getUsers().find(r => r.id === recordId);
  }

  state.editingRecord = record;
  const modal = document.getElementById('db-edit-modal');
  const form = document.getElementById('db-edit-form');
  const modalTitle = document.getElementById('db-edit-modal-title');

  if (!modal || !form || !record) return;

  modalTitle.textContent = `Edit Record in ${table}`;
  form.innerHTML = Object.keys(record).map(key => {
    const isReadOnly = key === 'id' || key === 'timestamp';
    return `
      <div class="mb-3">
        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">${key}</label>
        <input 
          type="text" 
          name="${key}" 
          value="${record[key] !== undefined ? ('' + record[key]).replace(/"/g, '&quot;') : ''}" 
          ${isReadOnly ? 'readonly class="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-500 cursor-not-allowed"' : 'class="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:border-indigo-500"'}
        />
      </div>
    `;
  }).join('');

  modal.classList.remove('hidden');
}

function closeEditModal() {
  const modal = document.getElementById('db-edit-modal');
  if (modal) modal.classList.add('hidden');
  state.editingRecord = null;
  state.editingTable = null;
}

function saveEditModalRecord(e) {
  if (e) e.preventDefault();
  if (!state.editingRecord || !state.editingTable) return;

  const form = document.getElementById('db-edit-form');
  const formData = new FormData(form);
  const updatedData = {};

  formData.forEach((value, key) => {
    if (key !== 'id') {
      // Auto convert numeric fields
      if (!isNaN(value) && value.trim() !== '') {
        updatedData[key] = Number(value);
      } else {
        updatedData[key] = value;
      }
    }
  });

  if (state.editingTable === 'activity_logs') {
    window.db.updateActivityLog(state.editingRecord.id, updatedData);
  } else if (state.editingTable === 'vocabulary') {
    window.db.updateVocabularyItem(state.editingRecord.id, updatedData);
  } else if (state.editingTable === 'users') {
    window.db.updateUser(state.editingRecord.id, updatedData);
  }

  closeEditModal();
  renderDatabaseTable();
  AudioFX.playSuccess();
  showToast('✓ Database record updated successfully!');
}

function openAddWordModal() {
  const modal = document.getElementById('db-add-word-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddWordModal() {
  const modal = document.getElementById('db-add-word-modal');
  if (modal) modal.classList.add('hidden');
}

function handleAddWordSubmit(e) {
  if (e) e.preventDefault();
  const word = document.getElementById('add-word-input').value.trim();
  const translation = document.getElementById('add-translation-input').value.trim();
  const phonetic = document.getElementById('add-phonetic-input').value.trim();
  const language = document.getElementById('add-language-select').value;
  const category = document.getElementById('add-category-input').value.trim() || 'General';

  if (!word || !translation) {
    alert('Please provide both word and translation.');
    return;
  }

  window.db.addVocabularyItem({
    word,
    translation,
    phonetic,
    language,
    category,
    difficulty: 'Beginner',
    mastery: 50,
    reviews: 0
  });

  closeAddWordModal();
  renderDatabaseTable();
  AudioFX.playSuccess();
  showToast(`✓ Added "${word}" to ${language} vocabulary!`);
}

function deleteDatabaseRecord(table, id) {
  // HCI: Error Prevention & Confirmation (Heuristic #5)
  if (!confirm(`Are you sure you want to delete this record from "${table}"?`)) {
    return;
  }

  if (table === 'activity_logs') {
    window.db.deleteActivityLog(id);
  } else if (table === 'vocabulary') {
    window.db.deleteVocabularyItem(id);
  } else if (table === 'users') {
    window.db.deleteUser(id);
  }

  renderDatabaseTable();
  AudioFX.playClick();
  showToast('Record deleted from database.');
}

function resetAllDatabaseData() {
  if (confirm('Reset all database tables to initial seed data? This will restore sample users, vocabulary, and logs.')) {
    window.db.resetToDefaults();
    updateHeaderUserInfo();
    renderDatabaseTable();
    showToast('Database reset to initial seed values.');
  }
}

// ==================== HCI PRINCIPLES INSPECTOR MODAL ====================
const HCI_PRINCIPLES_BY_SCREEN = {
  'screen-learn': [
    { heuristic: 'H1: Visibility of System Status', desc: 'Real-time XP counter, daily streak flame, and target language badge always in view.' },
    { heuristic: 'H4: Consistency and Standards', desc: 'Familiar card metaphor, standard left-to-right progression layout, industry-standard color semantics.' },
    { heuristic: "Fitts's Law", desc: 'Primary CTAs ("Start Flashcards", "Quick Quiz") have oversized click targets positioned directly in the user primary visual scan path.' }
  ],
  'screen-flashcards': [
    { heuristic: 'H2: Match Between System & Physical World', desc: 'Realistic 3D index card flip animation replicates tactile physical study cards.' },
    { heuristic: 'H3: User Control & Freedom', desc: 'Learner can freely move backwards, forwards, flip at will, or exit session anytime.' },
    { heuristic: 'H7: Flexibility & Efficiency of Use', desc: 'Keyboard accelerator support: Spacebar flips card, keys 1, 2, 3 instantly rate confidence without touching mouse.' }
  ],
  'screen-quiz': [
    { heuristic: 'H1: Visibility of System Status', desc: 'Progress bar tracks completion; instant audio chime and emerald/ruby highlighting provide immediate feedback.' },
    { heuristic: "Hick's Law", desc: 'Choices are restricted to exactly 4 distinct options to minimize cognitive decision latency.' },
    { heuristic: 'H6: Recognition Over Recall', desc: 'Phonetic pronunciation guide and audio speaker affordance reduce memory strain.' }
  ],
  'screen-languages': [
    { heuristic: 'H6: Recognition Rather Than Recall', desc: 'Vibrant country flags and native scripts allow instant recognition without cognitive search.' },
    { heuristic: 'H5: Error Prevention', desc: 'Clear "Active Focus" pill prevents redundant re-selection; state changes persist across entire app.' }
  ],
  'screen-profile': [
    { heuristic: 'H3: User Control and Freedom', desc: 'Direct manipulation of learning goals and avatar with immediate database persistence.' },
    { heuristic: 'H10: Help and Documentation', desc: 'Clear field micro-copy explaining what daily goal increments mean.' }
  ],
  'screen-database': [
    { heuristic: 'Direct Manipulation (HCI Core)', desc: 'Tables allow live in-place viewing, searching, filtering, and single-click CSV/JSON export.' },
    { heuristic: 'H5: Error Prevention & Recovery', desc: 'Confirmation dialogs protect against accidental data deletion, modal provides clear Cancel escape hatch.' },
    { heuristic: 'Database Accessibility (Professor Requirement)', desc: 'Data is structured in clean relational tables with instant export for external verification.' }
  ]
};

function toggleHciInspector() {
  AudioFX.playClick();
  const modal = document.getElementById('hci-inspector-modal');
  if (modal) modal.classList.toggle('hidden');
}

function updateHciInspectorContent() {
  const container = document.getElementById('hci-inspector-content');
  const screenTitle = document.getElementById('hci-inspector-screen-name');
  if (!container) return;

  const currentPrinciples = HCI_PRINCIPLES_BY_SCREEN[state.currentScreen] || HCI_PRINCIPLES_BY_SCREEN['screen-learn'];
  if (screenTitle) screenTitle.textContent = `Screen: ${state.currentScreen.replace('screen-', '').toUpperCase()}`;

  container.innerHTML = currentPrinciples.map(p => `
    <div class="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
      <div class="font-bold text-xs text-indigo-900 mb-1 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
        <span>${p.heuristic}</span>
      </div>
      <p class="text-xs text-slate-700 leading-relaxed">${p.desc}</p>
    </div>
  `).join('');
}

// ==================== TOAST SYSTEM ====================
function showToast(message) {
  const toast = document.getElementById('db-toast');
  const toastMsg = document.getElementById('db-toast-msg');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    }, 2800);
  }
}

// ==================== KEYBOARD ACCELERATORS (HCI: Efficiency of Use) ====================
document.addEventListener('keydown', (e) => {
  // If user is typing in an input, do not trigger shortcuts
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  if (state.currentScreen === 'screen-flashcards') {
    if (e.code === 'Space') {
      e.preventDefault();
      flipCard();
    } else if (e.key === '1') {
      rateCardConfidence('hard');
    } else if (e.key === '2') {
      rateCardConfidence('medium');
    } else if (e.key === '3') {
      rateCardConfidence('easy');
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (e.key === 'ArrowLeft') {
      prevCard();
    }
  }
});

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Check active user
  const user = window.db.getCurrentUser();
  if (user && user.targetLanguage) {
    state.selectedLanguage = user.targetLanguage;
  }

  updateHeaderUserInfo();
  showScreen('screen-auth');

  // Subscribe to DB changes to automatically refresh view
  window.db.subscribe((type) => {
    if (state.currentScreen === 'screen-database') {
      renderDatabaseTable();
    }
    if (type === 'vocabulary' && state.currentScreen === 'screen-learn') {
      renderLearnDashboard();
    }
    updateHeaderUserInfo();
  });
});
