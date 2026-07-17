import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', to: '/#features' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'FAQ', to: '/#faq' },
  ],
  Company: [
    { label: 'About', to: '/#' },
    { label: 'Blog', to: '/#' },
    { label: 'Contact', to: '/#' },
  ],
  Resources: [
    { label: 'Help Center', to: '/#' },
    { label: 'Privacy', to: '/#' },
    { label: 'Terms', to: '/#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-950/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-dark-900 dark:text-dark-100">
                Resume<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 max-w-xs">
              AI-powered resume analysis and optimization platform. Get more interviews with a better resume.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-brand-500 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-brand-500 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-brand-500 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 hover:text-brand-500 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-dark-500 dark:text-dark-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-dark-200 dark:border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500 dark:text-dark-400 flex items-center gap-1">
            &copy; {new Date().getFullYear()} ResumeAI. Made with <Heart className="h-3 w-3 text-red-500" /> for job seekers.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/#" className="text-xs text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200">
              Privacy Policy
            </Link>
            <Link to="/#" className="text-xs text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
