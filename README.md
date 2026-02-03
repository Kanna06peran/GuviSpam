
# VoiceShield AI - Detection API Portal

A production-ready developer portal for AI-generated voice detection, featuring a live sandbox and documentation.

## 🔗 Sync to GitHub

If you want to sync this project to your own GitHub account:

1. **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new repository named `voiceshield-ai`.
2. **Push Code**: Run the following commands in your terminal:

```bash
# Initialize git
git init

# Add all project files
git add .

# Create initial commit
git commit -m "Initialize VoiceShield AI Project"

# Set main branch
git branch -M main

# Link to your repository (Replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push the code
git push -u origin main
```

## 🚀 Deployment to Vercel

Once synced to GitHub:

1. Go to [Vercel](https://vercel.com).
2. Import the `voiceshield-ai` repository.
3. **Important**: Add an environment variable `API_KEY` with your Gemini API Key in the Vercel Dashboard.
4. Click **Deploy**.

## Features
- **Real-time Recording**: Test live audio directly from the browser.
- **Multilingual Detection**: Specialized training for Telugu, Malayalam, Hindi, and more.
- **API Documentation**: Comprehensive guides for developers.
- **Interactive Sandbox**: Visual results with confidence scores and reasoning.
- **Production Snippets**: Ready-to-use Node.js and Python backend code.
