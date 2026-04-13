# Sullivan Parks & Recreation

Next.js 14 · Tailwind CSS · Supabase · Vercel  
Domain: parks-rec.sullivanmaine.org

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Phase 1 — running now
Static content. Edit data arrays directly in each page file.

## Phase 2 — CMS (next sprint)
- Supabase tables: parks, events, articles, photos
- Admin dashboard at /admin
- Magic-link auth for town staff
- Rich text editor (TipTap)

## Phase 3 — Virtual advisor
- RAG chatbot (Vecinita-style)
- Groq / LLaMA 3.3 70B

## Add logo / hero photo
1. Drop logo into `public/logo.png`
2. Drop hero photo into `public/hero.jpg`
3. Uncomment the `<Image>` blocks in `src/app/page.js`

## Deploy to Vercel
```bash
vercel --prod
```
Set environment variables in Vercel dashboard.
