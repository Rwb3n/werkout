import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <Layout>
      <Container className="text-center py-16 md:py-24">
        {/* Hero Section */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          Find Your Local Fitness Connection
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Werkout.in connects you directly with trainers, coaches, and fitness groups in your neighborhood. No closed ecosystems, just real connections.
        </p>
        <div className="space-x-4">
          {/* TODO: Link to signup/search */}
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </Container>

      {/* TODO: Add other sections (How it works, Features, Testimonials) */}
      <Container className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        {/* Placeholder for How it Works steps */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Search Locally</h3>
            <p className="text-muted-foreground">Find providers and groups near you based on your fitness goals.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">2. Connect Directly</h3>
            <p className="text-muted-foreground">View their existing profiles (Instagram, Strava) and contact them directly.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">3. Get Moving</h3>
            <p className="text-muted-foreground">Join sessions, attend events, and reach your fitness potential.</p>
          </div>
        </div>
      </Container>

    </Layout>
  );
}
