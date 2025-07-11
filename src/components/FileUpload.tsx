import React, { useRef } from 'react';
import { Button, Box, Typography, Paper, Chip } from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

interface FileUploadProps {
  onBatchFileUpload: (files: { content: string, fileName: string }[]) => void;
  onUploadStart: () => void;
  uploadedFileCount: number;
  onDebugClick: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onBatchFileUpload,
  onUploadStart,
  uploadedFileCount,
  onDebugClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('🚀 === FILE UPLOAD STARTED ===');
    console.log('📁 Total files selected:', files?.length || 0);

    if (files && files.length > 0) {
      // Reset previous session data before processing new files
      console.log('🔄 Resetting previous session data...');
      onUploadStart();

      console.log('📋 Selected files:');
      const fileArray = Array.from(files);
      const results: { content: string, fileName: string }[] = [];
      let filesRead = 0;
      fileArray.forEach((file, idx) => {
        console.log(`📤 Processing file ${idx + 1}/${files.length}: ${file.name}`);
        if (file.name.endsWith('.resx')) {
          console.log('✅ Valid .resx file, reading content...');
          const reader = new FileReader();
          reader.onload = e => {
            console.log(`📖 File content loaded for: ${file.name}`);
            const content = e.target?.result as string;
            console.log(`📏 Content length: ${content?.length || 0} characters`);
            console.log(`🔤 Content preview: ${content?.substring(0, 200)}...`);
            results[idx] = { content, fileName: file.name };
            filesRead++;
            if (filesRead === fileArray.length) {
              onBatchFileUpload(results.filter(Boolean));
            }
          };
          reader.onerror = error => {
            console.error(`❌ FileReader error for ${file.name}:`, error);
            results[idx] = { content: '', fileName: file.name };
            filesRead++;
            if (filesRead === fileArray.length) {
              onBatchFileUpload(results.filter(Boolean));
            }
          };
          reader.readAsText(file);
        } else {
          console.log(`❌ Invalid file type: ${file.name} (not .resx)`);
          alert(`${file.name} is not a valid .resx file`);
          results[idx] = { content: '', fileName: file.name };
          filesRead++;
          if (filesRead === fileArray.length) {
            onBatchFileUpload(results.filter(Boolean));
          }
        }
      });
    } else {
      console.log('❌ No files selected');
    }

    // Reset the input to allow uploading the same file again
    event.target.value = '';
    console.log('🔄 File input reset');
  };

  const handleButtonClick = () => {
    console.log('🖱️ Upload button clicked');
    fileInputRef.current?.click();
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 500 }}>
            Upload Files
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept=".resx"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            size="medium"
          >
            Select .resx Files
          </Button>

          <Button
            variant="outlined"
            onClick={onUploadStart}
            size="medium"
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              '&:hover': {
                borderColor: '#b91c1c',
                backgroundColor: 'rgba(220, 38, 38, 0.04)',
              },
            }}
          >
            Clear selection
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {uploadedFileCount > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Description color="success" fontSize="small" />
              <Chip
                label={`${uploadedFileCount} file${uploadedFileCount > 1 ? 's' : ''} loaded`}
                color="success"
                variant="outlined"
                size="small"
                onClick={onDebugClick}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Multiple files supported • File grouping enabled
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
