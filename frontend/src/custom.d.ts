declare module '*.mp3' {
  const src: string;
  export default src;
} 

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

// Global variables defined in Vite config
declare const __BACKEND_URL__: string;

