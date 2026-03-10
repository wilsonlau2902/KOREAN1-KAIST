import { useState, useMemo, useRef } from 'react';
import { Volume2, Delete, RotateCcw, Mic, Square, Activity } from 'lucide-react';
import Hangul from 'hangul-js';

const { assemble } = Hangul;

const CONSONANTS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const VOWELS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

const PHONETIC_MAP: Record<string, string> = {
  'ㄱ': '그', 'ㄲ': '끄', 'ㄴ': '느', 'ㄷ': '드', 'ㄸ': '뜨', 'ㄹ': '르', 'ㅁ': '므', 'ㅂ': '브', 'ㅃ': '쁘', 'ㅅ': '스', 'ㅆ': '쓰', 'ㅇ': '응', 'ㅈ': '즈', 'ㅉ': '쯔', 'ㅊ': '츠', 'ㅋ': '크', 'ㅌ': '트', 'ㅍ': '프', 'ㅎ': '흐',
  'ㅏ': '아', 'ㅐ': '애', 'ㅑ': '야', 'ㅒ': '얘', 'ㅓ': '어', 'ㅔ': '에', 'ㅕ': '여', 'ㅖ': '예', 'ㅗ': '오', 'ㅘ': '와', 'ㅙ': '왜', 'ㅚ': '외', 'ㅛ': '요', 'ㅜ': '우', 'ㅝ': '워', 'ㅞ': '웨', 'ㅟ': '위', 'ㅠ': '유', 'ㅡ': '으', 'ㅢ': '의', 'ㅣ': '이'
};

const ROMAN_MAP: Record<string, string> = {
  'ㄱ': 'g/k', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd/t', 'ㄸ': 'tt', 'ㄹ': 'r/l', 'ㅁ': 'm', 'ㅂ': 'b/p', 'ㅃ': 'pp', 'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': 'ng', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
};

export default function HangulBoard() {
  const [jamoList, setJamoList] = useState<string[]>([]);
  
  const [speed, setSpeed] = useState(1.0);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasResultRef = useRef(false);

  // Media Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const combinedText = useMemo(() => {
    return assemble(jamoList);
  }, [jamoList]);

  const speak = (text: string) => {
    if (!text) return;
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = speed;
      
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');
      if (koVoice) {
        utterance.voice = koVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleJamoClick = (jamo: string) => {
    speak(PHONETIC_MAP[jamo] || jamo);
    setJamoList(prev => [...prev, jamo]);
  };

  const handleSpeakWord = () => {
    if (combinedText) {
      speak(combinedText);
    }
  };

  const handleBackspace = () => {
    setJamoList(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setJamoList([]);
    setFeedback(null);
    setAudioUrl(null);
  };

  const startRecording = async () => {
    if (!combinedText) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setFeedback(null);

      // Start Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        hasResultRef.current = false;

        recognition.onstart = () => {
          setIsListening(true);
          setFeedback({ text: `Listening... Please read "${combinedText}".`, isSuccess: false });
        };

        recognition.onresult = (event: any) => {
          hasResultRef.current = true;
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          
          const cleanResult = fullTranscript.replace(/\s+/g, '').trim();
          const target = combinedText.replace(/\s+/g, '').trim();
          
          if (cleanResult === target || cleanResult.includes(target)) {
            setFeedback({ 
              text: `Perfect! You said "${fullTranscript}".`,
              isSuccess: true
            });
          } else {
            setFeedback({ 
              text: `You said "${fullTranscript}". The target was "${combinedText}".`,
              isSuccess: false
            });
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
            // Ignore these as they are handled by onend
            return;
          }
          setFeedback({ text: `Recognition error: ${event.error}. Please try again.`, isSuccess: false });
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setFeedback(prev => {
            if (prev?.isSuccess) return prev;
            if (hasResultRef.current) return prev;
            return { text: 'Could not recognize speech. Please speak louder and clearer.', isSuccess: false };
          });
        };

        recognition.start();
      } else {
        setFeedback({ text: 'Speech recognition is not supported in your browser.', isSuccess: false });
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current && isListening) {
      try {
        setFeedback(prev => prev?.isSuccess ? prev : { text: 'Processing speech...', isSuccess: false });
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interactive Hangul Board</h1>
        <p className="text-slate-500 mt-2">Click consonants and vowels to hear their sounds and combine them into words.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {/* Display Area */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full max-w-2xl">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 w-24">Speed: {speed}x</label>
              <input 
                type="range" 
                min="0.5" max="2.0" step="0.1" 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-32 accent-indigo-600"
              />
            </div>
          </div>

          <div 
            className="w-full max-w-2xl h-32 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-6xl font-bold text-slate-800 shadow-inner mb-4 overflow-hidden px-4 cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={handleSpeakWord}
            title="Click to pronounce full word"
          >
            {combinedText ? (
              combinedText.split('').map((char, i) => (
                <span 
                  key={i} 
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(char);
                  }}
                  className="hover:text-indigo-600 transition-colors px-1"
                  title={`Pronounce '${char}'`}
                >
                  {char}
                </span>
              ))
            ) : (
              <span className="text-slate-300">...</span>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleSpeakWord}
              disabled={!combinedText}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              Pronounce
            </button>

            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!combinedText || isListening}
                className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                {isListening ? 'Processing...' : 'Record'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-medium transition-colors flex items-center gap-2 animate-pulse"
              >
                <Square className="w-5 h-5" fill="currentColor" />
                Stop
              </button>
            )}

            <button
              onClick={handleBackspace}
              disabled={jamoList.length === 0}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Delete className="w-5 h-5" />
              Backspace
            </button>
            <button
              onClick={handleClear}
              disabled={jamoList.length === 0}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Clear
            </button>
          </div>

          {/* Feedback & Audio Player */}
          {(audioUrl || feedback) && (
            <div className="w-full max-w-2xl mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4">
              {audioUrl && !isRecording && (
                <div className="w-full bg-white p-2 rounded-xl border border-slate-200">
                  <audio src={audioUrl} controls className="w-full h-10" />
                </div>
              )}
              {feedback && (
                <div className={`p-3 rounded-xl text-sm ${feedback.isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {feedback.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consonants */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Consonants (자음)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {CONSONANTS.map((jamo) => (
                <button
                  key={jamo}
                  onClick={() => handleJamoClick(jamo)}
                  className="h-16 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl transition-transform active:scale-95 flex flex-col items-center justify-center shadow-sm"
                >
                  <span className="text-2xl font-bold">{jamo}</span>
                  <span className="text-[10px] text-blue-600/70 font-medium">{ROMAN_MAP[jamo]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vowels */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Vowels (모음)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {VOWELS.map((jamo) => (
                <button
                  key={jamo}
                  onClick={() => handleJamoClick(jamo)}
                  className="h-16 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl transition-transform active:scale-95 flex flex-col items-center justify-center shadow-sm"
                >
                  <span className="text-2xl font-bold">{jamo}</span>
                  <span className="text-[10px] text-rose-600/70 font-medium">{ROMAN_MAP[jamo]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
