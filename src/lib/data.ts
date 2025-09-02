import { readdir, stat } from "fs/promises";
import { join } from "path";

export type FileNode = {
  id: string;
  name: string;
  type: "file";
  path: string;
};

export type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  children: Array<FolderNode | FileNode>;
  path: string;
};

function generateFolderId(relativePath: string): string {
  if (!relativePath) return "root";
  return `folder-${relativePath.replace(/\//g, "__")}`;
}

export function getFolderPathFromId(folderId: string): string {
  if (folderId === "root") return "";

  if (folderId.startsWith("folder-")) {
    const pathPart = folderId.substring(7);

    if (pathPart.includes("__")) {
      return pathPart.replace(/__/g, "/");
    }

    try {
      return decodeURIComponent(pathPart);
    } catch {
      return pathPart;
    }
  }

  return "";
}

export async function buildFileSystemTree(
  relativePath = ""
): Promise<FolderNode> {
  const publicDir = join(process.cwd(), "public");
  const fullPath = relativePath ? join(publicDir, relativePath) : publicDir;

  const children: Array<FolderNode | FileNode> = [];


  const items = await readdir(fullPath);

  for (const item of items) {
    const itemFullPath = join(fullPath, item);
    const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;


    const stats = await stat(itemFullPath);

    if (stats.isDirectory()) {
      const subFolder = await buildFileSystemTree(itemRelativePath);
      children.push(subFolder);
    } else if (stats.isFile()) {
      children.push({
        id: `file-${itemRelativePath.replace(/[^a-zA-Z0-9]/g, "-")}`,
        name: item,
        type: "file",
        path: itemRelativePath,
      });
    }

  }


  const folderId = generateFolderId(relativePath);

  return {
    id: folderId,
    name: relativePath ? relativePath.split("/").pop() || "Unknown" : "Root",
    type: "folder",
    children,
    path: relativePath,
  };
}

let cachedTree: FolderNode | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 2000;

export async function getRoot(): Promise<FolderNode> {
  const now = Date.now();
  if (cachedTree && now - lastCacheTime < CACHE_DURATION) {
    return cachedTree;
  }

  cachedTree = await buildFileSystemTree();
  lastCacheTime = now;
  return cachedTree;
}

export function invalidateCache() {
  cachedTree = null;
  lastCacheTime = 0;
}

export async function findFolder(
  id: string,
  current?: FolderNode
): Promise<FolderNode | null> {
  if (!current) {
    current = await getRoot();
  }

  if (current.id === id) return current;

  if (id !== "root" && id.startsWith("folder-")) {
    const searchPath = getFolderPathFromId(id);

    if (current.path === searchPath) {
      return current;
    }

    if (generateFolderId(current.path) === id) {
      return current;
    }
  }

  for (const child of current.children) {
    if (child.type === "folder") {
      const result = await findFolder(id, child);
      if (result) return result;
    }
  }

  return null;
}

export async function getBreadcrumbPath(
  id: string,
  current?: FolderNode,
  path: Array<{ id: string; name: string }> = []
): Promise<Array<{ id: string; name: string }> | null> {
  if (!current) {
    current = await getRoot();
  }

  const currentPath = [...path, { id: current.id, name: current.name }];

  if (current.id === id) {
    return currentPath;
  }

  if (id !== "root" && id.startsWith("folder-")) {
    const searchPath = getFolderPathFromId(id);
    if (current.path === searchPath || generateFolderId(current.path) === id) {
      return currentPath;
    }
  }

  for (const child of current.children) {
    if (child.type === "folder") {
      const result = await getBreadcrumbPath(id, child, currentPath);
      if (result) return result;
    }
  }

  return null;
}

export async function findItem(
  id: string,
  current?: FolderNode
): Promise<{ item: FileNode | FolderNode; parent: FolderNode } | null> {
  if (!current) {
    current = await getRoot();
  }

  for (const child of current.children) {
    if (child.id === id) {
      return { item: child, parent: current };
    }

    if (child.type === "folder" && id.startsWith("folder-")) {
      const searchPath = getFolderPathFromId(id);
      if (child.path === searchPath || generateFolderId(child.path) === id) {
        return { item: child, parent: current };
      }
    }

    if (child.type === "folder") {
      const result = await findItem(id, child);
      if (result) return result;
    }
  }
  return null;
}
