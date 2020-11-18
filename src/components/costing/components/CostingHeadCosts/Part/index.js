import React from 'react';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';

function PartCompoment(props) {
  const { rmData, bopData, ccData, } = props;
  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <RawMaterialCost
            index={props.index}
            data={rmData}
            setRMCost={props.setRMCost}
          />

          <hr />
          <BOPCost
            index={props.index}
            data={bopData}
            setBOPCost={props.setBOPCost}
          />

          <hr />
          <ProcessCost
            index={props.index}
            data={ccData}
            setProcessCost={props.setProcessCost}
            setOperationCost={props.setOperationCost}
            setToolCost={props.setToolCost}
          />
        </div>
      </div >
    </ >
  );
}

export default PartCompoment;