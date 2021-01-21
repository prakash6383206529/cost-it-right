import React, { useContext, useState } from 'react';
import { useDispatch, } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BoughtOutPart from '../BOP';
import PartCompoment from '../Part';
import { getRMCCTabData, saveCostingRMCCTab } from '../../../actions/Costing';
import Switch from "react-switch";
import { Col, Row, Table } from 'reactstrap';
import OperationCost from '../Part/OperationCost';
import ToolCost from '../Part/ToolCost';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';

function AssemblyPart(props) {
  const { children, item, index } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [IsOpenTool, setIsOpenTool] = useState(false);

  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()

  /**
  * @method onToolToggle
  * @description TOOL COST TOGGLE
  */
  const onToolToggle = () => {
    setIsOpenTool(!IsOpenTool)
  }

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          //let Data = res.data.DataList[0].CostingChildPartDetails;
          let Data = res.data.DataList[0];
          props.toggleAssembly(BOMLevel, PartNumber, Data)
        }
      }))
    } else {
      props.toggleAssembly(BOMLevel, PartNumber)
    }
  }

  const nestedPartComponent = children && children.map(el => {
    if (el.PartType === 'Part') {
      console.log('Part Component', el)
      return <PartCompoment
        index={index}
        item={el}
        rmData={el.CostingPartDetails.CostingRawMaterialsCost}
        bopData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingBoughtOutPartCost}
        ccData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost}
        setPartDetails={props.setPartDetails}
        setRMCost={props.setRMCost}
        setBOPCost={props.setBOPCost}
        setProcessCost={props.setProcessCost}
        setOperationCost={props.setOperationCost}
        setToolCost={props.setToolCost}
      />
    }
  })

  const nestedAssembly = children && children.map(el => {
    if (el.PartType !== 'Sub Assembly') return false;
    return <AssemblyPart
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
      setPartDetails={props.setPartDetails}
      toggleAssembly={props.toggleAssembly}
      setRMCost={props.setRMCost}
      setBOPCost={props.setBOPCost}
      setProcessCost={props.setProcessCost}
      setOperationCost={props.setOperationCost}
      setToolCost={props.setToolCost}
      setAssemblyOperationCost={props.setAssemblyOperationCost}
      setAssemblyToolCost={props.setAssemblyToolCost}
    />
  })

  const nestedBOP = children && children.map(el => {
    if (el.PartType !== 'BOP') return false;
    return <BoughtOutPart
      index={index}
      item={el}
      children={el.CostingChildPartDetails}
    />
  })

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td >
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
      </tr>
      {IsOpen &&
        <tr>
          <td colSpan={7} className="cr-innerwrap-td">
            <div className="user-page p-0">
              <div className="cr-process-costwrap">
                <Row className="cr-innertool-cost">

                  <Col md="3" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalOperationCostPerAssembly !== null ? item.CostingPartDetails.TotalOperationCostPerAssembly : 0}`}</Col>
                  <Col md="3" className="cr-costlabel">{`Tool Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalToolCostPerAssembly !== null ? item.CostingPartDetails.TotalToolCostPerAssembly : 0}`}</Col>
                  <Col md="3" className="cr-costlabel">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.GrandTotalCost !== null ? item.CostingPartDetails.GrandTotalCost : 0}`}</Col>

                  <Col md="3" className="switch cr-costlabel">
                    <label className="switch-level">
                      <div className={'left-title'}>{''}</div>
                      <Switch
                        onChange={onToolToggle}
                        checked={IsOpenTool}
                        id="normal-switch"
                        disabled={false}
                        background="#4DC771"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={46}
                      />
                      <div className={'right-title'}>Show Tool Cost</div>
                    </label>
                  </Col>
                </Row>
                <hr />
                <OperationCost
                  data={item.CostingPartDetails !== undefined ? item.CostingPartDetails.CostingOperationCostResponse : []}
                  setAssemblyOperationCost={props.setAssemblyOperationCost}
                  item={props.item}
                  IsAssemblyCalculation={true}
                />

                <hr />
                {IsOpenTool && <ToolCost
                  data={item.CostingPartDetails !== undefined ? item.CostingPartDetails.CostingToolCostResponse : []}
                  setAssemblyToolCost={props.setAssemblyToolCost}
                  item={props.item}
                  IsAssemblyCalculation={true}
                />}

              </div>
            </div>
          </td>
        </tr>
      }

      {/* {IsOpen && nestedPartComponent} */}
      {item.IsOpen && nestedPartComponent}

      {/* {IsOpen && nestedBOP} */}
      {item.IsOpen && nestedBOP}

      {/* {IsOpen && nestedAssembly} */}
      {item.IsOpen && nestedAssembly}

    </ >
  );
}

export default AssemblyPart;