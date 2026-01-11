# Jeff Thompson - Personal Site

A dynamic, portfolio and content stream application built with the latest web technologies. This site features a hybrid content stream (mixing photography and markdown text), dynamic "solar" background gradients, and a fully configurable admin panel for managing modules.

## 🚀 Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **UI Library**: [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (with CSS Variables & OKLCH colors)
-   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Content**: Markdown & TipTap for rich text editing.

## ✨ Key Features

-   **Hybrid Content Stream**: Automatically groups consecutive photos into grids (2x2, masonry) while interspersing markdown text posts.
-   **Dynamic Solar Gradients**: An immersive background system that shifts hue and horizon position based on scroll depth, creating a "sunrise/sunset" effect.
-   **Module System**: A dynamic routing system where page titles, descriptions, and content streams are controlled via the Admin Panel and Supabase database.
-   **Admin Dashboard**: secure route (`/admin`) to manage modules, upload media, and configure site settings.
-   **Theme System**: Dark/Light mode support with synchronized Houdini CSS variable transitions.

## 🛠️ Getting Started

### Prerequisites

-   Node.js 20+
-   npm or pnpm
-   A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/personal-site.git
    cd personal-site
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🗄️ Database & Migrations

The project uses Supabase for data persistence.
-   **Modules Table**: Controls the site sections (Architecture, Photography, Blog, etc.).
-   **Media Table**: Stores references to images and text files.
-   **Storage**: Uses Supabase Storage buckets for assets.

SQL migrations and schema definitions are located in `supabase/migrations/archive` for reference.

## 🧪 Usage

### Running Tests
Run the unit test suite (Vitest):
```bash
npm run test
```

### Production Build
To verify the build locally before deployment:
```bash
npm run build
```

## 📂 Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: React components grouped by type (`ui`, `modules`, `layout`, `admin`).
-   `lib/`: Utility functions and Supabase clients.
    -   `stream.ts`: Core logic for building the mixed media content stream.
-   `types/`: TypeScript definitions.

## 🎨 Design System

The site uses a completely custom Tailwind configuration in `app/globals.css`, leveraging CSS variables for everything from "Solar Gradient" stops to glassmorphism effects.
