# 7\. External APIs

Based on our architectural design, the system will connect to only one primary external API: **Clerk** for authentication. The connection to the **NeonDB** database will be managed entirely through the Prisma ORM, so we will not need to call NeonDB's API directly.

### Clerk Authentication API

  * **Purpose:** To manage the entire user authentication and management process, from registration, login, session management, to protecting web pages and APIs.
  * **Documentation:** [https://clerk.com/docs](https://clerk.com/docs)
  * **Authentication:** The connection will use **API Keys (Publishable Key and Secret Key)**, which will be stored securely in the project's Environment Variables (`.env`).
  * **Rate Limits:** Clerk's Free-tier offers a high number of users and requests, sufficient for this project's initial phase. Details can be found on Clerk's pricing page.
  * **Key Endpoints Used:** We will not be calling Clerk's REST API directly but will use their **Official SDK (`@clerk/nextjs`)**, which provides ready-made tools such as:
      * Components: `<SignIn />`, `<SignUp />`, `<UserButton />` for quickly building UI pages.
      * Hooks: `useUser()`, `useAuth()` for fetching data of the logged-in user.
      * Middleware: `authMiddleware()` for protecting our tRPC API routes.
  * **Integration Notes:** The Clerk Middleware setup in Next.js will act as an intermediary that inspects every request coming to our Backend API to ensure the user is authorized to access that data.
