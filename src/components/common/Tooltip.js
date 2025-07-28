import React, { useState } from 'react';
import { useEffect } from 'react';
import { Tooltip } from 'reactstrap';

const TooltipCustom = (props) => {
    const { tooltipText, customClass, tooltipClass, id, disabledIcon, placement, width } = props;
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const tooltipStyle = {
        minWidth: width || 'auto'
    };

    return (
        <>
            {!disabledIcon && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ${customClass || ''}`} id={id}></i>}
            <Tooltip style={tooltipStyle} className={tooltipClass} placement={placement || "top"} isOpen={tooltipOpen} target={id} toggle={toggle}>{tooltipText}</Tooltip>
        </>
    );
}

export default TooltipCustom;