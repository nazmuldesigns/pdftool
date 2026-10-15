import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'bn';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.allTools': 'All Tools',
    'nav.searchPlaceholder': "Search all 30+ PDF tools... (Press '/' to focus)",
    'nav.recentHistory': 'Recent Documents & Task History',
    'nav.installApp': 'Install App',
    'nav.offlineActive': 'Offline Active',
    'nav.userAccount': 'User Account & Cloud Sync',

    // Hero
    'hero.badge': 'Private, Client-First Document Architecture',
    'hero.title': 'Every tool you need to work with PDFs in one place.',
    'hero.subtitle': 'High-speed, private, zero document leakage. Merge, split, compress, watermark, rotate, and convert directly in your browser.',
    'hero.clientSide': '100% Client-Side Processing',
    'hero.instant': 'Instant Execution • No Waiting',
    'hero.noLimits': 'No Limits • No Registration Needed',

    // Categories
    'category.all': 'All Tools',
    'category.core': 'Core PDF',
    'category.organization': 'Organization',
    'category.optimization': 'Optimization',
    'category.security': 'Security',
    'category.editing': 'Editing & Markup',
    'category.convert-to-pdf': 'Convert to PDF',
    'category.convert-from-pdf': 'Convert from PDF',
    'category.creation': 'PDF Creation',
    'category.viewing': 'Viewing & Inspection',
    'category.signing': 'Signatures',
    'category.invoice': 'Invoicing & Business',
    'category.image-conversion': 'Image Conversion',

    // Section Titles
    'section.popular': 'Frequently Used Tools',
    'section.allTools': 'Complete Tools Directory',
    'section.noResults': 'No matching tools found',
    'section.resetFilters': 'Reset Filters',

    // Tool Workspace
    'workspace.back': 'Back to Tools',
    'workspace.dropzoneTitle': 'Choose files or drag & drop them here',
    'workspace.selectFile': 'Select File',
    'workspace.selectFiles': 'Select Files',
    'workspace.configureOptions': 'Configure Options',
    'workspace.execute': 'Execute',
    'workspace.complete': 'Processing Complete!',
    'workspace.saveAs': 'Save As:',
    'workspace.download': 'Download',
    'workspace.downloadAllZip': 'Download All Images (.ZIP)',
    'workspace.saveToCloud': 'Save to Cloud',
    'workspace.savedToCloud': 'Saved to Documents',
    'workspace.processAnother': 'Process Another',
    'workspace.continueWith': 'Continue with this PDF in another tool:',
    'workspace.originalSize': 'Original Size',
    'workspace.optimizedSize': 'Optimized Size',
    'workspace.saved': 'Saved',

    // Signer
    'signer.step1Title': 'Create Your Electronic Signature',
    'signer.drawSignature': 'Draw Signature',
    'signer.typeSignature': 'Type Signature',
    'signer.clear': 'Clear',
    'signer.typePlaceholder': 'Type your name or initials (e.g. John Doe)',
    'signer.step2Title': 'Drag & Position Signature on Document',
    'signer.step2Desc': 'Click anywhere on the page to place your signature stamp.',
    'signer.presets': 'Quick Position Presets',
    'signer.bottomRight': 'Bottom Right (Contract Standard)',
    'signer.bottomLeft': 'Bottom Left',
    'signer.center': 'Page Center',
    'signer.stampSize': 'Signature Size (Width)',
    'signer.dateStamp': 'Append Date Stamp Under Signature',
    'signer.changeDoc': 'Change Document',
    'signer.page': 'Page',
    'signer.of': 'of',
    'signer.lastPage': '(Last Page)',
    'signer.clickToMove': 'Click to move signature',
    'signer.rendering': 'Rendering document page...',
    'signer.padNote': 'Electronic signature will be embedded cleanly into the generated PDF.',

    // Footer
    'footer.privacyFirst': 'Privacy First • Safe & Secure',
    'footer.privacyDesc': 'Your files are processed directly inside your browser. No files are uploaded to any external server.',
    'footer.directContact': 'Direct Contact:',
    'footer.engineeredBy': 'Engineered by',
    'footer.rights': 'Private & Client-First.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.faq': 'FAQ'
  },
  bn: {
    // Header
    'nav.allTools': 'সব টুলস',
    'nav.searchPlaceholder': "সব ৩০+ PDF টুলস খুঁজুন... ('/' চাপুন)",
    'nav.recentHistory': 'সাম্প্রতিক ফাইল ও কাজের ইতিহাস',
    'nav.installApp': 'অ্যাপ ইনস্টল করুন',
    'nav.offlineActive': 'অফলাইন সক্রিয়',
    'nav.userAccount': 'ইউজার অ্যাকাউন্ট ও ক্লাউড সিঙ্ক',

    // Hero
    'hero.badge': '১০০% নিরাপদ ও ক্লায়েন্ট-ফার্স্ট প্রসেসিং',
    'hero.title': 'PDF নিয়ে কাজ করার প্রয়োজনীয় সব টুলস এক জায়গায়।',
    'hero.subtitle': 'তাত্ক্ষণিক গতি, সম্পূর্ণ ব্যক্তিগত ও ফাইল সুরক্ষার নিশ্চয়তা। মার্জ, স্প্লিট, কম্প্রেস, ওয়াটারমার্ক, রোটেট এবং কনভার্ট করুন সরাসরি আপনার ব্রাউজারে।',
    'hero.clientSide': '১০০% ব্রাউজার প্রসেসিং',
    'hero.instant': 'তাত্ক্ষণিক কাজ • কোনো অপেক্ষা ছাড়া',
    'hero.noLimits': 'আনলিমিটেড ফ্রি • কোনো রেজিস্ট্রেশন ছাড়া',

    // Categories
    'category.all': 'সব টুলস',
    'category.core': 'কোর PDF',
    'category.organization': 'পেজ ব্যবস্থাপনা',
    'category.optimization': 'অপ্টিমাইজেশন',
    'category.security': 'নিরাপত্তা',
    'category.editing': 'এডিটিং ও মার্কআপ',
    'category.convert-to-pdf': 'PDF-এ রূপান্তর',
    'category.convert-from-pdf': 'PDF থেকে রূপান্তর',
    'category.creation': 'PDF তৈরি',
    'category.viewing': 'ভিউ ও পরিদর্শন',
    'category.signing': 'ডিজিটাল স্বাক্ষর',
    'category.invoice': 'ইনভয়েস ও ব্যবসা',
    'category.image-conversion': 'ইমেজ রূপান্তর',

    // Section Titles
    'section.popular': 'জনপ্রিয় ও প্রয়োজনীয় টুলস',
    'section.allTools': 'সম্পূর্ণ টুলস ডিরেক্টরি',
    'section.noResults': 'কোনো টুল পাওয়া যায়নি',
    'section.resetFilters': 'ফিল্টার রিসেট করুন',

    // Tool Workspace
    'workspace.back': 'টুলস তালিকায় ফিরুন',
    'workspace.dropzoneTitle': 'ফাইল নির্বাচন করুন অথবা টেনে এনে ছেড়ে দিন',
    'workspace.selectFile': 'ফাইল নির্বাচন করুন',
    'workspace.selectFiles': 'ফাইলসমূহ নির্বাচন করুন',
    'workspace.configureOptions': 'অপশন কনফিগার করুন',
    'workspace.execute': 'কাজ শুরু করুন',
    'workspace.complete': 'কাজ সফলভাবে সম্পন্ন হয়েছে!',
    'workspace.saveAs': 'ফাইলের নাম:',
    'workspace.download': 'ডাউনলোড',
    'workspace.downloadAllZip': 'সব ছবি একসাথে ডাউনলোড (.ZIP)',
    'workspace.saveToCloud': 'ক্লাউডে সংরক্ষণ',
    'workspace.savedToCloud': 'সংরক্ষিত হয়েছে',
    'workspace.processAnother': 'নতুন ফাইল প্রসেস করুন',
    'workspace.continueWith': 'এই PDF নিয়ে সরাসরি অন্য টুলে কাজ করুন:',
    'workspace.originalSize': 'আসল সাইজ',
    'workspace.optimizedSize': 'অপ্টিমাইজড সাইজ',
    'workspace.saved': 'সাশ্রয়',

    // Signer
    'signer.step1Title': 'আপনার ডিজিটাল স্বাক্ষর তৈরি করুন',
    'signer.drawSignature': 'স্বাক্ষর আঁকুন',
    'signer.typeSignature': 'টাইপ করে স্বাক্ষর',
    'signer.clear': 'মুছে ফেলুন',
    'signer.typePlaceholder': 'আপনার নাম বা আদ্যক্ষর লিখুন (যেমনঃ মোঃ নাজমুল হাসান)',
    'signer.step2Title': 'ডকুমেন্টে স্বাক্ষরের স্থান নির্ধারণ করুন',
    'signer.step2Desc': 'ডকুমেন্টের যেকোনো স্থানে ক্লিক করে স্বাক্ষর বসান।',
    'signer.presets': 'কুইক পজিশন প্রিসেট',
    'signer.bottomRight': 'নিচে ডানপাশে (কন্ট্রাক্ট স্ট্যান্ডার্ড)',
    'signer.bottomLeft': 'নিচে বামপাশে',
    'signer.center': 'পেজের মাঝে',
    'signer.stampSize': 'স্বাক্ষরের সাইজ (প্রস্থ)',
    'signer.dateStamp': 'স্বাক্ষরের নিচে তারিখ যুক্ত করুন',
    'signer.changeDoc': 'ডকুমেন্ট পরিবর্তন করুন',
    'signer.page': 'পেজ',
    'signer.of': 'এর',
    'signer.lastPage': '(শেষ পেজ)',
    'signer.clickToMove': 'স্বাক্ষর সরাতে ক্লিক করুন',
    'signer.rendering': 'ডকুমেন্ট পেজ রেন্ডার হচ্ছে...',
    'signer.padNote': 'ডিজিটাল স্বাক্ষরটি জেনারেট করা PDF-এ নিখুঁতভাবে যুক্ত হবে।',

    // Footer
    'footer.privacyFirst': 'নিরাপত্তা সবার আগে • ১০০% সুরক্ষিত',
    'footer.privacyDesc': 'আপনার ফাইলগুলো সরাসরি আপনার ডিভাইসের ব্রাউজারে প্রসেস হয়। কোনো ফাইল কখনোই বাইরের সার্ভারে আপলোড হয় না।',
    'footer.directContact': 'সরাসরি যোগাযোগ:',
    'footer.engineeredBy': 'ডেভেলপ করেছেন',
    'footer.rights': 'ব্যক্তিগত ও সম্পূর্ণ ক্লায়েন্ট-ফার্স্ট।',
    'footer.privacy': 'গোপনীয়তা নীতি',
    'footer.terms': 'শর্তাবলী',
    'footer.faq': 'সাধারণ জিজ্ঞাসা'
  }
};

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pdf-toolbox-lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('pdf-toolbox-lang', lang);
    } catch {}
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useI18n = () => useContext(I18nContext);
