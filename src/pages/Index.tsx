import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "Users Management",
      description: "Manage user accounts, teams, and app assignments",
      icon: Users,
      href: "/users",
      color: "text-blue-500"
    },
    {
      title: "Applications",
      description: "Manage app catalog and user assignments",
      icon: Settings,
      href: "/apps",
      color: "text-green-500"
    },
    {
      title: "Setup & Configuration",
      description: "Database schema and setup instructions",
      icon: Database,
      href: "/setup",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SaaS Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A comprehensive admin interface for managing users, applications, and access control with Supabase integration
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/users">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/setup">View Setup</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground">
            Everything you need to manage users and applications
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className={`mx-auto p-3 rounded-full bg-background border w-fit ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={feature.href}>
                    Open {feature.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
