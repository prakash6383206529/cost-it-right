import React from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import { Row, Col } from 'reactstrap'

function Simulation(props) {
    let options = {}
    return (
        <div>
            <Row>
                <Col sm="4">
                    <h1>{`Simulation`}</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div>Masters:</div>
                </Col>
                {/* <SearchableSelectHookForm /> */}
            </Row>
            {/* <RMDomesticListing /> */}
        </div>
    );
}

export default Simulation;