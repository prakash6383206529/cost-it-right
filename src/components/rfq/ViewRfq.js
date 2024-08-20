import React, { useContext } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, RETURNED, RECEIVED, NCCTypeId, VBCTypeId, RM_MASTER_ID, BOP_MASTER_ID, EMPTY_GUID, ZBCTypeId, } from '../.././config/constants'
import NoContentFound from '.././common/NoContentFound';
import { MESSAGES } from '../.././config/message';
import Toaster from '.././common/Toaster';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '.././common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '.././common/PopupMsgWrapper';
import { PaginationWrapper } from '.././common/commonPagination'
import { sendReminderForQuotation, getQuotationDetailsList, getMultipleCostingDetails, setQuotationIdForRFQ, checkExistCosting, getQuotationList } from './actions/rfq';
import AddRfq from './AddRfq';
import SendForApproval from '../costing/components/approval/SendForApproval';
import { checkFinalUser, getReleaseStrategyApprovalDetails, getSingleCostingDetails, setCostingApprovalData, setCostingViewData, storePartNumber } from '../costing/actions/Costing';
import { getVolumeDataByPartAndYear } from '../masters/actions/Volume';
import { checkForNull, formViewData, getCodeBySplitting, getConfigurationKey, getNameBySplitting, loggedInUserId, userDetails, userTechnologyDetailByMasterId } from '../../helper';
import ApproveRejectDrawer from '../costing/components/approval/ApproveRejectDrawer';
import CostingSummaryTable from '../costing/components/CostingSummaryTable';
import { Fragment } from 'react';
import { Link } from 'react-scroll';
import RemarkHistoryDrawer from './RemarkHistoryDrawer';
import DayTime from '../common/DayTimeWrapper';
import { hyphenFormatter } from '../masters/masterUtil';
import _, { isNumber } from 'lodash';
import CostingDetailSimulationDrawer from '../simulation/components/CostingDetailSimulationDrawer';
import CostingApproveReject from '../costing/components/approval/CostingApproveReject';
import TourWrapper from '../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import { agGridStatus, getGridHeight, isResetClick } from '../../actions/Common';
import SingleDropdownFloationFilter from '../masters/material-master/SingleDropdownFloationFilter';
import WarningMessage from '../common/WarningMessage';
import RMCompareTable from './compareTable/RMCompareTable';
import BOPCompareTable from './compareTable/BOPCompareTable';
import MasterSendForApproval from '../masters/MasterSendForApproval';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom';
import { ASSEMBLY } from '../../config/masterData';
import { havellsConditionKey } from '../.././config/constants';
import { useLabels } from '../../helper/core';
export const QuotationId = React.createContext();

const gridOptions = {};


function RfqListing(props) {
    const { t } = useTranslation("Rfq");
    const [showCompareButton, setShowCompareButton] = useState(false);
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false)
    const [selectedCostings, setSelectedCostings] = useState([])
    const [addRfq, setAddRfq] = useState(false);
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([])

    const [noData, setNoData] = useState(false)
    const [sendForApproval, setSendForApproval] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [returnDrawer, setReturnDrawer] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const [addComparisonToggle, setaddComparisonToggle] = useState(false)
    const [addComparisonButton, setAddComparisonButton] = useState(true)
    const [technologyId, setTechnologyId] = useState("")
    const [remarkHistoryDrawer, setRemarkHistoryDrawer] = useState(false)
    const [disableApproveRejectButton, setDisableApproveRejectButton] = useState(true)
    const [remarkRowData, setRemarkRowData] = useState([])
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const { data } = props
    const [isOpen, setIsOpen] = useState(false)
    const [isReportLoader, setIsReportLoader] = useState(false)
    const [selectedCostingsToShow, setSelectedCostingsToShow] = useState([])
    const [multipleCostingDetails, setMultipleCostingDetails] = useState([])
    const [uniqueShouldCostingId, setUniqueShouldCostingId] = useState([])
    const [costingListToShow, setCostingListToShow] = useState([])
    const [selectedRowIndex, setSelectedRowIndex] = useState('')
    const [index, setIndex] = useState('')
    const [selectedCostingList, setSelectedCostingList] = useState([])
    const [mandatoryRemark, setMandatoryRemark] = useState(false)
    const [compareButtonPressed, setCompareButtonPressed] = useState(false)
    const [isVisibiltyConditionMet, setisVisibiltyConditionMet] = useState(false)
    const [rejectedList, setRejectedList] = useState([])
    const [returnList, setReturnList] = useState([])
    const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
    const { initialConfiguration } = useSelector(state => state.auth)
    const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
    const [costingsDifferentStatus, setCostingsDifferentStatus] = useState(false)
    const agGridRef = useRef(null);
    const [viewRMCompare, setViewRMCompare] = useState(false)
    const [viewBOPCompare, setViewBOPCompare] = useState(false)
    const [partType, setPartType] = useState('')
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [quotationId, setQuotationId] = useState('')
    const [matchedStatus, setMatchedStatus] = useState([])
    const [masterRejectDrawer, setMasterRejectDrawer] = useState(false)
    const [actionType, setActionType] = useState('');
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const { viewRmDetails } = useSelector(state => state.material)
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);
    const [state, setState] = useState({
        isFinalApprovar: false,
        disableSendForApproval: false,
        CostingTypePermission: false,
        finalApprovalLoader: true,
        approveDrawer: false,
        approvalObj: {},
        levelDetails: {},
        isDateChanged: false,
        costingTypeId: ZBCTypeId
    })
    const userMasterLevelAPI = useSelector((state) => state.auth.userMasterLevelAPI)
    const isAssemblyTechnology = rowData && rowData?.length > 0 ? rowData[0]?.TechnologyId === ASSEMBLY : false
    let arr = []
    const { technologyLabel } = useLabels();
    const history = useHistory();
    const location = useLocation();
    useEffect(() => {
        getDataList()
    }, [])
    useEffect(() => {
        if (partType === 'Raw Material' || partType === 'Bought Out Part') {

            dispatch(getUsersMasterLevelAPI(loggedInUserId(), partType === 'Raw Material' ? RM_MASTER_ID : BOP_MASTER_ID, (res) => {


                setTimeout(() => {
                    commonFunction(partType, rowData[0]?.PlantId)
                }, 100);
            }))
        }
    }, [partType])
    useEffect(() => {
        if (rowData[0]?.QuotationId) {
            dispatch(setQuotationIdForRFQ(rowData[0]?.QuotationId))
            setQuotationId(rowData[0]?.QuotationId)
        }
        if (rowData[0]?.PartType) {
            setPartType(rowData[0]?.PartType)
        }
    }, [rowData[0]?.QuotationId])

    useEffect(() => {

        if (selectedCostings?.length === selectedRows?.length && selectedRows?.length > 0) {
            setSelectedCostingsToShow(selectedCostings)
            setaddComparisonToggle(true)
        }

    }, [selectedCostings])
    useEffect(() => {
        if (statusColumnData) {
            gridApi?.setQuickFilter(statusColumnData?.data);
        }
    }, [statusColumnData])
    useEffect(() => {
        setTimeout(() => {

            headerPartType()
        }, 100);

    }, [partType])

    useEffect(() => {

        let filteredArr = [];
        let arr = []
        const partTypes = partType?.split(',');
        partTypes?.forEach(type => {

            switch (type.trim()) {
                case 'Component':
                case 'Assembly':
                    filteredArr = _.map(viewCostingData, 'costingId');
                    filteredArr.forEach(item => {
                        selectedRows.filter(el => {
                            if (el.CostingId === item) {
                                arr.push(el);
                            }
                        });
                    });
                    break;
                case 'Bought Out Part':
                    filteredArr = _.map(viewBOPDetails, 'BoughtOutPartId');
                    filteredArr.forEach(item => {
                        selectedRows.filter(el => {
                            if (el.BoughtOutPartId === item) {
                                arr.push(el);
                            }
                        });
                    });
                    break;
                case 'Raw Material':
                    filteredArr = _.map(viewRmDetails, 'RawMaterialId');
                    filteredArr.forEach(item => {
                        selectedRows.filter(el => {
                            if (el.RawMaterialId === item) {
                                arr.push(el);
                            }
                        });
                    });
                    break;
                default:
                    break;
            }
        });

        const isApproval = arr.filter(item => item?.ShowApprovalButton)


        const disableApproveButton = isApproval.some(item => String(item?.Status) === String(RETURNED));
        setDisableApproveRejectButton(isApproval.length > 0)

    }, [viewCostingData, selectedCostingList, selectedRows, viewBOPDetails, viewRmDetails, partType])

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = () => {
        setloader(true)
        dispatch(getQuotationDetailsList(data?.QuotationId, (res) => {
            if (res === 204) {
                setloader(false)
                return false;
            }
            let uniqueShouldCostId = [];
            res?.data?.DataList && res?.data?.DataList.map(item => {
                let unique
                res?.data?.DataList && res?.data?.DataList.map(item => {
                    const partTypes = item?.PartType?.split(',');

                    partTypes?.forEach(type => {
                        switch (type.trim()) {
                            case 'Raw Material':
                                unique = _.uniq(_.map(item?.ShouldRawMaterial, 'RawMaterialId'));
                                uniqueShouldCostId.push(...unique);
                                break;
                            case 'Component':
                            case 'Assembly':
                                unique = _.uniq(_.map(item?.ShouldCostings, 'CostingId'));
                                uniqueShouldCostId.push(...unique);
                                break;
                            case 'Bought Out Part':
                                unique = _.uniq(_.map(item?.ShouldBoughtOutPart, 'BoughtOutPartId'));
                                uniqueShouldCostId.push(...unique);
                                break;
                            default:
                                break;
                        }
                    });


                })
            })
            setUniqueShouldCostingId(uniqueShouldCostId)

            let requestObject = {}
            requestObject.PartIdList = _.uniq(_.map(res?.data?.DataList, 'PartId'))
            requestObject.PlantId = res?.data?.DataList[0]?.PlantId
            let partNumberFech;

            // Grouping data based on PartType
            res?.data?.DataList?.map(item => {

                if (item?.PartType === 'Raw Material') {
                    partNumberFech = 'RawMaterial';
                } else if (item?.PartType === 'Component' || item?.PartType === 'Assembly') {
                    partNumberFech = 'PartNumber';
                } else if (item?.PartType === 'Bought Out Part') {
                    partNumberFech = 'BoughtOutPart';
                }
            })
            let grouped_data = _.groupBy(res?.data?.DataList, partNumberFech)                                        // GROUPING OF THE ROWS FOR SEPERATE PARTS

            let data = []
            for (let x in grouped_data) {

                let seprateData = grouped_data[x]

                seprateData[Math.round(seprateData.length / 2) - 1].PartNo = x;
                seprateData[Math.round(seprateData.length / 2) - 1].NfrNo = seprateData[0].NfrNumber;             // SHOWING PART NUMBER IN MIDDLE
                seprateData[Math.round(seprateData.length / 2) - 1].PartTypes = seprateData[0].PartType;
                seprateData[Math.round(seprateData.length / 2) - 1].PRNo = seprateData[0].PRNumber;           // SHOWING PART NUMBER IN MIDDLE
                seprateData[seprateData.length - 1].LastRow = true;                                               // ADDING LASTROW KEY FOR SHOWING SEPERATE BORDER
                seprateData[Math.round(seprateData.length / 2) - 1].RowMargin = seprateData.length >= 2 && seprateData.length % 2 === 0 && 'margin-top';    // ADDING ROWMARGIN KEY IN THE GRID FOR EVEN ROW AND AS WELL AS PARTS HAVE TWO OR MORE COSTING
                data.push(seprateData)
            }

            let newArray = []
            // SET ROW DATA FOR GRID
            data.map((item) => {
                newArray = [...newArray, ...item]
                const partTypes = item[0].PartType?.split(',');
                let temp
                partTypes?.forEach(type => {
                    switch (type.trim()) {
                        case 'Component':
                        case 'Assembly':
                            temp = item?.filter(el => el.CostingId !== null);
                            break;
                        case 'Raw Material':
                            temp = item?.filter(el => el.RawMaterialId !== null);
                            break;
                        case 'Bought Out Part':
                            temp = item?.filter(el => el.BoughtOutPartId !== null);
                            break;
                        default:
                            break;

                    }
                });


                if (temp?.length > 0) {
                    item[Math.round(item?.length / 2) - 1].ShowCheckBox = true;                      // SET CHECKBOX FOR CREATED COSTINGS
                }
            })

            setRowData(newArray)

            setTechnologyId(res?.data?.DataList[0]?.TechnologyId)
            setloader(false);
        }))

    }
    const handleFilterChange = () => {


        if (agGridRef.current) {
            //MINDA
            setTimeout(() => {
                if (!agGridRef.current.rowRenderer.allRowCons.length) {
                    setNoData(true)
                    //dispatch(getGridHeight({ value: 3, component: 'RFQ' }))
                } else {
                    setNoData(false)
                }
            }, 100);

            const gridApi = agGridRef.current.api;


            if (gridApi) {

                const displayedRowCount = gridApi?.getDisplayedRowCount();

                const allRowData = [];
                for (let i = 0; i < displayedRowCount; i++) {
                    const rowNode = gridApi?.getDisplayedRowAtIndex(i);
                    if (rowNode) {

                        allRowData.push(rowNode.data);
                    }
                }
                setNoData(!allRowData.length)
            }
        }
    };

    const floatingFilterRFQ = {
        maxValue: 11,
        suppressFilterButton: true,
        component: "RFQ",
        onFilterChange: handleFilterChange,
        notPagination: true
    }
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        window.screen.width > 1600 && gridApi?.sizeColumnsToFit();
        gridApi?.deselectAll()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
        setNoData(false)
        setSelectedCostings([])
        setaddComparisonToggle(false)
    }

    const costingIdObj = (list) => {
        let data = []
        list && list?.map(item => {
            let obj = {}
            obj.CostingId = item
            data.push(obj)
        })
        return data
    }

    const commonFunction = (type, plantId = EMPTY_GUID) => {

        const { costingTypeId } = state
        if (type === 'Raw Material' || type === 'Bought Out Part') {

            let levelDetailsTemp = userTechnologyDetailByMasterId(costingTypeId, type === 'Raw Material' ? RM_MASTER_ID : BOP_MASTER_ID, userMasterLevelAPI);
            setState(prevState => ({ ...prevState, levelDetails: levelDetailsTemp }));

            let obj = {
                DepartmentId: userDetails().DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: type === 'Raw Material' ? RM_MASTER_ID : BOP_MASTER_ID,
                Mode: 'master',
                approvalTypeId: costingTypeIdToApprovalTypeIdFunction(costingTypeId),
                plantId: plantId
            };

            if (getConfigurationKey().IsMasterApprovalAppliedConfigure) {
                dispatch(checkFinalUser(obj, (res) => {
                    if (res?.data?.Result && res?.data?.Data?.IsFinalApprover) {
                        setState(prevState => ({
                            ...prevState,
                            isFinalApprovar: res?.data?.Data?.IsFinalApprover,
                            CostingTypePermission: true,
                            finalApprovalLoader: false
                        }));
                    }
                    if (res?.data?.Data?.IsUserInApprovalFlow === false || res?.data?.Data?.IsNextLevelUserExist === false) {
                        setState(prevState => ({ ...prevState, disableSendForApproval: true }));
                    } else {
                        setState(prevState => ({ ...prevState, disableSendForApproval: false }));
                    }
                }));
            }
            setState(prevState => ({ ...prevState, CostingTypePermission: false, finalApprovalLoader: false }));
        }
        else {
            const arrayOfObjects = [...viewCostingData]
            const matchingItems = selectedCostingList.filter(item =>
                arrayOfObjects.some(obj => obj.costingId === item)
            );
            let arr = []
            matchingItems.map(item => rowData.filter(el => {
                if (el.CostingId === item) {
                    arr.push(el)
                }
                return null
            }))


            let data = arrayOfObjects?.filter(element => element?.costingId !== "-")
            let val = data[0]?.poPrice
            let costingId = data[0]?.costingId
            data && data?.map((item, index) => {
                if (val > item?.poPrice) {
                    val = item?.poPrice
                    costingId = item?.costingId
                }
            })
            let tempArray = _.map(arr, 'NetPOPrice')
            const firstElement = rowData[0]?.NetPOPrice;
            let test = tempArray.every(element => element === firstElement);
            if (arr?.length > 1) {
                if (test) {
                    setMandatoryRemark(false)
                } else {
                    setMandatoryRemark(true)
                }
            } else {
                if (selectedCostingList?.includes(costingId)) {
                    setMandatoryRemark(false)
                } else {
                    setMandatoryRemark(true)
                }
            }
            // let data = {
            //     isEditFlag: true,
            //     rowData: rowData,
            //     Id: Id
            // }
            // setIsEdit(true)
            // setAddRfqData(data)
            // setAddRfq(true)
            dispatch(storePartNumber(rowData))

            sendForApprovalData(arr)
            setSendForApproval(true)
        }
    }

    /**
    * @method approveDetails
    * @description approveDetails
    */
    const approveDetails = (Id, rowData = {}) => {
        if (havellsConditionKey && (partType !== "Bought Out Part" && partType !== "Raw Material")) {
            const filteredData = viewCostingData.filter(item => selectedCostingList.includes(item.costingId));
            // Check if the total share of business is 100%
            const totalShareOfBusiness = filteredData
                .map(item => item?.shareOfBusinessPercent)
                .reduce((total, percent) => total + percent, 0);
            if (totalShareOfBusiness !== 100) {
                Toaster.warning("The total share of business must be 100%.");
                return false;
            }
        }

        if (partType === "Bought Out Part" || partType === "Raw Material") {
            setApproveDrawer(true)
            setActionType('Approve')
        }
        else {
            if (selectedCostingList?.length === 0) {
                Toaster.warning("Select at least one costing to send for approval")
                return false
            }

            if (initialConfiguration.IsReleaseStrategyConfigured) {
                let dataList = costingIdObj(selectedCostingList)
                let requestObject = {
                    "RequestFor": "COSTING",
                    "TechnologyId": technologyId,
                    "LoggedInUserId": loggedInUserId(),
                    "ReleaseStrategyApprovalDetails": dataList
                }
                dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
                    setReleaseStrategyDetails(res?.data?.Data)
                    if (res?.data?.Data?.IsUserInApprovalFlow && res?.data?.Data?.IsFinalApprover === false) {
                        commonFunction()
                    } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
                        commonFunction()
                    } else if (res?.data?.Data?.IsFinalApprover === true) {
                        Toaster.warning('This is final level user')
                        return false
                    } else if (res?.data?.Result === false) {
                        Toaster.warning(res?.data?.Message)
                        return false
                    } else {
                        Toaster.warning('This user is not in approval cycle')
                        return false
                    }
                }))
            } else {
                commonFunction()
            }
        }


    }

    /**
    * @method rejectDetailsClick
    * @description rejectDetailsClick
    */
    const rejectDetailsClick = (Id, rowData = {}) => {
        if (partType === "Bought Out Part" || partType === "Raw Material") {
            setMasterRejectDrawer(true)
            setActionType('Reject')
            return
        }
        else {
            if (selectedCostingList?.length === 0) {
                Toaster.warning("Select at least one costing to reject")
                return false
            }
            const arrayOfObjects = [...viewCostingData]
            const matchingItems = selectedCostingList.filter(item =>
                arrayOfObjects.some(obj => obj.costingId === item)
            );
            let arr = []
            matchingItems.map(item => rowData.filter(el => {
                if (el.CostingId === item) {
                    arr.push(el)
                }
                return null
            }))
            setRejectedList(arr)
            setRejectDrawer(true)
        }

    }
    const returnDetailsClick = (Id, rowData = {}) => {
        if (partType === "Bought Out Part" || partType === "Raw Material") {
            setMasterRejectDrawer(true)
            setActionType('Return')
            return
        }
        else {
            if (selectedCostingList?.length === 0) {
                Toaster.warning("Select at least one costing to return")
                return false
            }
            const arrayOfObjects = [...viewCostingData]
            const matchingItems = selectedCostingList.filter(item =>
                arrayOfObjects.some(obj => obj.costingId === item)
            );
            let arr = []
            matchingItems.map(item => rowData.filter(el => {
                if (el.CostingId === item) {
                    arr.push(el)
                }
                return null
            }))
            setReturnList(arr)
            setReturnDrawer(true)
        }

    }

    /**
    * @method singleApprovalDetails
    * @description singleApprovalDetails
    */
    const singleApprovalDetails = (Id, rowData = {}) => {
        dispatch(storePartNumber(rowData))
        sendForApprovalData(rowData)
        setSendForApproval(true)
    }

    const rejectDetails = (Id, rowData = {}) => {

        if (selectedRows.length === 0) {
            setSelectedRows([rowData])
        }

        setTimeout(() => {
            setRejectDrawer(true)
            setReturnDrawer(true)
        }, 600);
    }

    const cancel = () => {
        props.closeDrawer()
    }

    const sendForApprovalData = (rowData) => {

        let temp = []

        let quotationGrid;
        if (Array.isArray(rowData)) {
            quotationGrid = rowData
        } else {
            quotationGrid = [rowData]
        }

        quotationGrid &&
            quotationGrid.map((id, index) => {

                if (index !== -1) {
                    let obj = {}
                    // add vendor key here
                    obj.ApprovalProcessSummaryId = quotationGrid[index].ApprovalProcessSummaryId
                    obj.ApprovalToken = quotationGrid[index].ApprovalToken
                    obj.typeOfCosting = 1
                    obj.partNo = quotationGrid[index]?.PartNumber
                    obj.plantCode = getCodeBySplitting(quotationGrid[index]?.PlantName)
                    obj.plantName = getNameBySplitting(quotationGrid[index]?.PlantName)
                    obj.plantId = quotationGrid[index]?.PlantId

                    obj.vendorId = quotationGrid[index]?.VendorId

                    obj.vendorName = quotationGrid[index]?.VendorName

                    obj.vendorCode = quotationGrid[index]?.VendorName
                    obj.vendorPlantId = quotationGrid[index]?.vendorPlantId
                    obj.vendorPlantName = quotationGrid[index]?.vendorPlantName
                    obj.vendorPlantCode = quotationGrid[index]?.vendorPlantCode
                    obj.costingName = quotationGrid[index]?.CostingNumber
                    obj.costingId = quotationGrid[index]?.CostingId
                    obj.oldPrice = quotationGrid[index]?.oldPoPrice
                    obj.revisedPrice = quotationGrid[index]?.NetPOPrice

                    obj.nPOPriceWithCurrency = quotationGrid[index]?.nPOPriceWithCurrency
                    obj.currencyRate = quotationGrid[index]?.currency?.currencyValue
                    obj.variance = Number(quotationGrid[index]?.Price && quotationGrid[index]?.Price !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.Price && quotationGrid[index]?.Price !== '-' ? quotationGrid[index]?.Price : 0)
                    let date = quotationGrid[index]?.EffectiveDate

                    obj.partNo = quotationGrid[index]?.PartNumber

                    if (quotationGrid[index]?.EffectiveDate) {
                        let variance = Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.poPrice : 0)
                        let month = new Date(date).getMonth()
                        let year = ''
                        let sequence = SEQUENCE_OF_MONTH[month]

                        if (month <= 2) {
                            year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
                        } else {
                            year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
                        }
                        dispatch(getVolumeDataByPartAndYear(quotationGrid[index].PartId, year, quotationGrid[index].PlantId, quotationGrid[index].VendorId, '', VBCTypeId, res => {
                            if (res.data?.Result === true || res.status === 202) {
                                let approvedQtyArr = res.data?.Data?.VolumeApprovedDetails
                                let budgetedQtyArr = res.data?.Data?.VolumeBudgetedDetails
                                let actualQty = 0
                                let totalBudgetedQty = 0
                                let actualRemQty = 0

                                approvedQtyArr.map((data) => {
                                    if (data?.Sequence < sequence) {
                                        // if(data?.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
                                        //   actualQty += parseInt(data?.ApprovedQuantity)
                                        // }
                                        actualQty += parseInt(data?.ApprovedQuantity)
                                    } else if (data?.Sequence >= sequence) {
                                        actualRemQty += parseInt(data?.ApprovedQuantity)
                                    }
                                    return null
                                })
                                budgetedQtyArr.map((data) => {
                                    // if (data?.Sequence >= sequence) {
                                    totalBudgetedQty += parseInt(data?.BudgetedQuantity)
                                    return null
                                    // }
                                })
                                obj.consumptionQty = checkForNull(actualQty)
                                obj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
                                obj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
                                obj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

                            }
                        })

                        )
                    }


                    obj.reason = ''
                    obj.ecnNo = ''
                    obj.effectiveDate = quotationGrid[index]?.EffectiveDate

                    obj.isDate = quotationGrid[index]?.EffectiveDate ? true : false
                    obj.partNo = quotationGrid[index]?.PartNumber // Part id id part number here  USE PART NUMBER KEY HERE      
                    obj.partId = quotationGrid[index]?.PartId
                    obj.technologyId = quotationGrid[index]?.TechnologyId

                    obj.CostingHead = quotationGrid[index]?.costingHeadCheck

                    obj.destinationPlantCode = getCodeBySplitting(quotationGrid[index]?.PlantName)
                    obj.destinationPlantName = getNameBySplitting(quotationGrid[index]?.PlantName)
                    obj.destinationPlantId = quotationGrid[index]?.PlantId
                    obj.costingTypeId = quotationGrid[index]?.NfrId !== null ? NCCTypeId : VBCTypeId
                    obj.customerName = quotationGrid[index]?.customerName
                    obj.customerId = quotationGrid[index]?.customerId
                    obj.customerCode = quotationGrid[index]?.customerCode
                    obj.customer = quotationGrid[index]?.customer
                    obj.BasicRate = quotationGrid[index]?.BasicRate


                    // if (quotationGrid[index]?.EffectiveDate) {
                    //     let variance = Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.poPrice : 0)
                    //     let month = new Date(date).getMonth()
                    //     let year = ''
                    //     // let sequence = SEQUENCE_OF_MONTH[month]

                    //     if (month <= 2) {
                    //         year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
                    //     } else {
                    //         year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
                    //     }


                    //     dispatch(getVolumeDataByPartAndYear(quotationGrid[0].PartId, year, (res) => {


                    //         

                    //     }))

                    //     obj.consumptionQty = 0
                    //     obj.remainingQty = 0
                    //     obj.annualImpact = 0
                    //     obj.yearImpact = 0


                    //     // obj.consumptionQty = quotationGrid[index]?.effectiveDate ? consumptionQty : ''
                    //     // obj.remainingQty = quotationGrid[index]?.effectiveDate ? remainingQty : ''
                    //     // obj.annualImpact = quotationGrid[index]?.effectiveDate ? annualImpact : ''
                    //     // obj.yearImpact = quotationGrid[index]?.effectiveDate ? yearImpact : ''


                    // }


                    temp.push(obj)
                    return null
                }
                return null
            }
            )

        dispatch(setCostingApprovalData(temp))
    }




    const sendReminder = (id, rowData) => {

        let data = {
            quotationId: rowData?.QuotationId,
            vendorId: rowData?.VendorId,
            PartId: rowData?.PartId
        }
        dispatch(sendReminderForQuotation(data, (res) => {

            if (res) {
                Toaster.success('Reminder sent successfully.')
                getDataList()
            }
        }))

    }


    const getRemarkHistory = (cell, rowData) => {
        setRemarkRowData(rowData)

        setTimeout(() => {
            setRemarkHistoryDrawer(true)
        }, 500);

    }


    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        setShowPopup(false)
    }

    const onPopupConfirm = () => {
        confirmDelete();
    }

    const closePopUp = () => {
        setShowPopup(false)
    }

    const closeUserDetails = (e = '', type) => {
        setIsOpen(false)
        if (type !== false) {
            setloader(true)
            setTimeout(() => {
                dispatch(setCostingViewData([...multipleCostingDetails]))
                setloader(false)
            }, 200);
        }
    }
    const toggleExtraData = (showTour) => {

        if (showTour === true) {
            setTimeout(() => {
                setShowCompareButton(true)
            }, 100);
        }
        else {
            setShowCompareButton(false)
        }



    }
    const viewCostingDetail = (rowData) => {
        setIsReportLoader(true)
        if (rowData?.CostingId && Object.keys(rowData?.CostingId).length > 0) {
            dispatch(getSingleCostingDetails(rowData?.CostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data
                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
                setIsReportLoader(false)
            }))
        }
        setIsOpen(true)
    }

    const checkCostingSelected = (list, index) => {


        setState(prevState => ({ ...prevState, approvalObj: list }));
        setIndex(index);
        setSelectedCostingList(list);
        const partTypes = partType?.split(',');

        let arr = [];
        let filteredArr = [];
        let matchedStatus
        partTypes?.forEach(type => {
            switch (type.trim()) {
                case 'Component':
                case 'Assembly':
                    filteredArr = _.map(viewCostingData, 'costingId')
                    filteredArr.map(item => selectedRows.filter(el => {
                        if (el.CostingId === item) {
                            arr.push(el)
                        }
                    }))
                    matchedStatus = list?.map(selectedItem => {
                        const matchedItem = arr.find(item => item?.CostingId === selectedItem);
                        return matchedItem ? matchedItem.Status : null;
                    });
                    break
                case 'Bought Out Part':
                    filteredArr = _.map(viewBOPDetails, 'BoughtOutPartId')
                    filteredArr.map(item => selectedRows.filter(el => {
                        if (el.BoughtOutPartId === item) {
                            arr.push(el)
                        }
                    }))
                    matchedStatus = list?.map(selectedItem => {
                        const matchedItem = arr.find(item => item?.BoughtOutPartId === selectedItem);
                        return matchedItem ? matchedItem.Status : null;
                    });
                    break

                case 'Raw Material':

                    filteredArr = _.map(viewRmDetails, 'RawMaterialId')
                    filteredArr.map(item => selectedRows.filter(el => {
                        if (el.RawMaterialId === item) {
                            arr.push(el)
                        }
                    }))
                    matchedStatus = list?.map(selectedItem => {
                        const matchedItem = arr.find(item => item?.RawMaterialId === selectedItem);
                        return matchedItem ? matchedItem.Status : null;
                    });
                    break
                default:
                    break

            }
        })




        setMatchedStatus(matchedStatus);
        const uniqueStatuses = new Set(matchedStatus);
        if (uniqueStatuses.size > 1) {
            setCostingsDifferentStatus(true);
            Toaster.warning('Actions cannot be performed on costings with different statuses.');
        } else {
            setCostingsDifferentStatus(false);
        }
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        console.log('props: ', props);

        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        let showActionIcons = false
        let showReminderIcon = false
        let showRemarkHistory = false

        console.log('rowData: ', rowData, rowData?.CostingId);
        console.log('rowData?.CostingNumber === null || rowData?.RawMaterialId === null || rowData?.BoughtOutPartId : ', rowData?.CostingNumber === null, rowData?.RawMaterialId === null || rowData?.BoughtOutPartId);
        if (rowData?.CostingNumber === null && rowData?.RawMaterialId === null && rowData?.BoughtOutPartId) {
            showReminderIcon = true

        } else {

            showRemarkHistory = true
            if (rowData.ShowApprovalButton) {
                showActionIcons = true

            } else {

                showActionIcons = false
            }
        }
        console.log('showRemarkHistory: ', showRemarkHistory);

        let reminderCount = rowData?.RemainderCount

        return (
            <>
                {/* {< button title='View' className="View mr-1" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />} */}
                {/* {showActionIcons && <button title='Approve' className="approve-icon mr-1" type={'button'} onClick={() => singleApprovalDetails(cellValue, rowData)}><div className='approve-save-tick'></div></button>}
                {showActionIcons && <button title='Reject' className="CancelIcon mr-1" type={'button'} onClick={() => rejectDetails(cellValue, rowData)} />} */}
                {showRemarkHistory && <button title='Remark History' id='ViewRfq_remarkHistory' className="btn-history-remark mr-1" type={'button'} onClick={() => { getRemarkHistory(cellValue, rowData) }}><div className='history-remark'></div></button>}
                {showReminderIcon && !rowData?.IsLastSubmissionDateCrossed && rowData?.IsShowReminderIcon && <button title={`Reminder: ${reminderCount}`} className="btn-reminder mr-1" type={'button'} onClick={() => { sendReminder(cellValue, rowData) }}><div className="reminder"><div className="count">{reminderCount}</div></div></button>}
                {rowData?.CostingId && < button title='View' id='ViewRfq_view' className="View mr-1" type={'button'} onClick={() => viewCostingDetail(rowData)} />}

            </>
        )
    };

    // Add this effect
    useEffect(() => {
        if (shouldRedirect) {
            history.push('/rfq-listing');
        }
    }, [shouldRedirect, history]);
    const closeDrawer = (e = '', type) => {
        setAddRfqData({})
        setAddRfq(false)
        setRejectDrawer(false)
        setReturnDrawer(false)
        if (type !== 'cancel') {
            getDataList()
            setShouldRedirect(true)
        }
    }

    const closeRemarkDrawer = (type) => {
        setRemarkHistoryDrawer(false)
    }


    const onGridReady = (params) => {
        agGridRef.current = params.api;
        setgridApi(params.api);
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };


    const onPageSizeChanged = (newPageSize) => {
        gridApi?.paginationSetPageSize(Number(newPageSize));

    };


    const isFirstColumn = (params) => {

        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }

    }

    const linkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <div
                    onClick={() => viewDetails(row.UserId)}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }

    // Function that takes an array of objects as an input and returns the same array with an additional object representing the "best cost"
    const bestCostObjectFunction = (arrayList) => {
        // Create a copy of the input array to prevent mutation
        let finalArrayList = _.cloneDeep(arrayList);

        // Check if the input array is empty or null
        if (!finalArrayList || finalArrayList.length === 0) {
            // If so, return an empty array
            return [];
        } else {
            // Define an array of keys to check when finding the "best cost"
            let keysToCheck = []
            let keysToCheckSum = []
            const keysToAvoid = ["TotalTCOCost"];
            // const keysToCheck = ["nPOPriceWithCurrency"];
            if (isAssemblyTechnology) {
                keysToCheck = ["nTotalRMBOPCC", "sTreatment", "nPackagingAndFreight", "totalToolCost", "nsTreamnt", "tCost", "nConvCost", "netSurfaceTreatmentCost", "nOverheadProfit", "nPoPriceCurrency", "nPOPrice", "nPOPriceWithCurrency", "TotalTCOCost"];
                keysToCheckSum = ["nTotalRMBOPCC", "nPackagingAndFreight", "totalToolCost", "nConvCost", "netSurfaceTreatmentCost", "nOverheadProfit", "TotalTCOCost"];
            } else {
                keysToCheck = ["netRM", "netBOP", "pCost", "oCost", "sTreatment", "nPackagingAndFreight", "totalToolCost", "nsTreamnt", "tCost", "nConvCost", "nTotalRMBOPCC", "netSurfaceTreatmentCost", "nOverheadProfit", "nPoPriceCurrency", "nPOPrice", "nPOPriceWithCurrency", "TotalTCOCost"];
                keysToCheckSum = ["netRM", "netBOP", "nPackagingAndFreight", "totalToolCost", "nConvCost", "netSurfaceTreatmentCost", "nOverheadProfit", "TotalTCOCost"];
            }
            // Create a new object to represent the "best cost" and set it to the first object in the input array
            let minObject = _.cloneDeep(finalArrayList[0]);

            // Loop through each object in the input array
            for (let i = 0; i < finalArrayList?.length; i++) {
                // Get the current object
                let currentObject = finalArrayList[i];

                // Loop through each key in the current object
                for (let key in currentObject) {
                    // Check if the key is in the keysToCheck array
                    if (keysToCheck?.includes(key)) {
                        // Check if the current value and the minimum value for this key are both numbers
                        if (isNumber(currentObject[key]) && isNumber(minObject[key])) {
                            // If so, check if the current value is smaller than the minimum value
                            if (checkForNull(currentObject[key]) < checkForNull(minObject[key])) {
                                // If so, set the current value as the minimum value
                                minObject[key] = currentObject[key];
                            }
                            // If the current value is an array
                        } else if (Array.isArray(currentObject[key])) {
                            // Set the minimum value for this key to an empty array
                            minObject[key] = [];
                        }
                    } else {
                        // If the key is not in the keysToCheck array, set the minimum value for this key to a dash
                        minObject[key] = "-";
                        // delete minObject[key];
                    }
                }
                // Set the attachment and bestCost properties of the minimum object
                let sum = 0
                for (let key in finalArrayList[0]) {
                    if (keysToCheckSum?.includes(key)) {
                        if (!keysToAvoid?.includes(key)) {
                            if (isNumber(minObject[key])) {
                                sum = sum + checkForNull(minObject[key]);
                            } else if (Array.isArray(minObject[key])) {
                                minObject[key] = [];
                            }
                        }
                    } else {
                        minObject[key] = "-";
                    }
                }
                minObject.attachment = []
                minObject.bestCost = true
                minObject.nPOPrice = sum
            }
            // Add the minimum object to the end of the array
            finalArrayList.push(minObject);
        }

        // Return the modified array
        return finalArrayList;
    }

    const addComparisonDrawerToggle = () => {
        let arr = []

        selectedRows && selectedRows?.map(item => {
            if (item?.CostingId) {
                arr.push(item?.CostingId)
            }
        })

        setCompareButtonPressed(true)
        setCostingListToShow(arr)
        let temp = []
        let tempObj = {}
        const isApproval = selectedRows.filter(item => item?.ShowApprovalButton)




        setDisableApproveRejectButton(isApproval.length > 0)
        let costingIdList = selectedRows?.length > 0 ? [...selectedRows[0]?.ShouldCostings, ...selectedRows] : selectedRows
        setSelectedCostingList([])
        const partTypes = partType?.split(',');
        partTypes?.forEach(type => {
            switch (type.trim()) {
                case 'Component':
                case 'Assembly':
                    setloader(true)
                    dispatch(getMultipleCostingDetails(costingIdList, (res) => {
                        if (res) {
                            res?.map((item) => {
                                tempObj = formViewData(item?.data?.Data)
                                temp.push(tempObj[0])
                                return null
                            })
                            let dat = [...temp]
                            let tempArrToSend = _.uniqBy(dat, 'costingId')
                            let arr = bestCostObjectFunction(tempArrToSend)
                            setMultipleCostingDetails([...arr])
                            dispatch(setCostingViewData([...arr]))

                            setaddComparisonToggle(true)
                            setloader(false)
                            setViewRMCompare(false)
                            setViewBOPCompare(false)
                        }
                        setCompareButtonPressed(false)
                    }))
                    break;
                case 'Raw Material':
                    setViewRMCompare(true)
                    setaddComparisonToggle(true)
                    setViewBOPCompare(false)
                    break
                case 'Bought Out Part':
                    setViewBOPCompare(true)
                    setViewRMCompare(false)

                    setaddComparisonToggle(true)
                    break
                default:
                    break;
            }
        })

    }


    const viewDetails = (UserId) => {

        // setState({
        //     UserId: UserId,
        //     isOpen: true,
        // })

    }

    const onRowSelect = (event) => {

        if (event.node.isSelected()) {
            const selectedRowIndex = event.node.rowIndex;


            setSelectedRowIndex(selectedRowIndex)
        } else {
            setaddComparisonToggle(false)
            setSelectedRowIndex('')
            gridApi?.deselectAll()
        }


        const selectedRows = gridApi?.getSelectedRows()
        let partNumber = []
        let data
        const partTypes = selectedRows[0]?.PartType.split(',');
        partTypes?.forEach(type => {
            switch (type.trim()) {
                case 'Raw Material':
                    selectedRows?.map(item => partNumber?.push(item?.RawMaterial))
                    data = partNumber.map(item => rowData?.filter(el => el.RawMaterial === item))
                    // SELECTED ALL COSTING ON THE CLICK ON PARTbreak;
                    break;
                case 'Bought Out Part':
                    selectedRows?.map(item => partNumber.push(item?.BoughtOutPart))
                    data = partNumber.map(item => rowData?.filter(el => el.BoughtOutPart === item))             // SELECTED ALL COSTING ON THE CLICK ON PART

                    break;
                case 'Component':
                case 'Assembly':
                    selectedRows?.map(item => partNumber?.push(item?.PartNo))
                    data = partNumber.map(item => rowData?.filter(el => el.PartNumber === item))             // SELECTED ALL COSTING ON THE CLICK ON PART
                    break;
                default:
                    break;



            }

        })

        let newArray = []

        data?.map((item) => {
            newArray = [...newArray, ...item]
            return null
        })



        if (selectedRows && selectedRows.length > 0 && selectedRows[0]?.IsVisibiltyConditionMet && selectedRows[0].IsShowNetPoPrice) {
            setisVisibiltyConditionMet(true)
        } else {
            setisVisibiltyConditionMet(false)
        }



        setSelectedRows(newArray)

        if (selectedRows.length === 0) {
            setAddComparisonButton(true)
        } else {
            setAddComparisonButton(false)
            setTechnologyId(selectedRows[0]?.TechnologyId)
        }
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue != null && cellValue !== '' && cellValue !== undefined) ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }
    const dateTimeFormatter = (props) => {

        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY  hh:mm') : '-';
    }
    const isRowSelectable = rowNode => rowNode.data ? rowNode?.data?.ShowCheckBox : false;


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
        hyphenFormatter: hyphenFormatter
    };

    const cellClass = (props) => {
        return `${props?.data?.LastRow ? `border-color` : ''} ${props?.data?.RowMargin} colorWhite`          // ADD SCSS CLASSES FOR ROW MERGING
    }

    const partNumberFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (props?.rowIndex === selectedRowIndex) {
            props.node.setSelected(true)
        }
        return cellValue ? cellValue : ''
    }
    const seperateHyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue === null ? '-' : cellValue
    }
    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const displayStatus = row?.DisplayStatus ?? '-';

        return <div className={cell}>{displayStatus}</div>
    }
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        statusFormatter: statusFormatter,
        linkableFormatter: linkableFormatter,
        dateFormatter: dateFormatter,
        partNumberFormatter: partNumberFormatter,
        customNoRowsOverlay: NoContentFound,
        seperateHyphenFormatter: seperateHyphenFormatter,
        valuesFloatingFilter: SingleDropdownFloationFilter,
        dateTimeFormatter: dateTimeFormatter,
    }

    const closeSendForApproval = (e = '', type) => {
        setSendForApproval(false)
        // history.push('/rfq-listing');
        // <RfqListing />

        if (type !== "Cancel") {
            getDataList()
        }
    }
    const getRowStyle = () => {
        return {
            backgroundColor: 'white'
        }
    }
    const onFirstDataRendered = () => {
        if (gridApi) {
            window.screen.width > 1600 && gridApi?.sizeColumnsToFit();

        }
    };

    const hideSummaryHandler = () => {

        setaddComparisonToggle(false)
        setSelectedRowIndex('')
        gridApi?.deselectAll()
    }
    const headerPartType = () => {
        const partTypes = partType?.split(',');
        let headerName = "";

        partTypes?.forEach(type => {
            switch (type.trim()) {
                case 'Raw Material':
                    headerName = "RM Name";
                    break;
                case 'Bought Out Part':
                    headerName = "BOP Name";
                    break;
                case 'Component':
                case 'Assembly':
                    headerName = "Part Name";
                    break;
                default:
                    break;
            }
        });

        return headerName;

    }


    const closeApprovalDrawer = (e = '', type) => {
        setApproveDrawer(false);
        setMasterRejectDrawer(false);

        if (type !== "Cancel") {
            props.closeDrawer(false); // Pass true to indicate that data should be refreshed
        }
        // else {
        //     props.closeDrawer(true); // Pass false if no refresh is needed
        // }
    }
    const handleInitiateAuction = () => {
        history.push({
            pathname: '/add-auction',
            state: { source: 'rfq', quotationId: quotationId }
        });
    }

    return (
        <>
            <div className={`ag-grid-react rfq-portal ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                {loader ? <LoaderCustom customClass="simulation-Loader" /> :
                    <>

                        <Row className={`filter-row-large`}>
                            <Col md="6" className='d-flex'>
                                <h3 className='mt-2'>RFQ No. : {data?.QuotationNumber ? data?.QuotationNumber : '-'}
                                    <TourWrapper
                                        buttonSpecificProp={{ id: "View_Rfq_Tour", onClick: toggleExtraData }}
                                        stepsSpecificProp={{
                                            steps: Steps(t, {
                                                compare: isVisibiltyConditionMet,
                                                view: rowData?.CostingId,
                                                action: rowData[0]?.IsVisibiltyConditionMet
                                            }
                                            ).VIEW_RFQ
                                        }}
                                    // onClose={closeTour}  // Pass the closeTour function to be called when the tour is closed
                                    />
                                </h3>
                            </Col>
                            <Col md="6" className='d-flex justify-content-end align-items-center mb-2 mt-1'>
                                <div className='d-flex  align-items-center'><div className='w-min-fit'>{havellsConditionKey ? "Initiated by:" : "Raised By:"}</div>
                                    <input
                                        type="text"
                                        className="form-control mx-2 defualt-input-value"
                                        value={data.RaisedBy}
                                        style={{ width: (data.RaisedBy.length * 9 + 13) + 'px' }}
                                        disabled={true}
                                    /> </div>
                                <div className='d-flex align-items-center pr-0'><div className='w-min-fit'>Raised On:</div>
                                    <input
                                        type="text"
                                        className="form-control ml-2 defualt-input-value"
                                        disabled={true}
                                        style={{ width: '100px' }}
                                        value={data.RaisedOn ? DayTime(data.RaisedOn).format('DD/MM/YYYY') : '-'}
                                    />
                                </div>
                                {
                                    // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                    (!props.isMasterSummaryDrawer) &&
                                    <>

                                        <button type="button" className="user-btn ml-2 ViewRfq_reset" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                        {(isVisibiltyConditionMet || showCompareButton) && <Link to={"rfq-compare-drawer"} smooth={true} spy={true} offset={-250}>
                                            <button
                                                id='ViewRfq_compare'
                                                type="button"
                                                className={'user-btn comparison-btn ml-1'}
                                                disabled={addComparisonButton || !partType}
                                                onClick={addComparisonDrawerToggle}
                                            >
                                                <div className="compare-arrows"></div>Compare</button>
                                        </Link>}
                                        <button type="button" id='ViewRfq_back' className={"apply ml-1"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>

                                    </>
                                }
                            </Col>

                        </Row>
                        <Row>
                            <Col>
                                <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                    <div className={`ag-theme-material ${(loader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                        <AgGridReact
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            ref={agGridRef}
                                            domLayout='autoHeight'
                                            rowData={rowData}
                                            pagination={true}
                                            paginationPageSize={10}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: 'imagClass'
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            rowSelection={'single'}
                                            getRowStyle={getRowStyle}
                                            onRowSelected={onRowSelect}
                                            isRowSelectable={isRowSelectable}
                                            suppressRowClickSelection={true}
                                            onFirstDataRendered={onFirstDataRendered}
                                            enableBrowserTooltips={true}
                                        >

                                            <AgGridColumn cellClass={cellClass} field="PartNo" headerName={headerPartType()} cellRenderer={'partNumberFormatter'}></AgGridColumn>
                                            <AgGridColumn field="PartTypes" cellClass={cellClass} headerName="Part Type" width={150} cellRenderer={seperateHyphenFormatter}></AgGridColumn>
                                            {initialConfiguration.IsNFRConfigured && <AgGridColumn cellClass={cellClass} field="NfrNo" headerName='NFR No.' cellRenderer={seperateHyphenFormatter}></AgGridColumn>}
                                            {partType !== 'Bought Out Part' && <AgGridColumn field="TechnologyName" headerName={technologyLabel}></AgGridColumn>}
                                            {partType === 'Bought Out Part' && <AgGridColumn cellClass={cellClass} field="PRNo" headerName='PR Number' cellRenderer={seperateHyphenFormatter}></AgGridColumn>}

                                            <AgGridColumn field="VendorName" tooltipField="VendorName" headerName='Vendor (Code)'></AgGridColumn>
                                            <AgGridColumn field="PlantName" tooltipField="PlantName" headerName='Plant (Code)'></AgGridColumn>
                                            {/* <AgGridColumn field="PartNumber" headerName="Attachment "></AgGridColumn> */}
                                            <AgGridColumn field="Remark" tooltipField="Remark" headerName='Notes' cellRenderer={hyphenFormatter}></AgGridColumn>
                                            <AgGridColumn field="VisibilityMode" headerName='Visibility Mode' cellRenderer={hyphenFormatter}></AgGridColumn>
                                            <AgGridColumn field="VisibilityDate" width={"300px"} headerName='Visibility Date' cellRenderer={dateTimeFormatter}></AgGridColumn>
                                            <AgGridColumn field="VisibilityDuration" headerName='Visibility Duration' cellRenderer={hyphenFormatter}></AgGridColumn>
                                            <AgGridColumn field="CostingNumber" headerName=' Costing Number' cellRenderer={hyphenFormatter}></AgGridColumn>
                                            <AgGridColumn field="CostingId" headerName='Costing Id ' hide={true}></AgGridColumn>
                                            <AgGridColumn field="NetPOPrice" headerName=" Net Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                            <AgGridColumn field="SubmissionDate" headerName='Submission Date' cellRenderer={dateFormatter}></AgGridColumn>
                                            <AgGridColumn field="EffectiveDate" headerName='Effective Date' cellRenderer={dateFormatter}></AgGridColumn>
                                            <AgGridColumn width={350} field="Status" tooltipField="tooltipText" headerName="Status" headerClass="justify-content-center" cellClass="text-center" cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterRFQ}></AgGridColumn>
                                            {rowData[0]?.IsVisibiltyConditionMet === true && <AgGridColumn width={window.screen.width >= 1920 ? 280 : 220} field="QuotationId" pinned="right" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                        </AgGridReact>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                }

                {
                    sendForApproval && (
                        <SendForApproval
                            isOpen={sendForApproval}
                            closeDrawer={closeSendForApproval}
                            anchor={'right'}
                            isApprovalisting={true}
                            isRfq={true}
                            technologyId={technologyId}
                            cancel={cancel}
                            selectedRows={selectedRows}
                            mandatoryRemark={mandatoryRemark}
                            callSapCheckAPI={false}
                        />
                    )
                }
                {
                    isOpen &&
                    <CostingDetailSimulationDrawer
                        isOpen={isOpen}
                        closeDrawer={closeUserDetails}
                        anchor={"right"}
                        isReport={isOpen}
                        isSimulation={false}
                        simulationDrawer={false}
                        isReportLoader={isReportLoader}
                        isRfqCosting={true}
                    />
                }
                {rejectDrawer && !masterRejectDrawer && (
                    <CostingApproveReject
                        // <ApproveRejectDrawer    //RE
                        type={'Reject'}
                        isOpen={rejectDrawer}
                        approvalData={rejectedList}
                        closeDrawer={closeDrawer}
                        //  tokenNo={approvalNumber}
                        anchor={'right'}
                        isRFQApproval={true}
                        cancel={cancel}
                    // IsFinalLevel={!showFinalLevelButtons}
                    // reasonId={approvalDetails.ReasonId}
                    // IsPushDrawer={showPushDrawer}
                    // dataSend={[approvalDetails, partDetail]}
                    />
                )}
                {returnDrawer && !masterRejectDrawer && (
                    <CostingApproveReject
                        // <ApproveRejectDrawer    //RE
                        type={'Return'}
                        isOpen={returnDrawer}
                        approvalData={returnList}
                        closeDrawer={closeDrawer}
                        //  tokenNo={approvalNumber}
                        anchor={'right'}
                        isRFQApproval={true}
                        cancel={cancel}
                    // IsFinalLevel={!showFinalLevelButtons}
                    // reasonId={approvalDetails.ReasonId}
                    // IsPushDrawer={showPushDrawer}
                    // dataSend={[approvalDetails, partDetail]}
                    />
                )}

                {addRfq &&

                    <AddRfq
                        data={addRfqData}
                        //hideForm={hideForm}
                        AddAccessibilityRMANDGRADE={true}
                        EditAccessibilityRMANDGRADE={true}
                        isRMAssociated={true}
                        isOpen={addRfq}
                        anchor={"right"}
                        isEditFlag={isEdit}
                        closeDrawer={closeDrawer}
                    />
                }
                {
                    <div id='rfq-compare-drawer'>
                        {(!viewRMCompare && !viewBOPCompare) && addComparisonToggle && (
                            <QuotationId.Provider value={data?.QuotationId}>

                                <CostingSummaryTable
                                    viewMode={true}
                                    isRfqCosting={true}
                                    // costingID={approvalDetails.CostingId}
                                    approvalMode={true}
                                    // isApproval={approvalData.LastCostingId !== EMPTY_GUID ? true : false}
                                    simulationMode={false}
                                    uniqueShouldCostingId={uniqueShouldCostingId}
                                    costingIdExist={true}
                                    bestCostObjectFunction={bestCostObjectFunction}
                                    crossButton={hideSummaryHandler}
                                    costingIdList={costingListToShow}
                                    isFromViewRFQ={true}
                                    checkCostingSelected={checkCostingSelected}
                                    disableApproveRejectButton={disableApproveRejectButton}
                                    compareButtonPressed={compareButtonPressed}
                                    showEditSOBButton={addComparisonToggle && disableApproveRejectButton && viewCostingData.length > 0}
                                    selectedTechnology={viewCostingData && viewCostingData.length > 0 && viewCostingData[0].technology}
                                    costingsDifferentStatus={costingsDifferentStatus}
                                />
                            </QuotationId.Provider>
                        )}
                        {(viewRMCompare && addComparisonToggle) && <RMCompareTable
                            checkCostingSelected={checkCostingSelected}
                            selectedRows={selectedRows}
                            uniqueShouldCostingId={uniqueShouldCostingId}
                        />}
                        {(viewBOPCompare && addComparisonToggle) && <BOPCompareTable
                            checkCostingSelected={checkCostingSelected}
                            selectedRows={selectedRows}
                            uniqueShouldCostingId={uniqueShouldCostingId}
                            quotationId={data?.QuotationId}
                        />}
                    </div>
                }
                {remarkHistoryDrawer &&
                    <RemarkHistoryDrawer
                        data={remarkRowData}
                        //hideForm={hideForm}
                        AddAccessibilityRMANDGRADE={true}
                        EditAccessibilityRMANDGRADE={true}
                        isRMAssociated={true}
                        isOpen={remarkHistoryDrawer}
                        anchor={"right"}
                        isEditFlag={isEdit}
                        closeDrawer={closeRemarkDrawer}
                    />
                }
                {(approveDrawer || masterRejectDrawer) &&
                    <MasterSendForApproval
                        isOpen={approveDrawer ? approveDrawer : masterRejectDrawer}
                        type={actionType}
                        closeDrawer={closeApprovalDrawer}
                        isEditFlag={false}
                        masterId={partType === "Raw Material" ? RM_MASTER_ID : BOP_MASTER_ID}
                        isRFQ={true}
                        anchor={"right"}
                        approvalDetails={state.approvalObj}
                        approvalObj={state.approvalObj}
                        costingTypeId={ZBCTypeId}
                        levelDetails={state.levelDetails}
                        partType={partType}
                        selectedRows={selectedRows}
                    />
                }

            </div >
            {addComparisonToggle && disableApproveRejectButton && (viewCostingData?.length > 0 || viewRmDetails?.length > 0 || viewBOPDetails?.length > 0) && <Row className="btn-sticky-container sf-btn-footer no-gutters justify-content-between">
                {costingsDifferentStatus && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Actions cannot be performed on costings with different statuses.'} />}
                <div className="col-sm-12 text-right bluefooter-butn">
                    {(matchedStatus?.length !== 0 || matchedStatus?.includes(RECEIVED)) && (<button
                        type="button"
                        className="submit-button save-btn mr-2"
                        id="addRFQ_save"
                        disabled={false}
                        onClick={handleInitiateAuction}
                    >
                        <div className={"save-icon"}></div>
                        {"Initiate Reverse Auction"}
                    </button>)}
                    {(matchedStatus?.length !== 0 || matchedStatus?.includes(RECEIVED)) && (
                        <button type={'button'} disabled={costingsDifferentStatus} className="mr5 approve-reject-btn" onClick={() => returnDetailsClick("", selectedRows)} >
                            {/* <button type={'button'} disabled={costingsDifferentStatus} className="mr5 approve-reject-btn" onClick={() => returnDetailsClick("", selectedRows)} > */}
                            <div className={'cancel-icon-white mr5'}></div>
                            {'Return'}
                        </button>)}
                    {(matchedStatus?.length !== 0 || matchedStatus?.includes(RECEIVED)) && (
                        <button type={'button'} disabled={costingsDifferentStatus} className="mr5 approve-reject-btn" onClick={() => rejectDetailsClick("", selectedRows)} >
                            <div className={'cancel-icon-white mr5'}></div>
                            {'Reject'}
                        </button>)}
                    {(matchedStatus?.length !== 0 || matchedStatus?.includes(RECEIVED)) && (
                        <button
                            disabled={costingsDifferentStatus}
                            type="button"
                            className="approve-button mr5 approve-hover-btn"
                            onClick={() => approveDetails("", selectedRows)}
                        >
                            <div className={'save-icon'}></div>
                            {'Approve'}
                        </button>
                    )}



                </div>

            </Row >
            }
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
        </>
    );
}

export default RfqListing;

