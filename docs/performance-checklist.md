# Performance Checklist

- [x] Next.js 16 Turbopack for dev
- [x] Standalone output for Docker
- [x] Database indexes on hot query paths
- [x] React Query for client-side caching
- [x] Server components for data fetching
- [x] Optimistic updates on mutations
- [ ] PPR / Cache Components (enable when stable)
- [ ] Image optimization via next/image
- [ ] Redis caching layer for hot reads
- [ ] Connection pooling via pg Pool
- [ ] Lazy loading for heavy components
- [ ] Bundle analysis in CI

## Targets

- LCP < 2.5s
- FID < 100ms
- Customer search < 200ms
- Deal brief generation < 1s (dev provider)
