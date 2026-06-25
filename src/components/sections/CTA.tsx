import React from 'react';

interface CTAProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
}

export function CTASection({ id, props }: { id: string; props: CTAProps }) {
  const { title, description, buttonText, buttonUrl } = props;

  return (
    <section 
      id={id} 
      className="bg-gradient-to-r from-blue-900 to-indigo-900 py-16 px-6 text-white text-center sm:px-12"
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-4xl">
        <h2 id={`${id}-title`} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="mt-8 flex justify-center">
          <a
            href={buttonUrl}
            className="rounded-full bg-white px-8 py-4 text-base font-semibold text-indigo-900 shadow-md hover:bg-slate-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-2 transition-all"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
