import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

// Props for the EditNavButton component
interface EditNavButtonProps {
    placeStonesMode: boolean;
    onTogglePlaceStonesMode: () => void;  
}

const EditNavButton: React.FC<EditNavButtonProps> = ({placeStonesMode,onTogglePlaceStonesMode}) => {
    const dropdownItems = [
        {
            key: 'togglePlaceStonesMode',
            label: placeStonesMode ? 'Disable Place Stones Mode' : 'Enable Place Stones Mode', // Dynamic label based on state
            action: () => {onTogglePlaceStonesMode(); console.log("File nav clicked: togglePlaceStonesMode");} 
        },
        {
            key: 'removeAllStones',
            label: 'Remove All Stones',
            action: () => {console.log("File nav clicked: removeAllStones");},
        },
        {
            key: 'removeAllFood',
            label: 'Remove All Food',
            action: () => {console.log("File nav clicked: removeAllFood");},
        },
        {
            key: 'removeAllAgents',
            label: 'Remove All Agents',
            action: () => {console.log("File nav clicked: removeAllAgents");},
        },
        {
            key: 'removeAllWaste',
            label: 'Remove All Waste',
            action: () => {console.log("File nav clicked: removeAllWaste");},
        },
        {
            key: 'removeAll',
            label: 'Remove All',
            action: () => {console.log("File nav clicked: removeAll");},
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
