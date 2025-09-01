import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseService } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/database.types'

type AppFormData = Omit<Tables<'apps'>, 'id' | 'created_at'>

export default function AppForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<AppFormData>({
    defaultValues: {
      sso_required: false,
      status: 'active'
    }
  })

  const ssoRequired = watch('sso_required')
  const status = watch('status')

  useEffect(() => {
    if (isEditing && id) {
      loadApp()
    }
  }, [id, isEditing])

  const loadApp = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const app = await supabaseService.getAppById(id)
      reset({
        name: app.name,
        category: app.category || '',
        vendor: app.vendor || '',
        tier: app.tier || '',
        owner_team: app.owner_team || '',
        sso_required: app.sso_required,
        data_sensitivity: app.data_sensitivity || '',
        status: app.status,
        website_url: app.website_url || '',
        notes: app.notes || ''
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

  const onSubmit = async (data: AppFormData) => {
    try {
      setLoading(true)

      // Convert empty strings to null for optional fields
      const cleanData = {
        ...data,
        category: data.category || null,
        vendor: data.vendor || null,
        tier: data.tier || null,
        owner_team: data.owner_team || null,
        data_sensitivity: data.data_sensitivity || null,
        website_url: data.website_url || null,
        notes: data.notes || null
      }

      if (isEditing && id) {
        await supabaseService.updateApp(id, cleanData)
        toast({
          title: 'Success',
          description: 'Application updated successfully',
        })
        navigate(`/apps/${id}`)
      } else {
        const app = await supabaseService.createApp(cleanData)
        toast({
          title: 'Success',
          description: 'Application created successfully',
        })
        navigate(`/apps/${app.id}`)
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

  const categories = [
    'CRM', 'Design', 'DevTools', 'Communication', 'Productivity', 
    'Analytics', 'Security', 'HR', 'Finance', 'Marketing'
  ]

  const tiers = ['Free', 'Basic', 'Pro', 'Professional', 'Enterprise']

  const dataSensitivityLevels = ['Low', 'Medium', 'High']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/apps')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Application' : 'New Application'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update application information' : 'Add a new application to the catalog'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Application Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Application name is required' })}
                  placeholder="Enter application name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  {...register('vendor')}
                  placeholder="e.g., Slack Technologies"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={watch('category') || ''} 
                  onValueChange={(value) => setValue('category', value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Tier</Label>
                <Select 
                  value={watch('tier') || ''} 
                  onValueChange={(value) => setValue('tier', value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_team">Owner Team</Label>
                <Input
                  id="owner_team"
                  {...register('owner_team')}
                  placeholder="e.g., Engineering, IT"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_sensitivity">Data Sensitivity</Label>
                <Select 
                  value={watch('data_sensitivity') || ''} 
                  onValueChange={(value) => setValue('data_sensitivity', value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSensitivityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setValue('status', value, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                {...register('website_url')}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sso_required"
                checked={ssoRequired}
                onCheckedChange={(checked) => setValue('sso_required', checked, { shouldDirty: true })}
              />
              <Label htmlFor="sso_required">SSO Required</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about this application..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/apps')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isDirty}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Application' : 'Create Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}