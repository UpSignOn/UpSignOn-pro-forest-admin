# Installation du serveur d'administration avec Forest Admin

Forest Admin (https://forestadmin.com) est un service français permettant d'administrer une base de données simplement. Il fournit une interface paramétrable, puissante, directement dans votre navigateur et gratuitement jusqu'à 5 utilisateurs. Forest Admin permet aussi de gérer les droits d'accès et d'édition.

> Bien entendu, Forest Admin n'a jamais accès au contenu de votre base de données !

Pour installer le serveur d'administration, la procédure est la suivante:

- prérequis:

  - votre machine doit disposer de Node.js v11 ou ultérieur, git et pm2 (ou autre gestionnaire de services). Si vous choisissez d'installer le serveur de Forest Admin sur une machine différente du serveur UpSignOn Pro, veillez donc à les installer également (cf documentation d'installation du serveur UpSignOn PRO pour plus de détails).
  - votre machine doit disposer de yarn `npm install --global yarn`
  - votre machine doit disposer de pm2 `npm install --global pm2`
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
FOREST_AUTH_SECRET=2ab25b921c4bf35bb43b1f5b7aaa04e27a3142ada836fcd2323ea148ad953145fd1cac1b1a2250fd33d13499345c

NODE_ENV=production

APPLICATION_PORT=3310
APPLICATION_URL=https://admin-upsignon.domaine.fr

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
- les variables EMAIL configurent une adresse email utilisée dans le cadre des procédures de mot de passe oublié déclenchées par les utilisateurs. Lorsque vous autoriserez un utilisateur à réinitialiser son mot de passe à partir de Forest Admin, l'utilisateur recevra un email provenant de cette adresse.

  - pour EMAIL_PORT, les deux valeurs classiques sont 587 et 465. (Utilisez le port 465 s'il fonctionne pour vous, mais dans la plupart des cas, il ne fonctionnera pas. Dans ce cas utilisez le port 587.)

- http_proxy : si vous installez ce serveur derrière un proxy, vous devez configurer son url ici. (Le serveur envoie des requêtes d'authentification à https://api.forestadmin.com)
- SSL_CERTIFICATE_KEY_PATH et SSL_CERTIFICATE_CRT_PATH configurent les chemins d'accès absolus au certificat local (format .pem autorisé) permettant de chiffrer les communications entre le reverse proxy et le serveur local de Forest Admin. Si l'une de ces deux variables est vide, le serveur ouvre une connexion http au lieu d'une connection https. Ces deux variables sont donc optionnelles.

- Démarrez le serveur avec `pm2 start ./ecosystem.config.js --only upsignon-pro-forest-admin-server`
  - NB, à des fins de test, vous pouvez également utiliser `node ./server.js`, ce qui démarrera le processus sans libérer l'invite de commande.

# Configuration du reverse proxy

Voici des examples de configurations possibles avec Nginx

<details>
<summary>Configuration indépendante du serveur UpSignOn PRO</summary>

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
  server_name admin-upsignon.my-domain.fr;
  proxy_ssl_verify off;

  location / {
    # TODO (choix entre http et https & choix du port)
    proxy_pass http://localhost:3310;
  }
}

```

Attention, si vous avez choisi de configurer un certificat SSL pour le serveur Forest Admin, remplacez `http://localhost:3310` par `https://localhost:3310`

NB, contrairement à la configuration proposée pour le serveur UpSignOn Pro, le block

```
  if ($request_method !~ ^(GET|HEAD|POST)$ )
  {
    return 405;
  }
```

ne doit pas être présent.

</details>

<details>
<summary>Configuration lorsque les deux serveurs sont sur la même machine mais sur des sous-domaines différents</summary>

Utilisez cette configuration si vous avez installé votre serveur forest-admin sur la même machine que le serveur UpSignOn PRO.

Si vos deux sous-domaines utilisent des certificats différents (au lieu d'un unique certificat wildcard), déclarez chaque ssl_certificate et ssl_certificate_key à l'intérieur du bloc server correspondant.

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

ssl_ciphers "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA HIGH !RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS";

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;

  # TODO
  ssl_certificate /etc/certificate/myDomainCertificateSignedByTrustedAuthority.cer;
  # TODO
  ssl_certificate_key /etc/certificate/myDomainCertificatePrivateKey.key;

  # TODO
  server_name upsignon.my-domain.fr;
  proxy_ssl_verify off;

  location / {
    # TODO (choix entre http et https & choix du port)
    proxy_pass http://localhost:3000;
  }
  if ($request_method !~ ^(GET|HEAD|POST)$ )
  {
    return 405;
  }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;

  # TODO
  ssl_certificate /etc/certificate/myAdminDomainCertificateSignedByTrustedAuthority.cer;
  # TODO
  ssl_certificate_key /etc/certificate/myAdminDomainCertificatePrivateKey.key;

  # TODO
  server_name admin-upsignon.my-domain.fr;
  proxy_ssl_verify off;

  location / {
    # TODO (choix entre http et https & choix du port)
    proxy_pass http://localhost:3310;
  }
}

```

Attention, si vous avez choisi de configurer un certificat SSL pour le serveur Forest Admin, remplacez `http://localhost:3310` par `https://localhost:3310`

</details>

<details>
<summary>Configuration lorsque les deux serveurs sont sur la même machine et sur un seul sous-domaine</summary>

Vous pouvez configurer le serveur Forest Admin sur le même sous-domaine que le serveur UpSignOn PRO en lui ajoutant un chemin. Par exemple, vous pourriez choisir les url suivantes

- serveur UpSignOn PRO : 'https://upsignon.domaine.fr/server'
- serveur Forest Admin : 'https://upsignon.domaine.fr/admin'

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
  server_name upsignon.my-domain.fr;
  proxy_ssl_verify off;

  location /server/ {
    # TODO (choix entre http et https & choix du port)
    proxy_pass http://localhost:3000/;
  }
  location /admin/ {
    # TODO (choix entre http et https & choix du port)
    proxy_pass http://localhost:3310/;
  }
}

```

- Attention, tous les "/" finaux sont importants !
- Attention, si vous avez choisi de configurer un certificat SSL pour le serveur Forest Admin, remplacez `http://localhost:3310` par `https://localhost:3310`
- Pensez aussi dans ce cas à ce que la variable d'environnement APPLICATION_URL contienne bien le chemin (sans '/' final).

> Attention, dans cette configuration la présence des caractères '/' après `/forest-admin/` et `http://localhost:3310/` est essentielle.

</details>

- Redémarrer Nginx

```
systemctl restart nginx
```

# Déclaration de l'url dans la config du projet sur le site de Forest Admin

- sur [https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production](https://app.forestadmin.com/<NOM_DU_PROJET>/settings/environments/details/Production), la valeur du champ "Admin backend URL" doit être égale à l'url sur laquelle est servie votre serveur forest admin, elle-même égale à la valeur de la variable d'environnement APPLICATION_URL.

Votre interface d'administration devrait maintenant être accessible sur le site de Forest Admin.

A partir des paramètres du projet Forest Admin, vous pouvez si vous le souhaitez

- modifier le nom du projet
- modifier l'url de votre serveur d'administration (attention à la modifier aussi dans les variables d'environnement du serveur Forest Admin dans ce cas)

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
  - si vous voyez la page your server is running et que l'interface forest admin ne fonctionne toujours pas, vérifiez la configuration de votre reverse proxy. En particulier, vérifiez que le block

  ```
  if ($request_method !~ ^(GET|HEAD|POST)$ )
  {
    return 405;
  }
  ```

  n'est pas présent dans votre config Nginx pour le serveur Forest Admin. (Cas où vous auriez copié-collé la configuration proposée pour le serveur UpSignOn pro)

# Mise à jour du serveur Forest Admin

- `cd ~/upsignon-pro-forest-admin`
- `git pull`
- `yarn install`
- redémarrage du serveur : `yarn restart`
