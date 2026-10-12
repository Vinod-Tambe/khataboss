import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';

/**
 * Simple HTML5 drag-and-drop reorder list.
 * @param {Array} items
 * @param {function} onReorder - (newItems) => void
 * @param {function} renderItem - (item, index) => ReactNode
 * @param {string} itemKey - key field on item
 */
const DraggableList = ({ items = [], onReorder, renderItem, itemKey = 'id' }) => {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setOverIndex(index);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    let insertAt = index;
    if (dragIndex < index) insertAt = index - 1;
    next.splice(insertAt, 0, moved);
    onReorder(next.map((item, idx) => ({ ...item, order: idx + 1 })));
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="form-custom-dnd-list">
      {items.map((item, index) => (
        <div
          key={item[itemKey] ?? index}
          className={`form-custom-dnd-item ${dragIndex === index ? 'is-dragging' : ''} ${overIndex === index ? 'is-over' : ''}`}
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
        >
          <span
            className="form-custom-dnd-handle"
            draggable
            role="button"
            tabIndex={0}
            aria-label="Drag to reorder"
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              handleDragStart(index);
              const id = item[itemKey] ?? String(index);
              e.dataTransfer.setData('text/plain', String(id));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={handleDragEnd}
          >
            <FiMenu size={14} />
          </span>
          <div className="form-custom-dnd-content">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  );
};

export default DraggableList;
