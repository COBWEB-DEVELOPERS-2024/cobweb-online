import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

interface EditNavButtonProps {
    foodMode: boolean;
    toggleFoodMode: () => void;
    placeStonesMode: boolean;
    onTogglePlaceStonesMode: () => void; 
    removeAllFood: boolean;
    setRemoveAllFood: (b: boolean) => void;
    removeAllStones: boolean;
    setRemoveAllStones: (b: boolean) => void;
    removeAllAgents: boolean;
    setRemoveAllAgents: (b: boolean) => void;
    removeAllWaste: boolean;
    setRemoveAllWaste: (b: boolean) => void;
    removeAll: boolean;
    setRemoveAll: (b: boolean) => void;
    moveAgentsMode: boolean;
    toggleMoveAgentsMode: () => void;
    moveFoodMode: boolean;
    toggleMoveFoodMode: () => void;
}

const EditNavButton: React.FC<EditNavButtonProps> = ({ 
    foodMode, 
    toggleFoodMode, placeStonesMode, onTogglePlaceStonesMode, 
    setRemoveAllFood, setRemoveAllStones, setRemoveAllAgents, setRemoveAllWaste, setRemoveAll,toggleMoveAgentsMode, toggleMoveFoodMode, moveAgentsMode, moveFoodMode
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
            action: () => {
                setRemoveAllStones(true);
                console.log("File nav clicked: removeAllStones");
            },
        },
        {
            key: 'removeAllFood',
            label: 'Remove All Food',
            action: () => {
                setRemoveAllFood(true);
                console.log("File nav clicked: removeAllFood");},
        },
        {
            key: 'removeAllAgents',
            label: 'Remove All Agents',
            action: () => {
                setRemoveAllAgents(true);
                console.log("File nav clicked: removeAllAgents");},
        },
        {
            key: 'removeAllWaste',
            label: 'Remove All Waste',
            action: () => {
                setRemoveAllWaste(true);
                console.log("File nav clicked: removeAllWaste");},
        },
        {
            key: 'removeAll',
            label: 'Remove All',
            action: () => {
                setRemoveAll(true);
                console.log("File nav clicked: removeAll");},
        },
        {
            key: 'toggleMoveAgentsMode',
            label: moveAgentsMode ? 'Disable Move Agents' : 'Enable Move Agents',
            action: () => {
            toggleMoveAgentsMode();
            console.log("Edit nav clicked: toggleMoveAgentsMode");
            }
        },
        {
        key: 'toggleMoveFoodMode',
        label: moveFoodMode ? 'Disable Move Food' : 'Enable Move Food',
        action: () => {
            toggleMoveFoodMode();
            console.log("Edit nav clicked: toggleMoveFoodMode");
        }
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
