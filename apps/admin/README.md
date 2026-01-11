# Tada Admin

Administration panel for the Tada application.

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Update the environment variables in `.env` with your values.

4. Start the development server:
```bash
bun dev
```

5. Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Features

- Dashboard with key metrics
- User management
- Post management
- System monitoring
- Admin actions

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Next Safe Action
- Zod
- Bun

## Project Structure

```
src/
  ├── app/              # Next.js app directory
  ├── components/       # React components
  ├── actions/         # Server actions
  └── lib/             # Utilities and helpers
``` 