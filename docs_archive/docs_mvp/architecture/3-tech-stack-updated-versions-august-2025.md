# 3\. Tech Stack (Updated Versions - August 2025)

| Category | Technology | **Version (Latest)** | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | **5.9.x** | Primary language for Frontend development | Enhances Type-Safety and reduces errors |
| **Frontend Framework**| Next.js (React) | **15.4.x** | Main framework for building UI and managing Backend API | An all-in-one framework, high-performance, and perfectly suited for Vercel |
| **UI Component Library**| Shadcn/ui | **Latest** | A collection of pre-built components for UI creation | Shadcn/ui does not use traditional versioning; it uses the `latest` CLI command to pull the most recent component versions |
| **State Management**| React Hooks / Zustand | N/A | Managing the state of data in the Frontend | Start with React's native tools and add Zustand when needed for complex state, as it's simple and beginner-friendly |
| **Backend Language** | TypeScript | **5.9.x** | Primary language for Backend development | Using the same language as the Frontend allows for easy code and type sharing in a Monorepo |
| **Backend Framework**| Next.js (API Routes) | **15.4.x** | Framework for building the Backend API | It's already included in the Next.js project, simplifying management and creating a complete Monolith |
| **API Style** | tRPC | **11.4.x** | Communication pattern between Frontend-Backend | Provides perfect End-to-End Type-Safety, reducing the complexity of API development |
| **Database** | PostgreSQL (NeonDB) | **17** | Primary database | A Serverless Postgres with a Free-tier, it's easy to manage and powerful, meeting our requirements |
| **ORM** | Prisma | **6.14.x** | Database management intermediary | Makes working with the database easy, secure, and provides excellent Type-Safety |
| **Authentication** | Clerk | Latest Stable | User authentication and management system | Easy to install, comes with pre-built UI, and is highly secure, meeting our needs |
| **Styling** | Tailwind CSS | **4.1.x** | Framework for managing CSS | A highly popular utility-first CSS framework that allows for fast and easily customizable UI development |
| **Testing** | Jest & React Testing Library| **30.0.x (Jest)**| Frontend testing (Unit & Integration) | Standard tools that come with Next.js for testing React Components |
| **CI/CD** | Vercel | N/A | Automated project deployment | Connects to a Git repository (e.g., GitHub) and deploys automatically on every code push |
| **Iconography** | Lucide Icons | **0.539.x** | Icon set for use in the UI | The recommended icon set in the `UI/UX Spec` and works well with React |
