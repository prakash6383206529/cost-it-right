import React, { Component, useEffect, useState } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
// import { runSimulation } from '../actions/Simulation'
import { useDispatch, useSelector } from 'react-redux'
import {
    setCostingViewData, setCostingApprovalData, createZBCCosting, createVBCCosting, getZBCCostingByCostingId,
    storePartNumber, getSingleCostingDetails
  } from '../../costing/actions/Costing'
import { useHistory } from "react-router-dom";
import ViewBOP from '../../../components/costing/components/Drawers/ViewBOP'
import ViewConversionCost from '../../../components/costing/components/Drawers/ViewConversionCost'
import ViewRM from '../../../components/costing/components/Drawers/ViewRM'
import ViewOverheadProfit from '../../../components/costing/components/Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from '../../../components/costing/components/Drawers/ViewPackagingAndFreight'
import ViewToolCost from '../../../components/costing/components/Drawers/viewToolCost'
import { checkForDecimalAndNull, formViewData, loggedInUserId, userDetails } from '../../../helper'
import Attachament from '../../../components/costing/components/Drawers/Attachament'
import { DRAFT, FILE_URL, REJECTED, VBC, ZBC } from '../../../config/constants'



function CostingDetailSimulationDrawer(props) {
    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };
    
    // table code starts here
        const { viewMode, showDetail, technologyId, costingID, showWarningMsg } = props
        let history = useHistory();
    
        const dispatch = useDispatch()
        const [addComparisonToggle, setaddComparisonToggle] = useState(false)
        const [isEditFlag, setIsEditFlag] = useState(false)
        const [editObject, setEditObject] = useState({})
    
        /* Constant  for drawer toggle*/
        const [isViewBOP, setViewBOP] = useState(false)
        const [isViewConversionCost, setIsViewConversionCost] = useState(false)
        const [isViewRM, setIsViewRM] = useState(false)
        const [isViewToolCost, setIsViewToolCost] = useState(false)
        const [isViewOverheadProfit, setIsViewOverheadProfit] = useState(false)
        const [isViewPackagingFreight, setIsViewPackagingFreight] = useState(false)
        const [showApproval, setShowApproval] = useState(false)
    
        /*Constants for sending data in drawer*/
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
        const [isAttachment, setAttachment] = useState(false)
    
        /*CONSTANT FOR  CREATING AND EDITING COSTING*/
        const [stepOne, setStepOne] = useState(true);
        const [stepTwo, setStepTwo] = useState(false);
        const [partInfoStepTwo, setPartInfo] = useState({});
        const [index, setIndex] = useState('')
    
        const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    
        const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
        const partInfo = useSelector((state) => state.costing.partInfo)
        const partNumber = useSelector(state => state.costing.partNo);
        const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    
        // const [showWarningMsg, setShowWarningMsg] = useState(false)
        useEffect(() => {
    
        }, [multipleCostings])
        /**
         * @method ViewBOP
         * @description SET VIEW BOP DATA FOR DRAWER
         */
        const viewBop = (index) => {
        setViewBOP(true)
        setIsViewConversionCost(false)
        if (index != -1) {
            let data = viewCostingData[index].netBOPCostView
            let bopPHandlingCharges = viewCostingData[index].bopPHandlingCharges
            let bopHandlingPercentage = viewCostingData[index].bopHandlingPercentage
            setViewBOPData({ BOPData: data, bopPHandlingCharges: bopPHandlingCharges, bopHandlingPercentage: bopHandlingPercentage })
        }
        }
        /**
         * @method viewConversionCostData
         * @description SET COVERSION DATA FOR DRAWER
         */
        const viewConversionCost = (index) => {
        setIsViewConversionCost(true)
        setViewBOP(false)
        if (index != -1) {
            let data = viewCostingData[index].netConversionCostView
            let netTransportationCostView = viewCostingData[index].netTransportationCostView
            let surfaceTreatmentDetails = viewCostingData[index].surfaceTreatmentDetails
            setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails })
        }
        }
        /**
         * @method viewRM
         * @description SET RM DATA FOR DRAWER
         */
        const viewRM = (index) => {
        let data = viewCostingData[index].netRMCostView
        setIsViewRM(true)
        setIndex(index)
        setViewRMData(data)
        }
        /**
         * @method overHeadProfit
         * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
         */
        const overHeadProfit = (index) => {
        let overHeadData = viewCostingData[index].netOverheadCostView
        let profitData = viewCostingData[index].netProfitCostView
        let rejectData = viewCostingData[index].netRejectionCostView
        let modelType = viewCostingData[index].modelType
    
        setIsViewOverheadProfit(true)
        setViewOverheadData(overHeadData)
        setViewProfitData(profitData)
        setViewRejectAndModelType({ rejectData: rejectData, modelType: modelType })
        }
        /**
         * @method viewPackagingAndFrieghtData
         * @description SET PACKAGING AND FRIEGHT DATA FOR DRAWER
         */
        const viewPackagingAndFrieghtData = (index) => {
        let packagingData = viewCostingData[index].netPackagingCostView
        let freightData = viewCostingData[index].netFreightCostView
    
        setIsViewPackagingFreight(true)
        setViewPackagingFreight({
            packagingData: packagingData,
            freightData: freightData,
        })
        }
        /**
         * @method viewToolCostData
         * @description SET TOOL DATA FOR DRAWER
         */
        const viewToolCostData = (index) => {
        let data = viewCostingData[index].netToolCostView
        setIsViewToolCost(true)
        setViewToolCost(data)
        }
    
        const deleteCostingFromView = (index) => {
        let temp = viewCostingData
        temp.splice(index, 1)
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
            typeOfCosting: viewCostingData[index].zbc,
            VendorId: viewCostingData[index].vendorId,
            vendorName: viewCostingData[index].vendorName,
            vendorPlantName: viewCostingData[index].vendorPlantName,
            vendorPlantId: viewCostingData[index].vendorPlantId
        }
    
        setIsEditFlag(true)
        setaddComparisonToggle(true)
        setEditObject(editObject)
        }
    
        /**
         * @method addNewCosting
         * @description ADD NEW COSTING (GO TO COSTING DETAIL)
        */
    
        const addNewCosting = (index) => {
        partNumber.isChanged = false
        dispatch(storePartNumber(partNumber))
        history.push('/costing')
        const userDetail = userDetails()
        let tempData = viewCostingData[index]
        const type = viewCostingData[index].zbc === 0 ? 'ZBC' : 'VBC'
        if (type === ZBC) {
            const data = {
            PartId: partNumber.partId,
            PartTypeId: partInfo.PartTypeId,
            PartType: partInfo.PartType,
            TechnologyId: tempData.technologyId,
            ZBCId: userDetail.ZBCSupplierInfo.VendorId,
            UserId: loggedInUserId(),
            LoggedInUserId: loggedInUserId(),
            PlantId: tempData.plantId,
            PlantName: tempData.plantName,
            PlantCode: tempData.plantCode,
            ShareOfBusinessPercent: tempData.shareOfBusinessPercent,
            IsAssemblyPart: partInfo.IsAssemblyPart,
            PartNumber: partInfo.PartNumber,
            PartName: partInfo.PartName,
            Description: partInfo.Description,
            ECNNumber: partInfo.ECNNumber,
            RevisionNumber: partInfo.RevisionNumber,
            DrawingNumber: partInfo.DrawingNumber,
            Price: partInfo.Price,
            EffectiveDate: partInfo.EffectiveDate,
            }
    
            dispatch(createZBCCosting(data, (res) => {
    
            if (res.data.Result) {
                setPartInfo(res.data.Data)
                dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, (res) => { }))
                showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
            }
            }),
            )
        } else if (type === VBC) {
            const data = {
            PartId: partInfo.PartId,
            PartTypeId: partInfo.PartTypeId,
            PartType: partInfo.PartType,
            TechnologyId: tempData.technologyId,
            VendorId: tempData.vendorId,
            VendorPlantId: tempData.vendorPlantId,
            VendorPlantName: tempData.vendorPlantName,
            VendorPlantCode: tempData.vendorPlantCode,
            VendorName: tempData.vendorName,
            VendorCode: tempData.vendorCode,
            UserId: loggedInUserId(),
            LoggedInUserId: loggedInUserId(),
            ShareOfBusinessPercent: tempData.shareOfBusinessPercent,
            IsAssemblyPart: partInfo.IsAssemblyPart,
            PartNumber: partInfo.PartNumber,
            PartName: partInfo.PartName,
            Description: partInfo.Description,
            ECNNumber: partInfo.ECNNumber,
            RevisionNumber: partInfo.RevisionNumber,
            DrawingNumber: partInfo.DrawingNumber,
            Price: partInfo.Price,
            EffectiveDate: partInfo.EffectiveDate,
            }
    
            dispatch(
            createVBCCosting(data, (res) => {
                if (res.data.Result) {
                setPartInfo(res.data.Data)
                dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, (res) => { }))
                showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
                }
            }),
            )
        }
        }
    
        /**
     * @method editCostingDetail
     * @description EDIT COSTING DETAIL (WILL GO TO COSTING DETAIL PAGE)
     */
        const editCostingDetail = (index) => {
        partNumber.isChanged = false
        dispatch(storePartNumber(partNumber))
        history.push('/costing')
        let tempData = viewCostingData[index]
        const type = viewCostingData[index].zbc === 0 ? 'ZBC' : 'VBC'
        if (type === ZBC) {
            dispatch(getZBCCostingByCostingId(tempData.costingId, (res) => { }))
            showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
        }
        if (type === VBC) {
            dispatch(getZBCCostingByCostingId(tempData.costingId, (res) => { }))
            showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
        }
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
        setMultipleCostings([])
        }
    
        /**
         * @method closeViewDrawer
         * @description Closing view Drawer
         */
        const closeViewDrawer = (e = ' ') => {
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
        const closeShowApproval = (e = '', type) => {
        setShowApproval(false)
    
        setMultipleCostings([])
    
        if (type === 'Submit') {
            dispatch(storePartNumber(''))
            props.resetData()
        }
        }
        /**
         * @method closeShowApproval
         * @description FOR CLOSING APPROVAL DRAWER
         */
        const closeAttachmentDrawer = (e = '') => {
        setAttachment(false)
        }
    
        const handleMultipleCostings = (checked, index) => {
    
        let temp = multipleCostings
    
        if (checked) {
            temp.push(viewCostingData[index].costingId)
            // setMultipleCostings(temp)
        } else {
            const ind = multipleCostings.findIndex((data) => data === viewCostingData[index].costingId,)
            if (ind !== -1) {
            temp.splice(ind, 1)
            }
            // setMultipleCostings(temp)
        }
    
        setMultipleCostings(temp)
        setFlag(!flag)
        // let data = viewCostingData[index].netBOPCostView;
        // setViewBOPData(data)
        }
    
        const moduleHandler = (id) => {
        let temp = multipleCostings
        if (temp.includes(id)) {
            const ind = multipleCostings.findIndex((data) => data === id)
            if (ind !== -1) {
            temp.splice(ind, 1)
            }
        } else {
            temp.push(id)
        }
        setMultipleCostings(temp)
        setFlag(!flag)
        }
    
    
    
        const sendForApprovalData = (costingIds) => {
    
        let temp = viewApprovalData
        costingIds &&
            costingIds.map((id) => {
            let index = viewCostingData.findIndex((data) => data.costingId == id)
            if (index !== -1) {
                let obj = {}
                // add vendor key here
                obj.typeOfCosting = viewCostingData[index].zbc
                obj.plantCode = viewCostingData[index].plantCode
                obj.plantName = viewCostingData[index].plantName
                obj.plantId = viewCostingData[index].plantId
                obj.vendorId = viewCostingData[index].vendorId
                obj.vendorName = viewCostingData[index].vendorName
                obj.vendorCode = viewCostingData[index].vendorCode
                obj.vendorPlantId = viewCostingData[index].vendorPlantId
                obj.vendorPlantName = viewCostingData[index].vendorPlantName
                obj.vendorPlantCode = viewCostingData[index].vendorPlantCode
                obj.costingName = viewCostingData[index].CostingNumber
                obj.costingId = viewCostingData[index].costingId
                obj.oldPrice = viewCostingData[index].oldPoPrice
                obj.revisedPrice = viewCostingData[index].poPrice
                obj.variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0) - Number(viewCostingData[index].oldPoPrice && viewCostingData[index].oldPoPrice !== '-' ? viewCostingData[index].oldPoPrice : 0)
                obj.consumptionQty = ''
                obj.remainingQty = ''
                obj.annualImpact = ''
                obj.yearImpact = ''
                obj.reason = ''
                obj.ecnNo = ''
                obj.effectiveDate = viewCostingData[index].effectiveDate
                obj.partNo = viewCostingData[index].partId
                temp.push(obj)
            }
            dispatch(setCostingApprovalData(temp))
            })
        }
    
        const checkCostings = () => {
        if (multipleCostings.length === 0) {
            toastr.warning('Please select at least one costing to send for approval')
            return
        } else {
            sendForApprovalData(multipleCostings)
            setShowApproval(true)
        }
        }
    
        useEffect(() => {
        // if (viewCostingData !== undefined && viewCostingData.length === 0) {
        //   setShowWarningMsg(true)
        // } else {
        //   setShowWarningMsg(false)
        // }
        }, [viewCostingData])
    
        useEffect(() => {
        if (costingID && Object.keys(costingID).length > 0) {
            dispatch(getSingleCostingDetails(costingID, (res) => {
            if (res.data.Data) {
                let dataFromAPI = res.data.Data
                const tempObj = formViewData(dataFromAPI)
                dispatch(setCostingViewData(tempObj))
            }
            },
            ))
        }
        }, [costingID])
    // table code ends here

    return (
        <div>
            {<>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper drawer-md simulation-costing-details-drawers"}>
                            <form noValidate className="form">
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {"Costing Details"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <Row className="ml-0 pb-3">
                                    <Col md="12">
                                        <h6 class="left-border d-inline-block mr-4">ZBC</h6>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Plant Code:</span> <span>Plant 001</span></div>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Costing ID:</span> <span>CS6745</span></div>
                                    </Col>
                                </Row>

                                <Row className="ml-0 pb-3">
                                    <Col md="3">
                                        <label>PO Price Old</label>
                                        <label className="form-control input-form-control green-value">7253.17</label>
                                    </Col>
                                    <Col md="3">
                                        <label>PO Price New</label>
                                        <label className="form-control input-form-control green-value">7096.36</label>
                                    </Col>
                                    <Col md="3">
                                        <label>RM Cost Old</label>
                                        <label className="form-control input-form-control red-value">4009.00</label>
                                    </Col>
                                    <Col md="3">
                                        <label>RM Cost New</label>
                                        <label className="form-control input-form-control red-value">4029.00</label>
                                    </Col>
                                </Row>

                                <Row className="ml-0 pb-3">
                                    <Col md="12">
                                        <div class="table-responsive">
                                            <table class="table table-bordered costing-summary-table">
                                            <tbody>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">RM Name-Grade</span>
                                                    <span class="d-block small-grey-text">Gross Weight</span>
                                                    <span class="d-block small-grey-text">Finish Weight</span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <span class="d-block small-grey-text">{data.rm}</span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.gWeight, initialConfiguration.NoOfDecimalForInputOutput)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.fWeight, initialConfiguration.NoOfDecimalForInputOutput)}
                                                        </span>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net RM Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.netRM, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => viewRM(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net BOP Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.netBOP, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => viewBop(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">Process Cost</span>
                                                    <span class="d-block small-grey-text">Operation Cost</span>
                                                    <span class="d-block small-grey-text">
                                                    Surface Treatment
                                                </span>
                                                    <span class="d-block small-grey-text">
                                                    Transportation Cost
                                                </span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.pCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.oCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.sTreatment, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.tCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net Conversion Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.nConvCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => viewConversionCost(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">
                                                    Model Type For Overhead/Profit
                                                </span>
                                                    <br />
                                                    <span class="d-block small-grey-text">Overhead On</span>
                                                    <span class="d-block small-grey-text">Profit On</span>
                                                    <span class="d-block small-grey-text">Rejection On</span>
                                                    <span class="d-block small-grey-text">ICC On</span>
                                                    <span class="d-block small-grey-text">Payment Terms</span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <span class="d-block">{data.modelType}</span>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50">
                                                            {data.aValue.applicability}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50">
                                                            {data.aValue.value}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {data.overheadOn.overheadTitle}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {checkForDecimalAndNull(data.overheadOn.overheadValue, initialConfiguration.NoOfDecimalForPrice)}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {data.profitOn.profitTitle}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {checkForDecimalAndNull(data.profitOn.profitValue, initialConfiguration.NoOfDecimalForPrice)}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {data.rejectionOn.rejectionTitle}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {checkForDecimalAndNull(data.rejectionOn.rejectionValue, initialConfiguration.NoOfDecimalForPrice)}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {data.iccOn.iccTitle}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {checkForDecimalAndNull(data.iccOn.iccValue, initialConfiguration.NoOfDecimalForPrice)}
                                                            </span>
                                                        </div>
                                                        <div class="d-flex">
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {data.paymentTerms.paymentTitle}
                                                            </span>{' '}
                                                        &nbsp;{' '}
                                                            <span class="d-inline-block w-50 small-grey-text">
                                                            {checkForDecimalAndNull(data.paymentTerms.paymentValue, initialConfiguration.NoOfDecimalForPrice)}
                                                            </span>
                                                        </div>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net Overhead & Profits</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => overHeadProfit(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">Packaging Cost</span>
                                                    <span class="d-block small-grey-text">Freight</span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.packagingCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.freight, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net Packaging & Freight</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => viewPackagingAndFrieghtData(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">
                                                    Tool Maintenance Cost
                                                </span>
                                                    <span class="d-block small-grey-text">Tool Price</span>
                                                    <span class="d-block small-grey-text">
                                                    Amortization Quantity(Tool Life)
                                                </span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {checkForDecimalAndNull(data.toolPrice, initialConfiguration.NoOfDecimalForPrice)}
                                                        </span>
                                                        <span class="d-block small-grey-text">
                                                            {data.amortizationQty}
                                                        </span>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Total Tool Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.totalToolCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        <button
                                                            type="button"
                                                            class="float-right btn small-square-btn btn-link eye-btn"
                                                            onClick={() => viewToolCostData(index)}
                                                        >
                                                            <i class="fa fa-eye"></i>
                                                        </button>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Total Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return (
                                                        <td>
                                                        {checkForDecimalAndNull(data.totalCost, initialConfiguration.NoOfDecimalForPrice)}
                                                        {/* <button
                                                        type="button"
                                                        class="float-right btn small-square-btn btn-link eye-btn"
                                                    >
                                                        <i class="fa fa-eye"></i>
                                                    </button> */}
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">
                                                    Hundi/Other Discount
                                                </span>
                                                    <span class="d-block small-grey-text"></span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <div className="d-flex">
                                                            <span className="d-inline-block w-50 ">{data.otherDiscount.discount}</span> &nbsp;{' '}
                                                            <span className="d-inline-block w-50 ">{data.otherDiscount.value}</span>
                                                        </div>
                                                        <div className="d-flex">
                                                            <span className="d-inline-block w-50 small-grey-text">
                                                            {data.otherDiscountValue.discountPercentValue}
                                                            </span>{' '}
                                                            {' '}
                                                            <span className="d-inline-block w-50 small-grey-text">{checkForDecimalAndNull(data.otherDiscountValue.discountValue, initialConfiguration.NoOfDecimalForPrice)}</span>
                                                        </div>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Any Other Cost</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return <td>{checkForDecimalAndNull(data.anyOtherCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                                    })}
                                                </tr>
                                                <tr>
                                                <th>Remark</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return <td>{data.remark}</td>
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net PO Price(INR)</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return <td>{checkForDecimalAndNull(data.nPOPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>
                                                    <span class="d-block small-grey-text">Currency</span>
                                                </td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        <div>
                                                            <span>{data.currency.currencyTitle}</span> &nbsp;{' '}
                                                            <span>{checkForDecimalAndNull(data.currency.currencyValue, initialConfiguration.NoOfDecimalForPrice)}</span>
                                                        </div>
                                                        </td>
                                                    )
                                                    })}
                                                </tr>
                                                <tr class="background-light-blue">
                                                <th>Net PO Price</th>
                                                {viewCostingData &&
                                                    viewCostingData.map((data, index) => {
                                                    return <td>{data.nPOPriceWithCurrency !== 0 ? checkForDecimalAndNull(data.nPOPriceWithCurrency, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data.nPOPrice, initialConfiguration.NoOfDecimalForPrice)}({(data.currency.currencyTitle !== '-' ? data.currency.currencyTitle : 'INR')})</td>
                                                    })}
                                                </tr>
                                                <tr>
                                                <td>Attachment</td>
                                                {viewCostingData &&
                                                    viewCostingData.map((data) => {
                                                    return (
                                                        <td>
                                                        {data.attachment && data.attachment.length == 0 ? (
                                                            'No attachment found'
                                                        ) : data.attachment.length == 1 ? (

                                                            <td>
                                                            {data.attachment &&
                                                                data.attachment.map((f) => {
                                                                const withOutTild = f.FileURL
                                                                    ? f.FileURL.replace('~', '')
                                                                    : ''
                                                                const fileURL = `${FILE_URL}${withOutTild}`
                                                                return (
                                                                    <div className={"single-attachment images"}>
                                                                    <a href={fileURL} target="_blank">
                                                                        {f.OriginalFileName}
                                                                    </a>
                                                                    </div>
                                                                )
                                                                })}
                                                            </td>
                                                        )
                                                            : (
                                                            // <img
                                                            //   src={require('../../../assests/images/times.png')}
                                                            //   alt="cancel-icon.jpg"
                                                            // />
                                                            // <button
                                                            //   onClick={() => {
                                                            //     setAttachment(true)
                                                            //   }}
                                                            // >
                                                            //   View Attachment
                                                            // </button>
                                                            <a
                                                                href="javascript:void(0)"
                                                                onClick={() => setAttachment(true)}
                                                            > View Attachment</a>
                                                            )}
                                                        </td>
                                                    )
                                                    })}
                                                </tr>

                                                {!viewMode && (
                                                <tr class="background-light-blue">
                                                    <td className="text-center"></td>

                                                    {viewCostingData.map((data, index) => {

                                                    return (

                                                        <td class="text-center">
                                                        {
                                                            data.status === DRAFT &&
                                                            <button
                                                            class="user-btn"
                                                            //   disabled={(data.status === DRAFT || data.status === WAITING_FOR_APPROVAL) ? false : true}
                                                            onClick={() => {
                                                                sendForApprovalData([data.costingId], index)
                                                                setShowApproval(true)
                                                            }}
                                                            >
                                                            {' '}
                                                            <img
                                                                class="mr-1"
                                                                src={require('../../../assests/images/send-for-approval.svg')}
                                                            ></img>
                                                        Send For Approval
                                                    </button>
                                                        }
                                                        </td>

                                                    )
                                                    })}
                                                </tr>
                                                )}
                                            </tbody>
                                            </table>
                                        </div>
                                    </Col>
                                </Row>

                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 px-3">
                                    <div className="text-right px-3">
                                        <button class="user-btn approval-btn mr5 float-none" onClick={toggleDrawer}>
                                            <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')}></img>{' '}
                                            {'Send For Approval'}
                                        </button>
                                        <button type="submit" className="user-btn float-none">
                                            <div className={"check-icon"}>
                                                <img
                                                    src={require("../../../assests/images/check.png")}
                                                    alt="check-icon.jpg"
                                                />
                                            </div>{" "}
                                            {"Save Simulation"}
                                        </button>
                                    </div>
                                </div>
                            </Row>
                        </div>
                    </Container>
                </Drawer>
            </>}
            {isViewBOP && (
        <ViewBOP
          isOpen={isViewBOP}
          viewBOPData={viewBOPData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewConversionCost && (
        <ViewConversionCost
          isOpen={isViewConversionCost}
          viewConversionCostData={viewConversionCostData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewRM && (
        <ViewRM
          isOpen={isViewRM}
          viewRMData={viewRMData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
          index={index}
          technologyId={technologyId}
        />
      )}
      {isViewOverheadProfit && (
        <ViewOverheadProfit
          isOpen={isViewOverheadProfit}
          overheadData={viewOverheadData}
          profitData={viewProfitData}
          rejectAndModelType={viewRejectAndModelType}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewPackagingFreight && (
        <ViewPackagingAndFreight
          isOpen={isViewPackagingFreight}
          packagingAndFreightCost={viewPackagingFreight}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewToolCost && (
        <ViewToolCost
          isOpen={isViewToolCost}
          viewToolCost={viewToolCost}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isAttachment && (
        <Attachament
          isOpen={isAttachment}
          closeDrawer={closeAttachmentDrawer}
          anchor={'right'}
        />
      )}
        </div>
    );
}

export default CostingDetailSimulationDrawer;