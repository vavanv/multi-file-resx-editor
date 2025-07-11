import React from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  IconButton, 
  Typography,
  Paper
} from '@mui/material';
import { Close, FiberManualRecord } from '@mui/icons-material';
import { FileTab } from '../types/resx';

interface FileTabsProps {
  tabs: FileTab[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose
}) => {
  if (tabs.length === 0) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  const handleCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    onTabClose(tabId);
  };

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Tabs
        value={activeTabId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            maxWidth: 300,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 200,
                  }}
                >
                  {tab.fileName}
                </Typography>
                {tab.hasChanges && (
                  <FiberManualRecord 
                    sx={{ 
                      fontSize: 8, 
                      color: 'warning.main',
                      ml: 0.5 
                    }} 
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  sx={{ 
                    ml: 0.5,
                    p: 0.25,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Paper>
  );
};