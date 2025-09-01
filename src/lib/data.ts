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

  return {
    id: relativePath
      ? `folder-${encodeURIComponent(relativePath)}`
      : "root",
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
    if (child.type === "folder") {
      const result = await findItem(id, child);
      if (result) return result;
    }
  }
  return null;
}

export function getFolderPathFromId(folderId: string): string {
  if (folderId === "root") return "";

  const encodedPath = folderId.replace(/^folder-/, "");
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}


