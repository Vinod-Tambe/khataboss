import React, { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { validateUploadFile } from '../../utils/fileUpload';

function canvasHasInk(canvas) {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
    }
    return false;
}

const SignaturePad = ({ width = 480, height = 105, initialSrc = null, onSave, className = '' }) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const loadedSrcRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const getPoint = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        };

        const startDrawing = (e) => {
            isDrawingRef.current = true;
            const { x, y } = getPoint(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const stopDrawing = () => {
            isDrawingRef.current = false;
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!isDrawingRef.current) return;
            e.preventDefault();
            const { x, y } = getPoint(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !initialSrc) return;
        if (loadedSrcRef.current === initialSrc) return;

        const img = new Image();
        if (!initialSrc.startsWith('blob:')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            loadedSrcRef.current = initialSrc;
        };
        img.onerror = () => {};
        img.src = initialSrc;
    }, [initialSrc, width, height]);

    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        loadedSrcRef.current = null;
    }, []);

    const handleSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!canvasHasInk(canvas)) {
            toast.error('Please draw a signature before saving');
            return;
        }

        const dataUrl = canvas.toDataURL('image/png');
        fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], 'signature.png', { type: 'image/png' });
                if (!validateUploadFile(file)) return;
                onSave?.(file);
                clear();
            });
    }, [clear, onSave]);

    return (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }} className={className}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    border: '2px dashed #ccc',
                    background: '#fff',
                    touchAction: 'none',
                    borderRadius: '8px',
                    maxWidth: '100%',
                    display: 'block',
                }}
            />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-sm btn-danger mb-1" onClick={clear} aria-label="Clear signature">
                    <i className="bi bi-eraser"></i>
                </button>
                <button type="button" className="btn btn-sm btn-success mb-1" onClick={handleSave} aria-label="Save signature">
                    <i className="bi bi-save"></i>
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;
