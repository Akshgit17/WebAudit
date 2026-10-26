import React from 'react';

export const IntegrationsPage: React.FC = () => {
  const pmIntegrations = [
    {
      name: 'Jira',
      desc: 'Sync UX issues directly to your Jira board.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/jira-logo.png',
    },
    {
      name: 'Google Drive',
      desc: 'Export audit reports to your Drive.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/google-drive.png',
    },
    {
      name: 'Trello',
      desc: 'Create Trello cards from UX issues.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/trello.png',
    },
  ];

  const cicdIntegrations = [
    {
      name: 'Jenkins',
      desc: 'Run UX audits in your CI pipeline.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/jenkins.png',
    },
    {
      name: 'GitHub',
      desc: 'Post audit summaries to pull requests.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/github.png',
    },
    {
      name: 'GitLab',
      desc: 'Audit each deployment in your GitLab CI/CD.',
      icon: 'https://storage.googleapis.com/WebAudit-inc-assets/integrations/gitlab.png',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Connect WebAudit with your favorite tools.</p>
      </div>

      {/* Product Management */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Product Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pmIntegrations.map((item) => (
            <div key={item.name} className="card p-6 card-hover opacity-75">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={item.icon}
                  alt={`${item.name} logo`}
                  className="w-10 h-10 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                  <span className="badge bg-gray-100 text-gray-500 text-2xs mt-0.5">Coming soon</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CI/CD */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          CI / CD
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cicdIntegrations.map((item) => (
            <div key={item.name} className="card p-6 card-hover opacity-75">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={item.icon}
                  alt={`${item.name} logo`}
                  className="w-10 h-10 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                  <span className="badge bg-gray-100 text-gray-500 text-2xs mt-0.5">Coming soon</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
