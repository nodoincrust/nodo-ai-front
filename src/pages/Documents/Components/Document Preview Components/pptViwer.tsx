import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface Slide {
  text: string;
  imageData: string | null;
}

interface PptViewerProps {
  fileUrl: string;
}

const PptViewer: React.FC<PptViewerProps> = ({ fileUrl }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fileUrl) {
      loadPresentation(fileUrl);
    }
  }, [fileUrl]);

  const loadPresentation = async (url: string) => {
    setLoading(true);
    setError('');
    setCurrentSlide(0);

    try {
      // Fetch the file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      
      // Dynamically load pptxjs library
      if (!(window as any).pptxgen) {
        // Load pptx parser
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pptxjs@0.3.3/dist/pptx.js';
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load pptx library'));
          document.head.appendChild(script);
        });
      }

      // Parse PPTX using native approach
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Load JSZip for extracting PPTX
      if (!(window as any).JSZip) {
        const zipScript = document.createElement('script');
        zipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

        await new Promise<void>((resolve, reject) => {
          zipScript.onload = () => resolve();
          zipScript.onerror = () => reject(new Error('Failed to load JSZip'));
          document.head.appendChild(zipScript);
        });
      }

      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      await zip.loadAsync(uint8Array);

      // Get slide files
      const slideFiles: string[] = [];
      zip.folder('ppt/slides')?.forEach((relativePath: string) => {
        if (relativePath.endsWith('.xml') && !relativePath.includes('_rels')) {
          slideFiles.push(relativePath);
        }
      });

      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

      // Parse each slide
      const parsedSlides: Slide[] = [];

      for (const slideFile of slideFiles) {
        const slideContent = await zip.file(`ppt/slides/${slideFile}`)?.async('text');
        
        if (!slideContent) continue;

        // Extract text
        const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        const text = textMatches
          .map((m:any) => m.replace(/<a:t>|<\/a:t>/g, ''))
          .filter((t:any) => t.trim())
          .join('\n')
          .trim();

        // Extract first image if available
        let imageData: string | null = null;
        try {
          const slideNum = slideFile.match(/\d+/)?.[0];
          const relsPath = `ppt/slides/_rels/${slideFile}.rels`;
          const rels = await zip.file(relsPath)?.async('text');

          if (rels) {
            const imageMatch = rels.match(/Target="\.\.\/media\/([^"]+)"/);
            if (imageMatch) {
              const imagePath = `ppt/media/${imageMatch[1]}`;
              const imageFile = await zip.file(imagePath)?.async('blob');
              if (imageFile) {
                imageData = URL.createObjectURL(imageFile);
              }
            }
          }
        } catch (e) {
          // Continue without image
        }

        parsedSlides.push({ text, imageData });
      }

      if (parsedSlides.length === 0) {
        throw new Error('No slides found in presentation');
      }

      setSlides(parsedSlides);
    } catch (err: any) {
      console.error('Error loading presentation:', err);
      setError(`Error: ${err.message || 'Failed to load presentation'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
        <p>Loading presentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
        <p>{error}</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
        <p>No slides found</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e293b', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={24} style={{ color: '#60a5fa' }} />
        <span style={{ fontSize: '18px', fontWeight: '600' }}>
          Slide {currentSlide + 1} of {slides.length}
        </span>
      </div>

      {/* Slide Display */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'auto',
          backgroundColor: '#0f172a',
        }}
      >
        {currentSlideData.imageData ? (
          <img
            src={currentSlideData.imageData}
            alt={`Slide ${currentSlide + 1}`}
            style={{ maxWidth: '100%', maxHeight: '70%', borderRadius: '8px', objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              minHeight: '300px',
              backgroundColor: '#334155',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
            }}
          >
            <p
              style={{
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
                color: '#cbd5e1',
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              {currentSlideData.text || 'Blank slide'}
            </p>
          </div>
        )}
        {currentSlideData.text && currentSlideData.imageData && (
          <p
            style={{
              marginTop: '16px',
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              color: '#cbd5e1',
              fontSize: '13px',
              maxHeight: '100px',
              overflow: 'auto',
              maxWidth: '100%',
            }}
          >
            {currentSlideData.text}
          </p>
        )}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          backgroundColor: '#0f172a',
        }}
      >
        <button
          onClick={() => setCurrentSlide(Math.max(currentSlide - 1, 0))}
          disabled={currentSlide === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: currentSlide === 0 ? '#475569' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px' }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              title={`Go to slide ${idx + 1}`}
              style={{
                padding: '6px 10px',
                backgroundColor: currentSlide === idx ? '#2563eb' : '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'background-color 0.2s',
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(Math.min(currentSlide + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: currentSlide === slides.length - 1 ? '#475569' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PptViewer;