import React from 'react';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';

function SurfaceTreatment(props) {

  const { surfaceData, transportationData, item } = props;

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


  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const onSubmit = data => {
    toggleDrawer('')
  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    props.closeDrawer('')
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <div className="container-fluid">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Operation'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <div className="user-page p-0">
                  <div className="cr-process-costwrap">
                    <Row className="cr-innertool-cost">
                      <Col md="4" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalOperationCostPerAssembly !== null ? item.CostingPartDetails.TotalOperationCostPerAssembly : 0}`}</Col>
                      <Col md="4" className="cr-costlabel">{`Tool Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalToolCostPerAssembly !== null ? item.CostingPartDetails.TotalToolCostPerAssembly : 0}`}</Col>
                      <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.GrandTotalCost !== null ? item.CostingPartDetails.TotalOperationCostPerAssembly + item.CostingPartDetails.TotalToolCostPerAssembly : 0}`}</Col>
                    </Row>

                    <hr />
                    <div className="user-page p-0">
                      <div>
                        <SurfaceTreatmentCost
                          index={props.index}
                          data={surfaceData}
                        //setSurfaceCost={props.setSurfaceCost}
                        />
                        <hr />

                        <TransportationCost
                          index={props.index}
                          data={transportationData}
                        //setTransportationCost={props.setTransportationCost}
                        />
                      </div>
                    </div >

                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  type={'button'}
                  className="submit-button mr5 save-btn"
                  onClick={saveData} >
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'SAVE'}
                </button>

                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button>
              </div>
            </Row>

          </div>
        </div>
      </Drawer>

    </ >
  );
}

export default SurfaceTreatment;