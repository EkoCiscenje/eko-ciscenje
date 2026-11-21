const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export class TurnstileConfigurationError extends Error {
  constructor() {
    super("Turnstile runtime configuration is incomplete.");
    this.name = "TurnstileConfigurationError";
  }
}

export async function verifyTurnstile(
  token,
  env,
  remoteIp,
  fetcher = fetch,
) {
  const secret = env.TURNSTILE_SECRET;
  const hostnames = String(env.TURNSTILE_HOSTNAMES || "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  if (!secret || hostnames.length === 0) {
    throw new TurnstileConfigurationError();
  }

  if (typeof token !== "string" || !token.trim()) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetcher(SITEVERIFY_URL, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error(`Turnstile Siteverify returned HTTP ${response.status}.`);
  }

  const result = await response.json();
  return (
    result.success === true &&
    typeof result.hostname === "string" &&
    hostnames.includes(result.hostname.trim().toLowerCase())
  );
}
