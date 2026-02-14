# DayBook Component Refactor TODO

- [x] Edit src/components/daybook/DayBook.jsx: Remove Redux and Zustand imports/usage, define static state for daybookData, summary, firmId, startDate, endDate, openingAmount, allFirms, remove useEffect for fetching data, pass static data to DayBookTable.
- [x] Edit src/components/daybook/DayBookTable.jsx: Remove Zustand usage, define static openingAmount and allFirms, update to use static data passed as props.
- [x] Edit src/components/daybook/DayBookSummary.jsx: Remove Zustand usage, remove setDaybookAmounts call, use static opening_data passed as prop.
- [x] Fix import casing in src/pages/daybook/DayBookRoutes.jsx.
- [ ] Test the component to ensure it renders with static data and no errors, verify calculations in DayBookSummary.
