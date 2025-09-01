import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

console.log('Available env vars:', import.meta.env)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('SUPABASE_URL:', import.meta.env.SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('SUPABASE_PUBLISHABLE_KEY:', import.meta.env.SUPABASE_PUBLISHABLE_KEY)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY

console.log('Final supabaseUrl:', supabaseUrl)
console.log('Final supabaseAnonKey:', supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for data access
export const supabaseService = {
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_app_assignments(count)
      `)
      .order('name')
    
    if (error) throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getUserAssignments(userId: string) {
    const { data, error } = await supabase
      .from('assignments_expanded')
      .select('*')
      .eq('user_id', userId)
      .order('assigned_on', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createUser(user: Omit<Database['public']['Tables']['users']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Apps
  async getApps() {
    const { data, error } = await supabase
      .from('apps')
      .select(`
        *,
        user_app_assignments(count)
      `)
      .order('name')
    
    if (error) throw error
    return data
  },

  async getAppById(id: string) {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getAppAssignments(appId: string) {
    const { data, error } = await supabase
      .from('assignments_expanded')
      .select('*')
      .eq('app_id', appId)
      .order('assigned_on', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createApp(app: Omit<Database['public']['Tables']['apps']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('apps')
      .insert(app)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateApp(id: string, updates: Partial<Database['public']['Tables']['apps']['Update']>) {
    const { data, error } = await supabase
      .from('apps')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteApp(id: string) {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Assignments
  async createAssignment(assignment: Omit<Database['public']['Tables']['user_app_assignments']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_app_assignments')
      .insert(assignment)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAssignment(id: string, updates: Partial<Database['public']['Tables']['user_app_assignments']['Update']>) {
    const { data, error } = await supabase
      .from('user_app_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase
      .from('user_app_assignments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get apps not assigned to a user
  async getUnassignedApps(userId: string) {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .not('id', 'in', `(
        SELECT app_id 
        FROM user_app_assignments 
        WHERE user_id = '${userId}'
      )`)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get users not assigned to an app
  async getUnassignedUsers(appId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .not('id', 'in', `(
        SELECT user_id 
        FROM user_app_assignments 
        WHERE app_id = '${appId}'
      )`)
      .order('name')
    
    if (error) throw error
    return data
  }
}