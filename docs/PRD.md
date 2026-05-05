# 📊 Finance Management Dashboard — Project Task

## 🧾 Project Overview

Build a **Finance Management Dashboard** for small businesses.

Your goal is to design and develop a **clean, responsive, and interactive web application** that allows users to manage invoices and track financial summaries — all in one place.

***

## 🎯 Objective

Create a **Next.js single-page dashboard application** that allows a logged-in business owner to:

- Create and manage invoices
- Mark invoices as paid/unpaid
- Automatically calculate simple VAT
- View a financial overview with live totals and charts

***

## 🏗️ What You’ll Build

A **Finance Dashboard Web App** with the following core features:

***

## 1️⃣ Authentication

- Basic **login and signup** using **Appwrite Auth**
- After login, redirect users to the main dashboard
- ✅ **Requirement:** Use **Next.js Middleware** to protect dashboard routes

***

## 2️⃣ Dashboard Overview

Display key metrics at a glance:

- Total invoices created
- Total amount paid
- Pending payments
- Total VAT collected

### 📈 Visualizations

- Include small charts (e.g., **bar chart or pie chart**)
  - Recommended libraries: **Recharts** or **Chart.js**

### 📱 Responsiveness

- Must work seamlessly on:
  - Desktop
  - Mobile devices

***

## 3️⃣ Invoices Management

### 🧾 Invoice Creation Form

Include the following fields:

- Client Name
- Client Email
- Amount (₦)
- VAT (%)
- Due Date
- Status (Paid / Unpaid)

### ⚙️ Auto Calculations

- **VAT Amount** = Amount × (VAT / 100)
- **Total** = Amount + VAT Amount

### 🗄️ Data Handling (MANDATORY)

Use **Next.js Server Actions** to:

- Create invoices
- Edit invoices
- Delete invoices

Data should be stored in the **Appwrite Database**

### 📋 Invoice Table

- Display all invoices in a table
- Add filtering options:
  - All
  - Paid
  - Unpaid

### 🛠️ User Actions

Allow users to:

- Mark invoices as **Paid**
- Edit invoices
- Delete invoices

***

## 4️⃣ Payments & VAT Summary

- When an invoice is marked as **Paid** (via Server Action):
  - Automatically update:
    - Total revenue
    - VAT summary

### 📊 Monthly VAT Summary

- Show:
  - Output VAT
  - Total payable amount

### ⚠️ Alerts & Insights

- Highlight unpaid invoices
- Display **due-date countdowns**

***

## 5️⃣ Design Requirements

### 🧱 Tech Stack

- **Next.js**
- **ShadCN/UI**
- **TailwindCSS**

### 🎨 UI/UX Guidelines

- Use **cards** and **tables** for clarity
- Maintain a **visually balanced layout**
- Ensure **mobile responsiveness**

### 🎯 Design References

Use the Maglo Financial Management Web UI Kit Figma file as the visual source of truth for the product UI. When implementing a screen, use the Codex `@Figma` plugin against the exact matching frame before coding, then preserve the design's layout, spacing, hierarchy, component composition, assets, and responsive intent while still satisfying accessibility, validation, loading, empty, and error-state requirements.

Required Codex `@Figma` workflow for every screen listed below:

1. Fetch structured design context for the exact frame or node.
2. Capture a Figma screenshot for visual comparison.
3. Download or reference required Figma-provided assets instead of using placeholders.
4. Translate the design into this app's Next.js, ShadCN/UI, TailwindCSS, and accessibility conventions.
5. Compare the built UI against the Figma screenshot in desktop and mobile browser states.

In Codex terms, this means using the `@Figma` workflow to run design-context retrieval and screenshot capture, then implementation. Record any Figma access, asset, or visual-parity gap in the final handoff and, when architectural, in `docs/architecture-guide.md`.

Canonical Figma frames:

- Sign in: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=122-1782&t=LudK3VlLncYCZtMA-4>
- Sign up: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=134-2419&t=LudK3VlLncYCZtMA-4>
- Dashboard: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=36-569&t=LudK3VlLncYCZtMA-4>
- Invoices list: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=51-1249&t=LudK3VlLncYCZtMA-4>
- Invoice detail: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=59-1718&t=LudK3VlLncYCZtMA-4>

Fallback file entry point, if a frame link changes: <https://www.figma.com/design/fjLI67zOWLAkFMJuE1TKNt/Maglo---Financial-Management-Web-UI-Kit--Community---Copy---Copy-?node-id=0-1&t=LudK3VlLncYCZtMA-4>

***

## ⚙️ Technical Expectations

- All calculations (VAT, totals, status updates) must work **in real-time**
- Implement **form validation** (e.g., Zod)
- Use **toast notifications** for user actions
- Maintain:
  - Modular structure
  - Readable code
  - Reusable components

### 🧠 State Management

- Use:
  - Zustand

### 🔗 Backend Integration

- Integrate with **Appwrite SDK (live)**

***

## 📦 Deliverables

1. 🌐 **Deployed Web App**
   - Hosted on **Vercel**
2. 💻 **GitHub Repository**
   - Complete source code
   - Includes a `README.md` with setup instructions
3. 🎥 **Demo Video (2–3 minutes)**
   - Showcase:
     - Invoice creation
     - Payment updates
     - Dashboard summaries

***
