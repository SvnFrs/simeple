import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JWTPayload } from "../utils/jwt.utils";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Raw cookie header
req.headers.cookie // "token=eyJhbGc...; sessionId=abc123"
// You'd need to manually parse this string
```

**With cookieParser:**
```ts
req.cookies // { token: "eyJhbGc...", sessionId: "abc123" }
// Clean, parsed object ready to use

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token", error: error });
  }
};
