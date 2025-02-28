import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import { checkForDecimalAndNull, CheckIsCostingDateSelected } from '../../../../../helper';
import AddPackaging from '../../Drawers/AddPackaging';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isPackageAndFreightDataChange } from '../../../actions/Costing';
import { LOGISTICS } from '../../../../../config/masterData';
import Button from '../../../../layout/Button';
import PackagingCalculator from '../../WeightCalculatorDrawer/PackagingCalculator';
import { setPackagingCalculatorAvailable } from '../../../actions/CostWorking';
import Toaster from '../../../../common/Toaster';

function PackageCost(props) {

  const [gridData, setGridData] = useState(props.data && props.data.length > 0 ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [packagingCalculatorDrawer, setPackagingCalculatorDrawer] = useState(false)
  const [calculatorRowObjData, setCalculatorRowObjData] = useState({
    PackagingDetailId: null,
    CostingPackagingCalculationDetailsId: null
  })

  const dispatch = useDispatch()

  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const { CostingEffectiveDate, costingData, currencySource, exchangeRateData } = useSelector(state => state.costing)
  const { freightCalculatorAvailable } = useSelector(state => state.costWorking)

  useEffect(() => {
    props.setPackageCost(gridData, JSON.stringify(gridData) !== JSON.stringify(props?.data && props?.data?.length > 0 ? props?.data : []) ? true : false)
    if (JSON.stringify(gridData) !== JSON.stringify(props?.data && props?.data?.length > 0 ? props?.data : [])) {
      dispatch(isPackageAndFreightDataChange(true))
    }
    if (gridData?.length > 0 && gridData?.some(rowData => rowData?.Applicability === 'Crate/Trolley' && rowData?.CostingPackagingCalculationDetailsId)) {
      let obj = {
        isAvailable: true,
      }
      dispatch(setPackagingCalculatorAvailable(obj));
    } else {
      dispatch(setPackagingCalculatorAvailable({}));
    }
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    if (costingData.TechnologyId === LOGISTICS && CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setIsEditFlag(false)
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (rowData?.Applicability === 'Crate/Trolley' && rowData?.CostingPackagingCalculationDetailsId) {
      let obj = {
        isAvailable: true,
      }
      dispatch(setPackagingCalculatorAvailable(obj));
    }
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
    if (gridData[index]?.Applicability === 'Crate/Trolley' && gridData[index]?.CostingPackagingCalculationDetailsId) {
      let obj = {
        isAvailable: false,
      }
      dispatch(setPackagingCalculatorAvailable(obj));
    }
    if (freightCalculatorAvailable === true) {
      Toaster.warning('Packaging entry is currently mapped to Freight Costing.');
      return false;
    }
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)
  }
  const editItem = (index) => {
    if (freightCalculatorAvailable === true) {
      Toaster.warning('Packaging entry is currently mapped to Freight Costing.');
      return false;
    }
    let tempArr = gridData && gridData.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }
  const getPackagingCalculator = (index) => {
    setPackagingCalculatorDrawer(true)
    setCalculatorRowObjData({
      PackagingDetailId: gridData[index]?.PackagingDetailId,
      CostingPackagingCalculationDetailsId: gridData[index]?.CostingPackagingCalculationDetailsId
    })
  }
  const closePackagingCalculatorDrawer = () => {
    setPackagingCalculatorDrawer(false)
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
                {costingData.TechnologyId === LOGISTICS ? 'Freight:' : 'Packaging:'}
              </div>
            </Col>
            <Col col={'4'}>
              {!CostingViewMode &&
                <Button
                  id="Costing_addPackaging"
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={costingData.TechnologyId === LOGISTICS ? 'FREIGHT' : 'PACKAGING'}
                />}

            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <div className="costing-border p-3">
                <Table className="table cr-brdr-main mb-0" size="sm">
                  <thead>
                    <tr>
                      {costingData.TechnologyId === LOGISTICS ? <th>{`Charges`}</th> : <th>{`Packaging Description`}</th>}
                      {costingData.TechnologyId !== LOGISTICS && <th>{`Criteria/Applicability`}</th>}
                      {costingData.TechnologyId !== LOGISTICS && <th>{`Rate`}</th>}
                      {costingData.TechnologyId !== LOGISTICS && <th>{`Quantity`}</th>}
                      {costingData.TechnologyId !== LOGISTICS && <th>{`Percentage`}</th>}
                      <th>{`Cost`}</th>
                      {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                      <th style={{ textAlign: "right" }} className="costing-border-right"  >{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      gridData && gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.PackagingDescription}</td>
                            {costingData.TechnologyId !== LOGISTICS && <td>{item.Applicability ? item.Applicability : '-'}</td>}
                            <td>{item.Rate ? checkForDecimalAndNull(item.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                            <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                            {costingData.TechnologyId !== LOGISTICS && <td>{item.IsPackagingCostFixed === false ? '-' : (item.PackagingCostPercentage ? item.PackagingCostPercentage : '-')}</td>}
                            <td><div className='d-flex align-items-center'>{checkForDecimalAndNull(item.PackagingCost, initialConfiguration.NoOfDecimalForPrice)}
                              {CostingViewMode && (item?.CostingPackagingCalculationDetailsId !== 0 && item?.CostingPackagingCalculationDetailsId !== null) && <button title='Calculator'
                                className="CalculatorIcon cr-cl-icon ml-1"
                                type={'button'}
                                onClick={() => { getPackagingCalculator(index) }} />}
                            </div>
                            </td>
                            {initialConfiguration.IsShowCRMHead && <td>{item?.PackagingCRMHead}</td>}
                            <td style={{ textAlign: "right" }}>
                              {!CostingViewMode && <>
                                <button title='Edit' className="Edit mt15 mr5" type={'button'} onClick={() => editItem(index)} />
                                <button title='Delete' className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} /></>}
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
        gridData={gridData}
      />}
      {packagingCalculatorDrawer && <PackagingCalculator
        anchor={`right`}
        isOpen={packagingCalculatorDrawer}
        closeCalculator={closePackagingCalculatorDrawer}
        rowObjData={calculatorRowObjData}
        costingPackagingCalculationDetailsId={calculatorRowObjData?.CostingPackagingCalculationDetailsId}
      />}
    </ >
  );
}

export default PackageCost;