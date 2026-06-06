import { Box, Typography } from '@mui/material';
import { AssignmentOutlined } from '@mui/icons-material';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onToggle, onDelete, onEdit, now, isSearching }) {
  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, color: 'text.disabled' }}>
        <AssignmentOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
        <Typography variant="h6" sx={{ fontWeight: 400, mb: 0.5 }}>
          {isSearching ? 'Eşleşen görev yok' : 'Görev bulunamadı'}
        </Typography>
        <Typography variant="body2">
          {isSearching ? 'Arama metnini değiştirerek tekrar dene' : 'Yukarıdan yeni görev ekleyebilirsin'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} now={now} />
      ))}
    </Box>
  );
}
