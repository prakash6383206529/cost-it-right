import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Table } from 'reactstrap';
import { useDispatch, } from 'react-redux';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import { toastr } from 'react-redux-toastr';
import { checkForNull } from '../../../../../helper';
import AddPackaging from '../../Drawers/AddPackaging';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded } from '../../../actions/Costing';

function PackageCost(props) {

  const [gridData, setGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [OldGridData, setOldGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const dispatch = useDispatch()

  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    props.setPackageCost(gridData, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setIsEditFlag(false)
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
          <Row className="align-items-center">
            <Col md="8">
              <div className="left-border">
                {'Packaging:'}
              </div>
            </Col>
            <Col col={'4'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD PACKAGING</button>}
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
                      <th>{`Packaging Type/Percentage`}</th>
                      <th>{`Cost`}</th>
                      <th style={{ width: "130px", textAlign: "right" }} className="costing-border-right"  >{`Action`}</th>
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
                            <td style={{ textAlign: "right" }}>
                              {!CostingViewMode && <button className="Edit mt15 mr5" type={'button'} onClick={() => editItem(index)} />}
                              {!CostingViewMode && <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />}
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={EMPTY_DATA} />
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
        rowObjData={isEditFlag ? rowObjData : {}}
        anchor={'right'}
      />}
    </ >
  );
}

export default PackageCost;