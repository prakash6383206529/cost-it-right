import React from 'react';
import { Container } from 'reactstrap'

const HeaderTitle = ({ title, customClass = '', customHeaderClass = '', children }) => (
    // <Container>
    <div className={`header-title  ${customClass} `}>
        <h5 className={`${customHeaderClass}`}>{title}</h5>
        {children}
    </div>
    // </Container>
);


export default HeaderTitle;