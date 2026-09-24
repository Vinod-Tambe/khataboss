import {
  fetchImageDataUrl,
  resolveStockItemImageRef,
} from '../imageHelpers';

const formatMoney = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatWeight = (value, unit) => {
  if (value == null || value === '') return '—';
  const suffix = unit ? ` ${unit}` : '';
  return `${value}${suffix}`;
};

/**
 * Build Form 8 stock rows with embedded JPEG data URLs for pdfMake.
 */
export async function loadLoanStockImagesForPdf(items = []) {
  if (!items.length) return [];

  return Promise.all(
    items.map(async (item, index) => {
      const { url, path } = resolveStockItemImageRef(item);
      const imageDataUrl = await fetchImageDataUrl(url, path);

      return {
        imageKey: `stockItem${index}`,
        imageDataUrl,
        metal: String(item.st_metal_type || '—').toUpperCase(),
        item_name: item.st_item_name || '—',
        quantity: String(item.st_quantity ?? '—'),
        gs_weight: formatWeight(item.st_gs_weight, item.st_gs_type),
        nt_weight: formatWeight(item.st_nt_weight, item.st_nt_type),
        purity: item.st_purity != null && item.st_purity !== '' ? String(item.st_purity) : '—',
        fine_weight:
          item.st_fine_weight != null && item.st_fine_weight !== ''
            ? String(item.st_fine_weight)
            : '—',
        valuation: formatMoney(
          item.st_final_valuation ?? item.st_valuation ?? item.valuation ?? 0
        ),
      };
    })
  );
}

export default loadLoanStockImagesForPdf;
