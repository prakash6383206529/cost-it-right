import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA, Per_Kg_Load } from '../../../../../config/constants';
import AddFreight from '../../Drawers/AddFreight';
import { Fixed, FullTruckLoad, PartTruckLoad, Percentage } from '../../../../../config/constants';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isPackageAndFreightDataChange } from '../../../actions/Costing';
import { checkForDecimalAndNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { LOGISTICS, PACK_AND_FREIGHT_PER_KG } from '../../../../../config/masterData';
import Button from '../../../../layout/Button';

function FreightCost(props) {

  const [gridData, setGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isAddFlag, setIsAddFlag] = useState(false)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  const dispatch = useDispatch()
  const CostingViewMode = useContext(ViewCostingContext);
  const { CostingEffectiveDate, costingData, currencySource,exchangeRateData } = useSelector(state => state.costing)

  useEffect(() => {
    props.setFreightCost(gridData, JSON.stringify(gridData) !== JSON.stringify((props?.data && props?.data?.length > 0 ? props?.data : [])) ? true : false)
    if (JSON.stringify(gridData) !== JSON.stringify((props?.data && props?.data?.length > 0 ? props?.data : []))) {
      dispatch(isPackageAndFreightDataChange(true))
    }
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    if (costingData.TechnologyId === LOGISTICS && CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    setRowObjData({})
    setDrawerOpen(true)
    setIsAddFlag(true)
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
        setIsAddFlag(false)
        setRowObjData(tempArr)
      } else {
        let tempArr = [...gridData, rowData]
        setGridData(tempArr)
        setEditIndex('')
        setIsEditFlag(false)
        setIsAddFlag(false)
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
    setIsAddFlag(false)
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
              {!CostingViewMode &&

                <Button
                  id="Costing_addFreight"
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={"FREIGHT"}
                />}
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
                      {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                      <th style={{ width: "130px", textAlign: "right" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData && gridData.map((item, index) => {
                        let EFreightLoadTypeText = '';

                        if (item.EFreightLoadType === Fixed) EFreightLoadTypeText = 'Fixed';
                        if (item.EFreightLoadType === Percentage) EFreightLoadTypeText = 'Percentage';
                        if (item.EFreightLoadType === FullTruckLoad) EFreightLoadTypeText = 'Full Truck Load';
                        if (item.EFreightLoadType === PartTruckLoad) EFreightLoadTypeText = 'Part Truck Load';

                        return (
                          <tr key={index}>
                            <td>{EFreightLoadTypeText}</td>
                            <td>{item.Capacity ? item.Capacity : '-'}</td>
                            <td>{item.Criteria ? item.Criteria : '-'}</td>
                            <td>{item.Rate ? item.Rate : '-'}</td>
                            <td>{item.Quantity ? item.Quantity : '-'}</td>
                            <td>{checkForDecimalAndNull(item.FreightCost, initialConfiguration?.NoOfDecimalForPrice)}</td>
                            {initialConfiguration?.IsShowCRMHead && <td>{item?.FreightCRMHead}</td>}
                            <td style={{ textAlign: "right" }}>
                              {!CostingViewMode && <button title='Edit' className="Edit mt15 mr5" type={'button'} onClick={() => editItem(index)} />}
                              {!CostingViewMode && <button title='Delete' className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />}
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
        isAddFlag={isAddFlag}
        gridData={gridData}
      />}
    </ >
  );
}

export default FreightCost;