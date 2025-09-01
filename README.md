# Next.js File Explorer

## Features

* Browse files and folders from the file system
* Create and delete folders and files
* Preview different file types (images, videos, PDFs, etc.)
* Responsive design with modern UI
* Recent files page
* Breadcrumb navigation

## Getting Started

```bash
pnpm install

pnpm dev
```

## API Endpoints

### Folders
- `GET /api/folders/[id]` - Get folder information
- `POST /api/folders/[id]` - Create new folder inside specified folder
- `DELETE /api/folders/[id]` - Delete folder (must be empty)

### Files
- `POST /api/files/[id]` - Upload new file to specified folder
- `DELETE /api/files/[id]` - Delete specified file

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Hooks
- **File Operations**: Node.js fs/promises API

## Available Pages

- `/` - Home page (root folder)
- `/folder/[id]` - View specific folder
- `/recent` - Recent files page

---

🚀 Ready to use and develop!