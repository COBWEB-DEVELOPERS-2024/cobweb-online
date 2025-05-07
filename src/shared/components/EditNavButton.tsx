import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

const EditNavButton: React.FC = () => {
    const dropdownItems = [
        {
            key: 'togglePlaceStonesMode',
            label: 'Toggle Place Stones Mode',
            action: () => {console.log("Edit nav clicked: placeStones");},
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
