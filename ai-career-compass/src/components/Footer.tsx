import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-card mt-auto">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg gradient-text">AI Career Compass</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered career guidance for every path. Discover, learn, and grow.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Platform</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/quiz" className="block hover:text-foreground transition-colors">Career Quiz</Link>
            <Link to="/results" className="block hover:text-foreground transition-colors">Career Explorer</Link>
            <Link to="/study-tools" className="block hover:text-foreground transition-colors">Study Tools</Link>
            <Link to="/roadmap" className="block hover:text-foreground transition-colors">Roadmaps</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Resources</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/documents" className="block hover:text-foreground transition-colors">Document Tools</Link>
            <Link to="/profile" className="block hover:text-foreground transition-colors">My Profile</Link>
            <Link to="/quiz" className="block hover:text-foreground transition-colors">Career Guides</Link>
            <Link to="/results" className="block hover:text-foreground transition-colors">FAQ</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/" className="block hover:text-foreground transition-colors">About</Link>
            <Link to="/auth" className="block hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/auth" className="block hover:text-foreground transition-colors">Sign Up</Link>
            <a href="mailto:nallabati.raghuram1@gmail.com" className="block hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2026 AI Career Compass. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
