## Market Price Forecasting for Farmers

Monorepo containing:

- `frontend/`: React dashboard (Tailwind + Recharts)
- `backend/`: FastAPI REST API (serves historical prices + predictions)
- `ml_model/`: LSTM training + inference utilities (TensorFlow/Keras)

### Quick start (local, Windows)

#### Backend (FastAPI)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### ML model (training/inference scripts)
```powershell
cd ml_model
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m src.train --help
```

#### Frontend (React)
See `frontend/README.md` after initialization in Step 3.

### Data pipeline (Step 6)

#### Run pipeline once
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m pipeline.run_once
```

#### Run scheduler loop (every 60 minutes)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pipeline.scheduler_loop --interval-minutes 60
```

#### Optional scheduling in production
- Linux cron: `0 * * * * cd /path/to/backend && /path/to/python -m pipeline.run_once`
- Windows Task Scheduler: create hourly task to run `python -m pipeline.run_once` in `backend` folder.

### Deployment (Step 8)

#### 1) Frontend deployment on Vercel

1. Push your project to GitHub.
2. Go to [Vercel](https://vercel.com/) and import the repository.
3. Set **Root Directory** to `frontend`.
4. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variable in Vercel project settings:
   - `VITE_API_BASE_URL=https://your-backend-domain.onrender.com`
6. Deploy. Vercel uses `frontend/vercel.json` for SPA routing.

#### 2) Backend deployment on Render

1. Go to [Render](https://render.com/) and create a new Web Service from your GitHub repo.
2. Choose either:
   - Automatic blueprint deploy using `render.yaml`, or
   - Manual settings:
     - Root directory: `backend`
     - Build command: `pip install -r requirements.txt`
     - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables:
   - `APP_NAME=Market Price Forecasting API`
   - `ENV=production`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`
   - `DATABASE_URL=<your-postgres-url>`
4. Deploy and verify:
   - `https://your-backend-domain.onrender.com/health`

#### 3) Backend deployment on AWS (EC2 option)

1. Launch an Ubuntu EC2 instance.
2. Install Docker on EC2.
3. Copy project and run:
```bash
cd backend
docker build -t market-backend .
docker run -d -p 8000:8000 \
  -e APP_NAME="Market Price Forecasting API" \
  -e ENV=production \
  -e ALLOWED_ORIGINS="https://your-frontend-domain.vercel.app" \
  -e DATABASE_URL="postgresql+psycopg2://user:password@host:5432/dbname" \
  --name market-backend market-backend
```
4. Open EC2 security group port `8000` and test `/health`.

#### 4) Optional Docker setup (local/prod)

Backend:
```powershell
cd backend
docker build -t market-backend .
docker run --rm -p 8000:8000 --env-file .env market-backend
```

Frontend:
```powershell
cd frontend
docker build -t market-frontend .
docker run --rm -p 8080:80 market-frontend
```

