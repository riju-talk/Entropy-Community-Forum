export const locales = ["en", "hi"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    "search.title": "Search Doubts",
    "search.subtitle": "Find questions, answers, and topics across Entropy.",
    "ask.title": "Ask Anything",
    "ask.subtitle": "Get help from the community with text, code, images, and more.",
    "lang.english": "English",
    "lang.hindi": "Hindi",
  },
  hi: {
    "search.title": "शंकाएँ खोजें",
    "search.subtitle": "एंट्रॉपी पर प्रश्न, उत्तर और विषय खोजें।",
    "ask.title": "कुछ भी पूछें",
    "ask.subtitle": "समुदाय से टेक्स्ट, कोड, छवियों और अधिक के साथ मदद प्राप्त करें।",
    "lang.english": "अंग्रेज़ी",
    "lang.hindi": "हिंदी",
  },
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries[defaultLocale]
}
