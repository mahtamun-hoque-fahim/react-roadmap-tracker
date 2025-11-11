# React Roadmap Progress Tracker

This is a ready-to-deploy React project to track your React learning roadmap.
It includes:
- Tailwind CSS (Vite)
- Firebase Authentication (Google + Email/Password)
- Firestore sync for per-user progress
- Export to JSON and PDF
- GitHub Pages deployment workflow included

## Quick start

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
- Create a Firebase project at https://console.firebase.google.com/
- Enable Authentication -> Google and Email/Password
- Create a Firestore database (start in test mode for development)
- Copy your Firebase config into `src/firebase.js` replacing the REPLACE_ME values.

3. Local dev:
```bash
npm run dev
```

4. Build:
```bash
npm run build
```

5. Deploy to GitHub Pages:
- Create a GitHub repo and push this project.
- The included GitHub Actions workflow will build and deploy automatically to `gh-pages` branch.

## Notes

- The app saves progress to localStorage automatically.
- When you sign in, the app will load remote progress (if any) and you can click Save in the header to push to Firestore.
