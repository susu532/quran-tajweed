import { Surah, SurahDetail, Ayah } from "./types";

const BASE_URL = "https://api.alquran.cloud/v1";

export async function fetchSurahs(): Promise<Surah[]> {
  const response = await fetch(`${BASE_URL}/surah`);
  if (!response.ok) throw new Error("Failed to fetch surahs");
  const data = await response.json();
  return data.data;
}

export async function fetchSurahWithTajweed(
  surahNumber: number,
): Promise<SurahDetail> {
  // Fetch Arabic with Tajweed, English translation, French translation, and Tafsir Al-Wasit in parallel
  const [tajweedRes, enRes, frRes, waseetRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}/quran-tajweed`),
    fetch(`${BASE_URL}/surah/${surahNumber}/en.sahih`),
    fetch(`${BASE_URL}/surah/${surahNumber}/fr.hamidullah`),
    fetch(`${BASE_URL}/surah/${surahNumber}/ar.waseet`),
  ]);

  if (!tajweedRes.ok) throw new Error("Failed to fetch tajweed");
  if (!enRes.ok) throw new Error("Failed to fetch English translation");
  if (!frRes.ok) throw new Error("Failed to fetch French translation");
  if (!waseetRes.ok) throw new Error("Failed to fetch Tafsir Al-Wasit");

  const [tajweedData, enData, frData, waseetData] = await Promise.all([
    tajweedRes.json(),
    enRes.json(),
    frRes.json(),
    waseetRes.json(),
  ]);

  const ayahs: Ayah[] = tajweedData.data.ayahs.map(
    (ayah: Ayah, index: number) => {
      return {
        ...ayah,
        translation: enData.data.ayahs[index].text,
        translationFr: frData.data.ayahs[index].text,
        tafsirWaseet: waseetData.data.ayahs[index].text,
      };
    },
  );

  return {
    ...tajweedData.data,
    ayahs,
  };
}
