export const KYC_STORAGE_KEY = "khataboss_kyc_integration";

export const KYC_PROVIDERS = {
  sandbox: {
    id: "sandbox",
    label: "Sandbox",
    tagline: "PAN, Aadhaar OKYC, DigiLocker & tax APIs",
    docsUrl: "https://developer.sandbox.co.in/api-reference/kyc/overview",
    portalUrl: "https://dashboard.sandbox.co.in",
    signupUrl: "https://sandbox.co.in/signup",
    testBaseUrl: "https://test-api.sandbox.co.in",
    liveBaseUrl: "https://api.sandbox.co.in",
    credentialFields: [
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "key_test_xxxxxxxx or key_live_xxxxxxxx",
        type: "text",
        required: true,
        icon: "key",
      },
      {
        key: "apiSecret",
        label: "API Secret",
        placeholder: "Your Sandbox API secret",
        type: "password",
        required: true,
        icon: "lock",
      },
      {
        key: "apiVersion",
        label: "API Version",
        placeholder: "1.0",
        type: "text",
        required: false,
        icon: "hash",
      },
    ],
    credentialSetupSteps: [
      {
        title: "Create your Sandbox account",
        description:
          "Register on Sandbox using your business email (shop or firm email works best). This account is where you will manage API keys and billing.",
        tips: [
          "Use an email you check regularly — Sandbox sends important alerts here.",
          "Business name should match your firm details for faster approval.",
        ],
        link: { label: "Open Sandbox sign up", url: "https://sandbox.co.in/signup" },
      },
      {
        title: "Verify your business profile",
        description:
          "After login, complete your company profile and business verification in the Sandbox dashboard. Live (production) keys are available only after approval.",
        tips: [
          "Keep GST / business documents ready if asked.",
          "Test mode can be used while verification is in progress.",
        ],
        link: { label: "Go to Sandbox dashboard", url: "https://dashboard.sandbox.co.in" },
      },
      {
        title: "Enable PAN & Aadhaar services",
        description:
          "From the Sandbox product catalog, turn on the KYC services you need — PAN verification and Aadhaar OKYC (or DigiLocker). Add wallet balance when you plan to use live verification.",
        tips: [
          "Start with test mode — no real customer charges in test.",
          "You only pay when a live verification API call is made.",
        ],
      },
      {
        title: "Create API Key & Secret",
        description:
          "In Sandbox dashboard go to Settings → API Keys → Create new key. For first setup, choose Test key (starts with key_test_). Copy both Key and Secret immediately.",
        tips: [
          "Secret is shown only once — save it in a safe place.",
          "Never share API Secret with customers or staff who do not need it.",
        ],
        mapsTo: ["apiKey", "apiSecret"],
      },
      {
        title: "Enter keys in KhataBoss",
        description:
          "Come back to this page and paste your API Key and API Secret in the credentials form. Leave API Version as 1.0 unless Sandbox support tells you otherwise.",
        tips: [
          "Click the field button below to jump directly to the correct input.",
          "Click Save settings after pasting the keys.",
        ],
        mapsTo: ["apiKey", "apiSecret", "apiVersion"],
      },
      {
        title: "Add verification reason",
        description:
          "Write why you verify customers — for example: loan onboarding or KYC compliance. Sandbox requires at least 20 characters and sends this text with each verification request.",
        tips: [
          "Example: Customer KYC verification for gold loan and finance onboarding.",
          "You can use the same reason for all customers.",
        ],
        mapsTo: ["verificationReason"],
      },
      {
        title: "Test, then go live",
        description:
          "Keep Environment as Test while trying. Use the Test API button to confirm everything works. When ready for real customers, switch to Production (Live) and use key_live_ keys.",
        tips: [
          "Test with sample PAN/Aadhaar from Sandbox docs first.",
          "Turn on Start KYC verification = Yes only after a successful test.",
        ],
      },
    ],
    testApis: {
      pan: {
        id: "pan",
        label: "PAN verification",
        method: "POST",
        path: "/kyc/pan/verify",
        requestEntity: "in.co.sandbox.kyc.pan_verification.request",
        docsNote:
          "Sandbox test PAN XXXPX1234A with name John Ronald Doe and DOB 11/11/2001 returns a valid individual match.",
        fields: [
          {
            key: "pan",
            label: "PAN",
            placeholder: "XXXPX1234A",
            required: true,
            sampleValue: "XXXPX1234A",
          },
          {
            key: "name_as_per_pan",
            label: "Name as per PAN",
            placeholder: "John Ronald Doe",
            required: true,
            sampleValue: "John Ronald Doe",
          },
          {
            key: "date_of_birth",
            label: "Date of birth",
            placeholder: "DD/MM/YYYY",
            required: true,
            sampleValue: "11/11/2001",
          },
        ],
        expectedResponse: {
          code: 200,
          timestamp: 1000000000000,
          transaction_id: "3b862714-d27d-4907-9027-e6399f8a8d46",
          data: {
            "@entity": "in.co.sandbox.kyc.pan_verification.response",
            pan: "XXXPX1234A",
            category: "individual",
            status: "valid",
            remarks: null,
            name_as_per_pan_match: true,
            date_of_birth_match: true,
            aadhaar_seeding_status: "y",
          },
        },
      },
      aadhaar: {
        id: "aadhaar",
        label: "Aadhaar OTP (step 1)",
        method: "POST",
        path: "/kyc/aadhaar/okyc/otp",
        requestEntity: "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
        docsNote:
          "Use test Aadhaar 123456789012 in Sandbox test mode. UIDAI recommends DigiLocker for production KYC.",
        fields: [
          {
            key: "aadhaar_number",
            label: "Aadhaar number",
            placeholder: "123456789012",
            required: true,
            sampleValue: "123456789012",
          },
        ],
        expectedResponse: {
          code: 200,
          timestamp: 1000000000000,
          transaction_id: "7d75d9db-0870-4719-8884-a3eee7bd68d5",
          data: {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.response",
            reference_id: 1234567,
            message: "OTP sent successfully",
          },
        },
      },
    },
  },
  eko: {
    id: "eko",
    label: "Eko",
    tagline: "PAN Lite, DigiLocker & verification APIs",
    docsUrl: "https://eps.eko.in/products/pan-verification-api",
    portalUrl: "https://portal.eko.in",
    signupUrl: "https://eko.in/partner-with-us",
    testBaseUrl: "https://staging.eko.in/ekoapi/v3",
    liveBaseUrl: "https://api.eko.in/ekoicici/v3",
    credentialFields: [
      {
        key: "developerKey",
        label: "Developer Key",
        placeholder: "Static developer_key header value",
        type: "text",
        required: true,
        icon: "key",
      },
      {
        key: "accessKey",
        label: "Access Key",
        placeholder: "Used to generate secret-key HMAC signature",
        type: "password",
        required: true,
        icon: "lock",
      },
      {
        key: "clientId",
        label: "Client ID",
        placeholder: "Optional client / partner identifier",
        type: "text",
        required: false,
        icon: "user",
      },
    ],
    credentialSetupSteps: [
      {
        title: "Apply as Eko partner",
        description:
          "Visit the Eko partner page and submit your business details. Eko reviews your application and then enables API access for your account.",
        tips: [
          "Mention that you need PAN / Aadhaar verification for customer onboarding.",
          "Approval time varies — you can prepare KhataBoss settings while waiting.",
        ],
        link: { label: "Apply on Eko website", url: "https://eko.in/partner-with-us" },
      },
      {
        title: "Finish partner onboarding",
        description:
          "Complete the agreement and document steps sent by Eko. You will receive partner portal login details by email once onboarding is approved.",
        tips: [
          "Save support contact details from Eko for quick help later.",
          "Ask Eko which KYC products are included in your plan.",
        ],
        link: { label: "Open Eko partner portal", url: "https://portal.eko.in" },
      },
      {
        title: "Activate KYC products",
        description:
          "Request PAN Lite, DigiLocker, or other verification APIs from your Eko account manager or from the product section in the partner portal.",
        tips: [
          "Confirm pricing per verification before going live.",
          "Ask for sandbox / UAT access for testing first.",
        ],
      },
      {
        title: "Copy Developer Key",
        description:
          "In the Eko API credentials area, find your Developer Key. This is a fixed value that KhataBoss sends with every verification request.",
        tips: [
          "Developer Key is not the same as Access Key — you need both.",
          "Paste it in the Developer Key field on this page.",
        ],
        mapsTo: ["developerKey"],
      },
      {
        title: "Copy Access Key",
        description:
          "Copy your Access Key from the same credentials page. KhataBoss uses it on the server side to sign requests securely (you do not need to calculate signatures manually).",
        tips: [
          "Treat Access Key like a password — do not share publicly.",
          "Paste it in the Access Key field and click Save settings.",
        ],
        mapsTo: ["accessKey"],
      },
      {
        title: "Add Client ID (if given)",
        description:
          "Some Eko partner accounts receive a Client ID. If Eko shared one with you, paste it in the Client ID field. If not, you can leave this blank.",
        tips: [
          "Check your Eko welcome email or partner dashboard profile.",
          "Optional — skip this step if Eko did not provide an ID.",
        ],
        mapsTo: ["clientId"],
      },
      {
        title: "Test, then go live",
        description:
          "Select Sandbox / UAT environment for testing. Use the Test API button on this page to try a sample verification. After Eko approves production, switch environment to Production.",
        tips: [
          "Run at least one successful test before adding real customers.",
          "Enable Start KYC verification = Yes only when tests pass.",
        ],
      },
    ],
    testApis: {
      pan: {
        id: "pan",
        label: "PAN Lite verification",
        method: "POST",
        path: "/tools/kyc/pan-lite",
        docsNote:
          "Signed request: developer_key, secret-key (HMAC), and timestamp headers. Body fields vary by Eko product version.",
        fields: [
          {
            key: "pan",
            label: "PAN",
            placeholder: "ABCDE1234F",
            required: true,
            sampleValue: "ABCDE1234F",
          },
          {
            key: "name",
            label: "Customer name",
            placeholder: "Name to match PAN",
            required: true,
            sampleValue: "Rajesh Kumar",
          },
        ],
        expectedResponse: {
          response_status_id: 0,
          status: 0,
          message: "Success",
          data: {
            pan: "ABCDE1234F",
            registered_name: "RAJESH KUMAR",
            name_match: true,
            pan_status: "VALID",
            category: "Individual",
          },
        },
      },
      aadhaar: {
        id: "aadhaar",
        label: "DigiLocker KYC init",
        method: "POST",
        path: "/tools/kyc/digilocker/init",
        docsNote:
          "Initiates DigiLocker flow; response includes redirect URL or session id for customer consent.",
        fields: [
          {
            key: "aadhaar",
            label: "Aadhaar number",
            placeholder: "123456789012",
            required: true,
            sampleValue: "123456789012",
          },
          {
            key: "mobile",
            label: "Mobile number",
            placeholder: "9876543210",
            required: true,
            sampleValue: "9876543210",
          },
        ],
        expectedResponse: {
          response_status_id: 0,
          status: 0,
          message: "DigiLocker session created",
          data: {
            request_id: "EKO-DL-20250101120000",
            redirect_url: "https://digilocker.gov.in/...",
            expires_in_seconds: 900,
          },
        },
      },
    },
  },
};

export const defaultKycSettings = () => ({
  kycEnabled: false,
  activeProvider: "sandbox",
  sandbox: {
    environment: "test",
    apiKey: "",
    apiSecret: "",
    apiVersion: "1.0",
    verificationReason: "Customer onboarding KYC verification for loan and finance compliance",
    baseUrl: KYC_PROVIDERS.sandbox.testBaseUrl,
  },
  eko: {
    environment: "sandbox",
    developerKey: "",
    accessKey: "",
    clientId: "",
    baseUrl: KYC_PROVIDERS.eko.testBaseUrl,
  },
});

export function loadKycSettings() {
  try {
    const raw = localStorage.getItem(KYC_STORAGE_KEY);
    if (!raw) return defaultKycSettings();
    const parsed = JSON.parse(raw);
    const defaults = defaultKycSettings();
    return {
      ...defaults,
      ...parsed,
      sandbox: { ...defaults.sandbox, ...(parsed.sandbox || {}) },
      eko: { ...defaults.eko, ...(parsed.eko || {}) },
    };
  } catch {
    return defaultKycSettings();
  }
}

export function saveKycSettings(settings) {
  localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(settings));
}

const MASK = "••••••••";

export function getDefaultTestFormValues(providerId, testType) {
  const api = KYC_PROVIDERS[providerId]?.testApis?.[testType];
  if (!api) return {};
  const values = {};
  api.fields?.forEach((field) => {
    values[field.key] = field.sampleValue ?? "";
  });
  return values;
}

export function getExpectedTestResponse(providerId, testType) {
  const api = KYC_PROVIDERS[providerId]?.testApis?.[testType];
  return api?.expectedResponse ? JSON.parse(JSON.stringify(api.expectedResponse)) : null;
}

export function buildTestRequestBody(providerId, testType, providerSettings, formValues) {
  const api = KYC_PROVIDERS[providerId]?.testApis?.[testType];
  if (!api) return null;

  const body = { ...formValues };

  if (providerId === "sandbox") {
    if (api.requestEntity) {
      body["@entity"] = api.requestEntity;
    }
    body.consent = "Y";
    const reason = providerSettings.verificationReason?.trim();
    if (reason) body.reason = reason;
  } else if (providerId === "eko") {
    if (providerSettings.clientId?.trim()) {
      body.client_id = providerSettings.clientId.trim();
    }
  }

  return body;
}

export function buildTestRequestPreview(providerId, testType, baseUrl, providerSettings, formValues) {
  const provider = KYC_PROVIDERS[providerId];
  const api = provider?.testApis?.[testType];
  if (!api) return null;

  const url = `${baseUrl.replace(/\/$/, "")}${api.path}`;
  const body = buildTestRequestBody(providerId, testType, providerSettings, formValues);

  const headers =
    providerId === "sandbox"
      ? {
          Authorization: "Bearer <access_token from Sandbox authenticate API>",
          "x-api-key": providerSettings.apiKey || "(not set)",
          "x-api-secret": providerSettings.apiSecret ? MASK : "(used server-side to obtain token)",
          "x-api-version": providerSettings.apiVersion || "1.0",
          "Content-Type": "application/json",
        }
      : {
          developer_key: providerSettings.developerKey || "(not set)",
          "secret-key": providerSettings.accessKey ? MASK : "(signed HMAC on server)",
          timestamp: String(Math.floor(Date.now() / 1000)),
          "Content-Type": "application/json",
        };

  return { method: api.method, url, headers, body };
}

export function credentialsReady(providerId, providerSettings) {
  if (providerId === "sandbox") {
    return Boolean(providerSettings.apiKey?.trim() && providerSettings.apiSecret?.trim());
  }
  return Boolean(providerSettings.developerKey?.trim() && providerSettings.accessKey?.trim());
}

/** Frontend-only mock until backend proxy is wired — mirrors provider doc shape */
export function mockTestApiResponse(providerId, testType, formValues, providerSettings) {
  const expected = getExpectedTestResponse(providerId, testType);
  const durationMs = 900 + Math.floor(Math.random() * 400);
  const now = Date.now();

  if (providerId === "sandbox" && expected) {
    const body = JSON.parse(JSON.stringify(expected));
    body.timestamp = now;
    body.transaction_id = `${body.transaction_id?.slice(0, 8) || "mock"}-${now.toString(36)}`;

    if (testType === "pan" && body.data) {
      body.data.pan = formValues.pan || body.data.pan;
    }
    if (testType === "aadhaar" && body.data) {
      body.data.reference_id = Math.floor(1000000 + Math.random() * 9000000);
    }

    return { ok: true, status: 200, durationMs, body, simulated: true };
  }

  if (providerId === "eko" && expected) {
    const body = JSON.parse(JSON.stringify(expected));
    if (testType === "pan" && body.data) {
      body.data.pan = formValues.pan || body.data.pan;
      body.data.registered_name = (formValues.name || body.data.registered_name).toUpperCase();
    }
    if (testType === "aadhaar" && body.data) {
      body.data.request_id = `EKO-DL-${now}`;
    }
    return { ok: true, status: 200, durationMs, body, simulated: true };
  }

  return {
    ok: true,
    status: 200,
    durationMs,
    body: { message: "No sample response configured", provider: providerId, testType },
    simulated: true,
  };
}
