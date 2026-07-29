import React, { useEffect, useState } from "react";
import DayBookMobileSection from "./DayBookMobileSection";
import DayBookMobileSummary from "./DayBookMobileSummary";

const DayBookMobileView = ({
  panels = [],
  selectedPanel,
  onSelectPanel,
  keyedDaybookData,
  openingData,
}) => {
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  /** Independent open state per section title */
  const [openMap, setOpenMap] = useState({});

  // Init panels + open section chosen from mobile dropdown
  useEffect(() => {
    if (!panels.length) {
      setOpenMap({});
      return;
    }

    setOpenMap((prev) => {
      const next = {};
      panels.forEach((panel) => {
        next[panel.title] = Object.prototype.hasOwnProperty.call(prev, panel.title)
          ? prev[panel.title]
          : false;
      });

      const hasOpen = panels.some((panel) => next[panel.title]);
      if (selectedPanel && panels.some((p) => p.title === selectedPanel)) {
        next[selectedPanel] = true;
      } else if (!hasOpen) {
        next[panels[0].title] = true;
      }
      return next;
    });
  }, [panels, selectedPanel]);

  const handleToggleCard = (key) => {
    setExpandedCardKey((prev) => (prev === key ? null : key));
  };

  const handleToggleSection = (title) => {
    setOpenMap((prev) => {
      const willOpen = !prev[title];
      if (willOpen && onSelectPanel) {
        onSelectPanel(title);
      }
      return {
        ...prev,
        [title]: willOpen,
      };
    });
    setExpandedCardKey(null);
  };

  if (!panels.length) {
    return (
      <div className="daybook-mobile-view">
        <div className="daybook-mobile-empty text-center py-4">
          No records found for the selected period.
        </div>
        <DayBookMobileSummary
          DayBookData={keyedDaybookData}
          opening_data={openingData}
        />
      </div>
    );
  }

  return (
    <div className="daybook-mobile-view">
      {panels.map((panel) => (
        <DayBookMobileSection
          key={panel.title}
          title={panel.title}
          colorClass={panel.colorClass}
          amtTone={panel.amtTone}
          data={panel.data}
          expandedCardKey={expandedCardKey}
          onToggleCard={handleToggleCard}
          isOpen={!!openMap[panel.title]}
          onToggleSection={() => handleToggleSection(panel.title)}
        />
      ))}

      <DayBookMobileSummary
        DayBookData={keyedDaybookData}
        opening_data={openingData}
      />
    </div>
  );
};

export default DayBookMobileView;
