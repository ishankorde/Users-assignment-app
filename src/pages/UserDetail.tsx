import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { StatusPill } from '@/components/ui/status-pill'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { supabaseService } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/database.types'

type Assignment = Tables<'assignments_expanded'>

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<Tables<'users'> | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadUserData()
    }
  }, [id])

  const loadUserData = async () => {
    if (!id) return
    
    try {
      const [userData, assignmentsData] = await Promise.all([
        supabaseService.getUserById(id),
        supabaseService.getUserAssignments(id)
      ])
      
      setUser(userData)
      setAssignments(assignmentsData || [])
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

  const handleStatusToggle = async (assignment: Assignment) => {
    if (!assignment.assignment_id) return
    
    const newStatus = assignment.status === 'active' ? 'revoked' : 'active'
    
    try {
      await supabaseService.updateAssignment(assignment.assignment_id, {
        status: newStatus
      })
      
      toast({
        title: 'Success',
        description: `Assignment ${newStatus === 'active' ? 'restored' : 'revoked'}`,
      })
      
      loadUserData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleRemoveAssignment = async (assignment: Assignment) => {
    if (!assignment.assignment_id) return
    
    try {
      await supabaseService.deleteAssignment(assignment.assignment_id)
      
      toast({
        title: 'Success',
        description: 'Assignment removed',
      })
      
      loadUserData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const columns: Column<Assignment>[] = [
    {
      key: 'app_name',
      label: 'Application',
      sortable: true,
    },
    {
      key: 'app_category',
      label: 'Category',
      sortable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'role_in_app',
      label: 'Role',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'license_type',
      label: 'License',
      sortable: true,
      render: (value) => value ? <Badge>{value}</Badge> : '-'
    },
    {
      key: 'access_level',
      label: 'Access Level',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'assigned_on',
      label: 'Assigned On',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      searchable: false,
      render: (value) => <StatusPill status={value || 'unknown'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      searchable: false,
      render: (_, assignment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusToggle(assignment)}>
              {assignment.status === 'active' ? 'Revoke' : 'Restore'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRemoveAssignment(assignment)}
              className="text-destructive"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading user details...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/users/${user.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit User
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Job Role</label>
              <p className="font-medium">{user.job_role || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Group</label>
              <p className="font-medium">{user.group || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Team</label>
              <p className="font-medium">{user.team || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <p className="font-medium">
                {user.start_date ? new Date(user.start_date).toLocaleDateString() : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Assignments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>App Assignments</CardTitle>
                <CardDescription>
                  Applications assigned to this user
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Assign Apps
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={assignments}
                columns={columns}
                searchPlaceholder="Search assignments..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}