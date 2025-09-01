import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { StatusPill, BooleanPill } from '@/components/ui/status-pill'
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

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [app, setApp] = useState<Tables<'apps'> | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadAppData()
    }
  }, [id])

  const loadAppData = async () => {
    if (!id) return
    
    try {
      const [appData, assignmentsData] = await Promise.all([
        supabaseService.getAppById(id),
        supabaseService.getAppAssignments(id)
      ])
      
      setApp(appData)
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
      
      loadAppData()
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
      
      loadAppData()
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
      key: 'user_name',
      label: 'User',
      sortable: true,
    },
    {
      key: 'user_email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'user_team',
      label: 'Team',
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
        <div className="text-muted-foreground">Loading application details...</div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Application not found</h2>
        <Button onClick={() => navigate('/apps')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/apps')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <p className="text-muted-foreground">{app.vendor || 'No vendor specified'}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/apps/${app.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit App
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* App Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{app.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="font-medium">{app.category || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor</label>
              <p className="font-medium">{app.vendor || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tier</label>
              <p className="font-medium">{app.tier || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner Team</label>
              <p className="font-medium">{app.owner_team || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">SSO Required</label>
              <div className="mt-1">
                <BooleanPill value={app.sso_required} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Sensitivity</label>
              <p className="font-medium">{app.data_sensitivity || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <StatusPill status={app.status} />
              </div>
            </div>
            {app.website_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <div className="mt-1">
                  <Button variant="outline" size="sm" asChild>
                    <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Site
                    </a>
                  </Button>
                </div>
              </div>
            )}
            {app.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm mt-1">{app.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Users */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Users</CardTitle>
                <CardDescription>
                  Users with access to this application
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Assign Users
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