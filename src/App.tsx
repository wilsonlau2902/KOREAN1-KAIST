/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, Mic, LayoutDashboard, Keyboard } from 'lucide-react';
import PhoneticsDrill from './components/PhoneticsDrill';
import FlashcardGenerator from './components/FlashcardGenerator';
import HangulBoard from './components/HangulBoard';

type Tab = 'phonetics' | 'flashcards' | 'board';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('board');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <LayoutDashboard className="w-6 h-6" />
            <span>K-Learn</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Korean Learning Assistant</p>
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-800 font-medium">Created by Wilson</p>
            <p className="text-[10px] text-indigo-600 mt-1 leading-tight">Korean 1 for International Students<br/>KAIST</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('board')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'board'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-5 h-5" />
            Interactive Board
          </button>
          <button
            onClick={() => setActiveTab('phonetics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'phonetics'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mic className="w-5 h-5" />
            Phonetics Drills
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Flashcard Gen
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === 'board' && <HangulBoard />}
          {activeTab === 'phonetics' && <PhoneticsDrill />}
          {activeTab === 'flashcards' && <FlashcardGenerator />}
        </div>
      </main>
    </div>
  );
}
