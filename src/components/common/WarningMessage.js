import React from 'react';
import { Container } from 'reactstrap'
import exclamtionImage from '../../assests/images/exclamation.png'

const WarningMessage = ({ message,dClass }) => (
    <>
        <div className={`text-warning d-inline-flex warning-row align-items-center ${dClass}`}>
            <img alt={''} src={exclamtionImage} />
            <span className="d-inline-block pl-1">{message}</span>
        </div>
    </>
);


export default WarningMessage;