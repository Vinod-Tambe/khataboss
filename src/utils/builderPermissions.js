/** Form / Agreement builder route and UI permission helpers. */

export const FORM_BUILDER_ROUTE_KEYS = ["formBuilder.view", "formBuilder.edit"];

export const AGREEMENT_BUILDER_ROUTE_KEYS = [
  "agreementBuilder.view",
  "agreementBuilder.edit",
];

export const canAccessFormBuilder = (can) =>
  FORM_BUILDER_ROUTE_KEYS.some((key) => can(key));

export const canEditFormBuilder = (can) => can("formBuilder.edit");

export const canAccessAgreementBuilder = (can) =>
  AGREEMENT_BUILDER_ROUTE_KEYS.some((key) => can(key));

export const canEditAgreementBuilder = (can) => can("agreementBuilder.edit");
