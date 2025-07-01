import React from 'react';

export const performance = {
  measure: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      return result;
    } catch (error) {
      const end = performance.now();
      throw error;
    }
  },

  lazy: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    const LazyComponent = React.lazy(importFn);
    
    return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
      <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Chargement...</div>}>
        <LazyComponent {...props} ref={ref} />
      }
      </React.Suspense>
    ));
  },

  preload: {
    image: (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    },

    script: (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    style: (href: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = reject;
        document.head.appendChild(link);
      });
    }
  },

  optimizeImage: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    if (src.startsWith('http')) {
      return src;
    }

    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  },

  vitals: {
    measure: () => {
      if (typeof window === 'undefined') return;

      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((_entry) => {
            // Process entry
          });
        }).observe({ entryTypes: ['first-input'] });

        let _clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              _clsValue += entry.value;
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        // Silently handle errors
      }
    }
  }
};

export const usePerformance = (componentName: string) => {
  React.useEffect(() => {
    const start = performance.now();
    
    return () => {
      const _end = performance.now();
    };
  });
};

export const createRouteComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: React.ComponentType
) => {
  const Component = React.lazy(importFn);
  
  return (props: T) => (
    <React.Suspense 
      fallback={
        loadingComponent ? 
        React.createElement(loadingComponent) : 
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Component {...props} />
    </React.Suspense>
  );
};