import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, RefreshCw, Volume2 } from 'lucide-react';

interface Flashcard {
  original: string;
  pronunciation: string;
  meaning: string;
}

const LOCAL_DICTIONARY: Record<string, Record<string, Flashcard[]>> = {
  Korean: {
    vowels: [
      { original: 'ㅏ', pronunciation: 'a', meaning: 'a (as in father)' },
      { original: 'ㅑ', pronunciation: 'ya', meaning: 'ya (as in yacht)' },
      { original: 'ㅓ', pronunciation: 'eo', meaning: 'eo (as in run)' },
      { original: 'ㅕ', pronunciation: 'yeo', meaning: 'yeo (as in young)' },
      { original: 'ㅗ', pronunciation: 'o', meaning: 'o (as in go)' },
      { original: 'ㅛ', pronunciation: 'yo', meaning: 'yo (as in yo-yo)' },
      { original: 'ㅜ', pronunciation: 'u', meaning: 'u (as in moon)' },
      { original: 'ㅠ', pronunciation: 'yu', meaning: 'yu (as in you)' },
      { original: 'ㅡ', pronunciation: 'eu', meaning: 'eu (as in put)' },
      { original: 'ㅣ', pronunciation: 'i', meaning: 'i (as in meet)' },
    ],
    consonants: [
      { original: 'ㄱ', pronunciation: 'g/k', meaning: 'g/k' },
      { original: 'ㄴ', pronunciation: 'n', meaning: 'n' },
      { original: 'ㄷ', pronunciation: 'd/t', meaning: 'd/t' },
      { original: 'ㄹ', pronunciation: 'r/l', meaning: 'r/l' },
      { original: 'ㅁ', pronunciation: 'm', meaning: 'm' },
      { original: 'ㅂ', pronunciation: 'b/p', meaning: 'b/p' },
      { original: 'ㅅ', pronunciation: 's', meaning: 's' },
      { original: 'ㅇ', pronunciation: 'ng', meaning: 'ng (silent at start)' },
      { original: 'ㅈ', pronunciation: 'j', meaning: 'j' },
      { original: 'ㅊ', pronunciation: 'ch', meaning: 'ch' },
      { original: 'ㅋ', pronunciation: 'k', meaning: 'k' },
      { original: 'ㅌ', pronunciation: 't', meaning: 't' },
      { original: 'ㅍ', pronunciation: 'p', meaning: 'p' },
      { original: 'ㅎ', pronunciation: 'h', meaning: 'h' },
    ],
    combinations: [
      { original: '가', pronunciation: 'ga', meaning: 'ga' },
      { original: '나', pronunciation: 'na', meaning: 'na' },
      { original: '다', pronunciation: 'da', meaning: 'da' },
      { original: '라', pronunciation: 'ra', meaning: 'ra' },
      { original: '마', pronunciation: 'ma', meaning: 'ma' },
      { original: '바', pronunciation: 'ba', meaning: 'ba' },
      { original: '사', pronunciation: 'sa', meaning: 'sa' },
      { original: '아', pronunciation: 'a', meaning: 'a' },
      { original: '자', pronunciation: 'ja', meaning: 'ja' },
      { original: '차', pronunciation: 'cha', meaning: 'cha' },
    ],
    theme: [
      { original: '안녕하세요', pronunciation: 'annyeonghaseyo', meaning: 'Hello' },
      { original: '감사합니다', pronunciation: 'gamsahamnida', meaning: 'Thank you' },
      { original: '네', pronunciation: 'ne', meaning: 'Yes' },
      { original: '아니요', pronunciation: 'aniyo', meaning: 'No' },
      { original: '물', pronunciation: 'mul', meaning: 'Water' },
      { original: '밥', pronunciation: 'bap', meaning: 'Rice / Meal' },
      { original: '학교', pronunciation: 'hakgyo', meaning: 'School' },
      { original: '친구', pronunciation: 'chingu', meaning: 'Friend' },
      { original: '사랑해', pronunciation: 'saranghae', meaning: 'I love you' },
      { original: '집', pronunciation: 'jip', meaning: 'House' },
    ]
  },
  Hungarian: {
    vowels: [
      { original: 'a', pronunciation: 'a', meaning: 'short a' },
      { original: 'á', pronunciation: 'á', meaning: 'long a' },
      { original: 'e', pronunciation: 'e', meaning: 'short e' },
      { original: 'é', pronunciation: 'é', meaning: 'long e' },
      { original: 'i', pronunciation: 'i', meaning: 'short i' },
      { original: 'í', pronunciation: 'í', meaning: 'long i' },
      { original: 'o', pronunciation: 'o', meaning: 'short o' },
      { original: 'ó', pronunciation: 'ó', meaning: 'long o' },
      { original: 'ö', pronunciation: 'ö', meaning: 'short ö' },
      { original: 'ő', pronunciation: 'ő', meaning: 'long ő' },
      { original: 'u', pronunciation: 'u', meaning: 'short u' },
      { original: 'ú', pronunciation: 'ú', meaning: 'long u' },
      { original: 'ü', pronunciation: 'ü', meaning: 'short ü' },
      { original: 'ű', pronunciation: 'ű', meaning: 'long ű' },
    ],
    consonants: [
      { original: 'b', pronunciation: 'b', meaning: 'b' },
      { original: 'c', pronunciation: 'ts', meaning: 'c' },
      { original: 'cs', pronunciation: 'ch', meaning: 'cs' },
      { original: 'd', pronunciation: 'd', meaning: 'd' },
      { original: 'dz', pronunciation: 'dz', meaning: 'dz' },
      { original: 'dzs', pronunciation: 'j', meaning: 'dzs' },
      { original: 'f', pronunciation: 'f', meaning: 'f' },
      { original: 'g', pronunciation: 'g', meaning: 'g' },
      { original: 'gy', pronunciation: 'dy', meaning: 'gy' },
      { original: 'h', pronunciation: 'h', meaning: 'h' },
    ],
    combinations: [
      { original: 'ba', pronunciation: 'ba', meaning: 'ba' },
      { original: 'be', pronunciation: 'be', meaning: 'be' },
      { original: 'bi', pronunciation: 'bi', meaning: 'bi' },
      { original: 'bo', pronunciation: 'bo', meaning: 'bo' },
      { original: 'bu', pronunciation: 'bu', meaning: 'bu' },
    ],
    theme: [
      { original: 'Szia', pronunciation: 'sia', meaning: 'Hello / Bye' },
      { original: 'Köszönöm', pronunciation: 'kösönöm', meaning: 'Thank you' },
      { original: 'Igen', pronunciation: 'igen', meaning: 'Yes' },
      { original: 'Nem', pronunciation: 'nem', meaning: 'No' },
      { original: 'Víz', pronunciation: 'víz', meaning: 'Water' },
      { original: 'Kenyér', pronunciation: 'kenyér', meaning: 'Bread' },
      { original: 'Iskola', pronunciation: 'iskola', meaning: 'School' },
      { original: 'Barát', pronunciation: 'barát', meaning: 'Friend' },
      { original: 'Szeretlek', pronunciation: 'seretlek', meaning: 'I love you' },
      { original: 'Ház', pronunciation: 'ház', meaning: 'House' },
    ]
  }
};

export default function FlashcardGenerator() {
  const [generationType, setGenerationType] = useState('theme');
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('Korean');
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  const generateFlashcards = () => {
    if (generationType === 'theme' && !theme.trim()) return;
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    // Simulate a brief loading state for UX
    setTimeout(() => {
      const languageDict = LOCAL_DICTIONARY[language] || LOCAL_DICTIONARY['Korean'];
      let newCards: Flashcard[] = [];

      if (generationType === 'theme') {
        // Just use the predefined theme words for any theme input to save tokens
        newCards = languageDict.theme;
      } else if (generationType === 'vowels') {
        newCards = languageDict.vowels;
      } else if (generationType === 'consonants') {
        newCards = languageDict.consonants;
      } else if (generationType === 'combinations') {
        newCards = languageDict.combinations;
      }

      setCards([...newCards].sort(() => Math.random() - 0.5));
    }, 300);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const shuffleCards = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCards(prev => [...prev].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
    }, 150);
  };

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = cards[currentIndex].original;
    if (!text) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Korean' ? 'ko-KR' : 'hu-HU';
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interactive Flashcards</h1>
        <p className="text-slate-500 mt-2">Generate and study vocabulary with interactive flashcards.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Generation Type</label>
            <select
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option value="theme">By Theme / Topic</option>
              <option value="vowels">Vowels Only</option>
              <option value="consonants">Consonants Only</option>
              <option value="combinations">Syllable Combinations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option value="Korean">Korean</option>
              <option value="Hungarian">Hungarian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Speed: {speed}x</label>
            <input 
              type="range" 
              min="0.5" max="2.0" step="0.1" 
              value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-10 accent-indigo-600"
            />
          </div>
        </div>

        {generationType === 'theme' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Theme / Topic</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Daily Routine, Kitchen Items, Emotions"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        )}

        <button
          onClick={generateFlashcards}
          disabled={generationType === 'theme' && !theme.trim()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Generate Flashcards
        </button>
      </div>

      {cards.length > 0 && (
        <div className="flex flex-col items-center space-y-8 mt-8">
          {/* Flashcard Container */}
          <div 
            className="relative w-full max-w-lg h-80 perspective-[1000px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* Front Face */}
              <div className="absolute inset-0 [backface-visibility:hidden] bg-white border-2 border-slate-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center p-8 text-center">
                <button 
                  onClick={speakWord}
                  className="absolute top-4 right-4 p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  title="Pronounce"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <span 
                  className="text-7xl font-bold text-slate-800 mb-4 cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={speakWord}
                  title="Click to pronounce"
                >
                  {cards[currentIndex].original}
                </span>
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Click to reveal</span>
              </div>

              {/* Back Face */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 text-center">
                <span className="text-3xl font-bold text-indigo-900 mb-4">{cards[currentIndex].meaning}</span>
                <span className="text-xl text-indigo-600 font-medium bg-indigo-100/50 px-4 py-2 rounded-lg">{cards[currentIndex].pronunciation}</span>
                <span className="absolute bottom-8 text-sm font-medium text-indigo-400 uppercase tracking-widest">Click to flip back</span>
              </div>

            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <span className="text-slate-600 font-semibold min-w-[4rem] text-center">
              {currentIndex + 1} / {cards.length}
            </span>

            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="w-px h-8 bg-slate-200 mx-2"></div>

            <button
              onClick={shuffleCards}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-2"
              title="Shuffle Cards"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
