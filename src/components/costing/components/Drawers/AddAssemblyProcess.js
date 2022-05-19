import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { checkForNull } from '../../../../helper';
import ProcessCost from '../CostingHeadCosts/Part/ProcessCost';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function AddAssemblyProcess(props) {
  const { item, CostingViewMode, ccData } = props;
  const [processGrid, setProcessGrid] = useState([]);
  const [totalProcessCost, setTotalProcessCost] = useState(0);
  const dispatch = useDispatch()
  const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)

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

  const getValuesOfProcess = (gridData, ProcessCostTotal) => {
    setProcessGrid(gridData)
    setTotalProcessCost(ProcessCostTotal)
  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)
    tempsubAssemblyTechnologyArray[0].ProcessCostValue = totalProcessCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.ProcessCostValue = totalProcessCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost) + (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP)) + (checkForNull(tempsubAssemblyTechnologyArray[0].ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].OperationCostValue))
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      >
        <div className="container-fluid add-operation-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Assembly Process Cost'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row className="mb-3 pt-3">
              <Col>
                <div className="user-page p-0">
                  <div className="cr-process-costwrap">
                    {/* <Row className="cr-innertool-cost">

                      <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Process Cost: ${item?.CostingPartDetails && item?.CostingPartDetails?.TotalOperationCostPerAssembly !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{``}</span></Col>
                    </Row> */}


                    <ProcessCost
                      index={props.index}
                      data={ccData}
                      setProcessCost={props.setProcessCost}
                      setOperationCost={props.setOperationCost}
                      setOtherOperationCost={props.setOtherOperationCost}
                      setToolCost={props.setToolCost}
                      item={item}
                      isAssemblyTechnology={true}
                      setProcessCostFunction={props.setProcessCostFunction}
                      getValuesOfProcess={getValuesOfProcess}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  disabled={CostingViewMode}
                  type={'button'}
                  className="submit-button mr15 save-btn"
                  onClick={saveData} >
                  <div className={'save-icon'}></div>
                  {'SAVE'}
                </button>
              </div>
            </Row>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

//export default React.memo(AddAssemblyProcess);
export default AddAssemblyProcess;