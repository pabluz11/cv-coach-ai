# CV Coach AI — FORGE by Pracuj.pl

AI-powered CV analyzer dla polskiego rynku pracy.

## Deploy na Vercel (5 minut)

### 1. Wrzuć na GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create cv-coach-ai --public --push
```

### 2. Deploy na Vercel
1. Wejdź na [vercel.com](https://vercel.com) → "Add New Project"
2. Zaimportuj repo z GitHub
3. W sekcji **Environment Variables** dodaj:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (Twój klucz z [console.anthropic.com](https://console.anthropic.com))
4. Kliknij **Deploy**

Gotowe — dostaniesz link `https://cv-coach-ai.vercel.app`

## Lokalnie
```bash
npm install
npm run dev
```
