'use client';
import { useMemo, useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Collapse,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { Notes, Event, Palette, Flag, Add, Save, Label } from '@mui/icons-material';

const priorities = [
  { value: 'low',    label: 'Düşük' },
  { value: 'medium', label: 'Orta' },
  { value: 'high',   label: 'Yüksek' },
];

const colors = [
  { value: '#6750A4', label: 'Mor' },
  { value: '#386A20', label: 'Yeşil' },
  { value: '#B3261E', label: 'Kırmızı' },
  { value: '#006A6A', label: 'Turkuaz' },
  { value: '#7D5260', label: 'Gül' },
];

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const toTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toTimeString().slice(0, 5);
};

export default function TaskForm({ onSubmit, initialData = {}, loading }) {
  const isEditing = Boolean(initialData._id);
  const initialDueDate = useMemo(() => toDateInput(initialData.dueAt), [initialData.dueAt]);
  const initialDueTime = useMemo(() => toTimeInput(initialData.dueAt), [initialData.dueAt]);
  const [form, setForm] = useState({
    title:       initialData.title       || '',
    description: initialData.description || '',
    priority:    initialData.priority    || 'medium',
    color:       initialData.color       || colors[0].value,
    category:    initialData.category    || '',
    dueDate:     initialDueDate,
    dueTime:     initialDueTime,
  });
  const [openSections, setOpenSections] = useState({
    description: Boolean(initialData.description),
    dueAt: Boolean(initialData.dueAt),
    color: Boolean(initialData.color),
    category: Boolean(initialData.category),
    priority: isEditing,
  });

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const setTimePart = (part, value) => {
    const [hour = '09', minute = '00'] = form.dueTime.split(':');
    setForm({
      ...form,
      dueTime: part === 'hour' ? `${value}:${minute}` : `${hour}:${value}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const dueAt = form.dueDate
      ? new Date(`${form.dueDate}T${form.dueTime || '09:00'}`).toISOString()
      : null;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      color: form.color,
      category: form.category.trim(),
      dueAt,
    });
  };

  const detailButtons = [
    { key: 'description', label: 'Açıklama', icon: <Notes fontSize="small" /> },
    { key: 'dueAt', label: 'Tarih/Saat', icon: <Event fontSize="small" /> },
    { key: 'color', label: 'Renk', icon: <Palette fontSize="small" /> },
    { key: 'category', label: 'Kategori', icon: <Label fontSize="small" /> },
    { key: 'priority', label: 'Önem', icon: <Flag fontSize="small" /> },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Görev"
        fullWidth
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
        autoFocus
        placeholder="Hızlıca bir görev yaz..."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' }, gap: 1 }}>
        {detailButtons.map((button) => (
          <Button
            key={button.key}
            type="button"
            variant={openSections[button.key] ? 'contained' : 'outlined'}
            startIcon={button.icon}
            onClick={() => toggleSection(button.key)}
            sx={{
              minWidth: 0,
              borderRadius: 24,
              px: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: openSections[button.key] ? 'none' : 'none',
            }}
          >
            {button.label}
          </Button>
        ))}
      </Box>

      <Collapse in={openSections.description}>
        <TextField
          label="Açıklama"
          fullWidth
          multiline
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detay, not ya da bağlam ekle"
        />
      </Collapse>

      <Collapse in={openSections.dueAt}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.4fr 0.8fr 0.8fr' }, gap: 1.5 }}>
          <TextField
            label="Tarih"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Saat"
            value={(form.dueTime || '09:00').split(':')[0]}
            onChange={(e) => setTimePart('hour', e.target.value)}
          >
            {hours.map((hour) => (
              <MenuItem key={hour} value={hour}>{hour}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Dakika"
            value={(form.dueTime || '09:00').split(':')[1]}
            onChange={(e) => setTimePart('minute', e.target.value)}
          >
            {minutes.map((minute) => (
              <MenuItem key={minute} value={minute}>{minute}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Collapse>

      <Collapse in={openSections.color}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">Renk</Typography>
          <ToggleButtonGroup
            value={form.color}
            exclusive
            onChange={(_, value) => value && setForm({ ...form, color: value })}
            sx={{ gap: 1, flexWrap: 'wrap' }}
          >
            {colors.map((color) => (
              <ToggleButton
                key={color.value}
                value={color.value}
                aria-label={color.label}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50% !important',
                  border: form.color === color.value ? '2px solid #1C1B1F !important' : '1px solid #CAC4D0 !important',
                  bgcolor: `${color.value} !important`,
                  p: 0,
                }}
              />
            ))}
          </ToggleButtonGroup>
        </Box>
      </Collapse>

      <Collapse in={openSections.category}>
        <TextField
          label="Kategori"
          fullWidth
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="İş, okul, kişisel..."
        />
      </Collapse>

      <Collapse in={openSections.priority}>
        <TextField
          select
          label="Önem"
          fullWidth
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          {priorities.map((p) => (
            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
          ))}
        </TextField>
      </Collapse>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={isEditing ? <Save /> : <Add />}
        sx={{ py: 1.5, mt: 0.5, borderRadius: 3 }}
      >
        {loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Görev Ekle'}
      </Button>
    </Box>
  );
}
