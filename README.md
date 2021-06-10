# Installation du serveur d'administration avec Forest Admin

Forest Admin (https://forestadmin.com) est un service français permettant d'administrer une base de données simplement. Il fournit une interface paramétrable, puissante, directement dans votre navigateur et gratuitement jusqu'à 5 utilisateurs. Forest Admin permet aussi de gérer les droits d'accès et d'édition.

> Bien entendu, Forest Admin n'a jamais accès au contenu de votre base de données !

Pour installer le serveur d'administration, la procédure est la suivante:

- prérequis:

  - votre machine doit disposer de Node.js v11 ou ultérieur, git, yarn et pm2 (ou autre gestionnaire de services). Si vous choisissez d'installer le serveur de Forest Admin sur une machine différente du serveur UpSignOn Pro, veillez donc à les installer également (cf documentation d'installation du serveur UpSignOn PRO pour plus de détails).
    - `npm install --global yarn`
    - `npm install --global pm2`
  - les requêtes sortantes vers https://api.forestadmin.com doivent être autorisées par votre proxy si vous en avez un. (Ces requêtes sont envoyées au démarrage du serveur pour gérer l'authentification).

- `su - upsignonpro`
- `cd ~`
- `git clone --branch production https://github.com/UpSignOn/UpSignOn-pro-forest-admin.git`
- `yarn install`
- `mkdir logs`

# Configuration du compte Forest Admin

- si ce n'est pas déjà fait, envoyez un email à giregk@upsignon.eu contenant l'adresse email de votre compte forest admin pour que nous vous donnions accès à votre interface d'administration (NB : ceci vous évitera de passer du temps à configurer Forest Admin vous même, ce qui est un peu fastidieux et nous permettra de maintenir à jour votre interface en fonction des futures évolutions)

  - nous vous ajouterons au projet Forest Admin que nous aurons préalablement préparé
  - vous recevrez une invitation par mail pour créer votre compte Forest Admin et accéder au projet

    > NB : à ce stade, l'ouverture du projet vous fait arriver sur une erreur "Unable to authenticate you". C'est normal car votre serveur n'est pas encore prêt.

# Configuration des variables d'environnements pour le serveur Forest Admin

De retour dans votre VM, dans le dossier upsignon-pro-forest-admin

- `cd ~/upsignon-pro-forest-admin`
- `cp dot-env-example .env`
- éditez le fichier .env

```
FOREST_ENV_SECRET=secret_provided_by_forest_admin
FOREST_AUTH_SECRET=random

NODE_ENV=production

APPLICATION_PORT=3310
APPLICATION_URL=https://upsignonpro.votre-domaine.fr/admin

DATABASE_URL=postgres://<dbUser>:<dbPwd>@localhost:5432/<dbName>
DOCKER_DATABASE_URL=postgres://<dbUser>:<dbPwd>@host.docker.internal:5432/<dbName>

EMAIL_HOST=smtp.ionos.fr
EMAIL_PORT=587
EMAIL_USER=no-reply@domain.com
EMAIL_PASS=some-password

# Optional proxy configuration
http_proxy=

# Optional local SSL configuration
SSL_CERTIFICATE_KEY_PATH=
SSL_CERTIFICATE_CRT_PATH=
```

- la valeur de FOREST_ENV_SECRET est fournie par Forest Admin. Vous pouvez y accéder en allant sur [https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production](https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production)
- la valeur de FOREST_AUTH_SECRET sert à chiffrer les sessions des utilisateurs qui se connectent à l'interface de Forest Admin. Remplacez la par une chaîne de caractères aléatoire de votre choix.
- la valeur de APPLICATION_URL doit être l'URL exacte sur laquelle ce serveur sera accessible, chemins compris. Cette valeur devra également être dupliquée dans la page de paramètre du projet Forest Admin sur laquelle vous avez trouvé le FOREST_ENV_SECRET
- les variables EMAIL configurent une adresse email utilisée dans le cadre des procédures de mot de passe oublié déclenchées par les utilisateurs. Lorsque vous autoriserez un utilisateur à réinitialiser son mot de passe à partir de Forest Admin, l'utilisateur recevra un email provenant de cette adresse.

  - pour EMAIL_PORT, les deux valeurs classiques sont 587 et 465. (Utilisez le port 465 s'il fonctionne pour vous, mais dans la plupart des cas, il ne fonctionnera pas. Dans ce cas utilisez le port 587.)

- http_proxy : si vous installez ce serveur derrière un proxy, vous devez configurer son url ici. (Le serveur envoie des requêtes d'authentification à https://api.forestadmin.com)

- (OPTIONNEL) vous pouvez installer un certificat SSL pour que le serveur utilise HTTPS pour les connexions locales. Cette option est proposée uniquement pour les cas où vous souhaiteriez exposer directement le processus nodeJS en https. Dans le cas de l'utilisation d'un reverse proxy, la sécurité sera portée directement par le reverse proxy. Les chemins d'accès à ce certificat seront stockés dans les variables d'environnement suivantes:

  - SSL_CERTIFICATE_KEY_PATH: chemin absolu vers le fichier .key (ou .pem) utilisé pour la communication SSL locale
  - SSL_CERTIFICATE_CRT_PATH: chemin absolu vers le fichier .crt (ou .pem) utilisé pour la communication SSL locale

  - NB : l'utilisateur linux propriétaire du serveur doit pouvoir accéder à ces fichiers en lecture. N'oubliez pas de configurer les droits d'accès à ces fichiers correctement.
  - si ces deux variables d'environnement ne sont pas définies, le serveur local fonctionnera en http.

- Démarrez le serveur avec `yarn start`
  - NB, à des fins de test, vous pouvez également utiliser `node ./server.js`, ce qui démarrera le processus sans libérer l'invite de commande.

# Configuration du reverse proxy

Voici des examples de configurations possibles avec Nginx

## Fichier de configuration NGINX (Cas standard)

(CAS STANDARD) Configuration lorsque les deux serveurs sont sur la même machine et sur un seul sous-domaine.

Remplacez le fichier `/etc/nginx/sites-enabled/upsignonpro` par

Pensez à bien modifier les valeurs sous les `# TODO`

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

# TODO
ssl_certificate /etc/certificate/myDomainCertificateSignedByTrustedAuthority.cer;
# TODO
ssl_certificate_key /etc/certificate/myDomainCertificatePrivateKey.key;

ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA HIGH !RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS";

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  # TODO
  server_name upsignonpro.votre-domaine.fr;
  proxy_ssl_verify off;

  location / {
    proxy_pass http://localhost:3000/;
  }
  location /admin/ {
    proxy_pass http://localhost:3310/;
  }
}

```

- Attention, tous les "/" finaux sont importants !
- Attention, si vous avez choisi de configurer un certificat SSL pour le serveur Forest Admin, remplacez `http://localhost:3310` par `https://localhost:3310`
- Pensez aussi dans ce cas à ce que la variable d'environnement APPLICATION_URL contienne bien le chemin (sans '/' final).

> Attention, dans cette configuration la présence des caractères '/' après `/admin/` et `http://localhost:3310/` est essentielle.

## Autre configuration NGINX possible

<details>
<summary>Cas où le serveur UpSignOn PRO Forest Admin est sur une machine différente du serveur UpSignOn PRO</summary>

Utilisez cette configuration si vous avez installé votre serveur forest-admin sur une machine différente du serveur UpSignOn PRO.

Dans /etc/nginx/sites-enabled/upsignon-admin
Pensez à bien modifier les valeurs sous les `# TODO`

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

# TODO
ssl_certificate /etc/certificate/myDomainCertificateSignedByTrustedAuthority.cer;
# TODO
ssl_certificate_key /etc/certificate/myDomainCertificatePrivateKey.key;

ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA HIGH !RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS";

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  # TODO
  server_name upsignonpro.votre-domaine.fr;
  proxy_ssl_verify off;

  location /admin/ {
    proxy_pass http://localhost:3310/;
  }
}

```

Attention, si vous avez choisi de configurer un certificat SSL pour le serveur Forest Admin, remplacez `http://localhost:3310/` par `https://localhost:3310/`

</details>

## Une fois Nginx configuré

Redémarrer Nginx

```
systemctl restart nginx
```

# Déclaration de l'url dans la config du projet sur le site de Forest Admin

- sur [https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production](https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production), la valeur du champ "Admin backend URL" doit être égale à l'url sur laquelle est servie votre serveur forest admin, elle-même égale à la valeur de la variable d'environnement APPLICATION_URL.

Votre interface d'administration devrait maintenant être accessible sur le site de Forest Admin.

En utilisant l'interface Forest Admin, vous pouvez maintenant configurer les adresses emails autorisées et les urls des sites utiles à vos collaborateurs.

# Troubleshooting

En cas de problème, vérifiez les points suivants:

- vérifiez les valeurs de vos variables d'environnement. En particulier, vérifiez la valeur de

  - FOREST_ENV_SECRET = valeur fournie par Forest Admin
  - APPLICATION_URL = identique à la valeur renseignée dans Forest Admin
  - APPLICATION_PORT = conforme à ce qui est attendu selon votre configuration de reverse proxy (dans les examples, 3310)
  - SSL_CERTIFICATE_KEY_PATH et SSL_CERTIFICATE_CRT_PATH = si spécifiées, vérifier que le reverse proxy transfère les requêtes en https. Sinon, vérifier que le reverse proxy transfère les requêtes en http.

- Observez les logs du serveur de forest-admin

  - dans <dossier forest admin>/logs/server-output.log, vérifiez que vous voyez bien
    ```
    Your application is listening on port 3310.
    Your admin panel is available here: https://app.forestadmin.com/projects
    ```
    et que le port est bien identique à celui spécifié dans vos variables d'environnement
    Si vous ne voyez pas ces lignes, votre serveur n'a pas démarré. Consultez alors les logs logs/server-error.log.
  - consultez les logs d'erreur <dossier forest admin>/logs/server-error.log

- en saisissant l'url du serveur Forest Admin dans votre navigateur, vous devriez arriver sur une page disant "Your server is running"

  - si ce n'est pas le cas, il y a probablement un problème au niveau de votre configuration Nginx

# Mise à jour du serveur Forest Admin

- `cd ~/upsignon-pro-forest-admin`
- `git reset --hard`
- `git pull`
- `yarn install`
- `yarn restart`
