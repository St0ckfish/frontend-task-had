import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findFolder } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const folder = findFolder(params.id);
  if (!folder) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
  }
  return NextResponse.json(folder);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name } = await req.json();
  const parent = findFolder(params.id);
  if (!parent || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  parent.children.push({
    id: Date.now().toString(),
    name: name.trim(),
    type: 'folder',
    children: [],
  });
  revalidatePath('/');
  revalidatePath(`/folder/${params.id}`);
  return NextResponse.json({ success: true });
}
