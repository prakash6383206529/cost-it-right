import React from 'react';
import { Container } from 'reactstrap'
import img from '../../assests/images/no-record.png'

const NoContentFound = ({ title,customClassName, imagClass }) => (
    <Container>
        <div className={`text-center nodate-section  ${customClassName}`}>
            <img className={imagClass} alt={''} src={img} />
            <div className="my-2">
                <h5>{title}</h5>
            </div>
        </div>
    </Container>
);


export default NoContentFound;