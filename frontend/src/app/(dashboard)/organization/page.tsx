'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import OrgTree from '@/components/OrgTree';
import { OrgNode, ApiResponse } from '@/types';

export default function OrganizationPage() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<OrgNode[]>>('/organization/tree')
      .then((res) => setTree(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Organization</h1>
      <p className="mt-1 text-sm text-muted">Reporting hierarchy and structure</p>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : (
        <div className="mt-8">
          <OrgTree tree={tree} />
        </div>
      )}
    </div>
  );
}
