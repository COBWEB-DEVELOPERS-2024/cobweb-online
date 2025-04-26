export class GridCellSizer {
    static findBestCellSize(gridWidth, gridHeight, canvasWidth, canvasHeight) {
        const cellWidth = canvasWidth / gridWidth;
        const cellHeight = canvasHeight / gridHeight;
        return Math.min(cellWidth, cellHeight);
    }
}
