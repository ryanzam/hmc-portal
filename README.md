# HMC Portal 🧑‍💻

A Next.js application portal for Haven Consultants Management.

[![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]() 
[![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)]() 
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)]() 
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)]

This portal allows users to submit service applications, upload documents, and track their status. Administrators can review and manage these applications.
---

## Table of Contents 📄

- [Features](#features-star)
- [Tech Stack](#tech-stack-computer)
- [Installation](#installation-wrench)
- [Usage](#usage-play-button)
- [Project Structure](#project-structure-file-folder)
- [API Reference](#api-reference-api-input)
- [Contributing](#contributing-handshake)
- [License](#license-key)
- [Important Links](#important-links-link)
- [Footer](#footer-mailbox)

---

## Features ⭐

- **User Authentication:** Secure login and registration system using NextAuth.js.
- **Application Submission:** Users can submit new service applications with detailed personal and service information.
- **Document Upload:** Supports uploading PDF, DOC, and DOCX files (up to 5MB each).
- **Application Tracking:** Users can view the status of their submitted applications.
- **Application Editing:** Users can update their applications if they are not yet completed.
- **Admin Dashboard:** Administrators can view all submitted applications, filter them by status, and review application details.
- **Admin Review Actions:** Administrators can mark applications as 'Completed' or 'Incomplete Submission' and add remarks.
- **Role-Based Access:** Differentiates between regular users and administrators.

---

## Tech Stack 💻

- **Frontend:** React, Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js (implied by Next.js API routes)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS, CSS
- **Dependencies:** bcryptjs, mongoose, next, next-auth, react, react-dom, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, eslint, eslint-config-next, tailwindcss, typescript

---

## Installation 🔧

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ryanzam/hmc-portal.git
    cd hmc-portal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables:

    ```env
    DATABASE_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    # You might also need NEXTAUTH_URL if not running locally
    ```
    *   Replace `your_mongodb_connection_string` with your actual MongoDB connection string.
    *   Generate a `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in your terminal.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5.  **Open in browser:**
    Navigate to `http://localhost:3000` in your web browser.

---

## Usage ▶️

This application serves as a portal for users to apply for services offered by HMC and for administrators to manage these applications.

### User Flow:

1.  **Register/Login:** Users can create an account or log in to their existing account.
2.  **New Application:** Logged-in users can navigate to the 'New Application' page to fill out a multi-step form including personal details, service type, and optional notes.
3.  **Document Upload:** Users can upload supporting documents (PDF, DOC, DOCX) during the application process.
4.  **Track Applications:** Users can view a list of their submitted applications on their dashboard, along with their current status (Pending, Incomplete Submission, Completed).
5.  **Update Application:** Users can edit their pending applications, including details and documents. Saving changes resets the status to 'Pending'.

### Admin Flow:

1.  **Login:** Administrators log in with their admin credentials.
2.  **Admin Dashboard:** Access a dedicated dashboard showing all applications.
3.  **Filter Applications:** Admins can filter applications by status (All, Pending, Approved, Rejected).
4.  **Review Application:** Admins can view the details of any application, including applicant information, service requested, and uploaded documents.
5.  **Update Status:** Admins can update an application's status to 'Completed' or 'Incomplete Submission' and provide remarks.

---

### How to use:

1.  **Accessing the Portal:** Navigate to the root URL (`/`). If logged in, you will be redirected to either the admin dashboard (`/admin`) or the user dashboard (`/dashboard`) based on your role.
2.  **Submitting an Application (User):**
    - Go to `/dashboard/apply`.
    - Fill in the required fields across the steps: Personal Details, Service Details, and Upload Documents.
    - Review and submit.
3.  **Viewing Applications (User):**
    - Go to `/dashboard` to see a list of your applications and their statuses.
    - Click 'View' on an application to see its details.
4.  **Updating an Application (User):**
    - From the application detail page (`/dashboard/applications/{id}`), click 'Update' if the status is not 'Completed'.
    - Edit details and upload new files on the update form.
    - Saving will set the status back to 'Pending'.
5.  **Reviewing Applications (Admin):**
    - Go to `/admin` to see a list of all applications.
    - Use the filter buttons to narrow down the list.
    - Click 'Review' to see the application details and use the 'Review Decision' section to update the status and add remarks.

---

## Project Structure 📁

```
hmc-portal/
├── public/
│   └── uploads/
├── app/
│   ├── admin/
│   │   ├── applications/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── applications/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── register/route.ts
│   │   └── upload/route.ts
│   ├── dashboard/
│   │   ├── applications/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── update/page.tsx
│   │   │   └── page.tsx
│   │   ├── apply/page.tsx
│   │   └── page.tsx
│   ├── login/page.tsx
│   ├── providers.tsx
│   ├── register/page.tsx
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── AdminReviewActions.tsx
│   ├── Loader.tsx
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   ├── StepIndicator.tsx
│   ├── UpdateApplicationForm.tsx
│   └──...
├── lib/
│   └── db.ts
├── models/
│   ├── Application.ts
│   └── User.ts
├── types/
│   └── index.ts
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts (implied)
└── tsconfig.json
```

---

## API Reference 🚀

### `POST /api/register`
- Creates a new user account.
- **Request Body:** `{ name: string, email: string, password: string }`
- **Response:** `{ success: true }` or `{ error: string }`

### `POST /api/upload`
- Uploads a single file.
- **Accepted file types:** PDF, DOC, DOCX.
- **Max file size:** 5MB.
- **Response:** `{ fileName: string, fileUrl: string, fileType: string }` or `{ error: string }`

### `GET /api/applications`
- Retrieves a list of applications.
- **Query Parameters:** `?status=<status>` (optional, filters by status).
- **Response:** `{ applications: Application[] }`

### `POST /api/applications`
- Creates a new application.
- **Request Body:** `{ fullName: string, phone: string, address: Address, serviceType: ServiceType, description?: string, files?: UploadedFile[] }`
- **Response:** `{ application: Application }` or `{ error: string }`

### `GET /api/applications/[id]`
- Retrieves a specific application by ID.
- **Authorization:** User (if owner) or Admin.
- **Response:** `{ application: Application }` or `{ error: string }`

### `PATCH /api/applications/[id]`
- Updates the status and remark of an application (Admin only).
- **Request Body:** `{ status: ApplicationStatus, adminRemark?: string }`
- **Response:** `{ application: Application }` or `{ error: string }`

### `PUT /api/applications/[id]`
- Updates an existing application (Owner only).
- **Authorization:** User (if owner).
- **Restrictions:** Cannot edit 'completed' applications.
- **Request Body:** `{ fullName?: string, phone?: string, address?: Partial<Address>, serviceType?: ServiceType, description?: string, files?: UploadedFile[] }`
- **Response:** `{ application: Application }` or `{ error: string }`

---

## Contributing 🤝

Contributions are welcome! Please feel free to:

-   Fork the repository.
-   Create a new branch (`git checkout -b feature/your-feature`).
-   Make your changes.
-   Commit your changes (`git commit -am 'Add some feature'`).
-   Push to the branch (`git push origin feature/your-feature`).
-   Open a Pull Request.

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct, and the process for submitting pull requests.

---

## License 🔑

This project is not under any specific open-source license. Use it as you see fit.

---

## Important Links 🔗

-   **Repository:** [https://github.com/ryanzam/hmc-portal](https://github.com/ryanzam/hmc-portal)

---

## Footer 📧

**HMC Portal**

-   Repository: [ryanzam/hmc-portal](https://github.com/ryanzam/hmc-portal)
-   Author: [ryanzam](https://github.com/ryanzam)
-   Contact: [ryanzam@example.com](mailto:ryanzam@example.com)

Give this project a :star: if you find it useful!


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**
