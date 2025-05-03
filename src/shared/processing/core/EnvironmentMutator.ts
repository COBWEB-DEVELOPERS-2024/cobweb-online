export interface EnvironmentMutator {
    update(): void;
    loadNew(): void;
}
