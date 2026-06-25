import React from 'react';

interface FeatureItem {
  title: string;
  description?: string;
  icon?: string;
}

interface FeatureGridProps {
  title: string;
  features?: FeatureItem[];
}

export function FeatureGridSection({ id, props }: { id: string; props: FeatureGridProps }) {
  const { title, features = [] } = props;

  return (
    <section 
      id={id} 
      className="bg-slate-900 py-20 px-6 text-white sm:px-12"
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-6xl">
        <h2 
          id={`${id}-title`} 
          className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400"
        >
          {title}
        </h2>
        {features.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:scale-[1.01]"
              >
                <div className="text-3xl mb-4" aria-hidden="true">
                  {feature.icon || '✨'}
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                {feature.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500">No features added yet.</p>
        )}
      </div>
    </section>
  );
}
