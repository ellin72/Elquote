# Setting Up Vercel Deployment Secrets

## Current Status

✅ GitHub Actions Build Workflow: **Working**
⏳ Vercel Deployment Workflow: **Awaiting Secret Configuration**

The deployment workflow now gracefully handles missing secrets and will provide helpful messages when they're not configured.

---

## Step-by-Step: Add Vercel Secrets to GitHub

### Step 1: Get Your Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions` (or any name you prefer)
4. Copy the token immediately (you won't see it again)

### Step 2: Get Your Organization & Project IDs

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Find your Elquote project
3. Click on it to open project settings
4. Look for:
   - **Organization/Team ID**: Usually in URL like `vercel.com/your-team/...`
   - **Project ID**: In Project Settings → "Project ID"

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/ellin72/Elquote
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** button

Add these three secrets:

#### Secret 1: VERCEL_TOKEN

- **Name:** `VERCEL_TOKEN`
- **Value:** (paste the token from Step 1)
- Click "Add secret"

#### Secret 2: VERCEL_ORG_ID

- **Name:** `VERCEL_ORG_ID`
- **Value:** (your organization ID from Step 2)
- Click "Add secret"

#### Secret 3: VERCEL_PROJECT_ID

- **Name:** `VERCEL_PROJECT_ID`
- **Value:** (your project ID from Step 2)
- Click "Add secret"

---

## Verify Setup

### In GitHub

Go to Settings → Secrets and variables → Actions
You should see all three secrets listed:

- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID

### Test the Workflow

1. Make a small change to your code (e.g., add a comment to server.js)
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test deployment workflow"
   git push
   ```
3. Go to GitHub → Actions tab
4. Watch the workflow run:
   - Build & test steps should pass ✅
   - Deploy step should now work ✅

---

## Troubleshooting

### "Vercel secrets not configured" message in Actions

- This means the secrets aren't set up yet
- Follow the steps above to add them
- Re-run the workflow after adding secrets

### "Invalid token" error

- The VERCEL_TOKEN is incorrect or expired
- Generate a new token from https://vercel.com/account/tokens
- Update the secret in GitHub

### "Project not found" error

- Check that VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
- Verify the project exists in your Vercel dashboard
- Make sure you're using the right organization

---

## How Deployment Works (After Setup)

```
1. You push code to main branch
   ↓
2. GitHub Actions runs automatically
   ↓
3. Build and test steps run
   ↓
4. If tests pass → Vercel CLI deploys to production
   ↓
5. Your app is live at your-project.vercel.app
```

Every push to main automatically deploys! 🚀

---

For more info, see:

- [Vercel CLI Documentation](https://vercel.com/cli)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
