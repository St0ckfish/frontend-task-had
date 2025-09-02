import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  findFolder,
  invalidateCache,
  getFolderPathFromId,
} from "@/src/lib/data";
import { mkdir, rmdir, access } from "fs/promises";
import { join, basename } from "path";

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  FOLDER_NOT_FOUND: "Folder not found",
  INVALID_REQUEST: "Invalid request",
  INVALID_FOLDER_NAME: "Invalid folder name",
  CANNOT_DELETE_ROOT: "Cannot delete root folder",
  FOLDER_NOT_EMPTY: "Cannot delete non-empty folder",
  FOLDER_CREATE_FAILED: "Failed to create folder",
  FOLDER_DELETE_FAILED: "Failed to delete folder",
  FOLDER_EXISTS: "Folder already exists",
} as const;

interface FolderParams {
  params: { id: string };
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function successResponse(data?: any): NextResponse {
  return NextResponse.json({ success: true, ...data });
}

function validateFolderName(name: unknown): string | null {
  if (typeof name !== "string") {
    return null;
  }

  const trimmed = name.trim();
  
  if (!trimmed) {
    return null;
  }

  const safeName = basename(trimmed);
  
  if (safeName !== trimmed) {
    return null; 
  }

  return safeName;
}

function buildFolderPath(parentPath: string | null, folderName: string): string {
  const publicDir = join(process.cwd(), "public");
  
  if (parentPath) {
    return join(publicDir, parentPath, folderName);
  }
  
  return join(publicDir, folderName);
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function invalidateFolderCaches(parentId?: string): void {
  invalidateCache();
  revalidatePath("/");
  
  if (parentId) {
    revalidatePath(`/folder/${parentId}`);
  }
}

async function validateFolderOperation(
  folderId: string,
  requireExists: boolean = true
): Promise<{ valid: boolean; folder?: any; error?: string }> {
  const normalizedId = folderId || 'root';
  
  let folder = await findFolder(normalizedId);
  
  if (!folder && normalizedId.startsWith('folder-')) {
    const path = getFolderPathFromId(normalizedId);
    if (path) {
      const root = await findFolder('root');
      if (root) {
        folder = await findFolder(normalizedId, root);
      }
    }
  }

  if (requireExists && !folder) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FOLDER_NOT_FOUND,
    };
  }

  if (!requireExists && folder) {
    return {
      valid: false,
      folder,
      error: ERROR_MESSAGES.FOLDER_EXISTS,
    };
  }

  return { valid: true, folder };
}

export async function GET(
  _req: Request,
  { params }: FolderParams
): Promise<NextResponse> {
  try {
    const decodedId = decodeURIComponent(params.id);
    const validation = await validateFolderOperation(decodedId, true);
    
    if (!validation.valid) {
      return errorResponse(
        validation.error || ERROR_MESSAGES.FOLDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return NextResponse.json(validation.folder);
  } catch {
    return errorResponse(
      ERROR_MESSAGES.FOLDER_NOT_FOUND,
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
}

export async function POST(
  req: Request,
  { params }: FolderParams
): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    const decodedId = decodeURIComponent(params.id || 'root');
    const parentValidation = await validateFolderOperation(decodedId, true);
    
    if (!parentValidation.valid) {
      return errorResponse(
        `Parent folder not found (ID: ${decodedId})`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const folderName = validateFolderName(body.name);
    if (!folderName) {
      return errorResponse(
        ERROR_MESSAGES.INVALID_FOLDER_NAME,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const parentPath = getFolderPathFromId(decodedId);
    const targetDir = buildFolderPath(parentPath, folderName);

    if (await directoryExists(targetDir)) {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_EXISTS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await mkdir(targetDir, { recursive: true });
    invalidateFolderCaches(decodedId);

    return successResponse({ folderName });

  } catch {
    return errorResponse(
      ERROR_MESSAGES.FOLDER_CREATE_FAILED,
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: FolderParams
): Promise<NextResponse> {
  try {
    const { name } = await req.json();
    
    const folderName = validateFolderName(name);
    if (!folderName) {
      return errorResponse(
        ERROR_MESSAGES.INVALID_FOLDER_NAME,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (params.id === "root") {
      return errorResponse(
        "Cannot rename root folder",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const folderPath = getFolderPathFromId(params.id);
    
    if (!folderPath) {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const publicDir = join(process.cwd(), "public");
    const oldPath = join(publicDir, folderPath);
    
    const parentPath = join(folderPath, "..");
    const newPath = parentPath === "." 
      ? join(publicDir, folderName)
      : join(publicDir, parentPath, folderName);

    if (await directoryExists(newPath) && oldPath !== newPath) {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_EXISTS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (oldPath !== newPath) {
      const { rename } = await import("fs/promises");
      await rename(oldPath, newPath);
    }

    invalidateFolderCaches();

    return successResponse({ folderName });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return errorResponse(
      "Failed to rename folder",
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: FolderParams
): Promise<NextResponse> {
  try {
    if (params.id === "root") {
      return errorResponse(
        ERROR_MESSAGES.CANNOT_DELETE_ROOT,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const folderPath = getFolderPathFromId(params.id);
    
    if (!folderPath) {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const publicDir = join(process.cwd(), "public");
    const physicalFolderPath = join(publicDir, folderPath);

    if (!(await directoryExists(physicalFolderPath))) {
      return errorResponse(
        ERROR_MESSAGES.FOLDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    try {
      await rmdir(physicalFolderPath);
    } catch (error: any) {
      if (error.code === 'ENOTEMPTY' || error.code === 'EEXIST') {
        return errorResponse(
          ERROR_MESSAGES.FOLDER_NOT_EMPTY,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      throw error; 
    }

    invalidateFolderCaches();

    return successResponse();

  } catch {
    return errorResponse(
      ERROR_MESSAGES.FOLDER_DELETE_FAILED,
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
}