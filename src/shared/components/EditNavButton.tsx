import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

interface EditNavButtonProps {
    foodMode: boolean;
    toggleFoodMode: () => void;
    placeStonesMode: boolean;
    onTogglePlaceStonesMode: () => void; 
    setRemoveAllFood: (value: boolean) => void;
    setRemoveAllStones: (value: boolean) => void;
    setRemoveAllAgents: (value: boolean) => void;
    setRemoveAllWaste: (value: boolean) => void;
    setRemoveAll: (value: boolean) => void;
}

const EditNavButton: React.FC<EditNavButtonProps> = ({ 
    foodMode, 
    toggleFoodMode,
    placeStonesMode, 
    onTogglePlaceStonesMode, 
    setRemoveAllFood,
    setRemoveAllStones,
    setRemoveAllAgents,
    setRemoveAllWaste,
    setRemoveAll
}) => {
    const dropdownItems = [
        {
            key: 'toggleFoodMode',
            label: foodMode ? 'Exit Food Mode' : 'Toggle Add Food Mode',
            action: toggleFoodMode,
        },
        {
            key: 'togglePlaceStonesMode',
            label: placeStonesMode ? 'Disable Place Stones Mode' : 'Enable Place Stones Mode', // Dynamic label based on state
            action: () => {onTogglePlaceStonesMode(); console.log("File nav clicked: togglePlaceStonesMode");} 
        },
        {
            key: 'removeAllStones',
            label: 'Remove All Stones',
            action: () => {setRemoveAllStones(true); console.log("File nav clicked: removeAllStones");},
        },
        {
            key: 'removeAllFood',
            label: 'Remove All Food',
            action: () => {setRemoveAllFood(true); console.log("File nav clicked: removeAllFood");},
        },
        {
            key: 'removeAllAgents',
            label: 'Remove All Agents',
            action: () => {setRemoveAllAgents(true); console.log("File nav clicked: removeAllAgents");},
        },
        {
            key: 'removeAllWaste',
            label: 'Remove All Waste',
            action: () => {setRemoveAllWaste(true); console.log("File nav clicked: removeAllWaste");},
        },
        {
            key: 'removeAll',
            label: 'Remove All',
            action: () => {setRemoveAll(true); console.log("File nav clicked: removeAll");},
        },
    ];

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button className='text-base bg-white text-emerald-800'>
                    Edit
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

export default EditNavButton;
