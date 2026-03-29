/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCcw, User, Settings, Globe, ChevronRight, ChevronLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { translations, Language, UserProfile, FoodAnalysis } from './translations';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("API key is missing!");
}

// Create the AI client instance
const ai = new GoogleGenAI({ apiKey });

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const t = translations[lang];

  useEffect(() => {
    const savedProfile = localStorage.getItem('calorie_cam_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setIsSettingUp(true);
    }
    
    const savedLang = localStorage.getItem('calorie_cam_lang');
    if (savedLang) {
      setLang(savedLang as Language);
    }
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    localStorage.setItem('calorie_cam_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsSettingUp(false);
  };

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('calorie_cam_lang', newLang);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      analyzeImage(imageSrc);
    }
  }, [webcamRef]);

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setError(null);
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        Analyze this food image. Provide the following details in ${lang === 'ar' ? 'Arabic' : 'English'} as a JSON object:
        {
          "name": "Name of the food",
          "weight": "Estimated weight in grams",
          "calories": "Estimated total calories",
          "healthiness": "A brief health status (e.g., Very Healthy, Moderately Healthy, Unhealthy)",
          "description": "A short description of the food and its nutritional value",
          "isHealthy": boolean,
          "rating": number (1-10),
          "alternatives": ["3 healthy alternatives"]
        }
        Be precise and professional.
      `;

      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      const parsed = JSON.parse(responseText);
      setAnalysis(parsed);
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'حدث خطأ أثناء تحليل الصورة. حاول مرة أخرى.' : 'Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  if (isSettingUp) {
    return (
      <div className={`min-h-screen bg-white flex flex-col items-center p-6 ${lang === 'ar' ? 'font-sans' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">{t.title}</h1>
            <button onClick={toggleLang} className="p-2 rounded-full bg-green-50 text-green-600">
              <Globe size={24} />
            </button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 p-8 rounded-3xl shadow-sm border border-green-100"
          >
            <h2 className="text-2xl font-bold text-green-800 mb-6">{t.profileTitle}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveProfile({
                age: formData.get('age') as string,
                gender: formData.get('gender') as any,
                weight: formData.get('weight') as string,
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">{t.age}</label>
                <input required name="age" type="number" defaultValue={profile?.age} className="w-full p-3 rounded-xl border-none ring-1 ring-green-200 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">{t.gender}</label>
                <select required name="gender" defaultValue={profile?.gender} className="w-full p-3 rounded-xl border-none ring-1 ring-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                  <option value="">{t.selectGender}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">{t.weight}</label>
                <input required name="weight" type="number" defaultValue={profile?.weight} className="w-full p-3 rounded-xl border-none ring-1 ring-green-200 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold mt-4 hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                {t.save}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center ${lang === 'ar' ? 'font-sans' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="w-full max-w-md px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
            <Camera size={24} />
          </div>
          <h1 className="text-xl font-bold text-green-800">{t.title}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleLang} className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
            <Globe size={20} />
          </button>
          <button onClick={() => setIsSettingUp(true)} className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-md flex-1 flex flex-col p-6 gap-6">
        {!image ? (
          <div className="flex-1 flex flex-col gap-6">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-green-50">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-full object-cover"
                disablePictureInPicture={true}
                forceScreenshotSourceSize={false}
                imageSmoothing={true}
                mirrored={false}
                onUserMedia={() => {}}
                onUserMediaError={() => {}}
                onScreenshot={() => {}}
                screenshotQuality={0.92}
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-3xl border-dashed"></div>
            </div>
            
            <button 
              onClick={capture}
              className="w-full bg-green-600 text-white py-6 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Camera size={28} />
              <span className="text-lg">{t.capture}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
              <img src={image} className="w-full h-full object-cover" alt="Captured food" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="text-lg font-medium">{t.analyzing}</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {analysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col gap-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-green-900">{analysis.name}</h2>
                      <p className="text-green-600 font-medium">{analysis.healthiness}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${analysis.isHealthy ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {analysis.isHealthy ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {analysis.isHealthy ? t.healthy : t.unhealthy}
                      </div>
                      <div className="mt-2 text-3xl font-black text-green-700">
                        {analysis.rating}/10
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="text-xs text-green-600 uppercase tracking-wider font-bold mb-1">{t.calories}</p>
                      <p className="text-xl font-bold text-green-900">{analysis.calories}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="text-xs text-green-600 uppercase tracking-wider font-bold mb-1">{t.foodWeight}</p>
                      <p className="text-xl font-bold text-green-900">{analysis.weight}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-green-800 mb-2">{t.description}</h3>
                    <p className="text-green-700 leading-relaxed text-sm">{analysis.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-green-800 mb-2">{t.alternatives}</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.alternatives.map((alt, i) => (
                        <span key={i} className="bg-white px-3 py-1.5 rounded-xl text-xs font-medium text-green-700 border border-green-100">
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-2 hover:bg-green-700 transition-colors"
                  >
                    <RefreshCcw size={20} />
                    {t.retake}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center font-medium">
                {error}
                <button onClick={reset} className="block w-full mt-2 font-bold underline">{t.retake}</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      {profile && !image && (
        <footer className="w-full max-w-md p-6 text-center">
          <p className="text-green-400 text-xs">
            {profile.age} {lang === 'ar' ? 'سنة' : 'years'} • {profile.weight} {lang === 'ar' ? 'كجم' : 'kg'} • {lang === 'ar' ? (profile.gender === 'male' ? 'ذكر' : 'أنثى') : profile.gender}
          </p>
        </footer>
      )}
    </div>
  );
}
