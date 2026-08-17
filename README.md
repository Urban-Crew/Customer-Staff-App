# ub

pnpm + Turborepo monorepo with two Expo apps and shared packages.

## Structure

```
apps/
  customer/       Expo app (customer-facing) — expo-router, TanStack Query, Zustand
  admin/          Expo app (admin-facing)     — same stack as customer
packages/
  shared-types/   @ub/shared-types  — types shared across apps and API
  api-client/     @ub/api-client    — axios instance factory with auth interceptors
  ui/             @ub/ui            — shared React Native components (Badge, Button, ...)
```

Internal packages are consumed straight from TypeScript source (`main`/`types` point at
`src/index.ts`) — Metro/Babel transpile them on the fly, so there's no build step to run
before using them from an app.

### Each app

```
app/
  _layout.tsx     Root layout — GestureHandlerRootView, SafeAreaProvider,
                  QueryClientProvider, Stack, splash-screen gating on auth hydration
  index.tsx       Home route
lib/
  apiClient.ts    @ub/api-client wired to this app's SecureStore-backed token storage
  tokenStorage.ts TokenStorage implementation using expo-secure-store
  queryClient.ts  Shared TanStack QueryClient instance
  store/
    authStore.ts  Zustand auth store (hydrate/login/logout)
babel.config.js  babel-preset-expo + react-native-worklets/plugin (must stay last)
```

Routing is file-based via [expo-router](https://docs.expo.dev/router/introduction/) —
add new screens by adding files under `app/`.

## Requirements

- Node >= 20
- pnpm (see `packageManager` in [package.json](package.json))

## Getting started

```bash
pnpm install

# run one app
pnpm --filter @ub/customer start
pnpm --filter @ub/admin start

# run every app's dev/start script via turbo
pnpm dev
```

## Scripts (root)

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `pnpm dev` / `start` | `turbo run start` — runs `expo start` in each app |
| `pnpm build`         | `turbo run build`                                 |
| `pnpm lint`          | `turbo run lint` (currently `tsc --noEmit`)       |
| `pnpm typecheck`     | `turbo run typecheck`                             |
| `pnpm format`        | Prettier write across the repo                    |
| `pnpm format:check`  | Prettier check (used in CI)                       |

## Tooling

- **pnpm workspaces** — see [pnpm-workspace.yaml](pnpm-workspace.yaml). `.npmrc` sets
  `node-linker=hoisted` so Metro's resolver (which doesn't follow pnpm's symlinked
  `node_modules`) sees a flat, npm/yarn-classic-style tree.
- **Turborepo** — task graph/caching, see [turbo.json](turbo.json).
- **Prettier** — see [.prettierrc.json](.prettierrc.json).
- **Husky + lint-staged** — a pre-commit hook (`.husky/pre-commit`) runs `lint-staged`,
  which Prettier-formats staged files before they're committed.

## Expo essentials installed in each app

Installed with `npx expo install` so versions stay aligned with the Expo SDK:

- **expo-router** — file-based navigation (entry point is `expo-router/entry`,
  `app.json` has `"scheme"` + `"plugins": ["expo-router"]` + typed routes enabled)
- **react-native-safe-area-context**, **react-native-screens** — required by expo-router
- **react-native-gesture-handler**, **react-native-reanimated** (+ **react-native-worklets**,
  its v4 peer) — gesture/animation primitives most navigators and interactions need
- **expo-constants**, **expo-linking** — app config access, deep link parsing
- **expo-splash-screen**, **expo-font** — controlled splash screen (kept visible until
  auth state hydrates in `app/_layout.tsx`), font loading
- **expo-secure-store** — encrypted key/value storage, backs `lib/tokenStorage.ts`
- **@react-native-async-storage/async-storage** — general-purpose persistence (available
  for React Query persistence, Zustand `persist` middleware, etc. — not wired up by
  default so you can opt in deliberately)
- **react-native-svg** (both apps) — SVG rendering; also what `lucide-react-native` renders
  icons with
- **lucide-react-native** (both apps) — [Lucide](https://lucide.dev) icon set, e.g.
  `import { Sparkles } from 'lucide-react-native'`
- **react-native-animated-glow** (customer only) — GPU-powered animated glow/border
  effect built on Skia + Reanimated; see `app/index.tsx` for a minimal `AnimatedGlow` usage
- **@shopify/react-native-skia** (customer only) — peer dependency of
  `react-native-animated-glow`. Its postinstall downloads prebuilt Skia binaries, which is
  why `pnpm-workspace.yaml` has `allowBuilds: { '@shopify/react-native-skia': true }`
- **expo-dev-client** (both apps) — required once any native module isn't in Expo Go
  (true here: skia, worklets, etc.). `pnpm start` now opens a custom dev client build
  instead of Expo Go; use `pnpm start:go` to fall back to plain Expo Go for a quick check
  that doesn't need any custom native code (breaks for screens using skia/animated-glow).
  Build a dev client with `eas build --profile development` (see `apps/admin/eas.json`).
- **react-native-keyboard-controller** (both apps) — better keyboard-avoiding behavior
  than the built-in `KeyboardAvoidingView`. `<KeyboardProvider>` wraps the app in
  `app/_layout.tsx`; use its `KeyboardAvoidingView`/`useKeyboardAnimation` etc. in screens
  with text inputs.
- **@lodev09/react-native-true-sheet** (both apps) — fully native bottom sheet (Fabric,
  requires New Architecture — on by default on RN 0.81+/Expo SDK 54+, which we're on).
  `app/index.tsx` has a minimal `<TrueSheet ref={...} detents={[...]}>` + `present()`/
  `dismiss()` demo in both apps.

## `@ub/api-client`

`createApiClient(config)` returns a configured axios instance:

- **Request interceptor** attaches `Authorization: Bearer <accessToken>` from a
  pluggable `TokenStorage`.
- **Response interceptor** catches `401`s, refreshes the token via your supplied
  `refreshTokens(refreshToken)` function (de-duped so concurrent 401s share one refresh
  call), retries the original request once, and calls `onAuthFailure` if refresh fails.

Each app's `lib/apiClient.ts` wires this to `lib/tokenStorage.ts` (expo-secure-store) and
exposes `setAuthFailureListener`, which `lib/store/authStore.ts` uses to log the user out
when a refresh ultimately fails — kept as a listener instead of a direct import to avoid
a circular dependency between the client and the store.

## `@ub/ui`

Shared React Native primitives, consumed straight from source like the other internal
packages. `react`/`react-native` are `peerDependencies` (each app supplies its own copy)
so nothing gets duplicated in the bundle.

- `Badge` — icon + label pill, e.g. `<Badge icon={<Sparkles />} label="Customer app" />`
  (used in both apps' `app/index.tsx`)
- `Button` — `primary`/`secondary` pressable button

## `@ub/shared-types`

Shared `ApiResponse`/`Paginated` envelopes plus auth (`AuthUser`, `AuthTokens`,
`UserRole`, `LoginRequest`/`LoginResponse`) and domain (`Order`, `Customer`) types used by
both apps and, presumably, the backend.

## TanStack Query + Zustand

- `lib/queryClient.ts` exports one `QueryClient` per app, provided via
  `QueryClientProvider` in `app/_layout.tsx`. Use `useQuery`/`useMutation` with
  `apiClient` as the fetcher.
- `lib/store/authStore.ts` is a Zustand store (`useAuthStore`) holding `user`,
  `isAuthenticated`, and `isHydrating`, with `hydrate`/`login`/`logout` actions. It's the
  pattern to copy for any other client-only UI state.
