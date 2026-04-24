import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'error'>('idle');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setInstallStatus('installed');
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallStatus('installing');
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallStatus('installed');
        setShowInstallPrompt(false);
        toast.success('Thank you for installing Smart Crime!');
      } else {
        setInstallStatus('idle');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during app installation:', error);
      setInstallStatus('error');
      toast.error('Installation failed. Please try again.');
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleManualInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      // Chrome/Android
      toast('Tap the menu (⋮) and "Add to Home Screen"');
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      // Safari/iOS
      toast('Tap Share and "Add to Home Screen"');
    } else {
      // Other browsers
      toast('Look for "Install App" or "Add to Home Screen" in your browser menu');
    }
  };

  // Check if we should show the prompt (not dismissed recently and not installed)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < weekInMs) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-md mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-3">
              <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install Smart Crime App</h3>
              <p className="text-sm text-gray-600">Get instant access to crime alerts and reporting</p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Real-time crime alerts</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Offline crime reporting</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Emergency SOS button</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Community features</span>
          </div>
        </div>

        <div className="flex space-x-3">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              disabled={installStatus === 'installing'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {installStatus === 'installing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Installing...
                </>
              ) : installStatus === 'installed' ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Installed!
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Install App
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleManualInstall}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Install Manually
            </button>
          )}
          
          <button
            onClick={dismissInstallPrompt}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Maybe Later
          </button>
        </div>

        {installStatus === 'error' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Installation failed. Try installing from your browser menu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
