/// <reference types="vite/client" />

declare module 'pdfjs-dist/build/pdf.worker.min.js?url' {
  const src: string;
  export default src;
}

declare module '*?url' {
  const src: string;
  export default src;
}

