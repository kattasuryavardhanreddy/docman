## DocMan Frontend

Next.js frontend for the DocMan document repository.

## Local configuration

Local backend configuration lives in `.env.local`:

```bash
DOCMAN_API_BASE_URL=http://localhost:5190
```

`.env.local` is gitignored. A committed example is available in `.env.example`.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default and proxies `/api/v1/*` requests to `DOCMAN_API_BASE_URL`.

## Docker

Build the image:

```bash
docker build -t docman-frontend .
```

Run the container:

```bash
docker run --rm -p 3000:3000 -e DOCMAN_API_BASE_URL=http://host.docker.internal:5190 docman-frontend
```

If the backend is another container on the same Docker network, replace `http://host.docker.internal:5190` with that service URL.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- Server-side API calls use `DOCMAN_API_BASE_URL`.
- Browser download links use the Next.js `/api/v1/*` proxy so the client does not need to know the backend host.
- Docker uses the Next.js standalone output for a smaller runtime image.
