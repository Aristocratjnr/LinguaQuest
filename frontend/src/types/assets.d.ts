// Asset type declarations for LinguaQuest
// This file ensures TypeScript recognizes imported assets

// Audio files
declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.m4a" {
  const src: string;
  export default src;
}

// Image files  
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.ico" {
  const src: string;
  export default src;
}

// Video files
declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webm" {
  const src: string;
  export default src;
}

// Font files
declare module "*.woff" {
  const src: string;
  export default src;
}

declare module "*.woff2" {
  const src: string;
  export default src;
}

declare module "*.ttf" {
  const src: string;
  export default src;
}

declare module "*.otf" {
  const src: string;
  export default src;
}

// Text files
declare module "*.txt" {
  const src: string;
  export default src;
}

declare module "*.md" {
  const src: string;
  export default src;
}

// JSON files (when imported as modules)
declare module "*.json" {
  const value: any;
  export default value;
}
