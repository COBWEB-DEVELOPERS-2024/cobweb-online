import React from 'react';

interface FoodColorPickerProps {
    selectedFoodColor: number;
    setSelectedFoodColor: (color: number) => void;
    foodMode: boolean;
}

const FoodColorPicker: React.FC<FoodColorPickerProps> = ({ selectedFoodColor, setSelectedFoodColor, foodMode }) => {
    const foodColors = [
        { id: 0, name: 'Red', color: '#ff0000' },      // matches renderer index 0
        { id: 1, name: 'Blue', color: '#0099ff' },     // matches renderer index 1  
        { id: 2, name: 'Yellow', color: '#ffcc00' },   // matches renderer index 2
        { id: 3, name: 'Green', color: '#00cc00' },    // matches renderer index 3
    ];

    if (!foodMode) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-yellow-500 w-48">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Food Color</h3>
            <div className="grid grid-cols-2 gap-2">
                {foodColors.map(color => (
                    <button
                        key={color.id}
                        onClick={() => setSelectedFoodColor(color.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            selectedFoodColor === color.id 
                                ? 'border-gray-800 shadow-md scale-105' 
                                : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                    >
                        <div className="text-white text-sm font-medium drop-shadow-lg">
                            {color.name}
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
                Selected: {foodColors.find(c => c.id === selectedFoodColor)?.name}
            </div>
        </div>
    );
};

export default FoodColorPicker;
