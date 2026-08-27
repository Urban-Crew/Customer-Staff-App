/**
 * Local stand-in for the email endpoint, which doesn't exist server-side yet.
 * (Phone/OTP and location now hit the real backend — see
 * services/otp.service.ts and services/location.service.ts.) Swap this for a
 * real API call once its backend endpoint ships.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockAddEmail(): Promise<void> {
  await delay(500);
}
