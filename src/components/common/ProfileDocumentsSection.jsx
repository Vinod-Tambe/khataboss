import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { getValidatedUploadFile, validateUploadFile } from "../../utils/fileUpload";
import { resolveImageUrl, MAX_DOCUMENT_IMAGES } from "../../utils/imageHelpers";
import "../../css/ProfileDocumentsSection.css";

const OPTIONS_TITLES = {
  profile: "Profile Photo",
  add: "Add Image",
  replace: "Change Image",
};

const CAMERA_TITLES = {
  profile: "Capture Profile Photo",
  add: "Capture Image",
  replace: "Capture Image",
};

const buildNewDocument = (file, idSuffix = "") => ({
  id: `new-${Date.now()}${idSuffix}`,
  file,
  preview: URL.createObjectURL(file),
  label: "",
  note: "",
  isExisting: false,
});

const ProfileDocumentsSection = ({
  showProfile = true,
  profilePreview,
  onProfileFile,
  onProfileSelect,
  onProfileRemove,
  documents = [],
  onAddDocument,
  onReplaceDocument,
  onRemoveDocument,
  onUpdateDocument,
  maxDocuments = MAX_DOCUMENT_IMAGES,
  onPreview,
  documentsTitle = "Documents / Other Images",
  showDocumentLabels = true,
}) => {
  const profileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const docUploadTargetRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [optionsMode, setOptionsMode] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const totalCount = documents.length;
  const showOptions = Boolean(optionsMode);

  const closeOptions = useCallback(() => setOptionsMode(null), []);

  const emitProfileFile = useCallback(
    (file) => {
      if (!file || !validateUploadFile(file)) return;
      if (onProfileFile) {
        onProfileFile(file);
      } else if (onProfileSelect) {
        onProfileSelect({ target: { files: [file] } });
      }
    },
    [onProfileFile, onProfileSelect]
  );

  const addDocumentFile = useCallback(
    (file) => {
      if (totalCount >= maxDocuments) {
        toast.error(`Maximum ${maxDocuments} document images allowed`);
        return;
      }
      onAddDocument?.(buildNewDocument(file));
    },
    [maxDocuments, onAddDocument, totalCount]
  );

  const replaceDocumentFile = useCallback(
    (index, file) => {
      if (onReplaceDocument) {
        onReplaceDocument(index, file);
        return;
      }
      onUpdateDocument?.(index, {
        file,
        preview: URL.createObjectURL(file),
        isExisting: false,
        path: null,
      });
    },
    [onReplaceDocument, onUpdateDocument]
  );

  const applyDocumentFile = useCallback(
    (file) => {
      if (!file || !validateUploadFile(file)) return;
      if (optionsMode?.type === "add") {
        addDocumentFile(file);
      } else if (optionsMode?.type === "replace") {
        replaceDocumentFile(optionsMode.index, file);
      }
      closeOptions();
    },
    [addDocumentFile, closeOptions, optionsMode, replaceDocumentFile]
  );

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
    if (!canvasRef.current || !videoRef.current || !optionsMode) return;

    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "captured.jpg", { type: "image/jpeg" });

        if (optionsMode.type === "profile") {
          emitProfileFile(file);
          closeOptions();
        } else {
          applyDocumentFile(file);
        }
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleUploadClick = () => {
    if (optionsMode?.type === "profile") {
      closeOptions();
      profileInputRef.current?.click();
      return;
    }

    docUploadTargetRef.current = optionsMode;
    closeOptions();
    docInputRef.current?.click();
  };

  const handleProfileFileInput = (e) => {
    const file = getValidatedUploadFile(e);
    if (!file) return;
    emitProfileFile(file);
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  const handleDocFileInput = (e) => {
    const file = getValidatedUploadFile(e);
    if (!file) return;

    const target = docUploadTargetRef.current;
    if (target?.type === "replace") {
      replaceDocumentFile(target.index, file);
    } else {
      addDocumentFile(file);
    }

    docUploadTargetRef.current = null;
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const optionsTitle = optionsMode ? OPTIONS_TITLES[optionsMode.type] : "";
  const cameraTitle = optionsMode ? CAMERA_TITLES[optionsMode.type] : "Capture Image";

  return (
    <div className="profile-documents-section mt-2">
      <label className="form-label fw-semibold mb-2 d-block">{documentsTitle}</label>

      <input
        type="file"
        ref={docInputRef}
        accept="image/*"
        className="d-none"
        onChange={handleDocFileInput}
      />

      {showProfile && (
        <input
          type="file"
          ref={profileInputRef}
          accept="image/*"
          className="d-none"
          onChange={handleProfileFileInput}
        />
      )}

      <div className="profile-documents-section__grid">
        {showProfile && (
          <div className="profile-documents-section__col profile-documents-section__col--profile">
            <div className="profile-documents-section__square-wrap">
              <button
                type="button"
                className="profile-documents-section__square profile-documents-section__square--profile-trigger"
                onClick={() => setOptionsMode({ type: "profile" })}
                title="Profile photo"
              >
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile"
                    className="profile-documents-section__square-img"
                  />
                ) : (
                  <span className="profile-documents-section__square-upload">
                    <i className="bi bi-cloud-upload" />
                    <span>Upload</span>
                  </span>
                )}
              </button>
              {profilePreview && (
                <button
                  type="button"
                  className="profile-documents-section__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileRemove?.();
                  }}
                  aria-label="Remove profile photo"
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
            <div className="profile-documents-section__meta profile-documents-section__meta--compact">
              <span className="profile-documents-section__label">Profile Photo</span>
            </div>
          </div>
        )}

        {documents.map((doc, index) => {
          const src = doc.preview || resolveImageUrl(doc);
          return (
            <div key={doc.id || index} className="profile-documents-section__col">
              <div className="profile-documents-section__square-wrap">
                <button
                  type="button"
                  className="profile-documents-section__square profile-documents-section__square--doc-trigger"
                  onClick={() => setOptionsMode({ type: "replace", index })}
                  title="Change image"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={doc.label || `Document ${index + 1}`}
                      className="profile-documents-section__square-img"
                    />
                  ) : (
                    <span className="profile-documents-section__square-upload">
                      <i className="bi bi-cloud-upload" />
                      <span>Upload</span>
                    </span>
                  )}
                </button>
                {src && (
                  <button
                    type="button"
                    className="profile-documents-section__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDocument?.(index);
                    }}
                    aria-label="Remove image"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
              {showDocumentLabels && (
                <input
                  type="text"
                  className="form-control form-control-sm border-dark profile-documents-section__details"
                  placeholder="Image details"
                  value={doc.label || ""}
                  onChange={(e) => onUpdateDocument?.(index, { label: e.target.value })}
                />
              )}
            </div>
          );
        })}

        {totalCount < maxDocuments && (
          <div className="profile-documents-section__col profile-documents-section__col--add">
            <button
              type="button"
              className="profile-documents-section__square profile-documents-section__square--add"
              onClick={() => setOptionsMode({ type: "add" })}
              title={`Add image (${totalCount}/${maxDocuments})`}
            >
              <i className="bi bi-plus-lg" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

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
            aria-labelledby="image-options-title"
          >
            <div className="profile-documents-section__options-header">
              <h6 id="image-options-title" className="mb-0 fw-semibold">
                {optionsTitle}
              </h6>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeOptions}
              />
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
            aria-labelledby="image-camera-title"
          >
            <div className="profile-documents-section__options-header">
              <h6 id="image-camera-title" className="mb-0 fw-semibold">
                {cameraTitle}
              </h6>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={stopCamera}
              />
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
              {!cameraReady && (
                <p className="text-muted small mt-2 mb-0">Starting camera…</p>
              )}
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

export default ProfileDocumentsSection;
