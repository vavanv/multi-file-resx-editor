import React from "react";
import { Tabs, Tab, Box, Typography, Paper, Chip } from "@mui/material";
import { FiberManualRecord, Language } from "@mui/icons-material";
import { FileTab } from "../types/resx";

interface FileSubTabsProps {
  files: FileTab[];
  activeFileId: string | null;
  onFileChange: (fileId: string) => void;
}

export const FileSubTabs: React.FC<FileSubTabsProps> = ({
  files,
  activeFileId,
  onFileChange,
}) => {
  console.log("🔄 === FILE SUB TABS RENDER ===");
  console.log(
    "📁 Files prop:",
    files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      language: f.language,
      hasChanges: f.hasChanges,
    }))
  );
  console.log("🎯 Active file ID:", activeFileId);

  if (files.length === 0) {
    console.log("❌ No files, not rendering subtabs");
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    console.log("🔄 Subtab changed to:", newValue);
    onFileChange(newValue);
  };

  console.log("✅ Rendering subtabs for", files.length, "files");

  return (
    <Paper elevation={0} sx={{ mb: 1, backgroundColor: "grey.50" }}>
      <Tabs
        value={activeFileId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            minHeight: 40,
            textTransform: "none",
            maxWidth: 300,
            fontSize: "0.875rem",
          },
          "& .MuiTabs-indicator": {
            height: 2,
          },
        }}
      >
        {files.map((file) => {
          console.log(
            `📋 Rendering tab for file: ${file.fileName}, language: ${file.language}`
          );

          return (
            <Tab
              key={file.id}
              value={file.id}
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ minWidth: 0 }}
                >
                  <Language sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    gap={0.2}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 150,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      {file.fileName}
                    </Typography>
                    <Chip
                      label={file.language || "default"}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 14,
                        fontSize: "0.6rem",
                        "& .MuiChip-label": { px: 0.3 },
                      }}
                    />
                  </Box>
                  {file.hasChanges && (
                    <FiberManualRecord
                      sx={{
                        fontSize: 6,
                        color: "warning.main",
                        ml: 0.5,
                      }}
                    />
                  )}
                </Box>
              }
            />
          );
        })}
      </Tabs>
    </Paper>
  );
};
