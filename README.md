# Installation du serveur d'administration avec Forest Admin

Forest Admin (https://forestadmin.com) est un service français permettant d'administrer une base de données simplement. Il fournit une interface paramétrable, puissante, directement dans votre navigateur et gratuitement jusqu'à 5 utilisateurs. Forest Admin permet aussi de gérer les droits d'accès et d'édition.

> Bien entendu, Forest Admin n'a jamais accès au contenu de la base de données !

Pour installer le serveur d'administration, la procédure est la suivante:

- prérequis: votre machine doit disposer de Node.js, git (et pm2 de façon optionelle). Si vous choisissez d'installer le serveur de Forest Admin sur une machine différente du serveur UpSignOn Pro, veillez donc à les installer également.
- `git clone --branch production https://github.com/UpSignOn/UpSignOn-pro-forest-admin.git <DESTINATION_DIRECTORY>`
- `npm install --only=prod`

- créez un compte sur Forest Admin: https://www.forestadmin.com/
- si ce n'est pas déjà fait, envoyez un email à giregk@upsignon.eu contenant l'adresse email de votre compte forest admin pour que nous vous donnions accès à votre interface d'administration (NB : ceci vous évitera de passer du temps à configurer Forest Admin vous même, ce qui est un peu fastidieux et nous permettra de maintenir à jour votre interface en fonction des futures évolutions)

# Configuration des variables d'environnements pour le serveur Forest Admin

- créez un fichier .env en copiant le contenu de `dot-env-example` à savoir

```
FOREST_ENV_SECRET=secret_provided_by_forest_admin
FOREST_AUTH_SECRET=2ab25b921c4bf35bb43b1f5b7aaa04e27a3142ada836fcd2323ea148ad953145fd1cac1b1a2250fd33d13499345c

NODE_ENV=production

APPLICATION_PORT=3310
APPLICATION_URL=https://admin-upsignon.domaine.fr

DATABASE_URL=postgres://<dbUser>:<bdPwd>@localhost:5432/<bdName>
DOCKER_DATABASE_URL=postgres://<dbUser>:<bdPwd>@host.docker.internal:5432/<bdName>

EMAIL_HOST=smtp.ionos.fr
EMAIL_PORT=587
EMAIL_USER=no-reply@domain.com
EMAIL_PASS=some-password

SSL_CERTIFICATE_KEY_PATH=
SSL_CERTIFICATE_CRT_PATH=
```

- la valeur de FOREST_ENV_SECRET est fournie par Forest Admin. Vous pouvez y accéder en allant sur https://app.forestadmin.com/nomDuProjetForest/settings/environments/details/Production
- la valeur de FOREST_AUTH_SECRET sert à chiffrer les sessions des utilisateurs qui se connectent à l'interface de Forest Admin. Remplacez la par une chaîne de caractères aléatoire de votre choix.
- les variables EMAIL configurent une adresse email utilisée dans le cadre des procédures de mot de passe oublié déclenchées par les utilisateurs. Lorsque vous autoriserez un utilisateur à réinitialiser son mot de passe à partir de Forest Admin, l'utilisateur recevra un email provenant de cette adresse.
  - pour EMAIL_PORT, les deux valeurs classiques sont 587 (non-sécurisé) et 465 (sécurisé)
- SSL_CERTIFICATE_KEY_PATH et SSL_CERTIFICATE_CRT_PATH configurent les chemins d'accès au certificat local permettant de chiffrer les communications entre le reverse proxy et le serveur local de Forest Admin. Si l'une de ces deux variables est vide, le serveur ouvre une connexion http au lieu d'une connection https. Ces deux variables sont dont optionnelles.

- Démarrez le serveur avec

  - si vous utilisez pm2 : `pm2 start ecosytem.production.config.js --only upsignon-pro-forest-admin-server`
  - sinon `node ./server.js`

# Configuration du reverse proxy

Voici un example de configuration possible avec Nginx

```
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
server_tokens off;

add_header X-Frame-Options "DENY";
add_header X-XSS-Protection "1; mode=block";
add_header X-DNS-Prefetch-Control "off";
add_header X-Download-Options "noopen";
add_header X-Content-Type-Options "nosniff";
add_header X-Permitted-Cross-Domain-Policies "none";

ssl_certificate /etc/certificate/myDomainCertificateSignedByTrustedAuthority.cer;
ssl_certificate_key /etc/certificate/myDomainCertificatePrivateKey.key;
ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA HIGH !RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS";

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name admin-upsignon.my-domain.fr;
  proxy_ssl_verify off;
  root /home/upsignonpro/UpSignOn-pro-forest-admin/public/;

  location / {
    proxy_pass http://localhost:3011;
  }
}

```

NB, contrairement à la configuration proposée pour le serveur UpSignOn Pro, le block

```
  if ($request_method !~ ^(GET|HEAD|POST)$ )
  {
    return 405;
  }
```

ne doit pas être présent.

# Déclaration de l'url dans la config du projet sur le site de Forest Admin

- sur https://app.forestadmin.com/nomDuProjetForest/settings/environments/details/Production, la valeur du champ "Admin backend URL" doit être égale à l'url sur laquelle est servie votre serveur forest admin.

Votre interface d'administration devrait maintenant être accessible sur le site de Forest Admin.

A partir des paramètres du projet Forest Admin, vous pouvez si vous le souhaitez

- modifier le nom du projet
- modifier l'url de votre serveur d'administration (attention à la modifier aussi dans les variables d'environnement du serveur Forest Admin dans ce cas)

En utilisant l'interface Forest Admin, vous pouvez maintenant configurer les adresses emails autorisées et les urls des sites utiles à vos collaborateurs.

# Troubleshooting

En cas de problème, vérifiez les points suivants:

- vérifiez les valeurs de vos variables d'environnement
- en saisissant l'url du serveur Forest Admin dans votre navigateur, vous devriez arriver sur une page disant "Your server is running"

  - si ce n'est pas le cas, vérifiez que vous voyez bien un log dans logs/server-output.log pour cette requête GET. Si c'est le cas, vérifiez que votre base de données est démarrée. Sinon vérifiez votre configuration Nginx.
  - Si vous voyez la page your server is running et que l'interface forest admin ne fonctionne toujours pas, vérifiez la configuration de votre reverse proxy. En particulier, vérifiez que le block

  ```
  if ($request_method !~ ^(GET|HEAD|POST)$ )
  {
    return 405;
  }
  ```

  n'est pas présent dans votre config Nginx pour le serveur Forest Admin. (Cas où vous auriez copié-collé la configuration proposée pour le serveur UpSignOn pro)

# Mise à jour du serveur Forest Admin

- `git pull`
- `npm install`
- redémarrage du serveur :
  - avec pm2 : `pm2 reload ecosystem.production.config.js --only upsignon-pro-forest-admin-server`
  - sans pm2 : `node ./server.js`
