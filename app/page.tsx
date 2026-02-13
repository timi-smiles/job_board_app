import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import HeaderNav from '@/components/HeaderNav'
import FeaturedJobs from '@/components/FeaturedJobs'
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Search,
  FileText,
  Bell,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Star,
  Clock,
  Award,
  BarChart3
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Your Dream Job
                <span className="bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 bg-clip-text text-transparent block">
                  Awaits You
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Connect with opportunities that match your skills. Build your career with smart job matching, 
                instant applications, and real-time notifications.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto shadow-lg shadow-gray-900/25 hover:shadow-gray-900/30 transition-shadow">
                  <Link href="/auth/register">
                    Get Started Free
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                  <span>Easy setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                  <span>Instant matching</span>
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              {/* Main Visual */}
              <div className="relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job Seeker Card */}
                  <Card className="p-4 sm:p-6 bg-white border-2 border-gray-200 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-gray-900 hover:-rotate-1">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                      <Briefcase className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Job Seekers</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Find & apply to your dream job</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        <span>Smart matching</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Target className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Track applications</span>
                      </div>
                    </div>
                  </Card>

                  {/* Recruiter Card */}
                  <Card className="p-4 sm:p-6 bg-white border-2 border-gray-200 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-gray-900 hover:rotate-1 sm:mt-8">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                      <Users className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Employers</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Find top talent quickly</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Bell className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span>Instant alerts</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BarChart3 className="w-3 h-3 text-purple-500 flex-shrink-0" />
                        <span>Analytics dashboard</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Floating Stats - Hidden on mobile */}
                <div className="hidden sm:block absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 lg:p-6 border-2 border-gray-200 animate-float">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">95%</p>
                      <p className="text-xs text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -z-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 -z-10 w-40 sm:w-64 h-40 sm:h-64 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">50K+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Job Seekers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">5K+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <FeaturedJobs />

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-24 lg:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-gray-100 text-gray-900 text-xs sm:text-sm">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          {/* For Job Seekers */}
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">For Job Seekers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
              {/* Connecting line - desktop only */}
              <div className="hidden md:block absolute top-20 left-[16.666%] right-[16.666%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-20 rounded-full" style={{ top: '5rem' }} />
              
              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs sm:text-sm">Step 1</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">Create Profile</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Sign up and complete your profile with your skills, experience, and resume
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Quick & Easy</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 text-xs sm:text-sm">Step 2</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors">Find Jobs</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Browse thousands of jobs and use smart filters to find perfect matches
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-purple-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Smart Matching</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-xs sm:text-sm">Step 3</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors">Get Hired</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Apply with one click, track your applications, and land your dream job
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Track Progress</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* For Employers */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">For Employers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
              {/* Connecting line - desktop only */}
              <div className="hidden md:block absolute top-20 left-[16.666%] right-[16.666%] h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 opacity-20 rounded-full" style={{ top: '5rem' }} />
              
              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 text-xs sm:text-sm">Step 1</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">Post Jobs</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Create your company profile and post job listings in minutes
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Simple Setup</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-pink-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Bell className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 text-xs sm:text-sm">Step 2</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-pink-600 transition-colors">Get Applicants</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Receive instant notifications when candidates apply to your jobs
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-pink-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Real-Time Alerts</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative p-6 sm:p-8 bg-white border-2 border-gray-200 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                  </div>
                  <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 text-xs sm:text-sm">Step 3</Badge>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-indigo-600 transition-colors">Hire Talent</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Review profiles, download resumes, and hire the best candidates
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Best Matches</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-12 sm:py-16 md:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-gray-100 text-gray-900 text-xs sm:text-sm">Powerful Features</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Everything You Need</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              All the tools you need to succeed in your job search or hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-blue-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Profiles</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Build comprehensive profiles with resume upload, skills, education, and certifications. Stand out from the crowd.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-purple-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Advanced Search</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Filter jobs by salary, location, type, and more. Find exactly what you're looking for with powerful search tools.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-green-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">One-Click Apply</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Apply to jobs instantly with your saved profile. No repetitive forms. Track all applications in one place.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-orange-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Real-Time Notifications</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get instant alerts when candidates apply or when your application status changes. Never miss an opportunity.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-pink-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Analytics Dashboard</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Track your progress with detailed analytics. See application stats, success rates, and hiring metrics.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 group hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl cursor-pointer">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Secure & Private</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Enterprise-grade security keeps your data safe. Control who sees your information with privacy settings.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-gray-100 text-gray-900 text-xs sm:text-sm">Success Stories</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">What People Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Join thousands of satisfied job seekers and employers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 sm:p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center mb-3 sm:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic">
                "Found my dream job in just 2 weeks! The platform is so easy to use and I got matched with amazing companies."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  SA
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">Sarah Anderson</p>
                  <p className="text-xs sm:text-sm text-gray-600">Software Developer</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center mb-3 sm:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic">
                "Best hiring platform we've used! We filled 10 positions in a month with top-quality candidates."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  MJ
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">Michael Johnson</p>
                  <p className="text-xs sm:text-sm text-gray-600">HR Manager, TechCorp</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <div className="flex items-center mb-3 sm:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 italic">
                "The notifications and tracking features are amazing. I always know where my applications stand."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  EP
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">Emily Parker</p>
                  <p className="text-xs sm:text-sm text-gray-600">Marketing Specialist</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-28">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who have found their dream jobs through JobBoard. 
              Start your journey today - it's free!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-10 w-full sm:w-auto">
                <Link href="/auth/register">
                  Get Started Free
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 sm:px-10 w-full sm:w-auto">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6">
              No credit card required • Free forever • Get started in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Mobile: brand stacked, then 2-col links. Tablet+: 4-col grid */}
          <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-8 mb-8">
            {/* Brand block */}
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-600">JobBoard</h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
                The modern job platform connecting talented individuals with amazing opportunities.
                Built for the future of work.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-blue-600/80">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Est. 2026</span>
              </div>
            </div>

            {/* Links: on mobile show as 2 columns side by side */}
            <div className="grid grid-cols-2 gap-8 sm:gap-0 sm:contents">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">For Job Seekers</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Browse Jobs</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Create Profile</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Upload Resume</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Track Applications</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">For Employers</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Post Jobs</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Search Candidates</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Manage Applications</Link></li>
                  <li><Link href="/auth/register" className="hover:text-gray-900 transition block py-0.5">Company Profile</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 pt-6 sm:pt-8">
            <div className="flex flex-col gap-4 sm:gap-4 md:flex-row md:justify-between md:items-center">
              <p className="text-gray-600 text-sm text-center md:text-left order-2 md:order-1">
                &copy; 2026 JobBoard. All rights reserved by <span className="font-semibold">Ojiah Farida</span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-600 order-1 md:order-2">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0" />
                  Secure Platform
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Verified Companies
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
