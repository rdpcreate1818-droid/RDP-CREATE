# RDP CREATE AI Agent — Starter Kit

இந்த starter project உங்கள் Netlify website-க்கு multilingual AI chat + WhatsApp Cloud API integration-க்கான அடிப்படை அமைப்பு.

## இதில் உள்ளவை
- Tamil / Telugu / English language selector
- Website AI chat widget
- Netlify Function மூலம் OpenAI Responses API call
- WhatsApp Cloud API webhook verification + incoming message handler
- WhatsApp reply send function
- Environment variable placeholders; எந்த secret-உம் source code-ல் இல்லை

## முக்கியம்
இது starter implementation. உங்கள் தற்போதைய website-ன் source code / Git repository இல்லாமல் அதை நேரடியாக மாற்ற முடியாது. முதலில் தனி Netlify test site-ல் deploy செய்து சோதிக்கவும். தற்போதைய website-ஐ backup செய்யாமல் overwrite செய்ய வேண்டாம்.

## 1. Files-ஐ உங்கள் website project-ல் சேர்க்கவும்
இந்த ZIP-ஐ unzip செய்யவும். `public/index.html` என்பது demo chat page. உங்கள் website ஏற்கனவே HTML/CSS/JS அல்லது React/Vite project ஆக இருந்தால், அதில் உள்ள design-ஐ அழிக்காமல் chat widget-ஐ இணைக்க வேண்டும். `netlify/functions/` மற்றும் `netlify.toml`-ஐ project root-ல் சேர்க்கவும்.

## 2. Environment variables அமைக்கவும்
Netlify Dashboard → உங்கள் site → Project configuration → Environment variables.
Functions scope-க்கு இவற்றை அமைக்கவும்:

- `OPENAI_API_KEY` = உங்கள் OpenAI API key
- `OPENAI_MODEL` = உங்கள் account-ல் கிடைக்கும் model ID
- `WHATSAPP_TOKEN` = Meta WhatsApp Cloud API access token
- `WHATSAPP_PHONE_NUMBER_ID` = Meta-வின் Phone Number ID
- `WHATSAPP_VERIFY_TOKEN` = நீங்களே உருவாக்கும் நீளமான random verification string
- `WHATSAPP_APP_SECRET` = Meta App Secret (production webhook signature verification சேர்க்கத் தேவை)
- `WHATSAPP_API_VERSION` = Meta dashboard/docs-ல் தற்போது ஆதரிக்கப்படும் Graph API version (உதா. `vXX.X` என்பதை உண்மையான version-ஆல் மாற்றவும்)
- `WHATSAPP_SEND_SECRET` = manual send endpoint பயன்படுத்தினால் நீங்களே உருவாக்கும் secret

Secrets-ஐ HTML/JavaScript-ல் எழுத வேண்டாம். Environment variables மாற்றிய பின் redeploy செய்யவும்.

## 3. AI chat சோதனை
Deploy செய்த பின் `https://YOUR-SITE.netlify.app/api/chat` endpoint POST request பெறும். Website widget-ல் ஒரு message அனுப்பவும். API key இல்லையெனில் demo fallback பதில் காட்டும்.

## 4. WhatsApp Cloud API அமைப்பு
1. Meta for Developers-ல் account மற்றும் app உருவாக்கவும்.
2. WhatsApp product சேர்த்து test phone number / business phone number அமைக்கவும்.
3. `WHATSAPP_TOKEN` மற்றும் `WHATSAPP_PHONE_NUMBER_ID` நிரப்பவும்.
4. Webhook callback URL: `https://YOUR-SITE.netlify.app/api/whatsapp-webhook`
5. Verify token: `WHATSAPP_VERIFY_TOKEN`-ல் வைத்த அதே value.
6. `messages` webhook event subscribe செய்யவும்.
7. Meta test recipient-க்கு message அனுப்பி சோதிக்கவும். Incoming text messages-க்கு AI reply அனுப்பும் starter flow சேர்க்கப்பட்டுள்ளது.

Production-க்கு முன் `X-Hub-Signature-256` webhook signature validation, rate limiting, spam prevention, duplicate-message protection, database, durable queue, logging, customer consent, privacy notice ஆகியவற்றை முழுமைப்படுத்தவும். இந்த starter-ல் `WHATSAPP_APP_SECRET` வைத்திருப்பது மட்டும் signature validation செய்துவிடாது; production deployment-க்கு signature verification code சேர்க்கப்பட வேண்டும். WhatsApp API version-ஐ Meta docs-ல் சரிபார்த்து environment variable-ல் அமைக்கவும்.

## 5. Booking / payments / customer records
இப்போது chat assistant customer enquiry-க்கு உதவும். உண்மையான booking records, payment status, file delivery, admin dashboard ஆகியவற்றுக்கு database (உதா. Supabase/Postgres) மற்றும் admin authentication சேர்க்க வேண்டும். AI-க்கு payment completed என்று தானாக ஊகிக்க அனுமதிக்க வேண்டாம்; verified payment provider/database status-ஐ மட்டுமே நம்பவும்.

## 6. Deploy
- GitHub-ல் உங்கள் project repository-க்கு files commit செய்யவும்; அல்லது Netlify CLI பயன்படுத்தவும்.
- Netlify build settings உங்கள் existing framework-க்கு ஏற்ப இருக்க வேண்டும்.
- Test deploy வெற்றியடைந்த பிறகே production site-க்கு மாற்றங்களை merge செய்யவும்.

## Official documentation
- OpenAI API: https://developers.openai.com/api/docs
- Netlify Functions: https://docs.netlify.com/build/functions/
- Netlify environment variables: https://docs.netlify.com/build/functions/environment-variables/
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/
