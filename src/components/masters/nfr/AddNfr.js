import _, { debounce } from 'lodash';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row, Table } from 'reactstrap';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import { EMPTY_DATA, EMPTY_GUID, NFR, NFRTypeId, VBCTypeId, searchCount, PFS2TypeId, DRAFT, DRAFTID, REJECTEDID } from '../../../config/constants';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import HeaderTitle from '../../common/HeaderTitle';
import NoContentFound from '../../common/NoContentFound';
import Toaster from '../../common/Toaster';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { getNFRPartWiseGroupDetail, saveNFRCostingInfo, saveNFRGroupDetails } from './actions/nfr';
import { checkForNull, checkVendorPlantConfigurable, loggedInUserId, userDetails, userTechnologyLevelDetails } from '../../../helper';
import { dataLiist } from '../../../config/masterData';
import { checkFinalUser, createCosting, createPFS2Costing, deleteDraftCosting, getBriefCostingById, storePartNumber } from '../../costing/actions/Costing';
import ApprovalDrawer from './ApprovalDrawer';
import TooltipCustom from '../../common/Tooltip'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import { getUsersTechnologyLevelAPI } from '../../../actions/auth/AuthActions';
import WarningMessage from '../../common/WarningMessage'
import LoaderCustom from '../../common/LoaderCustom';
import OutsourcingDrawer from './OutsourcingDrawer';



//this is the data that we are getting from the backend please delete it after the backend is ready
// [{
//     groupName: 'Group-first', data: [{ vendorName: 'vendor 1', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     { vendorName: 'vendor 2', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     { vendorName: 'vendor 3', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//     ], netPrice: 30
// },
//     {
//         groupName: 'Group-second', data: [{ vendorName: 'vendor 1', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 2', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 3', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         { vendorName: 'vendor 4', sob: 30, CostingVersion: '1223', Status: 'Draft', poPrice: 30 },
//         ], netPrice: 10
//     }]
function AddNfr(props) {
    const { nfrData, nfrIdsList, isViewEstimation } = props;
    const dispatch = useDispatch();
    const [rowData, setRowData] = useState([])
    const [vendorName, setVendorname] = useState([])
    const [vendor, setVendor] = useState([]);
    const [addNewCosting, setAddNewCosting] = useState(false)
    const [isRowEdited, setIsRowEdited] = useState(false)
    const [nfrPartDetail, setNFRPartDetail] = useState([])
    // const [nFRPartWiseGroupDetails, setNFRPartWiseGroupDetails] = useState({})
    const partNumber = useSelector(state => state.costing.partNo);
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const partInfo = useSelector((state) => state.costing.partInfo)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    let history = useHistory();
    const [isAddDetails, setIsAddDetails] = useState(false);
    const [partInfoStepTwo, setpartInfoStepTwo] = useState({});
    const [costingData, setcostingData] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [costingOptionsSelectedObject, setCostingOptionsSelectedObject] = useState([]);
    const [selectedCheckBox, setSelectedCheckbox] = useState(false);
    const [isCostingViewMode, setIsCostingViewMode] = useState(false);
    const [isOEQAAdded, setIsOEQAAdded] = useState(false);
    const [callAPI, setCallAPI] = useState(false);
    const [latestRow, setlatestRow] = useState('');
    const [showOutsourcingDrawer, setShowOutsourcingDrawer] = useState('');
    const [OutsourcingCostingData, setOutsourcingCostingData] = useState({});
    const [indexOuter, setIndexOuter] = useState('');
    const [indexInside, setIndexInside] = useState('');

    const [isVendorDisabled, setIsVendorDisabled] = useState(false);
    const [shouldBeLevel, setShouldBeLevel] = useState(0);
    const [freezeUpperLevels, setFreezeUpperLevels] = useState('');
    const [freezeUpperLevelsNumbers, setFreezeUpperLevelsNumber] = useState('');
    const [costingObj, setCostingObj] = useState({
        item: {},
        index: []
    })
    const [showPopup, setShowPopup] = useState(false)
    const [levelDetails, setLevelDetails] = useState({})
    const [sendForApprovalButtonDisable, setSendForApprovalButtonDisable] = useState(false)
    const [popupMsg, setPopupMsg] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [editWarning, setEditWarning] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [loader, setLoader] = useState(false)
    const [isFinalApproverShowButton, setIsFinalApproverShowButton] = useState(true)
    const [allCostingNotSelected, setAllCostingNotSelected] = useState(false)

    const { register, setValue, getValues, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const handleVendorChange = (newValue) => {
        if (vendorName?.length < 4 || newValue?.length < 4 || !newValue?.length) {
            setVendorname(newValue)
        } else {
            setTimeout(() => {
                setValue('VendorName', vendorName)
            }, 50);
        }
    }

    useEffect(() => {
        let rowtemp = rowData.filter(element => Number(element?.statusId) === DRAFTID)
        let dataList = _.map(rowtemp[0]?.data, 'SelectedCostingVersion')
        if (dataList?.length === 0 || dataList.includes(undefined)) {
            // if (dataList.every(value => value === undefined)) {
            setAllCostingNotSelected(true)
        } else {
            setAllCostingNotSelected(false)
        }

    }, [rowData])

    const getDetails = () => {
        setLoader(true)
        let requestObject = {
            nfrId: nfrIdsList?.NfrMasterId,
            partWiseDetailId: nfrIdsList?.NfrPartWiseDetailId,
            plantId: nfrData?.PlantId ? nfrData?.PlantId : nfrPartDetail?.PlantId
        }
        dispatch(getNFRPartWiseGroupDetail(requestObject, (res) => {
            if (res?.data?.Result) {
                const newArray = res?.data?.Data?.groupWiseResponse?.map((item) => {
                    const vendorData = item.VendorList.map((vendor) => {
                        return {
                            label: `${vendor.VendorName} (${vendor.VendorCode})`,
                            value: vendor.VendorId,
                            vendorName: vendor.VendorName,
                            vendorCode: vendor.VendorCode,
                            CostingOptions: vendor.CostingOptions
                        };
                    });

                    return {
                        groupName: item.GroupName,
                        data: vendorData,
                        nfrPartWiseGroupDetailsId: item.NfrPartWiseGroupDetailsId,
                        status: item.Status,
                        statusId: item.StatusId,
                        isRejectedBySAP: item.IsRejectedBySAP,
                    };
                });

                setNFRPartDetail(res?.data?.Data)
                if (newArray?.length === 0) {
                    setCallAPI(true)
                }

                let shouldBelevel = 0
                if (newArray?.length === 0) {
                    setIsVendorDisabled(false)
                    setValue("GroupName", "OEQA 1")
                    shouldBelevel = 1
                } else {
                    let index = newArray?.length - 1
                    if (newArray[0]?.isRejectedBySAP === true) {                // NOT REJECTED         first level
                        // if (!newArray[index]?.isRejectedBySAP) {
                        shouldBelevel = newArray?.length + 1
                        setFreezeUpperLevels(true)
                        setFreezeUpperLevelsNumber(newArray?.length - 1)
                        setValue("GroupName", `OEQA ${shouldBelevel}`)
                        setIsVendorDisabled(false)
                    } else {
                        shouldBelevel = newArray?.length
                        // setFreezeUpperLevels(false)                                  // Dont open in NOT REJECTED first level also all action button is hidden ?? if we open this 
                        setValue("GroupName", "")
                        setIsVendorDisabled(true)
                    }
                    if (newArray[0]?.statusId === DRAFTID || newArray[0]?.statusId === REJECTEDID) {
                        setEditWarning(true)
                        setFilterStatus('Select all costings to send for approval')
                        setSendForApprovalButtonDisable(false)
                    } else {
                        setSendForApprovalButtonDisable(true)
                        setEditWarning(true)
                        setFilterStatus("NFR is under approval.")
                    }
                }
                setShouldBeLevel(shouldBelevel)
                let pfsIndex = newArray?.findIndex(element => element?.groupName === 'PFS1')
                let pfsArray = newArray?.filter(element => element?.groupName === 'PFS1')
                let tempArrForCosting = [...newArray]
                if (pfsArray?.length > 0) {
                    pfsArray[0].SelectedCostingVersion = pfsArray[0]?.data[0]?.CostingOptions[0]
                    tempArrForCosting = Object.assign([...newArray], { [pfsIndex]: pfsArray[0] })
                    setlatestRow(tempArrForCosting?.length - 1)
                }
                if (indexOuter !== '' || indexInside !== '') {
                    let temp = tempArrForCosting[indexOuter].data[indexInside]?.CostingOptions
                    tempArrForCosting[indexOuter].data[indexInside].SelectedCostingVersion = temp?.filter(element => element?.CostingId === OutsourcingCostingData?.CostingId)[0]
                }
                setRowData(tempArrForCosting)
            }
            setTimeout(() => {
                setLoader(false)
            }, 200);
        }))
        reactLocalStorage.setObject('isFromDiscountObj', false)
        let levelDetailsTemp = ''
        dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), nfrData?.TechnologyId, (res) => {
            levelDetailsTemp = userTechnologyLevelDetails(NFRTypeId, res?.data?.Data?.TechnologyLevels)
            if (levelDetailsTemp?.length === 0) {
                setFilterStatus("You don't have permission to send NFR for approval.")
                setEditWarning(true)
                setSendForApprovalButtonDisable(true)
            } else {
                let obj = {}
                obj.DepartmentId = userDetails().DepartmentId
                obj.UserId = loggedInUserId()
                obj.TechnologyId = nfrData?.TechnologyId
                obj.Mode = 'costing'
                obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
                dispatch(checkFinalUser(obj, (res) => {
                    if (res?.data?.Result) {
                        if (res?.data?.Data?.IsFinalApprover) {
                            setIsFinalApproverShowButton(false)
                            setEditWarning(true)
                            setFilterStatus("You are a final level user and cannot send NFR for approval.")
                        }
                    }
                }))
            }
            setLevelDetails(levelDetailsTemp)

        }))
    }

    useEffect(() => {
        getDetails()
    }, [])

    // Sets the initial values of the form fields based on the nfrData prop.
    useEffect(() => {
        if (nfrData) {
            setValue('NfrId', props?.NfrNumber);
            setValue('PartNo', nfrData?.PartNumber);
            setValue('PartName', nfrData?.PartName);
        }
    }, [nfrData, props?.NfrNumber]);

    // Adds a new costing object to the list of existing costings.
    const addRow = () => {
        if (vendorName.length === 0 || getValues('GroupName') === '') {
            Toaster.warning('Please select group name and vendor name');
            return false;
        }
        let vendorList = vendorName && vendorName?.map((item) => {
            item.vendorName = item?.label.split(" (")[0]
            item.vendorCode = item?.label.split(" (")[1].slice(0, -1)
            return item
        })
        const newCosting = {
            groupName: getValues('GroupName'),
            data: vendorList,
            status: DRAFT,
            statusId: DRAFTID,
            isRejectedBySAP: false,
        };
        setSendForApprovalButtonDisable(false)
        setEditWarning(false)
        setCallAPI(true)
        setRowData([...rowData, newCosting]);
        resetData(true)
        setIsOEQAAdded(true)
    };

    const updateRow = () => {
        if (!vendorName || vendorName?.length === 0) {
            Toaster.warning("Please select at least one vendor")
            return false
        }
        let vendorList = vendorName && vendorName?.map((item) => {
            item.vendorName = item?.label.split(" (")[0]
            item.vendorCode = item?.label.split(" (")[1].slice(0, -1)
            return item
        })
        let list = [...rowData]
        let rowIndex = list.findIndex(element => element?.groupName === getValues('GroupName'))
        let rowtemp = list[rowIndex]
        rowtemp.data = vendorList
        let finalList = Object.assign([...list], { [rowIndex]: rowtemp })
        setCallAPI(true)
        setRowData([...finalList]);
        setValue("GroupName", '')
        resetData(true)
        setIsRowEdited(false)
        setIsOEQAAdded(true)
    };

    const resetData = (removeGroup) => {
        if (isRowEdited) {
            setValue('VendorName', '')
            setValue('GroupName', '')
            setIsRowEdited(false)
            setVendorname([])
            setIsOEQAAdded(true)
        } else {
            setVendorname([])
            setValue('VendorName', '')
            setIsRowEdited(false)
            if (removeGroup) {
                setValue('GroupName', '')
            }
        }
    }
    const addDetails = debounce((data, index1, index, isPFS) => {
        if (isPFS) {
            let dataObj = {
                "nfrPartWiseDetailId": nfrIdsList?.NfrPartWiseDetailId,
                "costingId": data?.SelectedCostingVersion?.CostingId
            }
            dispatch(createPFS2Costing(dataObj, (res) => {
                if (res?.data?.Result) {
                    let obj = {
                        nfrGroupId: rowData[index1]?.nfrPartWiseGroupDetailsId,
                        vendorId: data?.value,
                        costingId: res?.data?.Data?.CostingId,
                    }
                    dispatch(saveNFRCostingInfo(obj, (res) => { }))
                    setpartInfoStepTwo({ costingId: res?.data?.Data?.CostingId, PFS2TypeId })
                    setcostingData(res?.data?.Data)
                    dispatch(getBriefCostingById(res?.data?.Data?.CostingId, () => {
                        setIsAddDetails(true)
                    }))
                }
            }))
        } else {
            let dataa = rowData[index1]
            let list = dataa?.data && dataa?.data[index]
            const userDetail = userDetails()
            let tempData = viewCostingData[0]
            const Data = {
                PartId: nfrData?.PartId,
                PartTypeId: nfrPartDetail?.PartTypeId,
                PartType: nfrData?.PartType,
                PartNumber: nfrData?.PartNumber,
                PartName: nfrData?.PartName,
                TechnologyId: nfrData?.TechnologyId,
                ZBCId: userDetail.ZBCSupplierInfo.VendorId,
                VendorId: list?.value,
                VendorPlantId: checkVendorPlantConfigurable() ? tempData.vendorPlantId : '',
                // VendorPlantName: tempData.vendorPlantName,
                // VendorPlantCode: tempData.vendorPlantCode,
                VendorName: list?.vendorName,
                VendorCode: list?.vendorCode,
                PlantId: nfrPartDetail?.PlantId,
                PlantName: nfrPartDetail?.PlantName,
                PlantCode: nfrPartDetail?.PlantCode,
                DestinationPlantId: nfrPartDetail?.PlantId,
                DestinationPlantName: nfrPartDetail?.PlantName,
                DestinationPlantCode: nfrPartDetail?.PlantCode,
                UserId: loggedInUserId(),
                LoggedInUserId: loggedInUserId(),
                ShareOfBusinessPercent: 0,
                IsAssemblyPart: false,
                Description: nfrPartDetail?.Description,
                ECNNumber: nfrPartDetail?.ECNNumber,
                RevisionNumber: nfrPartDetail?.RevisionNumber,
                DrawingNumber: nfrPartDetail?.DrawingNumber,
                Price: nfrPartDetail?.Price ? nfrPartDetail?.Price : '',
                EffectiveDate: nfrPartDetail?.EffectiveDate,
                CostingHead: NFRTypeId,
                CostingTypeId: NFRTypeId,
                CustomerId: '',
                CustomerName: '',
                Customer: ''
            }
            if (callAPI) {
                let length = rowData?.length - 1
                let requestObject = {
                    GroupName: rowData[length]?.groupName,
                    NfrId: nfrIdsList?.NfrMasterId,
                    PlantId: nfrPartDetail?.PlantId,
                    NfrPartWiseDetailId: nfrIdsList?.NfrPartWiseDetailId,
                    LoggedInUserId: loggedInUserId(),
                    vendorList: _.map(rowData[length]?.data, 'value')
                }
                dispatch(saveNFRGroupDetails(requestObject, (response) => {
                    if (response?.data?.Result === true) {
                        Toaster.success("Group details saved successfully")

                        dispatch(createCosting(Data, (res) => {
                            if (res.data?.Result) {
                                let obj = {
                                    nfrGroupId: response?.data?.Identity,
                                    vendorId: data?.value,
                                    costingId: res?.data?.Data?.CostingId,
                                }
                                dispatch(saveNFRCostingInfo(obj, (res) => { }))
                                setpartInfoStepTwo({ costingId: res.data?.Data?.CostingId, NFRTypeId })
                                setcostingData(res.data?.Data)
                                dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
                                    setIsAddDetails(true)
                                }))
                            }
                        }))
                    }
                }))
            } else {

                dispatch(createCosting(Data, (res) => {
                    if (res.data?.Result) {
                        let obj = {
                            nfrGroupId: rowData[index1]?.nfrPartWiseGroupDetailsId,
                            vendorId: data?.value,
                            costingId: res?.data?.Data?.CostingId,
                        }
                        dispatch(saveNFRCostingInfo(obj, (res) => { }))
                        setpartInfoStepTwo({ costingId: res.data?.Data?.CostingId, NFRTypeId })
                        setcostingData(res.data?.Data)
                        dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
                            setIsAddDetails(true)
                        }))
                    }
                }))
            }

        }
    }, 500);

    const viewDetails = (index) => {
        let tempData;
        tempData = costingOptionsSelectedObject[index]
        dispatch(getBriefCostingById(tempData?.CostingId, (res) => {
            setIsCostingViewMode(true)
            if (res?.data?.Result) {
                setpartInfoStepTwo(partInfoStepTwo)
                setcostingData({ costingId: tempData?.CostingId, NFRTypeId })
                setIsAddDetails(true)
            }

        }))
    };

    const editCosting = (index) => {
        let tempData;
        tempData = costingOptionsSelectedObject[index]
        dispatch(getBriefCostingById(tempData?.CostingId, (res) => {
            setIsCostingViewMode(false)
            if (res?.data?.Result) {
                setpartInfoStepTwo(partInfoStepTwo)
                setcostingData({ costingId: tempData?.CostingId, NFRTypeId })
                setIsAddDetails(true)
            }

        }))

    };

    const onPopupConfirm = () => {
        const { item, index, indexOuter } = costingObj;
        deleteCosting(item, index, indexOuter);
    }

    /**
  * @method deleteRowItem
  * @description CONFIRM DELETE COSTINGS
  */
    const deleteItem = (Item, index, indexOuter) => {
        setShowPopup(true)
        setCostingObj({ item: Item, index: index, indexOuter: indexOuter })
    }

    /**
     * @method deleteCosting
     * @description USED FOR DELETE COSTING
     */
    const deleteCosting = (Item, index, indexOuter) => {
        let tempItem = { ...Item }
        let tempItemFinal = { ...Item }
        let reqData = { Id: Item?.SelectedCostingVersion?.CostingId, UserId: loggedInUserId() }
        dispatch(deleteDraftCosting(reqData, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Costing is deleted successfully")
                setTimeout(() => {
                    setValue(`${index}.CostingVersion`, '')
                }, 200);
                let tempRowData = [...rowData]
                tempItemFinal.CostingOptions = tempItem?.CostingOptions.filter(e => e.CostingId !== Item?.SelectedCostingVersion?.CostingId)
                delete tempItemFinal.SelectedCostingVersion
                tempRowData[indexOuter].data[index] = tempItemFinal
                setRowData(tempRowData)
                setShowPopup(false)
            }
        }))
    }

    const closePopUp = () => {
        setShowPopup(false)
        setPopupMsg(false)
    }

    const copyCosting = (index) => { };
    const deleteRowItem = (index) => { };

    const editRow = (item, index) => {
        setVendorname(item?.data)
        setValue('VendorName', item?.data)
        setValue('GroupName', item?.groupName)
        setIsRowEdited(true)
        setIsOEQAAdded(false)

        setIsVendorDisabled(false)              // enable vendor
    }
    const deleteRow = (item) => {
        setPopupMsg(true)
        setDeletedId(item)
    }
    const confirmDeleteRow = (item, index) => {
        let list = [...rowData]
        let rowtemp = list.filter(element => element?.groupName !== item?.groupName)
        setRowData(rowtemp)
        setIsRowEdited(false)
        resetData(true)
        setValue('GroupName', `OEQA ${shouldBeLevel}`);
        setIsOEQAAdded(false)
        setPopupMsg(false)
    }
    const onPopupConfirmDelete = () => {
        confirmDeleteRow(deletedId);
    }
    const saveEstimation = () => {
        let length = rowData?.length - 1
        let requestObject = {
            GroupName: rowData[length]?.groupName,
            NfrId: nfrIdsList?.NfrMasterId,
            PlantId: nfrPartDetail?.PlantId,
            NfrPartWiseDetailId: nfrIdsList?.NfrPartWiseDetailId,
            LoggedInUserId: loggedInUserId(),
            vendorList: _.map(rowData[length]?.data, 'value')
        }
        dispatch(saveNFRGroupDetails(requestObject, (res) => {
            if (res?.data?.Result === true) {
                Toaster.success("Group details saved successfully")
            }
        }))
    }

    const vendorFilterList = async (inputValue) => {
        if (vendorName?.length === 4) {
            return false
        }
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorWithVendorCodeSelectList(resultInput)
            setVendor(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
            } else {
                return vendorDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, VendorData, false, [], false)
                } else {
                    return VendorData
                }
            }
        }
    };

    if (isAddDetails === true) {
        return <Redirect
            to={{
                pathname: "/costing",
                state: {
                    isAddMode: !isCostingViewMode,
                    isViewMode: isCostingViewMode,
                    costingData: costingData,
                    partInfoStepTwo: partInfoStepTwo,
                    isNFR: true
                }

            }}
        />
    }

    const renderListing = (options) => {
        let opts1 = []
        if (options?.length > 0) {
            let opts = [...options]
            opts1 = [...options]
            opts1 = opts && opts?.map(item => {
                item.label = item.DisplayCostingNumber
                item.value = item.CostingId
                return item
            })
        }
        return opts1
    }
    // const handleCostingChange = (newValue, type, index, costingOptionsDropDown) => {
    const handleCostingChange = (newValue, indexOuter, indexInside) => {
        let tempObject = []
        // if (type === VBC) {
        tempObject = [...rowData[indexOuter]?.data[indexInside]?.CostingOptions]
        // }

        const indexOfCostingOptions = tempObject.findIndex((el) => el.CostingId === newValue.value)

        let costingOptionsSelectedObjectTemp = {
            ...tempObject[indexOfCostingOptions],
            SubAssemblyCostingId: tempObject[indexOfCostingOptions]?.SubAssemblyCostingId,
            AssemblyCostingId: tempObject[indexOfCostingOptions]?.AssemblyCostingId,
            SentDate: tempObject[indexOfCostingOptions]?.SentDate,
        }

        let costingOptionsSelectedArray = Object.assign([...costingOptionsSelectedObject], { [indexInside]: costingOptionsSelectedObjectTemp })
        setCostingOptionsSelectedObject(costingOptionsSelectedArray)
        let temprowData = [...rowData]
        let temprowDataInside = temprowData[indexOuter]?.data
        let costingOfVendors = {
            ...rowData[indexOuter]?.data[indexInside]
        }
        let tempData = {
            ...costingOfVendors,
            SelectedCostingVersion: newValue,
        }

        temprowDataInside = Object.assign([...temprowDataInside], { [indexInside]: tempData })
        let tempSelectedCostingList = _.map(temprowDataInside, 'SelectedCostingVersion')
        const allStatusDraft = _.map(tempSelectedCostingList, 'StatusId').every(item => item === DRAFTID);

        if (tempSelectedCostingList?.includes(undefined)) {
            setEditWarning(true)
            setFilterStatus('Select all costings to send for approval')
            setSendForApprovalButtonDisable(true)
        } else if (allStatusDraft) {
            setEditWarning(false)
            setFilterStatus('')
            setSendForApprovalButtonDisable(false)
        } else {
            setEditWarning(true)
            setFilterStatus('Please select draft costing to send for approval')
            setSendForApprovalButtonDisable(true)
        }

        let newObj = {
            data: temprowDataInside,
            groupName: temprowData[indexOuter]?.groupName,
            nfrPartWiseGroupDetailsId: temprowData[indexOuter]?.nfrPartWiseGroupDetailsId,
            status: temprowData[indexOuter]?.status,
            statusId: temprowData[indexOuter]?.statusId,
            isRejectedBySAP: temprowData[indexOuter]?.isRejectedBySAP,
        }
        temprowData = Object.assign([...temprowData], { [indexOuter]: newObj })
        setRowData(temprowData)
    }

    const onCheckBoxClick = (index) => {
        let temp = selectedCheckBox
        setSelectedCheckbox(!temp)
    }
    const sendForApproval = () => {
        setShowDrawer(true)
    }
    const closeShowApproval = (type) => {
        if (type === 'submit') {
            props?.close(type)
        }
        setShowDrawer(false)
    }

    const onBackButton = () => {
        props?.close()
    }

    const formToggle = (data, indexOuter, indexInside) => {
        setIndexOuter(indexOuter)
        setIndexInside(indexInside)
        setOutsourcingCostingData(data)
        setTimeout(() => {
            setShowOutsourcingDrawer(true)
        }, 300);
    }

    const closeOutsourcingDrawer = (type) => {
        if (type === 'submit') {
            getDetails()
        }
        setShowOutsourcingDrawer(false)
    }

    return (
        <>
            {(loader && <LoaderCustom customClass="pdf-loader" />)}
            {props.showAddNfr && <div>
                <Row className='mb-2'>
                    <Col md="4">
                        <h1>Create Estimation</h1>
                    </Col>
                    <Col md="8"><div className="parent-container">
                        <div className="child-container">
                            <TextFieldHookForm
                                label="NFR Id:"
                                name={"NfrId"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <TextFieldHookForm
                                label="Part No.:"
                                name={"PartNo"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <TextFieldHookForm
                                label="Part Name:"
                                name={"PartName"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                handleChange={() => { }}
                                defaultValue={() => { }}
                                className=""
                                customClassName={"withBorder nfr-inputs"}
                                disabled={true}
                            />
                        </div>
                        <div className="child-container">
                            <button type="button" className={"apply"} onClick={onBackButton}>
                                <div className={'back-icon'}></div>Back
                            </button>
                        </div>
                    </div>
                    </Col>
                </Row>
                <HeaderTitle className="border-bottom"
                    title={'Estimation'}
                />
                <Row>
                    <Col md="3">
                        <TextFieldHookForm
                            label="Group Name"
                            name={"GroupName"}
                            Controller={Controller}
                            placeholder={props.isViewFlag ? '-' : "Enter"}
                            control={control}
                            register={register}
                            rules={{ required: true }}
                            mandatory={true}
                            handleChange={(e) => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.groupName}
                            disabled={true}
                        />
                    </Col>
                    <Col md="3">
                        <TooltipCustom customClass="ml-1 add-nfr-tooltip" id="variance" tooltipText="Vendors should not exceed a selection limit of 4" />
                        <AsyncSearchableSelectHookForm
                            label={"Vendor (Code)"}
                            name={"VendorName"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            isMulti={true}
                            defaultValue={vendorName?.length !== 0 ? vendorName : ""}
                            // options={renderListing("Vendor")}
                            asyncOptions={vendorFilterList}
                            mandatory={true}
                            handleChange={handleVendorChange}
                            errors={errors.vendorName}
                            disabled={(isViewEstimation || isVendorDisabled || isOEQAAdded) ? true : false}
                        />
                    </Col>
                    <Col md="3" className="mt-4 pt-1">

                        {isRowEdited ?
                            <button
                                type="button"
                                className={"user-btn  pull-left mt-1"}
                                onClick={updateRow}
                                disabled={(isViewEstimation || isOEQAAdded) ? true : false}
                            >
                                <div className={"plus"}></div> UPDATE
                            </button> :
                            <button
                                type="button"
                                className={"user-btn  pull-left mt-1"}
                                onClick={addRow}
                                disabled={(isViewEstimation || isOEQAAdded) ? true : false}
                            >
                                <div className={"plus"}></div> ADD
                                {/* {isEditMode ? "UPDATE" : 'ADD'} */}
                            </button>}
                        <button
                            type="button"
                            className={"reset-btn pull-left mt-1 ml5"}
                            onClick={() => { resetData(false) }}
                            disabled={(isViewEstimation || isOEQAAdded) ? true : false}
                        >
                            {isRowEdited ? "Cancel" : "Reset"}
                        </button>
                    </Col>
                </Row>
                <div>
                    <Table className="table-record">
                        <thead>
                            <tr>
                                <th className="table-record">Group Name</th>
                                <th className="table-record">Status</th>
                                <th>Vendor</th>
                                <th>Costing Version</th>
                                <th className="text-center">Status</th>
                                <th>PO Price</th>
                                <th>Outsourcing Cost</th>
                                <th className='text-right'>Action</th>
                                <th className="table-record">Row Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowData?.map((item, indexOuter) => (
                                <React.Fragment key={item?.groupName}>
                                    {item?.data?.map((dataItem, indexInside) => (
                                        <tr key={`${item?.groupName} -${indexInside} `}>
                                            {indexInside === 0 && (
                                                <>
                                                    <td rowSpan={item?.data.length} className="table-record">
                                                        {/* {!isViewEstimation && (freezeUpperLevels === '' ? true : indexOuter > (freezeUpperLevelsNumbers)) && <label
                                                            className={`custom-checkbox`}
                                                            onChange={(e) => onCheckBoxClick(indexOuter)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCheckBox}
                                                            />
                                                            <span
                                                                className="pl-1 before-box"
                                                                checked={selectedCheckBox}
                                                                onChange={(e) => onCheckBoxClick(indexOuter)}
                                                            />
                                                        </label>} */}
                                                        {item?.groupName}
                                                    </td>
                                                    <td rowSpan={item?.data.length} className="table-record">{indexOuter === 0 && item?.status}</td>
                                                </>
                                            )}
                                            <td>{dataItem?.label}</td>

                                            <td><SearchableSelectHookForm
                                                label={""}
                                                name={`${indexInside}.CostingVersion`}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                customClassName="costing-version"
                                                defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                                options={renderListing(dataItem?.CostingOptions)}
                                                mandatory={false}
                                                handleChange={(newValue) => handleCostingChange(newValue, indexOuter, indexInside)}
                                            // handleChange={(newValue) => handleCostingChange(newValue, VBCTypeId, index)}
                                            // errors={`${indexInside} CostingVersion`}
                                            /></td>
                                            <td className="text-center">
                                                <div className={dataItem?.CostingId !== EMPTY_GUID ? dataItem?.SelectedCostingVersion?.Status : ''}>
                                                    {dataItem?.SelectedCostingVersion?.Status ? dataItem?.SelectedCostingVersion?.Status : ''}
                                                </div>
                                            </td>
                                            <td>{dataItem?.SelectedCostingVersion?.Price}</td>
                                            <td><div className='out-sourcing-wrapper'>
                                                {checkForNull(dataItem?.SelectedCostingVersion?.OutsourcingCost)}
                                                {dataItem?.SelectedCostingVersion && <button
                                                    type="button"
                                                    className={"add-out-sourcing"}
                                                    onClick={() => { formToggle(dataItem?.SelectedCostingVersion, indexOuter, indexInside) }}
                                                    disabled={(item?.isRejectedBySAP === true) ? true : false}
                                                    title="Add"
                                                >
                                                </button>}
                                            </div>
                                            </td>
                                            <td> <div className='action-btn-wrapper pr-2'>
                                                {(item?.isRejectedBySAP === false) &&
                                                    <>
                                                        {!isViewEstimation && <button className="Add-file" type={"button"} title={`${item?.groupName === 'PFS1' ? 'Create PFS1 Costing' : 'Add Costing'}`} onClick={() => addDetails(dataItem, indexOuter, indexInside, item?.groupName === 'PFS1')} />}
                                                    </>}

                                                {!item?.IsNewCosting && item?.Status !== '' && dataItem?.SelectedCostingVersion && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(indexInside)} />)}
                                                {(item?.isRejectedBySAP === false) &&
                                                    <>
                                                        {!isViewEstimation && !item?.IsNewCosting && dataItem?.SelectedCostingVersion && (<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(indexInside)} />)}
                                                        {!isViewEstimation && !item?.IsNewCosting && dataItem?.SelectedCostingVersion && (<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(indexInside)} />)}
                                                        {!isViewEstimation && !item?.IsNewCosting && dataItem?.SelectedCostingVersion && (<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteItem(dataItem, indexInside, indexOuter)} />)}
                                                        {!isViewEstimation && item?.CostingOptions?.length === 0 && dataItem?.SelectedCostingVersion && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => deleteRowItem(indexInside)} />}
                                                    </>}
                                            </div></td>
                                            {indexInside === 0 && (
                                                <td rowSpan={item?.data.length} className="table-record">
                                                    <button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editRow(item, indexInside)} disabled={isViewEstimation || (item?.isRejectedBySAP === true ? true : false)} />
                                                    {/* <button className="Delete All ml-1" title={"Delete Costing"} type={"button"} onClick={() => deleteRow(item, indexInside)} disabled={isViewEstimation || item?.statusId !== DRAFTID} /> */}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {rowData.length === 0 && (<tr>
                                <td colSpan={8} className="text-center"><NoContentFound title={EMPTY_DATA} /></td>
                            </tr>)}
                        </tbody>
                    </Table>
                    <Row>
                        <Col md="12" className='text-right'>
                            <button
                                type="button"
                                className="user-btn mr5 save-btn"
                                onClick={() => saveEstimation()}
                                disabled={isViewEstimation}
                            >
                                <div className={"save-icon"}></div>
                                Save
                            </button>
                            {isFinalApproverShowButton && <button
                                className='user-btn'
                                type='button'
                                onClick={sendForApproval}
                                disabled={isViewEstimation || sendForApprovalButtonDisable || allCostingNotSelected}
                            >
                                <div className="send-for-approval"></div>
                                Send for Approval
                            </button>}
                            <div>
                                {editWarning && <WarningMessage dClass="mr-3" message={filterStatus} />}
                            </div>
                            {
                                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.COSTING_DELETE_ALERT}`} />
                            }
                        </Col>
                    </Row>

                </div>
                {
                    popupMsg && <PopupMsgWrapper isOpen={popupMsg} closePopUp={closePopUp} confirmPopup={onPopupConfirmDelete} message={`Are you sure you want to delete this group?`} />
                }
            </div>}

            {
                showDrawer &&
                <ApprovalDrawer
                    isOpen={showDrawer}
                    closeDrawer={closeShowApproval}
                    anchor={'right'}
                    // isApprovalisting={false}
                    rowData={rowData}
                    technologyId={nfrPartDetail?.TechnologyId}
                    partData={{ PartId: nfrData?.PartId, PartName: nfrData?.PartName, PartNumber: nfrData?.PartNumber }}
                    levelDetails={levelDetails}
                />
            }
            {showOutsourcingDrawer &&
                <OutsourcingDrawer
                    isOpen={showOutsourcingDrawer}
                    closeDrawer={closeOutsourcingDrawer}
                    anchor={'right'}
                    CostingId={OutsourcingCostingData?.CostingId}
                />}
        </>
    );
}

export default AddNfr;

