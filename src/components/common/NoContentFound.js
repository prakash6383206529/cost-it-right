import React from 'react';
import { Container } from 'reactstrap'

const NoContentFound = ({ title}) => (
    <Container>
        <div className="text-center nodate-section">
            <img src={require('../assets/images/no-record.png')} />
            <div className="my-2">
                <h5>{title}</h5>
            </div> 
        </div>      
    </Container>
);


export default NoContentFound;