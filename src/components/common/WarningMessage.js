import React from 'react';
import { Container } from 'reactstrap'

const WarningMessage = ({ message,dClass }) => (
    <>
        <div className={`text-warning d-inline-flex warning-row align-items-center ${dClass}`}>
            <img alt={''} src={require('../../assests/images/exclamation.png')} />
            <span className="d-inline-block pl-1">{message}</span>
        </div>
    </>
);


export default WarningMessage;