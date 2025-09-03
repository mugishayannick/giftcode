GiftCode is a small app for assigning each player a unique number (1..55), letting players log in by name to see their number, choose another player's number, and saving the choice privately. Admin can seed names and view selections.

## Getting Started

Create a `.env.local` with:

```
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=giftcode
ADMIN_PASSWORD=change-me
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 to see the app.

Player flow is on `src/app/page.tsx`. Admin dashboard is on `/admin`.

### Seed players

1. Visit `/admin` and log in with the password you set in `ADMIN_PASSWORD`.
2. Paste 55 names (one per line or comma-separated) and click "Seed names".

### API routes

- `POST /api/login` { name }
- `POST /api/select` { playerId, selectedPlayerId }
- `GET /api/names`
- `POST /api/admin/login` { password }
- `GET /api/admin/players`
- `POST /api/admin/seed` { names: string[] }, `GET /api/admin/seed` (count)

### Deploying to Vercel

Set the following Environment Variables in Vercel:

- `MONGODB_URI`
- `MONGODB_DB` (optional, defaults to `giftcode`)
- `ADMIN_PASSWORD`

Then deploy normally. API routes run on Vercel serverless.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
