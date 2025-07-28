import React from 'react';
import warningImg from '../../assests/images/exclamation.png';

const WarningMessage = ({ message = '', dClass = '', textClass = '', title = '' }) => {
    const ShowTitle = title || '';
    return (
        <>
            <div className={`text-warning d-inline-flex warning-row align-items-center ${dClass || ''}`}>
                <img alt={''} src={warningImg} />
                <span title={ShowTitle} className={`d-inline-block pl-1 ${textClass || ''}`}>{message || ''}</span>
            </div>
        </>
    );
}
WarningMessage.defaultProps = {
    dClass: '',
    message: '',
    title: ''
}

export default WarningMessage;