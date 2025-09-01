import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findFolder } from '@/lib/data';
import { writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const providedName = formData.get('name')?.toString();
  const parent = findFolder(params.id);
  if (!parent || !file) {
    return NextResponse.json({ error: 'Invalid request: missing parent or file' }, { status: 400 });
  }

  // Decide filename: prefer 'name' field, fallback to uploaded file's original name
  const rawName = (providedName && providedName.trim()) ? providedName.trim() : file.name;
  const safeName = basename(rawName);
  if (!safeName) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }
  const publicDir = join(process.cwd(), 'public');
  const filePath = join(publicDir, safeName);

  try {
    // Ensure public directory exists and create the file (fail if it already exists)
    await mkdir(publicDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes), { flag: 'wx' });
  } catch (err: any) {
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'EEXIST') {
      return NextResponse.json({ error: 'File already exists in public folder' }, { status: 409 });
    }
    console.error('Failed to create file in public folder:', err);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }

  // Update in-memory structure after successful file creation
  parent.children.push({
    id: Date.now().toString(),
    name: safeName,
    type: 'file',
  });
  revalidatePath('/');
  revalidatePath(`/folder/${params.id}`);
  return NextResponse.json({ success: true });
}
