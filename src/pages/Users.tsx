import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { StatusPill } from '@/components/ui/status-pill'
import { Badge } from '@/components/ui/badge'
import { supabaseService } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/database.types'

type User = Tables<'users'> & {
  user_app_assignments?: { count: number }[]
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await supabaseService.getUsers()
      setUsers(data || [])
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

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'job_role',
      label: 'Job Role',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'group',
      label: 'Group',
      sortable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'user_app_assignments',
      label: 'Apps',
      sortable: false,
      searchable: false,
      render: (assignments) => (
        <Badge variant="secondary">
          {assignments?.[0]?.count || 0}
        </Badge>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and app assignments
          </p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search by name or email..."
        onRowClick={(user) => navigate(`/users/${user.id}`)}
      />
    </div>
  )
}