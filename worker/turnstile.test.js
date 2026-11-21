import assert from "node:assert/strict";
import test from "node:test";
import { verifyTurnstile } from "./turnstile.js";

const env = {
  TURNSTILE_SECRET: "test-secret",
  TURNSTILE_HOSTNAMES: "example.com, www.example.com",
};

function siteverifyResponse(result) {
  return new Response(JSON.stringify(result), { status: 200 });
}

test("accepts a verified token from an allowed hostname", async () => {
  let submitted;
  const verified = await verifyTurnstile(
    "valid-token",
    env,
    "192.0.2.1",
    async (url, options) => {
      submitted = { url, body: options.body };
      return siteverifyResponse({
        success: true,
        hostname: "www.example.com",
      });
    },
  );

  assert.equal(verified, true);
  assert.equal(
    submitted.url,
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  );
  assert.equal(submitted.body.get("secret"), "test-secret");
  assert.equal(submitted.body.get("response"), "valid-token");
  assert.equal(submitted.body.get("remoteip"), "192.0.2.1");
});

test("rejects unsuccessful tokens and hostnames outside the allowlist", async () => {
  const reject = async (result) =>
    verifyTurnstile("token", env, undefined, async () =>
      siteverifyResponse(result),
    );

  assert.equal(await reject({ success: false }), false);
  assert.equal(
    await reject({ success: true, hostname: "attacker.example" }),
    false,
  );
  assert.equal(await reject({ success: true }), false);
});

test("rejects missing tokens without calling Siteverify", async () => {
  let called = false;
  const verified = await verifyTurnstile("", env, undefined, async () => {
    called = true;
    return siteverifyResponse({ success: true, hostname: "example.com" });
  });

  assert.equal(verified, false);
  assert.equal(called, false);
});

test("requires both runtime settings", async () => {
  await assert.rejects(
    verifyTurnstile("token", { TURNSTILE_SECRET: "test-secret" }),
    /runtime configuration is incomplete/,
  );
});
