# LinguaPlus – Plateforme de cours d’anglais et de français

Rôles : administrateur, professeur, élève. Base de données : Supabase.

## Structure
```
linguaplus/
├── index.html          Page principale
├── css/style.css       Styles
├── js/config.js        URL et clé publique Supabase (à vérifier)
├── js/app.js           Application
└── supabase/schema.sql Tables, sécurité (RLS), cours en direct
```

## Installation
1. Supabase > SQL Editor : coller `supabase/schema.sql` puis Run.
2. Vérifier `js/config.js` (Project Settings > API Keys : clé « publishable »).
3. Authentication > Providers > Email : désactiver « Confirm email » si besoin.
4. Tester en local : `npx serve .` (ou extension VS Code Live Server), puis ouvrir la page.
5. Mettre en ligne : glisser le dossier sur Netlify, ou Vercel / GitHub Pages.
6. Créer le premier compte : il devient administrateur. Les suivants sont élèves ;
   l’admin change les rôles dans l’onglet Utilisateurs.

## Fonctions
- Admin : statistiques, rôles des utilisateurs, tous les cours.
- Professeur : cours, leçons avec quiz, livres, lancer un cours en direct (notifie les élèves).
- Élève : catalogue, inscription, leçons, quiz, progression, notifications en temps réel.

## Mise à jour v2
Si `schema.sql` a déjà été exécuté : exécuter uniquement `supabase/update-v2.sql`.
Nouveautés : page d’accueil publique, rediffusions des cours en direct, paramètres
(profil, mot de passe, langue), mot de passe oublié, interface en FR / EN / NL / AR.
Pour « mot de passe oublié » : Supabase > Authentication > URL Configuration >
ajouter l’adresse de votre site dans « Redirect URLs ».

## Mise à jour v3 : cours payants (Stripe)
1. Supabase > SQL Editor : exécuter `supabase/update-v3.sql` (nouvelle installation : `schema.sql` contient tout).
2. Créer un compte Stripe, puis déployer les deux fonctions (Supabase CLI) :
   ```
   supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
3. Stripe > Développeurs > Webhooks : ajouter l’adresse
   `https://<votre-projet>.supabase.co/functions/v1/stripe-webhook`, événement `checkout.session.completed`.
   Copier la clé `whsec_...` utilisée à l’étape 2.
4. Le professeur fixe prix, date et heure dans le cours (« Planification et prix »).
   L’élève clique « Payer… » → Stripe → retour sur le site → accès débloqué automatiquement + notification.
   L’admin voit les paiements et peut débloquer manuellement (onglet Paiements).
Le contenu (leçons, livres, liens de cours) n’est visible que par les élèves inscrits.

## Mise à jour v4 : niveaux, professeurs, élèves, devises
1. Exécuter `supabase/update-v4.sql` (nouvelle installation : `schema.sql` contient tout).
2. Déployer la fonction : `supabase functions deploy create-user` (l’administrateur crée les professeurs dans Paramètres).
3. Devises : EUR, USD, ZAR (rand sud-africain), AED (dirham) et SAR (riyal). Les taux de l’aperçu sont dans `js/config.js` (`RATES`) : à ajuster.
   Vérifiez dans Stripe que ces devises sont activées pour votre compte.

## Mise à jour v5 : live limité, présence privée, exclusion
1. Exécuter `supabase/update-v5.sql` (nouvelle installation : `schema.sql` contient tout).
2. Le lien de visio n’est plus lisible directement : l’élève le reçoit en cliquant « Rejoindre »
   (si inscrit, non exclu et places disponibles). Le professeur voit seul la liste des présents.
3. « Retirer » bloque l’élève dans l’application (lien refusé, notification). Pour l’expulser aussi de
   la salle de visio déjà ouverte, utilisez l’outil de visio (Zoom, Meet…).
