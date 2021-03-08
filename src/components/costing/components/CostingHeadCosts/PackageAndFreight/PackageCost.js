import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddPackaging from '../../Drawers/AddPackaging';

function PackageCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [gridData, setGridData] = useState(props.data)
  const [rowObjData, setRowObjData] = useState({})
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    props.setPackageCost(gridData, 0)
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
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowData })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowData]
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

  const handleSurfaceAreaChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      const SurfaceTreatmentCost = (checkForNull(event.target.value) * checkForNull(tempData.RatePerUOM)) + (checkForNull(tempData.LabourRate) * parseInt(tempData.LabourQuantity));
      tempData = { ...tempData, SurfaceArea: parseInt(event.target.value), SurfaceTreatmentCost: SurfaceTreatmentCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid number.')
    }
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
            <Col md="8">
              <div className="left-border">
                {'Packaging:'}
              </div>
            </Col>
            <Col col={'4'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD PACKAGING</button>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <div className="costing-border p-3">
                <Table className="table cr-brdr-main mb-0" size="sm">
                  <thead>
                    <tr>
                      <th>{`Packaging Description`}</th>
                      <th>{`Packaging Cost`}</th>
                      <th>{`Cost`}</th>
                      <th style={{ width: "130px" }} className="costing-border-right"  >{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      gridData && gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.PackagingDescription}</td>
                            <td>{item.IsPackagingCostFixed === false ? 'Fixed' : item.PackagingCostPercentage}</td>
                            <td>{item.PackagingCost}</td>
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
      {isDrawerOpen && <AddPackaging
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

export default PackageCost;