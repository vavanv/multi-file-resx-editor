import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Paper, Typography } from '@mui/material';
import { GridRow } from '../types/resx';
import { AddEntryDialog } from './AddEntryDialog';
import { EditEntryDialog } from './EditEntryDialog';

interface ResxDataGridProps {
  rows: GridRow[];
  onRowsChange: (newRows: GridRow[]) => void;
  fileName?: string;
  onDownload?: () => void;
  onContextMenu?: (event: React.MouseEvent, row?: GridRow) => void;
  onEditEntry?: (entry: GridRow) => void;
  onDeleteEntry?: (id: string) => void;
  editEntryId?: string | null;
}

export const ResxDataGrid: React.FC<ResxDataGridProps> = ({
  rows,
  onRowsChange,
  fileName,
  onDownload,
  onContextMenu,
  onEditEntry,
  onDeleteEntry,
  editEntryId,
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GridRow | null>(null);
  const vOffSet = 540; // Adjust this value based on your layout (header, footer, etc.)

  const calcTableHeight = React.useCallback(() => window.innerHeight - vOffSet, [vOffSet]);

  const [tableHeight, setTableHeight] = React.useState<number>(calcTableHeight);

  React.useEffect(() => {
    window.onresize = () => setTableHeight(calcTableHeight);
  }, [calcTableHeight]);

  // Handle external edit trigger
  React.useEffect(() => {
    if (editEntryId) {
      const entry = rows.find(row => row.id === editEntryId);
      if (entry) {
        setEditingEntry(entry);
        setEditDialogOpen(true);
      }
    }
  }, [editEntryId, rows]);

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingEntry(null);
    // Reset the external edit trigger
    if (editEntryId) {
      // We need to notify the parent to reset editEntryId
      // For now, we'll use a timeout to avoid immediate re-trigger
      setTimeout(() => {
        if (onEditEntry && editEntryId) {
          const entry = rows.find(row => row.id === editEntryId);
          if (entry) {
            onEditEntry(entry); // This will be used to reset the editEntryId
          }
        }
      }, 100);
    }
  };

  const handleEditClick = (row: GridRow) => () => {
    setEditingEntry(row);
    setEditDialogOpen(true);
  };



  const handleContextMenu = (event: React.MouseEvent) => {
    // Get the clicked row from the event target
    const target = event.target as HTMLElement;
    const rowElement = target.closest('[data-rowindex]');
    if (rowElement) {
      const rowIndex = parseInt(rowElement.getAttribute('data-rowindex') || '0');
      const row = rows[rowIndex];
      if (row) {
        onContextMenu?.(event, row);
      }
    } else {
      onContextMenu?.(event);
    }
  };

  const handleAddEntry = (entry: { name: string; value: string; comment: string }) => {
    const newId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow: GridRow = {
      id: newId,
      name: entry.name,
      value: entry.value,
      comment: entry.comment,
    };

    // Add new entry at the beginning of the list for better visibility
    const updatedRows = [newRow, ...rows];
    onRowsChange(updatedRows);
  };

  const handleEditEntry = (editedEntry: { id: string; value: string; comment: string }) => {
    const updatedRows = rows.map(row =>
      row.id === editedEntry.id
        ? { ...row, value: editedEntry.value, comment: editedEntry.comment }
        : row,
    );
    onRowsChange(updatedRows);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3,
      minWidth: 200,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'value',
      headerName: 'Value',
      flex: 0.5,
      minWidth: 300,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 0.2,
      minWidth: 200,
      headerClassName: 'data-grid-header',
    },
  ];

  const existingNames = rows.map(row => row.name);

  if (rows.length === 0) {
    return (
      <>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            minHeight: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No files selected
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {fileName
                ? `${fileName} is empty or has no valid entries`
                : 'Upload .resx files to view and edit their contents'}
            </Typography>
          </Box>
        </Paper>

        <AddEntryDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={handleAddEntry}
          existingNames={existingNames}
        />
      </>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 1.5, width: '100%' }} onContextMenu={handleContextMenu}>
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 500 }}>
            {fileName ? `${fileName}` : 'RESX File'} • {rows.length} entries
          </Typography>
        </Box>
        <div style={{ height: tableHeight, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            sx={{
              border: 'none',
              width: '100%',
              '& .data-grid-header': {
                backgroundColor: 'background.paper',
                color: 'text.primary',
                fontWeight: 'bold',
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderRadius: 0,
                backgroundColor: 'background.paper',
              },
            }}
            disableRowSelectionOnClick
            disableColumnResize
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </Paper>

      <AddEntryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddEntry}
        existingNames={existingNames}
      />

      <EditEntryDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        onSave={handleEditEntry}
        entry={editingEntry ? {
          id: editingEntry.id,
          name: editingEntry.name,
          value: editingEntry.value,
          comment: editingEntry.comment || ''
        } : null}
        existingNames={existingNames}
      />
    </>
  );
};
