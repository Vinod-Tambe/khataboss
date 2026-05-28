const useAddFinanceCalculator = ({ fin_prin_amt,
    fin_no_of_emi,
    fin_freq_type = "MONTHLY",
    fin_proccess_amt = 0 }) => {
    fin_prin_amt = parseFloat(fin_prin_amt) || 0;
    fin_no_of_emi = parseFloat(fin_no_of_emi) || 0;
    fin_proccess_amt = parseFloat(fin_proccess_amt) || 0;

    let adjustedNoOfEmi = fin_no_of_emi;
    // Note: WEEKLY and MONTHLY might need specific logic depending on the requirements,
    // but based on previous logic, only quarterly/yearly had adjustments.
    // Assuming fin_no_of_emi is the count of intervals.

    let emi = 0;
    if (fin_prin_amt > 0 && adjustedNoOfEmi > 0) {
        emi = fin_prin_amt / adjustedNoOfEmi;
    }

    const finalAmount = emi * adjustedNoOfEmi - fin_proccess_amt;

    return {
        fin_emi_amt: emi > 0 ? emi.toFixed(2) : "0.00",
        fin_final_amt: finalAmount > 0 ? finalAmount.toFixed(2) : "0.00",
    };
};

export default useAddFinanceCalculator;
