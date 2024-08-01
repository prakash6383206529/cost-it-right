import React from 'react';
import { Container } from 'reactstrap'

const HeaderTitle = ({ title, customClass = '', children }) => (
    // <Container>
    <div className={`header-title  ${customClass} `}>
        <h5>{title}</h5>
        {children}
    </div>
    // </Container>
);


export default HeaderTitle;