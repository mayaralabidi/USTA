#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MaintenanceUSTA — GCP Setup Script
# Runs ONCE to configure GCP project.
# After this, every git push to main auto-deploys via Cloud Build.
#
# Usage:
#   chmod +x devops/gcp-setup.sh
#   ./devops/gcp-setup.sh
#
# or & "C:\Program Files\Git\bin\bash.exe" devops/gcp-setup.sh in powershell
# ─────────────────────────────────────────────────────────────

set -e  # stop on any error

# ── Config ────────────────────────────────────
PROJECT_ID="maintenance-usta-2026"  
REGION="europe-west1"
DB_INSTANCE="maintenanceusta-db"
DB_NAME="maintenance_db"
DB_USER="maintenance_user"
DB_PASSWORD="MaintenanceUSTA2026!"
GITHUB_REPO="mayaralabidi/usta"  
# ─────────────────────────────────────────────────────────────

echo " Setting up GCP project: $PROJECT_ID"

# 1. Create and set project
gcloud projects create $PROJECT_ID --name="MaintenanceUSTA" || true
gcloud config set project $PROJECT_ID

echo " Project set"

# 2. Enable required APIs
echo " Enabling APIs (takes ~1 minute)..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  containerregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com

echo " APIs enabled"

# 3. Create Cloud SQL instance
echo " Creating Cloud SQL instance (takes ~5 minutes)..."
gcloud sql instances create $DB_INSTANCE \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password="RootPassword123!" \
  --no-backup

# Create database and user
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
gcloud sql users create $DB_USER \
  --instance=$DB_INSTANCE \
  --password=$DB_PASSWORD

echo " Cloud SQL ready"

# 4. Store secrets in Secret Manager (never hardcode in code)
echo "$DB_PASSWORD" | gcloud secrets create db-password \
  --data-file=- --replication-policy=automatic

echo "placeholder" | gcloud secrets create frontend-url \
  --data-file=- --replication-policy=automatic

echo " Secrets created"

# 5. Create service account for Cloud Build
SA_NAME="cloudbuild-deployer"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

gcloud iam service-accounts create $SA_NAME \
  --display-name="Cloud Build Deployer"

# Grant necessary roles
for ROLE in \
  roles/run.admin \
  roles/cloudsql.client \
  roles/secretmanager.secretAccessor \
  roles/storage.admin; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE"
done

echo " Service account created"

# 6. Create and download key for GitHub Actions
gcloud iam service-accounts keys create /tmp/gcp-sa-key.json \
  --iam-account=$SA_EMAIL

echo ""
echo "════════════════════════════════════════════════════"
echo " GCP setup complete!"
echo ""
echo " NOW DO THESE MANUAL STEPS:"
echo ""
echo "1. Add these secrets to your GitHub repo"
echo "   (Settings → Secrets → Actions → New secret):"
echo ""
echo "   GCP_PROJECT_ID = $PROJECT_ID"
echo "   GCP_SA_KEY     = (paste contents of /tmp/gcp-sa-key.json)"
echo ""
echo "2. Connect Cloud Build to GitHub:"
echo "   https://console.cloud.google.com/cloud-build/triggers"
echo "   → Connect repository → GitHub → Select $GITHUB_REPO"
echo ""
echo "3. After first deploy, get your backend URL and update"
echo "   devops/nginx-cloudrun.conf with the real URL, then"
echo "   push again to redeploy the frontend."
echo ""
echo "4. Delete the key file from your machine:"
echo "   rm /tmp/gcp-sa-key.json"
echo ""
echo " Your app will be live at:"
echo "   https://maintenance-frontend-xxxx-ew.a.run.app"
echo "════════════════════════════════════════════════════"