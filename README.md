# Blog Editor with Auto-Save and Publish Feature 🚀

This project is a full-stack application for managing blog posts with an auto-save feature, including the ability to save drafts, publish posts, and edit existing content. The frontend allows users to write, update, and manage blog posts, while the backend handles storage, API interactions, and status management.

## 🚀 Features
- **Frontend**: Built with React.js, Next.js, Angular, or Vue.js (Your choice)
  - Create blog posts with a **Title** (text input), **Content** (rich text editor or textarea), and optional **Tags** (comma-separated).
  - **Save as Draft** and **Publish** buttons for easy post management.
  - **Auto-Save Draft** every 30 seconds or after 5 seconds of inactivity.
  - Display a list of **All Blogs** (published and drafts separated).
  - **Edit** and update existing drafts/posts.
  
- **Backend**: Built with Node.js and Express.js (or Django/Flask)
  - Define a **Blog schema/model** with fields:
    - `id`: Unique identifier
    - `title`: Blog post title
    - `content`: Blog post content
    - `tags`: Optional tags for categorization
    - `status`: Draft or Published
    - `created_at`: Timestamp of creation
    - `updated_at`: Timestamp of last update
  - API Endpoints:
    - `POST /api/blogs/save-draft`: Save or update a draft.
    - `POST /api/blogs/publish`: Save and publish an article.
    - `GET /api/blogs`: Retrieve all blogs.
    - `GET /api/blogs/:id`: Retrieve a single blog by ID.
  
- **Bonus Features**:
  - Auto-save after 5 seconds of inactivity using **debouncing**.
  - **Toast notifications** to visually inform users when an article is auto-saved.
  - **JWT Authentication** for protected APIs (optional but preferred).

## 🌟 Architecture Overview

The architecture of this application is designed for modularity and separation of concerns. Here's a simplified diagram:

```
[ User (Browser) ]
        |
        V
[ Frontend (React/Angular/Vue) ]
        |
 REST API Calls (HTTP)
        |
        V
[ Backend (Express/Django/Flask API Server) ]
        |
        V
[ Database (MongoDB/PostgreSQL) ]
```

## 🛠️ Technologies Used

- **Frontend**: React.js (or Next.js, Angular, or Vue.js)
- **Backend**: Node.js with Express.js (or Django, Flask)
- **Database**: MongoDB or PostgreSQL (or any other SQL/NoSQL database)
- **Authentication**: JWT or Session-based Authentication (optional)
- **State Management**: React State (or appropriate solution for Angular/Vue)

## ⚙️ Setup and Installation

### Frontend
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/blog-editor.git
   cd blog-editor/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd blog-editor/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables for database connection and JWT authentication (if applicable).

4. Run the server:
   ```bash
   npm start
   ```

### Database
- Set up your database (MongoDB, PostgreSQL, etc.) and configure the connection in your backend.

## 🧑‍💻 API Endpoints

### POST `/api/blogs/save-draft`
- **Description**: Save or update a draft blog post.
- **Request Body**:
  ```json
  {
    "title": "Blog Title",
    "content": "Blog content...",
    "tags": ["tag1", "tag2"],
    "status": "draft"
  }
  ```

### POST `/api/blogs/publish`
- **Description**: Save and publish a blog post.
- **Request Body**:
  ```json
  {
    "title": "Blog Title",
    "content": "Blog content...",
    "tags": ["tag1", "tag2"],
    "status": "published"
  }
  ```

### GET `/api/blogs`
- **Description**: Retrieve a list of all blog posts (published and drafts).
- **Response**:
  ```json
  [
    {
      "id": "1",
      "title": "Blog Title",
      "status": "published",
      "created_at": "2025-05-20T12:00:00Z",
      "updated_at": "2025-05-20T12:30:00Z"
    },
    ...
  ]
  ```

### GET `/api/blogs/:id`
- **Description**: Retrieve a single blog post by its ID.
- **Response**:
  ```json
  {
    "id": "1",
    "title": "Blog Title",
    "content": "Blog content...",
    "tags": ["tag1", "tag2"],
    "status": "draft",
    "created_at": "2025-05-20T12:00:00Z",
    "updated_at": "2025-05-20T12:30:00Z"
  }
  ```



## 👨‍💻 Contribution

Feel free to contribute by forking the repository, creating a branch, and submitting a pull request. We welcome bug fixes, enhancements, and documentation improvements!



---

Enjoy building your blog editor! 😄
