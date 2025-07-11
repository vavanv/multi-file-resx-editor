import React, { useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { GridRow } from '../types/resx';
import { buildResxFile } from '../utils/xmlParser';

interface DownloadButtonProps {
  rows: GridRow[];
  fileName?: string;
  disabled?: boolean;
  onDownloaded?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  rows,
  fileName = 'modified.resx',
  disabled = false,
  onDownloaded,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDownloadClick = () => {
    if (rows.length === 0) return;
    setDialogOpen(true);
  };

  const handleConfirmDownload = () => {
    setDialogOpen(false);

    const resxData = {
      entries: rows.map(row => ({
        name: row.name,
        value: row.value,
        comment: row.comment || '',
      })),
    };

    const xmlContent = buildResxFile(resxData);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onDownloaded) onDownloaded();
  };

  const handleCancelDownload = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadClick}
          disabled={disabled}
          size="large"
          sx={{
            minWidth: 200,
            borderColor: 'success.main',
            color: 'success.main',
            '&:hover': {
              borderColor: 'success.dark',
              backgroundColor: 'rgba(76, 175, 80, 0.04)',
            },
          }}
        >
          Download Current File
        </Button>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCancelDownload}
        aria-labelledby="download-dialog-title"
        aria-describedby="download-dialog-description"
      >
        <DialogTitle id="download-dialog-title">Download File</DialogTitle>
        <DialogContent>
          <DialogContentText id="download-dialog-description">
            Download "{fileName}"?
            <br />
            <br />
            This will download the file to your default download folder. If a file with the same
            name already exists, your browser will handle the conflict according to your download
            settings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDownload} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDownload}
            variant="outlined"
            color="success"
            startIcon={<Download />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
