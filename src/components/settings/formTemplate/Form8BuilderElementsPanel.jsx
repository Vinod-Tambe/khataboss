import React, { useMemo, useState } from 'react';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import { canToggleForm8BlockOnCanvas } from '../../../utils/formTemplate/form8BuilderBlocks';
import { buildForm8PaletteCatalog } from '../../../utils/formTemplate/form8BuilderPalette';

const PaletteRow = ({ item, selected, onToggle }) => {
  const toggleable = canToggleForm8BlockOnCanvas(item.id);
  const className = [
    'f8-builder-palette-item',
    'f8-builder-palette-item--po',
    'f8-builder-palette-item--flat',
    selected ? 'is-selected' : '',
    item.onCanvas ? 'is-placed' : '',
    item.onCanvas ? '' : 'is-addable',
    toggleable ? 'is-toggleable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const statusLabel = item.onCanvas ? 'On form — click to remove' : 'Off form — click to add';

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      title={toggleable ? statusLabel : item.label}
      aria-pressed={item.onCanvas}
      onClick={() => onToggle?.(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle?.(item);
        }
      }}
    >
      <span className="f8-builder-palette-label">{item.label}</span>
      {toggleable ? (
        <span
          className={`f8-builder-palette-status${item.onCanvas ? ' is-on' : ' is-off'}`}
          aria-hidden="true"
        >
          {item.onCanvas ? 'On' : 'Add'}
        </span>
      ) : null}
    </div>
  );
};

const Form8BuilderElementsPanel = ({
  config,
  sections = [],
  selectedBlockId,
  onSelectBlock,
  onToggleBlockOnCanvas,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const [query, setQuery] = useState('');

  const catalog = useMemo(
    () => buildForm8PaletteCatalog(config, sections),
    [config, sections]
  );

  const q = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const list = catalog.items || [];
    if (!q) return list;
    return list.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || String(item.id).toLowerCase().includes(q)
    );
  }, [catalog.items, q]);

  const handleToggleItem = (item) => {
    if (!canToggleForm8BlockOnCanvas(item.id)) {
      onSelectBlock(item.id);
      return;
    }
    if (item.onCanvas) {
      onToggleBlockOnCanvas?.(item.id);
      if (selectedBlockId === item.id) {
        onSelectBlock('form_header');
      }
      return;
    }
    onToggleBlockOnCanvas?.(item.id);
    onSelectBlock(item.id);
  };

  if (collapsed) {
    return (
      <aside className="f8-builder-panel f8-builder-panel--elements f8-builder-panel--collapsed">
        <button
          type="button"
          className="f8-builder-panel-expand"
          title="Show elements"
          onClick={onToggleCollapsed}
        >
          <FiChevronRight size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="f8-builder-panel f8-builder-panel--elements f8-builder-panel--compact">
      <div className="f8-builder-panel-fixed">
        <div className="f8-builder-panel-title">Elements</div>
        <div className="f8-builder-search-wrap">
          <FiSearch className="f8-builder-search-icon" size={14} aria-hidden="true" />
          <input
            type="search"
            className="form-control form-control-sm f8-builder-search"
            placeholder="Search elements…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="f8-builder-panel-scroll">
        <div className="f8-builder-palette-list f8-builder-palette-list--flat">
          {filteredItems.map((item) => (
            <PaletteRow
              key={item.id}
              item={item}
              selected={selectedBlockId === item.id}
              onToggle={handleToggleItem}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Form8BuilderElementsPanel;
