# RDP CREATE — Website + AI Chat Starter

இந்த project-ல் premium black & gold RDP CREATE website, Tamil/English/Telugu AI enquiry chat, Netlify Functions மற்றும் WhatsApp Cloud API webhook starter உள்ளது.

## Folder அமைப்பு

```text
RDP-CREATE/
├── public/
│   └── index.html
├── netlify/
│   └── functions/
│       ├── chat.mjs
│       ├── whatsapp-send.mjs
│       └── whatsapp-webhook.mjs
├── netlify.toml
├── package.json
└── README_TAMIL.md
```

## 1. முதலில் Website-ஐத் தனியாகச் சோதிக்கவும்

- இந்த ZIP-ஐ Extract செய்யவும்.
- GitHub repository-ல் மேலே உள்ள folder structure-ஐ அப்படியே upload செய்யவும்.
- `public/index.html` தான் website முகப்புப் பக்கம்.
- `public/public` என்ற இரட்டை folder உருவாக்க வேண்டாம்.
- `.github/workflows`-ல் பழைய webpack build workflow இருந்தால் அதை நீக்கவும். இந்த static website-க்கு webpack build தேவையில்லை.

## 2. WhatsApp எண்ணைச் சேர்க்கவும்

`public/index.html` கோப்பில் இந்த வரியைத் தேடவும்:

```js
const WHATSAPP_NUMBER = "91YOURNUMBER";
```

`91` உட்பட country code உடன் உங்கள் WhatsApp Business எண்ணை digits மட்டும் வைத்து மாற்றவும். உதாரணம்: `919876543210`. இது public website-ல் காட்டப்படும்; பயன்படுத்த அனுமதிக்கப்பட்ட business எண்ணை மட்டும் இடவும்.

## 3. Netlify deploy

1. Netlify-ல் account உருவாக்கி GitHub-ஐ connect செய்யவும்.
2. `rdpcreate1818-droid/RDP-CREATE` repository-ஐத் தேர்வு செய்யவும்.
3. Build command காலியாக விடவும்.
4. Publish directory: `public`.
5. Deploy செய்யவும்.

`netlify.toml` ஏற்கனவே publish directory மற்றும் functions directory-ஐ அமைக்கிறது. Build command தேவையில்லை.

## 4. Website AI Chat அமைப்பு

Netlify → Site configuration / Environment variables பகுதியில்:

- `OPENAI_API_KEY` = உங்கள் OpenAI API key
- `OPENAI_MODEL` = உங்கள் API account-ல் கிடைக்கும் model ID

இவை அமைக்கப்படாவிட்டாலும் chat demo fallback பதில் தரும். API key-ஐ HTML, GitHub அல்லது browser code-ல் ஒருபோதும் இட வேண்டாம். Environment variables அமைத்த பின் redeploy செய்யவும்.

## 5. WhatsApp Cloud API (விருப்பமான மேம்பட்ட அமைப்பு)

Environment variables:

- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION` (Meta dashboard-ல் தற்போது ஆதரிக்கப்படும் வடிவம், உதா. `vXX.X` அல்ல; உண்மையான version)
- `WHATSAPP_VERIFY_TOKEN` (நீங்களே உருவாக்கும் ரகசிய string)
- `WHATSAPP_APP_SECRET` (Meta App Secret; webhook POST signature சரிபார்க்க இது கட்டாயம்)
- `WHATSAPP_SEND_SECRET` (server-side send endpoint பயன்படுத்தினால்)

Meta webhook callback URL: `https://YOUR-SITE.netlify.app/api/whatsapp-webhook`

Webhook POST-களுக்கு `X-Hub-Signature-256` சரிபார்ப்பு சேர்க்கப்பட்டுள்ளது. WhatsApp Cloud API setup, token permissions, business verification மற்றும் message template rules ஆகியவை Meta account-ஐப் பொறுத்தது. இவை அமைக்கப்படும் வரை WhatsApp auto-reply இயங்காது.

## பாதுகாப்பு குறிப்புகள்

- API keys / tokens-ஐ GitHub-ல் commit செய்ய வேண்டாம்.
- `whatsapp-send` endpoint secret header இல்லாமல் அனுப்ப அனுமதிக்காது. Secret-ஐ frontend-ல் வைக்க வேண்டாம்.
- Production-க்கு முன் rate limiting, duplicate webhook event handling, customer consent, privacy notice மற்றும் monitoring சேர்க்கவும்.
- இந்த starter தானாக booking/payment confirmation உருவாக்காது. உண்மையான booking database மற்றும் payment verification தனியாக அமைக்கப்பட வேண்டும்.
