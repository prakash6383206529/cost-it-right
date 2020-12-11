import React, { Fragment } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import AddToComparisonDrawer from './AddToComparisonDrawer';
import { getSingleCostingDetails, setCostingViewData } from '../actions/Costing';
import { useEffect, useState } from 'react';
import { VIEW_COSTING_DATA } from '../../../config/constants';
import  ViewBOP  from './Drawers/ViewBOP'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'

const CostingSummaryTable = (props) => {
  const [addComparisonToggle, setaddComparisonToggle] = useState(false);
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [editObject, setEditObject] = useState({});
  const [isViewBOP, setViewBOP] = useState(false);
  const [isViewConversionCost, setIsViewConversionCost] = useState(false);
  const [isViewRM, setIsViewRM] = useState(false);

  const [viewBOPData, setViewBOPData] = useState([])
  const [viewConversionCostData, setViewConversionCostData] = useState([])
  const [viewRMData, setViewRMData] = useState([])
  console.log(viewConversionCostData,"view");
  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData
  )
  console.log('ViewCostingData: ', viewCostingData)
  const technologyId = ''

  /**
   * @method ViewBOP
   * @description SET VIEW BOP DATA FOR DRAWER
  */
  const viewBop = index => {
    setViewBOP(true)
    setIsViewConversionCost(false)
    console.log(index, "Index");
      if(index != -1){
          let data = viewCostingData[index].netBOPCostView;
          console.log(data, "Dataaa");
          setViewBOPData(data)
        //   data.tool ? data.tool : "-"
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
 const viewToolsOverview = index => {
  console.log(index, "Index");
  if(index != -1){
      let data = viewCostingData[index].netToolCostView;
      //console.log(data, "Dataaa");
    //   data.tool ? data.tool : "-"
  }
}
const viewRM = index => {
  console.log(index);
  let data = viewCostingData[index].netRMCostView;
  console.log(data,"Data of Rm");
  setIsViewRM(true)
  setViewRMData(data)
}

  const deleteCostingFromView = (data) => {}

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
   * @method closeViewBOP
   * @description HIDE VIEW BOP  DRAWER
   */
  const closeViewBOP= (e = '') => {
    setViewBOP(false)
  }
  /**
   * @method closeViewConversionData
   * @description HIDE VIEW CONVERSION DATA DRAWER
   */
  const closeViewConversionData= (e = '') => {
    setIsViewConversionCost(false)
  }

  const closeViewRMData= (e = '') => {
    setIsViewRM(false)
  }
  useEffect(() => {}, [viewCostingData])

  
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
                            {data.zbc}
                            <button onClick={() => deleteCostingFromView()}>
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
                            <button>View-OVERHAD  PROFT</button>
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
                            <button>View-PACKAGING</button>
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
                            <button onClick={() => viewToolsOverview(index)}>View-TOOLS </button>
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
                      <td>{data.approvalButton}</td>
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
      {
          isViewBOP && (
              <ViewBOP
              isOpen={isViewBOP}
              viewBOPData={viewBOPData}
              closeDrawer={closeViewBOP}
              anchor={'right'}
              />
          )
      }
       {
          isViewConversionCost && (
              <ViewConversionCost
              isOpen={isViewConversionCost}
              viewConversionCostData={viewConversionCostData}
              closeDrawer={closeViewConversionData}
              anchor={'right'}
              />
          )
      }
      {
          isViewRM && (
              <ViewRM
              isOpen={isViewRM}
              viewRMData={viewRMData}
              closeDrawer={closeViewRMData}
              anchor={'right'}
              />
          )
      }
    </Fragment>
  )
}

export default CostingSummaryTable
