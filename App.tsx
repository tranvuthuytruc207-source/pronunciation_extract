import React, { useState, useCallback } from 'react';
import { generateSpeech } from './services/geminiService';
import { createWavBlob } from './utils/audioUtils';
import { DownloadIcon, LoaderIcon, PlayIcon, SoundWaveIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSpeech = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const base64Audio = await generateSpeech(inputText);
      const audioBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setError('Failed to generate audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, audioUrl]);

  const handleClear = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700">
        <header className="p-6 border-b border-slate-700 text-center">
          <div className="flex items-center justify-center space-x-4">
            <SoundWaveIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">UK Pronunciation Generator</h1>
          </div>
          <p className="text-sm text-slate-400 mt-2">Generate and download British English (UK) pronunciations</p>
        </header>

        <main className="p-6">
          <div className="flex flex-col space-y-4">
            <label htmlFor="text-input" className="font-medium text-slate-300">
              Enter word, phrase, or sentence:
            </label>
            <textarea
              id="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Hello, how are you today?"
              className="w-full h-32 p-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none placeholder-slate-500"
              disabled={isLoading || !!audioUrl}
            />
          </div>
          
          {error && <p className="mt-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">{error}</p>}

          <div className="mt-6 w-full">
            {audioUrl && !isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <audio controls src={audioUrl} className="w-full max-w-md h-12 rounded-lg bg-slate-700">
                  Your browser does not support the audio element.
                </audio>
                <div className="w-full max-w-md flex flex-col sm:flex-row gap-4">
                  <a
                    href={audioUrl}
                    download={`pronunciation_${inputText.trim().split(' ')[0].toLowerCase() || 'audio'}.wav`}
                    className="flex-1 w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={handleClear}
                    className="flex-1 w-full sm:w-auto flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <RefreshIcon className="w-5 h-5 mr-2" />
                    <span>Generate New</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateSpeech}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Generate Audio
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
       <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini API</p>
        </footer>
    </div>
  );
};

export default App;