import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseService } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/database.types'

type UserFormData = Omit<Tables<'users'>, 'id' | 'created_at'>

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<UserFormData>()

  useEffect(() => {
    if (isEditing && id) {
      loadUser()
    }
  }, [id, isEditing])

  const loadUser = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const user = await supabaseService.getUserById(id)
      reset({
        name: user.name,
        email: user.email,
        job_role: user.job_role || '',
        group: user.group || '',
        team: user.team || '',
        start_date: user.start_date || ''
      })
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

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)

      if (isEditing && id) {
        await supabaseService.updateUser(id, data)
        toast({
          title: 'Success',
          description: 'User updated successfully',
        })
        navigate(`/users/${id}`)
      } else {
        const user = await supabaseService.createUser(data)
        toast({
          title: 'Success',
          description: 'User created successfully',
        })
        navigate(`/users/${user.id}`)
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit User' : 'New User'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update user information' : 'Create a new user account'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_role">Job Role</Label>
                <Input
                  id="job_role"
                  {...register('job_role')}
                  placeholder="e.g., Product Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Group</Label>
                <Input
                  id="group"
                  {...register('group')}
                  placeholder="e.g., Engineering, Design, Product"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  {...register('team')}
                  placeholder="e.g., Platform, Growth, SecOps"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isDirty}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}