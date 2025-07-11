import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface AddEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { name: string; value: string; comment: string }) => void;
  existingNames: string[];
}

export const AddEntryDialog: React.FC<AddEntryDialogProps> = ({
  open,
  onClose,
  onAdd,
  existingNames,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    value: '',
  });

  const handleClose = () => {
    setFormData({ name: '', value: '', comment: '' });
    setErrors({ name: '', value: '' });
    onClose();
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (existingNames.includes(name.trim())) {
      return 'Name already exists. Names must be unique.';
    }
    return '';
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Value is required';
    }
    return '';
  };

  const validateForm = () => {
    const nameError = validateName(formData.name);
    const valueError = validateValue(formData.value);

    setErrors({
      name: nameError,
      value: valueError,
    });

    return !nameError && !valueError;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd({
        name: formData.name.trim(),
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

      // Real-time validation for name field
      if (field === 'name') {
        const nameError = validateName(newValue);
        setErrors(prev => ({
          ...prev,
          name: nameError,
        }));
      }

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
  const isFormValid =
    formData.name.trim() && formData.value.trim() && !errors.name && !errors.value;

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
        <Add />
        Add New Entry
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            fontSize: '0.95rem',
          }}
        >
          Fill in the details for the new resource entry. Name and Value are required fields.
        </Typography>

        <TextField
          label="Name"
          value={formData.name}
          onChange={handleInputChange('name')}
          onKeyPress={handleKeyPress}
          error={!!errors.name}
          helperText={
            errors.name || 'Unique identifier for the resource (must be unique in this file)'
          }
          fullWidth
          required
          margin="normal"
          variant="standard"
          InputProps={{ sx: { fontSize: '0.95rem', '::placeholder': { fontSize: '0.95rem' } } }}
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
          InputProps={{ sx: { fontSize: '0.95rem', '::placeholder': { fontSize: '0.95rem' } } }}
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
          InputProps={{ sx: { fontSize: '0.95rem', '::placeholder': { fontSize: '0.95rem' } } }}
        />
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
          disabled={!isFormValid}
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
