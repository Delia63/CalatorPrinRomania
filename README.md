# CalatorPrinRomania 🇷🇴

Site web interactiv pentru descoperirea atracțiilor turistice din România, prin trasee personalizate cu mecanism de ghicire.

## Tehnologii

| Layer | Tehnologie |
|-------|-----------|
| Frontend | React + Mapbox |
| Backend | Python / Django 4.2 + Django REST Framework |
| Baza de date | PostgreSQL + PostGIS |
| API extern | OpenRouteService |

## Cerințe

- Python 3.11+
- PostgreSQL 15+ cu extensia PostGIS
- Miniconda (environment: `licenta`)
- GDAL (instalat prin conda)

## Setup

### 1. Activare environment conda

**CMD:**
```cmd
C:\Users\PC\miniconda3\Scripts\activate.bat licenta
```

**Anaconda Prompt:**
```cmd
conda activate licenta
```

### 2. Instalare dependențe Python
```cmd
cd backend
pip install -r requirements.txt
```

### 3. Configurare PostgreSQL
```sql
CREATE USER calator_user WITH PASSWORD 'parola_123' LOGIN;
CREATE DATABASE calator_romania_db OWNER calator_user;
\c calator_romania_db
CREATE EXTENSION postgis;
GRANT ALL PRIVILEGES ON DATABASE calator_romania_db TO calator_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO calator_user;
ALTER USER calator_user CREATEDB;
```

### 4. Migrări
```cmd
python manage.py makemigrations
python manage.py migrate
```

### 5. Creare admin
```cmd
python manage.py createsuperuser
```

### 6. Rulare server
```cmd
python manage.py runserver
```
Admin panel: http://localhost:8000/admin/

## Structura proiect

```
backend/
├── config/             # Setări Django, URL-uri
├── apps/
│   ├── atractii/       # AtractieTuristica
│   ├── utilizatori/    # Utilizator, Badge, UtilizatorBadge, DescoperiAtractie
│   ├── trasee/         # Traseu, PunctTraseu, TraseuPreparatLocal, TraseuFestival
│   ├── recenzii/       # Recenzie, ImagineRecenzie
│   └── regiuni/        # PreparatLocal, Festival
└── manage.py
```

## Comenzi utile

```cmd
python manage.py check               # verifică configurația
python manage.py makemigrations      # generează migrări
python manage.py migrate             # aplică migrări
python manage.py createsuperuser     # creează cont admin
python manage.py showmigrations      # starea migrărilor
python manage.py runserver           # pornește serverul
```
