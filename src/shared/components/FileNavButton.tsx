import React from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";

const FileNavButton: React.FC = () => {
    const dropdownItems = [
        {
            key: 'open',
            label: 'Open',
            action: () => {console.log("File nav clicked: open");},
        },
        {
            key: 'save',
            label: 'Save',
            action: () => {console.log("File nav clicked: save");},
        },
        {
            key: 'reset',
            label: 'Reset to default',
            action: () => {console.log("File nav clicked: reset");},
        },
    ];

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button className='text-base bg-white text-emerald-800'>
                    File
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

export default FileNavButton;
