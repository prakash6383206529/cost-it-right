import React, { useEffect, useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';
import { Fgwiseimactdata } from './FgWiseImactData';
import { EMPTY_GUID } from '../../../config/constants';
import AssemblyWiseImpact from './AssemblyWiseImpact';
function ViewAssembly(props) {

    const { impactType } = props
    // const [impactTypeState, setImpactTypeState] = useState('');

    // const dataForAssemblyImpact = {
    //     CostingHead: props.dataForAssemblyImpact?.row?.CostingHead === 'VBC' ? 1 : 0,
    //     impactPartNumber: props.dataForAssemblyImpact?.row?.PartNo,
    //     plantCode: props.dataForAssemblyImpact?.row?.PlantCode,
    //     vendorId: props.dataForAssemblyImpact?.row?.CostingHead === 'VBC' ? props.vendorIdState : EMPTY_GUID,
    //     delta: props.dataForAssemblyImpact?.row?.Variance,
    //     quantity: 1,
    // }

    useEffect(() => {
        // setImpactTypeState((impactType === undefined) ? 'Assembly' : impactType)

    }, [])

    /**
    * @method toggleDrawer
    * @description TOGGLE DRAWER
    */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('')
    };

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`Assembly Wise Impact`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        {/* {loader && <LoaderCustom />} */}
                        {/* <div className={'header-wrapper left'}>
                            <h3>{`Assembly Wise`}</h3>
                        </div> */}
                        {/* ********** THIS NEEDS TO BE KEPT IN CODE FOR FUTURE PURPOSES ***********/}
                        {/* <Fgwiseimactdata
                            headerName={headerName}
                            dataForAssemblyImpact={dataForAssemblyImpact}
                            vendorIdState={props.vendorIdState}
                            impactType={'Assembly'}
                        /> */}
                        <AssemblyWiseImpact
                            dataForAssemblyImpact={props.dataForAssemblyImpact}
                            impactType={'Assembly'}
                            isPartImpactAssembly={props.isPartImpactAssembly}
                        />
                    </div>
                </div>

            </Drawer>

        </div>
    );
}

export default ViewAssembly;