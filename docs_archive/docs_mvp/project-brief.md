# Project Brief: Repair Shop Back-Office System

## Executive Summary

This is a project to build a simple Full Stack Back-Office system for a small, single-user repair shop. The main goal is to solve the problems of manual record-keeping and data summarization for stock, finances, sales, and repairs, which is time-consuming and prone to errors. The target audience is the owner of a small repair shop (a single user) who is a novice developer and wants a digital tool to help manage the shop. This system offers a dashboard that provides a business overview in one place, reduces time spent on paperwork, and facilitates business decision-making through accurate and up-to-date information.

## Problem Statement

Currently, all shop operations rely on manual bookkeeping, covering everything from recording purchase orders, checking stock, and logging daily repairs and sales, to manually summarizing daily and monthly income and expenses. This process is very time-consuming, has a high risk of calculation errors, and makes it difficult to get a real-time overview of the shop's financial health and stock levels. Off-the-shelf solutions available in the market may have complex functions and high costs that are unnecessary for a small, single-user shop.

## Proposed Solution

We will build a Full Stack web application with a simple User Interface (UI), structured as a Multi-page application for clarity of use. The application will consist of an overview dashboard and separate CRUD management systems for stock, sales, repairs, and customer data. This application will be designed specifically for the workflow of a small repair shop, stripping out all unnecessary functions and focusing on straightforward usability to directly solve the problems the user faces.

## Target Users

* **Primary User Segment: Repair Shop Owner/Novice Developer (Yourself)**
    * **Profile:** Has basic technical knowledge, wants an easy-to-manage system, and wants a project that can be developed and maintained independently.
    * **Needs & Pain Points:** Wants to reduce time spent on accounting and paperwork, needs accurate summary data for decision-making, feels that large systems are too complex, and wants a system flexible enough for future expansion.

## Goals & Success Metrics

### Business Objectives

* Reduce the time spent on daily/monthly accounting and stock summarization by at least 90%.
* Increase the accuracy of stock and financial data to 100%.

### User Success Metrics

* Able to view the correct remaining stock balance within 5 seconds.
* Able to record a new sale or repair job within 1 minute.
* Able to view the current month's income-expense summary instantly from the Dashboard.

### Key Performance Indicators (KPIs)

* Number of transactions (sales/repairs/purchases) recorded through the system per day.
* Frequency of system usage.

## MVP Scope

### Core Features (In Scope)

1.  **Dashboard:** An overview page summarizing key information (income, expenses, profit) and a trend graph comparing income versus expenses.
2.  **Stock Management System:**
    * CRUD for Products with stock information and average cost.
    * CRUD for Categories and Units.
    * Function to record stock purchases (Purchase Records).
3.  **Sales Management System:** A page to view sales history and a function to create new sales invoices.
4.  **Repair Management System:** A page to view repair history and a function to create new repair jobs. Technical design completed and ready for implementation.
5.  **Customer Management System:** A page for viewing, adding, and editing customer information.

### Out of Scope for MVP

* Supplier Management System.
* In-depth data analysis graphs on the Dashboard (e.g., revenue proportions, best-selling products).
* Automated notification system via external channels (Email/LINE).

## Post-MVP Vision

With the core repair management functionality now complete, the system can be expanded by adding a Supplier system, generating in-depth reports (profit analysis, parts usage trends), and possibly integrating with e-commerce platforms to automatically record purchases. Additional features could include repair status tracking, customer notifications, and advanced reporting dashboards.

## Technical Considerations

To be determined in the next phase, Architecture Design. The focus will be on beginner-friendly technologies that have abundant learning resources and are easy to maintain.

## Constraints & Assumptions

### Constraints

* Developed by a single developer (novice DEV).
* The system is designed for a single user.

### Key Assumptions

* The user understands their own business and can input data correctly.
* The business requirements for the MVP will not change from what is summarized here.

## Risks & Open Questions

### Key Risks

* **Scope Creep:** There might be an addition of functions beyond what is necessary for the MVP, which will delay the project.
    * **Mitigation:** Strictly adhere to the scope of work defined in this document.

### Open Questions

* Which Technology Stack will be chosen (Language, Framework, Database)? (To be answered in the next phase).

## Next Steps

### Immediate Actions

1.  Review and confirm the accuracy of this Project Brief.
2.  Begin the process of creating the Product Requirements Document (PRD) and the Architecture Design.

### PM Handoff

This document is ready to be used as the initial input for creating a detailed Product Requirements Document (PRD), which will delve into Epics and User Stories for further development.

---