import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Briefcase, Users, CheckCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">JobBoard</h1>
          <nav className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Find Your Next Opportunity
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect job seekers with the right employers. A modern platform built for talent and opportunity.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                <Link href="/auth/register">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-gray-900 hover:-rotate-1 cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">For Job Seekers</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Create a profile, showcase your skills and experience, and apply to jobs from top companies.
              </p>
            </Card>
            <Card className="p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-gray-900 hover:rotate-1 cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">For Recruiters</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Post job listings, search for candidates by skills and qualifications, and manage applications.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Complete Profiles</h3>
              <p className="text-gray-600 relative z-10">
                Job seekers can build comprehensive profiles with education, skills, and certifications.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Smart Search</h3>
              <p className="text-gray-600 relative z-10">
                Recruiters can search candidates by qualifications, skills, and experience.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Easy Applications</h3>
              <p className="text-gray-600 relative z-10">
                Job seekers can apply to positions and track application status in real-time.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Job Management</h3>
              <p className="text-gray-600 relative z-10">
                Recruiters can create, edit, and manage job listings easily.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Company Verification</h3>
              <p className="text-gray-600 relative z-10">
                Build trust with verified company profiles and documents.
              </p>
            </Card>

            <Card className="p-6 border border-gray-200 group transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:border-gray-900 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-8 h-8 text-gray-900 mb-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">Secure & Private</h3>
              <p className="text-gray-600 relative z-10">
                Enterprise-grade security to protect user data and privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 border border-gray-200 bg-gray-900 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers and employers using JobBoard to find the perfect match.
            </p>
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/auth/register">
                Create an Account Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 JobBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
