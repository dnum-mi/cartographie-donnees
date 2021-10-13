# DNUM - Cartographie des données

## Contact

Si vous avez des questions concernant l'application, vous pouvez contacter *dnum-cartographie-data@interieur.gouv.fr*

## Variables à modifier

### Accès administrateur de l'application

Par défaut, le compte administrateur de l'application est `admin@default.com` et le mot de passe est `default_password`. 

Ce compte/mot de passe est dans le fichier `1b6f47c6e77a_init_database.py`. Pour créer un mot de passe hashé et salé pbkdf2:sha256, vous pouvez utiliser la fonction generate_password_hash

```
>>> from werkzeug.security import generate_password_hash
>>> generate_password_hash('foobar')
'pbkdf2:sha256:260000$tJkSlaNKb7r759M3$e0913b905918bda8a6cc778c0c32744bb7438f0b26b1d559c2c013eedfd390be'
```

### Nom et mot de passe de la base de données

Un nom de base de données et des accès par défaut sont en brut dans le fichier `docker-compose.yml`

## Mise en production

### 1) Avec docker-compose

A la racine du dossier cartographie-donnees, lancer la commande :
``docker-compose up -d``.

Après quelques dizaines de secondes, le projet sera accessible via l'adresse IP de votre docker-machine, sur le port 80.

### 2) En installant chaque service

#### Backend

Créez et activez un environnement virtuel. Puis, dans le dossier "backend", installez les dépendances :

```
pip install -r requirements.txt
```

Créez la base SQLite de développement avec la commande :

```
flask db upgrade
```

Lancez une instance ElasticSearch et un serveur SMTP en vous aidant du docker-compose.yml à la racine du projet
puis lancez le backend avec :

```
flask run
```

Pour générer une migration, utilisez

```
flask db migrate -m '<migration_name>'
```

Ajustez le fichier de migration dans le dossier "backend/migrations/versions" puis appliquez la migration avec :

```
flask db upgrade
```

#### Frontend

Dans le dossier "frontend", installez les dépendances avec

```
npm install
```

puis lancez le serveur de développement frontend avec :

```
npm start
```

Pour builder le frontend pour la production, utilisez :

```
npm run build
```

Cette commande créera un dossier ``build`` au sein du frontend.

Vous pouvez tester ce frontend compilé en créant un lien symbolique entre ce build frontend et le chemin ``backend/build``.

Le backend servira le frontend minifié à l'adresse ``http://localhost:5000``.
