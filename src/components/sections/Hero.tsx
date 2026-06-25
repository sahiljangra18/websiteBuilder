import React from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function HeroSection({ id, props }: { id: string; props: HeroProps }) {
  const { title, subtitle, ctaText, ctaUrl } = props;

  return (
    <section 
      id={id} 
      className="relative overflow-hidden bg-slate-900 py-24 px-6 text-white text-center sm:px-12 md:py-32"
      aria-labelledby={`${id}-title`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_60%)]" />
      <div className="relative mx-auto max-w-3xl">
        <h1 
          id={`${id}-title`} 
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-slate-300 sm:text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <div className="mt-10 flex justify-center">
            <a
              href={ctaUrl}
              className="rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-400 focus-visible:outline-offset-2 transition-all"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
