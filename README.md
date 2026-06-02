# Fanny — Football Fan Debater ⚽

A voice-powered AI football debate app for World Cup 2026. Talk to Fanny — a loud, opinionated, pub-chat football fan — about your team's chances.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS with Web Speech API (voice in + TTS out)
- **Backend**: Netlify Functions (proxies Claude API securely)
- **AI**: Claude claude-sonnet-4-20250514 via Anthropic API

## Project Structure

```
fanny-debater/
├── public/
│   └── index.html          # Main app
├── netlify/
│   └── functions/
│       └── chat.js         # Netlify Function — Claude API proxy
├── netlify.toml            # Netlify config
└── README.md
```

## Local Development

```bash
npm install -g netlify-cli
netlify dev
```

Set `ANTHROPIC_API_KEY` in a `.env` file for local dev:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Deploy to Netlify

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Fanny debate app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fanny-debater.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Choose your GitHub repo
3. Build settings are auto-detected from `netlify.toml`
4. Click **Deploy site**

### 3. Add your API keys

In Netlify dashboard:
- Go to **Site configuration** → **Environment variables**
- Add: `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
- Add: `ELEVENLABS_API_KEY` = your key from [elevenlabs.io](https://elevenlabs.io)
- Redeploy the site

## Voice Support

Works best in **Chrome** or **Edge**. Safari has partial support. Firefox does not support the Web Speech API.

## Roadmap

- [ ] Multi-language support (Spanish, French, Portuguese, German)
- [ ] Live squad data via football API
- [ ] Team flag avatars
- [ ] Shareable debate screenshots
- [ ] PWA / installable app
