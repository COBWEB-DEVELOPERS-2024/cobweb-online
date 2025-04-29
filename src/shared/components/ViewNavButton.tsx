import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

const ViewNavButton: React.FC = () => {
    const [selectedViews, setSelectedViews] = React.useState(new Set(['text']));
    const dropdownItems = [
        {
            key: 'aiGraph',
            label: 'AI Graph',
            action: () => {console.log("replace with function to activate AI Graph");},
        },
        {
            key: 'discretizedGravity',
            label: 'Discretized Gravity',
            action: () => {console.log("replace with function to activate Discretized Gravity");},
        },
        {
            key: 'energy',
            label: 'Energy',
            action: () => {console.log("replace with function to activate Energy");},
        },
        {
            key: 'geneticAlgorithmChart',
            label: 'Genetic Algorithm Chart',
            action: () => {console.log("replace with function to activate Genetic Algorithm Chart");},
        },
        {
            key: 'productionValue',
            label: 'Production Value',
            action: () => {console.log("replace with function to activate Production Value");},
        },
        {
            key: 'regionalStats',
            label: 'Regional Stats',
            action: () => {console.log("replace with function to activate Regional Stats");},
        },
    ];

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button className='text-base bg-white text-emerald-800'>
                    View
                </Button>
            </DropdownTrigger>
            <DropdownMenu closeOnSelect={false} selectedKeys={selectedViews} selectionMode='multiple' onSelectionChange={setSelectedViews}>
                {dropdownItems.map(item => (
                    <DropdownItem key={item.key} onPress={item.action}>
                        {item.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}

export default ViewNavButton;
