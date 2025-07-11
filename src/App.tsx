import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { FileUpload } from './components/FileUpload';
import { FileGroupTabs } from './components/FileGroupTabs';
import { FileSubTabs } from './components/FileSubTabs';
import { ResxDataGrid } from './components/ResxDataGrid';
import { DownloadButton } from './components/DownloadButton';
import { GridRow, FileTab, FileGroup } from './types/resx';
import { parseResxFile } from './utils/xmlParser';
import { groupFilesByBaseName, parseFileName } from './utils/fileGrouping';
import { downloadResxFile } from './utils/downloadUtils';
import { AddEntryDialog } from './components/AddEntryDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

function App() {
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [groups, setGroups] = useState<FileGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [rejectedFiles, setRejectedFiles] = useState<{ baseFileName: string, languageFile: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingAddEntry, setPendingAddEntry] = useState<null | { name: string; value: string; comment: string }>(null);
  const [multiAddDialogOpen, setMultiAddDialogOpen] = useState(false);
  const [multiAddSelectedIds, setMultiAddSelectedIds] = useState<string[]>([]);
  const [gridMenuAnchor, setGridMenuAnchor] = useState<null | { mouseX: number; mouseY: number }>(null);
  const [selectedRow, setSelectedRow] = useState<GridRow | null>(null);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<GridRow | null>(null);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [multiDeleteSelectedIds, setMultiDeleteSelectedIds] = useState<string[]>([]);

  const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Simple function to update groups from tabs
  const updateGroupsFromTabs = useCallback(
    (
      newTabs: FileTab[],
      preserveActive = false,
      preserveActiveGroupId?: string | null,
      preserveActiveFileId?: string | null
    ) => {
      console.log('🔄 === UPDATING GROUPS ===');
      console.log(
        '📥 Input tabs for grouping:',
        newTabs.map(t => ({
          id: t.id,
          fileName: t.fileName,
          baseFileName: t.baseFileName,
          language: t.language,
        })),
      );

      const newGroups = groupFilesByBaseName(newTabs);
      console.log(
        '📊 Generated groups result:',
        newGroups.map(g => ({
          id: g.id,
          baseFileName: g.baseFileName,
          fileCount: g.files.length,
          activeFileId: g.activeFileId,
          files: g.files.map(f => ({
            fileName: f.fileName,
            language: f.language,
            id: f.id,
          })),
        })),
      );

      setGroups(newGroups);

      // Update active selections if needed
      if (newGroups.length === 0) {
        setActiveGroupId(null);
        setActiveFileId(null);
      } else if (!preserveActive) {
        // Always set the first group as active when groups are updated (unless preserving)
        const firstGroup = newGroups[0];
        setActiveGroupId(firstGroup.id);
        setActiveFileId(firstGroup.activeFileId);
      } else {
        const groupId = preserveActiveGroupId;
        const fileId = preserveActiveFileId;
        const stillValidGroup = newGroups.find(g => g.id === groupId);
        if (!stillValidGroup) {
          setActiveGroupId(newGroups[0].id);
          setActiveFileId(newGroups[0].activeFileId);
        } else {
          const stillValidFile = stillValidGroup.files.find(f => f.id === fileId);
          setActiveGroupId(stillValidGroup.id);
          if (!stillValidFile) {
            setActiveFileId(stillValidGroup.activeFileId);
          } else {
            setActiveFileId(stillValidFile.id);
          }
        }
      }
      return newGroups;
    },
    []
  );

  const handleUploadStart = useCallback(() => {
    console.log('🔄 === RESETTING SESSION ===');
    console.log('🗑️ Clearing all tabs, groups, and active selections...');

    setTabs([]);
    setGroups([]);
    setActiveGroupId(null);
    setActiveFileId(null);
    setError('');
    setRejectedFiles([]);

    console.log('✅ Session reset completed');
  }, []);

  const handleDebugClick = useCallback(() => {
    setDebugDialogOpen(true);
  }, []);

  const handleDebugClose = useCallback(() => {
    setDebugDialogOpen(false);
  }, []);

  const handleErrorClose = useCallback(() => {
    setErrorDialogOpen(false);
    setRejectedFiles([]);
  }, []);

  const handleBatchFileUpload = useCallback((files: { content: string, fileName: string }[]) => {
    let newTabs: FileTab[] = [];
    let rejectedList: { baseFileName: string, languageFile: string }[] = [];

    files.forEach(({ content, fileName }) => {
      try {
        const resxData = parseResxFile(content);
        const gridRows: GridRow[] = resxData.entries.map((entry, index) => ({
          id: `${entry.name}-${index}`,
          name: entry.name,
          value: entry.value,
          comment: entry.comment || '',
        }));
        const { baseFileName, language } = parseFileName(fileName);
        if (language !== 'default') {
          const defaultFileName = `${baseFileName}.resx`;
          const defaultFileExists = files.some(f => f.fileName === defaultFileName) || newTabs.some(tab => tab.fileName === defaultFileName);
          if (!defaultFileExists) {
            rejectedList.push({ baseFileName, languageFile: fileName });
            return;
          }
        }
        const newTab: FileTab = {
          id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName,
          originalFileName: fileName,
          rows: gridRows,
          hasChanges: false,
          baseFileName,
          language,
        };
        newTabs.push(newTab);
      } catch (err) {
        // Optionally handle parse errors
      }
    });

    setTabs(prevTabs => {
      const allTabs = [...prevTabs, ...newTabs];
      updateGroupsFromTabs(allTabs);
      return allTabs;
    });

    if (rejectedList.length > 0) {
      setRejectedFiles(rejectedList);
      setErrorDialogOpen(true);
    }
  }, [updateGroupsFromTabs]);

  const handleFileUpload = useCallback((content: string, fileName: string) => {
    console.log('\n🚀 === HANDLE FILE UPLOAD ===');
    console.log('📤 Processing file:', fileName);
    console.log('📏 Content length:', content?.length || 0);

    try {
      setError('');

      console.log('🔍 Parsing RESX content...');
      const resxData = parseResxFile(content);
      console.log('📊 Parsed entries count:', resxData.entries.length);
      console.log(
        '📋 Sample entries:',
        resxData.entries.slice(0, 3).map(e => ({ name: e.name, value: e.value?.substring(0, 50) })),
      );

      const gridRows: GridRow[] = resxData.entries.map((entry, index) => ({
        id: `${entry.name}-${index}`,
        name: entry.name,
        value: entry.value,
        comment: entry.comment || '',
      }));
      console.log('🎯 Created grid rows:', gridRows.length);

      const { baseFileName, language } = parseFileName(fileName);
      console.log('📝 Filename parsing result:', {
        fileName,
        baseFileName,
        language,
      });

      const newTab: FileTab = {
        id: generateTabId(),
        fileName,
        originalFileName: fileName,
        rows: gridRows,
        hasChanges: false,
        baseFileName,
        language,
      };

      console.log('🔍 New tab baseFileName and language:', {
        baseFileName: newTab.baseFileName,
        language: newTab.language,
      });

      console.log('✅ Created new tab:', {
        id: newTab.id,
        fileName: newTab.fileName,
        baseFileName: newTab.baseFileName,
        language: newTab.language,
        rowCount: newTab.rows.length,
      });

      // Use functional update to avoid race conditions with multiple file uploads
      setTabs(prevTabs => {
        console.log(
          '📋 Current tabs before addition:',
          prevTabs.map(t => ({
            fileName: t.fileName,
            baseFileName: t.baseFileName,
            language: t.language,
          })),
        );

        const rejectedList: { baseFileName: string, languageFile: string }[] = [];
        if (language !== 'default') {
          const defaultFileName = `${baseFileName}.resx`;
          const defaultFileExists = prevTabs.some(tab => tab.fileName === defaultFileName);
          if (!defaultFileExists) {
            console.log(`❌ Language file "${fileName}" uploaded without default file "${defaultFileName}"`);
            rejectedList.push({ baseFileName, languageFile: fileName });
            return prevTabs;
          }
        }

        const newTabs = [...prevTabs, newTab];
        console.log(
          '📋 All tabs after addition:',
          newTabs.map(t => ({
            id: t.id,
            fileName: t.fileName,
            baseFileName: t.baseFileName,
            language: t.language,
          })),
        );

        // Update groups - let updateGroupsFromTabs handle active selections
        setTimeout(() => {
          updateGroupsFromTabs(newTabs);
        }, 0);

        if (rejectedList.length > 0) {
          setRejectedFiles(rejectedList);
          setErrorDialogOpen(true);
        }

        return newTabs;
      });

      console.log('✅ File upload completed successfully');
    } catch (err) {
      const errorMessage = `Error parsing ${fileName}. Please ensure it's a valid .resx file.`;
      setError(errorMessage);
      console.error('❌ Parse error:', err);
      console.error('❌ Error details:', {
        fileName,
        contentLength: content?.length,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  const handleGroupChange = useCallback(
    (groupId: string) => {
      console.log('🔄 Group changed to:', groupId);
      setActiveGroupId(groupId);
      const group = groups.find(g => g.id === groupId);
      if (group && group.files.length > 0) {
        const fileId = group.activeFileId || group.files[0].id;
        console.log('📁 Setting active file to:', fileId);
        setActiveFileId(fileId);
      }
    },
    [groups],
  );

  const handleFileChange = useCallback((fileId: string) => {
    console.log('📄 File changed to:', fileId);
    setActiveFileId(fileId);

    // Update the active file in the group
    setGroups(prevGroups =>
      prevGroups.map(group => {
        const fileInGroup = group.files.find(f => f.id === fileId);
        if (fileInGroup) {
          console.log('🔄 Updating active file in group:', group.id, 'to:', fileId);
          return { ...group, activeFileId: fileId };
        }
        return group;
      }),
    );
  }, []);

  const handleRowsChange = useCallback(
    (newRows: GridRow[]) => {
      if (!activeFileId) return;

      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(tab => {
          if (tab.id === activeFileId) {
            // Check if there are actual changes by comparing with original
            const hasChanges = JSON.stringify(newRows) !== JSON.stringify(tab.rows);
            return {
              ...tab,
              rows: newRows,
              hasChanges,
            };
          }
          return tab;
        });

        // Update groups to reflect changes using the updated tabs
        setTimeout(() => {
          updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
        }, 0);

        return updatedTabs;
      });
    },
    [activeFileId, activeGroupId, updateGroupsFromTabs],
  );

  const activeGroup = groups.find(group => group.id === activeGroupId);
  const activeFile = activeGroup?.files.find(file => file.id === activeFileId);

  const handleDownloadCurrentFile = useCallback(() => {
    if (activeFile) {
      downloadResxFile(activeFile.rows, activeFile.originalFileName);
    }
  }, [activeFile]);

  // Find other files in the group (excluding the current file)
  const otherFilesInGroup = activeGroup
    ? activeGroup.files.filter(f => f.id !== activeFileId).map(f => ({ id: f.id, fileName: f.fileName }))
    : [];

  const handleGridContextMenu = (event: React.MouseEvent, row?: GridRow) => {
    event.preventDefault();
    setSelectedRow(row || null);
    setGridMenuAnchor(
      gridMenuAnchor === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null
    );
  };

  const handleEditEntry = (entry: GridRow) => {
    // Reset the editEntryId when edit dialog closes
    setEditEntryId(null);
    setGridMenuAnchor(null);
  };

  const handleEditEntryFromMenu = () => {
    if (selectedRow) {
      setEditEntryId(selectedRow.id);
    }
    setGridMenuAnchor(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (!activeFileId) return;
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab => {
        if (tab.id === activeFileId) {
          return {
            ...tab,
            rows: tab.rows.filter(row => row.id !== id),
            hasChanges: true,
          };
        }
        return tab;
      });
      updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
      return updatedTabs;
    });
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
    setGridMenuAnchor(null);
  };

  const handleDeleteEntryFromMenu = () => {
    if (selectedRow) {
      setEntryToDelete(selectedRow);
      // Prepare list of other files in group (excluding active)
      if (otherFilesInGroup.length > 0) {
        setMultiDeleteSelectedIds(otherFilesInGroup.map(f => f.id));
        setMultiDeleteDialogOpen(true);
      } else {
        setDeleteDialogOpen(true);
      }
    }
    setGridMenuAnchor(null);
  };

  const handleCloseGridMenu = () => {
    setGridMenuAnchor(null);
  };

  const handleAddEntryFromMenu = () => {
    setAddDialogOpen(true);
    setGridMenuAnchor(null);
  };

  const handleConfirmMultiDelete = () => {
    if (!entryToDelete) return;
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab => {
        // Always delete from active file
        if (tab.id === activeFileId) {
          return {
            ...tab,
            rows: tab.rows.filter(row => row.name !== entryToDelete.name),
            hasChanges: true,
          };
        }
        // Delete from checked files
        if (multiDeleteSelectedIds.includes(tab.id)) {
          return {
            ...tab,
            rows: tab.rows.filter(row => row.name !== entryToDelete.name),
            hasChanges: true,
          };
        }
        return tab;
      });
      updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
      return updatedTabs;
    });
    setMultiDeleteDialogOpen(false);
    setEntryToDelete(null);
    setDeleteDialogOpen(false);
  };

  console.log('📊 === CURRENT APP STATE ===');
  console.log('📈 Summary:', {
    tabsCount: tabs.length,
    groupsCount: groups.length,
    activeGroupId,
    activeFileId,
    activeGroup: activeGroup?.baseFileName,
    activeFile: activeFile?.fileName,
  });
  console.log(
    '📁 All loaded files:',
    tabs.map(t => ({
      fileName: t.fileName,
      baseFileName: t.baseFileName,
      language: t.language,
      id: t.id,
    })),
  );
  console.log(
    '🗂️ All groups:',
    groups.map(g => ({
      id: g.id,
      baseFileName: g.baseFileName,
      fileCount: g.files.length,
      activeFileId: g.activeFileId,
      files: g.files.map(f => ({ fileName: f.fileName, id: f.id })),
    })),
  );
  console.log('otherFilesInGroup:', otherFilesInGroup);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Compact Header */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            align="center"
            sx={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 0.5,
              fontWeight: 600,
            }}
          >
            Multi-File RESX Editor
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
            }}
          >
            Upload, edit, and manage multiple .NET resource files with language grouping
          </Typography>
        </Paper>

        {/* Compact Upload Section */}
        <Box sx={{ mb: 2 }}>
          <FileUpload
            onBatchFileUpload={handleBatchFileUpload}
            onUploadStart={handleUploadStart}
            onDebugClick={handleDebugClick}
            uploadedFileCount={tabs.length}
          />
        </Box>

        {/* File Group Tabs */}
        <FileGroupTabs
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupChange={handleGroupChange}
        />

        {/* File Sub Tabs (only shown if group has multiple files) */}
        {activeGroup && (
          <FileSubTabs
            files={activeGroup.files}
            activeFileId={activeFileId}
            onFileChange={handleFileChange}
          />
        )}

        <Box sx={{ mb: 2 }}>
          <ResxDataGrid
            rows={activeFile?.rows || []}
            onRowsChange={handleRowsChange}
            fileName={activeFile?.fileName}
            onDownload={handleDownloadCurrentFile}
            onContextMenu={handleGridContextMenu}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            editEntryId={editEntryId}
          />
        </Box>

        <Menu
          open={!!gridMenuAnchor}
          onClose={handleCloseGridMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            gridMenuAnchor !== null
              ? { top: gridMenuAnchor.mouseY, left: gridMenuAnchor.mouseX }
              : undefined
          }
          sx={{
            '& .MuiMenuItem-root': {
              fontSize: '0.85rem',
              py: 0.75,
            },
          }}
        >
          <MenuItem onClick={handleAddEntryFromMenu}>Add New Entry</MenuItem>
          {selectedRow && (
            <>
              <Divider />
              <MenuItem onClick={handleEditEntryFromMenu}>Edit Entry</MenuItem>
              <MenuItem onClick={handleDeleteEntryFromMenu}>Delete Entry</MenuItem>
            </>
          )}
        </Menu>

        <AddEntryDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          existingNames={activeFile ? activeFile.rows.map(r => r.name) : []}
          onAdd={entry => {
            if (otherFilesInGroup.length > 0) {
              setPendingAddEntry(entry);
              setMultiAddSelectedIds(otherFilesInGroup.map(f => f.id));
              setAddDialogOpen(false);
              setTimeout(() => {
                console.log('Opening multi-file confirmation dialog, otherFilesInGroup:', otherFilesInGroup);
                setMultiAddDialogOpen(true);
              }, 0);
            } else {
              if (!activeFileId) return;
              setTabs(prevTabs => {
                const updatedTabs = prevTabs.map(tab => {
                  if (tab.id === activeFileId) {
                    return {
                      ...tab,
                      rows: [
                        ...tab.rows,
                        {
                          id: `${entry.name}-${tab.rows.length}`,
                          name: entry.name,
                          value: entry.value,
                          comment: entry.comment || '',
                        },
                      ],
                      hasChanges: true,
                    };
                  }
                  return tab;
                });
                updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
                return updatedTabs;
              });
              setAddDialogOpen(false);
            }
          }}
        />

        {/* Multi-file confirmation dialog (always rendered) */}
        <Dialog open={multiAddDialogOpen} onClose={() => setMultiAddDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Add Entry to Other Files</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Also add this entry to the following files?
            </Typography>
            {otherFilesInGroup.map(file => (
              <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <input
                  type="checkbox"
                  checked={multiAddSelectedIds.includes(file.id)}
                  onChange={e => {
                    setMultiAddSelectedIds(prev =>
                      e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id)
                    );
                  }}
                  id={`multi-add-file-${file.id}`}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor={`multi-add-file-${file.id}`} style={{ fontSize: '0.93rem' }}>{file.fileName}</label>
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setMultiAddDialogOpen(false); setPendingAddEntry(null); }}>Cancel</Button>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('Confirming multi-file add, selected:', multiAddSelectedIds);
                if (!pendingAddEntry || !activeFileId) return;
                setTabs(prevTabs => {
                  const updatedTabs = prevTabs.map(tab => {
                    // Add to active file
                    if (tab.id === activeFileId) {
                      return {
                        ...tab,
                        rows: [
                          ...tab.rows,
                          {
                            id: `${pendingAddEntry.name}-${tab.rows.length}`,
                            name: pendingAddEntry.name,
                            value: pendingAddEntry.value,
                            comment: pendingAddEntry.comment || '',
                          },
                        ],
                        hasChanges: true,
                      };
                    }
                    // Add to checked other files
                    if (multiAddSelectedIds.includes(tab.id)) {
                      if (!tab.rows.some(r => r.name === pendingAddEntry.name)) {
                        return {
                          ...tab,
                          rows: [
                            ...tab.rows,
                            {
                              id: `${pendingAddEntry.name}-${tab.rows.length}`,
                              name: pendingAddEntry.name,
                              value: pendingAddEntry.value,
                              comment: pendingAddEntry.comment || '',
                            },
                          ],
                          hasChanges: true,
                        };
                      }
                    }
                    return tab;
                  });
                  updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
                  return updatedTabs;
                });
                setMultiAddDialogOpen(false);
                setPendingAddEntry(null);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Multi-file delete confirmation dialog */}
        <Dialog open={multiDeleteDialogOpen} onClose={() => { setMultiDeleteDialogOpen(false); setEntryToDelete(null); }} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Entry from Other Files</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Also delete <strong>"{entryToDelete?.name}"</strong> from the following files?
            </Typography>
            {otherFilesInGroup.map(file => (
              <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <input
                  type="checkbox"
                  checked={multiDeleteSelectedIds.includes(file.id)}
                  onChange={e => {
                    setMultiDeleteSelectedIds(prev =>
                      e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id)
                    );
                  }}
                  id={`multi-delete-file-${file.id}`}
                  style={{ marginRight: 8 }}
                />
                <label htmlFor={`multi-delete-file-${file.id}`} style={{ fontSize: '0.93rem' }}>{file.fileName}</label>
              </Box>
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', mt: 2 }}>
              This action cannot be undone. The entry will be permanently removed from all checked files.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => { setMultiDeleteDialogOpen(false); setEntryToDelete(null); }} 
              variant="outlined"
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: 'rgba(220, 38, 38, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMultiDelete}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {activeFile && (
          <DownloadButton
            rows={activeFile.rows}
            fileName={activeFile.originalFileName}
            disabled={activeFile.rows.length === 0}
            onDownloaded={() => {
              setTabs(prevTabs => {
                const updatedTabs = prevTabs.map(tab =>
                  tab.id === activeFile.id ? { ...tab, hasChanges: false } : tab
                );
                updateGroupsFromTabs(updatedTabs, true, activeGroupId, activeFileId);
                return updatedTabs;
              });
            }}
          />
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
          Designed and implemented by Vladimir V using ReactJS, TypeScript, and Material UI
          </Typography>
        </Box>

        {/* Debug Dialog */}
        <Dialog open={debugDialogOpen} onClose={handleDebugClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Debug Information</Typography>
              <IconButton onClick={handleDebugClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                <strong>📊 Application State:</strong>
                <br />
                📁 {tabs.length} files loaded, {groups.length} groups created
                <br />
                🎯 Active: {activeGroup?.baseFileName || 'none'} / {activeFile?.fileName || 'none'}
                <br />
                <br />
                <strong>📋 Loaded Files:</strong>
                <br />
                {tabs.length > 0
                  ? tabs.map((t, index) => (
                      <span key={t.id}>
                        {index + 1}. {t.fileName} (base: {t.baseFileName}, lang: {t.language})
                        <br />
                      </span>
                    ))
                  : 'No files loaded'}
                <br />
                <strong>🗂️ File Groups:</strong>
                <br />
                {groups.length > 0
                  ? groups.map((g, index) => (
                      <span key={g.id}>
                        {index + 1}. {g.baseFileName} ({g.files.length} files)
                        <br />
                        {g.files.map((f, fIndex) => (
                          <span key={f.id} style={{ marginLeft: '20px' }}>
                            {fIndex + 1}.{fIndex + 1} {f.fileName} ({f.language})
                            {f.id === g.activeFileId && ' ← active'}
                            <br />
                          </span>
                        ))}
                        <br />
                      </span>
                    ))
                  : 'No groups created'}
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDebugClose} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setEntryToDelete(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="error">Delete Entry</Typography>
              <IconButton onClick={() => { setDeleteDialogOpen(false); setEntryToDelete(null); }} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1, mb: 2, fontSize: '0.95rem' }}>
              Are you sure you want to delete the entry <strong>"{entryToDelete?.name}"</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              This action cannot be undone. The entry will be permanently removed from the current file.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => { setDeleteDialogOpen(false); setEntryToDelete(null); }} 
              variant="outlined"
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: 'rgba(220, 38, 38, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => entryToDelete && handleDeleteEntry(entryToDelete.id)}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onClose={handleErrorClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="error">Upload Error</Typography>
              <IconButton onClick={handleErrorClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="error" sx={{ mt: 1, mb: 2, fontSize: '0.95rem' }}>
              The following language-specific files could not be loaded because their default file was not found:
            </Typography>
            <ul style={{ color: '#d32f2f', marginLeft: 24, fontSize: '0.92rem' }}>
              {rejectedFiles.map((file, idx) => (
                <li key={idx}>
                  <strong>{file.languageFile}</strong> (missing <strong>{file.baseFileName}.resx</strong>)
                </li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleErrorClose} variant="outlined" color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
