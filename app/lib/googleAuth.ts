import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type GoogleCredentials = {
  serviceEmail: string;
  privateKey: string;
  calendarId: string;
};

type ServiceAccountFile = {
  client_email?: string;
  private_key?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
};

function toBase64Url(input: string | Buffer) {
  const source = Buffer.isBuffer(input)
    ? input.toString("base64")
    : Buffer.from(input).toString("base64");
  return source.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function buildServiceJwt(serviceEmail: string, privateKey: string, scope: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3500,
  };

  const unsigned = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(
    JSON.stringify(payload)
  )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(privateKey));
  return `${unsigned}.${toBase64Url(signature)}`;
}

export async function loadGoogleCredentials(): Promise<GoogleCredentials | null> {
  const calendarId = (process.env.GOOGLE_CALENDAR_ID || "").trim();
  if (!calendarId) return null;

  const envEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const envKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").trim();
  if (envEmail && envKey) {
    return {
      serviceEmail: envEmail,
      privateKey: envKey,
      calendarId,
    };
  }

  const explicitJsonPath = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH || "").trim();
  const candidatePaths = [
    explicitJsonPath,
    "autoshine-486820-75698831dde5.json",
    "service-account.json",
    "google-service-account.json",
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    const absolute = path.isAbsolute(candidate)
      ? candidate
      : path.join(process.cwd(), candidate);
    try {
      const raw = await readFile(absolute, "utf-8");
      const parsed = JSON.parse(raw) as ServiceAccountFile;
      if (parsed.client_email && parsed.private_key) {
        return {
          serviceEmail: parsed.client_email,
          privateKey: parsed.private_key,
          calendarId,
        };
      }
    } catch {
      // Try next candidate path.
    }
  }

  return null;
}

export async function getGoogleAccessToken(
  credentials: GoogleCredentials,
  scope: string
): Promise<string> {
  const assertion = buildServiceJwt(
    credentials.serviceEmail,
    credentials.privateKey,
    scope
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || "Erreur d'authentification Google.");
  }

  const data = (await response.json()) as GoogleTokenResponse;
  if (!data.access_token) {
    throw new Error("Token Google manquant.");
  }

  return data.access_token;
}
