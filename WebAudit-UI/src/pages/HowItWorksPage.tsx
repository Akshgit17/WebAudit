import React from 'react';
import { Sliders, Search, Eye, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: 1,
      title: 'Customize',
      icon: <Sliders className="text-brand-500" size={24} />,
      desc: 'Define your target audience to get customized audit results tailored to your user expectations.',
    },
    {
      num: 2,
      title: 'Audit',
      icon: <Search className="text-brand-500" size={24} />,
      desc: 'Give us a publicly facing URL. WebAudit crawls the pages, renders them, and walks the journeys between them to surface UX and accessibility issues.',
    },
    {
      num: 3,
      title: 'Review',
      icon: <Eye className="text-brand-500" size={24} />,
      desc: 'Learn where your site could use the most improvement, inspect visual contrast violations on screen, and enhance usability.',
    },
    {
      num: 4,
      title: 'Share',
      icon: <Share2 className="text-brand-500" size={24} />,
      desc: 'Export reports to Excel or PDF, invite your team, and resolve violations using actionable guidance.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Improve your UX in 4 easy steps
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Point WebAudit at your site and it walks the pages a real visitor would — then reports the issues they'd hit.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="card p-6 text-center card-hover flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
              <span className="text-brand-500 font-bold text-lg">{step.num}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <div className="my-4 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-brand-600">
              {step.icon}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="max-w-3xl mx-auto mt-16 text-center card p-10 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to audit your site?</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
          Start auditing with no account required for single pages, or register for domain monitoring.
        </p>
        <button onClick={() => navigate('/audit')} className="btn-accent px-8 py-3 text-base">
          Start an Audit Now
        </button>
      </div>
    </div>
  );
};
