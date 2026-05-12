/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dog, 
  Cat, 
  Bird, 
  Rabbit, 
  Ghost, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  MessageSquareQuote,
  Heart,
  Zap,
  Coffee,
  Mic,
  Smile,
  Globe,
  Skull,
  Flame,
  Fish,
  Bug
} from 'lucide-react';
import { translateAnimalSound } from './lib/gemini';

const ANIMALS = [
  { id: 'dog', name: 'Dog', icon: Dog, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'cat', name: 'Cat', icon: Cat, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { id: 'tiger', name: 'Tiger', icon: Cat, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'bird', name: 'Bird', icon: Bird, color: 'bg-sky-100 text-sky-600 border-sky-200' },
  { id: 'rabbit', name: 'Rabbit', icon: Rabbit, color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { id: 'dino', name: 'Dinosaur', icon: Skull, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { id: 'dragon', name: 'Dragon', icon: Flame, color: 'bg-red-100 text-red-600 border-red-200' },
  { id: 'fish', name: 'Fish', icon: Fish, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'bug', name: 'Insect', icon: Bug, color: 'bg-lime-100 text-lime-600 border-lime-200' },
  { id: 'alien', name: 'Alien', icon: Zap, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'mysterious', name: 'Other', icon: Ghost, color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const LANGUAGES = [
  { id: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'zh-hans', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { id: 'zh-hant', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { id: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { id: 'kr', name: 'Korean', flag: '🇰🇷' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
  { id: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { id: 'ru', name: 'Russian', flag: '🇷🇺' },
  { id: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { id: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { id: 'th', name: 'Thai', flag: '🇹🇭' },
  { id: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { id: 'ms', name: 'Malay', flag: '🇲🇾' },
  { id: 'jv', name: 'Javanese', flag: '🇮🇩' },
  { id: 'su', name: 'Sundanese', flag: '🇮🇩' },
];

const MOOD_ICONS: Record<string, any> = {
  HAPPY: Heart,
  HUNGRY: Coffee,
  ANNOYED: Zap,
  SLEEPY: Coffee,
  ADVENTUROUS: Sparkles,
  DEFAULT: Smile
};

export default function App() {
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMALS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const result = await translateAnimalSound(selectedAnimal.name, input, selectedLanguage.name);
      setTranslation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Re-translate when language changes IF we are already in the result view
  useEffect(() => {
    if (translation && !loading) {
      handleTranslate();
    }
  }, [selectedLanguage]);

  const clearAll = () => {
    setInput('');
    setTranslation(null);
  };

  const editInput = () => {
    setTranslation(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-gray-900 font-sans selection:bg-amber-200">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 text-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-100">
            <Sparkles className="w-3 h-3" />
            AI-Powered Petspeak
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
            PetSpeak <span className="text-amber-500">AI</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
            What is your little friend trying to tell you? Translate paw-sibilities into human!
          </p>
        </motion.div>

        <main className="space-y-8">
          {/* Card Container */}
          <motion.div 
            layout
            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden text-left"
          >
            {/* Animal Selection */}
            {!translation && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Choose your companion
                  </label>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {ANIMALS.map((animal) => {
                      const Icon = animal.icon;
                      const isSelected = selectedAnimal.id === animal.id;
                      return (
                        <button
                          key={animal.id}
                          id={`animal-btn-${animal.id}`}
                          onClick={() => setSelectedAnimal(animal)}
                          className={`
                            px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 border focus:outline-none
                            ${isSelected 
                              ? `${animal.color} scale-105 shadow-md` 
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'}
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{animal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Translation Language
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`
                          px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2 font-medium text-xs whitespace-nowrap
                          ${selectedLanguage.id === lang.id 
                            ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm' 
                            : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}
                        `}
                      >
                        <span>{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    What's the sound or behavior?
                  </label>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g. Meowed thrice at the fridge at 3AM..."
                      className="w-full h-32 px-6 py-5 bg-gray-50 border-none rounded-3xl resize-none focus:ring-4 focus:ring-amber-500/10 transition-all text-lg placeholder:text-gray-300"
                    />
                    <button 
                      className="absolute right-4 bottom-4 p-3 bg-white rounded-xl shadow-sm text-gray-400 hover:text-amber-500 transition-colors"
                      title="Microphone (Demo)"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button
                  id="translate-btn"
                  onClick={handleTranslate}
                  disabled={!input.trim() || loading}
                  className={`
                    w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all
                    ${!input.trim() || loading 
                      ? 'bg-gray-100 text-gray-300' 
                      : 'bg-gray-900 text-white hover:bg-black hover:scale-[1.01] active:scale-[0.98]'}
                  `}
                >
                  {loading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Translate Now <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Translation Result */}
            <AnimatePresence>
              {translation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 py-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${selectedAnimal.color}`}>
                        <selectedAnimal.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-gray-400 uppercase tracking-widest text-sm">
                        Translated Message
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleTranslate}
                        disabled={loading}
                        className={`p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-600 ${loading ? 'animate-spin' : ''}`}
                        title="Re-translate"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={clearAll}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                        title="Start New"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Language Quick Switch */}
                    <div className="flex flex-wrap gap-2 py-4 border-b border-gray-100 max-h-24 overflow-y-auto custom-scrollbar">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`
                            px-3 py-1.5 rounded-lg border flex items-center gap-2 font-medium text-[10px] transition-all whitespace-nowrap
                            ${selectedLanguage.id === lang.id 
                              ? 'border-amber-400 bg-amber-50 text-amber-900' 
                              : 'border-transparent bg-gray-50 text-gray-400 hover:text-gray-600'}
                          `}
                        >
                          <span>{lang.flag}</span>
                          {lang.name}
                        </button>
                      ))}
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-8 relative">
                      <MessageSquareQuote className="absolute -top-4 -left-2 w-12 h-12 text-amber-200 -z-0" />
                      <p className="text-3xl font-black text-amber-900 relative z-10 leading-tight">
                        "{translation.literal}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Emotional Context</span>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          {translation.emotional}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Mood</span>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {(() => {
                              const MoodIcon = MOOD_ICONS[translation.mood] || MOOD_ICONS.DEFAULT;
                              return <MoodIcon className="w-5 h-5 text-amber-500" />;
                            })()}
                          </div>
                          <span className="font-black text-gray-900 text-xl tracking-tight">
                            {translation.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={editInput}
                      className="py-4 rounded-2xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-50 transition-all"
                    >
                      Edit Message
                    </button>
                    <button
                      onClick={clearAll}
                      className="py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all"
                    >
                      New Translation
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Scientific(ish) AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Dog className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">1,000+ Paw-sitives</span>
            </div>
          </motion.div>
        </main>

        <footer className="mt-20 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Support</a>
          </div>
          <p className="text-gray-300 text-sm font-medium">
            © 2026 PetSpeak AI. Built with ❤️ for our furry overlords.
          </p>
        </footer>
      </div>
    </div>
  );
}
