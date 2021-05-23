import React from 'react';
import { Container } from 'reactstrap'

const HeaderTitle = ({ title, customClass = '' }) => (
    // <Container>
    <div className={`header-title  ${customClass} `}>
        <h5>{title}</h5>
    </div>
    // </Container>
);


export default HeaderTitle;