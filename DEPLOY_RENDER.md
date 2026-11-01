# Guide de Déploiement : Netlify (Frontend) & Render (Backend)

Ce document décrit pas-à-pas la mise en production du site **Studio BoomRang** sur Netlify sans Replit, avec le backend et la base de données hébergés sur Render.

---

## 1. Déploiement du Frontend sur Netlify

### Configuration Netlify
Le fichier `netlify.toml` à la racine est déjà configuré :
- **Publish directory** : `artifacts/studio-boomrang/dist/public`
- **Build command** : `PORT=8080 BASE_PATH=/ pnpm --filter @workspace/studio-boomrang run typecheck && PORT=8080 BASE_PATH=/ pnpm --filter @workspace/studio-boomrang run build`
- **Routing SPA** : toutes les routes (`/*`) redirigent vers `/index.html` avec un statut `200`.

### Variables d'environnement sur Netlify
Dans votre tableau de bord Netlify (**Site configuration > Environment variables**) :
1. `VITE_CLERK_PUBLISHABLE_KEY` : votre clé publique Clerk (`pk_live_...` ou `pk_test_...`).
2. `VITE_API_BASE_URL` : l'URL de votre backend déployé sur Render (ex. `https://studio-boomrang-api.onrender.com`).
3. `NODE_VERSION` : `22`
4. `PNPM_VERSION` : `10.30.3`

---

## 2. Déploiement du Backend sur Render

Le fichier `render.yaml` à la racine configure automatiquement le service web Node.js et la base de données PostgreSQL managée.

### Étapes sur Render :
1. Créez un compte ou connectez-vous sur [render.com](https://render.com).
2. Cliquez sur **New +** > **Blueprint**.
3. Connectez votre dépôt Git GitHub / GitLab.
4. Render va détecter le fichier `render.yaml` et créer deux ressources :
   - Une base de données PostgreSQL gratuite (`studio-boomrang-db`).
   - Un Web Service Node.js (`studio-boomrang-api`).
5. Renseignez les variables d'environnement secrètes dans l'interface Render :
   - `CLERK_PUBLISHABLE_KEY` : votre clé publique Clerk.
   - `CLERK_SECRET_KEY` : votre clé secrète Clerk (`sk_live_...` ou `sk_test_...`).
   - `GEMINI_API_KEY` : votre clé d'API Google Gemini.
   - `MAXICASH_MERCHANT_ID` : (si utilisé pour les paiements MaxiCash).
   - `MAXICASH_MERCHANT_PASSWORD` : (si utilisé pour les paiements MaxiCash).
6. Cliquez sur **Apply**.
7. Une fois déployé, copiez l'URL de votre Web Service Render (ex: `https://studio-boomrang-api.onrender.com`) et ajoutez-la sur Netlify dans `VITE_API_BASE_URL`.

---

## 3. Configuration Clerk

Dans le tableau de bord Clerk ([dashboard.clerk.com](https://dashboard.clerk.com)) :
1. Allez dans **Domains** ou **Paths**.
2. Dans **Allowed Origins** ou **Authorized redirect URLs**, ajoutez votre domaine Netlify (ex: `https://studioboomrang.netlify.app` ou votre domaine personnalisé).
3. Assurez-vous d'utiliser directement votre Publishable Key `pk_live_...` / `pk_test_...`.
