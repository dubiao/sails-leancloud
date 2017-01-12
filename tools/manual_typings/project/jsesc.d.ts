declare module 'jsesc' {
  interface Opts {
    quotes?: string;
    wrap?: boolean;
    es6?: boolean;
    escapeEverything?: boolean;
    compact?: boolean;
    indent?: string;
    json?: boolean;
  }
  export function jsesc(value: string, options?: Opts): Promise<any>;
}
