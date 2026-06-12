# Tickit - Secure Full-Stack Todo Application

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

Tickit, kullanıcı kimlik doğrulaması, görev CRUD, öncelik, son tarih/saat, renk vurguları, arama, sıralama, filtreleme, gecikme göstergesi ve güvenliğe odaklı çerez tabanlı kimlik doğrulama akışı içeren tam yığın bir yapılacaklar uygulamasıdır.

## 🛠️ Teknoloji Yığın

| Katman | Teknoloji |
| --- | --- |
| **Frontend** | Next.js 16, React 19, MUI 9 |
| **Backend** | Node.js, Express 5 |
| **Veritabanı** | MongoDB, Mongoose |
| **Kimlik Doğrulama** | HttpOnly çerezlerde JWT |
| **Güvenlik** | Helmet, CORS, hız sınırlama, CSRF koruması, istek doğrulama, NoSQL temizleme, bcrypt |
| **Testler** | Jest, Supertest, mongodb-memory-server |

## 📁 Proje Yapısı

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

## 🔒 Güvenlik Modeli

Tickit, çerez tabanlı JWT kimlik doğrulaması kullanır:
- Backend, JWT'yi `token` çerezine yazar.
- `token` çerezi `HttpOnly` olduğu için frontend JavaScript tarafından okunamaz.
- Backend ayrıca okunabilir bir `csrfToken` çerezi ayarlar.
- `POST`, `PUT` ve `DELETE` gibi güvenli olmayan istekler `X-CSRF-Token` göndermelidir.

## 🚀 Test ve Doğrulama

Backend testleri:
```bash
cd backend
npm test
```

Frontend üretimi:
```bash
cd frontend
npm run build
```
