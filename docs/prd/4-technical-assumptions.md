# 4. Technical Assumptions

### Repository Structure: Monorepo

* **Rationale:** For ease of managing Full Stack code, configuration, and code sharing between the Front-end and Back-end for a single developer.

### Service Architecture: Monolith

* **Rationale:** To reduce the complexity of development, testing, and deployment for the first version (MVP), making it easier to understand the entire system's overview.

### Testing Requirements: Unit + Integration Tests

* **Rationale:** To build a strong testing foundation and ensure code quality without creating an excessive workload for a first project.

### Additional Technical Assumptions and Requests

* The chosen technology stack should be:
    * Beginner-friendly
    * Have a free tier for deployment
    * Easy to manage and maintain
* Modern tools should be considered as options in the architecture design, such as:
    * **Authentication:** Clerk
    * **ORM:** Prisma
    * **Database:** Neon DB (Serverless Postgres) or an equivalent database.
