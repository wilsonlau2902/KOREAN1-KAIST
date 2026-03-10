import { useState, useRef } from 'react';
import { Mic, Square, RefreshCw, Volume2, Activity } from 'lucide-react';

const KOREAN_SYLLABLES = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하',
  '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호',
  '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후',
  '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히'
];

export default function PhoneticsDrill() {
  const [syllables, setSyllables] = useState<string[]>([]);
  
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

  const generateSyllables = () => {
    setFeedback(null);
    setAudioUrl(null);
    const shuffled = [...KOREAN_SYLLABLES].sort(() => 0.5 - Math.random());
    setSyllables(shuffled.slice(0, 3));
  };

  const playTarget = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(syllables.join(''));
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
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
          setFeedback({ text: 'Listening... Please read the 3 syllables.', isSuccess: false });
        };

        recognition.onresult = (event: any) => {
          hasResultRef.current = true;
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          
          const cleanResult = fullTranscript.replace(/\s+/g, '').trim();
          const target = syllables.join('');
          
          if (cleanResult === target || cleanResult.includes(target)) {
            setFeedback({ 
              text: `Perfect! You said "${fullTranscript}".`,
              isSuccess: true
            });
          } else {
            setFeedback({ 
              text: `You said "${fullTranscript}". The target was "${syllables.join(' ')}".`,
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Phonetics Drills</h1>
        <p className="text-slate-500 mt-2">Practice your pronunciation with self-recording and auto-check.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">1. Generate Syllables</h2>
          <button
            onClick={generateSyllables}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {syllables.length > 0 ? 'Regenerate' : 'Generate'}
          </button>
        </div>

        {syllables.length > 0 ? (
          <div className="flex justify-center gap-8 mb-8">
            {syllables.map((syl, i) => (
              <div key={i} className="w-24 h-24 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-800 shadow-sm">
                {syl}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            Click generate to get your practice syllables.
          </div>
        )}

        {syllables.length > 0 && (
          <div className="border-t border-slate-100 pt-6 space-y-8">
            
            {/* Native Pronunciation */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Listen to Target</h2>
              <button
                onClick={playTarget}
                className="px-5 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Play Native Pronunciation
              </button>
            </div>

            {/* Record & Compare */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">3. Record & Auto-Check</h2>
              <p className="text-slate-500 mb-4 text-sm">Record your voice to self-evaluate and get automatic feedback.</p>
              <div className="flex flex-col items-start gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isListening}
                    className="px-5 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    {isListening ? 'Processing...' : 'Start Recording'}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-medium transition-colors flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-5 h-5" fill="currentColor" />
                    Stop Recording
                  </button>
                )}
                
                {audioUrl && !isRecording && (
                  <div className="w-full max-w-md bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <audio src={audioUrl} controls className="w-full h-10" />
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {feedback && (
        <div className={`bg-white border rounded-2xl p-6 shadow-sm ${feedback.isSuccess ? 'border-emerald-200' : 'border-amber-200'}`}>
          <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${feedback.isSuccess ? 'text-emerald-800' : 'text-amber-800'}`}>
            <span className={`w-2 h-2 rounded-full ${feedback.isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            Pronunciation Feedback
          </h2>
          <p className="text-slate-700 text-lg">{feedback.text}</p>
        </div>
      )}
    </div>
  );
}
