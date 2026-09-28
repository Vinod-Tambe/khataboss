import React, { useMemo } from 'react';
import { getLoanItems } from '../../utils/loanItems';
import { resolveStockItemImageRef } from '../../utils/imageHelpers';
import { formatListAmt } from '../../utils/listFormatters';

const formatWeight = (weight, type) => {
  const w = parseFloat(weight) || 0;
  return `${w.toFixed(3)} ${type || 'GM'}`;
};

const PledgedItemsTable = ({ loanDetails, className = '' }) => {
  const rawItems = useMemo(() => getLoanItems(loanDetails), [loanDetails]);

  const totals = useMemo(() => {
    let valuation = 0;
    let weight = 0;
    rawItems.forEach((item) => {
      valuation += parseFloat(item.st_final_valuation || item.st_valuation) || 0;
      weight += parseFloat(item.st_nt_weight || item.st_gs_weight) || 0;
    });
    return { valuation, weight };
  }, [rawItems]);

  if (!rawItems.length) {
    return (
      <p className="text-muted small mb-0">No pledged items on this loan.</p>
    );
  }

  return (
    <div className={className}>
      <h6 className="fw-bold text-brown mb-2">Pledged Items / Stock Details</h6>
      <div className="table-responsive">
        <table className="table table-bordered border-secondary table-sm mb-0 dynamic-data-table">
          <thead>
            <tr className="bg-danger text-white">
              <th className="text-center">SR</th>
              <th className="text-center">IMAGE</th>
              <th>METAL</th>
              <th>ITEM DESCRIPTION</th>
              <th className="text-center">QTY</th>
              <th className="text-end">GS WT</th>
              <th className="text-end">NT WT</th>
              <th className="text-center">PURITY</th>
              <th className="text-end">FINE WT</th>
              <th className="text-end">RATE</th>
              <th className="text-end">VALUATION (₹)</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rawItems.map((item, idx) => {
              const { url: imageUrl } = resolveStockItemImageRef(item);
              return (
                <tr key={item.st_id ?? item.st_uuid ?? idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center" style={{ width: 56 }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-uppercase">{item.st_metal_type || '-'}</td>
                  <td>{item.st_item_name || '-'}</td>
                  <td className="text-center">{item.st_quantity ?? '-'}</td>
                  <td className="text-end">
                    {formatWeight(item.st_gs_weight, item.st_gs_type)}
                  </td>
                  <td className="text-end">
                    {formatWeight(item.st_nt_weight, item.st_nt_type)}
                  </td>
                  <td className="text-center">{item.st_purity ?? '-'}</td>
                  <td className="text-end">{formatListAmt(item.st_fine_weight)}</td>
                  <td className="text-end">{formatListAmt(item.st_rate)}</td>
                  <td className="text-end fw-semibold">
                    {formatListAmt(item.st_final_valuation || item.st_valuation)}
                  </td>
                  <td className="text-uppercase small">{item.st_status || '-'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="table-light fw-bold">
              <td colSpan={6} className="text-end">Total</td>
              <td colSpan={3} className="text-end">
                Total NT/GS Wt: {totals.weight.toFixed(3)} GM
              </td>
              <td />
              <td className="text-end">{formatListAmt(totals.valuation)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PledgedItemsTable;
