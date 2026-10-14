# PDF Toolbox — Operations, Deployment & Cost Guide

## 1. Quickstart Commands

```bash
# Install all dependencies across monorepo workspaces
npm install

# Run automated tests
npm run test

# Run local web development server (Vite)
npm run dev

# Build production bundle
npm run build
```

---

## 2. Firebase Deployment (Frontend, Rules, Indexes)

The root `firebase.json` links directly to `apps/web/dist` and the rules located in `firebase/`.

```bash
# 1. Login to Firebase CLI
npx firebase-tools login

# 2. Select or link project
npx firebase-tools use <your-project-id>

# 3. Build web app production distribution
npm run build --workspace=apps/web

# 4. Deploy Hosting and Security Rules
npx firebase-tools deploy
```

---

## 3. Google Cloud Run Deployment (Services)

### API Orchestration Service (`services/pdf-api`)
```bash
gcloud run deploy pdf-toolbox-api \
  --source ./services/pdf-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### Document Worker Service (`services/pdf-worker`)
```bash
gcloud builds submit --tag gcr.io/<PROJECT_ID>/pdf-worker ./services/pdf-worker
gcloud run deploy pdf-toolbox-worker \
  --image gcr.io/<PROJECT_ID>/pdf-worker \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 1 \
  --timeout 300
```

---

## 4. Cost Estimates & Free-Tier Budgeting

| Component | Architecture | Free Tier Allowance | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Core PDF Tools** | Client Browser (pdf-lib) | Unlimited | **$0.00** |
| **Frontend Hosting** | Firebase Hosting | 10 GB storage, 360 MB/day transfer | **$0.00** |
| **User Metadata** | Cloud Firestore | 50K reads, 20K writes / day | **$0.00** |
| **File Storage** | Cloud Storage (TTL: 24h) | 5 GB standard storage | **<$0.10** |
| **API & Worker** | Google Cloud Run | 2M requests, 360K vCPU-sec free | **$0.00 - $5.00** depending on volume |

**Recommendation:** By utilizing client-side WebAssembly for Phase 1 and 2 operations, 95% of typical PDF operations consume **$0 in compute costs**, guaranteeing sustainable long-term maintenance.
