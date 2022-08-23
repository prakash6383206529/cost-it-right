
import { Drawer } from '@material-ui/core';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { ProcessGroup } from '../masterUtil';

function ProcessGroupDrawer(props) {
    return (
        // <div>
        //     <Drawer
        //         anchor={props.anchor}
        //         open={props.isOpen}
        //     // onClose={(e) => props.onClose}
        //     >
        //         <Container>
        //             <div className={"drawer-wrapper"}>
        //                 <ProcessGroup isViewFlag={true} processListing={[]} isViewMode={true} isListing={true} />

        //             </div>
        //         </Container>
        //     </Drawer>
        // </div>
        <Drawer className="top-drawer process-group-drawer" anchor={props.anchor} open={props.isOpen} >
            {/* <Container > */}
            <div className="container-fluid ">
                <div className={'drawer-wrapper drawer-full-width'}>

                    <Row className="drawer-heading sticky-top-0">
                        <Col className='px-0'>
                            <div className={'header-wrapper left'}>
                                <h3>{`Process Group`}</h3>
                            </div>
                            <div
                                onClick={(e) => props.toggleDrawer(e)}
                                className={'close-button right'}
                            ></div>
                        </Col>
                    </Row>
                    <div className={"drawer-wrapper"}>
                        <ProcessGroup isViewFlag={true} processListing={[]} isViewMode={true} isListing={true} />

                    </div>

                    {/* </Row> */}
                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-right bluefooter-butn pr-0">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={props.toggleDrawer}
                            >
                                <div className={'cancel-icon'}></div>{' '}
                                {'Cancel'}
                            </button>
                        </div>
                    </Row>
                </div>
            </div>
            {/* </Container> */}
        </Drawer>
    );
}

export default ProcessGroupDrawer;