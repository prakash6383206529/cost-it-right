import React, { Fragment, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import AddToComparisonDrawer from './AddToComparisonDrawer';
import { setCostingViewData, setCostingApprovalData } from '../actions/Costing';
import  ViewBOP  from './Drawers/ViewBOP';
import ViewConversionCost from './Drawers/ViewConversionCost';
import ViewRM from './Drawers/ViewRM';
import ViewOverheadProfit from './Drawers/ViewOverheadProfit';
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight';
import ViewToolCost from './Drawers/viewToolCost';
import SendForApproval from './SendForApproval';

const CostingSummaryTable = (props) => {
  const dispatch = useDispatch();
  const [addComparisonToggle, setaddComparisonToggle] = useState(false);
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [editObject, setEditObject] = useState({});
  /* Constant  for drawer toggle*/
  const [isViewBOP, setViewBOP] = useState(false);
  const [isViewConversionCost, setIsViewConversionCost] = useState(false);
  const [isViewRM, setIsViewRM] = useState(false);
  const [isViewToolCost, setIsViewToolCost] = useState(false);
  const [isViewOverheadProfit, setIsViewOverheadProfit] = useState(false);
  const [isViewPackagingFreight, setIsViewPackagingFreight] = useState(false);
  const [showApproval, setShowApproval] = useState(false)
  /*Constants for sendind data in drawer*/
  const [viewBOPData, setViewBOPData] = useState([])
  const [viewConversionCostData, setViewConversionCostData] = useState([])
  const [viewRMData, setViewRMData] = useState([])
  const [viewOverheadData, setViewOverheadData] = useState([])
  const [viewProfitData, setViewProfitData] = useState([])
  const [viewToolCost, setViewToolCost] = useState([])
  const [viewRejectAndModelType, setViewRejectAndModelType] = useState({})
  const [viewPackagingFreight, setViewPackagingFreight] = useState({})
  const [multipleCostings, setMultipleCostings] = useState([])
  const [flag, setFlag] = useState(false)
  

  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData
  )
  const viewApprovalData = useSelector(state => state.costing.costingApprovalData);

  /**
   * @method ViewBOP
   * @description SET VIEW BOP DATA FOR DRAWER
  */
  const viewBop = index => {
    setViewBOP(true)
    setIsViewConversionCost(false)
      if(index != -1){
          let data = viewCostingData[index].netBOPCostView;
          console.log(data, "Dataaa");
          setViewBOPData(data);
      }
 }
/**
 * @method viewConversionCostData
 * @description SET COVERSION DATA FOR DRAWER
*/
 const viewConversionCost = index => {
   console.log(index,"Index");
   setIsViewConversionCost(true)
   setViewBOP(false)
   if(index != -1) {
     let data = viewCostingData[index].netConversionCostView;
     console.log(data,"Data of conversion cost");
     setViewConversionCostData(data)
   }
 }
/**
 * @method viewRM
 * @description SET RM DATA FOR DRAWER
*/
const viewRM = index => {
  console.log(index);
  let data = viewCostingData[index].netRMCostView;
  console.log(data,"Data of Rm");
  setIsViewRM(true)
  setViewRMData(data)
}
/**
 * @method overHeadProfit
 * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
*/
const overHeadProfit = index => {
  console.log(index,"Index");
  let overHeadData = viewCostingData[index].netOverheadCostView;
  let profitData = viewCostingData[index].netProfitCostView;
  let rejectData = viewCostingData[index].netRejectionCostView;
  let modelType = viewCostingData[index].modelType;
  console.log(rejectData,"ovr",modelType);
  setIsViewOverheadProfit(true);
  setViewOverheadData(overHeadData);
  setViewProfitData(profitData);
  setViewRejectAndModelType({rejectData: rejectData,modelType: modelType })
}
/**
 * @method viewPackagingAndFrieghtData
 * @description SET PACKAGING AND FRIEGHT DATA FOR DRAWER
*/
const viewPackagingAndFrieghtData = index => {
  console.log(index);
  let packagingData =  viewCostingData[index].netPackagingCostView;
  let freightData =  viewCostingData[index].netFreightCostView;
  console.log(packagingData,"data tabler",freightData);
  setIsViewPackagingFreight(true)
  setViewPackagingFreight({packagingData: packagingData, freightData: freightData })
}
/**
 * @method viewToolCostData
 * @description SET TOOL DATA FOR DRAWER
*/
const viewToolCostData = index => {
  console.log(index);
  let data = viewCostingData[index].netToolCostView;
  setIsViewToolCost(true)
  setViewToolCost(data)
}

const deleteCostingFromView = (index) => {
  let temp = viewCostingData;
  temp.splice(index, 1);
  dispatch(setCostingViewData(temp))
}

/**
 * @method editHandler
 * @description HANDLING EDIT OF COSTING SUMMARY
 *  
 */
const editHandler = (index) => {
    const editObject = {
      partId: viewCostingData[index].partId,
      plantId: viewCostingData[index].plantId,
      plantName: viewCostingData[index].plantName,
      costingId: viewCostingData[index].costingId,
      CostingNumber: viewCostingData[index].costingName,
      index: index,
      typeOfCosting: viewCostingData[index].zbc
    }
    setIsEditFlag(true)
    setaddComparisonToggle(true)
    setEditObject(editObject)
  }

  /**
   * @method addComparisonDrawerToggle
   * @description HANDLE ADD TO COMPARISON DRAWER TOGGLE
   */

  const addComparisonDrawerToggle = () => {
    setaddComparisonToggle(true)
    setIsEditFlag(false)
    setEditObject({})
  }
  /**
   * @method closeAddComparisonDrawer
   * @description HIDE ADD COMPARISON DRAWER
   */
  const closeAddComparisonDrawer = (e = '') => {
    setaddComparisonToggle(false)
  }

  /**
   * @method closeViewDrawer
   * @description Closing view Drawer
  */
 const closeViewDrawer = (e=" ") => {
  setViewBOP(false)
  setIsViewPackagingFreight(false)
  setIsViewRM(false)
  setIsViewOverheadProfit(false)
  setIsViewConversionCost(false)
  setIsViewToolCost(false)
}
  /**
   * @method closeShowApproval
   * @description FOR CLOSING APPROVAL DRAWER
  */
  const closeShowApproval = (e = '') => {
    setShowApproval(false)
  }

  const handleMultipleCostings = (checked, index) => {
    console.log('checked: ', checked);
    let temp = multipleCostings;
    console.log('temp: ', temp);
    if(checked){
      console.log("From If")
      temp.push(viewCostingData[index].costingName);
      // setMultipleCostings(temp)
    }
    else{
      console.log("From else")
      const ind = multipleCostings.findIndex(data => data == viewCostingData[index].costingName);
      if(ind != -1){
        temp.splice(ind, 1);
      }
      // setMultipleCostings(temp)
    }
    console.log(temp, "Temp from Multiple costing")
    setMultipleCostings(temp)
    setFlag(!flag)
    // let data = viewCostingData[index].netBOPCostView;
    // setViewBOPData(data)
  }

  const sendForApprovalData = (costingIds) => {
    console.log('costingIds: ', costingIds);
    let temp = viewApprovalData
    costingIds && costingIds.map(id => {
      let index = viewCostingData.findIndex(data => data.costingName == id);
      if(index !== -1){
        let obj = {};
        obj.typeOfCosting = viewCostingData[index].zbc;
        obj.plantCode = viewCostingData[index].plantName;
        obj.costingId = viewCostingData[index].costingName;
        // obj.oldPrice = viewCostingData[index].oldPrice;
        obj.oldPrice = 1000000;
        obj.revisedPrice = viewCostingData[index].nPOPrice;
        obj.variance = 1000000 - parseInt(viewCostingData[index].nPOPrice);
        obj.consumptionQty = "";
        obj.remainingQty = "";
        obj.annualImpact = "";
        obj.yearImpact = ""
        obj.reason = "";
        obj.ecnNo = "";
        obj.effectiveDate = "";
        temp.push(obj)
      }
      dispatch(setCostingApprovalData(temp))
    })

  }
  

  useEffect(() => {}, [viewCostingData])
  
  // useEffect(() => {
  //   console.log('multipleCostings: ', multipleCostings);
  // }, [multipleCostings])

  // console.log('multipleCostings: ', multipleCostings);
  return (
    <Fragment>
      <Row>
        <Col md="4">
          <div className="left-border">{'Summary'}</div>
        </Col>
        <Col md="4">
          <button>{'Send For Approval'}</button>
        </Col>
        {
        //   <Col md="4">
        //   <button className={'user-btn'} onClick={() => editHandler(index)}>
        //     {'Edit'}
        //   </button>
        // </Col>
      }
        <Col md="4">
          <button
            type="button"
            className={'user-btn'}
            onClick={addComparisonDrawerToggle}
          >
            <div className={'plus'}></div>Add To Comparison
          </button>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <table>
            {viewCostingData &&
              viewCostingData.length > 0 &&
              viewCostingData.map((data, index) => {
                return (
                  <Fragment>
                    <tr>
                      {index == 0 ? (
                        <th>{data.zbc}</th>
                      ) : (
                        <th>
                          <div>
                          <input
                          type="checkbox"
                          onClick={(e) => {console.log(e.target.checked, "From CheckBox")
                        handleMultipleCostings(e.target.checked, index)}}
                          value={multipleCostings.length == 0 ? false : multipleCostings.includes(data.costingName) ? true: false}
                          // disabled={isEditFlag ? true : false}
                      />
                            {data.zbc}
                            <button onClick={() => deleteCostingFromView(index)}>
                              Delete
                            </button>
                          </div>
                        </th>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>Test</td>
                      ) : (
                        <td>
                          <div>
                            {data.costingName}
                            <button className={'user-btn'} onClick={() => editHandler(index)}>Edit Costing</button> &nbsp;
                            <button>Add Costing</button>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td>{data.poPrice}</td>
                    </tr>
                    <tr>
                      <td>{data.status}</td>
                    </tr>
                    <tr>
                      <td>{data.rm}</td>
                    </tr>
                    <tr>
                      <td>{data.gWeight}</td>
                    </tr>
                    <tr>
                      <td>{data.fWeight}</td>
                    </tr>
                    <tr>
                      <td>
                        {`${data.netRM}-RMCOSt`}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => viewRM(index)}
                            >View -RM</button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        {data.netBOP}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => viewBop(index)}
                            >
                            View-BOP
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{data.pCost}</td>
                    </tr>
                    <tr>
                      <td>{data.oCost}</td>
                    </tr>
                    <tr>
                      <td>{data.sTreatment}</td>
                    </tr>
                    <tr>
                      <td>{data.tCost}</td>
                    </tr>
                    <tr>
                      <td>
                        {data.nConvCost}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => viewConversionCost(index)}
                            >
                              View-CONVERSION COST
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{data.modelType}</td>
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>Test</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.aValue.applicability}</span> &nbsp;{' '}
                            <span>{data.aValue.value}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.overheadOn}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.overheadOn.overheadTitle}</span> &nbsp;{' '}
                            <span>{data.overheadOn.overheadValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.profitOn}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.profitOn.profitTitle}</span> &nbsp;{' '}
                            <span>{data.profitOn.profitValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.rejectionOn}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.rejectionOn.rejectionTitle}</span>{' '}
                            &nbsp;{' '}
                            <span>{data.rejectionOn.rejectionValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.iccOn}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.iccOn.iccTitle}</span> &nbsp;{' '}
                            <span>{data.iccOn.iccValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.paymentTerms}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.paymentTerms.paymentTitle}</span> &nbsp;{' '}
                            <span>{data.paymentTerms.paymentValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td>
                        {data.nOverheadProfit}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => overHeadProfit(index)}
                            >View-OVERHEAD  PROFIT</button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{data.packagingCost}</td>
                    </tr>
                    <tr>
                      <td>{data.freight}</td>
                    </tr>
                    <tr>
                      <td>
                        {data.nPackagingAndFreight}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => viewPackagingAndFrieghtData(index)}
                            >View-PACKAGING</button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{data.toolMaintenanceCost}</td>
                    </tr>
                    <tr>
                      <td>{data.toolPrice}</td>
                    </tr>
                    <tr>
                      <td>{data.amortizationQty}</td>
                    </tr>
                    <tr>
                      <td>
                        {data.totalToolCost}
                        {index != 0 && (
                          <div>
                            <button
                            onClick={() => viewToolCostData(index)}
                            >View-TOOLS </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{data.totalCost}</td>
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.otherDiscount}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.otherDiscount.discount}</span> &nbsp;{' '}
                            <span>{data.otherDiscount.value}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.otherDiscountValue}</td>
                      ) : (
                        <td>
                          <div>
                            <span>
                              {data.otherDiscountValue.discountPercentValue}
                            </span>{' '}
                            &nbsp;{' '}
                            <span>{data.otherDiscountValue.discountValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td>{data.anyOtherCost}</td>
                    </tr>
                    <tr>
                      <td>{data.remark}</td>
                    </tr>
                    <tr>
                      <td>{data.nPOPriceWithCurrency}</td>
                    </tr>
                    <tr>
                      {index == 0 ? (
                        <td>{data.currency}</td>
                      ) : (
                        <td>
                          <div>
                            <span>{data.currency.currencyTitle}</span> &nbsp;{' '}
                            <span>{data.currency.currencyValue}</span>
                          </div>
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td>{data.nPOPrice}</td>
                    </tr>
                    <tr>
                      <td>{data.attachment}</td>
                    </tr>
                    <tr>
                     {index == 0 ? <td></td> : <td><button onClick={() => {sendForApprovalData([data.costingName], index);setShowApproval(true)}}>Send For Approval</button></td>}
                    </tr>
                  </Fragment>
                )
              })}
          </table>
        </Col>
      </Row>
      {addComparisonToggle && (
        <AddToComparisonDrawer
          isOpen={addComparisonToggle}
          closeDrawer={closeAddComparisonDrawer}
          isEditFlag={isEditFlag}
          editObject={editObject}
          anchor={'right'}
        />
      )}
      {/* DRAWERS FOR VIEW  */}
      {
          isViewBOP && (
              <ViewBOP
              isOpen={isViewBOP}
              viewBOPData={viewBOPData}
              closeDrawer={closeViewDrawer}
              anchor={'right'}
              />
          )
      }
       {
          isViewConversionCost && (
              <ViewConversionCost
              isOpen={isViewConversionCost}
              viewConversionCostData={viewConversionCostData}
              closeDrawer={closeViewDrawer}
              anchor={'right'}
              />
          )
      }
      {
          isViewRM && (
              <ViewRM
              isOpen={isViewRM}
              viewRMData={viewRMData}
              closeDrawer={closeViewDrawer}
              anchor={'right'}
              />
          )
      }
      {
        isViewOverheadProfit && (
          <ViewOverheadProfit
            isOpen={isViewOverheadProfit}
            overheadData = {viewOverheadData}
            profitData = {viewProfitData}
            rejectAndModelType= {viewRejectAndModelType}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        isViewPackagingFreight &&
        <ViewPackagingAndFreight
          isOpen={isViewPackagingFreight}
          packagingAndFreightCost = {viewPackagingFreight}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      }
      {
        isViewToolCost &&
        <ViewToolCost
          isOpen={isViewToolCost}
          viewToolCost = {viewToolCost}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      }
      {
        showApproval && 
        <SendForApproval
          isOpen={showApproval}
          closeDrawer={closeShowApproval}
          anchor={'right'}
        />
      }
    </Fragment>
  )
}

export default CostingSummaryTable
