
import React, { useEffect, useState } from 'react'
import { Row, Col, Table } from 'reactstrap'
import DayTime from '../../common/DayTimeWrapper'
import { Fragment } from 'react'
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow';
import ViewDrawer from '../../costing/components/approval/ViewDrawer'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { costingHeadObjs } from '../../../config/masterData';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common';
import { getApprovalSimulatedCostingSummary, getComparisionSimulationData,getAmmendentStatus,getImpactedMasterData,getLastSimulationData,uploadSimulationAttachment } from '../actions/Simulation'
import { EMPTY_GUID, EXCHNAGERATE, RMDOMESTIC, RMIMPORT, ZBC,FILE_URL } from '../../../config/constants';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import Toaster from '../../common/Toaster';
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import { checkForDecimalAndNull, formViewData, checkForNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { setCostingViewData } from '../../costing/actions/Costing';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { Redirect } from 'react-router';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PushButtonDrawer from '../../costing/components/approval/PushButtonDrawer';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Errorbox } from '../../common/ErrorBox';
import redcrossImg from '../../../assests/images/red-cross.png'
import {Link } from 'react-scroll'
const gridOptions = {};

function SimulationApprovalSummary(props) {
    // const { isDomestic, list, isbulkUpload, rowCount, technology, master } = props
    const { isbulkUpload,approvalDetails, approvalData, list, technology, master } = props;
    const { approvalNumber, approvalId, SimulationTechnologyId } = props.location.state
    const [showImpactedData, setshowImpactedData] = useState(false)
    const [shown, setshown] = useState(false)
    const [amendment, setAmendment] = useState(true)
    const [token, setToken] = useState('')
    const [showverifyPage, setShowVerifyPage] = useState(false)

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
    const [effectiveDate, setEffectiveDate] = useState('')
    const [oldCostingList, setOldCostingList] = useState([])
    const [showPushDrawer, setShowPushDrawer] = useState(false)
    const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
    const [impactedMasterDataListForImpactedMaster, setImpactedMasterDataListForImpactedMaster] = useState([])


    const [compareCosting, setCompareCosting] = useState(false)
    const [showLastRevisionData, setShowLastRevisionData] = useState(false)
    const [compareCostingObj, setCompareCostingObj] = useState([])
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [id, setId] = useState('')
    const [status, setStatus] = useState('')
    const [isSuccessfullyUpdated, setIsSuccessfullyUpdated] = useState(false)
    const [noContent, setNoContent] = useState(false)
    const [initialFiles, setInitialFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [IsOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const userList = useSelector(state => state.auth.userList)
    const { technologySelectList, plantSelectList } = useSelector(state => state.comman)
    const impactedMasterData = useSelector(state => state.comman.impactedMasterData)

    const [lastRevisionDataAccordian, setLastRevisionDataAccordian] = useState(false)



    const { setValue, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        dispatch(getTechnologySelectList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        getSimulationApprovalSummary()

    }, [])


    const getSimulationApprovalSummary = () => {
        const reqParams = {
            approvalTokenNumber: approvalNumber,
            approvalId: approvalId,
            loggedInUserId: loggedInUserId(),
        }
        dispatch(getApprovalSimulatedCostingSummary(reqParams, res => {
            const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow,
                IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId, MaterialGroup, PurchasingGroup, DecimalOption,
                SenderReason, ImpactedMasterDataList, AmendmentDetails, Attachements, SenderReasonId } = res.data.Data
            setCostingList(SimulatedCostingList)
            setOldCostingList(SimulatedCostingList)
            setApprovalLevelStep(SimulationSteps)
            setEffectiveDate(res.data.Data.EffectiveDate)


            setSimulationDetail({
                SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings,
                SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId,
                DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason,
                ImpactedMasterDataList: ImpactedMasterDataList, AmendmentDetails: AmendmentDetails, MaterialGroup: MaterialGroup,
                PurchasingGroup: PurchasingGroup, DecimalOption: DecimalOption, Attachements: Attachements, SenderReasonId: SenderReasonId
            })
            setFiles(Attachements)
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
                const { Status, IsSuccessfullyUpdated } = res.data.DataList[0]
                setStatus(Status)
                setIsSuccessfullyUpdated(IsSuccessfullyUpdated)
            }
        }))

    }


    useEffect(() => {
        // if (costingList.length > 0 && effectiveDate) {
        if (costingList && costingList.length > 0 && effectiveDate && Object.keys('simulationDetail'.length > 0)) {
            dispatch(getLastSimulationData(costingList[0].VendorId, effectiveDate, res => {
                const Data = res.data.Data.ImpactedMasterDataList
                const masterId = res.data.Data.SimulationTechnologyId;

                if (res) {
                    setImpactedMasterDataListForLastRevisionData(Data)
                    setShowLastRevisionData(true)
                    setSimulationDetail(prevState => ({ ...prevState, masterId: masterId }))

                }
            }))
            // }
            // if (simulationDetail.SimulationId) {
            dispatch(getImpactedMasterData(simulationDetail.SimulationId, () => { }))
        }

    }, [effectiveDate, costingList, simulationDetail.SimulationId])

    useEffect(() => {
        if (impactedMasterData) {
            setImpactedMasterDataListForImpactedMaster(impactedMasterData)
            setshowImpactedData(true)
        }
    }, [impactedMasterData])

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
            getSimulationApprovalSummary()
        }
    }

    const closePushButton = (e = '', type) => {
        if (type === 'submit') {
            setPushButton(false)
            setShowListing(true)
            setRejectDrawer(false)
        } else {
            setPushButton(false)
            getSimulationApprovalSummary()
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

    const Preview = ({ meta }) => {
        const { name, percent, status } = meta
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }
    const getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post', }
    }
    const handleChangeStatus = ({ meta, file }, status) => {


        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            dispatch(uploadSimulationAttachment(data, (res) => {
                let Data = res.data[0]
                files.push(Data)
                setFiles(files)
                setIsOpen(!IsOpen)
            }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
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
               <Link  to="campare-costing" spy={true} smooth ={true} activeClass="active" ><button className="Balance mb-0" type={'button'} onClick={() => DisplayCompareCosting(cell, row)}></button></Link>  
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
        return cell != null ? cell : '-';
    }
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
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
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }


    const renderEffectiveDate = () => {
        return <>Effective <br /> Date</>
    }
    const handleApproveAndPushButton = () => {
        setShowPushDrawer(true)
        setApproveDrawer(true)
    }

    const rawMaterailFormat = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? `${cell}- ${row.RMGrade}` : '-';
    }

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
        temp = isSuccessfullyUpdated === false ? '' : 'success'
        if (noContent === true) {
            temp = 'd-none'
        }
        return temp
    }

    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            // dispatch(fileDeleteCosting(deleteData, (res) => {
            //     Toaster.success('File has been deleted successfully.')
            //   }))
            let tempArr = files && files.filter(item => item.FileId !== FileId)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }
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
                                            {
                                                String(SimulationTechnologyId) !== EXCHNAGERATE &&
                                                (<th className="align-top">
                                                    <span className="d-block grey-text">{`Costing Head:`}</span>
                                                    <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.CostingHead}</span>
                                                </th>)
                                            }
                                            <th className="align-top">
                                                <span className="d-block grey-text">{`Vendor Name:`}</span>
                                                <span className="d-block">{simulationDetail && simulationDetail.AmendmentDetails?.VendorName}</span>
                                            </th>
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
                                                <span className="d-block">{simulationDetail && DayTime(simulationDetail.AmendmentDetails?.EffectiveDate).format('DD/MM/yyy')}</span>
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
                            {/* {lastRevisionDataAccordian && */}

                            <div className="accordian-content w-100 px-3 impacted-min-height">
                                {showImpactedData && <Impactedmasterdata data={impactedMasterDataListForImpactedMaster} masterId={simulationDetail.SimulationTechnologyId} viewCostingAndPartNo={false} />}

                            </div>
                            {/* } */}
                            {/* <div className="accordian-content w-100 px-3 impacted-min-height">
                                {showImpactedData && <Impactedmasterdata data={simulationDetail.ImpactedMasterDataList} masterId={simulationDetail.SimulationTechnologyId} viewCostingAndPartNo={false} />}

                            </div> */}

                        </Row>

                        {/* FG wise Impact section start */}
                        {/* <Row >
                            <Col md="12">
                                <div className="left-border">{'FG wise Impact:'}</div>
                            </Col>
                        </Row> */}

                        {/* <Row className="mb-3">
                            <Col md="12">
                                <div className="table-responsive">
                                    <table className="table cr-brdr-main accordian-table-with-arrow">
                                        <thead>
                                            <tr>
                                                <th><span>Part Number</span></th>
                                                <th><span>Rev Number/ECN Number</span></th>
                                                <th><span>Part Name</span></th>
                                                <th><span>Old Cost/Pc</span></th>
                                                <th><span>New Cost/pc</span></th>
                                                <th><span>Impact/Pc</span></th>
                                                <th><span>Volume</span></th>
                                                <th><span>Impact/Month</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="accordian-with-arrow">
                                                <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(!acc1)}></div>Model 1</span></td>
                                                <td><span>1</span></td>
                                                <td><span>This is A model</span></td>
                                                <td><span>0</span></td>
                                                <td><span>0</span></td>
                                                <td><span>24(INR)</span></td>
                                                <td><span>2000</span></td>
                                                <td><span>48000(INR) <a onClick={() => setAcc1(!acc1)} className={`${acc1 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                                            </tr>
                                            {acc1 &&
                                                <>
                                                    <tr className="accordian-content">
                                                        <td><span>Part 1</span></td>
                                                        <td><span>1</span></td>
                                                        <td><span>Part number</span></td>
                                                        <td><span>24(INR)</span></td>
                                                        <td><span>26(INR)</span></td>
                                                        <td><span>2(INR)</span></td>
                                                        <td><span>1000</span></td>
                                                        <td><span>2000 (INR)</span></td>
                                                    </tr>
                                                    <tr className="accordian-content">
                                                        <td><span>Part 2</span></td>
                                                        <td><span>1</span></td>
                                                        <td><span>Part number</span></td>
                                                        <td><span>24(INR)</span></td>
                                                        <td><span>26(INR)</span></td>
                                                        <td><span>2(INR)</span></td>
                                                        <td><span>1000</span></td>
                                                        <td><span>2000 (INR)</span></td>
                                                    </tr>
                                                    <tr className="accordian-content">
                                                        <td><span>Part 3</span></td>
                                                        <td><span>1</span></td>
                                                        <td><span>Part number</span></td>
                                                        <td><span>24(INR)</span></td>
                                                        <td><span>26(INR)</span></td>
                                                        <td><span>2(INR)</span></td>
                                                        <td><span>1000</span></td>
                                                        <td><span>2000 (INR)</span></td>
                                                    </tr>
                                                </>
                                            }
                                        </tbody>

                                        <tbody>
                                            <tr className="accordian-with-arrow">
                                                <td className="arrow-accordian"><span><div onClick={() => setAcc2(!acc2)} class="Close"></div>Model 2</span></td>
                                                <td><span>1</span></td>
                                                <td><span>This is A model</span></td>
                                                <td><span>0</span></td>
                                                <td><span>0</span></td>
                                                <td><span>24(INR)</span></td>
                                                <td><span>2000</span></td>
                                                <td><span>48000(INR) <a onClick={() => setAcc2(!acc2)} className={`${acc2 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                                            </tr>
                                            {acc2 &&
                                                <>
                                                    <tr className="accordian-content">
                                                        <td><span>Part 1</span></td>
                                                        <td><span>1</span></td>
                                                        <td><span>Part number</span></td>
                                                        <td><span>24(INR)</span></td>
                                                        <td><span>26(INR)</span></td>
                                                        <td><span>2(INR)</span></td>
                                                        <td><span>1000</span></td>
                                                        <td><span>2000 (INR)</span></td>
                                                    </tr>
                                                    <tr className="accordian-content">
                                                        <td><span>Part 2</span></td>
                                                        <td><span>1</span></td>
                                                        <td><span>Part number</span></td>
                                                        <td><span>24(INR)</span></td>
                                                        <td><span>26(INR)</span></td>
                                                        <td><span>2(INR)</span></td>
                                                        <td><span>1000</span></td>
                                                        <td><span>2000 (INR)</span></td>
                                                    </tr>
                                                </>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row> */}
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
                                                            style={{ height: '100%', width: '100%' }}
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
                                                                    title: EMPTY_DATA,
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
                                                                <AgGridColumn width={150} field="SANumber" headerName="SA Number"></AgGridColumn>
                                                                <AgGridColumn width={150} field="LineNumber" headerName="Line Number"></AgGridColumn>

                                                                {
                                                                    String(SimulationTechnologyId) !== EXCHNAGERATE &&
                                                                    <AgGridColumn width={150} field="PlantName" headerName='Plant' ></AgGridColumn>
                                                                }
                                                                <AgGridColumn width={140} field="OldPOPrice" cellRenderer='oldPOFormatter' headerName={String(SimulationTechnologyId) === EXCHNAGERATE ? 'PO Price' : "Old PO Price"}></AgGridColumn>
                                                                {
                                                                    (String(SimulationTechnologyId) === RMDOMESTIC || String(SimulationTechnologyId) === RMIMPORT) &&
                                                                    <>
                                                                        <AgGridColumn width={140} field="NewPOPrice" cellRenderer='newPOFormatter' headerName="New PO Price"></AgGridColumn>
                                                                        <AgGridColumn width={140} field="OldRMPrice" cellRenderer='oldRMFormatter' headerName="Old RMC/pc" ></AgGridColumn>
                                                                        <AgGridColumn width={140} field="NewRMPrice" cellRenderer='newRMFormatter' headerName="New RMC/pc" ></AgGridColumn>
                                                                    </>
                                                                }

                                                                {

                                                                    String(SimulationTechnologyId) === EXCHNAGERATE &&
                                                                    <>
                                                                        <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" cellRenderer='oldPOCurrencyFormatter' headerName="Old PO Price (in Currency)"></AgGridColumn>
                                                                        <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" cellRenderer='newPOCurrencyFormatter' headerName="New PO Price (in Currency)"></AgGridColumn>
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
                                <div id="campare-costing" className="left-border">{'Compare Costing:'}</div>
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
                            <Col md="6"><div className="left-border">{'Attachments:'}</div></Col>
                            <Col md="12" className="px-4">
                                <label>Upload Attachment (upload up to 2 files)</label>
                                {files && files.length > 2 ? (
                                    <div class="alert alert-danger" role="alert">
                                        Maximum file upload limit has been reached.
                                    </div>
                                ) : (
                                    <Dropzone
                                        getUploadParams={getUploadParams}
                                        onChangeStatus={handleChangeStatus}
                                        PreviewComponent={Preview}
                                        // onSubmit={handleImapctSubmit}
                                        accept="*"
                                        initialFiles={initialFiles}
                                        maxFiles={4}
                                        maxSizeBytes={2000000000}
                                        inputContent={(files, extra) =>
                                            extra.reject ? (
                                                "Image, audio and video files only"
                                            ) : (
                                                <div className="text-center">
                                                    <i className="text-primary fa fa-cloud-upload"></i>
                                                    <span className="d-block">
                                                        Drag and Drop or{" "}
                                                        <span className="text-primary">Browse</span>
                                                        <br />
                                                        file to upload
                                                    </span>
                                                </div>
                                            )
                                        }
                                        styles={{
                                            dropzoneReject: {
                                                borderColor: "red",
                                                backgroundColor: "#DAA",
                                            },
                                            inputLabel: (files, extra) =>
                                                extra.reject ? { color: "red" } : {},
                                        }}
                                        classNames="draper-drop"
                                        disabled={true}
                                    />
                                )}
                            </Col>
                            <div className="w-100">
                                <div className={"attachment-wrapper mt-0 mb-3 px-4"}>
                                    {files &&
                                        files.map((f) => {
                                            const withOutTild = f.FileURL.replace("~", "");
                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                            return (
                                                <div className={"attachment images"}>
                                                    <a href={fileURL} target="_blank">
                                                        {f.OriginalFileName}
                                                    </a>
                                                    <img
                                                        alt={""}
                                                        className="float-right"
                                                        onClick={() => false ? deleteFile(f.FileId, f.FileName) : ""}
                                                        src={redcrossImg}
                                                    ></img>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </Row>
                        {/* Costing Summary page here */}
                        {/* page starts */}





                        <Row className="mb-4">
                            <Col md="6"><div className="left-border">{'Last Revision Data:'}</div></Col>
                            <Col md="6" className="text-right">
                                <div className={'right-details'}>
                                    <button onClick={() => setLastRevisionDataAccordian(!lastRevisionDataAccordian)} className={`btn btn-small-primary-circle ml-1`}>{lastRevisionDataAccordian ? (
                                        <i className="fa fa-minus" ></i>
                                    ) : (
                                        <i className="fa fa-plus"></i>
                                    )}</button>
                                </div>

                            </Col>

                            {lastRevisionDataAccordian &&

                                <div className="accordian-content w-100 px-3 impacted-min-height">
                                    {showLastRevisionData && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={simulationDetail.masterId} viewCostingAndPartNo={false} />}

                                </div>
                            }
                            {/* {lastRevisionDataAccordian &&
                                <div className="accordian-content w-100">
                                    <div className={`ag-grid-react`}>
                                        <Col md="12" className="mb-3">
                                            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                                <div className="ag-grid-header">
                                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                                </div>
                                                <div
                                                    className="ag-theme-material"
                                                    style={{ height: '100%', width: '100%' }}
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
                                                        <AgGridColumn field="RawMaterial" headerName="Raw Material"></AgGridColumn>
                                                        <AgGridColumn field="RMGrade" headerName="RM Grade" ></AgGridColumn>
                                                        <AgGridColumn field="RMSpec" headerName="RM Spec"></AgGridColumn>
                                                        <AgGridColumn field="Category" headerName="Category"></AgGridColumn>
                                                        <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                                        <AgGridColumn headerClass="justify-content-center" headerName="Basic Rate (INR)" marryChildren={true} >
                                                            <AgGridColumn field="BasicRate" headerName="Old" colId="BasicRate"></AgGridColumn>
                                                            <AgGridColumn cellRenderer={'newBasicRateFormatter'} field="NewBasicRate" headerName="New" colId='NewBasicRate'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn headerClass="justify-content-center" marryChildren={true} headerName="Scrap Rate (INR)">
                                                            <AgGridColumn field="ScrapRate" headerName="Old" colId="ScrapRate" ></AgGridColumn>
                                                            <AgGridColumn cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="New" colId="NewScrapRate"></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn field="RMFreightCost" cellRenderer={'freightCostFormatter'} headerName="RM Freight Cost"></AgGridColumn>
                                                        <AgGridColumn field="RMShearingCost" cellRenderer={'shearingCostFormatter'} headerName="RM Shearing Cost" ></AgGridColumn>
                                                        <AgGridColumn headerClass="justify-content-center" headerName="Net Cost (INR)">
                                                            <AgGridColumn field="NetLandedCost" cellRenderer={'costFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                            <AgGridColumn field="NewNetLandedCost" cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn field="EffectiveDate" cellRenderer={'effectiveDateFormatter'} headerName="Effective Date" ></AgGridColumn>
                                                        <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

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
                            } */}
                        </Row>

                    </div>

                    {!isApprovalDone &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => { setRejectDrawer(true) }} >
                                        <div className={'cancel-icon'}></div>
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
                                            type="button" className="mr5 user-btn" onClick={() => handleApproveAndPushButton()}                    >
                                            <div className={'save-icon'}></div>
                                            {'Approve & Push'}
                                        </button>} */}
                                </Fragment>
                            </div>
                        </Row>
                    }

                    {
                        showPushButton &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => setPushButton(true)}>
                                        <div className={"save-icon"}></div>{" "}
                                        {"Push"}
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
                costingList={costingList}
                // reasonId={approvalDetails.ReasonId}
                IsFinalLevel={showFinalLevelButtons}
                IsPushDrawer={showPushDrawer}
                showFinalLevelButtons={showFinalLevelButtons}
                Attachements={simulationDetail.Attachements}
                reasonId={simulationDetail.SenderReasonId}
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
                Attachements={simulationDetail.Attachements}
                reasonId={simulationDetail.SenderReasonId}
            />}

            {pushButton && <PushButtonDrawer
                isOpen={pushButton}
                closeDrawer={closePushButton}
                approvalData={[approvalData ? approvalData : []]}
                isSimulation={true}
                simulationDetail={simulationDetail}
                // dataSend={dataSend ? dataSend : []}
                costingList={costingList}
                anchor={'right'}
            // approvalData={[approvalData]}
            />}

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
