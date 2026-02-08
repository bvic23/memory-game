export const getCssToken = <T>(token: string, transformer: (value: string) => T) => transformer(getComputedStyle(document.documentElement).getPropertyValue(token));

export const msTransformer = (value: string) => Number(value.replace("ms", ""));