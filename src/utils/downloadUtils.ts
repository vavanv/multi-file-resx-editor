import { GridRow } from '../types/resx';
import { buildResxFile } from './xmlParser';

/**
 * Triggers a download of a RESX file with the given rows and filename
 */
export function downloadResxFile(rows: GridRow[], fileName: string): void {
  try {
    // Convert GridRow[] to ResxData format
    const resxData = {
      entries: rows.map(row => ({
        name: row.name,
        value: row.value,
        comment: row.comment || '',
      })),
    };

    // Build the XML content
    const xmlContent = buildResxFile(resxData);

    // Create blob and download
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded: ${fileName}`);
  } catch (error) {
    console.error('❌ Download failed:', error);
    alert(`Failed to download ${fileName}. Please try again.`);
  }
}

/**
 * Downloads all modified files in a batch
 */
export function downloadAllModifiedFiles(
  tabs: Array<{
    id: string;
    fileName: string;
    originalFileName: string;
    rows: GridRow[];
    hasChanges: boolean;
  }>,
): void {
  const modifiedTabs = tabs.filter(tab => tab.hasChanges);

  if (modifiedTabs.length === 0) {
    alert('No modified files to download.');
    return;
  }

  console.log(`📦 Downloading ${modifiedTabs.length} modified files...`);

  // Download each modified file with a small delay to prevent browser blocking
  modifiedTabs.forEach((tab, index) => {
    setTimeout(() => {
      downloadResxFile(tab.rows, tab.originalFileName);
    }, index * 100); // 100ms delay between downloads
  });
}

/**
 * Shows a confirmation dialog for downloading modified files
 */
export function confirmAndDownloadModified(
  tabs: Array<{
    id: string;
    fileName: string;
    originalFileName: string;
    rows: GridRow[];
    hasChanges: boolean;
  }>,
): boolean {
  const modifiedTabs = tabs.filter(tab => tab.hasChanges);

  if (modifiedTabs.length === 0) {
    alert('No modified files to download.');
    return false;
  }

  const fileNames = modifiedTabs.map(tab => tab.fileName).join('\n• ');
  const confirmed = window.confirm(
    `Download ${modifiedTabs.length} modified file(s)?\n\n• ${fileNames}\n\nThis will download the files to your default download folder.`,
  );

  if (confirmed) {
    downloadAllModifiedFiles(tabs);
  }

  return confirmed;
}
