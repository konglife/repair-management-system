# 6. Epic 1: Project Setup & User Authentication

**Epic Goal:** The main goal of this Epic is to build a strong and scalable foundation for the entire application. This includes setting up a Monorepo project structure, installing basic tools, and implementing a secure user authentication system. By the end of this Epic, we will have a project that can actually run, with a complete login/logout system, which is the necessary first step before starting to build other business functions.

### Story 1.1: Initial Project Scaffolding

**As a** Developer,
**I want** to set up the Monorepo project structure with a basic Front-end and Back-end application,
**so that** I have a clean foundation to start building features.

#### Acceptance Criteria

1.  The Monorepo is created and configured.
2.  A basic Front-end application (Placeholder) exists within the Monorepo.
3.  A basic Back-end application (Placeholder) exists within the Monorepo.
4.  Basic development tools (e.g., Linter, Formatter) are installed.
5.  The project can be run in development mode without errors.

### Story 1.2: User Authentication Setup

**As a** User,
**I want** to be able to sign up, log in, and log out of the application,
**so that** my data is secure and I have a personal session.

#### Acceptance Criteria

1.  A user can create a new account.
2.  A registered user can log in with their credentials.
3.  A logged-in user can log out.
4.  Unauthenticated users cannot access pages that require a login.
5.  The authentication system is connected to an external service, such as Clerk, as specified in the Technical Assumptions.

### Story 1.3: Protected Navigation & User Profile Display

**As a** logged-in User,
**I want** to see a main navigation menu (sidebar) and my user information,
**so that** I can access different parts of the application and confirm I am logged in.

#### Acceptance Criteria

1.  When a user logs in, the main menu (Sidebar) must be displayed.
2.  The main menu contains placeholder items for the planned pages (Dashboard, Stock, etc.).
3.  The name or email of the currently logged-in user is displayed on the screen.
4.  There is a functional button for logging out.
5.  When the user logs out, the main menu is hidden, and the system navigates back to the login page.
