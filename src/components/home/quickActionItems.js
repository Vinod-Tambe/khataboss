export const dashboardQuickActionTitles = [
  'Finance Collection',
  'Loan Collection',
  'Daybook',
  'Add User',
  'User List',
  'Balance Sheet',
  'Trial Balance',
  'Profit/Loss',
  'Calculator',
];

export const allQuickActionItems = [
  {
    title: 'Finance Collection',
    icon: 'bi-currency-rupee',
    color: 'warning',
    isModal: true,
    permission: 'finance.payment',
  },
  {
    title: 'Loan Collection',
    icon: 'bi-bank',
    color: 'danger',
    isModal: true,
    permission: 'loan.deposit',
  },  
  {
    title: 'Daybook',
    icon: 'bi-journal-text',
    color: 'secondary',
    to: '/daybook',
    permission: 'reports.daybook',
  },
  {
    title: 'Add User',
    icon: 'bi-person-plus',
    color: 'success',
    isModal: true,
    permission: 'user.create',
  },
  {
    title: 'User List',
    icon: 'bi-list-ul',
    color: 'info',
    to: '/user/grid',
    permission: 'user.view',
  },
  {
    title: 'Balance Sheet',
    icon: 'bi-clipboard-check',
    color: 'success',
    to: '/balance-sheet',
    permission: 'reports.balanceSheet',
  },
  {
    title: 'Trial Balance',
    icon: 'bi-calculator-fill',
    color: 'info',
    to: '/trial-balance',
    permission: 'reports.trialBalance',
  },
  {
    title: 'Profit/Loss',
    icon: 'bi-graph-up-arrow',
    color: 'primary',
    to: '/profit-loss',
    permission: 'reports.profitLoss',
  },

  {
    title: 'Calculator',
    icon: 'bi-calculator',
    color: 'dark',
    isModal: true,
    modalKey: 'calculator',
  },
];
