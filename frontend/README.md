# Tickit Frontend

This is the Next.js frontend for Tickit. The full project documentation is in the repository root:

- `../README.md`
- `../doc/rapor.html`
- `../doc/implementationplan.html`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Create `.env.local` from `.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Verification

```bash
npm run lint
npm run build
```

## Auth Note

Authentication is handled by the backend with HttpOnly cookies. Axios is configured with `withCredentials: true` and sends the CSRF token header automatically for unsafe requests.

See `lib/api.js`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
