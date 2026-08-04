# Study Stack

Build a Full-Stack Study Material Sharing Web App

Build a simple, modern, clean, and fully responsive Study Material Management & Sharing Web App.

The purpose of this web app is to allow users to create an account, log in, upload their actual study material files, save them to their own account, manage them using CRUD operations, and optionally share public materials with other users.

Keep the application simple and easy to understand. Do not add unnecessary features.

1. Technology Stack

Frontend

React.js

Tailwind CSS

React Router

Lucide React icons

Backend

Use Supabase as the backend for the entire web application.

Supabase must handle:

Authentication

User accounts

PostgreSQL database

File storage

File upload

File download

CRUD operations

User permissions

Public/private access

Row Level Security (RLS)

Storage security

Do not create or use a separate Node.js, Express, or other backend server.

Architecture:

React.js → Supabase → PostgreSQL + Supabase Storage

use supabase as a backend from the start

connect to:

Published key: sb_publishable_AVTc2eg42mxEiX7RxoKqlg_-UbDMB09

 

Project url:     Learnova | AppHub | Supabase

Use environment variables for Supabase credentials.

2. Authentication

Use Supabase Authentication.

Users must be able to:

Sign Up

Log In

Log Out

Sign Up fields

Full Name

Username

Email

Password

Login fields

Email

Password

After successful login, redirect the user to:

/dashboard

Protect all user-specific pages.

Each user's materials must be connected to their unique Supabase user_id.

3. Main Pages

Create these pages:

Public Pages

Home

Explore

Login

Sign Up

Material Details

Protected Pages

Dashboard

My Materials

Add Material

Edit Material

Profile

4. Home Page

Create a simple professional landing page.

Hero title:

Study. Store. Share.

Subtitle:

Upload, manage, and share your study materials in one simple platform.

Buttons:

Explore Materials

Get Started

Add a simple features section:

Upload Materials

Manage Your Files

Public Sharing

Easy Access

Keep the homepage clean and minimal.

5. Dashboard

After login, show a simple dashboard.

Display three statistics:

Total Materials

Public Materials

Private Materials

Add quick action buttons:

Add Material

My Materials

Explore Materials

Also show the user's recently uploaded materials.

Each material should display:

Title

Subject

File Type

Visibility

Date

View button

6. Add Material

Create an Add Material page.

The user should be able to upload an actual study material file.

Form fields

Material Title

Subject

Topic

File Upload

Visibility

Visibility options:

Public

Private

Supported file types

PDF

DOC

DOCX

PPT

PPTX

TXT

PNG

JPG

JPEG

When the user clicks Upload Material:

Upload the actual file to Supabase Storage.

Save the file information in Supabase PostgreSQL.

Save the logged-in user's user_id.

Save the file path.

Redirect the user to My Materials.

Show:

"Material uploaded successfully!"

7. My Materials

Create a My Materials page.

Show only materials belonging to the currently logged-in user.

Each material should display:

Title

Subject

Topic

File Name

File Type

Visibility

Upload Date

Actions:

View

Download

Edit

Delete

Add:

+ Add Material

button.

8. CRUD Operations

Implement complete CRUD functionality.

Create

Users can upload new study materials.

Read

Users can view their materials.

Users can view public materials from other users.

Update

Users can edit their own:

Title

Subject

Topic

Visibility

Users can also replace their uploaded file.

Delete

Users can permanently delete their own material.

When deleting:

Delete the database record.

Delete the corresponding file from Supabase Storage.

Show a confirmation dialog before deletion.

Only the owner can edit or delete a material.

9. Edit Material

Create an Edit Material page.

Allow the owner to:

Change title

Change subject

Change topic

Change visibility

Replace the uploaded file

When replacing a file:

Upload the new file.

Delete the old file.

Update the database record.

Show:

"Material updated successfully!"

10. Public and Private Materials

Every material must have:

Public / Private

Public Material

Anyone can:

View

Open

Download

Copy link

Share link

Public materials must appear on the Explore page.

Private Material

Only the owner can:

View

Download

Edit

Delete

Private materials must never appear on Explore or public search results.

11. Explore Page

Create a public Explore Materials page.

Display only public materials.

Each material card should show:

Title

Subject

Topic

File Type

Author

Date

View button

Add a search bar.

Users can search public materials by:

Title

Subject

Topic

Only public materials should appear in search results.

12. Material Details Page

Create a dedicated page:

/material/:id

Display:

Material Title

Subject

Topic

Author

File Name

File Type

Upload Date

Buttons:

View/Open

Download

Copy Link

Share

If the current user owns the material, also show:

Edit

Delete

Copy Link

Copy the material URL to the clipboard.

Show:

"Link copied!"

Share

Use the device's native share functionality when available.

13. File Storage

Use Supabase Storage for the actual uploaded files.

Create a Storage bucket:

study-materials

Store files using a structure such as:

study-materials/{user_id}/{file_name}

Every uploaded file must be connected to the user who uploaded it.

When a material is deleted, also delete its file from Supabase Storage.

When a file is replaced, delete the old file and upload the new one.

14. Database

Use Supabase PostgreSQL.

Create these tables:

profiles

Fields:

id

full_name

username

created_at

The id must be connected to the authenticated Supabase user.

materials

Fields:

id

user_id

title

subject

topic

file_name

file_path

file_type

file_size

visibility

created_at

updated_at

Relationship:

materials.user_id → profiles.id

15. Security and RLS

Use Supabase Row Level Security (RLS).

Database Rules

Users can:

Create their own materials.

View their own private materials.

View public materials.

Update their own materials.

Delete their own materials.

Users cannot:

Edit another user's materials.

Delete another user's materials.

Access another user's private materials.

Storage Rules

Users can upload files to their own folder.

Users can manage only their own files.

Public files can be accessed by other users.

Private files must remain protected.

16. Profile

Create a simple Profile page.

Display:

Full Name

Username

Total Public Materials

Allow the user to edit:

Full Name

Username

Do not add unnecessary profile features.

17. Navigation

Logged Out

Show:

Home

Explore

Login

Sign Up

Logged In

Show:

Home

Dashboard

Explore

My Materials

Add Material

Profile

Logout

On mobile, use a hamburger menu.

18. Responsive Design

The entire web app must be fully responsive.

It must work properly on:

Mobile

Tablet

Laptop

Desktop

Requirements:

Responsive forms

Responsive cards

Responsive navigation

Mobile-friendly file upload

Touch-friendly buttons

No horizontal scrolling

Proper spacing on all screen sizes

19. UI Design

Keep the interface:

Clean

Modern

Professional

Simple

Student-friendly

Easy to understand

Use:

Cards

Rounded corners

Clean buttons

Simple navigation

Clear typography

Proper spacing

Do not add unnecessary animations or complicated UI.

20. Loading and Error Handling

Add loading indicators for:

Login

Sign Up

File Upload

Database requests

Download

Delete

Show clear messages.

Examples:

"Material uploaded successfully!"

"Material updated successfully!"

"Material deleted successfully!"

"Link copied!"

"Please select a file."

"File upload failed."

"You are not authorized to access this material."

21. Complete User Flow

The application must work exactly like this:

Sign Up

↓

Login

↓

Dashboard

↓

Add Material

↓

Enter Title, Subject, Topic

↓

Select File

↓

Choose Public or Private

↓

Upload

↓

File is saved to Supabase Storage

↓

File information is saved to Supabase PostgreSQL

↓

Material is linked to the user's account

↓

Material appears in My Materials

↓

User can:

View → Download → Edit → Replace File → Change Visibility → Delete

If Public:

Explore → View → Download → Copy Link → Share

If Private:

Only the owner can access it.

22. Final Requirement

Build this as a fully functional full-stack web application, not just a frontend UI prototype.

The most important functionality is:

User signs up → logs in → uploads an actual study material → Supabase stores the file → Supabase stores its information in PostgreSQL → the material is linked to the user's account → the material remains available after logout/login → the user can perform CRUD operations → the user can make the material Public or Private → public materials can be discovered, viewed, downloaded, and shared by other users.

Use Supabase as the complete backend for authentication, database, file storage, CRUD operations, permissions, and security.

Do not use a separate backend server.

Do not add advanced features such as comments, likes, chat, notifications, bookmarks, or analytics unless requested later. build the complete production-ready in one got without asking any follow up questions. and alos add toogle button that convert website from white to black theme.  and color theme for the app  must be black and yellow.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://learn-stash-share.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/530f96d6-3887-44f3-b077-fb0a4cb430b4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
