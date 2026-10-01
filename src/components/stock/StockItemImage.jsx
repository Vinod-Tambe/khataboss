import React, { useEffect, useState } from 'react';
import { resolveStockItemImageRef } from '../../utils/imageHelpers';

const VARIANT_CLASS = {
  card: 'stock-item-image--card',
  hero: 'stock-item-image--hero',
  sibling: 'stock-item-image--sibling',
};

const IMG_CLASS = {
  card: 'stock-card__img',
  hero: 'stock-detail-hero__img',
  sibling: 'stock-loan-sibling-card__img',
};

/**
 * Stock module only — shows themed "No image available" when missing or broken.
 */
const StockItemImage = ({ item, alt = 'Stock item', variant = 'card' }) => {
  const { url } = resolveStockItemImageRef(item);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [url]);

  const showPlaceholder = !url || broken;
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.card;

  if (showPlaceholder) {
    return (
      <div
        className={`stock-item-image__empty ${variantClass}`}
        role="img"
        aria-label="No image available"
      >
        <i className="bi bi-image stock-item-image__empty-icon" aria-hidden="true" />
        <span className="stock-item-image__empty-text">No image available</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={IMG_CLASS[variant] || IMG_CLASS.card}
      draggable={false}
      onError={() => setBroken(true)}
    />
  );
};

export default StockItemImage;
