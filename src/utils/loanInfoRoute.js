/** Build customer loan info URL (id or uuid in path — survives refresh & nested route remounts). */
export function buildLoanInfoPath(loanOrRef) {
  if (loanOrRef == null || loanOrRef === "") return "/user/home/loan-info";
  const id =
    typeof loanOrRef === "object"
      ? loanOrRef.girv_id ?? loanOrRef.girv_uuid
      : loanOrRef;
  if (id == null || id === "") return "/user/home/loan-info";
  return `/user/home/loan-info/${encodeURIComponent(String(id))}`;
}
