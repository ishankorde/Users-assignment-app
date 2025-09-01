import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { StatusPill, BooleanPill } from '@/components/ui/status-pill'
import { Badge } from '@/components/ui/badge'
import { supabaseService } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/database.types'

type App = Tables<'apps'> & {
  user_app_assignments?: { count: number }[]
}

export default function Apps() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      const data = await supabaseService.getApps()
      setApps(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<App>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'tier',
      label: 'Tier',
      sortable: true,
      render: (value) => value ? <Badge>{value}</Badge> : '-'
    },
    {
      key: 'owner_team',
      label: 'Owner Team',
      sortable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'sso_required',
      label: 'SSO Required',
      sortable: true,
      searchable: false,
      render: (value) => <BooleanPill value={value} />
    },
    {
      key: 'user_app_assignments',
      label: 'Users',
      sortable: false,
      searchable: false,
      render: (assignments) => (
        <Badge variant="secondary">
          {assignments?.[0]?.count || 0}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      searchable: false,
      render: (value) => <StatusPill status={value} />
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Manage applications and user assignments
          </p>
        </div>
        <Button onClick={() => navigate('/apps/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add App
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={apps}
        columns={columns}
        searchPlaceholder="Search by name, vendor, or category..."
        onRowClick={(app) => navigate(`/apps/${app.id}`)}
      />
    </div>
  )
}