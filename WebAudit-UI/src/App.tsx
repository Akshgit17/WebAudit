import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NavBar } from './components/layout/NavBar';
import { Footer } from './components/layout/Footer';
import { MobileAdvisoryModal } from './components/modals/MobileAdvisoryModal';
import { BetaWelcomeModal } from './components/modals/BetaWelcomeModal';
import { LandingPage } from './pages/LandingPage';
import { AuditListPage } from './pages/AuditListPage';
import { PageAuditReviewPage } from './pages/PageAuditReviewPage';
import { AuditDashboardPage } from './pages/AuditDashboardPage';
import { DomainsPage } from './pages/DomainsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '';
  const isReviewPage = location.pathname.includes('/review');

  const [isMobileAdvisoryOpen, setIsMobileAdvisoryOpen] = useState(false);
  const [isBetaWelcomeOpen, setIsBetaWelcomeOpen] = useState(false);

  useEffect(() => {
    // Check mobile user agent or small viewport
    const isMobile =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const acknowledgedMobile = sessionStorage.getItem('webaudit_mobile_ack') === 'true';

    if (isMobile && !acknowledgedMobile) {
      setIsMobileAdvisoryOpen(true);
    }

    // Check beta welcome modal
    const acknowledgedBeta = sessionStorage.getItem('webaudit_beta_ack') === 'true';
    if (!acknowledgedBeta && !isLandingPage) {
      setIsBetaWelcomeOpen(true);
    }
  }, [isLandingPage]);

  const handleCloseMobile = () => {
    sessionStorage.setItem('webaudit_mobile_ack', 'true');
    setIsMobileAdvisoryOpen(false);
  };

  const handleCloseBeta = () => {
    sessionStorage.setItem('webaudit_beta_ack', 'true');
    setIsBetaWelcomeOpen(false);
  };

  const showSidebar = !isLandingPage && !isReviewPage;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Sidebar for authed app pages */}
      {showSidebar && <NavBar />}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          showSidebar ? 'sm:ml-64' : ''
        }`}
      >
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/audit" element={<AuditListPage />} />
            <Route path="/dashboard" element={<Navigate to="/audit" replace />} />
            <Route path="/audit/:id/page" element={<PageAuditReviewPage />} />
            <Route path="/audit/:id/review" element={<PageAuditReviewPage />} />
            <Route path="/audit/:id/domain" element={<AuditDashboardPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/integration" element={<IntegrationsPage />} />
            <Route path="/account" element={<AccountPage />} />

            {/* Spec-04 Forward-Compatible Aliases */}
            <Route path="/home" element={<Navigate to="/audit" replace />} />
            <Route path="/sites" element={<Navigate to="/domains" replace />} />
            <Route path="/audits" element={<Navigate to="/audit" replace />} />
            <Route path="/audits/:id" element={<Navigate to="/audit/:id/review" replace />} />
            <Route path="/settings" element={<Navigate to="/account" replace />} />
            <Route path="/integrations" element={<Navigate to="/integration" replace />} />
            <Route path="/help" element={<Navigate to="/how-it-works" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {/* Global Footer (only on app pages, Landing has its own integrated footer) */}
        {!isLandingPage && <Footer />}
      </div>

      {/* Advisory Modals */}
      <MobileAdvisoryModal isOpen={isMobileAdvisoryOpen} onClose={handleCloseMobile} />
      <BetaWelcomeModal isOpen={isBetaWelcomeOpen} onClose={handleCloseBeta} />
    </div>
  );
};
