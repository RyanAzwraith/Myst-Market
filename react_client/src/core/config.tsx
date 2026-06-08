const env = import.meta.env

function Evar(
  name: Extract<keyof ImportMetaEnv, string>,
  required: boolean = true, 
  defaultValue?: string,
): [string, string] {
    const value = env[name] ?? defaultValue

    if (required && value == null) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return [name, value ?? ""]
}

const configEntries  = [
    Evar("VITE_LAUNCH_TYPE", false,"DEV"),
    Evar("VITE_SERVER_URL")
] 

export const config = Object.fromEntries(
    configEntries
) as Record<string, string>

export type Config = typeof config