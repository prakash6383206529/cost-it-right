import React from 'react';
import { Container } from 'reactstrap'

const WarningMessage = ({ message }) => (
    <Container>
        <div className="text-help">
            {/* <img alt={''} src={require('../../assests/images/no-record.png')} /> */}
            <div className="my-2">
                {message}
            </div>
        </div>
    </Container>
);


export default WarningMessage;