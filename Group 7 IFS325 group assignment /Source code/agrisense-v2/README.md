# AgriSense - Smart Soil Monitoring Dashboard

This is a modern dashboard for farmers to visualize, analyze, and act on real-time soil health data from IoT sensors, enhanced with AI-driven insights and recommendations from the Gemini API.

## Local Development

This project is built with React, TypeScript, and Vite.

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project and add your Gemini API key. For Vite projects, the variable must be prefixed with `VITE_`.
    ```
    VITE_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Deployment to Vercel

Follow these steps to deploy your AgriSense application to Vercel.

### 1. Prerequisites

- A **Vercel account**. If you don't have one, sign up for free at [vercel.com](https://vercel.com).
- A **Git repository** (GitHub, GitLab, or Bitbucket) with your project code pushed to it.

### 2. Create a New Vercel Project

1.  Log in to your Vercel dashboard.
2.  Click the "**Add New...**" button and select "**Project**".
3.  Import your Git repository by selecting it from the list. You may need to grant Vercel access to your Git provider.

### 3. Configure the Project

Vercel is smart and will automatically detect that you are using **Vite**. The default settings should be correct, but you can verify them:

- **Framework Preset:** `Vite`
- **Build Command:** `tsc && vite build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Add Environment Variables

This is the most important step to ensure the AI features work correctly.

1.  In the project configuration screen, navigate to the "**Environment Variables**" section.
2.  Add a new variable with the following details:
    - **Name:** `VITE_API_KEY`
    - **Value:** Paste your actual Gemini API key here.
3.  Ensure the variable is available for all environments (Production, Preview, and Development).
4.  Click "**Add**" to save the variable.



### 5. Deploy

1.  After configuring the environment variables, click the "**Deploy**" button.
2.  Vercel will start building and deploying your application. You can monitor the progress in the deployment logs.
3.  Once the deployment is complete, Vercel will provide you with a unique URL (e.g., `agrisense-app.vercel.app`) where your live application can be accessed.

Congratulations! Your AgriSense dashboard is now live on Vercel.