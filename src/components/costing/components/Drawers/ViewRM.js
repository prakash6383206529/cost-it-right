import React, { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialCalculationByTechnology } from '../../actions/CostWorking';
import Toaster from '../../../common/Toaster';
import { checkForDecimalAndNull } from '../../../../helper';
import { Container, Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import { EMPTY_GUID } from '../../../../config/constants';
import 'reactjs-popup/dist/index.css'

function ViewRM(props) {

  const { viewRMData, rmMBDetail, isAssemblyCosting, isPDFShow } = props


  /*
  * @method toggleDrawer
  * @description closing drawer
  */

  const [viewRM, setViewRM] = useState(viewRMData)
  const [index, setIndex] = useState('')
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  const [calciData, setCalciData] = useState({})

  useEffect(() => {

    setViewRM(viewRMData)


  }, [])

  const dispatch = useDispatch()

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const getWeightData = (index) => {
    setIndex(index)
    if (viewRM[index].WeightCalculationId === '00000000-0000-0000-0000-000000000000') {
      Toaster.warning('Data is not avaliabe for calculator')
      return false
    }
    const tempData = viewCostingData[props.index]

    dispatch(getRawMaterialCalculationByTechnology(tempData.CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].WeightCalculationId, tempData.technologyId, res => {
      if (res && res.data && res.data.Data) {
        const data = res.data.Data
        setCalciData({ ...viewRM[index], WeightCalculatorRequest: data })
        setWeightCalculatorDrawer(true)
      }
    }))

  }


  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  /**
   * @method closeWeightDrawer
   * @description CLOSING WEIGHT DRAWER
  */
  const closeWeightDrawer = (e = "") => {
    setWeightCalculatorDrawer(false)
  }
  const tableData=()=> {
    return <>
            <Col md="12">
              <div className="left-border mt-4 mb-3">Raw Material</div>
            </Col>

            <Col>
              <Table className="table cr-brdr-main" size="sm">
                <thead>
                  <tr>
                    {isAssemblyCosting && <th>{`Part No`}</th>}
                    <th>{`RM Name -Grade`}</th>
                    <th>{`RM Rate`}</th>
                    <th>{`Scrap Rate`}</th>
                    <th>{`Scrap Recovery %`}</th>
                    <th>{`Gross Weight (Kg)`}</th>
                    <th>{`Finish Weight (Kg)`}</th>
                    <th>{`Scrap Weight`}</th>
                    {!isPDFShow && <th>{`Calculator`}</th>}
                    <th>{`Freight Cost`}</th>
                    <th>{`Shearing Cost`}</th>
                    <th>{`Burning Loss Weight`}</th>
                    <th >{`Net RM Cost`}</th>
                    <th className="costing-border-right">{`Remark`}</th>

                  </tr>
                </thead>
                <tbody>
                  {viewRM && viewRM.length > 0 && viewRM.map((item, index) => {
                    return (
                      <tr key={index}>
                        {isAssemblyCosting && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                        <td><div className='text-overflow' title={item.RMName}>{item.RMName}</div></td>
                        <td>{checkForDecimalAndNull(item.RMRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(item.ScrapRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(item.ScrapRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(item.GrossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                        <td>{checkForDecimalAndNull(item.FinishWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                        <td>{checkForDecimalAndNull(item.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                        {!isPDFShow && <td><button
                          className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                          type={"button"}
                          disabled={item.WeightCalculationId === EMPTY_GUID}
                          onClick={() => { getWeightData(index) }}
                        /></td>}
                        <td>{item.FreightCost ? checkForDecimalAndNull(item.FreightCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                        <td>{item.ShearingCost ? checkForDecimalAndNull(item.ShearingCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                        <td>{item.BurningLossWeight ? checkForDecimalAndNull(item.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>
                          {item?.Remark ? item.Remark : "-"}
                        </td>

                      </tr>
                    )
                  })}
                  {viewRM?.length === 0 && (
                    <tr>
                      <td colSpan={13}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col> 
            
            {viewCostingData[props.index].isApplyMasterBatch &&
              <>
                < Col md="12">
                  <div className="left-border mt-4 mb-3">Master Batch</div>
                </Col>
                <Col>
                  <Table className="table cr-brdr-main mb-0" size="sm">
                    <thead>
                      <tr>
                        <th>{`MB Name`}</th>
                        <th>{`MB Rate`}</th>
                        <th>{`Percentage`}</th>
                        <th>{`Effective MB Rate`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key={index}>
                        <td>{viewCostingData[props.index].masterBatchRMName}</td>
                        <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchRMPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                        <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchTotal, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                      </tr>
                      {viewRM.length === 0 && (
                        <tr>
                          <td colSpan={13}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </>}
         </>
  }
  return (
    <>
    {!isPDFShow ? 
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className='view-rm-cost'
      >
        <Container className={`${isAssemblyCosting && "drawer-1200"}`}>
          <div className={"drawer-wrapper drawer-1500px"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"View RM Cost:"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
             <Row>
              {tableData()}
            {weightCalculatorDrawer && (
              <WeightCalculator
                rmRowData={viewRM !== undefined ? calciData : {}}
                anchor={`right`}
                isEditFlag={false}
                isOpen={weightCalculatorDrawer}
                closeDrawer={closeWeightDrawer}
                technology={props.technologyId}
                isSummary={true}
                rmMBDetail={rmMBDetail} // MASTER BATCH DETAIL
                CostingViewMode={true}   // THIS KEY WILL BE USE TO OPEN CALCI IN VIEW MODE
              />
            )}
            </Row>
          </div>
        </Container>
      </Drawer> :(viewRM.length !== 0 &&  <Row className='mt-1'>{tableData()}</Row>  )}
    </>
  );
}

export default React.memo(ViewRM)
