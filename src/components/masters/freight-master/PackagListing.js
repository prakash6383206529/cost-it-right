import React from 'react';
import { Row, Col, } from 'reactstrap';
import { Loader } from '../../common/Loader';

const PackagListing = (props) => {



    return (
        <div>
            {props.loading && <Loader />}
            <form
                noValidate>
                <Row className="pt-30">

                </Row>

            </form>
            <Row>
                <Col>

                </Col>
            </Row>
        </div >
    );
}

export default PackagListing