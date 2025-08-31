// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// เราจะกำหนดแค่ list ของหน้าที่ต้องการป้องกัน (Protected Routes) เท่านั้น
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/customers(.*)',
    '/sales(.*)',
    '/repairs(.*)',
    '/stock(.*)',
    '/reports(.*)',
    '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // ถ้า request ที่เข้ามาตรงกับหน้าที่เราต้องการป้องกัน, ก็สั่ง protect
  // หน้า public อื่นๆ (เช่น หน้าแรก) จะถูกปล่อยผ่านไปโดยอัตโนมัติเพราะไม่ได้อยู่ใน list นี้
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};