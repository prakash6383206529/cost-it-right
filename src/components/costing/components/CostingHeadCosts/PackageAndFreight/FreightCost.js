import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddFreight from '../../Drawers/AddFreight';

function FreightCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(props.data)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    props.setFreightCost(gridData, props.index)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE FREIGHT DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowData })
        setGridData(tempArr)
        setEditIndex('')
        setIsEditFlag(false)
        setRowObjData(tempArr)
      } else {
        let tempArr = [...gridData, rowData]
        setGridData(tempArr)
        setEditIndex('')
        setIsEditFlag(false)
        setRowObjData(tempArr)
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
      <div className="user-page p-0 pt-4 mt-1">
        <div>
          <Row>
            <Col md="10">
              <div className="left-border">
                {'Surface Treatment Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD FREIGHT</button>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <div className="costing-border p-3">
                <Table className="table cr-brdr-main mb-0" size="sm">
                  <thead>
                    <tr>
                      <th>{`Freight Type`}</th>
                      <th>{`Capacity`}</th>
                      <th>{`Criteria`}</th>
                      <th>{`Rate`}</th>
                      <th>{`Quantity`}</th>
                      <th>{`Cost`}</th>
                      <th style={{ width: "130px" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData && gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.IsPartTruckLoad ? 'PTL' : 'FTL'}</td>
                            <td>{item.Capacity}</td>
                            <td>{item.Criteria}</td>
                            <td>{item.Rate}</td>
                            <td>{item.Quantity}</td>
                            <td>{item.FreightCost}</td>
                            <td>
                              <button className="Edit mt15 mr5" type={'button'} onClick={() => editItem(index)} />
                              <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

        </div>
      </div>
      {isDrawerOpen && <AddFreight
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

export default FreightCost;