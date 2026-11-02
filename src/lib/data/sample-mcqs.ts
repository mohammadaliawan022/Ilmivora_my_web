import type { Mcq } from "../mcq";

/**
 * TEMPORARY preview questions shown only until the real MCQ database is
 * connected. Replace usage in mcq-repo.ts with live queries in Phase 2.
 */
type Row = [
  subject: string,
  exam: string,
  question: string,
  a: string,
  b: string,
  c: string,
  d: string,
  correct: "A" | "B" | "C" | "D",
  explanation: string,
];

const ROWS: Row[] = [
  ["General Knowledge", "PPSC", "Which is the highest mountain peak in Pakistan?", "Nanga Parbat", "K2", "Tirich Mir", "Broad Peak", "B", "K2 (8,611 m) in the Karakoram range, Gilgit-Baltistan, is the highest peak in Pakistan and the second highest in the world."],
  ["General Knowledge", "FPSC", "Which is the largest ocean in the world?", "Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean", "C", "The Pacific Ocean covers roughly one-third of the Earth's surface."],
  ["General Knowledge", "NTS", "What is the currency of Japan?", "Yuan", "Won", "Ringgit", "Yen", "D", "The Japanese Yen (¥) is the official currency of Japan."],
  ["General Knowledge", "PPSC", "The headquarters of the United Nations is located in:", "New York", "Geneva", "Paris", "Vienna", "A", "The UN headquarters is in Manhattan, New York City, USA."],
  ["General Knowledge", "Other", "Which planet is known as the Red Planet?", "Venus", "Mars", "Jupiter", "Mercury", "B", "Mars appears red due to iron oxide (rust) on its surface."],
  ["General Knowledge", "FPSC", "Which is the longest river in the world?", "Amazon", "Yangtze", "Nile", "Indus", "C", "The Nile, at about 6,650 km, is generally regarded as the longest river in the world."],
  ["Pakistan Studies", "PPSC", "The Lahore Resolution was passed on:", "14 August 1947", "23 March 1940", "25 December 1940", "11 September 1948", "B", "The Lahore Resolution was adopted at the All-India Muslim League session at Minto Park, Lahore, on 23 March 1940."],
  ["Pakistan Studies", "FPSC", "Who was the first Governor-General of Pakistan?", "Liaquat Ali Khan", "Khawaja Nazimuddin", "Quaid-e-Azam Muhammad Ali Jinnah", "Iskander Mirza", "C", "Quaid-e-Azam Muhammad Ali Jinnah served as the first Governor-General from 1947 until his death in 1948."],
  ["Pakistan Studies", "NTS", "What is the national language of Pakistan?", "Urdu", "English", "Punjabi", "Sindhi", "A", "Urdu is the national language of Pakistan under Article 251 of the Constitution."],
  ["Pakistan Studies", "PPSC", "The Constitution of 1973 was enforced on:", "23 March 1973", "10 April 1973", "14 August 1973", "25 December 1973", "C", "The Constitution was passed on 10 April 1973 and came into force on 14 August 1973."],
  ["Pakistan Studies", "FPSC", "Which is the largest province of Pakistan by area?", "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "D", "Balochistan covers about 44% of Pakistan's total land area."],
  ["Pakistan Studies", "Other", "Who wrote the lyrics of Pakistan's national anthem?", "Allama Iqbal", "Hafeez Jalandhari", "Faiz Ahmed Faiz", "Ahmed Ghulamali Chagla", "B", "Hafeez Jalandhari wrote the lyrics; the music was composed by Ahmed Ghulamali Chagla."],
  ["Islamic Studies", "PPSC", "How many Surahs are there in the Holy Quran?", "112", "113", "114", "116", "C", "The Holy Quran contains 114 Surahs."],
  ["Islamic Studies", "NTS", "The first revelation was received by the Holy Prophet (PBUH) in:", "Cave Thawr", "Cave Hira", "Masjid al-Haram", "Masjid Quba", "B", "The first revelation (Surah Al-Alaq) came in the Cave of Hira on Jabal al-Nour."],
  ["Islamic Studies", "FPSC", "The Battle of Badr took place in:", "1 AH", "2 AH", "3 AH", "5 AH", "B", "The Battle of Badr was fought in Ramadan, 2 AH (624 CE)."],
  ["Islamic Studies", "PPSC", "Which is the longest Surah of the Holy Quran?", "Surah Al-Imran", "Surah An-Nisa", "Surah Yaseen", "Surah Al-Baqarah", "D", "Surah Al-Baqarah, with 286 verses, is the longest Surah."],
  ["Computer Science", "NTS", "CPU stands for:", "Central Processing Unit", "Central Program Utility", "Computer Personal Unit", "Control Processing Unit", "A", "The CPU (Central Processing Unit) executes instructions and is often called the brain of the computer."],
  ["Computer Science", "PPSC", "One byte is equal to:", "4 bits", "8 bits", "16 bits", "32 bits", "B", "A byte consists of 8 bits."],
  ["Computer Science", "FPSC", "Which of the following is NOT an operating system?", "Windows", "Linux", "Python", "macOS", "C", "Python is a programming language, not an operating system."],
  ["Computer Science", "Other", "The keyboard shortcut to copy selected text in Windows is:", "Ctrl + V", "Ctrl + X", "Ctrl + Z", "Ctrl + C", "D", "Ctrl + C copies; Ctrl + V pastes; Ctrl + X cuts; Ctrl + Z undoes."],
  ["Everyday Science", "PPSC", "The chemical formula of water is:", "H2O", "CO2", "H2O2", "NaCl", "A", "Water consists of two hydrogen atoms and one oxygen atom."],
  ["Everyday Science", "NTS", "Which vitamin is produced in the skin by sunlight?", "Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K", "C", "Ultraviolet B rays from sunlight help the skin synthesise Vitamin D."],
  ["Everyday Science", "FPSC", "The approximate speed of light in vacuum is:", "3 × 10⁵ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁶ m/s", "B", "Light travels at about 3 × 10⁸ metres per second in a vacuum."],
  ["English", "PPSC", "Choose the synonym of 'Abundant':", "Scarce", "Plentiful", "Rare", "Limited", "B", "Abundant means existing in large quantities — plentiful."],
  ["English", "NTS", "Choose the antonym of 'Ancient':", "Old", "Antique", "Modern", "Historic", "C", "Ancient means very old; its opposite is modern."],
  ["English", "FPSC", "Which word is spelled correctly?", "Accomodate", "Acommodate", "Accommodate", "Acomodate", "C", "'Accommodate' is spelled with double 'c' and double 'm'."],
  ["Mathematics", "NTS", "What is 15% of 200?", "15", "20", "30", "35", "C", "15% of 200 = (15 / 100) × 200 = 30."],
  ["Mathematics", "PPSC", "The square root of 144 is:", "11", "12", "13", "14", "B", "12 × 12 = 144."],
  ["Mathematics", "Other", "The sum of the interior angles of a triangle is:", "90°", "180°", "270°", "360°", "B", "The interior angles of any triangle always add up to 180°."],
  ["Physics", "PPSC", "The SI unit of force is:", "Joule", "Watt", "Pascal", "Newton", "D", "Force is measured in newtons (N), where 1 N = 1 kg·m/s²."],
  ["Chemistry", "NTS", "The atomic number of carbon is:", "6", "8", "12", "14", "A", "Carbon has 6 protons, so its atomic number is 6."],
  ["Biology", "PPSC", "Which organelle is known as the powerhouse of the cell?", "Nucleus", "Ribosome", "Mitochondria", "Golgi body", "C", "Mitochondria produce ATP through cellular respiration."],
  ["Economics", "FPSC", "GDP stands for:", "Gross Domestic Product", "General Development Plan", "Gross Development Product", "General Domestic Price", "A", "GDP is the total value of goods and services produced within a country in a given period."],
  ["Urdu", "PPSC", "'Baba-e-Urdu' is the title of:", "Sir Syed Ahmed Khan", "Maulvi Abdul Haq", "Altaf Hussain Hali", "Shibli Nomani", "B", "Maulvi Abdul Haq is known as Baba-e-Urdu for his services to the Urdu language."],
  ["Political Science", "FPSC", "Who is known as the Father of Political Science?", "Plato", "Socrates", "Aristotle", "Machiavelli", "C", "Aristotle is called the Father of Political Science for his systematic study in 'Politics'."],
  ["International Relations", "FPSC", "The United Nations was founded in:", "1919", "1939", "1945", "1950", "C", "The UN Charter came into force on 24 October 1945."],
  ["Judiciary and Law", "PPSC", "Article 25-A of the Constitution of Pakistan relates to:", "Freedom of speech", "Right to education", "Right to information", "Equality of citizens", "B", "Article 25-A, inserted by the 18th Amendment, guarantees free and compulsory education for children aged 5 to 16."],
  ["Pedagogy", "NTS", "In the revised Bloom's Taxonomy, the highest level of the cognitive domain is:", "Evaluate", "Analyse", "Apply", "Create", "D", "The revised taxonomy (2001) places 'Create' at the top, above 'Evaluate'."],
  ["Accounting", "Other", "The basic accounting equation is:", "Assets = Liabilities + Equity", "Assets = Liabilities − Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity", "A", "Everything a business owns (assets) is financed by liabilities or owners' equity."],
];

const BASE = Date.UTC(2026, 9, 31, 12, 0, 0);

export const SAMPLE_MCQS: Mcq[] = ROWS.map((r, i) => ({
  id: `sample-${i + 1}`,
  subject: r[0],
  exam_category: r[1],
  question: r[2],
  option_a: r[3],
  option_b: r[4],
  option_c: r[5],
  option_d: r[6],
  correct_answer: r[7],
  explanation: r[8],
  topic: null,
  created_at: new Date(BASE - i * 3600_000 * 7).toISOString(),
}));
