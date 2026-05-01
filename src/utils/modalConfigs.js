// Configurations for dynamic modal types in Active Loan Panel

export const modalConfigs = {
  deposit: {
    title: 'Loan Deposit',
    actionText: 'Deposit',
    showDrAccount: false,
    topSection: [
      {
        className: 'mb-4',
        fields: [
          { label: 'Deposit Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col-md-2' },
          { label: 'Prin Amt. Rec.', type: 'text', defaultValue: '5000', colClass: 'col-md-2' },
          { label: 'Int Amt. Rec.', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Discount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Extra Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Total Amt. Rec.', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'No Of Month', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Prin Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Interest Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Discount Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Extra Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Staff Name', type: 'select', colClass: 'col-md-2' }
        ]
      }
    ]
  },
  
  release: {
    title: 'Release Active Loan',
    actionText: 'Release Loan',
    showDrAccount: false,
    topSection: [
      {
        className: 'mb-4',
        fields: [
          { label: 'Release Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col-md-2' },
          { label: 'Principal Amount', type: 'text', defaultValue: '5000', colClass: 'col-md-2' },
          { label: 'Interest Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Discount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Extra Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Payable Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Prin Amt Account', type: 'select', colClass: 'col-md-2 offset-md-2' },
          { label: 'Interest Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Discount Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Extra Amt Account', type: 'select', colClass: 'col-md-2' },
          { label: 'Staff Name', type: 'select', colClass: 'col-md-2' }
        ]
      }
    ]
  },

  addPrincipal: {
    title: 'Additional Principal Information',
    actionText: 'Add Principal',
    showDrAccount: true,
    topSection: [
      {
        className: 'mb-4',
        fields: [
          { label: 'Add Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col' },
          { label: 'Principal Amount', type: 'text', defaultValue: '5000', colClass: 'col' },
          { label: 'Rate of Interest', type: 'text', defaultValue: '2', colClass: 'col' },
          { label: 'Payable Amount', type: 'text', defaultValue: '5000', colClass: 'col' },
          { label: 'Staff Name', type: 'select', colClass: 'col' }
        ]
      }
    ]
  },

  transfer: {
    title: 'Transfer Loan',
    actionText: 'Transfer Loan',
    showDrAccount: true,
    topSection: [
      {
        className: 'mb-3',
        fields: [
          { label: 'Transfer Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col-md-2' },
          { label: 'Loan Start Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col-md-2' },
          { label: 'Principal Amount', type: 'text', defaultValue: '5000', colClass: 'col-md-2' },
          { label: 'Rate of Interest', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Interest Option', type: 'text', defaultValue: '5000', colClass: 'col-md-2' },
          { label: 'Staff Name', type: 'select', colClass: 'col-md-2' }
        ]
      },
      {
        className: 'mb-4',
        fields: [
          { label: 'Existing Firm', type: 'text', defaultValue: '5000', colClass: 'col-md-3' },
          { label: 'Transfer Firm', type: 'text', defaultValue: '5000', colClass: 'col-md-3' },
          { label: 'New Packet No', type: 'text', defaultValue: '5000', colClass: 'col-md-3' },
          { label: 'New Locker No', type: 'text', defaultValue: '5000', colClass: 'col-md-3' }
        ]
      }
    ]
  },

  auction: {
    title: 'Auction Loan',
    actionText: 'Auction Loan',
    showDrAccount: false,
    topSection: [
      {
        className: 'mb-2',
        fields: [
          { label: 'Principal Amount', type: 'text', defaultValue: '5000', colClass: 'col-md-3' },
          { label: 'Interest Paid', type: 'text', defaultValue: '2', colClass: 'col-md-3' },
          { label: 'Auction Charge', type: 'text', defaultValue: '2', colClass: 'col-md-3' },
          { label: 'Extra Amount', type: 'text', defaultValue: '2', colClass: 'col-md-3' }
        ]
      },
      {
        className: 'mb-2',
        fields: [
          { label: 'Prin Amt Account', type: 'select', colClass: 'col-md-3' },
          { label: 'Interest Amt Account', type: 'select', colClass: 'col-md-3' },
          { label: 'Charge Amt Account', type: 'select', colClass: 'col-md-3' },
          { label: 'Extra Amt Account', type: 'select', colClass: 'col-md-3' }
        ]
      },
      {
        className: 'mb-4',
        fields: [
          { label: 'Auction Date', type: 'date', defaultValue: '2025-02-02', colClass: 'col-md-2' },
          { label: 'Profit Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Total Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Auction Amount', type: 'text', defaultValue: '2', colClass: 'col-md-2' },
          { label: 'Final Profit/Loss', type: 'text', defaultValue: '', colClass: 'col-md-2' },
          { label: 'Staff Name', type: 'select', colClass: 'col-md-2' }
        ]
      }
    ]
  }
};
