import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { getValidatedUploadFile, validateUploadFile } from "../../utils/fileUpload";
import "../../css/ProfileDocumentsSection.css";
import "../../css/ImageUploadSquare.css";

const SIZE_CLASS = {
  default: "",
  compact: "image-upload-square--compact",
  mini: "image-upload-square--mini",
};

const ImageUploadSquare = ({
  preview,
  onFile,
  onRemove,
  modalTitle = "Image",
  cameraTitle,
  label,
  size = "default",
  emptyText = "Upload",
  showRemove = true,
  disabled = false,
  className = "",
  title,
}) => {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const optionsTitleId = useId();
  const cameraTitleId = useId();

  const [showOptions, setShowOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const emitFile = useCallback(
    (file) => {
      if (!file || !validateUploadFile(file)) return;
      onFile?.(file);
    },
    [onFile]
  );

  const closeOptions = useCallback(() => setShowOptions(false), []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setShowCameraModal(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const openCamera = useCallback(() => {
    closeOptions();
    setShowCameraModal(true);
    setCameraReady(false);
  }, [closeOptions]);

  useEffect(() => {
    if (!showCameraModal) return undefined;

    let mounted = true;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch (err) {
        toast.error(`Cannot access camera: ${err.message}`);
        if (mounted) stopCamera();
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCameraModal, stopCamera]);

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
        emitFile(file);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleUploadClick = () => {
    closeOptions();
    inputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const file = getValidatedUploadFile(e);
    if (!file) return;
    emitFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const resolvedCameraTitle = cameraTitle || `Capture ${modalTitle}`;
  const sizeClass = SIZE_CLASS[size] || "";

  return (
    <div className={`image-upload-square ${sizeClass} ${className}`.trim()}>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="d-none"
        onChange={handleFileInput}
        disabled={disabled}
      />

      <div className="image-upload-square__wrap">
        <button
          type="button"
          className="profile-documents-section__square image-upload-square__trigger"
          onClick={() => !disabled && setShowOptions(true)}
          title={title || modalTitle}
          disabled={disabled}
        >
          {preview ? (
            <img src={preview} alt={modalTitle} className="profile-documents-section__square-img" />
          ) : (
            <span className="profile-documents-section__square-upload">
              <i className={size === "mini" ? "bi bi-camera" : "bi bi-cloud-upload"} />
              {size !== "mini" && <span>{emptyText}</span>}
            </span>
          )}
        </button>

        {showRemove && preview && onRemove && (
          <button
            type="button"
            className="profile-documents-section__remove image-upload-square__remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${modalTitle}`}
          >
            <i className="bi bi-x" />
          </button>
        )}
      </div>

      {label && <span className="profile-documents-section__label">{label}</span>}

      {showOptions && (
        <div
          className="profile-documents-section__overlay"
          onClick={closeOptions}
          role="presentation"
        >
          <div
            className="profile-documents-section__options-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={optionsTitleId}
          >
            <div className="profile-documents-section__options-header">
              <h6 id={optionsTitleId} className="mb-0 fw-semibold">
                {modalTitle}
              </h6>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeOptions} />
            </div>
            <div className="profile-documents-section__options-body">
              <button
                type="button"
                className="profile-documents-section__option-btn"
                onClick={handleUploadClick}
              >
                <i className="bi bi-cloud-upload" />
                Upload
              </button>
              <button
                type="button"
                className="profile-documents-section__option-btn"
                onClick={openCamera}
              >
                <i className="bi bi-camera" />
                Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {showCameraModal && (
        <div
          className="profile-documents-section__overlay"
          onClick={stopCamera}
          role="presentation"
        >
          <div
            className="profile-documents-section__camera-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={cameraTitleId}
          >
            <div className="profile-documents-section__options-header">
              <h6 id={cameraTitleId} className="mb-0 fw-semibold">
                {resolvedCameraTitle}
              </h6>
              <button type="button" className="btn-close" aria-label="Close" onClick={stopCamera} />
            </div>
            <div className="profile-documents-section__camera-body text-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width="320"
                height="240"
                className="profile-documents-section__camera-video"
              />
              <canvas ref={canvasRef} width="320" height="240" className="d-none" />
              {!cameraReady && <p className="text-muted small mt-2 mb-0">Starting camera…</p>}
            </div>
            <div className="profile-documents-section__camera-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={stopCamera}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={capturePhoto}
                disabled={!cameraReady}
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSquare;
