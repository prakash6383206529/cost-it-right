import React from 'react';
import { Container } from 'reactstrap'
import img from '../../assests/images/no-record.png'

const NoContentFound = ({ title }) => (
    <Container>
        <div className="text-center nodate-section">
            <img alt={''} src={img} />
            <div className="my-2">
                <h5>{title}</h5>
            </div>
        </div>
    </Container>
);


export default NoContentFound;