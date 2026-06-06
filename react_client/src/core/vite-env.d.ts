interface ImportMetaEnv {
    readonly VITE_LAUNCH_TYPE: string
    readonly VITE_SERVER_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}