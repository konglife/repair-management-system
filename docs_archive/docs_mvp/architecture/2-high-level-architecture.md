# 2\. High Level Architecture

### Technical Summary

The architecture of this project will be a modern Full-Stack application built on **Next.js (T3 Stack)**, combining both the Frontend and Backend API into a single project (Monolith) within a **Monorepo** structure. Communication between the Frontend and Backend will use **tRPC** to achieve maximum Type-Safety. Data will be managed via **Prisma ORM** and stored in a **NeonDB (Serverless Postgres)** database. The authentication system will use services from **Clerk**. All of this will be deployed on the **Vercel** platform for maximum performance, easy management, and low cost, in line with the project's goals.

-----

### Platform and Infrastructure Choice

  * **Platform:** **Vercel**
      * **Rationale:** It's a platform built specifically for Next.js, making deployment fully automated and extremely simple. It includes a built-in Global CDN for speed and has a Free-tier sufficient for this project.
  * **Key Services:**
      * **Vercel:** For Hosting, Serverless Functions (for Backend API), and CI/CD
      * **NeonDB:** For Serverless Postgres Database
      * **Clerk:** For User Authentication and Management

-----

### Repository Structure

  * **Structure:** **Monorepo**
      * **Rationale:** Ideal for a solo developer, it helps manage the entire full-stack codebase in one place, is easy to set up, and facilitates code sharing (e.g., types) between Frontend and Backend.
  * **Monorepo Tool:** **pnpm workspaces** (or npm/yarn workspaces)
      * **Rationale:** It's a tool that comes with pnpm (the recommended Package Manager), is uncomplicated, and is sufficient for a project of this size.

-----

### High Level Architecture Diagram

This diagram shows how the various components of the system work together.

```mermaid
graph TD
    subgraph User
        U[User]
    end

    subgraph Vercel Platform
        subgraph Next.js Application
            FE[Frontend (React Components)]
            API[Backend (tRPC API Routes)]
        end
    end

    subgraph Third-Party Services
        DB[(NeonDB - Postgres)]
        Auth[Clerk Auth]
    end

    U -- HTTPS --> FE;
    FE -- "Login/Signup" --> Auth;
    FE -- "tRPC Calls (Type-Safe)" --> API;
    API -- "Prisma Client" --> DB;
```

-----

### Architectural and Design Patterns

  * **Full-stack Framework (Next.js):** Uses a single framework to manage both Frontend and Backend to reduce complexity.
  * **Serverless Functions:** Our API will be deployed as Serverless Functions on Vercel, which only run when invoked. This helps save costs and supports automatic scaling.
  * **Type-Safe API Layer (tRPC):** This is the core of our data communication, enabling the Frontend and Backend to share types automatically, which drastically reduces errors.
  * **ORM (Prisma):** Acts as the intermediary for communicating with the database, making query writing safer and easier.
  * **Utility-First CSS (Tailwind CSS):** Used for creating a flexible and easily maintainable design system.
