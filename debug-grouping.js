// Debug script to test file grouping logic
const {
  parseFileName,
  groupFilesByBaseName,
} = require("./src/utils/fileGrouping.ts");

// Test data - simulating the files you're uploading
const testFiles = [
  { fileName: "Resources.resx", id: "tab-1" },
  { fileName: "Resources.en.resx", id: "tab-2" },
  { fileName: "Resources.fr.resx", id: "tab-3" },
  { fileName: "Messages.resx", id: "tab-4" },
  { fileName: "Messages.de.resx", id: "tab-5" },
];

console.log("=== TESTING FILENAME PARSING ===");
testFiles.forEach((file) => {
  const result = parseFileName(file.fileName);
  console.log(
    `${file.fileName} -> baseFileName: "${result.baseFileName}", language: "${result.language}"`
  );
});

console.log("\n=== TESTING FILE GROUPING ===");
// Create mock FileTab objects
const mockTabs = testFiles.map((file) => {
  const { baseFileName, language } = parseFileName(file.fileName);
  return {
    id: file.id,
    fileName: file.fileName,
    originalFileName: file.fileName,
    rows: [],
    hasChanges: false,
    baseFileName,
    language,
  };
});

console.log(
  "Mock tabs:",
  mockTabs.map((t) => ({
    fileName: t.fileName,
    baseFileName: t.baseFileName,
    language: t.language,
  }))
);

const groups = groupFilesByBaseName(mockTabs);
console.log(
  "\nGenerated groups:",
  groups.map((g) => ({
    id: g.id,
    baseFileName: g.baseFileName,
    fileCount: g.files.length,
    files: g.files.map((f) => ({ fileName: f.fileName, language: f.language })),
  }))
);
