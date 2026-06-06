'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, IconButton, ToggleButtonGroup,
  ToggleButton, Card, CardContent, AppBar, Toolbar,
  Avatar, Menu, MenuItem, Divider, TextField, InputAdornment,
  Pagination,
} from '@mui/material';
import { Add, Close, Logout, AccountCircle, Search } from '@mui/icons-material';
import api from '@/lib/api';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import toast from 'react-hot-toast';

const priorityRank = { high: 3, medium: 2, low: 1 };

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const initialLoadRef = useRef(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [limit] = useState(10);
  const [categories, setCategories] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(null);

  const fetchTasks = useCallback(async ({ pageParam = 1 } = {}) => {
    if (!initialLoadRef.current) setIsFetching(true);
    try {
      const params = {
        page: pageParam,
        limit,
        q: search || undefined,
        status: filter === 'all' ? undefined : filter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        sort: sortBy,
      };
      const [{ data: me }, { data: taskData }] = await Promise.all([
        api.get('/auth/me'),
        api.get('/tasks', { params }),
      ]);
      setUser(me.user);
      setTasks(taskData.tasks || []);
      setNow(Date.now());
      setPage(taskData.page || pageParam);
      setTotalPages(taskData.totalPages || 1);
      setTotalTasks(taskData.globalTotal ?? taskData.total ?? taskData.count ?? 0);
      setActiveCount(taskData.globalActive ?? taskData.activeCount ?? 0);
      setCompletedCount(taskData.globalCompleted ?? taskData.completedCount ?? 0);
      setCategories(taskData.categories || []);
    } catch (err) {
      router.push('/login');
      toast.error('Görevler yüklenemedi');
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
      initialLoadRef.current = false;
    }
  }, [router, limit, search, filter, categoryFilter, sortBy]);

  useEffect(() => {
    document.title = 'Tickit | Dashboard';
    (async () => { await fetchTasks({ pageParam: 1 }); })();
  }, [fetchTasks]);

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await api.post('/tasks', form);
      setShowAddModal(false);
      await fetchTasks({ pageParam: 1 });
      toast.success('Görev eklendi!');
    } catch {
      toast.error('Görev eklenemedi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    try {
      await api.put(`/tasks/${editTask._id}`, form);
      setEditTask(null);
      await fetchTasks({ pageParam: page });
      toast.success('Görev güncellendi!');
    } catch {
      toast.error('Güncelleme başarısız');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      await fetchTasks({ pageParam: page });
    } catch {
      toast.error('Güncellenemedi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks({ pageParam: page });
      toast.success('Görev silindi');
    } catch {
      toast.error('Silinemedi');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      toast.error('Çıkış sırasında bir sorun oluştu');
    } finally {
      router.push('/login');
    }
  };

  const searchTerm = search.trim().toLocaleLowerCase('tr-TR');
  const sortedTasks = tasks; // server provides filtered & sorted list
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
  const displayName = user?.username || 'Tickit kullanıcısı';
  const todayLabel = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const focusText = initialLoading
    ? 'Görevlerin hazırlanıyor.'
    : activeCount > 0
      ? `${activeCount} aktif görevin seni bekliyor.`
      : totalTasks > 0
        ? 'Bugün tüm görevlerin tamam gibi.'
        : 'İlk görevini ekleyerek başlayabilirsin.';

  const stats = [
    { label: 'Toplam',      value: totalTasks,    color: '#6750A4' },
    { label: 'Aktif',       value: activeCount,      color: '#7D5260' },
    { label: 'Tamamlanan',  value: completedCount,   color: '#386A20' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFBFE' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FFFBFE', borderBottom: '1px solid #E6E0E9' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/favicon_io/logo.png"
              alt="Tickit"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="h6" sx={{ color: '#1C1B1F', fontWeight: 600 }}>Tickit</Typography>
          </Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: '#6750A4', width: 36, height: 36, fontSize: 16 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { borderRadius: 3, mt: 1, minWidth: 180 } } }}>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2">{user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#B3261E' }}>
              <Logout fontSize="small" /> Çıkış Yap
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: '#6750A4', fontWeight: 700, letterSpacing: 0 }}>
              Tickit Dashboard
            </Typography>
            <Typography variant="h4" sx={{ color: '#1C1B1F', fontWeight: 700, lineHeight: 1.15 }}>
              {greeting}, {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {focusText}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              border: '1px solid #E6E0E9',
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
          >
            {todayLabel}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 4 }}>
          {stats.map((s) => (
            <Card key={s.label} elevation={0}>
              <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 600 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <TextField
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Görevlerde ara..."
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton aria-label="Aramayı temizle" onClick={() => setSearch('')} edge="end" size="small">
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 3 }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': { borderRadius: '50px !important', px: 2, textTransform: 'none', border: '1px solid #CAC4D0', mx: 0.5 },
              '& .Mui-selected': { bgcolor: '#E8DEF8 !important', color: '#6750A4 !important', borderColor: '#6750A4 !important' },
            }}
          >
            <ToggleButton value="all">Tümü</ToggleButton>
            <ToggleButton value="active">Aktif</ToggleButton>
            <ToggleButton value="completed">Tamamlanan</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              select
              label="Kategori"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
            >
              <MenuItem value="all">Tüm kategoriler</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Sırala"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: '100%', sm: 150 }, borderRadius: 3 }}
            >
              <MenuItem value="newest">En yeni</MenuItem>
              <MenuItem value="oldest">En eski</MenuItem>
              <MenuItem value="dueAt">Son tarih</MenuItem>
              <MenuItem value="priority">Önem</MenuItem>
            </TextField>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setShowAddModal(true)}
              sx={{
                borderRadius: 28,
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                boxShadow: 'none',
                minWidth: 160,
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Görev Ekle
            </Button>
          </Box>
        </Box>

        {initialLoading ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.disabled' }}>
            <Typography>Yükleniyor...</Typography>
          </Box>
        ) : (
          <>
            <TaskList tasks={sortedTasks} onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditTask} now={now} isSearching={Boolean(searchTerm)} />
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => fetchTasks({ pageParam: p })} color="primary" />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Add Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 32,
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.14)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(15, 23, 42, 0.20)',
          },
        }}
      >
        <Box sx={{ bgcolor: '#F4EEFF', px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE7F6' }}>
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>Yeni Görev</Typography>
            <Typography variant="body2" color="text.secondary">Hızlıca yeni bir görev ekle</Typography>
          </Box>
          <IconButton
            onClick={() => setShowAddModal(false)}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
          ><Close /></IconButton>
        </Box>
        <DialogContent sx={{ pt: 3, pb: 3, px: 3, bgcolor: '#FFFFFF' }}>
          <TaskForm onSubmit={handleCreate} loading={formLoading} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={!!editTask}
        onClose={() => setEditTask(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 32,
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.14)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(15, 23, 42, 0.20)',
          },
        }}
      >
        <Box sx={{ bgcolor: '#F4EEFF', px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EDE7F6' }}>
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>Görevi Düzenle</Typography>
            <Typography variant="body2" color="text.secondary">Mevcut görevi düzenle</Typography>
          </Box>
          <IconButton
            onClick={() => setEditTask(null)}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
          ><Close /></IconButton>
        </Box>
        <DialogContent sx={{ pt: 3, pb: 3, px: 3, bgcolor: '#FFFFFF' }}>
          <TaskForm onSubmit={handleUpdate} initialData={editTask || {}} loading={formLoading} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
