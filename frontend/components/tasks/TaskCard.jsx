'use client';
import {
  Card, CardContent, Box, Typography, Chip,
  IconButton, Checkbox, Tooltip,
} from '@mui/material';
import { Edit, Delete, Flag, Event, WarningAmber, Label } from '@mui/icons-material';

const priorityConfig = {
  high:   { label: 'Yüksek', color: 'error' },
  medium: { label: 'Orta',   color: 'warning' },
  low:    { label: 'Düşük',  color: 'success' },
};

export default function TaskCard({ task, onToggle, onDelete, onEdit, now }) {
  const p = priorityConfig[task.priority] || priorityConfig.medium;
  const dueDate = task.dueAt ? new Date(task.dueAt) : null;
  const isOverdue = Boolean(dueDate && !task.completed && dueDate.getTime() < now);
  const dueLabel = task.dueAt
    ? new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dueDate)
    : null;

  return (
    <Card elevation={0} sx={{
      transition: 'all 0.2s',
      opacity: task.completed ? 0.6 : 1,
      borderLeft: `4px solid ${task.color || '#6750A4'}`,
      borderColor: isOverdue ? '#F2B8B5' : undefined,
      bgcolor: isOverdue ? '#FFFBFA' : undefined,
      '&:hover': { boxShadow: '0 2px 8px rgba(103,80,164,0.12)', borderColor: isOverdue ? '#B3261E' : '#6750A4' },
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggle(task)}
            sx={{ color: '#6750A4', '&.Mui-checked': { color: '#6750A4' }, mt: -0.5 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: task.completed ? 'text.disabled' : 'text.primary',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                {task.description}
              </Typography>
            )}
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<Flag sx={{ fontSize: '14px !important' }} />}
                label={p.label}
                color={p.color}
                size="small"
                variant="outlined"
              />
              {task.category && (
                <Chip
                  icon={<Label sx={{ fontSize: '14px !important' }} />}
                  label={task.category}
                  size="small"
                  variant="outlined"
                />
              )}
              {isOverdue && (
                <Chip
                  icon={<WarningAmber sx={{ fontSize: '14px !important' }} />}
                  label="Gecikti"
                  color="error"
                  size="small"
                  variant="filled"
                />
              )}
              {dueLabel && (
                <Chip
                  icon={<Event sx={{ fontSize: '14px !important' }} />}
                  label={dueLabel}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
            <Tooltip title="Düzenle">
              <IconButton size="small" onClick={() => onEdit(task)} sx={{ color: '#6750A4' }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton size="small" onClick={() => onDelete(task._id)} sx={{ color: '#B3261E' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
