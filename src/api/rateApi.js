const STORAGE_KEY = "khataboss_metal_rates";

const readRates = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeRates = (rates) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
};


export const getRates = async () => {
  const data = readRates();
  return { message: "Rates fetched successfully", data };
};


export const createRate = async (rateData) => {
  const rates = readRates();
  const newRate = {
    ...rateData,
    rate_id: rates.length > 0 ? Math.max(...rates.map((r) => r.rate_id || 0)) + 1 : 1,
    rate_uuid: crypto.randomUUID(),
    rate_add_date: new Date().toISOString(),
  };
  rates.unshift(newRate);
  writeRates(rates);
  return { message: "Rate saved successfully", data: newRate };
};


export const deleteRate = async (uuid) => {
  const rates = readRates();
  const filtered = rates.filter((r) => r.rate_uuid !== uuid);
  if (filtered.length === rates.length) {
    throw new Error("Rate not found");
  }
  writeRates(filtered);
  return { message: "Rate deleted successfully" };
};
