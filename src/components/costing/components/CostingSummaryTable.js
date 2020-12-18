import React, { Fragment, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import AddToComparisonDrawer from './AddToComparisonDrawer';
import { setCostingViewData, setCostingApprovalData } from '../actions/Costing';
import ViewBOP from './Drawers/ViewBOP';
import ViewConversionCost from './Drawers/ViewConversionCost';
import ViewRM from './Drawers/ViewRM';
import ViewOverheadProfit from './Drawers/ViewOverheadProfit';
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight';
import ViewToolCost from './Drawers/viewToolCost';
import SendForApproval from './SendForApproval';
import { toastr } from 'react-redux-toastr';

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
    if (index != -1) {
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
    console.log(index, "Index");
    setIsViewConversionCost(true)
    setViewBOP(false)
    if (index != -1) {
      let data = viewCostingData[index].netConversionCostView;
      console.log(data, "Data of conversion cost");
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
    console.log(data, "Data of Rm");
    setIsViewRM(true)
    setViewRMData(data)
  }
  /**
   * @method overHeadProfit
   * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
  */
  const overHeadProfit = index => {
    console.log(index, "Index");
    let overHeadData = viewCostingData[index].netOverheadCostView;
    let profitData = viewCostingData[index].netProfitCostView;
    let rejectData = viewCostingData[index].netRejectionCostView;
    let modelType = viewCostingData[index].modelType;
    console.log(rejectData, "ovr", modelType);
    setIsViewOverheadProfit(true);
    setViewOverheadData(overHeadData);
    setViewProfitData(profitData);
    setViewRejectAndModelType({ rejectData: rejectData, modelType: modelType })
  }
  /**
   * @method viewPackagingAndFrieghtData
   * @description SET PACKAGING AND FRIEGHT DATA FOR DRAWER
  */
  const viewPackagingAndFrieghtData = index => {
    console.log(index);
    let packagingData = viewCostingData[index].netPackagingCostView;
    let freightData = viewCostingData[index].netFreightCostView;
    console.log(packagingData, "data tabler", freightData);
    setIsViewPackagingFreight(true)
    setViewPackagingFreight({ packagingData: packagingData, freightData: freightData })
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
  const closeViewDrawer = (e = " ") => {
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
    let temp = multipleCostings;
    console.log('temp: ', temp);
    if (checked) {
      console.log("From If")
      temp.push(viewCostingData[index].costingId);
      // setMultipleCostings(temp)
    }
    else {
      console.log("From else")
      const ind = multipleCostings.findIndex(data => data == viewCostingData[index].costingId);
      if (ind != -1) {
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
      let index = viewCostingData.findIndex(data => data.costingId == id);
      if (index !== -1) {
        let obj = {};
        obj.typeOfCosting = viewCostingData[index].zbc;
        obj.plantCode = viewCostingData[index].plantCode;
        obj.plantName = viewCostingData[index].plantName;
        obj.plantId = viewCostingData[index].plantId;
        obj.costingName = viewCostingData[index].costingName;
        obj.costingId = viewCostingData[index].costingId;
        // obj.oldPrice = viewCostingData[index].oldPrice;
        obj.oldPrice = viewCostingData[index].oldPoPrice;
        obj.revisedPrice = viewCostingData[index].nPOPrice;
        obj.variance = parseInt(viewCostingData[index].oldPoPrice) - parseInt(viewCostingData[index].nPOPrice);
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

  const checkCostings = () => {
    if (multipleCostings.length == 0) {
      toastr.warning("Please select at least one costing for sendig for approval")
      return;
    }
    else {
      sendForApprovalData(multipleCostings);
      setShowApproval(true)
    }
  }

  useEffect(() => { }, [viewCostingData])

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
          <button onClick={() => checkCostings()}>{'Send For Approval'}</button>
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
        <div class="table-responsive">
          <table class="table table-bordered costing-summary-table">
            <thead>
              <tr>
                <th scope="col">ZBC v/s VBC</th>
                <th scope="col">
                  <div class="element w-50 d-inline-block">
                    <div class="custom-check d-inline-block">
                      <input type="checkbox" id="check1"></input>
                      <label for="check1"></label>
                    </div>
                     <span>ZBC (SOB:20%)</span>
                  </div>
                  <div class="action w-50 d-inline-block text-right">
                    <button type="button" class="btn small-square-btn btn-link edit-btn"><i class="fa fa-pencil"></i></button>
                    <button type="button" class="btn small-square-btn btn-link file-btn"><i class="fa fa-file"></i></button>
                    <button type="button" class="btn small-square-btn btn-link remove-btn"><i class="fa fa-times"></i></button>
                  </div>
                </th>
                <th scope="col">
                  <div class="element w-50 d-inline-block">
                    <div class="custom-check d-inline-block">
                      <input type="checkbox" id="check2"></input>
                      <label for="check2"></label>
                    </div>
                     <span>Supplier 1(SOB:17%)</span>
                  </div>
                  <div class="action w-50 d-inline-block text-right">
                    <button type="button" class="btn small-square-btn btn-link edit-btn"><i class="fa fa-pencil"></i></button>
                    <button type="button" class="btn small-square-btn btn-link file-btn"><i class="fa fa-file"></i></button>
                    <button type="button" class="btn small-square-btn btn-link remove-btn"><i class="fa fa-times"></i></button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span class="d-block">Costing Version</span>
                  <span class="d-block">PO Price</span>
                </td>
                <td>
                  <span class="d-block bg-grey">CS7654- 12/01/2020 10:00AM -Draft <a class="float-right d-inline-block"><small>Change version</small></a></span>
                  <span class="d-block">250000.00</span>
                </td>
                <td>
                  <span class="d-block bg-grey">CS7654- 12/01/2020 10:00AM -Draft <a class="float-right d-inline-block"><small>Change version</small></a></span>
                  <span class="d-block">250000.00</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="d-block small-grey-text">RM Name-Grade</span>
                  <span class="d-block small-grey-text">Gross Weight</span>
                  <span class="d-block small-grey-text">Finish Weight</span>
                </td>
                <td>
                  <span class="d-block small-grey-text">Raw1-B1</span>
                  <span class="d-block small-grey-text">77</span>
                  <span class="d-block small-grey-text">70</span>
                </td>
                <td>
                  <span class="d-block small-grey-text">Raw1</span>
                  <span class="d-block small-grey-text">77</span>
                  <span class="d-block small-grey-text">70</span>
                </td>
              </tr>
              <tr class="background-light-blue">
                <th>Net RM Cost</th>
                <td>4029.00 <button type="button" class="float-right btn small-square-btn btn-link eye-btn"><i class="fa fa-eye"></i></button></td>
                <td>4029.00 <button type="button" class="float-right btn small-square-btn btn-link eye-btn"><i class="fa fa-eye"></i></button></td>
              </tr>
              <tr class="background-light-blue">
                <th>Net BOP Cost</th>
                <td>3.05 <button type="button" class="float-right btn small-square-btn btn-link eye-btn"><i class="fa fa-eye"></i></button></td>
                <td>3.05 <button type="button" class="float-right btn small-square-btn btn-link eye-btn"><i class="fa fa-eye"></i></button></td>
              </tr>
              <tr>
                <td>
                  <span class="d-block small-grey-text">Process Cost</span>
                  <span class="d-block small-grey-text">Operation Cost</span>
                  <span class="d-block small-grey-text">Surface Treatment</span>
                  <span class="d-block small-grey-text">Suportation Cost</span>
                </td>
                <td>
                  <span class="d-block small-grey-text">40.00</span>
                  <span class="d-block small-grey-text">25.00</span>
                  <span class="d-block small-grey-text">18.00</span>
                  <span class="d-block small-grey-text">2.00</span>
                </td>
                <td>
                  <span class="d-block small-grey-text">48.00</span>
                  <span class="d-block small-grey-text">29.00</span>
                  <span class="d-block small-grey-text">18.00</span>
                  <span class="d-block small-grey-text">2.00</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
            overheadData={viewOverheadData}
            profitData={viewProfitData}
            rejectAndModelType={viewRejectAndModelType}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        isViewPackagingFreight &&
        <ViewPackagingAndFreight
          isOpen={isViewPackagingFreight}
          packagingAndFreightCost={viewPackagingFreight}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      }
      {
        isViewToolCost &&
        <ViewToolCost
          isOpen={isViewToolCost}
          viewToolCost={viewToolCost}
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
