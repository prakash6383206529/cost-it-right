import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';

function ToolCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(props.data)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    props.setToolCost(gridData, 0)
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
        ToolOperationId: rowData.ToolOperationId,
        ProcessOrOperation: rowData.ProcessOrOperation,
        ToolCategory: rowData.ToolCategory,
        ToolName: rowData.ToolName,
        Quantity: rowData.Quantity,
        ToolCost: rowData.ToolCost,
        Life: rowData.Life,
        TotalToolCost: rowData.TotalToolCost,
      }
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowArray })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowArray]
        setGridData(tempArr)
      }
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
          <Row>
            <Col md="10">
              <div className="left-border">
                {'Tool Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD TOOL</button>
            </Col>
          </Row>

          <Row>
            {/*TOOL COST GRID */}

            <Col md="12">
              <Table className="table" size="sm" >
                <thead>
                  <tr>
                    <th>{`Process/Operation`}</th>
                    <th>{`Tool Category`}</th>
                    <th>{`Name`}</th>
                    <th style={{ width: 200 }}>{`Quantity`}</th>
                    <th>{`Tool Cost`}</th>
                    <th>{`Life`}</th>
                    <th>{`Net Tool Cost`}</th>
                    <th>{`Action`}</th>
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
                          <td>{item.TotalToolCost ? checkForDecimalAndNull(item.TotalToolCost, 2) : 0}</td>
                          <td>
                            <button className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />
                            <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                          </td>
                        </tr>
                      )
                    })
                  }
                  {gridData.length === 0 &&
                    <tr>
                      <td colSpan={8}>
                        <NoContentFound title={CONSTANT.EMPTY_DATA} />
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
      />}
    </ >
  );
}

export default ToolCost;