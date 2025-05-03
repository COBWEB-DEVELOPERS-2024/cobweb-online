export class ComplexEnvironmentParams {
    width: number;
    height: number;
    wrapMap: boolean;
    initialStones: number;

    constructor() {
        this.width = 80;
        this.height = 80;
        this.wrapMap = true;
        this.initialStones = 10;
    }
}
