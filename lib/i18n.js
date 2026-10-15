import { useState, useEffect } from 'react';

// Every word customers see on a tracking page, in 9 languages.
// Kept short and everyday. "Search" stays in English inside the India Post
// steps because that is what the button on India Post's website says.

export const LANGS = [
  { code: 'en', label: 'EN', name: 'English',  native: 'English',  locale: 'en-IN' },
  { code: 'hi', label: 'हि', name: 'Hindi',    native: 'हिन्दी',    locale: 'hi-IN' },
  { code: 'bn', label: 'বা', name: 'Bengali',  native: 'বাংলা',     locale: 'bn-IN' },
  { code: 'mr', label: 'म',  name: 'Marathi',  native: 'मराठी',     locale: 'mr-IN' },
  { code: 'gu', label: 'ગુ', name: 'Gujarati', native: 'ગુજરાતી',   locale: 'gu-IN' },
  { code: 'ta', label: 'த',  name: 'Tamil',    native: 'தமிழ்',     locale: 'ta-IN' },
  { code: 'te', label: 'తె', name: 'Telugu',   native: 'తెలుగు',    locale: 'te-IN' },
  { code: 'kn', label: 'ಕ',  name: 'Kannada',  native: 'ಕನ್ನಡ',     locale: 'kn-IN' },
  { code: 'ml', label: 'മ',  name: 'Malayalam', native: 'മലയാളം',   locale: 'ml-IN' },
];

export const T = {
  en: {
    orderTracking: 'Order tracking', refresh: 'Refresh', updating: 'Updating…', language: 'Language',
    searchPlaceholder: 'Search your name, pincode or tracking number',
    allOrders: 'All orders', results: n => `${n} result${n !== 1 ? 's' : ''}`,
    noOrders: 'No orders yet', checkBackSoon: 'Your order will show here once it is shipped.',
    noResultsFor: q => `Nothing found for "${q}"`, tryDifferent: 'Check the spelling, or try your pincode.',
    trackParcel: 'Track parcel', copy: 'Copy', copied: 'Copied', noTrackingYet: 'Tracking number coming soon',
    isNew: 'New', refreshError: 'Could not refresh. Check your internet.',
    tw: { name: 'Name', pincode: 'Pincode', tracking: 'Tracking no.', order: 'Order ID' },
    ip: {
      title: 'Track on India Post', copiedSub: 'Your tracking number is copied.', copySub: 'Copy your tracking number first.',
      open: 'Open India Post website', step3: 'Paste the number, type the code shown in the picture, and tap Search.', close: 'Close',
    },
  },
  hi: {
    orderTracking: 'ऑर्डर ट्रैकिंग', refresh: 'रीफ़्रेश', updating: 'अपडेट हो रहा है…', language: 'भाषा',
    searchPlaceholder: 'अपना नाम, पिनकोड या ट्रैकिंग नंबर खोजें',
    allOrders: 'सभी ऑर्डर', results: n => `${n} ${n === 1 ? 'नतीजा' : 'नतीजे'}`,
    noOrders: 'अभी कोई ऑर्डर नहीं', checkBackSoon: 'भेजे जाने के बाद आपका ऑर्डर यहाँ दिखेगा।',
    noResultsFor: q => `"${q}" के लिए कुछ नहीं मिला`, tryDifferent: 'स्पेलिंग जाँचें, या अपना पिनकोड डालें।',
    trackParcel: 'ट्रैक करें', copy: 'कॉपी करें', copied: 'कॉपी हो गया', noTrackingYet: 'ट्रैकिंग नंबर जल्द आएगा',
    isNew: 'नया', refreshError: 'रीफ़्रेश नहीं हो सका। इंटरनेट जाँचें।',
    tw: { name: 'नाम', pincode: 'पिनकोड', tracking: 'ट्रैकिंग नंबर', order: 'ऑर्डर ID' },
    ip: {
      title: 'India Post पर ट्रैक करें', copiedSub: 'आपका ट्रैकिंग नंबर कॉपी हो गया है।', copySub: 'पहले अपना ट्रैकिंग नंबर कॉपी करें।',
      open: 'India Post वेबसाइट खोलें', step3: 'नंबर पेस्ट करें, तस्वीर में दिखा कोड लिखें, और Search दबाएँ।', close: 'बंद करें',
    },
  },
  bn: {
    orderTracking: 'অর্ডার ট্র্যাকিং', refresh: 'রিফ্রেশ', updating: 'আপডেট হচ্ছে…', language: 'ভাষা',
    searchPlaceholder: 'আপনার নাম, পিনকোড বা ট্র্যাকিং নম্বর খুঁজুন',
    allOrders: 'সব অর্ডার', results: n => `${n}টি ফলাফল`,
    noOrders: 'এখনও কোনো অর্ডার নেই', checkBackSoon: 'পাঠানোর পর আপনার অর্ডার এখানে দেখা যাবে।',
    noResultsFor: q => `"${q}" এর জন্য কিছু পাওয়া যায়নি`, tryDifferent: 'বানান দেখুন, অথবা আপনার পিনকোড দিন।',
    trackParcel: 'ট্র্যাক করুন', copy: 'কপি করুন', copied: 'কপি হয়েছে', noTrackingYet: 'ট্র্যাকিং নম্বর শীঘ্রই আসবে',
    isNew: 'নতুন', refreshError: 'রিফ্রেশ করা যায়নি। ইন্টারনেট দেখুন।',
    tw: { name: 'নাম', pincode: 'পিনকোড', tracking: 'ট্র্যাকিং নম্বর', order: 'অর্ডার ID' },
    ip: {
      title: 'India Post-এ ট্র্যাক করুন', copiedSub: 'আপনার ট্র্যাকিং নম্বর কপি হয়েছে।', copySub: 'আগে আপনার ট্র্যাকিং নম্বর কপি করুন।',
      open: 'India Post ওয়েবসাইট খুলুন', step3: 'নম্বরটি পেস্ট করুন, ছবিতে দেখানো কোড লিখুন, তারপর Search চাপুন।', close: 'বন্ধ করুন',
    },
  },
  mr: {
    orderTracking: 'ऑर्डर ट्रॅकिंग', refresh: 'रिफ्रेश', updating: 'अपडेट होत आहे…', language: 'भाषा',
    searchPlaceholder: 'तुमचे नाव, पिनकोड किंवा ट्रॅकिंग नंबर शोधा',
    allOrders: 'सर्व ऑर्डर', results: n => `${n} निकाल`,
    noOrders: 'अजून कोणतीही ऑर्डर नाही', checkBackSoon: 'पाठवल्यानंतर तुमची ऑर्डर इथे दिसेल.',
    noResultsFor: q => `"${q}" साठी काहीही सापडले नाही`, tryDifferent: 'स्पेलिंग तपासा, किंवा तुमचा पिनकोड टाका.',
    trackParcel: 'ट्रॅक करा', copy: 'कॉपी करा', copied: 'कॉपी झाले', noTrackingYet: 'ट्रॅकिंग नंबर लवकरच येईल',
    isNew: 'नवीन', refreshError: 'रिफ्रेश झाले नाही. इंटरनेट तपासा.',
    tw: { name: 'नाव', pincode: 'पिनकोड', tracking: 'ट्रॅकिंग नंबर', order: 'ऑर्डर ID' },
    ip: {
      title: 'India Post वर ट्रॅक करा', copiedSub: 'तुमचा ट्रॅकिंग नंबर कॉपी झाला आहे.', copySub: 'आधी तुमचा ट्रॅकिंग नंबर कॉपी करा.',
      open: 'India Post वेबसाइट उघडा', step3: 'नंबर पेस्ट करा, चित्रात दिसणारा कोड लिहा, आणि Search दाबा.', close: 'बंद करा',
    },
  },
  gu: {
    orderTracking: 'ઓર્ડર ટ્રેકિંગ', refresh: 'રિફ્રેશ', updating: 'અપડેટ થઈ રહ્યું છે…', language: 'ભાષા',
    searchPlaceholder: 'તમારું નામ, પિનકોડ અથવા ટ્રેકિંગ નંબર શોધો',
    allOrders: 'બધા ઓર્ડર', results: n => `${n} પરિણામ`,
    noOrders: 'હજી કોઈ ઓર્ડર નથી', checkBackSoon: 'મોકલ્યા પછી તમારો ઓર્ડર અહીં દેખાશે.',
    noResultsFor: q => `"${q}" માટે કંઈ મળ્યું નથી`, tryDifferent: 'સ્પેલિંગ તપાસો, અથવા તમારો પિનકોડ લખો.',
    trackParcel: 'ટ્રેક કરો', copy: 'કૉપી કરો', copied: 'કૉપી થયું', noTrackingYet: 'ટ્રેકિંગ નંબર જલ્દી આવશે',
    isNew: 'નવું', refreshError: 'રિફ્રેશ ન થયું. ઇન્ટરનેટ તપાસો.',
    tw: { name: 'નામ', pincode: 'પિનકોડ', tracking: 'ટ્રેકિંગ નંબર', order: 'ઓર્ડર ID' },
    ip: {
      title: 'India Post પર ટ્રેક કરો', copiedSub: 'તમારો ટ્રેકિંગ નંબર કૉપી થઈ ગયો છે.', copySub: 'પહેલા તમારો ટ્રેકિંગ નંબર કૉપી કરો.',
      open: 'India Post વેબસાઇટ ખોલો', step3: 'નંબર પેસ્ટ કરો, ચિત્રમાં દેખાતો કોડ લખો, અને Search દબાવો.', close: 'બંધ કરો',
    },
  },
  ta: {
    orderTracking: 'ஆர்டர் டிராக்கிங்', refresh: 'புதுப்பி', updating: 'புதுப்பிக்கிறது…', language: 'மொழி',
    searchPlaceholder: 'உங்கள் பெயர், பின்கோடு அல்லது டிராக்கிங் எண்ணைத் தேடுங்கள்',
    allOrders: 'அனைத்து ஆர்டர்கள்', results: n => `${n} முடிவுகள்`,
    noOrders: 'இன்னும் ஆர்டர்கள் இல்லை', checkBackSoon: 'அனுப்பிய பிறகு உங்கள் ஆர்டர் இங்கே தெரியும்.',
    noResultsFor: q => `"${q}" க்கு எதுவும் கிடைக்கவில்லை`, tryDifferent: 'எழுத்துகளைச் சரிபாருங்கள், அல்லது பின்கோடைத் தேடுங்கள்.',
    trackParcel: 'டிராக் செய்', copy: 'நகலெடு', copied: 'நகலெடுக்கப்பட்டது', noTrackingYet: 'டிராக்கிங் எண் விரைவில் வரும்',
    isNew: 'புதிது', refreshError: 'புதுப்பிக்க முடியவில்லை. இணையத்தைச் சரிபாருங்கள்.',
    tw: { name: 'பெயர்', pincode: 'பின்கோடு', tracking: 'டிராக்கிங் எண்', order: 'ஆர்டர் ID' },
    ip: {
      title: 'India Post-இல் டிராக் செய்யுங்கள்', copiedSub: 'உங்கள் டிராக்கிங் எண் நகலெடுக்கப்பட்டது.', copySub: 'முதலில் உங்கள் டிராக்கிங் எண்ணை நகலெடுங்கள்.',
      open: 'India Post இணையதளத்தைத் திறக்கவும்', step3: 'எண்ணை ஒட்டவும், படத்தில் உள்ள குறியீட்டை டைப் செய்யவும், Search அழுத்தவும்.', close: 'மூடு',
    },
  },
  te: {
    orderTracking: 'ఆర్డర్ ట్రాకింగ్', refresh: 'రిఫ్రెష్', updating: 'అప్‌డేట్ అవుతోంది…', language: 'భాష',
    searchPlaceholder: 'మీ పేరు, పిన్‌కోడ్ లేదా ట్రాకింగ్ నంబర్ వెతకండి',
    allOrders: 'అన్ని ఆర్డర్లు', results: n => `${n} ఫలితాలు`,
    noOrders: 'ఇంకా ఆర్డర్లు లేవు', checkBackSoon: 'పంపిన తర్వాత మీ ఆర్డర్ ఇక్కడ కనిపిస్తుంది.',
    noResultsFor: q => `"${q}" కోసం ఏమీ దొరకలేదు`, tryDifferent: 'స్పెల్లింగ్ చూడండి, లేదా మీ పిన్‌కోడ్ ఇవ్వండి.',
    trackParcel: 'ట్రాక్ చేయండి', copy: 'కాపీ చేయండి', copied: 'కాపీ అయింది', noTrackingYet: 'ట్రాకింగ్ నంబర్ త్వరలో వస్తుంది',
    isNew: 'కొత్తది', refreshError: 'రిఫ్రెష్ కాలేదు. ఇంటర్నెట్ చూడండి.',
    tw: { name: 'పేరు', pincode: 'పిన్‌కోడ్', tracking: 'ట్రాకింగ్ నంబర్', order: 'ఆర్డర్ ID' },
    ip: {
      title: 'India Post లో ట్రాక్ చేయండి', copiedSub: 'మీ ట్రాకింగ్ నంబర్ కాపీ అయింది.', copySub: 'ముందుగా మీ ట్రాకింగ్ నంబర్ కాపీ చేయండి.',
      open: 'India Post వెబ్‌సైట్ తెరవండి', step3: 'నంబర్ పేస్ట్ చేసి, చిత్రంలో కనిపించే కోడ్ టైప్ చేసి, Search నొక్కండి.', close: 'మూసివేయండి',
    },
  },
  kn: {
    orderTracking: 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್', refresh: 'ರಿಫ್ರೆಶ್', updating: 'ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತಿದೆ…', language: 'ಭಾಷೆ',
    searchPlaceholder: 'ನಿಮ್ಮ ಹೆಸರು, ಪಿನ್‌ಕೋಡ್ ಅಥವಾ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ ಹುಡುಕಿ',
    allOrders: 'ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು', results: n => `${n} ಫಲಿತಾಂಶಗಳು`,
    noOrders: 'ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ', checkBackSoon: 'ಕಳುಹಿಸಿದ ನಂತರ ನಿಮ್ಮ ಆರ್ಡರ್ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    noResultsFor: q => `"${q}" ಗೆ ಏನೂ ಸಿಗಲಿಲ್ಲ`, tryDifferent: 'ಸ್ಪೆಲ್ಲಿಂಗ್ ನೋಡಿ, ಅಥವಾ ನಿಮ್ಮ ಪಿನ್‌ಕೋಡ್ ಹಾಕಿ.',
    trackParcel: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', copy: 'ಕಾಪಿ ಮಾಡಿ', copied: 'ಕಾಪಿ ಆಯಿತು', noTrackingYet: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತದೆ',
    isNew: 'ಹೊಸದು', refreshError: 'ರಿಫ್ರೆಶ್ ಆಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ನೋಡಿ.',
    tw: { name: 'ಹೆಸರು', pincode: 'ಪಿನ್‌ಕೋಡ್', tracking: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ', order: 'ಆರ್ಡರ್ ID' },
    ip: {
      title: 'India Post ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', copiedSub: 'ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ ಕಾಪಿ ಆಗಿದೆ.', copySub: 'ಮೊದಲು ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ ಕಾಪಿ ಮಾಡಿ.',
      open: 'India Post ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ', step3: 'ಸಂಖ್ಯೆಯನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ, ಚಿತ್ರದಲ್ಲಿರುವ ಕೋಡ್ ಟೈಪ್ ಮಾಡಿ, Search ಒತ್ತಿ.', close: 'ಮುಚ್ಚಿ',
    },
  },
  ml: {
    orderTracking: 'ഓർഡർ ട്രാക്കിംഗ്', refresh: 'പുതുക്കുക', updating: 'പുതുക്കുന്നു…', language: 'ഭാഷ',
    searchPlaceholder: 'നിങ്ങളുടെ പേര്, പിൻകോഡ് അല്ലെങ്കിൽ ട്രാക്കിംഗ് നമ്പർ തിരയുക',
    allOrders: 'എല്ലാ ഓർഡറുകളും', results: n => `${n} ഫലങ്ങൾ`,
    noOrders: 'ഇതുവരെ ഓർഡറുകളൊന്നുമില്ല', checkBackSoon: 'അയച്ചുകഴിഞ്ഞാൽ നിങ്ങളുടെ ഓർഡർ ഇവിടെ കാണാം.',
    noResultsFor: q => `"${q}" എന്നതിന് ഒന്നും കണ്ടെത്തിയില്ല`, tryDifferent: 'സ്പെല്ലിംഗ് നോക്കുക, അല്ലെങ്കിൽ പിൻകോഡ് നൽകുക.',
    trackParcel: 'ട്രാക്ക് ചെയ്യുക', copy: 'കോപ്പി ചെയ്യുക', copied: 'കോപ്പി ചെയ്തു', noTrackingYet: 'ട്രാക്കിംഗ് നമ്പർ ഉടൻ വരും',
    isNew: 'പുതിയത്', refreshError: 'പുതുക്കാനായില്ല. ഇന്റർനെറ്റ് പരിശോധിക്കുക.',
    tw: { name: 'പേര്', pincode: 'പിൻകോഡ്', tracking: 'ട്രാക്കിംഗ് നമ്പർ', order: 'ഓർഡർ ID' },
    ip: {
      title: 'India Post-ൽ ട്രാക്ക് ചെയ്യുക', copiedSub: 'നിങ്ങളുടെ ട്രാക്കിംഗ് നമ്പർ കോപ്പി ചെയ്തു.', copySub: 'ആദ്യം ട്രാക്കിംഗ് നമ്പർ കോപ്പി ചെയ്യുക.',
      open: 'India Post വെബ്സൈറ്റ് തുറക്കുക', step3: 'നമ്പർ പേസ്റ്റ് ചെയ്യുക, ചിത്രത്തിലെ കോഡ് ടൈപ്പ് ചെയ്യുക, Search അമർത്തുക.', close: 'അടയ്ക്കുക',
    },
  },
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// The sheet sends dates like "14 Oct". Show them in the customer's language.
export function localDay(s, lang) {
  const m = String(s || '').trim().match(/^(\d{1,2})\s+([A-Za-z]{3})/);
  const L = LANGS.find(l => l.code === lang);
  if (!m || !L || lang === 'en') return s;
  const mi = MONTHS.indexOf(m[2].toLowerCase());
  if (mi < 0) return s;
  try {
    return new Intl.DateTimeFormat(L.locale, { day: 'numeric', month: 'short' }).format(new Date(new Date().getFullYear(), mi, Number(m[1])));
  } catch { return s; }
}

// Saved choice first, then the phone's own language, then English.
// The key 'eot_lang' is the one older pages used, so returning customers keep their pick.
// Embedded copies (the homepage phones) start in English and don't touch the page.
export function useLang({ embedded = false } = {}) {
  const [lang, setLangState] = useState('en');
  useEffect(() => {
    if (embedded) return;
    let pick = null;
    try { pick = localStorage.getItem('eot_lang'); } catch { /* storage blocked */ }
    if (!T[pick]) {
      const prefs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
      pick = prefs.map(p => String(p).slice(0, 2).toLowerCase()).find(c => T[c]) || 'en';
    }
    setLangState(pick);
  }, []);
  useEffect(() => {
    if (embedded) return;
    try { document.documentElement.lang = lang; } catch { /* ignore */ }
  }, [lang, embedded]);
  const setLang = code => {
    if (!T[code]) return;
    setLangState(code);
    if (embedded) return;
    try { localStorage.setItem('eot_lang', code); } catch { /* storage blocked */ }
  };
  return [lang, setLang];
}
