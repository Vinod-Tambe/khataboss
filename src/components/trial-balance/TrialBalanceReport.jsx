import React from 'react'

const TrialBalanceReport = () => {
    return (
    <div class="table-responsive table-responsive-custom">
  <table class="table table-bordered table-striped text-nowrap pb-0 mb-0">
    
    <thead>
      <tr class="bg-danger text-white">
        <th class="sticky-col">ACCOUNTS DETAILS</th>
        <th>OPENING BAL.</th>
        <th>DEBIT AMT</th>
        <th>CREDIT AMT</th>
        <th>CLOSING BAL.</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td class="sticky-col">BANK ACCOUNT</td>
        <td class="text-end">27500.00 CR</td>
        <td class="text-end">0.00</td>
        <td class="text-end">0.00</td>
        <td class="text-end">27500.00 CR</td>
      </tr>

      <tr>
        <td class="sticky-col">STOCK ACCOUNT</td>
        <td class="text-end">27500.00 DR</td>
        <td class="text-end">0.00</td>
        <td class="text-end">0.00</td>
        <td class="text-end">27500.00 DR</td>
      </tr>

      <tr>
        <td class="sticky-col">FINANCE ACCOUNT</td>
        <td class="text-end">27500.00 DR</td>
        <td class="text-end">0.00</td>
        <td class="text-end">0.00</td>
        <td class="text-end">27500.00 DR</td>
      </tr>

      <tr>
        <td class="sticky-col">LOAN ACCOUNT</td>
        <td class="text-end">27500.00 DR</td>
        <td class="text-end">0.00</td>
        <td class="text-end">0.00</td>
        <td class="text-end">27500.00 DR</td>
      </tr>
    </tbody>

    <tfoot>
      <tr class="bg-blue fw-bold">
        <th>TOTAL</th>
        <th class="text-end">0.00</th>
        <th class="text-end">0.00</th>
        <th class="text-end">0.00</th>
        <th class="text-end">0.00</th>
      </tr>
    </tfoot>

  </table>
</div>
)
}

export default TrialBalanceReport
