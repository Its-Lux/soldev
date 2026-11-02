/**
 * Per-route flags read by the app shell. Set them on a route with
 * `staticData: { ... }`; TypeScript checks the names and types.
 */
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /**
     * The page fills the window under the floating navbar: no top padding,
     * no footer, no page scroll. Used by full-screen map pages.
     */
    fullBleed?: boolean
  }
}

export {}
