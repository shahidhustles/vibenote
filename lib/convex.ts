import { ConvexHttpClient } from "convex/browser";

// For server-side operations (API routes, server components)
export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default convex;
