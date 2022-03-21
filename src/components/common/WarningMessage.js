import React from 'react';
import { text } from 'react-dom-factories';
import { Container } from 'reactstrap'
import warningImg from '../../assests/images/exclamation.png';

const WarningMessage = ({ message, dClass, textClass }) => (
    <>
        <div className={`text-warning d-inline-flex warning-row align-items-center ${dClass}`}>
            <img alt={''} src={warningImg} />
            <span className={`d-inline-block pl-1 ${textClass}`}>{message}</span>
        </div>
    </>
);


export default WarningMessage;