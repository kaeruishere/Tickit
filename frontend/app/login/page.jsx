'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Tickit | Giriş';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      toast.success(`Hoş geldin, ${data.user.username}!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              component="img"
              src="/favicon_io/logo.png"
              alt="Tickit"
              sx={{ width: 44, height: 44, flexShrink: 0 }}
            />
            <Typography variant="h4" sx={{ color: '#1C1B1F' }}>Tickit&apos;e hoş geldin</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Görevlerine kaldığın yerden devam et</Typography>
        </Box>
        <Card elevation={0}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <TextField
                label="Şifre"
                type={showPass ? 'text' : 'password'}
                fullWidth
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 1, py: 1.5 }}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Hesabın yok mu?{' '}
              <Link href="/register" style={{ color: '#6750A4', fontWeight: 500, textDecoration: 'none' }}>
                Kayıt ol
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
