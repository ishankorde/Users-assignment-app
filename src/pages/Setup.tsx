import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Code, Settings } from 'lucide-react'

export default function Setup() {
  const sqlSchema = `-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  job_role TEXT,
  start_date DATE,
  "group" TEXT,
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create apps table  
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  vendor TEXT,
  tier TEXT,
  owner_team TEXT,
  sso_required BOOLEAN DEFAULT false,
  data_sensitivity TEXT,
  status TEXT DEFAULT 'active',
  website_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_app_assignments table (join table)
CREATE TABLE user_app_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  role_in_app TEXT,
  access_level TEXT,
  license_type TEXT,
  assigned_on DATE DEFAULT now(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_team ON users(team);
CREATE INDEX idx_users_group ON users("group");
CREATE INDEX idx_assignments_user_id ON user_app_assignments(user_id);
CREATE INDEX idx_assignments_app_id ON user_app_assignments(app_id);

-- Create expanded assignments view
CREATE VIEW assignments_expanded AS
SELECT 
  ua.id as assignment_id,
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  u.team as user_team,
  u."group" as user_group,
  a.id as app_id,
  a.name as app_name,
  a.category as app_category,
  ua.role_in_app,
  ua.license_type,
  ua.access_level,
  ua.assigned_on,
  ua.status
FROM user_app_assignments ua
JOIN users u ON ua.user_id = u.id
JOIN apps a ON ua.app_id = a.id;

-- Insert sample data
INSERT INTO users (name, email, job_role, start_date, "group", team) VALUES
('Alice Johnson', 'alice@company.com', 'Product Manager', '2023-01-15', 'Product', 'Growth'),
('Bob Chen', 'bob@company.com', 'Senior Engineer', '2022-03-10', 'Engineering', 'Platform'),
('Carol Rodriguez', 'carol@company.com', 'UX Designer', '2023-06-01', 'Design', 'Experience'),
('David Kim', 'david@company.com', 'DevOps Engineer', '2022-11-20', 'Engineering', 'SecOps'),
('Emma Wilson', 'emma@company.com', 'Sales Manager', '2023-02-14', 'Sales', 'Enterprise');

INSERT INTO apps (name, category, vendor, tier, owner_team, sso_required, data_sensitivity, status, website_url) VALUES
('Slack', 'Communication', 'Slack Technologies', 'Pro', 'IT', true, 'Medium', 'active', 'https://slack.com'),
('Figma', 'Design', 'Figma Inc', 'Professional', 'Design', true, 'Low', 'active', 'https://figma.com'),
('GitHub', 'DevTools', 'GitHub Inc', 'Enterprise', 'Engineering', true, 'High', 'active', 'https://github.com'),
('Salesforce', 'CRM', 'Salesforce', 'Enterprise', 'Sales', true, 'High', 'active', 'https://salesforce.com'),
('Notion', 'Productivity', 'Notion Labs', 'Team', 'Product', false, 'Medium', 'active', 'https://notion.so');

-- Sample assignments
INSERT INTO user_app_assignments (user_id, app_id, role_in_app, access_level, license_type, assigned_on, status)
SELECT u.id, a.id, 'Admin', 'Full', 'Full License', '2023-07-01', 'active'
FROM users u, apps a 
WHERE u.email = 'alice@company.com' AND a.name = 'Notion'
UNION ALL
SELECT u.id, a.id, 'Member', 'Standard', 'Seat License', '2023-07-01', 'active'
FROM users u, apps a 
WHERE u.email = 'bob@company.com' AND a.name = 'GitHub'
UNION ALL
SELECT u.id, a.id, 'Editor', 'Full', 'Professional', '2023-07-01', 'active'
FROM users u, apps a 
WHERE u.email = 'carol@company.com' AND a.name = 'Figma';`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup</h1>
        <p className="text-muted-foreground">
          Database schema and configuration instructions
        </p>
      </div>

      <div className="grid gap-6">
        {/* Database Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Schema
            </CardTitle>
            <CardDescription>
              Run this SQL script in your Supabase SQL editor to create the required tables and sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {sqlSchema}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Variables
            </CardTitle>
            <CardDescription>
              Add these environment variables to your project (in Lovable, these are handled automatically when connected to Supabase)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">VITE_SUPABASE_URL</Badge>
                <span className="text-sm text-muted-foreground">Your Supabase project URL</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">VITE_SUPABASE_ANON_KEY</Badge>
                <span className="text-sm text-muted-foreground">Your Supabase anon/public key</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Features Implemented
            </CardTitle>
            <CardDescription>
              This admin app includes all the requested functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Users Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User profiles with teams and groups</li>
                  <li>• App assignment management</li>
                  <li>• Create, edit, delete users</li>
                  <li>• Searchable and sortable tables</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Applications</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• App catalog with categories</li>
                  <li>• User assignment tracking</li>
                  <li>• SSO and security settings</li>
                  <li>• Status and tier management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}