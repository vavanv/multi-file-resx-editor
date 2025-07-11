import React from "react";
import { Tabs, Tab, Box, Typography, Paper, Chip } from "@mui/material";
import { FiberManualRecord, Language, Folder } from "@mui/icons-material";
import { FileGroup } from "../types/resx";

interface FileGroupTabsProps {
  groups: FileGroup[];
  activeGroupId: string | null;
  onGroupChange: (groupId: string) => void;
}

export const FileGroupTabs: React.FC<FileGroupTabsProps> = ({
  groups,
  activeGroupId,
  onGroupChange,
}) => {
  if (groups.length === 0) {
    return null;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    onGroupChange(newValue);
  };

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Tabs
        value={activeGroupId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTab-root": {
            minHeight: 56,
            textTransform: "none",
            maxWidth: 350,
          },
        }}
      >
        {groups.map((group) => {
          const hasChanges = group.files.some((file) => file.hasChanges);
          const fileCount = group.files.length;

          return (
            <Tab
              key={group.id}
              value={group.id}
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ minWidth: 0 }}
                >
                  <Folder sx={{ fontSize: 18, color: "primary.main" }} />
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        fontWeight: 500,
                      }}
                    >
                      {group.baseFileName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Chip
                        label={`${fileCount} file${fileCount > 1 ? "s" : ""}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 16,
                          fontSize: "0.65rem",
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                      {fileCount > 1 && (
                        <Language
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        />
                      )}
                    </Box>
                  </Box>
                  {hasChanges && (
                    <FiberManualRecord
                      sx={{
                        fontSize: 8,
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
