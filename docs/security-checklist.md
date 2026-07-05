# Security Checklist

- [x] Better Auth with secure session tokens
- [x] Password hashing via bcrypt
- [x] Environment validation with Zod
- [x] Multi-tenant data isolation (dealershipId scoping)
- [x] Soft deletes preserve audit trail
- [x] Activity logging on mutations
- [x] Role-based permissions (ADMIN, MANAGER, SALESPERSON)
- [ ] Rate limiting on auth endpoints (add in production)
- [ ] CSRF protection (Better Auth handles)
- [ ] Input sanitization on all API routes
- [ ] File upload size limits (10mb in next.config)
- [ ] HTTPS enforced in production
- [ ] Secrets in environment variables only
- [ ] OAuth redirect URI validation
