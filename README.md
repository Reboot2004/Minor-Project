# CytoVision AI

A web frontend for a hybrid XAI-driven cervical cytology segmentation and analysis system. This repository contains a React + Vite frontend that interacts with a Flask backend API to upload cytology images, run model inference, generate explainability heatmaps and segmentation masks, and provide downloadable results.

Key goals:
- Provide an easy-to-use UI for clinicians and researchers to upload images and view AI-driven segmentation and explanations.
- Support single image and batch ZIP uploads.
- Present results with original image, heatmap, segmentation mask, and a cell-descriptor table.
- Lightweight UI ready for free-tier cloud deployment (Vercel, Netlify).

Table of contents
- Project overview
- Features
- Tech stack
- Setup & local development
- Environment variables
- API contract (expected backend endpoints)
- Frontend routes & components
- Deployment notes
- Contributing
- License

Project overview
This frontend is the user-facing portion of "CytoVision AI", a hybrid weakly supervised segmentation pipeline for cervical cytology analysis. The UI helps upload images, select models and parameters, view generated explainability artifacts and segmentation outputs, and download results.

Features
- Drag & drop or browse file upload (image or ZIP)
- Model selection (VGG16 / Xception variants) with auto-assigned XAI method
- Magnification parameter input
- Stepper-based flow (Upload → Select Model → Results)
- Summary and detailed result views (original, heatmap, mask, table)
- Preview modal with zoom/pan for images
- Results archive page to view previously processed items
- Dark/light theme toggle and responsive UI
- Persistent per-tab session data for in-progress demos

Tech stack
- Frontend: React 19 with Vite
- UI: Custom CSS (Inter font), lucide-react, react-icons
- Routing: react-router-dom
- Build & dev: Vite
- Deployment: Tested for Vercel (vercel.json included)

Setup & local development
Prerequisites
- Node.js (16+ recommended)
- npm (or yarn)

Install dependencies
1. From project root:
   npm install

Run development server
1. Start Vite dev server:
   npm run dev
2. Open http://localhost:5173 (or port printed by Vite)

Build for production
npm run build
Preview production build (locally)
npm run preview

Environment variables
Frontend expects the backend base URL to be provided via Vite env variable:
- VITE_API_BASE_URL — base URL to the Flask backend (e.g., http://localhost:5000)

Create a .env file in project root (not committed) with:
VITE_API_BASE_URL=http://localhost:5000

API contract (expected backend endpoints)
The frontend assumes the following endpoints and response shapes. Adjust backend to match or adapt the frontend.

1) POST /api/upload
- Description: Uploads a file (image or ZIP). The frontend sends FormData with key "file".
- Expected: status 200 on success. JSON with optional message or status is accepted.

2) POST /api/inputform
- Description: Triggers model processing with JSON body:
  { model: string, xaiMethod: string, magval: number|string }
- Expected Response (JSON):
  {
    classification: "Normal" | "Abnormal" | "Unknown",
    results: {
      originalImage: "<base64 string>",
      heatmapImage: "<base64 string>",
      maskImage: "<base64 string>",
      tableImage: "<base64 string>"
    }
  }

3) GET /api/zip
- Description: Returns a zip file with outputs (download link).
- Expected: binary blob response containing output.zip

4) GET /api/oldpreds
- Description: Returns an array of previous predictions for the Results archive page.
- Expected Response (JSON array):
  [
    {
      id: "<id>",
      magnification: "<value>",
      classification: "<Normal|Abnormal>",
      images: { originalImage: "<base64>", heatmapImage: "<base64>", tableImage: "<base64>" }
    },
    ...
  ]

Frontend routes
- /               — Home page (Hero, Project, User Manual, About Us, Footer)
- /demo           — Interactive demo flow (upload → process → results)
- /results        — Results archive (previous predictions)

Primary components (src/components)
- Navbar — top navigation, theme toggle, responsive menu
- Hero — landing hero section with primary CTA
- Project — project description and performance panel
- UserManual — step-by-step usage walkthrough with short demo media
- AboutUs — team profiles
- Demo — main interactive flow; upload, model selection, processing, modal viewer, download
- Results — archive UI to visualize previous predictions
- Footer — site footer with navigation & links

Development notes & conventions
- CSS variables (in src/index.css) control theme colors, breakpoints and shared layouts.
- SessionStorage is used for transient per-tab persistence of upload preview, model selection and magnification.
- LocalStorage stores theme preference ("theme" key).
- The app expects base64-encoded images returned from the backend to be JPEG/PNG blobs prefixed in the UI as data:image/jpeg;base64,<...>

Deployment notes
- Vercel: vercel.json includes a rewrite to serve the SPA. Ensure VITE_API_BASE_URL env var is set in the Vercel project settings to point to your deployed backend.
- Static assets (demo mp4s, images) should be placed under /public or referenced correctly in /src.

Troubleshooting
- CORS: If backend is remote, ensure CORS is enabled for the frontend origin.
- Large files: Backend must support large uploads and provide helpful error messages; frontend surfaces network errors to the user.
- Base64 size: Large base64 payloads may be heavy — consider returning URLs from backend (hosted files) for production deployments.

Contributing
- Create feature branches and open PRs.
- Run linting: npm run lint
- Keep UI changes responsive and accessible.

Contact / Authors
- K N S Sri Harshith — https://github.com/Reboot2004
- MahaReddy Jeevan Reddy — https://github.com/jeevanreddym9
- Alakanti Surya — https://github.com/RisingPhoenix2004

This README should get you started with running and understanding the frontend. For backend implementation details, refer to the backend project (Flask) that provides the API endpoints described above.
