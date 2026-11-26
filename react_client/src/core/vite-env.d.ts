interface ImportMetaEnv {
    readonly MODE: string
    readonly VITE_LAUNCH_TYPE: string
    readonly VITE_SERVER_URL: string
    readonly VITE_SERVER_IMPLEMENTATION: string
    readonly VITE_STRIPE_PUBLIC_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}