/**
 * LinguaFlow HCI - Database Management Engine
 * Implements persistent storage, full CRUD operations, automated activity logging,
 * and data export (CSV/JSON) for academic demonstration.
 * Featuring English and major Indian Languages (Kannada, Hindi, Tamil, Telugu,
 * Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Urdu, Sanskrit, Assamese).
 */

const DB_KEYS = {
  USERS: 'lingua_hci_users',
  ACTIVITY_LOGS: 'lingua_hci_activity_logs',
  VOCABULARY: 'lingua_hci_vocabulary',
  CURRENT_USER: 'lingua_hci_current_user',
  SETTINGS: 'lingua_hci_settings',
  VERSION: 'lingua_hci_version_v2_india'
};

// Initial Seed Data for Languages and Vocabulary
const SEED_VOCABULARY = [
  // ==================== ENGLISH ====================
  { id: 'voc-en-1', language: 'English', word: 'Hello', translation: 'Friendly greeting', phonetic: 'heh-LOH', category: 'Greetings', difficulty: 'Beginner', mastery: 95, reviews: 20 },
  { id: 'voc-en-2', language: 'English', word: 'Thank you', translation: 'Expression of gratitude', phonetic: 'THANK yoo', category: 'Courtesy', difficulty: 'Beginner', mastery: 95, reviews: 20 },
  { id: 'voc-en-3', language: 'English', word: 'Please', translation: 'Polite request', phonetic: 'PLEEZ', category: 'Courtesy', difficulty: 'Beginner', mastery: 90, reviews: 16 },
  { id: 'voc-en-4', language: 'English', word: 'Good morning', translation: 'Early day salutation', phonetic: 'good MOR-ning', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 15 },
  { id: 'voc-en-5', language: 'English', word: 'How are you?', translation: 'Asking after someone’s health/state', phonetic: 'how ar yoo', category: 'Conversation', difficulty: 'Beginner', mastery: 85, reviews: 14 },
  { id: 'voc-en-6', language: 'English', word: 'Water', translation: 'Essential clear liquid beverage', phonetic: 'WAH-ter', category: 'Essentials', difficulty: 'Beginner', mastery: 95, reviews: 18 },

  // ==================== KANNADA (ಕನ್ನಡ) ====================
  { id: 'voc-kn-1', language: 'Kannada', word: 'ನಮಸ್ಕಾರ (Namaskara)', translation: 'Hello / Greetings', phonetic: 'nah-mas-KAH-rah', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 15 },
  { id: 'voc-kn-2', language: 'Kannada', word: 'ಧನ್ಯವಾದಗಳು (Dhanyavadagalu)', translation: 'Thank you very much', phonetic: 'dhun-yah-VAH-dah-gah-loo', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 12 },
  { id: 'voc-kn-3', language: 'Kannada', word: 'ದಯವಿಟ್ಟು (Dayavittu)', translation: 'Please', phonetic: 'dah-yah-VIT-too', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 10 },
  { id: 'voc-kn-4', language: 'Kannada', word: 'ಹೇಗಿದ್ದೀರಾ? (Hegiddira?)', translation: 'How are you? (respectful)', phonetic: 'hay-gid-DEE-rah', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-kn-5', language: 'Kannada', word: 'ಶುಭೋದಯ (Shubhodaya)', translation: 'Good morning', phonetic: 'shoo-BHO-dah-yah', category: 'Greetings', difficulty: 'Beginner', mastery: 70, reviews: 7 },
  { id: 'voc-kn-6', language: 'Kannada', word: 'ನೀರು (Neeru)', translation: 'Water', phonetic: 'NEE-roo', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-kn-7', language: 'Kannada', word: 'ಊಟ ಆಯ್ತಾ? (Oota aaytha?)', translation: 'Did you have food? (classic Kannada greeting)', phonetic: 'OO-tah AAI-thah', category: 'Conversation', difficulty: 'Intermediate', mastery: 85, reviews: 11 },
  { id: 'voc-kn-8', language: 'Kannada', word: 'ಹೌದು (Haudu)', translation: 'Yes', phonetic: 'HOW-doo', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-9', language: 'Kannada', word: 'ಇಲ್ಲ (Illa)', translation: 'No', phonetic: 'ILL-ah', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-10', language: 'Kannada', word: 'ಕ್ಷಮಿಸಿ (Kshamisi)', translation: 'Sorry / Excuse me', phonetic: 'ksha-MEE-see', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-11', language: 'Kannada', word: 'ಸರಿ (Sari)', translation: 'Okay / All right', phonetic: 'SAH-ree', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-12', language: 'Kannada', word: 'ಸಹಾಯ (Sahaaya)', translation: 'Help', phonetic: 'sah-HAH-yah', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== HINDI (हिन्दी) ====================
  { id: 'voc-hi-1', language: 'Hindi', word: 'नमस्ते (Namaste)', translation: 'Hello / Respectful Greeting', phonetic: 'nah-mas-TAY', category: 'Greetings', difficulty: 'Beginner', mastery: 95, reviews: 18 },
  { id: 'voc-hi-2', language: 'Hindi', word: 'धन्यवाद (Dhanyavaad)', translation: 'Thank you', phonetic: 'dhun-yah-VAHD', category: 'Courtesy', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-hi-3', language: 'Hindi', word: 'कृपया (Kripya)', translation: 'Please', phonetic: 'KRIP-yah', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 10 },
  { id: 'voc-hi-4', language: 'Hindi', word: 'आप कैसे हैं? (Aap kaise hain?)', translation: 'How are you? (formal)', phonetic: 'ahp KAY-say hain', category: 'Conversation', difficulty: 'Beginner', mastery: 85, reviews: 12 },
  { id: 'voc-hi-5', language: 'Hindi', word: 'शुभ प्रभात (Shubh Prabhaat)', translation: 'Good morning', phonetic: 'shoobh prah-BAHT', category: 'Greetings', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-hi-6', language: 'Hindi', word: 'पानी (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 15 },

  // ==================== TAMIL (தமிழ்) ====================
  { id: 'voc-ta-1', language: 'Tamil', word: 'வணக்கம் (Vanakkam)', translation: 'Hello / Greetings', phonetic: 'vah-nahk-KUM', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 15 },
  { id: 'voc-ta-2', language: 'Tamil', word: 'நன்றி (Nandri)', translation: 'Thank you', phonetic: 'NUN-dree', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 12 },
  { id: 'voc-ta-3', language: 'Tamil', word: 'தயவுசெய்து (Thayavu seidhu)', translation: 'Please', phonetic: 'thah-yah-voo SAY-dhoo', category: 'Courtesy', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-ta-4', language: 'Tamil', word: 'எப்படி இருக்கிறீர்கள்? (Eppadi irukkeergal?)', translation: 'How are you? (formal)', phonetic: 'ep-pah-dee ee-rooh-KEER-gahl', category: 'Conversation', difficulty: 'Intermediate', mastery: 70, reviews: 7 },
  { id: 'voc-ta-5', language: 'Tamil', word: 'காலை வணக்கம் (Kaalai Vanakkam)', translation: 'Good morning', phonetic: 'KAH-lai vah-nahk-KUM', category: 'Greetings', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-ta-6', language: 'Tamil', word: 'தண்ணீர் (Thanneer)', translation: 'Water', phonetic: 'thun-NEER', category: 'Essentials', difficulty: 'Beginner', mastery: 85, reviews: 11 },

  // ==================== TELUGU (తెలుగు) ====================
  { id: 'voc-te-1', language: 'Telugu', word: 'నమస్కారం (Namaskaram)', translation: 'Hello / Greetings', phonetic: 'nah-mas-KAH-rum', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-te-2', language: 'Telugu', word: 'ధన్యవాదాలు (Dhanyavadalu)', translation: 'Thank you', phonetic: 'dhun-yah-VAH-dah-loo', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 11 },
  { id: 'voc-te-3', language: 'Telugu', word: 'దయచేసి (Dayachesi)', translation: 'Please', phonetic: 'dah-yah-CHAY-see', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-te-4', language: 'Telugu', word: 'మీరు ఎలా ఉన్నారు? (Meeru ela unnaru?)', translation: 'How are you? (formal)', phonetic: 'MEE-roo ay-lah oon-NAH-roo', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-te-5', language: 'Telugu', word: 'శుభోదయం (Shubodayam)', translation: 'Good morning', phonetic: 'shoo-BHO-dah-yum', category: 'Greetings', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-te-6', language: 'Telugu', word: 'నీళ్ళు (Neellu)', translation: 'Water', phonetic: 'NEEL-loo', category: 'Essentials', difficulty: 'Beginner', mastery: 85, reviews: 12 },

  // ==================== MALAYALAM (മലയാളം) ====================
  { id: 'voc-ml-1', language: 'Malayalam', word: 'നമസ്കാരം (Namaskaram)', translation: 'Hello / Greetings', phonetic: 'nah-mas-KAH-rum', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 13 },
  { id: 'voc-ml-2', language: 'Malayalam', word: 'നന്ദി (Nandi)', translation: 'Thank you', phonetic: 'NUN-dee', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 11 },
  { id: 'voc-ml-3', language: 'Malayalam', word: 'ദയവായി (Dayavayi)', translation: 'Please', phonetic: 'dah-yah-VAH-yee', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 8 },
  { id: 'voc-ml-4', language: 'Malayalam', word: 'സുഖമാണോ? (Sukhamano?)', translation: 'Are you doing well / How are you?', phonetic: 'soo-khah-MAH-noh', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 7 },
  { id: 'voc-ml-5', language: 'Malayalam', word: 'വെള്ളം (Vellam)', translation: 'Water', phonetic: 'VEL-lum', category: 'Essentials', difficulty: 'Beginner', mastery: 85, reviews: 10 },

  // ==================== MARATHI (मराठी) ====================
  { id: 'voc-mr-1', language: 'Marathi', word: 'नमस्कार (Namaskar)', translation: 'Hello / Greetings', phonetic: 'nah-mas-KAHR', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-mr-2', language: 'Marathi', word: 'धन्यवाद (Dhanyavaad)', translation: 'Thank you', phonetic: 'dhun-yah-VAHD', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 12 },
  { id: 'voc-mr-3', language: 'Marathi', word: 'कृपया (Krupaya)', translation: 'Please', phonetic: 'kroo-PAH-yah', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-mr-4', language: 'Marathi', word: 'तुम्ही कसे आहात? (Tumhi kase aahat?)', translation: 'How are you? (formal)', phonetic: 'toom-HEE kah-SAY ah-HAHT', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 8 },
  { id: 'voc-mr-5', language: 'Marathi', word: 'पाणी (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 13 },

  // ==================== BENGALI (বাংলা) ====================
  { id: 'voc-bn-1', language: 'Bengali', word: 'নমস্কার (Nomoshkar)', translation: 'Hello / Greetings', phonetic: 'noh-mosh-KAHR', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-bn-2', language: 'Bengali', word: 'ধন্যবাদ (Dhonnobad)', translation: 'Thank you', phonetic: 'dhon-noh-BAHD', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 11 },
  { id: 'voc-bn-3', language: 'Bengali', word: 'দয়া করে (Doya kore)', translation: 'Please', phonetic: 'doh-yah KOH-ray', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 8 },
  { id: 'voc-bn-4', language: 'Bengali', word: 'আপনি কেমন আছেন? (Apni kemon achhen?)', translation: 'How are you? (formal)', phonetic: 'ahp-nee kay-mohn AH-chhen', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 7 },
  { id: 'voc-bn-5', language: 'Bengali', word: 'জল (Jol)', translation: 'Water', phonetic: 'JOHL', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 13 },

  // ==================== GUJARATI (ગુજરાતી) ====================
  { id: 'voc-gu-1', language: 'Gujarati', word: 'નમસ્તે (Namaste)', translation: 'Hello / Greetings', phonetic: 'nah-mas-TAY', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 13 },
  { id: 'voc-gu-2', language: 'Gujarati', word: 'આભાર (Aabhar)', translation: 'Thank you', phonetic: 'ah-BHAHR', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 10 },
  { id: 'voc-gu-3', language: 'Gujarati', word: 'કૃપા કરીને (Krupa karine)', translation: 'Please', phonetic: 'kroo-PAH kah-REE-nay', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 7 },
  { id: 'voc-gu-4', language: 'Gujarati', word: 'તમે કેમ છો? (Tame kem chho?)', translation: 'How are you?', phonetic: 'tah-MAY kem CHHOH', category: 'Conversation', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-gu-5', language: 'Gujarati', word: 'પાણી (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 12 },

  // ==================== PUNJABI (ਪੰਜਾਬੀ) ====================
  { id: 'voc-pa-1', language: 'Punjabi', word: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akaal)', translation: 'Hello / Respectful Greeting', phonetic: 'sat sree ah-KAHL', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 15 },
  { id: 'voc-pa-2', language: 'Punjabi', word: 'ਧੰਨਵਾਦ (Dhanvaad)', translation: 'Thank you', phonetic: 'dhun-VAHD', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 11 },
  { id: 'voc-pa-3', language: 'Punjabi', word: 'ਕਿਰਪਾ ਕਰਕੇ (Kirpa karke)', translation: 'Please', phonetic: 'KEER-pah kar-KAY', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 8 },
  { id: 'voc-pa-4', language: 'Punjabi', word: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ? (Tusi kiven ho?)', translation: 'How are you?', phonetic: 'too-SEE kee-VEN hoh', category: 'Conversation', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-pa-5', language: 'Punjabi', word: 'ਪਾਣੀ (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 12 },

  // ==================== ODIA (ଓଡ଼ିଆ) ====================
  { id: 'voc-or-1', language: 'Odia', word: 'ନମସ୍କାର (Namaskara)', translation: 'Hello / Greetings', phonetic: 'nah-mas-KAH-rah', category: 'Greetings', difficulty: 'Beginner', mastery: 85, reviews: 10 },
  { id: 'voc-or-2', language: 'Odia', word: 'ଧନ୍ୟବାଦ (Dhanyabada)', translation: 'Thank you', phonetic: 'dhun-yah-BAH-dah', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 9 },
  { id: 'voc-or-3', language: 'Odia', word: 'ଦୟାକରି (Dayakari)', translation: 'Please', phonetic: 'dah-yah-KAH-ree', category: 'Courtesy', difficulty: 'Beginner', mastery: 75, reviews: 6 },
  { id: 'voc-or-4', language: 'Odia', word: 'ଆପଣ କେମିତି ଅଛନ୍ତି? (Apana kemiti achhanti?)', translation: 'How are you? (formal)', phonetic: 'ah-pah-nah kay-MEE-tee ah-CHHUN-tee', category: 'Conversation', difficulty: 'Beginner', mastery: 70, reviews: 5 },
  { id: 'voc-or-5', language: 'Odia', word: 'ପାଣି (Pani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 85, reviews: 10 },

  // ==================== URDU (اردو) ====================
  { id: 'voc-ur-1', language: 'Urdu', word: 'آداب / السلام علیکم (Adaab / Assalam Alaikum)', translation: 'Greetings / Peace be upon you', phonetic: 'ah-DAHB / as-sah-lahm ah-LAY-koom', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-ur-2', language: 'Urdu', word: 'شکریہ (Shukriya)', translation: 'Thank you', phonetic: 'shook-REE-yah', category: 'Courtesy', difficulty: 'Beginner', mastery: 90, reviews: 13 },
  { id: 'voc-ur-3', language: 'Urdu', word: 'براہ کرم (Barahe karam)', translation: 'Please', phonetic: 'bah-RAH-ay kah-RUM', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 8 },
  { id: 'voc-ur-4', language: 'Urdu', word: 'آپ کیسے ہیں؟ (Aap kaise hain?)', translation: 'How are you? (formal)', phonetic: 'ahp KAY-say hain', category: 'Conversation', difficulty: 'Beginner', mastery: 85, reviews: 11 },
  { id: 'voc-ur-5', language: 'Urdu', word: 'پانی (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 14 },

  // ==================== SANSKRIT (संस्कृतम्) ====================
  { id: 'voc-sa-1', language: 'Sanskrit', word: 'नमो नमः (Namo Namah)', translation: 'Salutations / Hello', phonetic: 'NAH-moh NAH-mah-ha', category: 'Greetings', difficulty: 'Beginner', mastery: 85, reviews: 10 },
  { id: 'voc-sa-2', language: 'Sanskrit', word: 'धन्यवादः (Dhanyavaadah)', translation: 'Thank you', phonetic: 'dhun-yah-VAH-dah-ha', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 9 },
  { id: 'voc-sa-3', language: 'Sanskrit', word: 'कृपया (Kripaya)', translation: 'Please', phonetic: 'kri-PAH-yah', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 7 },
  { id: 'voc-sa-4', language: 'Sanskrit', word: 'भवान् कथमस्ति? (Bhavan katham asti?)', translation: 'How are you? (to a male)', phonetic: 'bhah-VAHN kah-thum US-tee', category: 'Conversation', difficulty: 'Intermediate', mastery: 70, reviews: 6 },
  { id: 'voc-sa-5', language: 'Sanskrit', word: 'जलम् (Jalam)', translation: 'Water', phonetic: 'JAH-lum', category: 'Essentials', difficulty: 'Beginner', mastery: 90, reviews: 12 },

  // ==================== ASSAMESE (অসমীয়া) ====================
  { id: 'voc-as-1', language: 'Assamese', word: 'নমস্কাৰ (Nomoskar)', translation: 'Hello / Greetings', phonetic: 'noh-mosh-KAHR', category: 'Greetings', difficulty: 'Beginner', mastery: 85, reviews: 9 },
  { id: 'voc-as-2', language: 'Assamese', word: 'ধন্যবাদ (Dhonyobad)', translation: 'Thank you', phonetic: 'dhon-yoh-BAHD', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 8 },
  { id: 'voc-as-3', language: 'Assamese', word: 'অনুগ্ৰহ কৰি (Anugroh kori)', translation: 'Please', phonetic: 'ah-noo-GROH koh-ree', category: 'Courtesy', difficulty: 'Beginner', mastery: 75, reviews: 6 },
  { id: 'voc-as-4', language: 'Assamese', word: 'আপুনি কেনে আছে? (Apuni kene ase?)', translation: 'How are you? (formal)', phonetic: 'ah-poo-nee KAY-nay AH-say', category: 'Conversation', difficulty: 'Beginner', mastery: 75, reviews: 6 },
  { id: 'voc-as-5', language: 'Assamese', word: 'পানী (Paani)', translation: 'Water', phonetic: 'PAH-nee', category: 'Essentials', difficulty: 'Beginner', mastery: 85, reviews: 10 },

  // ==================== INTERNATIONAL (Spanish, French, German, Japanese, Italian) ====================
  { id: 'voc-es-1', language: 'Spanish', word: 'Hola', translation: 'Hello', phonetic: 'OH-lah', category: 'Greetings', difficulty: 'Beginner', mastery: 85, reviews: 12 },
  { id: 'voc-es-2', language: 'Spanish', word: 'Gracias', translation: 'Thank you', phonetic: 'GRAH-syahs', category: 'Courtesy', difficulty: 'Beginner', mastery: 90, reviews: 15 },
  { id: 'voc-es-3', language: 'Spanish', word: 'Por favor', translation: 'Please', phonetic: 'por fah-VOR', category: 'Courtesy', difficulty: 'Beginner', mastery: 70, reviews: 8 },
  { id: 'voc-es-4', language: 'Spanish', word: 'El agua', translation: 'Water', phonetic: 'el AH-gwah', category: 'Essentials', difficulty: 'Beginner', mastery: 80, reviews: 10 },

  { id: 'voc-fr-1', language: 'French', word: 'Bonjour', translation: 'Hello / Good morning', phonetic: 'bohn-ZHOOR', category: 'Greetings', difficulty: 'Beginner', mastery: 90, reviews: 14 },
  { id: 'voc-fr-2', language: 'French', word: 'Merci beaucoup', translation: 'Thank you very much', phonetic: 'mair-SEE boh-KOO', category: 'Courtesy', difficulty: 'Beginner', mastery: 75, reviews: 9 },
  { id: 'voc-fr-3', language: 'French', word: 'Le café', translation: 'Coffee', phonetic: 'luh kah-FAY', category: 'Food & Drink', difficulty: 'Beginner', mastery: 85, reviews: 11 },

  { id: 'voc-de-1', language: 'German', word: 'Guten Tag', translation: 'Good day / Hello', phonetic: 'GOO-ten TAHK', category: 'Greetings', difficulty: 'Beginner', mastery: 80, reviews: 10 },
  { id: 'voc-de-2', language: 'German', word: 'Danke schön', translation: 'Thank you very much', phonetic: 'DAHN-kuh shurn', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 11 },

  { id: 'voc-ja-1', language: 'Japanese', word: 'こんにちは (Konnichiwa)', translation: 'Hello / Good afternoon', phonetic: 'kohn-nee-chee-wah', category: 'Greetings', difficulty: 'Beginner', mastery: 75, reviews: 9 },
  { id: 'voc-ja-2', language: 'Japanese', word: 'ありがとう (Arigatou)', translation: 'Thank you', phonetic: 'ah-ree-gah-toh', category: 'Courtesy', difficulty: 'Beginner', mastery: 85, reviews: 12 },

  { id: 'voc-it-1', language: 'Italian', word: 'Ciao', translation: 'Hi / Bye', phonetic: 'CHOW', category: 'Greetings', difficulty: 'Beginner', mastery: 95, reviews: 18 },
  { id: 'voc-it-2', language: 'Italian', word: 'Grazie mille', translation: 'Thanks a million', phonetic: 'GRAHT-tsyeh MEEL-lay', category: 'Courtesy', difficulty: 'Beginner', mastery: 80, reviews: 10 }
];

// Additional high-frequency beginner vocabulary for every supported language
const ADDITIONAL_CORE_VOCABULARY = [
  // ==================== ENGLISH ====================
  { id: 'voc-en-core-1', language: 'English', word: 'Goodbye', translation: 'Farewell', phonetic: 'good-BYE', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-core-2', language: 'English', word: 'Yes', translation: 'Affirmative answer', phonetic: 'YES', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-core-3', language: 'English', word: 'No', translation: 'Negative answer', phonetic: 'NOH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-core-4', language: 'English', word: 'Sorry', translation: 'Apology', phonetic: 'SOR-ee', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-core-5', language: 'English', word: 'Help', translation: 'Assistance', phonetic: 'HELP', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== KANNADA ====================
  { id: 'voc-kn-core-1', language: 'Kannada', word: 'ವಿದಾಯ (Vidaya)', translation: 'Goodbye', phonetic: 'vid-AH-yah', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-core-2', language: 'Kannada', word: 'ಆಹಾರ (Aahaara)', translation: 'Food', phonetic: 'AAH-hah-rah', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-core-3', language: 'Kannada', word: 'ಮನೆ (Mane)', translation: 'House / Home', phonetic: 'MAH-nay', category: 'Everyday Life', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-core-4', language: 'Kannada', word: 'ಇಂದು (Indu)', translation: 'Today', phonetic: 'IN-doo', category: 'Time', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-core-5', language: 'Kannada', word: 'ನಾಳೆ (Naale)', translation: 'Tomorrow', phonetic: 'NAA-lay', category: 'Time', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== HINDI ====================
  { id: 'voc-hi-core-1', language: 'Hindi', word: 'अलविदा (Alvida)', translation: 'Goodbye', phonetic: 'al-vee-DAH', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-core-2', language: 'Hindi', word: 'हाँ (Haan)', translation: 'Yes', phonetic: 'HAAN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-core-3', language: 'Hindi', word: 'नहीं (Nahin)', translation: 'No', phonetic: 'NAH-heen', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-core-4', language: 'Hindi', word: 'माफ़ कीजिए (Maaf kijiye)', translation: 'Excuse me / Sorry', phonetic: 'maaf kee-JEE-yay', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-core-5', language: 'Hindi', word: 'मदद (Madad)', translation: 'Help', phonetic: 'MAH-dad', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== TAMIL ====================
  { id: 'voc-ta-core-1', language: 'Tamil', word: 'பிரியாவிடை (Priyaavidai)', translation: 'Goodbye', phonetic: 'pree-yah-VI-dai', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-core-2', language: 'Tamil', word: 'ஆம் (Aam)', translation: 'Yes', phonetic: 'AAM', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-core-3', language: 'Tamil', word: 'இல்லை (Illai)', translation: 'No', phonetic: 'ILL-ai', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-core-4', language: 'Tamil', word: 'மன்னிக்கவும் (Mannikkavum)', translation: 'Sorry / Excuse me', phonetic: 'mun-nik-KAH-vum', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-core-5', language: 'Tamil', word: 'உதவி (Udhavi)', translation: 'Help', phonetic: 'oo-thah-VEE', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== TELUGU ====================
  { id: 'voc-te-core-1', language: 'Telugu', word: 'వీడ్కోలు (Veedkolu)', translation: 'Goodbye', phonetic: 'VEED-koh-loo', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-core-2', language: 'Telugu', word: 'అవును (Avunu)', translation: 'Yes', phonetic: 'ah-VOO-noo', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-core-3', language: 'Telugu', word: 'కాదు (Kaadu)', translation: 'No', phonetic: 'KAA-doo', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-core-4', language: 'Telugu', word: 'క్షమించండి (Kshaminchandi)', translation: 'Sorry / Excuse me', phonetic: 'ksha-MIN-chan-dee', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-core-5', language: 'Telugu', word: 'సహాయం (Sahaayam)', translation: 'Help', phonetic: 'sah-HAH-yum', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== MALAYALAM ====================
  { id: 'voc-ml-core-1', language: 'Malayalam', word: 'വിട (Vita)', translation: 'Goodbye', phonetic: 'VEE-dah', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-core-2', language: 'Malayalam', word: 'അതെ (Athe)', translation: 'Yes', phonetic: 'AH-thay', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-core-3', language: 'Malayalam', word: 'ഇല്ല (Illa)', translation: 'No', phonetic: 'ILL-ah', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-core-4', language: 'Malayalam', word: 'ക്ഷമിക്കണം (Kshamikkanam)', translation: 'Sorry / Excuse me', phonetic: 'ksha-mik-KAH-num', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-core-5', language: 'Malayalam', word: 'സഹായം (Sahaayam)', translation: 'Help', phonetic: 'sah-HAH-yum', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== MARATHI ====================
  { id: 'voc-mr-core-1', language: 'Marathi', word: 'निरोप (Niroop)', translation: 'Goodbye', phonetic: 'nee-ROHP', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-core-2', language: 'Marathi', word: 'हो (Ho)', translation: 'Yes', phonetic: 'HOH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-core-3', language: 'Marathi', word: 'नाही (Nahi)', translation: 'No', phonetic: 'NAH-hee', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-core-4', language: 'Marathi', word: 'माफ करा (Maaf kara)', translation: 'Sorry / Excuse me', phonetic: 'maaf KAH-rah', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-core-5', language: 'Marathi', word: 'मदत (Madat)', translation: 'Help', phonetic: 'MAH-dut', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== BENGALI ====================
  { id: 'voc-bn-core-1', language: 'Bengali', word: 'বিদায় (Biday)', translation: 'Goodbye', phonetic: 'bee-DAI', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-core-2', language: 'Bengali', word: 'হ্যাঁ (Hyan)', translation: 'Yes', phonetic: 'HYAN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-core-3', language: 'Bengali', word: 'না (Na)', translation: 'No', phonetic: 'NAH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-core-4', language: 'Bengali', word: 'দুঃখিত (Dukhito)', translation: 'Sorry', phonetic: 'DOO-khee-toh', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-core-5', language: 'Bengali', word: 'সাহায্য (Sahajjo)', translation: 'Help', phonetic: 'SHAH-joh', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== GUJARATI ====================
  { id: 'voc-gu-core-1', language: 'Gujarati', word: 'આવજો (Aavjo)', translation: 'Goodbye', phonetic: 'AAV-joh', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-core-2', language: 'Gujarati', word: 'હા (Haa)', translation: 'Yes', phonetic: 'HAA', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-core-3', language: 'Gujarati', word: 'ના (Naa)', translation: 'No', phonetic: 'NAA', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-core-4', language: 'Gujarati', word: 'માફ કરશો (Maaf karsho)', translation: 'Sorry / Excuse me', phonetic: 'maaf KAR-shoh', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-core-5', language: 'Gujarati', word: 'મદદ (Madad)', translation: 'Help', phonetic: 'MAH-dud', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== PUNJABI ====================
  { id: 'voc-pa-core-1', language: 'Punjabi', word: 'ਅਲਵਿਦਾ (Alvida)', translation: 'Goodbye', phonetic: 'al-vee-DAH', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-core-2', language: 'Punjabi', word: 'ਹਾਂ (Haan)', translation: 'Yes', phonetic: 'HAAN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-core-3', language: 'Punjabi', word: 'ਨਹੀਂ (Nahin)', translation: 'No', phonetic: 'NAH-een', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-core-4', language: 'Punjabi', word: 'ਮਾਫ਼ ਕਰਨਾ (Maaf karna)', translation: 'Sorry / Excuse me', phonetic: 'maaf KAR-nah', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-core-5', language: 'Punjabi', word: 'ਮਦਦ (Madad)', translation: 'Help', phonetic: 'MAH-dud', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== ODIA ====================
  { id: 'voc-or-core-1', language: 'Odia', word: 'ବିଦାୟ (Bidaya)', translation: 'Goodbye', phonetic: 'bee-DAH-yah', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-core-2', language: 'Odia', word: 'ହଁ (Han)', translation: 'Yes', phonetic: 'HUN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-core-3', language: 'Odia', word: 'ନା (Na)', translation: 'No', phonetic: 'NAH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-core-4', language: 'Odia', word: 'କ୍ଷମା କରନ୍ତୁ (Kshama karantu)', translation: 'Sorry / Excuse me', phonetic: 'ksha-MAH kah-RUN-too', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-core-5', language: 'Odia', word: 'ସାହାଯ୍ୟ (Sahayya)', translation: 'Help', phonetic: 'sah-HAI-yah', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== URDU ====================
  { id: 'voc-ur-core-1', language: 'Urdu', word: 'خدا حافظ (Khuda Hafiz)', translation: 'Goodbye', phonetic: 'KHU-dah HAA-fiz', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-core-2', language: 'Urdu', word: 'ہاں (Haan)', translation: 'Yes', phonetic: 'HAAN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-core-3', language: 'Urdu', word: 'نہیں (Nahin)', translation: 'No', phonetic: 'NAH-een', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-core-4', language: 'Urdu', word: 'معاف کیجیے (Maaf kijiye)', translation: 'Sorry / Excuse me', phonetic: 'maaf kee-JEE-yay', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-core-5', language: 'Urdu', word: 'مدد (Madad)', translation: 'Help', phonetic: 'MAH-dud', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== SANSKRIT ====================
  { id: 'voc-sa-core-1', language: 'Sanskrit', word: 'पुनर्दर्शनाय (Punardarshanaya)', translation: 'Goodbye / Until we meet again', phonetic: 'poon-ar-DAR-shah-nah-yah', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-core-2', language: 'Sanskrit', word: 'आम् (Aam)', translation: 'Yes', phonetic: 'AAM', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-core-3', language: 'Sanskrit', word: 'न (Na)', translation: 'No / Not', phonetic: 'NAH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-core-4', language: 'Sanskrit', word: 'क्षम्यताम् (Kshamyataam)', translation: 'Sorry / Forgive me', phonetic: 'ksham-yah-TAAM', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-core-5', language: 'Sanskrit', word: 'साहाय्यम् (Saahaayyam)', translation: 'Help', phonetic: 'sah-HAHY-yum', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== ASSAMESE ====================
  { id: 'voc-as-core-1', language: 'Assamese', word: 'বিদায় (Biday)', translation: 'Goodbye', phonetic: 'bee-DAI', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-core-2', language: 'Assamese', word: 'হয় (Hoy)', translation: 'Yes', phonetic: 'HOY', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-core-3', language: 'Assamese', word: 'নহয় (Nohoy)', translation: 'No', phonetic: 'noh-HOY', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-core-4', language: 'Assamese', word: 'ক্ষমা কৰিব (Kshama korib)', translation: 'Sorry / Excuse me', phonetic: 'KSHOH-mah koh-RIB', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-core-5', language: 'Assamese', word: 'সহায় (Xohay)', translation: 'Help', phonetic: 'SOH-hai', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== SPANISH ====================
  { id: 'voc-es-core-1', language: 'Spanish', word: 'Adiós', translation: 'Goodbye', phonetic: 'ah-dee-OHS', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-core-2', language: 'Spanish', word: 'Sí', translation: 'Yes', phonetic: 'SEE', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-core-3', language: 'Spanish', word: 'No', translation: 'No', phonetic: 'NOH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-core-4', language: 'Spanish', word: 'Perdón', translation: 'Sorry / Excuse me', phonetic: 'per-DOHN', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-core-5', language: 'Spanish', word: 'Ayuda', translation: 'Help', phonetic: 'ah-YOO-dah', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== FRENCH ====================
  { id: 'voc-fr-core-1', language: 'French', word: 'Au revoir', translation: 'Goodbye', phonetic: 'oh ruh-VWAHR', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-core-2', language: 'French', word: 'Oui', translation: 'Yes', phonetic: 'WEE', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-core-3', language: 'French', word: 'Non', translation: 'No', phonetic: 'NOHN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-core-4', language: 'French', word: 'Pardon', translation: 'Sorry / Excuse me', phonetic: 'par-DOHN', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-core-5', language: 'French', word: 'Aide', translation: 'Help', phonetic: 'ED', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== GERMAN ====================
  { id: 'voc-de-core-1', language: 'German', word: 'Auf Wiedersehen', translation: 'Goodbye', phonetic: 'owf VEE-der-zayn', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-core-2', language: 'German', word: 'Ja', translation: 'Yes', phonetic: 'YAH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-core-3', language: 'German', word: 'Nein', translation: 'No', phonetic: 'NINE', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-core-4', language: 'German', word: 'Entschuldigung', translation: 'Sorry / Excuse me', phonetic: 'ent-SHOOL-dee-goong', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-core-5', language: 'German', word: 'Hilfe', translation: 'Help', phonetic: 'HIL-fuh', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== JAPANESE ====================
  { id: 'voc-ja-core-1', language: 'Japanese', word: 'さようなら (Sayounara)', translation: 'Goodbye', phonetic: 'sah-yoh-NAH-rah', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-core-2', language: 'Japanese', word: 'はい (Hai)', translation: 'Yes', phonetic: 'HAI', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-core-3', language: 'Japanese', word: 'いいえ (Iie)', translation: 'No', phonetic: 'EE-eh', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-core-4', language: 'Japanese', word: 'すみません (Sumimasen)', translation: 'Sorry / Excuse me', phonetic: 'soo-mee-mah-SEN', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-core-5', language: 'Japanese', word: '助け (Tasuke)', translation: 'Help', phonetic: 'tah-SKEH', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 },

  // ==================== ITALIAN ====================
  { id: 'voc-it-core-1', language: 'Italian', word: 'Arrivederci', translation: 'Goodbye', phonetic: 'ah-ree-veh-DER-chee', category: 'Greetings', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-core-2', language: 'Italian', word: 'Sì', translation: 'Yes', phonetic: 'SEE', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-core-3', language: 'Italian', word: 'No', translation: 'No', phonetic: 'NOH', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-core-4', language: 'Italian', word: 'Scusa', translation: 'Sorry / Excuse me', phonetic: 'SKOO-zah', category: 'Courtesy', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-core-5', language: 'Italian', word: 'Aiuto', translation: 'Help', phonetic: 'ah-YOO-toh', category: 'Essentials', difficulty: 'Beginner', mastery: 0, reviews: 0 }
];

// Practical everyday vocabulary for continued beginner practice
const ADDITIONAL_PRACTICE_VOCABULARY = [
  { id: 'voc-en-practice-1', language: 'English', word: 'Friend', translation: 'A person you like and trust', phonetic: 'FREND', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-2', language: 'English', word: 'Where is the station?', translation: 'Question about a station location', phonetic: 'where iz the STAY-shun', category: 'Travel', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-3', language: 'English', word: 'I understand', translation: 'I know the meaning', phonetic: 'ai un-der-STAND', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-4', language: 'English', word: 'Family', translation: 'A group of related people', phonetic: 'FAM-uh-lee', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-5', language: 'English', word: 'Mother', translation: 'Female parent', phonetic: 'MUH-ther', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-6', language: 'English', word: 'Father', translation: 'Male parent', phonetic: 'FAH-ther', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-7', language: 'English', word: 'Breakfast', translation: 'The first meal of the day', phonetic: 'BREK-fust', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-8', language: 'English', word: 'Dinner', translation: 'The evening meal', phonetic: 'DIN-er', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-9', language: 'English', word: 'Restaurant', translation: 'A place where meals are served', phonetic: 'RES-tuh-rahnt', category: 'Travel', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-10', language: 'English', word: 'Ticket', translation: 'A pass for travel or entry', phonetic: 'TIK-it', category: 'Travel', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-11', language: 'English', word: 'Left', translation: 'Direction opposite to right', phonetic: 'LEFT', category: 'Directions', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-12', language: 'English', word: 'Right', translation: 'Direction opposite to left', phonetic: 'RYTE', category: 'Directions', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-13', language: 'English', word: 'Hospital', translation: 'A place for medical care', phonetic: 'HOS-pi-tul', category: 'Health', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-14', language: 'English', word: 'Doctor', translation: 'A person trained to treat illness', phonetic: 'DOK-ter', category: 'Health', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-15', language: 'English', word: 'Teacher', translation: 'A person who helps others learn', phonetic: 'TEE-cher', category: 'Education', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-16', language: 'English', word: 'Question', translation: 'Something asked to get information', phonetic: 'KWES-chun', category: 'Education', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-17', language: 'English', word: 'Happy', translation: 'Feeling pleasure or joy', phonetic: 'HAP-ee', category: 'Emotions', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-18', language: 'English', word: 'Hungry', translation: 'Needing or wanting food', phonetic: 'HUN-gree', category: 'Emotions', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-19', language: 'English', word: 'Today', translation: 'This day', phonetic: 'tuh-DAY', category: 'Time', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-en-practice-20', language: 'English', word: 'Tomorrow', translation: 'The day after today', phonetic: 'tuh-MOR-oh', category: 'Time', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-practice-1', language: 'Kannada', word: 'ಸ್ನೇಹಿತ (Snehita)', translation: 'Friend', phonetic: 'snay-hi-tah', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-practice-2', language: 'Kannada', word: 'ಊಟ (Oota)', translation: 'Food / Meal', phonetic: 'OO-tah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-kn-practice-3', language: 'Kannada', word: 'ನನಗೆ ಅರ್ಥವಾಯಿತು (Nanage arthavaayitu)', translation: 'I understand', phonetic: 'nah-nah-gay ar-thah-VAH-yee-too', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-practice-1', language: 'Hindi', word: 'दोस्त (Dost)', translation: 'Friend', phonetic: 'DOST', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-practice-2', language: 'Hindi', word: 'खाना (Khaana)', translation: 'Food / Meal', phonetic: 'KHAH-nah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-hi-practice-3', language: 'Hindi', word: 'मुझे समझ आया (Mujhe samajh aaya)', translation: 'I understand', phonetic: 'moo-jhay sah-majh AH-yah', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-practice-1', language: 'Tamil', word: 'நண்பர் (Nanbar)', translation: 'Friend', phonetic: 'NUN-bar', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-practice-2', language: 'Tamil', word: 'சாப்பாடு (Saappaadu)', translation: 'Food / Meal', phonetic: 'SAHP-pah-doo', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ta-practice-3', language: 'Tamil', word: 'எனக்கு புரிகிறது (Enakku purigirathu)', translation: 'I understand', phonetic: 'eh-nahk-koo poo-ree-gee-rah-too', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-practice-1', language: 'Telugu', word: 'స్నేహితుడు (Snehitudu)', translation: 'Friend', phonetic: 'snay-hee-too-doo', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-practice-2', language: 'Telugu', word: 'భోజనం (Bhojanam)', translation: 'Food / Meal', phonetic: 'bhoh-jah-num', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-te-practice-3', language: 'Telugu', word: 'నాకు అర్థమైంది (Naaku arthamaindi)', translation: 'I understand', phonetic: 'nah-koo ar-thah-MAI-n dee', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-practice-1', language: 'Malayalam', word: 'സുഹൃത്ത് (Suhruth)', translation: 'Friend', phonetic: 'soo-HRITH', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-practice-2', language: 'Malayalam', word: 'ഭക്ഷണം (Bhakshanam)', translation: 'Food / Meal', phonetic: 'bhak-shah-num', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ml-practice-3', language: 'Malayalam', word: 'എനിക്ക് മനസ്സിലായി (Enikku manassilaayi)', translation: 'I understand', phonetic: 'eh-nee-koo mah-nah-see-LAI', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-practice-1', language: 'Marathi', word: 'मित्र (Mitra)', translation: 'Friend', phonetic: 'MIT-rah', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-practice-2', language: 'Marathi', word: 'जेवण (Jevan)', translation: 'Food / Meal', phonetic: 'JAY-vun', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-mr-practice-3', language: 'Marathi', word: 'मला समजले (Mala samajale)', translation: 'I understand', phonetic: 'mah-lah sah-mah-JAH-lay', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-practice-1', language: 'Bengali', word: 'বন্ধু (Bondhu)', translation: 'Friend', phonetic: 'BON-dhoo', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-practice-2', language: 'Bengali', word: 'খাবার (Khabar)', translation: 'Food / Meal', phonetic: 'KHAH-bar', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-bn-practice-3', language: 'Bengali', word: 'আমি বুঝতে পেরেছি (Ami bujhte perechi)', translation: 'I understand', phonetic: 'AH-mee boojh-tay pay-ray-chee', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-practice-1', language: 'Gujarati', word: 'મિત્ર (Mitra)', translation: 'Friend', phonetic: 'MIT-rah', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-practice-2', language: 'Gujarati', word: 'ખોરાક (Khoraak)', translation: 'Food / Meal', phonetic: 'khoh-RAHK', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-gu-practice-3', language: 'Gujarati', word: 'મને સમજાયું (Mane samajayu)', translation: 'I understand', phonetic: 'mah-nay sah-mah-JAH-yoo', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-practice-1', language: 'Punjabi', word: 'ਦੋਸਤ (Dost)', translation: 'Friend', phonetic: 'DOST', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-practice-2', language: 'Punjabi', word: 'ਖਾਣਾ (Khaana)', translation: 'Food / Meal', phonetic: 'KHAH-nah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-pa-practice-3', language: 'Punjabi', word: 'ਮੈਨੂੰ ਸਮਝ ਆ ਗਈ (Mainu samajh aa gayi)', translation: 'I understand', phonetic: 'mai-noo sah-majh ah GAI', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-practice-1', language: 'Odia', word: 'ସାଙ୍ଗ (Sanga)', translation: 'Friend', phonetic: 'SAHNG-ah', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-practice-2', language: 'Odia', word: 'ଖାଦ୍ୟ (Khadya)', translation: 'Food / Meal', phonetic: 'KHAHD-yah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-or-practice-3', language: 'Odia', word: 'ମୁଁ ବୁଝିଲି (Mun bujhili)', translation: 'I understand', phonetic: 'moon boo-JHEE-lee', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-practice-1', language: 'Urdu', word: 'دوست (Dost)', translation: 'Friend', phonetic: 'DOST', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-practice-2', language: 'Urdu', word: 'کھانا (Khaana)', translation: 'Food / Meal', phonetic: 'KHAH-nah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ur-practice-3', language: 'Urdu', word: 'مجھے سمجھ آگئی (Mujhe samajh aa gayi)', translation: 'I understand', phonetic: 'moo-jhay sah-majh ah GAI', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-practice-1', language: 'Sanskrit', word: 'मित्रम् (Mitram)', translation: 'Friend', phonetic: 'MIT-ram', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-practice-2', language: 'Sanskrit', word: 'भोजनम् (Bhojanam)', translation: 'Food / Meal', phonetic: 'bhoh-jah-num', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-sa-practice-3', language: 'Sanskrit', word: 'अहं अवगच्छामि (Aham avagacchami)', translation: 'I understand', phonetic: 'ah-hum ah-vah-gach-CHAH-mee', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-practice-1', language: 'Assamese', word: 'বন্ধু (Bondhu)', translation: 'Friend', phonetic: 'BON-dhoo', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-practice-2', language: 'Assamese', word: 'খাদ্য (Khadya)', translation: 'Food / Meal', phonetic: 'KHAHD-yah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-as-practice-3', language: 'Assamese', word: 'মই বুজিলোঁ (Moi bujilu)', translation: 'I understand', phonetic: 'moy boo-jee-LOHN', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-practice-1', language: 'Spanish', word: 'Amigo', translation: 'Friend', phonetic: 'ah-MEE-goh', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-practice-2', language: 'Spanish', word: 'Comida', translation: 'Food / Meal', phonetic: 'koh-MEE-dah', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-es-practice-3', language: 'Spanish', word: 'Entiendo', translation: 'I understand', phonetic: 'en-tee-EN-doh', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-practice-1', language: 'French', word: 'Ami', translation: 'Friend', phonetic: 'ah-MEE', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-practice-2', language: 'French', word: 'Nourriture', translation: 'Food', phonetic: 'noo-ree-TOOR', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-fr-practice-3', language: 'French', word: 'Je comprends', translation: 'I understand', phonetic: 'zhuh kohm-PRON', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-practice-1', language: 'German', word: 'Freund', translation: 'Friend', phonetic: 'FROYNT', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-practice-2', language: 'German', word: 'Essen', translation: 'Food / Meal', phonetic: 'ESS-en', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-de-practice-3', language: 'German', word: 'Ich verstehe', translation: 'I understand', phonetic: 'ikh fer-SHTAY-uh', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-practice-1', language: 'Japanese', word: '友達 (Tomodachi)', translation: 'Friend', phonetic: 'toh-moh-DAH-chee', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-practice-2', language: 'Japanese', word: '食べ物 (Tabemono)', translation: 'Food', phonetic: 'tah-bay-MOH-noh', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-ja-practice-3', language: 'Japanese', word: 'わかります (Wakarimasu)', translation: 'I understand', phonetic: 'wah-kah-ree-MAHS', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-practice-1', language: 'Italian', word: 'Amico', translation: 'Friend', phonetic: 'ah-MEE-koh', category: 'People', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-practice-2', language: 'Italian', word: 'Cibo', translation: 'Food', phonetic: 'CHEE-boh', category: 'Food & Drink', difficulty: 'Beginner', mastery: 0, reviews: 0 },
  { id: 'voc-it-practice-3', language: 'Italian', word: 'Capisco', translation: 'I understand', phonetic: 'kah-PEE-skoh', category: 'Conversation', difficulty: 'Beginner', mastery: 0, reviews: 0 }
];

const GOOGLE_VOCABULARY_TERMS = [
  ['Good evening', 'Greetings'], ['Good night', 'Greetings'], ['Excuse me', 'Courtesy'],
  ['Welcome', 'Greetings'], ['See you later', 'Greetings'], ['Maybe', 'Conversation'],
  ['Today', 'Time'], ['Tomorrow', 'Time'], ['Yesterday', 'Time'], ['Morning', 'Time'],
  ['Night', 'Time'], ['Friend', 'People'], ['Family', 'People'], ['Mother', 'People'],
  ['Father', 'People'], ['Child', 'People'], ['Book', 'Education'], ['School', 'Education'],
  ['Work', 'Everyday Life'], ['Food', 'Essentials'], ['Coffee', 'Food & Drink'],
  ['Tea', 'Food & Drink'], ['Bread', 'Food & Drink'], ['Rice', 'Food & Drink'],
  ['House', 'Everyday Life'], ['Street', 'Everyday Life'], ['Money', 'Everyday Life'],
  ['Time', 'Time'], ['Where', 'Conversation'], ['Why', 'Conversation'],
  ['How', 'Conversation'], ['Who', 'Conversation'], ['What', 'Conversation'], ['When', 'Conversation'],
  ['How much?', 'Shopping'], ['I need help', 'Essentials'], ['I do not understand', 'Conversation'],
  ['Please speak slowly', 'Conversation'], ['What is your name?', 'Conversation'], ['My name is', 'Conversation'],
  ['Nice to meet you', 'Greetings'], ['See you tomorrow', 'Greetings'], ['Of course', 'Conversation'],
  ['Maybe later', 'Conversation'], ['Now', 'Time'], ['Later', 'Time'], ['Early', 'Time'], ['Late', 'Time'],
  ['Monday', 'Days'], ['Tuesday', 'Days'], ['Wednesday', 'Days'], ['Thursday', 'Days'], ['Friday', 'Days'],
  ['Saturday', 'Days'], ['Sunday', 'Days'], ['Week', 'Time'], ['Month', 'Time'], ['Year', 'Time'],
  ['One', 'Numbers'], ['Two', 'Numbers'], ['Three', 'Numbers'], ['Four', 'Numbers'], ['Five', 'Numbers'],
  ['Ten', 'Numbers'], ['Hundred', 'Numbers'], ['First', 'Numbers'], ['Last', 'Numbers'], ['More', 'Conversation'],
  ['Less', 'Conversation'], ['Big', 'Descriptions'], ['Small', 'Descriptions'], ['Good', 'Descriptions'],
  ['Bad', 'Descriptions'], ['New', 'Descriptions'], ['Old', 'Descriptions'], ['Hot', 'Descriptions'],
  ['Cold', 'Descriptions'], ['Fast', 'Descriptions'], ['Slow', 'Descriptions'], ['Easy', 'Descriptions'],
  ['Difficult', 'Descriptions'], ['Happy', 'Emotions'], ['Sad', 'Emotions'], ['Tired', 'Emotions'],
  ['Hungry', 'Emotions'], ['Thirsty', 'Emotions'], ['Afraid', 'Emotions'], ['Ready', 'Conversation'],
  ['Water', 'Food & Drink'], ['Milk', 'Food & Drink'], ['Fruit', 'Food & Drink'], ['Vegetable', 'Food & Drink'],
  ['Chicken', 'Food & Drink'], ['Egg', 'Food & Drink'], ['Salt', 'Food & Drink'], ['Sugar', 'Food & Drink'],
  ['Breakfast', 'Food & Drink'], ['Lunch', 'Food & Drink'], ['Dinner', 'Food & Drink'], ['Restaurant', 'Travel'],
  ['Hotel', 'Travel'], ['Airport', 'Travel'], ['Bus', 'Travel'], ['Train', 'Travel'], ['Ticket', 'Travel'],
  ['Map', 'Travel'], ['Left', 'Directions'], ['Right', 'Directions'], ['Straight', 'Directions'],
  ['Near', 'Directions'], ['Far', 'Directions'], ['Here', 'Directions'], ['There', 'Directions'],
  ['Hospital', 'Health'], ['Doctor', 'Health'], ['Medicine', 'Health'], ['Headache', 'Health'],
  ['School', 'Education'], ['Teacher', 'Education'], ['Student', 'Education'], ['Question', 'Education'],
  ['Answer', 'Education'], ['Computer', 'Technology'], ['Phone', 'Technology'], ['Message', 'Technology'],
  ['Meeting', 'Work'], ['Office', 'Work'], ['Job', 'Work'], ['Open', 'Everyday Life'], ['Closed', 'Everyday Life'],
  ['Clean', 'Everyday Life'], ['Wait', 'Conversation'], ['Come', 'Conversation'], ['Go', 'Conversation'],
  ['Stop', 'Conversation'], ['Start', 'Conversation'], ['Look', 'Conversation'], ['Listen', 'Conversation'],
  ['Read', 'Education'], ['Write', 'Education'], ['Learn', 'Education'], ['Practice', 'Education']
];

const GOOGLE_LANGUAGE_CODES = {
  English: 'en', Kannada: 'kn', Hindi: 'hi', Tamil: 'ta', Telugu: 'te',
  Malayalam: 'ml', Marathi: 'mr', Bengali: 'bn', Gujarati: 'gu', Punjabi: 'pa',
  Odia: 'or', Urdu: 'ur', Sanskrit: 'sa', Assamese: 'as', Spanish: 'es',
  French: 'fr', German: 'de', Japanese: 'ja', Italian: 'it'
};

// Initial Seed Users
const SEED_USERS = [
  {
    id: 'user-guest-001',
    name: 'Guest Evaluator',
    email: 'guest@hci-eval.edu',
    role: 'Guest / Evaluator',
    avatar: '👨‍🎓',
    targetLanguage: 'Kannada',
    dailyGoal: 15,
    level: 'Beginner',
    streak: 4,
    totalXP: 420,
    wordsMastered: 18,
    joinedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    bio: 'Evaluating HCI principles, multimodal learning, and database accessibility across Indian languages.'
  },
  {
    id: 'user-demo-002',
    name: 'Pavan Basavaraj',
    email: 'pavan.b@univ.edu',
    role: 'Student Learner',
    avatar: '👩‍💻',
    targetLanguage: 'Hindi',
    dailyGoal: 20,
    level: 'Intermediate',
    streak: 12,
    totalXP: 1280,
    wordsMastered: 45,
    joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    bio: 'Exploring Indian linguistics and interactive HCI acquisition models.'
  }
];

// Initial Seed Activity Logs
const SEED_ACTIVITY_LOGS = [
  {
    id: 'act-101',
    userId: 'user-guest-001',
    userName: 'Guest Evaluator',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    actionType: 'Flashcard Review',
    language: 'Kannada',
    details: 'Practiced "ನಮಸ್ಕಾರ (Namaskara)" - Rated Easy',
    score: 10,
    accuracy: '100%',
    timeSpentSec: 8
  },
  {
    id: 'act-102',
    userId: 'user-guest-001',
    userName: 'Guest Evaluator',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actionType: 'Quiz Completed',
    language: 'Kannada',
    details: 'Module: Kannada Greetings & Essentials (Score: 4/4)',
    score: 100,
    accuracy: '100%',
    timeSpentSec: 45
  },
  {
    id: 'act-103',
    userId: 'user-demo-002',
    userName: 'Pavan Basavaraj',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actionType: 'Flashcard Review',
    language: 'Hindi',
    details: 'Practiced "नमस्ते (Namaste)" - Rated Easy',
    score: 10,
    accuracy: '100%',
    timeSpentSec: 6
  }
];

class DatabaseManager {
  constructor() {
    this.listeners = [];
    this.sessionUser = null;
    this.sessionVocabulary = null;
    this.sessionActivityLogs = null;
    this.initDatabase();
  }

  firebaseReady() {
    return Boolean(window.firebaseAuth && window.firebaseFirestore);
  }

  async saveFirebaseUser(firebaseUser, userData = {}) {
    const user = {
      id: firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || 'Student Learner',
      email: firebaseUser.email || userData.email || '',
      role: 'Student Learner',
      avatar: userData.avatar || '👩‍💻',
      targetLanguage: userData.targetLanguage || 'Kannada',
      dailyGoal: Number(userData.dailyGoal) || 15,
      level: userData.level || 'Beginner',
      streak: Number(userData.streak) || 0,
      totalXP: Number(userData.totalXP) || 0,
      wordsMastered: Number(userData.wordsMastered) || 0,
      phoneNumber: firebaseUser.phoneNumber || userData.phoneNumber || '',
      authProvider: userData.authProvider || (firebaseUser.phoneNumber ? 'Firebase Phone OTP' : 'Firebase Email & Password'),
      joinedAt: userData.joinedAt || new Date().toISOString(),
      bio: userData.bio || 'Enthusiastic language learner.'
    };

    this.sessionUser = user;
    const users = this.getUsers();
    const existingIndex = users.findIndex(existingUser => existingUser.id === user.id);
    if (existingIndex === -1) {
      users.push(user);
    } else {
      users[existingIndex] = { ...users[existingIndex], ...user };
    }
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    window.firebaseFirestore.collection('users').doc(user.id).set(user, { merge: true })
      .catch(() => this.notifyChange('firebaseSyncError', user));
    return user;
  }

  async registerFirebaseUser(name, email, password, targetLanguage = 'Kannada') {
    if (!this.firebaseReady()) return { success: false, message: 'Firebase is not available. Start the app with Live Server.' };

    try {
      const result = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      const user = await this.saveFirebaseUser(result.user, { name, targetLanguage });
      this.logActivity('User Registered', targetLanguage, `Account created for ${user.name}`, 15, '100%', 10);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.code === 'auth/email-already-in-use'
        ? 'This email already has an account. Please sign in.'
        : error.message };
    }
  }

  async authenticateFirebaseUser(email, password) {
    if (!this.firebaseReady()) return { success: false, message: 'Firebase is not available. Start the app with Live Server.' };

    try {
      const result = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      const snapshot = await window.firebaseFirestore.collection('users').doc(result.user.uid).get();
      const user = snapshot.exists
        ? snapshot.data()
        : await this.saveFirebaseUser(result.user);
      this.sessionUser = user;
      const users = this.getUsers();
      const existingIndex = users.findIndex(existingUser => existingUser.id === user.id);
      if (existingIndex === -1) {
        users.push(user);
      } else {
        users[existingIndex] = { ...users[existingIndex], ...user };
      }
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logActivity('User Login', user.targetLanguage, `User ${user.name} logged in successfully`, 10, '100%', 5);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.code === 'auth/user-not-found'
        ? 'No Firebase account found for this email.'
        : error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
          ? 'Incorrect password. Please verify and try again.'
          : error.message };
    }
  }

  initDatabase() {
    const hasV2 = localStorage.getItem(DB_KEYS.VERSION) === 'true';

    if (!hasV2) {
      // Auto-migrate or refresh with rich Indian languages & English
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(SEED_VOCABULARY));
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
      localStorage.setItem(DB_KEYS.VERSION, 'true');
    }

    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.VOCABULARY)) {
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(SEED_VOCABULARY));
    }
    if (!localStorage.getItem(DB_KEYS.ACTIVITY_LOGS)) {
      localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
    }
    const storedUser = this.readStoredCurrentUser();
    if (this.isGuestUser(storedUser)) {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }

    this.ensureSeedVocabulary();
    this.ensureGoogleVocabulary();
  }

  isGuestUser(user) {
    return Boolean(user && (user.role === 'Guest / Evaluator' || user.authProvider === 'Guest Access'));
  }

  isGuestSession() {
    return this.isGuestUser(this.sessionUser);
  }

  readStoredCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  }

  ensureSeedVocabulary() {
    const vocabulary = this.getVocabulary();
    const existingIds = new Set(vocabulary.map(item => item.id));
    const seedVocabulary = [...SEED_VOCABULARY, ...ADDITIONAL_CORE_VOCABULARY, ...ADDITIONAL_PRACTICE_VOCABULARY];
    const missingItems = seedVocabulary.filter(item => !existingIds.has(item.id));

    if (missingItems.length > 0) {
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify([...vocabulary, ...missingItems]));
    }
  }

  async ensureGoogleVocabulary() {
    const vocabulary = this.getVocabulary();
    const existingIds = new Set(vocabulary.map(item => item.id));
    const missingTerms = [];

    Object.entries(GOOGLE_LANGUAGE_CODES).forEach(([language, languageCode]) => {
      GOOGLE_VOCABULARY_TERMS.forEach(([term, category], index) => {
        const id = `voc-${languageCode}-google-${index + 1}`;
        if (!existingIds.has(id)) {
          missingTerms.push({ id, language, languageCode, term, category });
        }
      });
    });

    if (missingTerms.length === 0) return;

    const translatedItems = [];
    for (const language of Object.keys(GOOGLE_LANGUAGE_CODES)) {
      const languageTerms = missingTerms.filter(item => item.language === language);
      const languageResults = await Promise.all(languageTerms.map(async item => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${item.languageCode}&dt=t&q=${encodeURIComponent(item.term)}`;
          const response = await fetch(url);
          const data = await response.json();
          const translatedWord = data?.[0]?.[0]?.[0];

          if (!translatedWord) return null;

          return {
            id: item.id,
            language: item.language,
            word: translatedWord,
            translation: item.term,
            phonetic: '',
            category: item.category,
            difficulty: 'Beginner',
            mastery: 0,
            reviews: 0
          };
        } catch {
          return null;
        }
      }));

      translatedItems.push(...languageResults.filter(Boolean));
    }

    if (translatedItems.length > 0) {
      const latestVocabulary = this.getVocabulary();
      const mergedVocabulary = [...latestVocabulary, ...translatedItems];
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(mergedVocabulary));
      if (this.isGuestSession()) {
        this.sessionVocabulary = mergedVocabulary.map(item => ({ ...item }));
      }
      this.notifyChange('vocabulary', translatedItems);
    }
  }

  // ==================== USERS & AUTH ====================
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    } catch {
      return SEED_USERS;
    }
  }

  getCurrentUser() {
    if (this.sessionUser) return this.sessionUser;

    try {
      const user = JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
      return this.isGuestUser(user) ? null : user;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      this.sessionUser = null;
      this.sessionVocabulary = null;
      this.sessionActivityLogs = null;
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
      this.notifyChange('currentUser', null);
      return null;
    }

    if (this.isGuestUser(user)) {
      const persistentVocabulary = this.getPersistentVocabulary();
      const persistentActivityLogs = this.getPersistentActivityLogs();
      this.sessionUser = { ...user, name: 'Guest' };
      this.sessionVocabulary = persistentVocabulary.map(item => ({ ...item }));
      this.sessionActivityLogs = persistentActivityLogs.map(log => ({ ...log }));
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
      this.notifyChange('currentUser', this.sessionUser);
      return this.sessionUser;
    }

    this.sessionUser = null;
    this.sessionVocabulary = null;
    this.sessionActivityLogs = null;
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    this.updateUser(user.id, user);
    this.notifyChange('currentUser', user);
  }

  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'user-' + Date.now(),
      name: userData.name || 'New Learner',
      email: (userData.email || `learner_${Date.now()}@hci.edu`).toLowerCase().trim(),
      password: userData.password || 'password123', // Store typed password
      role: userData.role || 'Student Learner',
      avatar: userData.avatar || '🌟',
      targetLanguage: userData.targetLanguage || 'Kannada',
      dailyGoal: Number(userData.dailyGoal) || 15,
      level: userData.level || 'Beginner',
      streak: 1,
      totalXP: 0,
      wordsMastered: 0,
      authProvider: userData.authProvider || 'Email',
      joinedAt: new Date().toISOString(),
      bio: userData.bio || 'Passionate language explorer!'
    };
    users.unshift(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.logActivity('User Registered', newUser.targetLanguage, `Account created for ${newUser.name} (${newUser.email})`, 15, '100%', 10);
    this.notifyChange('users', users);
    return newUser;
  }

  // Real Email/Password Registration
  registerUser(name, email, password, targetLanguage = 'Kannada') {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { 
        success: false, 
        message: `An account with ${cleanEmail} already exists. Please switch to Sign In.` 
      };
    }

    const newUser = this.addUser({
      name: name.trim(),
      email: cleanEmail,
      password: password, // Real typed password
      role: 'Student Learner',
      avatar: '👩‍💻',
      authProvider: 'Email & Password',
      targetLanguage: targetLanguage,
      bio: 'Enthusiastic language learner.'
    });

    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  // Real Email/Password Authentication (Strict credential check)
  authenticateUser(email, password) {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { 
        success: false, 
        message: `No account found for "${cleanEmail}". Use the same browser and app URL used during registration, or choose Create Account to register again.` 
      };
    }

    // Check password
    if (!user.password || user.password !== password) {
      return { 
        success: false, 
        message: 'Incorrect password. Please verify and try again.' 
      };
    }

    // Successful login
    this.setCurrentUser(user);
    this.logActivity('User Login', user.targetLanguage, `User ${user.name} logged in successfully`, 10, '100%', 5);
    return { success: true, user: user };
  }

  loginWithOAuth(provider, email, name, avatar) {
    let users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = this.addUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: 'oauth_authenticated',
        avatar: avatar || (provider === 'Google' ? '🌐' : '📱'),
        role: 'Student Learner',
        authProvider: provider,
        targetLanguage: 'Kannada',
        bio: `Verified user authenticated via ${provider}.`
      });
    } else {
      user = this.updateUser(user.id, {
        authProvider: provider,
        avatar: avatar || user.avatar || '🌐'
      });
      this.logActivity('OAuth Sign-in', user.targetLanguage, `Signed in via ${provider} as ${user.email}`, 10, '100%', 5);
    }

    this.setCurrentUser(user);
    return user;
  }

  updateUser(id, updatedFields) {
    if (this.isGuestSession() && this.sessionUser && this.sessionUser.id === id) {
      this.sessionUser = { ...this.sessionUser, ...updatedFields };
      this.notifyChange('currentUser', this.sessionUser);
      return this.sessionUser;
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      
      const cur = this.getCurrentUser();
      if (cur && cur.id === id) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(users[index]));
      }
      this.notifyChange('users', users);
      return users[index];
    }
    return null;
  }

  deleteUser(id) {
    if (this.isGuestSession()) return false;

    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.notifyChange('users', users);
    return true;
  }

  // ==================== ACTIVITY LOGGING (Professor's Core Requirement) ====================
  getActivityLogs() {
    if (this.isGuestSession()) return this.sessionActivityLogs || [];

    return this.getPersistentActivityLogs();
  }

  getPersistentActivityLogs() {

    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.ACTIVITY_LOGS)) || [];
    } catch {
      return [];
    }
  }

  logActivity(actionType, language, details, score = 10, accuracy = '100%', timeSpentSec = 5) {
    const curUser = this.getCurrentUser();
    const guestSession = this.isGuestSession();
    const logs = this.getActivityLogs();

    const newLog = {
      id: 'act-' + Date.now(),
      userId: curUser ? curUser.id : 'anonymous',
      userName: curUser ? curUser.name : 'Guest Evaluator',
      timestamp: new Date().toISOString(),
      actionType,
      language: language || (curUser ? curUser.targetLanguage : 'Kannada'),
      details,
      score: Number(score) || 0,
      accuracy: typeof accuracy === 'number' ? `${accuracy}%` : accuracy,
      timeSpentSec: Number(timeSpentSec) || 1
    };

    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    if (guestSession) {
      this.sessionActivityLogs = logs;
    } else {
      localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    }

    if (curUser) {
      const updatedXP = (curUser.totalXP || 0) + (Number(score) || 0);
      this.updateUser(curUser.id, { totalXP: updatedXP });
    }

    this.notifyChange('activityLogs', logs);
    this.triggerSyncIndicator(actionType, details);
    return newLog;
  }

  updateActivityLog(id, updatedFields) {
    if (this.isGuestSession()) {
      const index = this.sessionActivityLogs.findIndex(log => log.id === id);
      if (index !== -1) {
        this.sessionActivityLogs[index] = { ...this.sessionActivityLogs[index], ...updatedFields };
        this.notifyChange('activityLogs', this.sessionActivityLogs);
        return this.sessionActivityLogs[index];
      }
      return null;
    }

    const logs = this.getActivityLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updatedFields };
      localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
      this.notifyChange('activityLogs', logs);
      return logs[index];
    }
    return null;
  }

  deleteActivityLog(id) {
    if (this.isGuestSession()) {
      this.sessionActivityLogs = this.sessionActivityLogs.filter(log => log.id !== id);
      this.notifyChange('activityLogs', this.sessionActivityLogs);
      return true;
    }

    let logs = this.getActivityLogs();
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    this.notifyChange('activityLogs', logs);
    return true;
  }

  clearActivityLogs() {
    if (this.isGuestSession()) {
      this.sessionActivityLogs = [];
      this.notifyChange('activityLogs', []);
      return;
    }

    localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
    this.notifyChange('activityLogs', []);
  }

  // ==================== VOCABULARY CRUD ====================
  getVocabulary(languageFilter = null) {
    try {
      const vocab = this.isGuestSession()
        ? (this.sessionVocabulary || [])
        : this.getPersistentVocabulary();
      if (languageFilter && languageFilter !== 'All') {
        return vocab.filter(v => v.language.toLowerCase() === languageFilter.toLowerCase());
      }
      return vocab;
    } catch {
      return [];
    }
  }

  getPersistentVocabulary() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.VOCABULARY)) || [];
    } catch {
      return [];
    }
  }

  addVocabularyItem(item) {
    const vocab = this.getVocabulary();
    const newItem = {
      id: 'voc-' + Date.now(),
      language: item.language || 'Kannada',
      word: item.word || '',
      translation: item.translation || '',
      phonetic: item.phonetic || '',
      category: item.category || 'General',
      difficulty: item.difficulty || 'Beginner',
      mastery: Number(item.mastery) || 0,
      reviews: Number(item.reviews) || 0
    };
    vocab.unshift(newItem);
    if (this.isGuestSession()) {
      this.sessionVocabulary = vocab;
    } else {
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(vocab));
    }
    this.logActivity('Vocabulary Added', newItem.language, `Added word: "${newItem.word}" (${newItem.translation})`, 5, '100%', 4);
    this.notifyChange('vocabulary', vocab);
    return newItem;
  }

  updateVocabularyItem(id, updatedFields) {
    const vocab = this.getVocabulary();
    const index = vocab.findIndex(v => v.id === id);
    if (index !== -1) {
      vocab[index] = { ...vocab[index], ...updatedFields };
      if (this.isGuestSession()) {
        this.sessionVocabulary = vocab;
      } else {
        localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(vocab));
      }
      this.notifyChange('vocabulary', vocab);
      return vocab[index];
    }
    return null;
  }

  deleteVocabularyItem(id) {
    let vocab = this.getVocabulary();
    vocab = vocab.filter(v => v.id !== id);
    if (this.isGuestSession()) {
      this.sessionVocabulary = vocab;
    } else {
      localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(vocab));
    }
    this.notifyChange('vocabulary', vocab);
    return true;
  }

  // ==================== RESET & EXPORT TOOLS ====================
  resetToDefaults() {
    if (this.isGuestSession()) {
      this.sessionVocabulary = [...SEED_VOCABULARY, ...ADDITIONAL_CORE_VOCABULARY];
      this.sessionActivityLogs = SEED_ACTIVITY_LOGS.map(log => ({ ...log }));
      this.notifyChange('reset', true);
      return true;
    }

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(DB_KEYS.VOCABULARY, JSON.stringify(SEED_VOCABULARY));
    localStorage.setItem(DB_KEYS.ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    localStorage.setItem(DB_KEYS.VERSION, 'true');
    this.notifyChange('reset', true);
    return true;
  }

  exportTableToCSV(tableName) {
    let data = [];
    let filename = `${tableName}_export_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tableName === 'activity_logs') data = this.getActivityLogs();
    else if (tableName === 'vocabulary') data = this.getVocabulary();
    else if (tableName === 'users') data = this.getUsers();

    if (data.length === 0) {
      alert('No data available in this table to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] !== undefined ? row[header] : '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportAllToJSON() {
    const fullDb = {
      exportedAt: new Date().toISOString(),
      project: 'LinguaFlow HCI Showcase Application',
      architecture: 'Persistent Browser Database (LocalStorage & Real-time CRUD)',
      users: this.getUsers(),
      vocabulary: this.getVocabulary(),
      activityLogs: this.getActivityLogs()
    };
    const jsonStr = JSON.stringify(fullDb, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguaflow_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==================== VISUAL SYNC INDICATOR & SUBSCRIPTIONS ====================
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyChange(type, data) {
    this.listeners.forEach(cb => {
      try { cb(type, data); } catch (e) { console.error('Listener err:', e); }
    });
  }

  triggerSyncIndicator(actionType, details) {
    const indicator = document.getElementById('db-sync-pulse');
    const toast = document.getElementById('db-toast');
    const toastMsg = document.getElementById('db-toast-msg');

    if (indicator) {
      indicator.classList.remove('opacity-0');
      indicator.classList.add('opacity-100', 'animate-pulse');
      setTimeout(() => {
        indicator.classList.remove('opacity-100', 'animate-pulse');
        indicator.classList.add('opacity-0');
      }, 1600);
    }

    if (toast && toastMsg) {
      toastMsg.textContent = `${actionType}: ${details || 'Saved to Database'}`;
      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      }, 2600);
    }
  }
}

// Global Database Instance
window.db = new DatabaseManager();
