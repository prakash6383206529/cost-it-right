import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Table } from 'reactstrap';
import { useDispatch, } from 'react-redux';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import AddFreight from '../../Drawers/AddFreight';
import { Fixed, FullTruckLoad, PartTruckLoad, Percentage } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded } from '../../../actions/Costing';

function FreightCost(props) {

  const [gridData, setGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [OldGridData, setOldGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const dispatch = useDispatch()
  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    props.setFreightCost(gridData, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
    setIsEditFlag(false)
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
      <div className="user-page p-0 pt-4 mt-1">
        <div>
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">
                {'Freight:'}
              </div>
            </Col>
            <Col col={'2'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD FREIGHT</button>}
            </Col>
          </Row>
          <Row>
            {/*FREIGHT COST GRID */}

            <Col md="12">
              <div className="costing-border p-3">
                <Table className="table cr-brdr-main mb-0" size="sm">
                  <thead>
                    <tr>
                      <th>{`Freight Type`}</th>
                      <th>{`Capacity`}</th>
                      <th>{`Criteria/Applicability`}</th>
                      <th>{`Rate/Percentage`}</th>
                      <th>{`Quantity`}</th>
                      <th>{`Cost`}</th>
                      <th style={{ width: "130px", textAlign: "right" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData && gridData.map((item, index) => {
                        let EFreightLoadTypeText = '';

                        if (item.EFreightLoadType === Fixed) EFreightLoadTypeText = 'Fixed';
                        if (item.EFreightLoadType === Percentage) EFreightLoadTypeText = 'Percentage';
                        if (item.EFreightLoadType === FullTruckLoad) EFreightLoadTypeText = 'FTL';
                        if (item.EFreightLoadType === PartTruckLoad) EFreightLoadTypeText = 'PTL';

                        return (
                          <tr key={index}>
                            <td>{EFreightLoadTypeText}</td>
                            <td>{item.EFreightLoadType === Fixed || item.EFreightLoadType === Percentage ? '-' : item.Capacity}</td>
                            <td>{item.EFreightLoadType === Fixed ? '-' : (item.EFreightLoadType === Percentage ? item.Criteria : '-')}</td>
                            <td>{item.EFreightLoadType === Fixed ? '-' : (item.EFreightLoadType === Percentage ? item.Rate : '-')}</td>
                            <td>{item.EFreightLoadType === Fixed || item.EFreightLoadType === Percentage ? '-' : item.Quantity}</td>
                            <td>{item.FreightCost}</td>
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