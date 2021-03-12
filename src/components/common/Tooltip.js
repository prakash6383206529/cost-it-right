import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

const TooltipCustom = (props) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const toggle = () => setTooltipOpen(!tooltipOpen);

    return (
        <>
            <i class="fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3" id="tooltip_custom"></i>
            <Tooltip placement="top" isOpen={tooltipOpen} target="tooltip_custom" toggle={toggle}>Description text for tooltip</Tooltip>
        </>
    );
}

export default TooltipCustom;