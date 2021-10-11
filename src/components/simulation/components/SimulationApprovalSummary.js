
import React, { useEffect, useState } from 'react'
import { Row, Col, Table } from 'reactstrap'
import moment from 'moment'
import { Fragment } from 'react'
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow';
import ViewDrawer from '../../costing/components/approval/ViewDrawer'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { costingHeadObjs } from '../../../config/masterData';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common';
import { getAmmendentStatus, getApprovalSimulatedCostingSummary, getComparisionSimulationData, setAttachmentFileData } from '../actions/Simulation'
import { EMPTY_GUID, EXCHNAGERATE, RMDOMESTIC, RMIMPORT, ZBC } from '../../../config/constants';
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import { checkForDecimalAndNull, formViewData, checkForNull, getConfigurationKey, loggedInUserId, userDetails } from '../../../helper';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { setCostingViewData } from '../../costing/actions/Costing';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { Errorbox } from '../../common/ErrorBox';
import { Redirect } from 'react-router';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'
import { pushAPI } from '../../simulation/actions/Simulation'
import AttachmentSec from '../../costing/components/approval/AttachmentSec';


const gridOptions = {};

function SimulationApprovalSummary(props) {
    // const { isDomestic, list, isbulkUpload, rowCount, technology, master } = props
    const { approvalDetails, approvalData, isbulkUpload, list, technology, master, type, isSimulation } = props;
    const { approvalNumber, approvalId, SimulationTechnologyId } = props.location.state
    const [shown, setshown] = useState(false)
    const [amendment, setAmendment] = useState(true)
    const [token, setToken] = useState('')
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [showImpactedData, setshowImpactedData] = useState(false)

    const rmDomesticListing = useSelector(state => state.material.rmDataList)

    const [showListing, setShowListing] = useState(false)
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [viewButton, setViewButton] = useState(false)
    const [costingSummary, setCostingSummary] = useState(true)
    const [costingList, setCostingList] = useState([])
    const [simulationDetail, setSimulationDetail] = useState({})
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval
    const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
    const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
    const [pushButton, setPushButton] = useState(false)
    const [loader, setLoader] = useState(true)
    const [oldCostingList, setOldCostingList] = useState([])


    const [compareCosting, setCompareCosting] = useState(false)
    const [compareCostingObj, setCompareCostingObj] = useState([])
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [id, setId] = useState('')
    const [status, setStatus] = useState('')
    const [isSuccessfullyInsert, setIsSuccessfullyInsert] = useState(true)
    const [noContent, setNoContent] = useState(false)

    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const approvalSimulatedCostingSummary = useSelector((state) => state.approval.approvalSimulatedCostingSummary)
    const userList = useSelector(state => state.auth.userList)
    const { technologySelectList, plantSelectList } = useSelector(state => state.comman)

    const [acc1, setAcc1] = useState(false)
    const [acc2, setAcc2] = useState(false)
    const [acc3, setAcc3] = useState(false)



    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const userLoggedIn = loggedInUserId()
    const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)

    useEffect(() => {
        dispatch(getTechnologySelectList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))

        const reqParams = {
            approvalTokenNumber: approvalNumber,
            approvalId: approvalId,
            loggedInUserId: loggedInUserId(),
        }
        dispatch(getApprovalSimulatedCostingSummary(reqParams, res => {
            const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow,
                IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId,
                SenderReason, ImpactedMasterDataList, AmendmentDetails, Attachements } = res.data.Data
            setCostingList(SimulatedCostingList)
            setOldCostingList(SimulatedCostingList)
            setApprovalLevelStep(SimulationSteps)
            setSimulationDetail({
                SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings,
                SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId,
                DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason,
                ImpactedMasterDataList: ImpactedMasterDataList, AmendmentDetails: AmendmentDetails, Attachements: Attachements
            })
            dispatch(setAttachmentFileData(Attachements, () => { }))
            setIsApprovalDone(IsSent)
            // setIsApprovalDone(false)
            setShowFinalLevelButton(IsFinalLevelButtonShow)
            setShowPushButton(IsPushedButtonShow)
            setTimeout(() => {

                setLoader(false)
            }, 500);
        }))
        const obj = {
            approvalTokenNumber: approvalNumber
        }
        dispatch(getAmmendentStatus(obj, res => {
            setNoContent(res.status === 204 ? true : false)

            if (res.status !== 204) {
                const { RecordInsertStatus, IsSuccessfullyInsert } = res.data.DataList[0]
                setStatus(RecordInsertStatus)
                setIsSuccessfullyInsert(IsSuccessfullyInsert)
            }
        }))
    }, [])


    const closeViewDrawer = (e = '') => {
        setViewButton(false)
    }

    const closeApproveDrawer = (e = '', type) => {
        if (type === 'submit') {
            setApproveDrawer(false)
            setShowListing(true)
            setRejectDrawer(false)
        } else {
            setApproveDrawer(false)
            setRejectDrawer(false)
        }
    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'costingHead') {
            return costingHeadObjs;
        }

        if (label === 'PartList') {
            partSelectList && partSelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })

            return tempDropdownList
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                tempDropdownList.push({ label: item.Text, value: item.Value })
            });
            return tempDropdownList;
        }

        if (label === 'Status') {
            statusSelectList && statusSelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }

        if (label === 'users') {
            userList && userList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    /**
    * @method resetHandler
    * @description Reseting all filter
    */
    const resetHandler = () => {
        setValue('partNo', '')
        setValue('plantCode', '')
        setCostingList(oldCostingList)

    }

    const DisplayCompareCosting = (el, data) => {
        setId(data.CostingNumber)
        // setCompareCostingObj(el)
        let obj = {
            simulationApprovalProcessSummaryId: el,
            simulationId: EMPTY_GUID,
            costingId: EMPTY_GUID
        }
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            const obj2 = formViewData(Data.NewCosting)
            const obj3 = formViewData(Data.Variance)
            const objj3 = [obj1[0], obj2[0], obj3[0]]
            setCompareCostingObj(objj3)
            dispatch(setCostingViewData(objj3))
            setCompareCosting(true)
        }))
    }

    /**
    * @method onSubmit
    * @description filtering data on Apply button
    */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') && getValues('partNo').value
        const tempPlant = getValues('plantCode') && getValues('plantCode').value

        let temp = []
        if (tempPartNo && tempPlant) {
            temp = costingList && costingList.filter(item => item.PartId === tempPartNo && item.PlantId === tempPlant)
        } else {
            if (tempPlant) {
                temp = costingList && costingList.filter(item => item.PlantId === tempPlant)

            } else {
                temp = costingList && costingList.filter(item => item.PartId === tempPartNo)

            }
        }
        setCostingList(temp)

    }

    const VerifyImpact = () => {
        setIsVerifyImpactDrawer(true)
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell !== null ? cell : '-'
    }

    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const oldPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetPOPriceOtherCurrency > row.OldNetPOPriceOtherCurrency) ? 'red-value form-control' : (row.NewNetPOPriceOtherCurrency < row.OldNetPOPriceOtherCurrency) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetPOPriceOtherCurrency > row.OldNetPOPriceOtherCurrency) ? 'red-value form-control' : (row.NewNetPOPriceOtherCurrency < row.OldNetPOPriceOtherCurrency) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const rmNameFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell ? `${cell}-${row.RMGrade}` : '-'
    }

    const varianceFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (String(SimulationTechnologyId) === RMDOMESTIC || String(SimulationTechnologyId) === RMIMPORT) {
            return checkForDecimalAndNull(row.OldRMPrice - row.NewRMPrice, getConfigurationKey().NoOfDecimalForPrice)
        } else if (String(SimulationTechnologyId) === EXCHNAGERATE) {
            return checkForDecimalAndNull(row.OldExchangeRate - row.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)

        }
    }


    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <button className="Balance mb-0" type={'button'} onClick={() => DisplayCompareCosting(cell, row)} />
            </>
        )
    }



    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
            </>
        )
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }



    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const NewcostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '-';
    }



    const rawMaterailFormat = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? `${cell}- ${row.RMGrade}` : '-';
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    if (showListing === true) {
        return <Redirect to="/simulation-history" />
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

        window.screen.width >= 1600 && params.api.sizeColumnsToFit()
    };



    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    const frameworkComponents = {
        // totalValueRenderer: this.buttonFormatter,
        // effectiveDateRenderer: this.effectiveDateFormatter,
        // costingHeadRenderer: this.costingHeadFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        buttonFormatter: buttonFormatter,
        newRMFormatter: newRMFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        rawMaterailFormat: rawMaterailFormat,
        varianceFormatter: varianceFormatter,
        newERFormatter: newERFormatter,
        oldERFormatter: oldERFormatter,
        oldPOCurrencyFormatter: oldPOCurrencyFormatter,
        newPOCurrencyFormatter: newPOCurrencyFormatter
    };

    const errorBoxClass = () => {
        let temp
        temp = isSuccessfullyInsert === false ? '' : 'success'
        if (noContent === true) {
            temp = 'd-none'
        }
        return temp
    }

    const rePush = () => {
        let pushObj = {}
        let temp = []
        costingList && costingList.map(item => {
            const vendor = item.VendorName.split('(')[1]
            temp.push({ TokenNumber: simulationDetail.Token, Vendor: vendor.split(')')[0], PurchasingGroup: userDetails().DepartmentCode, Plant: item.PlantCode, MaterialCode: item.PartNo, NewPOPrice: item.NewPOPrice, EffectiveDate: simulationDetail.EffectiveDate, SimulationId: simulationDetail.SimulationId })
        })
        pushObj.LoggedInUserId = userLoggedIn
        pushObj.AmmendentDataRequests = temp
        dispatch(pushAPI(pushObj, () => { }))
        setShowListing(true)
    }




    return (
        <>
            {showListing === false &&
                <>
                    {loader && <LoaderCustom />}
                    <div className="container-fluid  smh-approval-summary-page">
                        <Errorbox customClass={errorBoxClass()} errorText={status} />
                        <h2 className="heading-main">Approval Summary</h2>
                        <Row>
                            <Col md="8">
                                <div className="left-border">
                                    {'Approval Workflow (Token No. '}
                                    {`${simulationDetail && simulationDetail.Token ? simulationDetail.Token : '-'}) :`}
                                </div>
                            </Col>
                            <Col md="4" className="text-right">
                                <div className="right-border">
                                    <button type={'button'} className="apply mr5" onClick={() => setShowListing(true)}>
                                        <div className={'back-icon'}></div>
                                        {'Back '}
                                    </button>
                                    <button type={'button'} className="apply mr5" onClick={() => setViewButton(true)}>
                                        View All
                                    </button>
                                    {/* <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"save-icon"}></div>{"Verify Impact "}
                                    </button> */}
                                </div>
                            </Col>
                        </Row>

                        {/* Code for approval workflow */}
                        <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={simulationDetail.Token} />

                        <Row>
                            <Col md="10"><div className="left-border">{'Amendment Details:'}</div></Col>
                            {/* <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAmendment(!amendment) }}>
                                        {amendment ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col> */}
                        </Row>
                        {/* {amendment && */}
                        <Row>
                            <Col md="12" className="mb-2">
                                <Table responsive className="table cr-brdr-main" size="sm">
                                    <thead>
                                        <tr>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Token No.:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.TokenNumber}</span>
                                            </th>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Technology:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.Technology}</span>
                                            </th>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Parts Supplied:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.PartsSupplied}</span>
                                            </th>
                                            {/* <th className="align-top">
                                                <span className="d-block grey-text">{`Vendor Name:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.VendorName}</span>
                                            </th> */}
                                            {
                                                String(SimulationTechnologyId) !== EXCHNAGERATE &&
                                                (<th className="align-top">
                                                    <span className="d-block grey-text">{`Costing Head:`}</span>
                                                    <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.CostingHead}</span>
                                                </th>)
                                            }
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`No. Of Costing:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.NumberOfImpactedCosting}</span>
                                            </th>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Reason:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.Reason}</span>
                                            </th>

                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Masters:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.SimulationTechnology}</span>
                                            </th>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Effective Date:`}</span>
                                                <span className="d-block">{simulationDetail && moment(simulationDetail.AmendmentDetails?.EffectiveDate).format('DD/MM/yyy')}</span>
                                            </th>
                                            {/* <th className="align-top">
                                                <span className="d-block grey-text">{`Impact for Annum(INR):`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.ImpactForAnnum}</span>
                                            </th>
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Impact for the Quarter(INR):`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.ImpactForTheQuarter}</span>
                                            </th> */}
                                        </tr>
                                    </thead>
                                </Table>
                            </Col>
                        </Row>
                        {/* } */}

                        <Row>
                            <Col md="6"><div className="left-border">{'Impacted Master Data:'}</div></Col>
                            <Col md="6" className="text-right">
                                <div className={'right-details'}>
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setshowImpactedData(!showImpactedData) }}>
                                        {showImpactedData ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col>

                            <div className="accordian-content w-100 px-3 impacted-min-height">
                                {showImpactedData && <Impactedmasterdata data={simulationDetail.ImpactedMasterDataList} masterId={simulationDetail.SimulationTechnologyId} />}

                            </div>

                        </Row>

                        {/* FG wise Impact section start */}
                        <Row >
                            <Col md="12">
                                <div className="left-border">{'FG wise Impact:'}</div>
                            </Col>
                        </Row>
                        <Fgwiseimactdata />

                        {/* FG wise Impact section end */}

                        <Row>
                            <Col md="10">
                                <div className="left-border">{'Summary:'}</div>
                            </Col>
                            <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setCostingSummary(!costingSummary) }}>
                                        {costingSummary ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col>
                        </Row>

                        {costingSummary &&
                            <>
                                <div className={`ag-grid-react`}>
                                    <Row className="pb-2">
                                        <Col md="12">
                                            <Row>
                                                <Col>
                                                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                                        <div className="ag-grid-header">
                                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                                            <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                                <div className="refresh mr-0"></div>
                                                            </button>
                                                        </div>
                                                        <div
                                                            className="ag-theme-material"

                                                        >
                                                            <AgGridReact
                                                                style={{ height: '100%', width: '100%' }}
                                                                defaultColDef={defaultColDef}
                                                                floatingFilter={true}
                                                                domLayout='autoHeight'
                                                                // columnDefs={c}
                                                                rowData={costingList}
                                                                pagination={true}
                                                                paginationPageSize={10}
                                                                onGridReady={onGridReady}
                                                                gridOptions={gridOptions}
                                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: CONSTANT.EMPTY_DATA,
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                            >
                                                                <AgGridColumn width={140} field="SimulationCostingId" hide='true'></AgGridColumn>
                                                                <AgGridColumn width={160} field="CostingNumber" headerName="Costing Id"></AgGridColumn>
                                                                {
                                                                    (String(SimulationTechnologyId) === RMDOMESTIC || String(SimulationTechnologyId) === RMIMPORT) &&
                                                                    <AgGridColumn width={192} field="RMName" cellRenderer='rawMaterailFormat' headerName="Raw Material-Grade" ></AgGridColumn>
                                                                }
                                                                <AgGridColumn width={136} field="PartNo" headerName="Part No."></AgGridColumn>
                                                                <AgGridColumn width={160} field="PartName" headerName='Part Name'></AgGridColumn>
                                                                <AgGridColumn width={150} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                                <AgGridColumn width={150} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                                <AgGridColumn width={150} field="VendorName" headerName="Vendor"></AgGridColumn>

                                                                {
                                                                    String(SimulationTechnologyId) !== EXCHNAGERATE &&
                                                                    <AgGridColumn width={150} field="PlantName" headerName='Plant' ></AgGridColumn>
                                                                }
                                                                <AgGridColumn width={140} field="OldPOPrice" cellRenderer='oldPOFormatter' headerName={String(SimulationTechnologyId) === EXCHNAGERATE ? 'PO Price' : "PO Price Old"}></AgGridColumn>
                                                                {
                                                                    (String(SimulationTechnologyId) === RMDOMESTIC || String(SimulationTechnologyId) === RMIMPORT) &&
                                                                    <>
                                                                        <AgGridColumn width={140} field="NewPOPrice" cellRenderer='newPOFormatter' headerName="PO Price New"></AgGridColumn>
                                                                        <AgGridColumn width={140} field="OldRMPrice" cellRenderer='oldRMFormatter' headerName="RM Cost Old" ></AgGridColumn>
                                                                        <AgGridColumn width={140} field="NewRMPrice" cellRenderer='newRMFormatter' headerName="RM Cost New" ></AgGridColumn>
                                                                    </>
                                                                }

                                                                {

                                                                    String(SimulationTechnologyId) === EXCHNAGERATE &&
                                                                    <>
                                                                        <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" cellRenderer='oldPOCurrencyFormatter' headerName="PO Price Old(in Currency)"></AgGridColumn>
                                                                        <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" cellRenderer='newPOCurrencyFormatter' headerName="PO Price New(in Currency)"></AgGridColumn>
                                                                        <AgGridColumn width={140} field="OldExchangeRate" cellRenderer='oldERFormatter' headerName="Exchange Rate Old" ></AgGridColumn>
                                                                        <AgGridColumn width={140} field="NewExchangeRate" cellRenderer='newERFormatter' headerName="Exchange Rate New" ></AgGridColumn>
                                                                    </>
                                                                }
                                                                <AgGridColumn width={140} field="Variance" headerName="Variance"></AgGridColumn>
                                                                <AgGridColumn width={130} field="SimulationCostingId" cellRenderer='buttonFormatter' floatingFilter={false} headerName="Actions" type="rightAligned"></AgGridColumn>
                                                                {/* <AgGridColumn field="Status" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>
                                                                <AgGridColumn field="SimulationId" headerName='Actions'   type="rightAligned" cellRenderer='buttonFormatter'></AgGridColumn> */}

                                                            </AgGridReact>
                                                            <div className="paging-container d-inline-block float-right">
                                                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                                    <option value="10" selected={true}>10</option>
                                                                    <option value="50">50</option>
                                                                    <option value="100">100</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                        </Col>
                                    </Row>
                                </div>
                            </>
                        }

                        <Row className="mt-3">
                            <Col md="10">
                                <div className="left-border">{'Compare Costing:'}</div>
                            </Col>
                            <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" disabled={!compareCosting} onClick={() => { setCompareCosting(!compareCosting) }}>
                                        {compareCosting ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
                                    </button>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md="12" className="costing-summary-row">
                                {compareCosting && <CostingSummaryTable viewMode={true} id={id} simulationMode={true} isApproval={true} />}
                            </Col>
                        </Row>
                        <Row>
                            <AttachmentSec token={simulationDetail.TokenNo} type={type} Attachements={simulationDetail.Attachements} />
                        </Row>
                        {/* Costing Summary page here */}

                        {/* <Row className="mb-4">
                            <Col md="6"><div className="left-border">{'Last Revision Data:'}</div></Col>
                            <Col md="6">
                                <div className={'right-details'}>
                                    <a onClick={() => setAcc3(!acc3)} className={`${acc3 ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                                </div>
                            </Col>
                            {acc3 &&
                                <div className="accordian-content w-100">
                                    <div className={`ag-grid-react`}>
                                        <Col md="12" className="mb-3">
                                            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                                <div className="ag-grid-header">
                                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                                </div>
                                                <div
                                                    className="ag-theme-material"

                                                >
                                                    <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        domLayout='autoHeight'
                                                        // columnDefs={c}
                                                        rowData={rmDomesticListing}
                                                        pagination={true}
                                                        paginationPageSize={10}
                                                        onGridReady={onGridReady}
                                                        gridOptions={gridOptions}
                                                        loadingOverlayComponent={'customLoadingOverlay'}
                                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                                        noRowsOverlayComponentParams={{
                                                            title: CONSTANT.EMPTY_DATA,
                                                        }}
                                                        frameworkComponents={frameworkComponents}
                                                        stopEditingWhenCellsLoseFocus={true}
                                                    >
                                                        <AgGridColumn width={160} field="RawMaterial" headerName="Raw Material"></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMGrade" headerName="RM Grade" ></AgGridColumn>
                                                        <AgGridColumn width={144} field="RMSpec" headerName="RM Spec"></AgGridColumn>
                                                        <AgGridColumn width={145} field="Category" headerName="Category"></AgGridColumn>
                                                        <AgGridColumn width={100} field="UOM" headerName="UOM"></AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" headerName="Basic Rate (INR)" marryChildren={true} >
                                                            <AgGridColumn width={100} field="BasicRate" headerName="Old" colId="BasicRate"></AgGridColumn>
                                                            <AgGridColumn width={100} cellRenderer={'newBasicRateFormatter'} field="NewBasicRate" headerName="New" colId='NewBasicRate'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" marryChildren={true} headerName="Scrap Rate (INR)">
                                                            <AgGridColumn width={100} field="ScrapRate" headerName="Old" colId="ScrapRate" ></AgGridColumn>
                                                            <AgGridColumn width={100} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="New" colId="NewScrapRate"></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={160} field="RMFreightCost" cellRenderer={'freightCostFormatter'} headerName="RM Freight Cost"></AgGridColumn>
                                                        <AgGridColumn width={180} field="RMShearingCost" cellRenderer={'shearingCostFormatter'} headerName="RM Shearing Cost" ></AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" headerName="Net Cost (INR)">
                                                            <AgGridColumn width={100} field="NetLandedCost" cellRenderer={'costFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                            <AgGridColumn width={100} field="NewNetLandedCost" cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={160} field="EffectiveDate" cellRenderer={'effectiveDateFormatter'} headerName="Effective Date" ></AgGridColumn>
                                                        <AgGridColumn width={160} field="RawMaterialId" hide></AgGridColumn>

                                                    </AgGridReact>

                                                    <div className="paging-container d-inline-block float-right">
                                                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                            <option value="10" selected={true}>10</option>
                                                            <option value="50">50</option>
                                                            <option value="100">100</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </div>
                                </div>
                            }
                        </Row> */}

                    </div>

                    {!isApprovalDone &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => { setRejectDrawer(true) }} >
                                        <div className={'cancel-icon-white mr5'}></div>
                                        {'Reject'}
                                    </button>
                                    <button
                                        type="button"
                                        className="approve-button mr5 approve-hover-btn"
                                        onClick={() => setApproveDrawer(true)}>
                                        <div className={'save-icon'}></div>
                                        {'Approve'}
                                    </button>

                                    {/* {showFinalLevelButtons &&
                                        <button
                                            type="button" className="mr5 user-btn" onClick={() => { }}                    >
                                            <div className={'save-icon'}></div>
                                            {'Approve & Push'}
                                        </button>} */}
                                </Fragment>
                            </div>
                        </Row>
                    }

                    {
                        showPushButton && isSuccessfullyInsert === false &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => rePush()}>
                                        <div className={"save-icon"}></div>{" "}
                                        {"RePush"}
                                    </button>
                                </Fragment>
                            </div>
                        </Row>
                    }
                </>
                // :
                // <SimulationApprovalListing />
            }

            {approveDrawer && <ApproveRejectDrawer
                type={'Approve'}
                isOpen={approveDrawer}
                closeDrawer={closeApproveDrawer}
                // tokenNo={approvalNumber}
                approvalData={[]}
                anchor={'right'}
                isSimulation={true}
                simulationDetail={simulationDetail}
                // reasonId={approvalDetails.ReasonId}
                IsFinalLevel={showFinalLevelButtons}
                costingList={costingList}
            // IsPushDrawer={showPushDrawer}
            // dataSend={[approvalDetails, partDetail]}
            />}

            {rejectDrawer && <ApproveRejectDrawer
                type={'Reject'}
                isOpen={rejectDrawer}
                simulationDetail={simulationDetail}
                closeDrawer={closeApproveDrawer}
                isSimulation={true}
                //  tokenNo={approvalNumber}
                anchor={'right'}
                IsFinalLevel={!showFinalLevelButtons}
            // reasonId={approvalDetails.ReasonId}
            // IsPushDrawer={showPushDrawer}
            // dataSend={[approvalDetails, partDetail]}
            />}

            {/* {pushButton && <PushButtonDrawer
                isOpen={pushButton}
                closeDrawer={closePushButton}
                dataSend={[approvalDetails, partDetail]}
                anchor={'right'}
                approvalData={[approvalData]}
            />} */}

            {viewButton && <ViewDrawer
                approvalLevelStep={approvalLevelStep}
                isOpen={viewButton}
                closeDrawer={closeViewDrawer}

                anchor={'top'}
                approvalNo={simulationDetail.Token}
                isSimulation={true}
            />
            }
            {isVerifyImpactDrawer &&
                <VerifyImpactDrawer
                    isOpen={isVerifyImpactDrawer}
                    anchor={'right'}
                    approvalData={[]}
                    type={'Approve'}
                    closeDrawer={verifyImpactDrawer}
                    isSimulation={true}
                />
            }
        </>
    )
}

export default SimulationApprovalSummary;
