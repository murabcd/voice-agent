import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "30 s"),
  ephemeralCache: new Map(),
  prefix: "@upstash/ratelimit",
});

export default async function middleware(
  request: NextRequest
): Promise<Response | undefined> {
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/session",
};
