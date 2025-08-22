# 10\. Unified Project Structure

```plaintext
/my-repair-shop-app/
├── prisma/
│   └── schema.prisma         # The file we designed in Section 9 for defining the DB structure
│
├── public/
│   ├── favicon.ico           # The website's favicon
│   └── ...                   # Other public files like images, fonts
│
├── src/
│   ├── app/                  # Main folder for Next.js App Router (web pages)
│   │   ├── (auth)/           # Group of pages related to authentication (e.g., sign-in, sign-up)
│   │   ├── (main)/           # Group of main pages after login (Dashboard, Stock, etc.)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx    # Code for the Dashboard page
│   │   │   ├── layout.tsx    # Main layout with the Sidebar
│   │   │   └── ...           # Folders for other pages
│   │   ├── api/                # Folder for the tRPC API
│   │   │   └── trpc/[...trpc]/ # Entrypoint for the tRPC API called by the Frontend
│   │   │       └── route.ts
│   │   ├── layout.tsx          # Root layout for the entire application
│   │   └── page.tsx            # The first page of the site (Homepage/Login)
│   │
│   ├── components/
│   │   └── ui/                 # Components from Shadcn/ui that we will install
│   │
│   ├── lib/
│   │   ├── db.ts               # Code for connecting the Prisma Client
│   │   └── utils.ts            # Reusable helper functions
│   │
│   └── server/
│       ├── api/
│       │   ├── routers/        # Folder to store tRPC sub-routers (e.g., product.ts, sale.ts)
│       │   │   └── _app.ts     # The main appRouter file that combines all routers (as per Section 5)
│       │   └── root.ts         # Main tRPC file
│       └── auth.ts             # Authentication-related configurations
│
├── .env                        # File to store Environment Variables (e.g., DATABASE_URL, CLERK_SECRET_KEY)
├── .eslintrc.json              # Configuration for the Linter (code quality checks)
├── next.config.mjs             # Next.js configuration file
├── package.json                # Project dependencies management file
├── postcss.config.js           # Configuration for Tailwind CSS
├── tailwind.config.ts          # Configuration for Tailwind CSS
└── tsconfig.json               # Configuration for TypeScript
```

-----

### **Description:**

  * **`prisma/`**: Specifically for storing the database schema.
  * **`src/app/`**: The heart of the Frontend, following Next.js App Router standards.
  * **`src/components/`**: Stores reusable React Components for the entire app.
  * **`src/server/api/routers/`**: The heart of the Backend where we will create all our tRPC functions.
