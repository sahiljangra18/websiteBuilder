import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
}

export function TestimonialSection({ id, props }: { id: string; props: TestimonialProps }) {
  const { quote, author, role } = props;

  return (
    <section 
      id={id} 
      className="bg-slate-950 py-20 px-6 text-white text-center sm:px-12"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`} className="sr-only">Testimonial</h2>
      <div className="mx-auto max-w-3xl">
        <svg
          className="mx-auto h-12 w-12 text-blue-500 opacity-30 mb-8"
          fill="currentColor"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M9.333 16h6.667v8H9.333v-8zm12 0h6.667v8h-6.667v-8zm-12-8h6.667c0-4-3.333-6.667-6.667-6.667v6.667zm12 0h6.667c0-4-3.333-6.667-6.667-6.667v6.667z" />
        </svg>
        <blockquote className="text-xl font-medium sm:text-2xl leading-relaxed text-slate-100">
          <p>“{quote}”</p>
        </blockquote>
        <div className="mt-6 flex items-center justify-center space-x-3 text-base">
          <cite className="font-semibold text-slate-200 not-italic">{author}</cite>
          {role && (
            <>
              <span className="text-slate-600" aria-hidden="true">/</span>
              <span className="text-slate-400">{role}</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
