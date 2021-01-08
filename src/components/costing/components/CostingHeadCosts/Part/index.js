import React, { useContext, useState } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';

function PartCompoment(props) {
  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!IsOpen)
  }

  const costData = useContext(costingInfoContext);

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle()}>
        <td><span className={`cr-prt-nm cr-prt-link ${item.level} ${IsOpen ? 'Open' : 'Close'}`}>{item.PartName}</span></td>
        <td>{item.Type}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
        <td>{0}</td>
      </tr>
      {IsOpen && <tr>
        <td colSpan={7} className="cr-innerwrap-td">
          <div className="user-page p-0">
            <div>
              {/* {!costData.IsAssemblyPart && <RawMaterialCost */}
              <RawMaterialCost
                index={props.index}
                data={rmData}
              //setRMCost={props.setRMCost}
              />

              {/* {!costData.IsAssemblyPart && <BOPCost */}
              <BOPCost
                index={props.index}
                data={bopData}
              //setBOPCost={props.setBOPCost}
              />

              <ProcessCost
                index={props.index}
                data={ccData}
              // setProcessCost={props.setProcessCost}
              // setOperationCost={props.setOperationCost}
              // setToolCost={props.setToolCost}
              />
            </div>
          </div >
        </td>
      </tr>}
    </ >
  );
}

export default PartCompoment;