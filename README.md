# LinguaFlow HCI — Interactive Language Learning & Database Studio

An academically grounded, interactive language acquisition web application built specifically for **Human-Computer Interaction (HCI)** evaluation.

LinguaFlow addresses cognitive load, tactile digital interaction, multimodal feedback, and persistent activity tracking with an **in-browser, easily accessible, and fully editable database management console**.

---

## 🌟 Core Professor Requirements Fulfilled

### 1. Activity & Work Automatically Saved to Database
* **Real-Time Logging**: Every single user interaction—completing a quiz, flipping and rating a flashcard, updating user profile data, switching focus languages, or adding vocabulary—is automatically written to the database with:
  * Accurate ISO timestamps
  * User ID and Display Name
  * Action Type (e.g. `Flashcard Review`, `Quiz Completed`, `Profile Updated`)
  * Focus Language
  * Accuracy percentage, score (+XP), and time spent
* **Live System Feedback**: A subtle "DB Synced" indicator and toast alert confirm whenever a transaction is committed to storage.

### 2. Easily Accessible & Fully Editable Database (CRUD)
* **Dedicated Database Studio**: Prominently located in the top navigation bar.
* **3 Relational Tables**:
  1. **Activity Logs Table**: Complete audit trail of all student/user activities.
  2. **Vocabulary Bank Table**: Words, translations, phonetic guides, and mastery levels across all languages.
  3. **Users & Profiles Table**: Registered accounts and guest profiles with their stats and goals.
* **Full CRUD Operations**:
  * **Create**: Add new vocabulary words via the "+ Add Word" modal.
  * **Read**: Instant search bar and language filter across all tables.
  * **Update**: Click **"Edit"** on any record in any table to edit values in-place via an accessible modal.
  * **Delete**: Click **"Delete"** on any row with built-in confirmation error prevention.
* **One-Click Export**:
  * **📥 Export to CSV (Excel)**: Download individual tables directly into spreadsheet format.
  * **💾 Export Full DB (JSON)**: Download the entire database schema and state as JSON for submission.
  * **🔄 Reset Data**: One-click restore to initial seed data.

### 3. Dedicated Language Selection Hub
* **Major Indian Languages & English Supported**:
  * **English 🌐**: Global and Indian higher education communication medium.
  * **Kannada 🇮🇳 (ಕನ್ನಡ)**: Classical Dravidian language of Karnataka.
  * **Hindi 🇮🇳 (हिन्दी)**: Devanagari script, widely spoken across India.
  * **Tamil 🇮🇳 (தமிழ்)**: Classical Dravidian language with ancient Sangam literature.
  * **Telugu 🇮🇳 (తెలుగు)**: "Italian of the East", mellifluous language of Andhra & Telangana.
  * **Malayalam 🇮🇳 (മലയാളം)**: Rich literary language of Kerala.
  * **Marathi 🇮🇳 (मराठी)**: Historical language of Maharashtra.
  * **Bengali 🇮🇳 (বাংলা)**: Poetic language of Rabindranath Tagore.
  * **Gujarati 🇮🇳 (ગુજરાતી)**: Language of Mahatma Gandhi and vibrant folk culture.
  * **Punjabi 🇮🇳 (ਪੰਜਾਬੀ)**: Energetic Gurmukhi script language of Punjab.
  * **Odia 🇮🇳 (ଓଡ଼ିଆ)**: Classical language of Odisha with distinctive rounded script.
  * **Urdu 🇮🇳 (اردو)**: Lyrical Nastaliq script celebrated for ghazals and poetry.
  * **Sanskrit 🇮🇳 (संस्कृतम्)**: Sacred classical language of ancient India.
  * **Assamese 🇮🇳 (অসমীয়া)**: Eastern Indo-Aryan language along the Brahmaputra.
* **Plus International Languages**: Spanish 🇪🇸, French 🇫🇷, German 🇩🇪, Japanese 🇯🇵, Italian 🇮🇹.
* Independent vocabulary, exercises, speech pronunciation, and database activity tracking for every single language.
* Persistent language focus stored per user in the database.

### 4. Authentication, Guest Mode & Profile Editing
* **One-Click Guest Access**: Designed specifically for instructors and evaluators to test all features instantly without registration.
* **Custom Profile Management**: Choose illustrated avatars, set daily study goals (5m, 15m, 30m), and update biographical details directly into the database.

---

## 🏛️ HCI Principles & Design Components

### Nielsen’s 10 Usability Heuristics Applied:
1. **Visibility of System Status (#1)**: Live XP counter, daily streak flame, active language indicator, and real-time database sync pulses.
2. **Match Between System & Real World (#2)**: Realistic 3D card flip animation replicates tactile physical index study cards. Native speech pronunciation brings auditory realism.
3. **User Control & Freedom (#3)**: Unrestricted navigation between exercises, cancel/escape hatches on all edit modals, and ability to reset session state.
4. **Consistency & Standards (#4)**: Universal UI semantics (Emerald = success/positive, Rose = warning/delete, Indigo = primary action).
5. **Error Prevention (#5)**: Destructive database operations require explicit confirmation. Form validation on authentication and profile editing.
6. **Recognition Rather Than Recall (#6)**: Prominent visual flags, phonetic guides, and 4-option multiple-choice quizzes eliminate cognitive recall strain.
7. **Flexibility & Efficiency of Use (#7)**: Keyboard accelerators built-in (`Space` flips flashcard, `1`, `2`, `3` rate confidence).
8. **Aesthetic & Minimalist Design (#8)**: High contrast, uncluttered cards, progressive disclosure of complex settings.
9. **Help Users Recognize & Recover from Errors (#9)**: Clear visual feedback when a quiz answer is wrong, accompanied by the correct answer revelation.
10. **Help & Documentation (#10)**: Embedded **🎓 HCI Principles Inspector** modal available at any time to explain design rationales on the active screen.

### Cognitive Laws:
* **Fitts's Law**: Oversized touch/click targets for primary actions (confidence rating buttons, quiz options, flip triggers).
* **Hick's Law**: Quizzes and exercises limit decision choices to 4 distinct items to minimize decision latency.

---

## 🚀 How to Run the Application

This project is built with **zero external server setup or npm build step required**. It runs natively in any modern web browser:

1. Navigate to the project directory:
   ```
   c:\Users\Pavan Basavaraj\OneDrive\Documents\Hci
   ```
2. Double-click **`index.html`** to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
3. *Alternative (Live Server)*: Right click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 📁 File Architecture
* **`index.html`**: Semantic HTML5 interface, screen layouts, modal dialogs, and accessible navigation.
* **`styles.css`**: Design tokens, 3D card transformations, glassmorphism, and responsive styling.
* **`database.js`**: Relational database engine, CRUD operations, activity logger, and CSV/JSON export utilities.
* **`app.js`**: Multimodal audio synthesis, Web Speech API integration, quiz engine, profile sync, and HCI inspector logic.
* **`README.md`**: Project documentation and academic evaluation guide.
