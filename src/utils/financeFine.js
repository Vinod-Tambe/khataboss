/**
 * Overdue fine: every `fineEmiNo` overdue EMIs → charge `fineAmt`.
 */
export function computeFinanceFine(finance, emis = [], asOfDate = null) {
  const fineAmt = parseFloat(finance?.fin_fine_amt) || 0;
  const fineEmiNo = parseInt(finance?.fin_fine_emi_no, 10) || 0;
  const collectAmt = parseFloat(finance?.fin_collec_amt) || 0;
  const today = asOfDate || new Date().toISOString().split("T")[0];
  const enabled = fineAmt > 0 && fineEmiNo > 0;

  const overdue = (emis || [])
    .filter((e) => {
      const status = (e.ft_emi_status || "").toUpperCase();
      const pending = parseFloat(e.ft_pending_amt) || 0;
      const due = e.ft_due_date || "";
      return (
        pending > 0 &&
        ["PENDING", "PARTIAL", "DUE"].includes(status) &&
        due &&
        due < today
      );
    })
    .sort((a, b) => (a.ft_emi_no || 0) - (b.ft_emi_no || 0));

  const chargeCount = enabled ? Math.floor(overdue.length / fineEmiNo) : 0;
  const totalFine = parseFloat((chargeCount * fineAmt).toFixed(2));

  const fineByFtId = {};
  if (enabled && chargeCount > 0) {
    for (let i = 0; i < chargeCount; i++) {
      const emi = overdue[(i + 1) * fineEmiNo - 1];
      if (emi?.ft_id != null) fineByFtId[emi.ft_id] = fineAmt;
    }
  }

  const emisWithFine = (emis || []).map((e) => ({
    ...e,
    ft_fine_amt: fineByFtId[e.ft_id] || 0,
    ft_is_overdue: overdue.some((o) => o.ft_id === e.ft_id),
  }));

  return {
    enabled,
    fineAmt,
    fineEmiNo,
    collectAmt,
    overdueCount: overdue.length,
    chargeCount,
    totalFine,
    label: enabled
      ? `Per ${fineEmiNo} overdue EMI: ₹${fineAmt.toFixed(2)}`
      : "",
    emisWithFine,
  };
}

export function sumPaidFineAndCollect(moneyTrans = []) {
  let finePaid = 0;
  let collectPaid = 0;

  for (const t of moneyTrans || []) {
    if (t.fm_is_deleted) continue;
    const type = (t.fm_trans_type || "").toUpperCase();
    const amt = parseFloat(t.fm_trans_amt) || 0;
    const info = t.fm_pay_info || t.fm_other_info || "";

    if (type === "FINE") {
      const m = /FINE:([\d.]+)\|COLLECT:([\d.]+)/i.exec(info);
      if (m) {
        finePaid += parseFloat(m[1]) || 0;
        collectPaid += parseFloat(m[2]) || 0;
      } else {
        finePaid += amt;
      }
    } else if (type === "COLLECT") {
      collectPaid += amt;
    }
  }

  return {
    finePaid: parseFloat(finePaid.toFixed(2)),
    collectPaid: parseFloat(collectPaid.toFixed(2)),
  };
}
