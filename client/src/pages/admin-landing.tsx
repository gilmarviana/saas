import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdminLandingPageProps {
  adminId: number;
}

export default function AdminLandingPage({ adminId }: AdminLandingPageProps) {
  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/users", adminId],
    enabled: !!adminId,
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services", { adminId }],
    enabled: !!adminId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">Administrator Not Found</h1>
          <p className="text-slate-600">The requested administrator page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-admin-hero">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="fas fa-briefcase text-2xl text-accent mr-3"></i>
              <span className="text-xl font-bold text-secondary">
                {admin.businessName || `${admin.username} - Business`}
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-slate-600 hover:text-accent transition-colors">Services</a>
              <a href="#about" className="text-slate-600 hover:text-accent transition-colors">About</a>
              <a href="#contact" className="text-slate-600 hover:text-accent transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button className="bg-accent hover:bg-accent/90">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
              Professional <span className="text-accent">Business Solutions</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              {admin.heroDescription || "Expert consulting services to help your business grow and succeed. Get personalized solutions tailored to your unique needs."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Our Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive solutions for your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services && services.length > 0 ? (
              services.map((service: any) => (
                <div key={service.id} className="text-center p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <i className="fas fa-chart-line text-3xl text-accent mb-4"></i>
                  <h3 className="text-xl font-semibold text-secondary mb-2">{service.name}</h3>
                  <p className="text-slate-600">{service.description}</p>
                </div>
              ))
            ) : (
              <>
                <div className="text-center p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <i className="fas fa-chart-line text-3xl text-accent mb-4"></i>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Business Strategy</h3>
                  <p className="text-slate-600">Strategic planning and market analysis to drive growth</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <i className="fas fa-users text-3xl text-accent mb-4"></i>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Team Management</h3>
                  <p className="text-slate-600">Optimize your team's performance and productivity</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <i className="fas fa-cog text-3xl text-accent mb-4"></i>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Process Optimization</h3>
                  <p className="text-slate-600">Streamline operations for maximum efficiency</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">About {admin.username}</h2>
              <p className="text-lg text-slate-600 mb-6">
                {admin.bio || "With years of experience in business consulting, I help companies achieve their goals through strategic planning and innovative solutions."}
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-check text-accent mr-3"></i>
                  <span className="text-slate-600">Certified Business Consultant</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check text-accent mr-3"></i>
                  <span className="text-slate-600">Successful Projects</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check text-accent mr-3"></i>
                  <span className="text-slate-600">Industry Expert</span>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Professional business consultant" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Get In Touch</h2>
            <p className="text-xl text-slate-600">Ready to transform your business? Let's talk.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div className="flex items-center">
                  <i className="fas fa-envelope text-accent text-xl mr-4"></i>
                  <div>
                    <p className="font-semibold text-secondary">Email</p>
                    <p className="text-slate-600">{admin.contactEmail || admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-phone text-accent text-xl mr-4"></i>
                  <div>
                    <p className="font-semibold text-secondary">Phone</p>
                    <p className="text-slate-600">{admin.contactPhone || "Contact for phone number"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-accent text-xl mr-4"></i>
                  <div>
                    <p className="font-semibold text-secondary">Location</p>
                    <p className="text-slate-600">{admin.contactLocation || "Global"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message" rows={4} />
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-briefcase text-2xl text-accent mr-3"></i>
              <span className="text-xl font-bold">{admin.businessName || `${admin.username} - Business`}</span>
            </div>
            <p className="text-slate-400 mb-4">Professional business solutions for your success</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
            </div>
            <div className="border-t border-slate-700 mt-8 pt-8 text-slate-400">
              <p>&copy; 2024 {admin.businessName || `${admin.username} - Business`}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
