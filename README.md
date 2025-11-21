# ZAI‑HR — Aplikacja do pomiarów tętna

Krótki opis
Projekt full‑stack z Django (backend) i React + Vite (frontend) do zapisu i wizualizacji pomiarów tętna.

**Szybki start — Backend (Django)**
- Przejdź do katalogu `backend`.
- Utwórz virtualenv i zainstaluj zależności:

```bash
python -m venv venv
# Windows PowerShell
venv\Scripts\Activate.ps1
# albo bash (Git Bash / WSL)
source venv/Scripts/activate
pip install -r backend/requirements.txt
```

- Uruchom migracje i serwer deweloperski:

```bash
python backend/manage.py migrate
python backend/manage.py runserver
```

- Lokalna baza: `backend/db.sqlite3` (plik sqlite).

**Szybki start — Frontend (React + Vite)**
- Przejdź do katalogu `frontend`.

```bash
cd frontend
npm install
npm run dev
```

- Frontend komunikuje się z backendem przez `frontend/src/api.js` — upewnij się, że `BASE_URL` wskazuje na uruchomiony serwer Django.

**Kluczowe pliki**
- `backend/manage.py` — punkt wejścia backendu
- `backend/backend/settings.py` — ustawienia Django
- `backend/measurements/models.py` — model pomiarów
- `frontend/src/api.js` — wrapper API
- `frontend/src/App.jsx` — główny komponent frontend

**Swagger / Dokumentacja API**
- Po uruchomieniu backendu (domyślnie `http://127.0.0.1:8000`) dokumentacja dostępna jest pod:

```
http://127.0.0.1:8000/api/docs/
```

- Surowy schemat OpenAPI (JSON) jest pod:

```
http://127.0.0.1:8000/api/schema/
```

