// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { createSession, getSession } from "@/lib/auth";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key"
);

async function makeToken(payload: Record<string, unknown>, expiresIn: string | number = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

let mockSet: ReturnType<typeof vi.fn>;
let mockGet: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockSet = vi.fn();
  mockGet = vi.fn().mockReturnValue(undefined);
  vi.mocked(cookies).mockResolvedValue({ set: mockSet, get: mockGet } as any);
});

test("createSession sets the auth-token cookie", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [name] = mockSet.mock.calls[0];
  expect(name).toBe("auth-token");
});

test("createSession token contains userId and email", async () => {
  await createSession("user-1", "user@example.com");

  const [, token] = mockSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-1");
  expect(payload.email).toBe("user@example.com");
});

test("createSession cookie expires in approximately 7 days", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDays);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDays);
});

test("createSession sets httpOnly, sameSite, and path", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets secure:false outside production", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(false);
});

test("createSession sets secure:true in production", async () => {
  const original = process.env.NODE_ENV;
  // @ts-expect-error NODE_ENV is readonly but overridable in tests
  process.env.NODE_ENV = "production";

  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(true);

  // @ts-expect-error
  process.env.NODE_ENV = original;
});

// getSession

test("getSession returns null when no cookie is present", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const token = await makeToken({ userId: "user-1", email: "user@example.com" });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("user@example.com");
});

test("getSession returns null for a malformed token", async () => {
  mockGet.mockReturnValue({ value: "not.a.valid.jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const pastTimestamp = Math.floor(Date.now() / 1000) - 1;
  const token = await makeToken({ userId: "user-1", email: "user@example.com" }, pastTimestamp);
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});
