import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ChartBarIcon, BellIcon, DocumentTextIcon, UserIcon, LockClosedIcon, GlobeAltIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useScrollAnimation, useCounter, useParallax } from '../hooks/useScrollAnimation';
import Chatbot from '../components/Chatbot';
import QuickAccess from '../components/QuickAccess';

const Landing: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useScrollAnimation();
  const scrollY = useParallax();
  
  const statsCount1 = useCounter(500);
  const statsCount2 = useCounter(98);
  const statsCount3 = useCounter(24);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg border-b border-gray-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <ShieldCheckIcon className={`h-8 w-8 transition-colors duration-300 ${isScrolled ? 'text-blue-600' : 'text-white'}`} />
                <span className={`ml-2 text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>Smart Crime</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('features')} className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-blue-200'}`}>Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-blue-200'}`}>How It Works</button>
              <button onClick={() => scrollToSection('security')} className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-blue-200'}`}>Security</button>
              <button onClick={() => scrollToSection('pricing')} className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-blue-200'}`}>Pricing</button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-blue-200'}`}>Log in</Link>
              <Link to="/login" className={`btn-primary ${isScrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-900'} hover:opacity-90 transition-all duration-300`}>Get Started</Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white'}`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">Features</button>
                <button onClick={() => { scrollToSection('how-it-works'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">How It Works</button>
                <button onClick={() => { scrollToSection('security'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">Security</button>
                <button onClick={() => { scrollToSection('pricing'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">Pricing</button>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">Log in</Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-gray-50">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
          }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-80"></div>
          <div className="absolute inset-0 bg-black opacity-30"></div>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Fight crime with data, not spreadsheets.
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                All-in-one platform to monitor crime patterns, predict hotspots, and coordinate responses across Uganda. 
                Built for communities, police, and administrators to work together with clarity and confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/login" className="btn-primary bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl">
                  Request a demo
                </Link>
                <a href="#how-it-works" className="btn-outline border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements animation */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white opacity-10 rounded-full animate-float"></div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              Fighting crime shouldn't be this hard.
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Most communities still rely on paper reports, scattered spreadsheets, and WhatsApp groups to manage crime data. This leads to:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4 animate-on-scroll animate-slide-in-left">
              {[
                "Conflicting crime statistics between different departments",
                "Missing incident reports when auditors or citizens ask for them",
                "No clear record of who responded to what and when"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 animate-on-scroll animate-slide-in-right">
              {[
                "Delayed response times and missed prevention opportunities",
                "Stress and disputes among community members and police",
                "When data is unclear, trust breaks down"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              One system for how your community actually operates.
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Smart Crime is the operating system for modern communities. It brings your crime data, predictions, alerts, and responses into one secure platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4 animate-on-scroll animate-slide-in-left">
              {[
                "One source of truth for crime incidents and statistics",
                "Built-in role-based access and audit logs",
                "Secure storage for all crime reports and evidence"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 animate-on-scroll animate-slide-in-right">
              {[
                "Designed for communities, not just data scientists",
                "Real-time alerts and predictive analytics",
                "Mobile-first design for field reporting"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 transform hover:scale-105 transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background pattern and image */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              Everything your community needs to stay safe.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: DocumentTextIcon,
                title: "Incident Reporting",
                description: "Report crimes in real-time with mobile-friendly forms. Every incident is recorded, searchable, and auditable.",
                link: "/login"
              },
              {
                icon: UserIcon,
                title: "Role-Based Access",
                description: "Give citizens, police, and administrators the right level of access. Approvals ensure data integrity.",
                link: "/login"
              },
              {
                icon: LockClosedIcon,
                title: "Secure Evidence Storage",
                description: "Store photos, documents, and reports securely. Find any evidence when you need it for investigations.",
                link: "/login"
              },
              {
                icon: BellIcon,
                title: "Real-time Alerts",
                description: "Send instant alerts to community members and police. Coordinate responses when incidents occur.",
                link: "/login"
              },
              {
                icon: ChartBarIcon,
                title: "Predictive Analytics",
                description: "AI-powered predictions identify crime hotspots. Prevent incidents before they happen.",
                link: "/login"
              },
              {
                icon: GlobeAltIcon,
                title: "Multi-Location Support",
                description: "Built for multiple communities with strong security, permissions, and data separation.",
                link: "/login"
              }
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="block card card-hover animate-on-scroll cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 transform hover:rotate-6 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn more <span className="ml-1">»</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Get started in three simple steps.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set up your community</h3>
              <p className="text-gray-600">
                Add users, assign roles, and configure your area of coverage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report incidents and analyze</h3>
              <p className="text-gray-600">
                Log crimes, upload evidence, and review predictive insights.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Protect with confidence</h3>
              <p className="text-gray-600">
                View patterns, coordinate responses, and prevent future crimes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Built for communities that work together.
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            If your community handles safety and security together, Smart Crime is built for you.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communities</h3>
              <p className="text-gray-600">Neighborhood watches and resident associations</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Police Forces</h3>
              <p className="text-gray-600">Law enforcement agencies and security teams</p>
            </div>
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrators</h3>
              <p className="text-gray-600">Government agencies and security coordinators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Designed for trust and accountability.
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Smart Crime is built with security and governance at its core. Your data is protected, and every action is traceable.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <LockClosedIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600">Your data is encrypted in transit and at rest</p>
            </div>
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Trails</h3>
              <p className="text-gray-600">Every action is logged and traceable</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Security</h3>
              <p className="text-gray-600">Users only see what they're authorized to see</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Simple pricing that grows with your community.
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Choose a plan based on your size and needs.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                description: "For small communities",
                price: "Talk to us",
                features: ["Up to 100 users", "Basic reporting", "Mobile app access"],
                popular: false
              },
              {
                name: "Growth",
                description: "For growing communities",
                price: "Talk to us",
                features: ["Up to 500 users", "Advanced analytics", "API access"],
                popular: true
              },
              {
                name: "Enterprise",
                description: "For large organizations",
                price: "Talk to us",
                features: ["Unlimited users", "Custom features", "Dedicated support"],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`card card-hover animate-on-scroll cursor-pointer relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <p className="text-2xl font-bold text-gray-900 mb-6">{plan.price}</p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`w-full text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background pattern and image */}
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
        }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Making communities safer, one report at a time.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-on-scroll">
              <div className="text-5xl md:text-6xl font-bold mb-4 animate-counter">
                {statsCount1}+
              </div>
              <p className="text-xl text-blue-100">Communities Protected</p>
            </div>
            <div className="animate-on-scroll">
              <div className="text-5xl md:text-6xl font-bold mb-4 animate-counter">
                {statsCount2}%
              </div>
              <p className="text-xl text-blue-100">Response Time Improvement</p>
            </div>
            <div className="animate-on-scroll">
              <div className="text-5xl md:text-6xl font-bold mb-4 animate-counter">
                {statsCount3}/7
              </div>
              <p className="text-xl text-blue-100">Days a Week Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              Built with community leaders in mind.
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Smart Crime was designed in collaboration with community leaders who were tired of scattered data and delayed responses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card card-hover animate-on-scroll">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Community Police Chief</p>
                  <p className="text-sm text-gray-600">Kampala District</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "We finally have one place where everyone sees the same crime statistics and can respond quickly."
              </p>
            </div>
            <div className="card card-hover animate-on-scroll">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Neighborhood Watch Coordinator</p>
                  <p className="text-sm text-gray-600">Entebbe Municipality</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Predictive alerts help us prevent incidents instead of just reacting to them. It's been a game changer."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background pattern and image */}
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
        }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Ready to transform your community safety?
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Get in touch with our team to learn more about how Smart Crime can help your community.
            </p>
          </div>
          
          <div className="card animate-on-scroll">
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for your interest! We will contact you soon.'); }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="organization" className="label">Organization</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  className="input"
                  placeholder="Enter your organization name"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="input resize-none"
                  placeholder="Tell us about your community and how we can help"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Request Demo
                </button>
                <button type="button" onClick={() => window.location.href = 'tel:+256705499999'} className="btn-outline flex-1">
                  Call Us
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Bring clarity to your community safety.
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Stop juggling spreadsheets, paper files, and scattered tools. Protect your community with transparency, accountability, and confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-secondary bg-white text-blue-600 hover:bg-gray-100">
              Request a demo
            </Link>
            <Link to="/login" className="btn-outline border-white text-white hover:bg-white hover:text-blue-600">
              Join the beta
            </Link>
          </div>
          <p className="text-blue-100 mt-8 text-sm">
            No commitment. Guided onboarding included.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">Security</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="mailto:support@smartcrime.ug" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); alert('About Smart Crime: We are a Ugandan company dedicated to making communities safer through technology.'); }} className="hover:text-white transition-colors">About</a></li>
                <li><a href="mailto:info@smartcrime.ug" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="tel:+256705499999" className="hover:text-white transition-colors">+256 705 499 999</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: This is a demo application. Full terms will be provided in production.'); }} className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: We take your privacy seriously. Full policy will be provided in production.'); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <Link to="/" className="flex items-center mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-white">Smart Crime</span>
              </Link>
              <p className="text-sm mb-4">
                Modern, secure, and efficient crime management platform.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2026 Smart Crime. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-2">
              Kampala, Uganda | Email: info@smartcrime.ug | Phone: +256 705 499 999
            </p>
          </div>
        </div>
      </footer>
      
      {/* Chatbot and Quick Access */}
      <Chatbot />
      <QuickAccess isVisible={isScrolled} />
    </div>
  );
};

export default Landing;
