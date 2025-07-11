import { FileTab, FileGroup } from "../types/resx";

/**
 * Extracts the base filename and language code from a RESX filename
 * Examples:
 * - "Resources.resx" -> { baseFileName: "Resources", language: "default" }
 * - "Resources.en-US.resx" -> { baseFileName: "Resources", language: "en-US" }
 * - "Messages.fr-FR.resx" -> { baseFileName: "Messages", language: "fr-FR" }
 * - "App_Resources.en.resx" -> { baseFileName: "App_Resources", language: "en" }
 * - "MyApp.Resources.de.resx" -> { baseFileName: "MyApp.Resources", language: "de" }
 */
export function parseFileName(fileName: string): {
  baseFileName: string;
  language: string;
} {
  console.log("🔍 === PARSING FILENAME ===");
  console.log("📝 Input filename:", fileName);

  // Remove .resx extension (case insensitive)
  const nameWithoutExt = fileName.replace(/\.resx$/i, "");
  console.log("📝 Name without extension:", nameWithoutExt);

  // Split by dots to analyze the structure
  const parts = nameWithoutExt.split(".");
  console.log("🔧 Split parts:", parts);

  if (parts.length === 1) {
    // No dots, just the base name
    const result = {
      baseFileName: parts[0],
      language: "default",
    };
    console.log("✅ Single part result:", result);
    return result;
  }

  // Check if the last part looks like a language code
  const lastPart = parts[parts.length - 1];
  console.log("🔍 Checking last part for language:", lastPart);

  // Enhanced language pattern matching
  const languagePatterns = [
    /^[a-z]{2}$/i, // Two letter: en, fr, de
    /^[a-z]{2}-[A-Z]{2}$/, // Four letter: en-US, fr-FR
    /^[a-z]{2}-[A-Z]{2,4}$/, // Extended: en-US, zh-Hans
    /^[a-z]{3}$/i, // Three letter: eng, fra
    /^[a-z]{2,3}-[a-z]{2,4}$/i, // Mixed case variations
  ];

  const isLanguageCode = languagePatterns.some((pattern) =>
    pattern.test(lastPart)
  );
  console.log("🎯 Is language code?", isLanguageCode, "for:", lastPart);

  if (isLanguageCode) {
    // Last part is a language code
    const baseFileName = parts.slice(0, -1).join(".");
    const result = {
      baseFileName,
      language: lastPart,
    };
    console.log("✅ Language found result:", result);
    return result;
  }

  // Check for underscore separator patterns
  const underscoreParts = nameWithoutExt.split("_");
  console.log("🔧 Underscore split parts:", underscoreParts);

  if (underscoreParts.length > 1) {
    const lastUnderscorePart = underscoreParts[underscoreParts.length - 1];
    console.log(
      "🔍 Checking last underscore part for language:",
      lastUnderscorePart
    );

    const isUnderscoreLanguageCode = languagePatterns.some((pattern) =>
      pattern.test(lastUnderscorePart)
    );
    console.log(
      "🎯 Is underscore language code?",
      isUnderscoreLanguageCode,
      "for:",
      lastUnderscorePart
    );

    if (isUnderscoreLanguageCode) {
      const baseFileName = underscoreParts.slice(0, -1).join("_");
      const result = {
        baseFileName,
        language: lastUnderscorePart,
      };
      console.log("✅ Underscore language found result:", result);
      return result;
    }
  }

  // No language code found, treat entire name as base
  const result = {
    baseFileName: nameWithoutExt,
    language: "default",
  };
  console.log("🔄 No language match, using default result:", result);
  return result;
}

/**
 * Groups file tabs by their base filename
 */
export function groupFilesByBaseName(tabs: FileTab[]): FileGroup[] {
  console.log("🗂️ === STARTING FILE GROUPING ===");
  console.log(
    "📥 Input tabs:",
    tabs.map((t) => ({
      id: t.id,
      fileName: t.fileName,
      baseFileName: t.baseFileName,
      language: t.language,
    }))
  );

  const groups = new Map<string, FileTab[]>();

  // Group tabs by base filename
  tabs.forEach((tab, index) => {
    console.log(
      `\n📁 Processing tab ${index + 1}/${tabs.length}: ${tab.fileName}`
    );

    // Use existing baseFileName and language from tab, or parse if missing
    let baseFileName = tab.baseFileName;
    let language = tab.language;

    if (!baseFileName || !language) {
      console.log(`⚠️ Missing baseFileName or language, parsing filename...`);
      const parsed = parseFileName(tab.fileName);
      baseFileName = parsed.baseFileName;
      language = parsed.language;
    }

    console.log(`📊 Using: base="${baseFileName}", language="${language}"`);

    // Ensure the tab has the correct properties
    const updatedTab = {
      ...tab,
      baseFileName,
      language,
    };

    if (!groups.has(baseFileName)) {
      groups.set(baseFileName, []);
      console.log(`🆕 Created new group for: "${baseFileName}"`);
    }

    const currentGroup = groups.get(baseFileName)!;
    currentGroup.push(updatedTab);
    console.log(
      `➕ Added file to group "${baseFileName}". Group now has ${currentGroup.length} files`
    );
    console.log(
      `📋 Current group files:`,
      currentGroup.map((f) => `${f.fileName} (${f.language})`)
    );
  });

  console.log("\n📊 === GROUPS SUMMARY ===");
  Array.from(groups.entries()).forEach(([key, files]) => {
    console.log(`📁 Group "${key}": ${files.length} files`);
    files.forEach((file, idx) => {
      console.log(
        `   ${idx + 1}. ${file.fileName} -> language: ${file.language}, id: ${
          file.id
        }`
      );
    });
  });

  // Convert to FileGroup array and sort files within each group
  const result = Array.from(groups.entries()).map(([baseFileName, files]) => {
    console.log(`\n🔄 Creating group object for "${baseFileName}"`);

    // Sort files: default first, then alphabetically by language
    const sortedFiles = files.sort((a, b) => {
      if (a.language === "default") return -1;
      if (b.language === "default") return 1;
      return (a.language || "").localeCompare(b.language || "");
    });

    console.log(
      `🔄 Sorted files for group "${baseFileName}":`,
      sortedFiles.map((f) => `${f.fileName} (${f.language})`)
    );

    const group: FileGroup = {
      id: `group-${baseFileName}`,
      baseFileName,
      files: sortedFiles,
      activeFileId: sortedFiles[0]?.id || null,
    };

    console.log(
      `✅ Created group "${group.id}" with ${group.files.length} files:`
    );
    group.files.forEach((f, idx) => {
      console.log(`   ${idx + 1}. ${f.fileName} (${f.language}) [ID: ${f.id}]`);
    });
    console.log(`🎯 Active file ID set to: ${group.activeFileId}`);

    return group;
  });

  console.log("\n🏁 === FINAL GROUPING RESULT ===");
  console.log(`📊 Total groups created: ${result.length}`);
  result.forEach((g, idx) => {
    console.log(
      `${idx + 1}. Group "${g.baseFileName}": ${
        g.files.length
      } files, active: ${g.activeFileId}`
    );
    g.files.forEach((f, fidx) => {
      console.log(`     ${fidx + 1}. ${f.fileName} (${f.language}) [${f.id}]`);
    });
  });

  return result;
}

/**
 * Gets a display name for a language code
 */
export function getLanguageDisplayName(language: string): string {
  const languageNames: Record<string, string> = {
    default: "Default",
    en: "English",
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    fr: "French",
    "fr-FR": "French (France)",
    "fr-CA": "French (Canada)",
    de: "German",
    "de-DE": "German (Germany)",
    es: "Spanish",
    "es-ES": "Spanish (Spain)",
    "es-MX": "Spanish (Mexico)",
    it: "Italian",
    "it-IT": "Italian (Italy)",
    pt: "Portuguese",
    "pt-BR": "Portuguese (Brazil)",
    "pt-PT": "Portuguese (Portugal)",
    ru: "Russian",
    "ru-RU": "Russian (Russia)",
    zh: "Chinese",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    ja: "Japanese",
    "ja-JP": "Japanese (Japan)",
    ko: "Korean",
    "ko-KR": "Korean (Korea)",
    ar: "Arabic",
    "ar-SA": "Arabic (Saudi Arabia)",
    hi: "Hindi",
    "hi-IN": "Hindi (India)",
    th: "Thai",
    "th-TH": "Thai (Thailand)",
    vi: "Vietnamese",
    "vi-VN": "Vietnamese (Vietnam)",
    nl: "Dutch",
    "nl-NL": "Dutch (Netherlands)",
    sv: "Swedish",
    "sv-SE": "Swedish (Sweden)",
    no: "Norwegian",
    "no-NO": "Norwegian (Norway)",
    da: "Danish",
    "da-DK": "Danish (Denmark)",
    fi: "Finnish",
    "fi-FI": "Finnish (Finland)",
    pl: "Polish",
    "pl-PL": "Polish (Poland)",
    cs: "Czech",
    "cs-CZ": "Czech (Czech Republic)",
    sk: "Slovak",
    "sk-SK": "Slovak (Slovakia)",
    hu: "Hungarian",
    "hu-HU": "Hungarian (Hungary)",
    ro: "Romanian",
    "ro-RO": "Romanian (Romania)",
    bg: "Bulgarian",
    "bg-BG": "Bulgarian (Bulgaria)",
    hr: "Croatian",
    "hr-HR": "Croatian (Croatia)",
    sr: "Serbian",
    "sr-RS": "Serbian (Serbia)",
    sl: "Slovenian",
    "sl-SI": "Slovenian (Slovenia)",
    et: "Estonian",
    "et-EE": "Estonian (Estonia)",
    lv: "Latvian",
    "lv-LV": "Latvian (Latvia)",
    lt: "Lithuanian",
    "lt-LT": "Lithuanian (Lithuania)",
    tr: "Turkish",
    "tr-TR": "Turkish (Turkey)",
    el: "Greek",
    "el-GR": "Greek (Greece)",
    he: "Hebrew",
    "he-IL": "Hebrew (Israel)",
    fa: "Persian",
    "fa-IR": "Persian (Iran)",
    ur: "Urdu",
    "ur-PK": "Urdu (Pakistan)",
    bn: "Bengali",
    "bn-BD": "Bengali (Bangladesh)",
    ta: "Tamil",
    "ta-IN": "Tamil (India)",
    te: "Telugu",
    "te-IN": "Telugu (India)",
    ml: "Malayalam",
    "ml-IN": "Malayalam (India)",
    kn: "Kannada",
    "kn-IN": "Kannada (India)",
    gu: "Gujarati",
    "gu-IN": "Gujarati (India)",
    pa: "Punjabi",
    "pa-IN": "Punjabi (India)",
    mr: "Marathi",
    "mr-IN": "Marathi (India)",
    or: "Odia",
    "or-IN": "Odia (India)",
    as: "Assamese",
    "as-IN": "Assamese (India)",
    ne: "Nepali",
    "ne-NP": "Nepali (Nepal)",
    si: "Sinhala",
    "si-LK": "Sinhala (Sri Lanka)",
    my: "Myanmar",
    "my-MM": "Myanmar (Myanmar)",
    km: "Khmer",
    "km-KH": "Khmer (Cambodia)",
    lo: "Lao",
    "lo-LA": "Lao (Laos)",
    ka: "Georgian",
    "ka-GE": "Georgian (Georgia)",
    am: "Amharic",
    "am-ET": "Amharic (Ethiopia)",
    sw: "Swahili",
    "sw-KE": "Swahili (Kenya)",
    zu: "Zulu",
    "zu-ZA": "Zulu (South Africa)",
    af: "Afrikaans",
    "af-ZA": "Afrikaans (South Africa)",
    is: "Icelandic",
    "is-IS": "Icelandic (Iceland)",
    mt: "Maltese",
    "mt-MT": "Maltese (Malta)",
    cy: "Welsh",
    "cy-GB": "Welsh (United Kingdom)",
    ga: "Irish",
    "ga-IE": "Irish (Ireland)",
    gd: "Scottish Gaelic",
    "gd-GB": "Scottish Gaelic (United Kingdom)",
    eu: "Basque",
    "eu-ES": "Basque (Spain)",
    ca: "Catalan",
    "ca-ES": "Catalan (Spain)",
    gl: "Galician",
    "gl-ES": "Galician (Spain)",
    br: "Breton",
    "br-FR": "Breton (France)",
    co: "Corsican",
    "co-FR": "Corsican (France)",
    oc: "Occitan",
    "oc-FR": "Occitan (France)",
    rm: "Romansh",
    "rm-CH": "Romansh (Switzerland)",
    lb: "Luxembourgish",
    "lb-LU": "Luxembourgish (Luxembourg)",
    fo: "Faroese",
    "fo-FO": "Faroese (Faroe Islands)",
    kl: "Greenlandic",
    "kl-GL": "Greenlandic (Greenland)",
    se: "Northern Sami",
    "se-NO": "Northern Sami (Norway)",
    smj: "Lule Sami",
    "smj-NO": "Lule Sami (Norway)",
    sma: "Southern Sami",
    "sma-NO": "Southern Sami (Norway)",
    smn: "Inari Sami",
    "smn-FI": "Inari Sami (Finland)",
    sms: "Skolt Sami",
    "sms-FI": "Skolt Sami (Finland)",
  };

  return languageNames[language] || language;
}

/**
 * Gets a short display name for subtabs
 */
export function getShortDisplayName(
  fileName: string,
  language: string
): string {
  // If it's default language, show just the filename without extension
  if (language === "default") {
    return fileName.replace(/\.resx$/i, "");
  }

  // For language files, show the language display name
  const displayName = getLanguageDisplayName(language);
  return displayName;
}
