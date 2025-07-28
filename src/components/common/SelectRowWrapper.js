import React from 'react';

const SelectRowWrapper = ({ dataCount, className }) => {
    return (
        <div className={`selection-wrapper ${className || ''}`}>Selected rows: <span>{dataCount > 0 ? dataCount : 0}</span></div>
    );
}

export default SelectRowWrapper;