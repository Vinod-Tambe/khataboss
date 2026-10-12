import React, { useLayoutEffect, useRef, useState } from 'react';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { PAGE_DIMENSIONS_MM } from '../../../utils/formTemplate/formTemplateConfig';

/** CSS reference pixels per millimetre (96dpi). */
const MM_PX = 96 / 25.4;

const ZOOM_STEPS = [70, 85, 100, 115, 130, 150];

const Form8BuilderFitPreview = ({ config, children }) => {
  const wrapRef = useRef(null);
  const [baseScale, setBaseScale] = useState(0.85);
  const [zoomPct, setZoomPct] = useState(100);

  const pageSize = config?.pageSize || 'A4';
  const orientation = config?.orientation || 'portrait';
  const dims = PAGE_DIMENSIONS_MM[pageSize] || PAGE_DIMENSIONS_MM.A4;
  const widthMm = orientation === 'landscape' ? dims.height : dims.width;
  const pageW = widthMm * MM_PX;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const pad = 16;
      const availW = Math.max(280, el.clientWidth - pad);
      const widthFit = availW / pageW;
      setBaseScale(Math.max(0.72, Math.min(1.15, widthFit)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [pageW]);

  const scale = baseScale * (zoomPct / 100);

  const stepZoom = (dir) => {
    setZoomPct((prev) => {
      let i = ZOOM_STEPS.indexOf(prev);
      if (i < 0) {
        i = ZOOM_STEPS.findIndex((z) => z > prev);
        if (i < 0) i = ZOOM_STEPS.length - 1;
        else i = Math.max(0, i - 1);
      }
      if (dir > 0) return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, i + 1)];
      return ZOOM_STEPS[Math.max(0, i - 1)];
    });
  };

  return (
    <div className="f8-builder-fit-root">
      <div className="f8-builder-zoom-bar">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => stepZoom(-1)}
          aria-label="Zoom out"
        >
          <FiZoomOut size={14} />
        </button>
        <span className="f8-builder-zoom-label">{Math.round(zoomPct)}%</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => stepZoom(1)}
          aria-label="Zoom in"
        >
          <FiZoomIn size={14} />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-link f8-builder-zoom-reset"
          onClick={() => setZoomPct(100)}
        >
          Reset
        </button>
      </div>
      <div ref={wrapRef} className="f8-builder-fit-viewport">
        {children(scale)}
      </div>
    </div>
  );
};

export default Form8BuilderFitPreview;
