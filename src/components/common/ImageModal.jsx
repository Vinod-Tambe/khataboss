import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { shouldIgnoreShortcut } from '../../config/keyboardShortcuts';
import './ImageModal.css';

const ZOOM_STEP = 0.25;
const WHEEL_ZOOM_STEP = 0.12;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

const clampScale = (value) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(value.toFixed(2))));

const clampPan = (panX, panY, scale, stageEl, imgEl) => {
  if (!stageEl || !imgEl || scale <= 1) {
    return { x: 0, y: 0 };
  }
  const stageW = stageEl.clientWidth;
  const stageH = stageEl.clientHeight;
  const baseW = imgEl.offsetWidth;
  const baseH = imgEl.offsetHeight;
  const scaledW = baseW * scale;
  const scaledH = baseH * scale;
  const maxX = Math.max(0, (scaledW - stageW) / 2 + 24);
  const maxY = Math.max(0, (scaledH - stageH) / 2 + 24);
  return {
    x: Math.min(maxX, Math.max(-maxX, panX)),
    y: Math.min(maxY, Math.max(-maxY, panY)),
  };
};

const ImageModal = ({
  show,
  onHide,
  imageUrl,
  title = 'Image Preview',
  zoomable = false,
}) => {
  const finalUrl = resolveImageUrl(imageUrl);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const zoomStageRef = useRef(null);
  const zoomImgRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originPanX: 0,
    originPanY: 0,
  });

  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (show) {
      resetView();
    }
  }, [show, imageUrl, resetView]);

  useEffect(() => {
    if (scale <= 1) {
      setPan({ x: 0, y: 0 });
      return;
    }
    setPan((current) =>
      clampPan(current.x, current.y, scale, zoomStageRef.current, zoomImgRef.current)
    );
  }, [scale]);

  const applyPan = useCallback((nextX, nextY) => {
    const stage = zoomStageRef.current;
    const img = zoomImgRef.current;
    setPan(clampPan(nextX, nextY, scale, stage, img));
  }, [scale]);

  const zoomIn = useCallback(() => {
    setScale((s) => clampScale(s + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => clampScale(s - ZOOM_STEP));
  }, []);

  useEffect(() => {
    if (!show || !zoomable) return undefined;

    const onKeyDown = (e) => {
      if (shouldIgnoreShortcut(e)) return;
      const { key } = e;
      if (key === '+' || key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (key === '-' || key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (key === '0') {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [show, zoomable, zoomIn, zoomOut, resetView]);

  useEffect(() => {
    if (!show || !zoomable) return undefined;
    const stage = zoomStageRef.current;
    if (!stage) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY < 0 ? 1 : -1;
      setScale((s) => clampScale(s + direction * WHEEL_ZOOM_STEP));
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [show, zoomable, finalUrl]);

  const onPointerDown = useCallback(
    (e) => {
      if (!zoomable || scale <= 1) return;
      e.preventDefault();
      dragStateRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originPanX: pan.x,
        originPanY: pan.y,
      };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [zoomable, scale, pan.x, pan.y]
  );

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragStateRef.current;
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      applyPan(drag.originPanX + dx, drag.originPanY + dy);
    },
    [applyPan]
  );

  const endDrag = useCallback((e) => {
    const drag = dragStateRef.current;
    if (!drag.active) return;
    if (e.pointerId != null && drag.pointerId != null && e.pointerId !== drag.pointerId) {
      return;
    }
    dragStateRef.current = { ...drag, active: false, pointerId: null };
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
  }, []);

  const zoomPercent = Math.round(scale * 100);
  const canPan = zoomable && scale > 1;

  return (
    <Modal show={show} onHide={onHide} centered size={zoomable ? 'lg' : 'md'}>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="text-primary fs-5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-3 p-md-4">
        {finalUrl ? (
          <>
            {zoomable ? (
              <div className="image-modal-zoom-toolbar">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={zoomOut}
                  disabled={scale <= ZOOM_MIN}
                  aria-label="Zoom out"
                >
                  <i className="bi bi-zoom-out" />
                </button>
                <span className="image-modal-zoom-label">{zoomPercent}%</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={zoomIn}
                  disabled={scale >= ZOOM_MAX}
                  aria-label="Zoom in"
                >
                  <i className="bi bi-zoom-in" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={resetView}
                  aria-label="Reset zoom"
                >
                  <i className="bi bi-arrows-angle-contract me-1" />
                  Fit
                </button>
                <span className="image-modal-zoom-hint text-muted small ms-1">
                  Scroll to zoom · Drag to move when zoomed
                </span>
              </div>
            ) : null}
            <div
              ref={zoomable ? zoomStageRef : null}
              className={`image-modal-zoom-stage${
                dragging ? ' image-modal-zoom-stage--dragging' : ''
              }${canPan ? ' image-modal-zoom-stage--pannable' : ''}`}
              onPointerDown={zoomable ? onPointerDown : undefined}
              onPointerMove={zoomable ? onPointerMove : undefined}
              onPointerUp={zoomable ? endDrag : undefined}
              onPointerCancel={zoomable ? endDrag : undefined}
            >
              <div className="image-modal-zoom-viewport">
                <img
                  ref={zoomable ? zoomImgRef : null}
                  src={finalUrl}
                  alt="Preview"
                  className={`rounded shadow-sm ${zoomable ? 'image-modal-zoom-img' : 'img-fluid'}`}
                  style={
                    zoomable
                      ? {
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                        }
                      : { maxHeight: '60vh', objectFit: 'contain' }
                  }
                  draggable={false}
                  onLoad={() => {
                    if (pan.x !== 0 || pan.y !== 0) {
                      applyPan(pan.x, pan.y);
                    }
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-muted p-5">No image available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
        {finalUrl ? (
          <a
            href={finalUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <i className="bi bi-download me-2" />
            Download Image
          </a>
        ) : null}
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
