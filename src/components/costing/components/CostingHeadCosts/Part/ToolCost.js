import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, } from 'react-redux'
import { Col, Row, Table } from 'reactstrap';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import { checkForDecimalAndNull, } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded } from '../../../actions/Costing';

function ToolCost(props) {

  const { item, data } = props;

  let ProcessCostArray = item?.CostingPartDetails?.CostingConversionCost?.CostingProcessCostResponse.map(el => {
    return { label: el.ProcessName, value: el.ProcessName };
  })
  let OperationCostArray = item?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse.map(el => {
    return { label: el.OperationName, value: el.OperationName };
  });

  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(data)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    const Params = {
      index: 0,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    if (props.IsAssemblyCalculation) {
      props.setAssemblyToolCost(gridData, Params)
    } else {
      props.setToolCost(gridData, Params)
    }
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setEditIndex('')
    setRowObjData({})
    setIsEditFlag(false)
    setDrawerOpen(true)
  }

  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let rowArray = {
        IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
        ToolOperationId: rowData.ToolOperationId,
        ProcessOrOperation: rowData.ProcessOrOperation,
        ToolCategory: rowData.ToolCategory,
        ToolName: rowData.ToolName,
        Quantity: rowData.Quantity,
        ToolCost: rowData.ToolCost,
        Life: rowData.Life,
        TotalToolCost: rowData.TotalToolCost,
        ToolMaintenanceCostPerPiece:rowData.ToolMaintenanceCostPerPiece,
        ToolInterestRatePercent:rowData.ToolInterestRatePercent,
        ToolInterestCost:rowData.ToolInterestCost,
        ToolInterestCostPerPiece:rowData.ToolInterestCostPerPiece
      }
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowArray })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowArray]
        setGridData(tempArr)
      }
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">
                {'Tool Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD TOOL</button>}
            </Col>
          </Row>

          <Row>
            {/*TOOL COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main costing-tool-cost-section" size="sm" >
                <thead>
                  <tr>
                    <th>{`Process/Operation`}</th>
                    <th>{`Tool Category`}</th>
                    <th>{`Name`}</th>
                    <th style={{ width: 200 }}>{`Quantity`}</th>
                    <th>{`Tool Cost`}</th>
                    <th>{`Life`}</th>
                    <th>{`Net Tool Cost`}</th>
                    <th style={{ width: 145 }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.ProcessOrOperation}</td>
                          <td>{item.ToolCategory}</td>
                          <td>{item.ToolName}</td>
                          <td style={{ width: 200 }}>{item.Quantity}</td>
                          <td>{item.ToolCost}</td>
                          <td>{item.Life}</td>
                          <td>{item.TotalToolCost ? checkForDecimalAndNull(item.TotalToolCost, 4) : 0}</td>
                          <td>
                            {!CostingViewMode && <button title='Edit' className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />}
                            {!CostingViewMode && <button title='Delete' className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />}
                          </td>
                        </tr>
                      )
                    })
                  }
                  {gridData && gridData.length === 0 &&
                    <tr>
                      <td colSpan={8}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div >

      {isDrawerOpen && <AddTool
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={isEditFlag}
        ID={''}
        editIndex={editIndex}
        rowObjData={rowObjData}
        anchor={'right'}
        ProcessOperationArray={[...ProcessCostArray, ...OperationCostArray]}
        gridData={data}
      />}
    </ >
  );
}

export default ToolCost;