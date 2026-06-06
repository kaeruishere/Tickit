const request = require('supertest');
const app = require('../src/app');

const createUserAndToken = async (overrides = {}) => {
  const agent = request.agent(app);
  const user = {
    username: overrides.username || 'kaeru',
    email: overrides.email || 'kaeru@example.com',
    password: overrides.password || 'Secret123',
  };

  const res = await agent.post('/api/auth/register').send(user).expect(201);
  const csrfToken = res.headers['set-cookie']
    .find((cookie) => cookie.startsWith('csrfToken='))
    .split(';')[0]
    .split('=')[1];

  return { user, agent, csrfToken };
};

const csrf = (csrfToken) => ({ 'X-CSRF-Token': csrfToken });

describe('Tasks API', () => {
  it('requires authentication for task routes', async () => {
    const res = await request(app).get('/api/tasks').expect(401);

    expect(res.body).toMatchObject({
      success: false,
      message: 'Yetkisiz erişim',
    });
  });

  it('creates and lists a task for the authenticated user', async () => {
    const { agent, csrfToken } = await createUserAndToken();
    const dueAt = '2026-06-06T09:00:00.000Z';

    const created = await agent
      .post('/api/tasks')
      .set(csrf(csrfToken))
      .send({
        title: 'Teknik raporu bitir',
        description: 'Backend testlerini de ekle',
        priority: 'high',
        color: '#6750A4',
        category: 'İş',
        dueAt,
      })
      .expect(201);

    expect(created.body.success).toBe(true);
    expect(created.body.task).toMatchObject({
      title: 'Teknik raporu bitir',
      description: 'Backend testlerini de ekle',
      completed: false,
      priority: 'high',
      color: '#6750A4',
      category: 'İş',
    });
    expect(created.body.task.dueAt).toBe(dueAt);

    const list = await agent
      .get('/api/tasks')
      .expect(200);

    expect(list.body.success).toBe(true);
    expect(list.body.count).toBe(1);
    expect(list.body.tasks[0].title).toBe('Teknik raporu bitir');
    expect(list.body.tasks[0].category).toBe('İş');
  });

  it('validates task creation payload', async () => {
    const { agent, csrfToken } = await createUserAndToken();

    const res = await agent
      .post('/api/tasks')
      .set(csrf(csrfToken))
      .send({
        title: '',
        priority: 'urgent',
        color: 'purple',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Geçersiz veri');
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('does not persist unexpected task fields', async () => {
    const { agent, csrfToken } = await createUserAndToken();

    const created = await agent
      .post('/api/tasks')
      .set(csrf(csrfToken))
      .send({
        title: 'Allowlist kontrolü',
        isAdmin: true,
      })
      .expect(400);

    expect(created.body.success).toBe(false);
    expect(created.body.message).toBe('Geçersiz veri');
  });

  it('updates, completes, and deletes a task', async () => {
    const { agent, csrfToken } = await createUserAndToken();

    const created = await agent
      .post('/api/tasks')
      .set(csrf(csrfToken))
      .send({ title: 'Eski başlık' })
      .expect(201);

    const taskId = created.body.task._id;

    const updated = await agent
      .put(`/api/tasks/${taskId}`)
      .set(csrf(csrfToken))
      .send({
        title: 'Yeni başlık',
        completed: true,
        priority: 'low',
        category: 'Kişisel',
      })
      .expect(200);

    expect(updated.body.task).toMatchObject({
      title: 'Yeni başlık',
      completed: true,
      priority: 'low',
      category: 'Kişisel',
    });

    await agent
      .delete(`/api/tasks/${taskId}`)
      .set(csrf(csrfToken))
      .expect(200);

    const list = await agent
      .get('/api/tasks')
      .expect(200);

    expect(list.body.count).toBe(0);
  });

  it('prevents users from updating or deleting another user task', async () => {
    const first = await createUserAndToken();
    const second = await createUserAndToken({
      username: 'mika',
      email: 'mika@example.com',
    });

    const created = await first.agent
      .post('/api/tasks')
      .set(csrf(first.csrfToken))
      .send({ title: 'Sahipli görev' })
      .expect(201);

    const taskId = created.body.task._id;

    await second.agent
      .put(`/api/tasks/${taskId}`)
      .set(csrf(second.csrfToken))
      .send({ title: 'Başkasının güncellemesi' })
      .expect(404);

    await second.agent
      .delete(`/api/tasks/${taskId}`)
      .set(csrf(second.csrfToken))
      .expect(404);

    const ownerList = await first.agent
      .get('/api/tasks')
      .expect(200);

    expect(ownerList.body.count).toBe(1);
    expect(ownerList.body.tasks[0].title).toBe('Sahipli görev');
  });

  it('requires CSRF token for unsafe task requests', async () => {
    const { agent } = await createUserAndToken();

    const res = await agent
      .post('/api/tasks')
      .send({ title: 'CSRF olmadan' })
      .expect(403);

    expect(res.body).toMatchObject({
      success: false,
      message: 'CSRF doğrulaması başarısız',
    });
  });
});
