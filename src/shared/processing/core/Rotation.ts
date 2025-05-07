export const Rotation = {
    None: 'None',
    Right: 'Right',
    UTurn: 'UTurn',
    Left: 'Left'
} as const;

export type Rotation = typeof Rotation[keyof typeof Rotation];
