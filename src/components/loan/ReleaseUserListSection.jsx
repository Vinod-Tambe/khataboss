import React from "react";
import moment from "moment";
import { parseOtherImages, resolveImageUrl } from "../../utils/imageHelpers";
import { formatReleaseDates } from "../../utils/releaseUserHelpers";

const DocThumb = ({ img, label, onImageClick }) => {
  const src = resolveImageUrl(img);
  if (!src) return null;

  return (
    <button
      type="button"
      className="btn btn-link p-0 border-0"
      title={label}
      onClick={() => onImageClick?.(src)}
    >
      <img
        src={src}
        alt={label}
        style={{
          width: 40,
          height: 40,
          objectFit: "cover",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
    </button>
  );
};

const DocumentImagesList = ({ images, onImageClick }) => {
  const list = parseOtherImages(images);
  if (!list.length) return <span className="text-muted small">-</span>;

  return (
    <div className="d-flex flex-column gap-1 align-items-center">
      {list.map((img, idx) => {
        const src = resolveImageUrl(img);
        if (!src) return null;
        const label = img.label || `Document ${idx + 1}`;
        return (
          <div key={img.path || idx} className="d-flex align-items-center gap-1">
            <DocThumb img={img} label={label} onImageClick={onImageClick} />
            <span className="small text-start" style={{ maxWidth: 120 }}>
              {label}
              {img.note ? (
                <span className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
                  {img.note}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const getRowReleaseDates = (row) => {
  if (row.releaseDates?.length) return formatReleaseDates(row.releaseDates);
  if (row.release_dates?.length) {
    return formatReleaseDates(
      row.release_dates.map((d) => (d ? moment(d).format("DD-MM-YYYY") : "")).filter(Boolean)
    );
  }
  return "-";
};

export const ReleaseUserListSection = ({ data = [], onImageClick, variant = "desktop" }) => {
  if (!data.length) return null;

  if (variant === "mobile") {
    return (
      <>
        <div className="loan-mobile-section-title">Release User List</div>
        <div className="loan-mobile-list">
          {data.map((row) => (
            <div key={row.ru_id} className="card border mb-2">
              <div className="card-body p-3">
                <div className="fw-bold">{row.ru_full_name || "—"}</div>
                <div className="small text-muted">{row.ru_mobile || "—"}</div>
                <div className="small mt-2">
                  <strong>Release Date:</strong> {getRowReleaseDates(row)}
                </div>
                {row.ru_aadhaar && (
                  <div className="small"><strong>Aadhaar:</strong> {row.ru_aadhaar}</div>
                )}
                {row.ru_address && (
                  <div className="small"><strong>Address:</strong> {row.ru_address}</div>
                )}
                <div className="mt-2">
                  <DocumentImagesList images={row.ru_other_images} onImageClick={onImageClick} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="panel-section mt-2">
      <div className="section-header mb-2 text-dark">Release User List</div>
      <div className="table-responsive">
        <table className="table table-bordered text-center m-0">
          <thead>
            <tr>
              <th className="table-danger text-brown border border-dark">Code</th>
              <th className="table-danger text-brown border border-dark">Full Name</th>
              <th className="table-danger text-brown border border-dark">Mobile</th>
              <th className="table-danger text-brown border border-dark">Email</th>
              <th className="table-danger text-brown border border-dark">Aadhaar</th>
              <th className="table-danger text-brown border border-dark">PAN</th>
              <th className="table-danger text-brown border border-dark">City</th>
              <th className="table-danger text-brown border border-dark">State</th>
              <th className="table-danger text-brown border border-dark">Release Date</th>
              <th className="table-danger text-brown border border-dark">Documents</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.ru_id}>
                <td>{row.ru_unique_code || "-"}</td>
                <td className="fw-semibold">{row.ru_full_name || "-"}</td>
                <td>{row.ru_mobile || "-"}</td>
                <td>{row.ru_email || "-"}</td>
                <td>{row.ru_aadhaar || "-"}</td>
                <td>{row.ru_pan || "-"}</td>
                <td>{row.ru_city || "-"}</td>
                <td>{row.ru_state || "-"}</td>
                <td>{getRowReleaseDates(row)}</td>
                <td>
                  <DocumentImagesList images={row.ru_other_images} onImageClick={onImageClick} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReleaseUserListSection;
