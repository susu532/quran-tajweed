/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { fetchSurahs, fetchSurahWithTajweed } from "./api";
import { Surah, SurahDetail } from "./types";
import { TajweedText } from "./components/TajweedText";
import { BookOpen, ChevronDown, PlayCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [translationLang, setTranslationLang] = useState<"en" | "fr" | "both">(
    "en",
  );
  const [showTafsir, setShowTafsir] = useState<boolean>(false);

  useEffect(() => {
    fetchSurahs().then(setSurahs).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setCurrentVerseIndex(0);
    fetchSurahWithTajweed(selectedSurahId)
      .then(setSurahDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSurahId]);

  const handlePrev = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (surahDetail && currentVerseIndex < surahDetail.ayahs.length - 1) {
      setCurrentVerseIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVerseIndex, surahDetail]);

  const selectedSurah = surahs.find((s) => s.number === selectedSurahId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1A1A1A] font-serif border-4 md:border-[16px] border-[#E8E1D5] selection:bg-[#C5A059]/30">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-12 py-6 md:py-8 border-b border-[#E8E1D5] relative z-20 bg-[#FDFBF7]">
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#A6937C]">
            Surah
          </span>
          <span className="text-xl md:text-2xl font-light">
            {selectedSurah
              ? String(selectedSurah.number).padStart(3, "0")
              : "..."}
          </span>
        </div>

        <div className="text-center relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex flex-col items-center group"
          >
            <h1 className="text-2xl md:text-3xl font-bold italic tracking-tight group-hover:text-[#C5A059] transition-colors flex items-center justify-center gap-2">
              {selectedSurah ? selectedSurah.englishName : "Loading..."}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </h1>
            <p className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-sans text-[#A6937C] mt-2">
              {selectedSurah
                ? `${selectedSurah.englishNameTranslation} • ${selectedSurah.revelationType}`
                : ""}
            </p>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-6 w-72 max-h-96 overflow-y-auto bg-[#FDFBF7] border border-[#E8E1D5] shadow-2xl z-50 text-left rounded-sm"
              >
                <div className="p-2">
                  {surahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        setSelectedSurahId(surah.number);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between font-sans transition-colors ${
                        surah.number === selectedSurahId
                          ? "bg-[#FAF8F4] text-[#C5A059] font-medium"
                          : "hover:bg-[#FAF8F4] text-[#1A1A1A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-[10px] uppercase tracking-wider text-[#A6937C] font-bold">
                          {String(surah.number).padStart(3, "0")}
                        </span>
                        <span className="text-sm font-serif">
                          {surah.englishName}
                        </span>
                      </div>
                      <span className="font-arabic text-lg text-[#A6937C]">
                        {surah.name.replace("سُورَةُ ", "")}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#A6937C]">
            Verse
          </span>
          <span className="text-xl md:text-2xl font-light underline decoration-[#C5A059] underline-offset-4">
            {selectedSurah && surahDetail
              ? `${String(currentVerseIndex + 1).padStart(2, "0")} / ${String(
                  selectedSurah.numberOfAyahs,
                ).padStart(2, "0")}`
              : "..."}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-end w-[90%] max-w-[90%] mx-auto px-2 md:px-4 pt-16 pb-24 relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#A6937C] w-full">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-sans text-[11px] uppercase tracking-widest">
              Gathering Verses...
            </p>
          </div>
        ) : surahDetail ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full relative z-10"
          >
            <div className="w-full relative z-10 flex flex-col items-end flex-grow justify-center min-h-[50vh]">
              <AnimatePresence mode="wait">
                {surahDetail.ayahs[currentVerseIndex] &&
                  (() => {
                    const ayah = surahDetail.ayahs[currentVerseIndex];
                    return (
                      <motion.div
                        key={ayah.number}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative flex flex-col items-end text-right group w-full"
                      >
                        <div className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-[#E8E1D5] opacity-50 md:opacity-100 hidden sm:block"></div>

                        <div className="mb-8 md:mb-12 w-full" dir="rtl">
                          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[2.2] md:leading-[2.0] font-arabic max-w-full break-words text-right">
                            <TajweedText text={ayah.text} />
                            <span className="inline-block mx-4 text-xl md:text-3xl text-[#A6937C] align-middle font-arabic select-none opacity-50 font-light translate-y-0.5">
                              {toArabicNumeral(ayah.numberInSurah)}
                            </span>
                          </p>
                        </div>

                        <div className="max-w-5xl lg:max-w-6xl pr-4 md:pr-0 text-right flex flex-col items-end gap-4 w-full">
                          {(translationLang === "en" ||
                            translationLang === "both") && (
                            <div className="w-full">
                              <p className="text-base md:text-xl italic leading-relaxed text-[#444] text-right">
                                “{ayah.translation}”
                              </p>
                              {translationLang === "both" && (
                                <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#A6937C] block mt-1">
                                  Sahih International (EN)
                                </span>
                              )}
                            </div>
                          )}

                          {(translationLang === "fr" ||
                            translationLang === "both") && (
                            <div className="w-full">
                              <p className="text-base md:text-xl italic leading-relaxed text-[#444] text-right">
                                “{ayah.translationFr}”
                              </p>
                              {translationLang === "both" && (
                                <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#A6937C] block mt-1">
                                  Hamidullah (FR)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col items-end gap-3 mt-2 w-full">
                            <button
                              onClick={() => setShowTafsir(!showTafsir)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-[10px] font-sans font-bold uppercase tracking-widest transition-all select-none ${
                                showTafsir
                                  ? "bg-[#C5A059] border-[#C5A059] text-white shadow-sm"
                                  : "border-[#D5C9B8] text-[#A6937C] hover:border-[#C5A059] hover:text-[#C5A059] bg-white"
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              {showTafsir
                                ? "إخفاء التفسير"
                                : "تفسير الوسيط (طنطاوي)"}
                            </button>

                            <AnimatePresence>
                              {showTafsir && ayah.tafsirWaseet && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-full bg-[#FAF8F4] border border-[#E8E1D5] rounded-[4px] p-5 mt-2 text-right overflow-hidden shadow-sm"
                                  dir="rtl"
                                >
                                  <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-2 mb-3">
                                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#A6937C]">
                                      التفسير الوسيط لطنطاوي
                                    </span>
                                    <span className="text-[10px] font-sans text-[#A6937C]">
                                      Al-Wasit Tafsir
                                    </span>
                                  </div>
                                  <p className="font-arabic text-base sm:text-lg leading-[2.2] text-[#2D3748] text-right font-normal">
                                    {ayah.tafsirWaseet}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <p className="text-[10px] md:text-xs font-sans uppercase tracking-widest text-[#A6937C] text-right">
                            Verse {ayah.numberInSurah}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })()}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </main>

      {/* Footer / Legend */}
      <footer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#E8E1D5] bg-[#FAF8F4] mt-auto z-20 relative">
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#E8E1D5] flex flex-col justify-center items-center gap-4">
          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#A6937C]">
            Quick Navigation
          </span>
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentVerseIndex === 0}
              className="w-10 h-10 rounded-full border border-[#D5C9B8] flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              disabled={
                !surahDetail ||
                currentVerseIndex === surahDetail.ayahs.length - 1
              }
              className="w-10 h-10 rounded-full border border-[#D5C9B8] flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]"
            >
              →
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b md:border-b-0 lg:border-r border-[#E8E1D5] flex flex-col items-center justify-center bg-[#FAF8F4]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Madd Lazim (6)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Madd (4-5)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Madd Tabi'i (2)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Qalqalah
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Ghunnah & Ikhfa
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Tafkhim
              </span>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-60"></div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-[#1A1A1A]">
                Silent Letters
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col items-center justify-center lg:col-span-1 md:col-span-2 text-center bg-[#FAF8F4]">
          <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#A6937C] mb-3">
            Translation
          </span>
          <div className="flex border border-[#D5C9B8] rounded-[4px] overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setTranslationLang("en")}
              className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-sans font-bold transition-all ${
                translationLang === "en"
                  ? "bg-[#C5A059] text-white"
                  : "text-[#1A1A1A] hover:bg-[#FAF8F4]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setTranslationLang("fr")}
              className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-sans font-bold transition-all border-l border-r border-[#D5C9B8] ${
                translationLang === "fr"
                  ? "bg-[#C5A059] text-white"
                  : "text-[#1A1A1A] hover:bg-[#FAF8F4]"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setTranslationLang("both")}
              className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-sans font-bold transition-all ${
                translationLang === "both"
                  ? "bg-[#C5A059] text-white"
                  : "text-[#1A1A1A] hover:bg-[#FAF8F4]"
              }`}
            >
              Both
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Convert numbering to Arabic numerals
function toArabicNumeral(n: number) {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return n
    .toString()
    .split("")
    .map((char) => arabicNumbers[parseInt(char)])
    .join("");
}
