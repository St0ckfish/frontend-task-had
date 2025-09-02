import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  findFolder,
  findItem,
  invalidateCache,
  getFolderPathFromId,
} from "@/src/lib/data";
import { writeFile, mkdir, access, unlink } from "fs/promises";
import { join, basename, parse } from "path";

export const runtime = "nodejs";

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  INVALID_REQUEST: "Invalid request: missing parent or file",
  INVALID_FILE_NAME: "Invalid file name",
  FILE_NOT_FOUND: "File not found",
  FILE_DELETE_FAILED: "Failed to delete file from disk",
  FILE_CREATE_FAILED: "Failed to create file",
  FILE_DELETE_ERROR: "Failed to delete file",
} as const;

async function generateUniqueFileName(
  dir: string,
  fileName: string
): Promise<string> {
  const { name, ext } = parse(fileName);
  let uniqueName = fileName;
  let counter = 1;

  while (await fileExists(join(dir, uniqueName))) {
    uniqueName = `${name}(${counter})${ext}`;
    counter++;
  }

  return uniqueName;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getTargetDirectory(folderPath: string | null): string {
  const publicDir = join(process.cwd(), "public");
  return folderPath ? join(publicDir, folderPath) : publicDir;
}

function buildResponsePaths(folderPath: string | null, fileName: string) {
  return {
    physical: join(getTargetDirectory(folderPath), fileName),
    virtual: folderPath ? `${folderPath}/${fileName}` : fileName,
  };
}

function invalidateCaches(parentId: string): void {
  invalidateCache();
  revalidatePath("/");
  revalidatePath(`/folder/${parentId}`);
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function successResponse(data: any): NextResponse {
  return NextResponse.json({ success: true, ...data });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const providedName = formData.get("name")?.toString();
    
    const decodedId = decodeURIComponent(params.id || 'root');
    const parent = await findFolder(decodedId);
    
    if (!parent) {
      return errorResponse(`Parent folder not found (ID: ${decodedId})`, HTTP_STATUS.NOT_FOUND);
    }
    
    if (!file) {
      return errorResponse("No file provided", HTTP_STATUS.BAD_REQUEST);
    }

    const rawName = providedName?.trim() || file.name;
    const safeName = basename(rawName);
    
    if (!safeName) {
      return errorResponse(ERROR_MESSAGES.INVALID_FILE_NAME, HTTP_STATUS.BAD_REQUEST);
    }

    const folderPath = getFolderPathFromId(decodedId);
    const targetDir = getTargetDirectory(folderPath);

    await mkdir(targetDir, { recursive: true });

    const uniqueName = await generateUniqueFileName(targetDir, safeName);
    const paths = buildResponsePaths(folderPath, uniqueName);

    const bytes = await file.arrayBuffer();
    await writeFile(paths.physical, Buffer.from(bytes));

    invalidateCaches(decodedId);

    return successResponse({
      fileName: uniqueName,
      path: paths.virtual,
    });

  } catch {
    return errorResponse(ERROR_MESSAGES.FILE_CREATE_FAILED, HTTP_STATUS.INTERNAL_ERROR);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { name } = await req.json();
    
    if (!name || typeof name !== "string") {
      return errorResponse("Invalid name provided", HTTP_STATUS.BAD_REQUEST);
    }

    const result = await findItem(params.id);
    
    if (!result || result.item.type !== "file") {
      return errorResponse(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const safeName = basename(name.trim());
    
    if (!safeName) {
      return errorResponse(ERROR_MESSAGES.INVALID_FILE_NAME, HTTP_STATUS.BAD_REQUEST);
    }

    const publicDir = join(process.cwd(), "public");
    const oldPath = join(publicDir, result.item.path);
    
    const { dir } = parse(result.item.path);
    const newPath = join(publicDir, dir, safeName);

    if (await fileExists(newPath) && oldPath !== newPath) {
      return errorResponse("File with this name already exists", HTTP_STATUS.BAD_REQUEST);
    }

    if (oldPath !== newPath) {
      const { rename } = await import("fs/promises");
      await rename(oldPath, newPath);
    }

    invalidateCache();
    revalidatePath("/");
    
    if (result.parent && result.parent.id !== "root") {
      revalidatePath(`/folder/${result.parent.id}`);
    }

    return successResponse({ 
      fileName: safeName,
      path: dir ? `${dir}/${safeName}` : safeName
    });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return errorResponse(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return errorResponse("Failed to rename file", HTTP_STATUS.INTERNAL_ERROR);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const result = await findItem(params.id);
    
    if (!result || result.item.type !== "file") {
      return errorResponse(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const publicDir = join(process.cwd(), "public");
    const physicalFilePath = join(publicDir, result.item.path);

    try {
      await unlink(physicalFilePath);
    } catch {
      return errorResponse(ERROR_MESSAGES.FILE_DELETE_FAILED, HTTP_STATUS.INTERNAL_ERROR);
    }

    invalidateCache();
    revalidatePath("/");

    return successResponse({});

  } catch {
    return errorResponse(ERROR_MESSAGES.FILE_DELETE_ERROR, HTTP_STATUS.INTERNAL_ERROR);
  }
}
