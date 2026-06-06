'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import api, { storeCsrfToken } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    document.title = 'Tickit | Kayıt';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // final check before submit
    if (passwordError) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      storeCsrfToken(data.csrfToken);
      toast.success('Hesap oluşturuldu!');
      router.push('/dashboard');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && Array.isArray(resp.errors) && resp.errors.length) {
        // show first validation error
        toast.error(resp.errors[0].message);
      } else {
        toast.error(resp?.message || 'Kayıt başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) return 'Şifre en az 8 karakter olmalı';
    if (!/[a-z]/.test(pwd)) return 'Şifre küçük harf içermeli';
    if (!/[A-Z]/.test(pwd)) return 'Şifre büyük harf içermeli';
    return '';
  };

  const pwd = form.password || '';
  const checks = {
    length: pwd.length >= 8,
    lower: /[a-z]/.test(pwd),
    upper: /[A-Z]/.test(pwd),
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
            <Typography variant="h4" sx={{ color: '#1C1B1F' }}>Tickit hesabı oluştur</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Ücretsiz başla</Typography>
        </Box>
        <Card elevation={0}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Kullanıcı Adı"
                fullWidth
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
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
                onChange={(e) => {
                  const pwd = e.target.value;
                  setForm({ ...form, password: pwd });
                  setPasswordError(validatePassword(pwd));
                }}
                required
                helperText={passwordError || 'En az 8 karakter, büyük ve küçük harf içermeli'}
                error={Boolean(passwordError)}
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

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }} aria-live="polite">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {checks.length ? <CheckCircle color="success" fontSize="small" /> : <RadioButtonUnchecked color="disabled" fontSize="small" />}
                  <Typography variant="caption" color={checks.length ? 'text.primary' : 'text.secondary'}>En az 8 karakter</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {checks.lower ? <CheckCircle color="success" fontSize="small" /> : <RadioButtonUnchecked color="disabled" fontSize="small" />}
                  <Typography variant="caption" color={checks.lower ? 'text.primary' : 'text.secondary'}>Küçük harf içeriyor</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {checks.upper ? <CheckCircle color="success" fontSize="small" /> : <RadioButtonUnchecked color="disabled" fontSize="small" />}
                  <Typography variant="caption" color={checks.upper ? 'text.primary' : 'text.secondary'}>Büyük harf içeriyor</Typography>
                </Box>
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || Boolean(passwordError)}
                sx={{ mt: 1, py: 1.5 }}
              >
                {loading ? 'Oluşturuluyor...' : 'Kayıt Ol'}
              </Button>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Zaten hesabın var mı?{' '}
              <Link href="/login" style={{ color: '#6750A4', fontWeight: 500, textDecoration: 'none' }}>
                Giriş yap
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
