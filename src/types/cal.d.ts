interface CalConfig {
  ui?: {
    theme?: 'dark' | 'light';
  };
}

interface CalModalOptions {
  calLink: string;
  config?: {
    notes?: string;
    name?: string;
  };
}

interface CalFunction {
  (action: 'init', config?: CalConfig): void;
  (action: 'modal', options: CalModalOptions): void;
}

interface Window {
  Cal: CalFunction;
}
