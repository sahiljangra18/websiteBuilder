import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getSectionComponent, validateSectionProps } from '../../registry/sectionRegistry';
import { UnsupportedSection } from './UnsupportedSection';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Section component crashed:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface SectionWrapperProps {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export function SectionWrapper({ id, type, props }: SectionWrapperProps) {
  // 1. Check if section type is unsupported
  const ComponentToRender = getSectionComponent(type);
  if (ComponentToRender === UnsupportedSection) {
    return <UnsupportedSection id={id} type={type} />;
  }

  // 2. Validate section props
  const validation = validateSectionProps(type, props);
  if (!validation.success) {
    return (
      <section 
        id={id} 
        className="bg-slate-900 border-2 border-dashed border-yellow-500/30 rounded-lg p-6 my-4 text-left text-slate-300"
        aria-label="Section configuration error"
      >
        <div className="max-w-xl mx-auto flex items-start space-x-3">
          <div className="text-2xl text-yellow-500" aria-hidden="true">⚠️</div>
          <div>
            <h3 className="text-md font-semibold text-yellow-300">Invalid Section Configuration ({type})</h3>
            <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1">
              {validation.errors?.map((err, i) => (
                <li key={i} className="font-mono">{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // 3. Render component in error boundary
  const crashFallback = (
    <section 
      className="bg-slate-900 border border-red-500/20 p-6 my-4 text-center rounded-lg text-slate-300"
      aria-label="Section rendering error"
    >
      <p className="text-red-400 font-semibold">An error occurred while rendering this section.</p>
    </section>
  );

  return (
    <SectionErrorBoundary fallback={crashFallback}>
      <ComponentToRender id={id} props={validation.data} />
    </SectionErrorBoundary>
  );
}
