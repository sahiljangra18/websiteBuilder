import React from 'react';

export function UnsupportedSection({ id, type }: { id: string; type?: string }) {
  return (
    <section 
      id={id} 
      className="bg-slate-900 border-2 border-dashed border-red-500/30 rounded-lg p-8 my-6 text-center text-slate-300"
      aria-label="Unsupported content section"
    >
      <div className="max-w-md mx-auto">
        <div className="text-3xl mb-3 text-red-400" aria-hidden="true">⚠️</div>
        <h3 className="text-lg font-semibold text-red-200">Unsupported Section Type</h3>
        <p className="text-sm text-slate-400 mt-2">
          The section type <code className="px-1.5 py-0.5 rounded bg-slate-950 text-red-300 font-mono text-xs">{type || 'unknown'}</code> is not registered or supported by this rendering pipeline.
        </p>
      </div>
    </section>
  );
}
