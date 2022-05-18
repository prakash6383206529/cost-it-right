import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import Switch from "react-switch";
import { saveAssemblyCostingRMCCTab, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import ToolCost from '../CostingHeadCosts/Part/ToolCost';
import { loggedInUserId, checkForDecimalAndNull, checkForNull } from '../../../../helper';
import { createToprowObjAndSave } from '../../CostingUtil';
import ProcessCost from '../CostingHeadCosts/Part/ProcessCost';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function AddAssemblyProcess(props) {
  const { item, CostingViewMode, ccData } = props;
  const [IsOpenTool, setIsOpenTool] = useState(false);
  const [processGrid, setProcessGrid] = useState([]);
  const [totalProcessCost, setTotalProcessCost] = useState(0);
  const dispatch = useDispatch()
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  const { RMCCTabData, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData } = useSelector(state => state.costing)

  const costData = useContext(costingInfoContext)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const netPOPrice = useContext(NetPOPriceContext);

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
* @method onToolToggle
* @description TOOL COST TOGGLE
*/
  const onToolToggle = () => {
    setIsOpenTool(!IsOpenTool)
  }

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

  const getValuesOfProcess = (gridData, ProcessCostTotal) => {
    setProcessGrid(gridData)
    setTotalProcessCost(ProcessCostTotal)

  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {

    let temp = subAssemblyTechnologyArray
    temp[0].ProcessCostValue = totalProcessCost
    temp[0].CostingPartDetails.ProcessCostValue = totalProcessCost
    temp[0].CostingPartDetails.CostPerAssembly = checkForNull(temp[0].CostingPartDetails.CostPerAssembly) + checkForNull(totalProcessCost)
    dispatch(setSubAssemblyTechnologyArray(temp, res => { }))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
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

export default AddAssemblyProcess;