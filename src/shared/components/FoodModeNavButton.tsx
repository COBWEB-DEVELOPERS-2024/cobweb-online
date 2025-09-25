import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

interface FoodModeNavButtonProps {
    foodMode: boolean;
    selectedFoodColor: number;
    setSelectedFoodColor: (color: number) => void;
}

const FoodModeNavButton: React.FC<FoodModeNavButtonProps> = ({ foodMode, selectedFoodColor, setSelectedFoodColor }) => {
    const dropdownItems = [
        {
            key: 'RedFood',
            label: <span className="text-red-600">
                {selectedFoodColor === 0 ? 'Placing Red Food' : 'Place Red Food'}
                </span>,
            // TODO: make the color aaccurate to whatever the food color is
            action: () => setSelectedFoodColor(0) // assuming 0 is the index for red food,
        },
        {
            key: 'BlueFood',
            label: <span className="text-blue-600">
                {selectedFoodColor === 1 ? 'Placing Blue Food' : 'Place Blue Food'}
                </span>,
            action: () => setSelectedFoodColor(1) // assuming 1 is the index for green food
        },
        {
            key: 'YellowFood',
            label: <span className="text-yellow-600">
                {selectedFoodColor === 2 ? 'Placing Yellow Food' : 'Place Yellow Food'}
                </span>,
            action: () => setSelectedFoodColor(2) // assuming 2 is the index for yellow food
        },
        {
            key: 'GreenFood',
            label: <span className="text-green-600">
                {selectedFoodColor === 3 ? 'Placing Green Food' : 'Place Green Food'}
                </span>,
            action: () => setSelectedFoodColor(3) // assuming 3 is the index for green food
        }
    ];

    return (
        <Dropdown isOpen={foodMode} placement="bottom-end" closeOnSelect={true}>
            <DropdownTrigger>
                <Button className='text-base bg-white text-emerald-800'>
                    Add Food Mode
                </Button>
            </DropdownTrigger>
            <DropdownMenu>
                {dropdownItems.map(item => (
                    <DropdownItem key={item.key} onPress={item.action}>
                        {item.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}

export default FoodModeNavButton;
