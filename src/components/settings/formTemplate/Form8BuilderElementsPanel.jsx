import React, { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { canToggleForm8BlockOnCanvas } from '../../../utils/formTemplate/form8BuilderBlocks';
import { buildForm8PaletteCatalog } from '../../../utils/formTemplate/form8BuilderPalette';

const PaletteRow = ({ item, selected, onSelect, onToggleCanvas }) => {
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

  const handleActivate = () => {
    if (item.onCanvas || !toggleable) {
      onSelect?.(item);
      return;
    }
    onToggleCanvas?.(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      title={item.onCanvas ? 'On form — click to select' : 'Off form — click to add'}
      aria-pressed={selected}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      <span className="f8-builder-palette-label">{item.label}</span>
      {toggleable ? (
        <span
          className={`f8-builder-palette-status${item.onCanvas ? ' is-on' : ' is-off'}`}
          role="button"
          tabIndex={0}
          title={item.onCanvas ? 'Remove from form' : 'Add to form'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCanvas?.(item);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onToggleCanvas?.(item);
            }
          }}
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
  onCollapse,
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

  const handleSelectItem = (item) => {
    onSelectBlock(item.id);
  };

  const handleToggleCanvas = (item) => {
    if (item.repeatable) {
      const addedId = onToggleBlockOnCanvas?.(item.id);
      onSelectBlock(addedId || item.id);
      return;
    }
    if (!canToggleForm8BlockOnCanvas(item.id)) {
      onSelectBlock(item.id);
      return;
    }
    if (item.onCanvas) {
      onToggleBlockOnCanvas?.(item.id);
      if (selectedBlockId === item.id) {
        onSelectBlock(null);
      }
      return;
    }
    const addedId = onToggleBlockOnCanvas?.(item.id);
    onSelectBlock(addedId || item.id);
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
        <div className="f8-builder-panel-title-row">
          <div className="f8-builder-panel-title">Elements</div>
          <button
            type="button"
            className="f8-builder-panel-hide"
            title="Hide elements"
            onClick={onCollapse}
          >
            <FiChevronLeft size={16} />
          </button>
        </div>
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
              onSelect={handleSelectItem}
              onToggleCanvas={handleToggleCanvas}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Form8BuilderElementsPanel;
