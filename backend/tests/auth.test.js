const request = require('supertest');
const app = require('../src/app');

const validUser = {
  username: 'kaeru',
  email: 'kaeru@example.com',
  password: 'Secret123',
};

const getCookieValue = (res, name) => {
  const cookie = res.headers['set-cookie']?.find((item) => item.startsWith(`${name}=`));
  return cookie?.split(';')[0].split('=')[1];
};

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a user and sets auth cookies', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body).not.toHaveProperty('token');
      expect(res.body.csrfToken).toEqual(expect.any(String));
      expect(getCookieValue(res, 'token')).toEqual(expect.any(String));
      expect(getCookieValue(res, 'csrfToken')).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        username: validUser.username,
        email: validUser.email,
      });
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects duplicate email or username', async () => {
      await request(app).post('/api/auth/register').send(validUser).expect(201);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(400);

      expect(res.body).toMatchObject({
        success: false,
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor',
      });
    });

    it('validates registration payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'x', email: 'bad-email', password: '123' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Geçersiz veri');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'weakuser', email: 'weak@example.com', password: 'password123' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((error) => error.message === 'Şifre en az bir büyük harf içermeli')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials and sets auth cookies', async () => {
      await request(app).post('/api/auth/register').send(validUser).expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body).not.toHaveProperty('token');
      expect(res.body.csrfToken).toEqual(expect.any(String));
      expect(getCookieValue(res, 'token')).toEqual(expect.any(String));
      expect(getCookieValue(res, 'csrfToken')).toEqual(expect.any(String));
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('rejects invalid credentials', async () => {
      await request(app).post('/api/auth/register').send(validUser).expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrong-password' })
        .expect(401);

      expect(res.body).toMatchObject({
        success: false,
        message: 'Geçersiz kimlik bilgileri',
      });
    });

    it('validates login payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Geçersiz veri');
    });
  });

  describe('GET /api/auth/me', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);

      expect(res.body).toMatchObject({
        success: false,
        message: 'Yetkisiz erişim',
      });
    });

    it('returns the authenticated user', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/register').send(validUser).expect(201);

      const res = await agent
        .get('/api/auth/me')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('logs out and clears auth cookies', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/register').send(validUser).expect(201);

      const res = await agent
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body).toMatchObject({ success: true, message: 'Çıkış yapıldı' });
      expect(res.headers['set-cookie'].some((cookie) => cookie.startsWith('token=;'))).toBe(true);
      expect(res.headers['set-cookie'].some((cookie) => cookie.startsWith('csrfToken=;'))).toBe(true);
    });
  });
});
