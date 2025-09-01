import Link from 'next/link';
import type { FolderNode, FileNode } from '@/lib/data';

export function FolderList({ nodes }: { nodes: Array<FolderNode | FileNode> }) {
  if (!nodes.length) {
    return <p className="text-gray-500">(empty)</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {nodes.map((node) => {
        if (node.type === 'folder') {
          return (
            <li key={node.id}>
              <Link
                href={`/folder/${node.id}`}
                className="block border p-2 rounded bg-white hover:bg-gray-50"
              >
                {node.name}
              </Link>
            </li>
          );
        }
        return (
          <li key={node.id} className="block border p-2 rounded bg-white">
            {/* TODO: improve file rendering */}
            {node.name}
          </li>
        );
      })}
    </ul>
  );
}
