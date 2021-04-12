import React from 'react';
import { Container } from 'reactstrap'

const WarningMessage = ({ message }) => (
    <>
        <div className="text-warning d-flex warning-row col-md-12 align-items-center">
            <img alt={''} src={require('../../assests/images/exclamation.png')} />
            <span className="d-inline-block pl-2">{message}</span>
        </div>
    </>
);


export default WarningMessage;