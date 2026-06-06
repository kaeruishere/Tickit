# Tickit

Tickit, kullanıcı kimlik doğrulaması, görev CRUD, öncelik, son tarih/saat, renk vurguları, arama, sıralama, filtreleme, gecikme göstergesi ve güvenliğe odaklı çerez tabanlı kimlik doğrulama akışı içeren tam yığın bir yapılacaklar uygulamasıdır.

## Yığın

| Katman | Teknoloji |
| --- | --- |
| Frontend | Next.js 16, React 19, MUI 9 |
| Backend | Node.js, Express 5 |
| Veritabanı | MongoDB, Mongoose |
| Kimlik Doğrulama | HttpOnly çerezlerde JWT |
| Güvenlik | Helmet, CORS, hız sınırlama, CSRF koruması, istek doğrulama, NoSQL temizleme, bcrypt |
| Testler | Jest, Supertest, mongodb-memory-server |

## Proje Yapısı

```text
todo-app/
  backend/
    src/
      app.js
      server.js
      config/db.js
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
    tests/
    .env.example
  frontend/
    app/
    components/
    lib/
    public/favicon_io/
    .env.local.example
```

## Güvenlik Modeli

Tickit, çerez tabanlı JWT kimlik doğrulaması kullanır:

- Backend, JWT'yi `token` çerezine yazar.
- `token` çerezi `HttpOnly` olduğu için frontend JavaScript tarafından okunamaz.
- Backend ayrıca okunabilir bir `csrfToken` çerezi ayarlar.
- `POST`, `PUT` ve `DELETE` gibi güvenli olmayan istekler `X-CSRF-Token` göndermelidir.
- Frontend Axios istemcisi `csrfToken`'ı okur ve otomatik olarak gönderir.
- Axios, tarayıcı çerezlerinin API isteklerine dahil edilmesi için `withCredentials: true` kullanır.

İlgili dosyalar:

- `backend/src/utils/authCookies.js`
- `backend/src/middleware/csrf.js`
- `backend/src/middleware/auth.js`
- `frontend/lib/api.js`



## Test ve Doğrulama

Backend testleri:

```bash
cd backend
npm test
```

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend üretim yapısı:

```bash
cd frontend
npm run build
```

## API Özeti

| Yöntem | Uç Nokta | Kimlik Doğrulama | Açıklama |
| --- | --- | --- | --- |
| GET | `/api/health` | Hayır | Sağlık kontrolü |
| POST | `/api/auth/register` | Hayır | Kullanıcı kaydı ve kimlik doğrulama çerezleri ayarlama |
| POST | `/api/auth/login` | Hayır | Kullanıcı girişi ve kimlik doğrulama çerezleri ayarlama |
| POST | `/api/auth/logout` | Evet + CSRF | Kimlik doğrulama çerezlerini temizleme |
| GET | `/api/auth/me` | Evet | Mevcut kullanıcıyı döndürme |
| GET | `/api/tasks` | Evet | Mevcut kullanıcının görevlerini listeleme |
| POST | `/api/tasks` | Evet + CSRF | Görev oluşturma |
| PUT | `/api/tasks/:id` | Evet + CSRF | Görevi güncelleme |
| DELETE | `/api/tasks/:id` | Evet + CSRF | Görevi silme |

## Özellikler

- Kayıt olma ve giriş yapma
- HttpOnly çerez kimlik doğrulaması
- CSRF koruması
- Görev oluşturma, düzenleme, silme, tamamlama
- İsteğe bağlı detaylarla hızlı görev oluşturma
- Açıklama, öncelik, son tarih/saat, renk
- Gecikmiş görev göstergesi
- Başlığa veya açıklamaya göre arama
- Tümünü, aktifleri, tamamlananları filtreleme
- En yeni, en eski, son tarihe, önceliğe göre sıralama
- Kullanıcı selamlaması ve pano istatistikleri