import React, { useLayoutEffect, useRef, useState } from 'react';
import { PAGE_DIMENSIONS_MM } from '../../../utils/formTemplate/formTemplateConfig';

/** CSS reference pixels per millimetre (96dpi). */
const MM_PX = 96 / 25.4;

const Form8BuilderFitPreview = ({ config, children }) => {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

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
      setScale(Math.max(0.72, Math.min(1, widthFit)));
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

  return (
    <div className="f8-builder-fit-root">
      <div ref={wrapRef} className="f8-builder-fit-viewport">
        {children(scale)}
      </div>
    </div>
  );
};

export default Form8BuilderFitPreview;
