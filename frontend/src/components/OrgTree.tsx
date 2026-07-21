'use client';

import { OrgNode } from '@/types';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import clsx from 'clsx';

function TreeNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const imgUrl = getImageUrl(node.profileImage);

  return (
    <div className="select-none">
      <div
        className={clsx(
          'flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface',
          depth === 0 && 'font-semibold'
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-muted">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {imgUrl ? (
          <img src={imgUrl} alt={node.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
            <User size={14} />
          </div>
        )}

        <Link href={`/employees/${node._id}`} className="flex-1 hover:text-brand">
          <span className="text-foreground">{node.name}</span>
          <span className="ml-2 text-xs text-muted">
            {node.designation} · {node.department}
          </span>
        </Link>

        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            node.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-500/10 text-slate-500'
          )}
        >
          {node.status}
        </span>
      </div>

      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNode key={child._id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function OrgTree({ tree }: { tree: OrgNode[] }) {
  if (tree.length === 0) {
    return (
      <p className="py-8 text-center text-muted">No organization hierarchy found.</p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {tree.map((node) => (
        <TreeNode key={node._id} node={node} />
      ))}
    </div>
  );
}
