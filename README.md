# Installation du serveur d'administration avec Forest Admin

Forest Admin (https://forestadmin.com) est un service français permettant d'administrer une base de données simplement. Il fournit une interface paramétrable, puissante, directement dans votre navigateur et gratuitement jusqu'à 5 utilisateurs. Forest Admin permet aussi de gérer les droits d'accès et d'édition.

> Bien entendu, Forest Admin n'a jamais accès au contenu de la base de données !

Pour installer le serveur d'administration, la procédure est la suivante:

- prérequis: votre machine doit disposer de Node.js, git (et pm2 de façon optionelle). Si vous choisissez d'installer le serveur de Forest Admin sur une machine différente du serveur UpSignOn Pro, veillez donc à les installer également.
- `git clone --branch production https://github.com/UpSignOn/UpSignOn-pro-forest-admin.git <DESTINATION_DIRECTORY>`
- `npm install --only=prod`

- créez un compte sur Forest Admin: https://www.forestadmin.com/
- si ce n'est pas déjà fait, envoyez un email à giregk@upsignon.eu contenant l'adresse email de votre compte forest admin pour que nous vous donnions accès à votre interface d'administration (NB : ceci vous évitera de passer du temps à configurer Forest Admin vous même, ce qui est un peu fastidieux et nous permettra de maintenir à jour votre interface en fonction des futures évolutions)

- Lorsque vous aurez accès à votre interface, vous pourrez

  - modifier le nom du projet
  - modifier l'url de votre serveur d'administration
  - Configurer vos variables d'environnement nécessaires au lancement du serveur d'administration
    > NB: la variable FOREST_ENV_SECRET est fournie par Forest Admin. Vous pouvez la récupérer dans le panneau d'administration du projet Forest Admin, dans l'onglet 'environnements', en choisissant l'environnement "production"
    > NB: la variable FOREST_AUTH_SECRET sert à chiffrer les sessions. Vous pouvez la modifier à votre guise à tout instant en générant une chaine de caractères aléatoire.
    - si vous utilisez pm2, copiez le fichier ecosystem.example.config.js en y insérant vos propres variables d'environnement telles que spécifiées par Forest Admin
    - sinon vous pouvez créer un fichier .env à la racine du projet en copiant le contenu de `dot-env-example`
    - vous pouvez également si vous préférez définir ces variables d'environnement dans le PATH
  - Démarrer le serveur avec
    - si vous utilisez pm2 : `pm2 start ecosytem.production.config.js --only upsignon-pro-forest-admin-server`
    - sinon `node ./server.js`

# Mise à jour du serveur Forest Admin

- `git pull`
- `npm install`
- redémarrage du serveur :
  - avec pm2 : `pm2 reload ecosystem.production.config.js --only upsignon-pro-forest-admin-server`
  - sans pm2 : `node ./server.js`
