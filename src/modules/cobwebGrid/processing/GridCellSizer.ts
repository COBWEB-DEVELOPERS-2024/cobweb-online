export class GridCellSizer {
    static findBestCellSize(
        gridWidth: number,
        gridHeight: number,
        canvasWidth: number,
        canvasHeight: number
    ): number {
        const cellWidth = canvasWidth / gridWidth;
        const cellHeight = canvasHeight / gridHeight;
        return Math.min(cellWidth, cellHeight);
    }
}
