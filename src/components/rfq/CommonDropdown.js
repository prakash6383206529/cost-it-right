import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const CustomCellRenderer = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const { value } = props; // This will be the PartNumber
    const categories = value ? value.split(',') : []; // Handle undefined value
    const categoryCount = categories.length;
    const hiddenCategories = categories.slice(1); // All except the first one
    const handleDropdownItemClick = (category) => {

        // Handle the click event for each category
    };

    return (
        <div className="custom-cell-renderer d-flex ">
            {categoryCount > 0 && (
                <span className='pr-3'>{categories[0]}</span>
            )}
            {categoryCount > 1 && (

                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                    <DropdownToggle caret={false} className="rfq-part-no-dropdown mt-2">
                        +{categoryCount - 1} more
                    </DropdownToggle>
                    <DropdownMenu container="body" className="hl-cat-menu">
                        {hiddenCategories.map((category, index) => (
                            <DropdownItem
                                key={index}
                                className="hl-cat-menu-item"
                                onClick={() => handleDropdownItemClick(category)}
                            >
                                {category}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            )}
        </div>
    );
};

export default CustomCellRenderer;
