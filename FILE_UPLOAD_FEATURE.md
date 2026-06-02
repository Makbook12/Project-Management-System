# File Upload Feature Documentation

## Overview
Users can now attach files (PDF, images, Word documents) when creating projects. The feature includes secure file storage, download capability, and automatic cleanup.


### Backend (Server)
1. **Updated Project Model** (`server/models/Project.js`)
   - Added `attachments` array field to store file metadata
   - Stores: filename, originalName, mimeType, size, uploadedAt

2. **Updated Projects Routes** (`server/routes/projects.js`)
   - Integrated multer middleware for multipart/form-data handling
   - POST `/projects` - Creates project with optional file uploads
   - GET `/projects/:id/attachments/:filename` - Download attachment
   - DELETE `/projects/:id/attachments/:filename` - Delete attachment
   - DELETE `/projects/:id` - Automatically cleans up attached files

3. **Updated Server** (`server/server.js`)
   - Added static file serving for uploads directory
   - Configured to serve uploaded files

### Frontend (Client)
1. **Updated Dashboard Component** (`client/src/pages/Dashboard.js`)
   - Added file input to project creation form
   - File selection with max 5 files, 10MB each
   - Shows selected files with remove option
   - Displays attachment count on project cards
   - Validation for file types

2. **Updated API Service** (`client/src/services/api.js`)
   - Enhanced `projectsAPI.create()` to handle FormData
   - Added `downloadAttachment()` method
   - Added `deleteAttachment()` method

## File Specifications
- **Max Files**: 5 per project
- **Max File Size**: 10MB per file
- **Allowed Types**:
  - PDF (.pdf)
  - Images (.jpg, .jpeg, .png, .gif)
  - Word Documents (.doc, .docx)

## Installation

### Server Setup
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install multer dependency:
   ```bash
   npm install multer
   ```

3. Uploads will be stored in `server/uploads/` directory (auto-created)

## Usage

### Creating a Project with Files
1. Click "+ New Project" button
2. Fill in project name and description
3. Click file input and select 1-5 files (optional)
4. Review selected files before submitting
5. Click "Create Project"
6. Files are uploaded to server and stored securely

### Viewing Attachments
- Project cards display attachment count (📎 X attachment(s))
- Click on project to view full details with attachment list

## Security Features
- File type validation (MIME type checking)
- File size limits (10MB per file)
- Authorization checks (only project members can download/delete)
- Automatic cleanup when project is deleted
- Unique filenames to prevent conflicts

## Error Handling
- Invalid file types are rejected with clear error message
- File size violations trigger validation error
- Upload failures automatically clean up partial uploads
- Secure error responses without exposing sensitive info

