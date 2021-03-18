import React, { useEffect, useState } from 'react';
import { Tooltip } from 'reactstrap';

const TooltipCustom = (props) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);
    const [nu_id, setNu_id] = useState("");
    let u_id;

    useEffect(() => {
        u_id = Math.floor(Math.random() * 101);
        setNu_id(u_id);
    }, [])

    return (
        <>
            <i class="fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3" id={`A_${nu_id}_A`}></i>
            <Tooltip placement="top" isOpen={tooltipOpen} target={`A_${nu_id}_A`} toggle={toggle}>Description text for tooltip</Tooltip>
        </>
    );
}

export default TooltipCustom;