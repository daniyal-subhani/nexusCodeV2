- [ Client Request ]
  │
  ▼
  ┌─────────────────────────┐
  │ API GATEWAY │ ➔ Rate

                               Limiting,   Central Authentication, Routing

  └──────────┬──────────────┘
  │ (Internal Network Call with x-internal-token & x-user-id)
  ▼
  ┌─────────────────────────┐
  │ USER SERVICE │
  ├─────────────────────────┤
  │ 1. internalAuthCheck() │ ➔ Gateway verify: Direct internal bypass block!
  │ 2. validateRequest() │ ➔ Domain Payload check (Zod)
  │ 3. asyncHandler() │ ➔ Async error handling safety
  └─────────────────────────┘
