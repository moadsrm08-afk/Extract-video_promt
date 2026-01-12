
import React, { useState, useRef, useCallback } from 'react';
import { extractFrames } from './services/videoProcessor';
import { generateVideoPrompt } from './services/geminiService';
import { GenerationResult } from './types';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const processVideo = async () => {
    if (!videoFile) return;

    try {
      setLoading(true);
      setStatus('جاري تحليل محتوى الفيديو والعناصر بدقة...');
      const frames = await extractFrames(videoFile, 15); // Slightly more frames for better subject tracking
      
      setStatus('جاري التعرف على الشخصيات والأشياء ووصفها بدقة (Pro Mode)...');
      const aiResult = await generateVideoPrompt(frames);
      
      setResult(aiResult);
      setStatus('');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التحليل الدقيق. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم نسخ النص بنجاح!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-block p-4 rounded-full bg-indigo-600/20 mb-4 animate-pulse">
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          مُحلل الفيديو الفائق
        </h1>
        <p className="text-gray-400 text-xl font-light">
          استخراج برومبت يصف الأشخاص، الأشياء، والحركة كما هي تماماً
        </p>
      </header>

      <div className="space-y-8">
        <section className="glass rounded-[2rem] p-10 text-center border border-white/10">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-16 transition-all duration-500 cursor-pointer 
              ${videoFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-indigo-500/20 hover:border-indigo-500/50 hover:bg-white/5'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleFileChange} 
            />
            
            {!videoFile ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                   <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                   </div>
                </div>
                <p className="text-2xl text-gray-200 font-medium">ارفع الفيديو للوصف التفصيلي</p>
                <p className="text-gray-500">سيقوم الذكاء الاصطناعي بتحديد الأشخاص والأشياء بدقة فوتوغرافية</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <div className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                    <span className="text-green-400 font-bold">{videoFile.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); setPreviewUrl(null); setResult(null); }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {previewUrl && (
                  <div className="relative inline-block group">
                    <video 
                      src={previewUrl} 
                      className="max-h-80 mx-auto rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" 
                      controls 
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {videoFile && !result && (
            <button
              onClick={processVideo}
              disabled={loading}
              className={`mt-10 px-12 py-4 rounded-2xl font-black text-lg text-white tracking-wide transition-all duration-300
                ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-indigo-500/50'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-3 space-x-reverse">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{status}</span>
                </span>
              ) : 'تحليل الشخصيات والأشياء'}
            </button>
          )}
        </section>

        {result && (
          <section className="space-y-8 animate-fadeIn">
            <div className="glass rounded-[2rem] p-10 overflow-hidden border border-indigo-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white flex items-center space-x-3 space-x-reverse">
                    <span>برومبت المحاكاة (Replica Prompt)</span>
                    <span className="text-xs font-mono bg-indigo-600 text-white px-3 py-1 rounded-full uppercase">Literal Analysis</span>
                  </h2>
                  <p className="text-gray-500 text-sm">هذا البرومبت يصف الأشخاص والأشياء بدقة متناهية لإعادة إنتاج المشهد</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(result.prompt)}
                  className="flex items-center space-x-2 space-x-reverse bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl transition-all group"
                >
                  <svg className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="text-sm font-bold">نسخ النص</span>
                </button>
              </div>
              <div className="bg-black/50 p-8 rounded-[1.5rem] border border-white/10 font-mono text-xl leading-relaxed text-indigo-100 select-all whitespace-pre-wrap dir-ltr shadow-inner" dir="ltr">
                {result.prompt}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass rounded-[2rem] p-10 border border-purple-500/20">
                <h3 className="text-2xl font-black mb-6 text-purple-400 flex items-center space-x-3 space-x-reverse">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>وصف الشخصيات والعناصر</span>
                </h3>
                <p className="text-gray-300 leading-loose text-lg whitespace-pre-line">
                  {result.analysis}
                </p>
              </div>

              <div className="glass rounded-[2rem] p-10 border border-emerald-500/20 h-fit">
                <h3 className="text-2xl font-black mb-6 text-emerald-400 flex items-center space-x-3 space-x-reverse">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>سمات النمط</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.styleTags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
