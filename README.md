<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18QdHdy2YcppdNtglMfhBM2sRRS3KXKZi

## Run Locally

**Prerequisites:**  Node.js (v18 or higher recommended)


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API key:
   - Copy the example environment file:
     ```bash
     cp .env.local.example .env.local
     ```
   - Edit `.env.local` and replace `your_api_key_here` with your actual Gemini API key
   - Get your API key from: https://ai.google.dev/gemini-api/docs/api-key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000

## Building for Production

To build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## About

PsychoMetric is an educational tool for learning about psychometric test construction. It demonstrates the complete process from construct definition to norming and statistical analysis.
