
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Your Project
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A clean slate ready for your next amazing idea. Start building something incredible.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Feature One</CardTitle>
                <CardDescription>
                  Add your first feature description here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  This is where you can describe what makes your project special.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Feature Two</CardTitle>
                <CardDescription>
                  Add your second feature description here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Another great feature that sets your project apart.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Feature Three</CardTitle>
                <CardDescription>
                  Add your third feature description here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  The finishing touch that completes your offering.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3">
              Get Started
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-slate-500 text-sm">
          <p>Ready to build something amazing? Start customizing this template.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
