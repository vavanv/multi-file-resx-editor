import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Edit  } from '@mui/icons-material';

interface EditEntryDialogProps {
  open: boolean;
  onClose: () => void;
  entry: { id: string; name: string; value: string; comment: string } | null;
  onSave: (entry: { id: string; value: string; comment: string }) => void;
  existingNames: string[];
}

export const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
  open,
  onClose,
  entry,
  onSave,
  existingNames,
}) => {
  const [formData, setFormData] = useState({
    value: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    value: '',
  });

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        value: entry.value,
        comment: entry.comment || '',
      });
      setErrors({ value: '' });
    }
  }, [entry]);

  const handleClose = () => {
    setErrors({ value: '' });
    onClose();
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Value is required';
    }
    return '';
  };

  const validateForm = () => {
    const valueError = validateValue(formData.value);

    setErrors({
      value: valueError,
    });

    return !valueError;
  };

  const handleSubmit = () => {
    if (validateForm() && entry) {
      onSave({
        id: entry.id,
        value: formData.value.trim(),
        comment: formData.comment.trim(),
      });
      handleClose();
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: newValue,
      }));

      // Real-time validation for value field
      if (field === 'value') {
        const valueError = validateValue(newValue);
        setErrors(prev => ({
          ...prev,
          value: valueError,
        }));
      }
    };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit();
    }
  };

  // Check if form is valid for button state
  const isFormValid = formData.value.trim() && !errors.value;
  const hasChanges =
    entry && (formData.value !== entry.value || formData.comment !== (entry.comment || ''));

  if (!entry) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Edit />
        Edit Entry
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontSize: '0.95rem' }}
          >
            Update the value or comment for this resource entry. Name cannot be changed.
          </Typography>

          <TextField
            label="Name"
            value={entry.name}
            fullWidth
            disabled
            variant="standard"
            helperText="Name cannot be modified"
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'text.primary',
                opacity: 0.7,
              },
            }}
          />

          <TextField
            label="Value"
            value={formData.value}
            onChange={handleInputChange('value')}
            onKeyPress={handleKeyPress}
            error={!!errors.value}
            helperText={errors.value || 'The actual content/text of the resource'}
            fullWidth
            required
            margin="normal"
            variant="standard"
            multiline
            rows={7}
            InputProps={{ sx: { fontSize: '0.95rem', '::placeholder': { fontSize: '0.95rem' } } } }
          />

          <TextField
            label="Comment"
            value={formData.comment}
            onChange={handleInputChange('comment')}
            onKeyPress={handleKeyPress}
            helperText="Optional description or notes about this resource"
            fullWidth
            margin="normal"
            variant="standard"
            InputProps={{ sx: { fontSize: '0.95rem', '::placeholder': { fontSize: '0.95rem' } } } }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          sx={{
            borderColor: '#dc2626',
            color: '#dc2626',
            '&:hover': {
              borderColor: '#b91c1c',
              backgroundColor: 'rgba(220, 38, 38, 0.04)',
            },
            minWidth: 80,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          color="primary"
          disabled={!isFormValid || !hasChanges}
          sx={{
            minWidth: 80,
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
