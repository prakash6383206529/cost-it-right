import React, { useState, useEffect, useRef, useContext } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Tooltip, FormGroup, Label, Input, Form } from 'reactstrap';
import { AsyncSearchableSelectHookForm, RadioHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '.././layout/HookFormInputs'
import { getReporterList, getVendorNameByVendorSelectList, getPlantSelectListByType, fetchSpecificationDataAPI, getUOMSelectList } from '../.././actions/Common';
import { getCostingSpecificTechnology, getExistingCosting, getPartInfo, } from '../costing/actions/Costing'
import { IsSendQuotationToPointOfContact, addDays, checkPermission, getConfigurationKey, getTimeZone, loggedInUserId, parseLinks } from '../.././helper';
import { checkForNull, checkForDecimalAndNull } from '../.././helper/validation'
import { ASSEMBLYNAME, BOUGHTOUTPARTSPACING, BoughtOutPart, COMPONENT_PART, DRAFT, EMPTY_DATA, FILE_URL, HAVELLS_DESIGN_PARTS, PREDRAFT, PRODUCT_ID, RFQ, RFQVendor, TOOLING, TOOLINGPART, VBC_VENDOR_TYPE, ZBC, searchCount } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation, fileUploadQuotation, getQuotationById, updateRfqQuotation, getContactPerson, checkExistCosting, setRFQBulkUpload, getNfrSelectList, getNfrAnnualForecastQuantity, getNFRRMList, getPartNFRRMList, checkLPSAndSCN, getrRqVendorDetails, getTargetPrice, setVendorDetails, getAssemblyChildpart, getRfqRaiseNumber, saveRfqPartDetails, getRfqPartDetails, deleteQuotationPartDetail, setRfqPartDetails, setQuotationIdForRfq, setTargetPriceDetail, checkRegisteredVendor, setRmSpecificRowData, getPurchaseRequisitionSelectList, setBopSpecificRowData, createQuotationPrParts, getRfqToolingDetails, setToolingSpecificRowData, sendQuotationForReview, getQuotationDetailsList } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import redcrossImg from '../../assests/images/red-cross.png'
import NoContentFound from '../common/NoContentFound';
import HeaderTitle from '../common/HeaderTitle';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, autoCompleteDropdownPart } from '../common/CommonFunctions';
import BulkUpload from '../massUpload/BulkUpload';
import _ from 'lodash';
import { getPartSelectListWtihRevNo } from '../masters/actions/Volume';
import { ASSEMBLY, AcceptableRMUOM, DATE_STRING, DURATION_STRING, LOGISTICS, REMARKMAXLENGTH, TOOLING_ID, visibilityModeDropdownArray } from '../../config/masterData';
import DayTime from '../common/DayTimeWrapper';
import DatePicker from 'react-datepicker'
import { setHours, setMinutes } from 'date-fns';
import WarningMessage from '../common/WarningMessage';
import { clearGradeSelectList, clearSpecificationSelectList, getRMGradeSelectListByRawMaterial, getRawMaterialNameChild } from '../masters/actions/Material';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import TourWrapper from '../common/Tour/TourWrapper';
import { getSelectListPartType } from '../masters/actions/Part';
import ProcessDrawer from './ProcessDrawer';
import Button from '../layout/Button';
import { ApplyPermission } from './RfqListing';
import AddRm from './RM/AddRfqRmDetails';
import AddRfqRmDetails from './RM/AddRfqRmDetails';
import RaiseRfqBopDetails from './BOP/RaiseRfqBopDetails';
import TooltipCustom from '../common/Tooltip';
import { useLabels } from '../../helper/core';
import BOMViewer from '../masters/part-master/BOMViewer';
import RemarkFieldDrawer from '../common/CommonRemarkDrawer';
const gridOptionsPart = {}
const gridOptionsVendor = {}

function AddRfq(props) {

    const [isRmSelected, setIsRmSelected] = useState(false); // State to track if "RM" is selected
    const [selectedOption, setSelectedOption] = useState('componentAssembly');

    const permissions = useContext(ApplyPermission);
    const Vendor = permissions.permissionDataVendor
    const Part = permissions.permissionDataPart
    const dispatch = useDispatch()
    const { t } = useTranslation("Rfq")
    const { data: dataProps } = props

    const { technologyLabel } = useLabels();
    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            radioOption: false, // Initialize default value for the radio button
        }
    });


    const currentDate = new Date()
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const [getReporterListDropDown, setGetReporterListDropDown] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [isEditAll, setIsEditAll] = useState(false);
    const [isEditSubmissionDate, setIsEditSubmissionDate] = useState(false);
    const [isViewFlag, setIsViewFlag] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [partList, setPartList] = useState([])



    const [vendorList, setVendorList] = useState([])
    const [updateButtonPartNoTable, setUpdateButtonPartNoTable] = useState(false)
    const [updateButtonVendorTable, setUpdateButtonVendorTable] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedRowVendorTable, setSelectedVendorTable] = useState({})
    const [files, setFiles] = useState([])


    const [IsOpen, setIsOpen] = useState(false);
    const [apiData, setData] = useState({});
    const [isDisable, setIsDisable] = useState(false)
    const [apiCallCounter, setApiCallCounter] = useState(0)
    const [partNoDisable, setPartNoDisable] = useState(true)
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [partName, setPartName] = useState('')
    const [technology, setTechnology] = useState({})

    const [submissionDate, setSubmissionDate] = useState('')
    const [visibilityMode, setVisibilityMode] = useState({})
    const [dateAndTime, setDateAndTime] = useState('')
    const [minHours, setMinHours] = useState(currentHours)
    const [minMinutes, setMinMinutes] = useState(currentMinutes)
    const [isConditionalVisible, setIsConditionalVisible] = useState(false)
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [loader, setLoader] = useState(false)
    const [isBulkUpload, setisBulkUpload] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [viewTooltip, setViewTooltip] = useState(false)
    const [fiveyearList, setFiveyearList] = useState([])
    const [selectedparts, setSelectedParts] = useState([])
    const [nfrId, setNfrId] = useState('')
    const [storeNfrId, setStoreNfrId] = useState('')
    const [rmName, setRMName] = useState([])
    const [rmgrade, setRMGrade] = useState([])
    const [state, setState] = useState(true)
    const [rmspecification, setRMSpecification] = useState([])
    const [deleteToggle, setDeleteToggle] = useState(false)
    const [plant, setPlant] = useState({})
    const [isNFRFlow, setIsNFRFlow] = useState(false)
    const [rmAPIList, setRMAPIList] = useState([])
    const [rmNameSelected, setRmNameSelected] = useState(false)
    const [partTypeList, setPartTypeList] = useState([])
    const [partType, setPartType] = useState([]);
    const [part, setPart] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [partTypeforRM, setPartTypeforRM] = useState([])
    const [assemblyPartNumber, setAssemblyPartNumber] = useState('')
    const [partNumberWithName, setPartNumberWithName] = useState('')

    const [selectedUOM, setSelectedUOM] = useState('')
    const [requirementDate, setRequirementDate] = useState('')
    // below key is for managing the fields required for havells
    const [isPartVisible, setIsPartVisible] = useState(true)
    const [popupMessage, setPopupMessage] = useState('')
    const [blocked, setBlocked] = useState(false)
    const [vendorId, setVendorId] = useState('')
    const [plantId, setPlantId] = useState('')
    const [alreadyInDeviation, setAlreadyInDeviation] = useState(false)
    const [tableData, setTableData] = useState([])
    const [specificationList, setSpecificationList] = useState([])
    const [remark, setRemark] = useState("");

    const [childPartFiles, setChildPartFiles] = useState([])

    const [havellsDesignPart, setHavellsDesignPart] = useState([])
    const [targetPrice, setTargetPrice] = useState("")
    const [quotationIdentity, setQuotationIdentity] = useState('')
    const [partIdentity, setPartIdentity] = useState(0)
    const [showGrid, setShowGrid] = useState(true)
    const [isPartDetailUpdate, setIsPartDeailUpdate] = useState(false)


    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const rawMaterialNameSelectList = useSelector(state => state?.material?.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state?.material?.gradeSelectList);
    const rmSpecification = useSelector(state => state?.comman?.rmSpecification);
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const checkRFQPartBulkUpload = useSelector((state) => state.rfq.checkRFQPartBulkUpload)
    const nfrSelectList = useSelector((state) => state.rfq.nfrSelectList)
    const UOMSelectList = useSelector(state => state.comman.UOMSelectList)
    const showSendButton = dataProps?.rowData?.Status || ''
    const isDropdownDisabled = (initialConfiguration.IsCriticalVendorConfigured && isViewFlag) || (!dataProps?.isAddFlag && !(showSendButton === 'Draft' || showSendButton === 'PreDraft' || showSendButton === ''));


    // const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const { getRfqVendorDetail, getTargetprice, getPartIndentity, getQuotationIdForRFQ, rmSpecificRowData, SelectPurchaseRequisition, getBopPrQuotationIdentity } = useSelector((state) => state.rfq)

    const [viewQuotationPart, setViewQuotationPart] = useState(false)
    const [havellsPartTypeList, setHavellsPartTypeList] = useState([]);
    const [editQuotationPart, setEditQuotationPart] = useState(false)
    const [uniquePartList, setUniquePartList] = useState([])
    const [havellsKey, setHavellsKey] = useState(true)
    const [storePartsDetail, setStorePartsDetail] = useState([])
    const [partEffectiveDate, setPartEffectiveDate] = useState('')
    const [sopQuantityList, setSopQuantityList] = useState([]);
    const [disabledPartUid, setDisabledPartUId] = useState(true)
    const [sopdate, setSOPDate] = useState('')
    const [disabledVendoUi, setDisabledVendoUId] = useState(false)
    const [showVendorSection, setShowVendorSection] = useState(true)
    const [quotationType, setQuotationType] = useState('componentAssembly')
    const [RawMaterialList, setRawMaterialList] = useState([])
    const [bopList, setBopList] = useState([])


    const [resetRmFields, setResetRmFields] = useState(false)
    const [resetBopFields, setResetBopFields] = useState(false)
    // const [rmSpecificRowData, setRmSpecificRowData] = useState([])
    const [rmDataList, setRmDataList] = useState([])
    const [bopDataList, setBopDataList] = useState([])
    const [toolingList, setToolingList] = useState([])

    const [editRawMaterialId, setEditRawMaterialId] = useState("")
    const [editBopId, setEditBopId] = useState("")
    const [editToolingId, setEditToolingId] = useState("")
    const [isLoader, setIsLoader] = useState(false)
    const [prNumber, setPrNumber] = useState([])
    const [isDisabled, setIsDisabled] = useState(false)
    const [selectedPartType, setSelectedPartType] = useState('')
    const [drawerViewMode, setDrawerViewMode] = useState(false)
    const [resetDrawer, setResetDrawer] = useState(false)
    const [partDetailSent, setPartDetailSent] = useState(false)
    const [isOpenVisualDrawer, setIsOpenVisualDrawer] = useState(false)
    const [visualAdId, setVisualAdId] = useState("")
    const [remarkDrawer, setRemarkDrawer] = useState(false)
    const [reviewButtonPermission, setReviewButtonPermission] = useState(false)

    const showOnlyFirstModule = initialConfiguration.IsManageSeparateUserPemissionForPartAndVendorInRaiseRFQ;
    const { toolingSpecificRowData } = useSelector(state => state?.rfq);
    const disableUOMFiled = (selectedOption === "Raw Material" || selectedOption === "Bought Out Part") ? (Object.keys(prNumber).length !== 0 || (dataProps?.isViewFlag) ? true : false || disabledPartUid) : true





    const handleRadioChange = (type) => () => {
        setSelectedOption(type);
        // Update state based on radio button selection
        setQuotationType(type);
        setValue('technology', '');
        setValue('plant', '');
        setValue('prId', '');
        setPrNumber([])

        // if (type !== selectedOption) {
        //     setTableData([]);
        //     setSpecificationList([]);
        //     setSopQuantityList([]);
        //     setChildPartFiles([]);
        //     setRemark('');
        // }
        onResetPartNoTable(true)
    };

    useEffect(() => {
        if (selectedOption === "Bought Out Part" || selectedOption === "Tooling") {
            const filterObj = {
                "partType": selectedOption,
                "plantId": plant

            }
            dispatch(getPurchaseRequisitionSelectList((/* filterObj */) => { }))
        }
    }, [selectedOption])
    useEffect(() => {
        if (dataProps?.rowData && dataProps?.rowData?.PartType !== "") {
            const partTypes = dataProps?.rowData?.PartType?.split(',');

            partTypes && partTypes?.forEach(partType => {
                switch (partType.trim()) {
                    case 'Raw Material':
                        setSelectedOption('Raw Material');
                        setQuotationType("Raw Material");
                        break;
                    case 'Assembly':
                    case 'Component':
                        setSelectedOption('componentAssembly');
                        setQuotationType("Component/Assembly");
                        break;
                    case 'Bought Out Part':
                        setSelectedOption("Bought Out Part");
                        setQuotationType("Bought Out Part");
                        break;
                    case 'Tooling':
                        setSelectedOption("Tooling");
                        setQuotationType("Tooling");
                        break;
                    default:
                        break;
                }
            });
        }

    }, [dataProps])

    const isPartEffectiveDateValid = partEffectiveDate && new Date(partEffectiveDate).getTime() > new Date().getTime();
    const effectiveMinDate = isPartEffectiveDateValid ? new Date(partEffectiveDate) : new Date();
    useEffect(() => {
        if (dataProps?.isAddFlag) {
            dispatch(setQuotationIdForRfq(""))
            dispatch(setTargetPriceDetail({}))
            setTimeout(() => {
                const obj = createQuotationObject(null, null, null);

                dispatch(createRfqQuotation(obj, (res) => {

                    setQuotationIdentity(res?.data?.Identity)
                }))
            }, 200)

        }
    }, [])


    useEffect(() => {
        if (showSendButton === DRAFT) {
            setDisabledVendoUId((Vendor && (Vendor?.Add || Vendor?.Edit)) ? false : true)
            setShowVendorSection((Vendor && (Vendor?.Add || Vendor?.Edit)) ? false : true)
            setReviewButtonPermission(Vendor && (Vendor?.SendForReview) ? true : false)

        } else if (dataProps?.isAddFlag || showSendButton === PREDRAFT) {

            setDisabledPartUId((Part && (Part?.Add || Part?.Edit)) ? false : true)
        } else {
            setShowVendorSection(false)
        }
    }, [showSendButton, Vendor, Part])

    useEffect(() => {
        setShowGrid(false)
        setTimeout(() => {
            setShowGrid(true)
        }, 10);
    }, [quotationType])
    useEffect(() => {
        const partTypeString = initialConfiguration?.HavellsPartTypeList;
        if (partTypeString) {
            const formattedPartTypeList = partTypeString.split(',').map((part) => {
                const [label, value] = part.split('=');
                return { label: label.trim(), value: value.trim() };
            });
            setHavellsPartTypeList(formattedPartTypeList);
        }
    }, [initialConfiguration]);
    useEffect(() => {
        const { vbcVendorGrid } = props;
        dispatch(getUOMSelectList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, "RFQ", nfrId, () => { }))
        //MINDA
        // dispatch(getPlantSelectListByType(ZBC, nfrId, () => { }))
        dispatch(getSelectListPartType((res) => {
            setPartTypeList(res?.data?.SelectList)
        }))
        if (selectedOption === "Bought Out Part" || selectedOption === "Tooling") {
            const filterObj = {
                "partType": selectedOption,
                "plantId": plant

            }
            dispatch(getPurchaseRequisitionSelectList((/* filterObj */) => { }))
        }
        dispatch(getRawMaterialNameChild(() => { }))
        if (initialConfiguration.IsNFRConfigured) {
            dispatch(getNfrSelectList(() => { }))
        }
        let tempArr = [];
        vbcVendorGrid && vbcVendorGrid.map(el => {
            tempArr.push(el.VendorId)
            return null;
        })
        initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr)
        return () => {
            reactLocalStorage?.setObject('Data', [])
            reactLocalStorage.setObject('PartData', [])
            setUpdateButtonVendorTable(false)
            dispatch(setRFQBulkUpload([]))
        }
    }, []);
    // useEffect(() => {
    //     if ((prNumber.length !== 0)) {

    //         //dispatch(getRfqToolingDetails(prNumber.value, () => { }))
    //     }
    // }, [prNumber])

    // useEffect(() => {
    //     const filteredArray = selectedparts.filter((obj) => {
    //         return obj.value !== deleteToggle?.rowData?.PartId;
    //     });
    //     setSelectedParts(filteredArray)
    // }, [deleteToggle])
    useEffect(() => {
        if (selectedOption === 'Tooling') {
            setPartNoDisable(false)
            setValue("technology", { label: TOOLING, value: TOOLING_ID })
        }
    }, [selectedOption])
    useEffect(() => {
        let tempp = _.unionBy(partList, checkRFQPartBulkUpload?.SuccessfulRecord, 'PartNumber');
        setPartList(tempp)
    }, [checkRFQPartBulkUpload])

    const convertToPartList = (partListTemp, isnfr) => {

        let tempArr = []
        if (isnfr) {
            let listFinal = []
            let apiListForRM = []

            let listWithRMData = []
            partListTemp && partListTemp?.map((item, index) => {
                let listWithSOPData = []

                item?.SOPQuantity.map((ele, ind) => {
                    let obj = {}
                    obj.PartNo = item?.PartNumber
                    obj.PartId = item?.PartId
                    obj.Quantity = ele?.Quantity
                    obj.YearName = ele?.YearName
                    if (ind === 2) {
                        obj.PartNumber = item?.PartNumber
                        obj.VendorListExisting = item?.VendorList
                        obj.TargetPrice = item?.TargetPrice
                        obj.UOM = item?.UOMSymbol
                        obj.UOMSymbol = item?.UOMSymbol
                        obj.RequirementDate = item?.TimeLine

                    }
                    listWithSOPData.push(obj)
                    return null
                })

                listFinal = [...listWithSOPData]
                // item?.RMDetailsResponses && item?.RMDetailsResponses?.map((itemRM, indexRM) => {
                //     let objFinal = listWithSOPData[indexRM] ?? {}
                //     objFinal.RMName = itemRM?.RawMaterialName
                //     objFinal.RawMaterialChildId = itemRM?.RawMaterialChildId
                //     objFinal.RMGrade = itemRM?.RawMaterialGrade
                //     objFinal.RawMaterialGradeId = itemRM?.RawMaterialGradeId
                //     objFinal.RMSpecification = itemRM?.RawMaterialSpecification
                //     objFinal.RawMaterialSpecificationId = itemRM?.RawMaterialSpecificationId
                //     objFinal.IsRMAdded = itemRM?.RawMaterialSpecificationId
                //     if (indexRM > listWithSOPData?.length - 1) {
                //         listWithSOPData.push(objFinal)
                //     } else {
                //         Object.assign([...listWithSOPData], { indexRM: objFinal })
                //     }
                // })
                let obj = {
                    partName: { label: item?.PartNumber, value: item?.PartId, RevisionNumber: item?.RevisionNumber },
                    RmList: listFinal,
                }
                apiListForRM.push(obj)
                listWithRMData.push(listWithSOPData)
                return null
            })
            let listtt = []
            listWithRMData && listWithRMData?.map(item => {
                listtt = [...listtt, ...item]
            })
            tempArr = listtt
            let rmListTemp = listtt && listtt?.filter(item => item?.IsRMAdded)
            let ListTemp = []
            rmListTemp && rmListTemp?.map(item => {
                let obj = {
                    "partName": {
                        "label": item?.PartNo,
                        "value": item?.PartId,
                        "RevisionNumber": null
                    },
                    // "RmList": [
                    //     {
                    //         "RawMaterialChildId": item?.RawMaterialChildId,
                    //         "RawMaterialName": item?.RMName,
                    //         "RawMaterialGradeId": item?.RawMaterialGradeId,
                    //         "RawMaterialGrade": item?.RMGrade,
                    //         "RawMaterialSpecificationId": item?.RawMaterialSpecificationId,
                    //         "RawMaterialSpecification": item?.RMSpecification,
                    //     }
                    // ]
                }
                ListTemp.push(obj)
            })
            setRMAPIList(ListTemp)
        } else {
            partListTemp && partListTemp?.map((item) => {

                // item?.SOPQuantity.map((ele, ind) => {
                //     if (ind !== 2) {
                //         ele.PartNo = ele.PartNumber
                //         ele.PartId = item?.PartId
                //         delete ele.PartNumber
                //     } else {
                //         ele.PartNo = ele?.PartNumber
                //         ele.PartId = item?.PartId
                //         ele.TargetPrice = item?.TargetPrice
                //         ele.UOM = item?.UOMSymbol
                //         ele.TimeLine = item?.TimeLine
                //         ele.PartType = item?.PartType
                //         ele.HavellsDesignPart = item?.HavellsDesignPart
                //         ele.QuotationPartId = item?.QuotationPartId
                //         ele.HavellsDesignPartId = item?.HavellsDesignPartId
                //         ele.UOMId = item?.UOMId
                //         ele.PartTypeId = item?.PartTypeId

                //     }
                //     return null
                // })



                tempArr.push(item)

                return null
            })

        }

        return tempArr
    }
    const convertToRmList = (rmListTemp, isnfr) => {

        let tempArr = []

        rmListTemp && rmListTemp?.map((item) => {
            tempArr.push(item)
            return null
        })
        return tempArr

    }

    const convertToBopList = (bopListTemp, isnfr) => {
        let tempArr = []
        bopListTemp && bopListTemp?.map((item) => {
            tempArr.push(item)
            return null
        })

        return tempArr

    }
    const convertToToolingList = (toolingListTemp, isnfr) => {
        let tempArr = []
        toolingListTemp && toolingListTemp?.map((item) => {
            tempArr.push(item)
            return null
        })

        return tempArr

    }
    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getReporterList(() => { }))

        var newDate = addDays(new Date(), 7);
        setSubmissionDate(newDate)

        if (dataProps?.isEditFlag || dataProps?.isViewFlag) {
            setLoader(true)
            getQuotationDataById(dataProps?.Id)
        }
    }, [])

    const getQuotationDataById = (quotationId) => {



        //const quotationId = (dataProps?.isEditFlag || dataProps?.isViewFlag) ? dataProps?.Id : getBopPrQuotationIdentity


        setLoader(true)
        dispatch(getQuotationById(quotationId, (res) => {


            setPartNoDisable(false)

            if (res?.data?.Data) {
                setLoader(false)

                let data = res?.data?.Data
                setIsEditAll(data?.IsSent ? false : true)
                setIsEditSubmissionDate(data?.IsLastSubmissionEditable ? true : false)
                setIsViewFlag(dataProps?.isViewFlag)
                setValue("technology", {
                    label: data.TechnologyName, value: data.TechnologyId
                })
                setValue("plant", {
                    label: data.PlantName, value: data.PlantId
                })
                setPlant({ label: data.PlantName, value: data.PlantId })
                setValue("prId", { label: data?.PRNumber, value: data?.PRNumberId })
                if (data?.PRNumber !== null) {
                    setPrNumber({ label: data?.PRNumber, value: data?.PRNumberId })
                }

                dispatch(setQuotationIdForRfq(data?.QuotationId))
                setTechnology({ label: data.TechnologyName, value: data.TechnologyId })
                // setInitialFiles(data?.Attachments)
                // setValue('SubmissionDate', data?.LastSubmissionDate)
                setSubmissionDate(data?.LastSubmissionDate)
                setIsConditionalVisible(data?.IsConditionallyVisible)
                setValue('VisibilityMode', { value: data?.VisibilityMode, label: data?.VisibilityMode })
                setVisibilityMode({ value: data?.VisibilityMode, label: data?.VisibilityMode })
                setDateAndTime(data?.VisibilityDate)
                setValue('Time', data?.VisibilityDuration)
                setFiles(data?.Attachments)
                setPartList(convertToPartList(data.PartList, data?.NfrId ? true : false))
                setRmDataList(convertToRmList(data.RawMaterialList, data?.NfrId ? true : false))
                setBopDataList(convertToBopList(data.BoughtOutPartList, data?.NfrId ? true : false))
                setToolingList(convertToToolingList(data.ToolList, data?.NfrId ? true : false))
                setVendorList(data.VendorList)
                setValue("remark", data.Remark)
                setRemark(data?.Remark)
                setValue("nfrId", { label: data?.NfrNumber, value: data?.NfrId })
                setNfrId({ label: data?.NfrNumber, value: data?.NfrId })
                setData(data)
                setIsNFRFlow(data?.NfrId ? true : false)
                dispatch(setTargetPriceDetail({
                    TargetPrice: data?.PartList[0]?.TargetPrice
                }))
                setValue('Description', data?.PartName)
                setPartDetailSent(data?.IsPartDetailsSent)
                //dispatch(setToolingSpecificRowData(data?.ToolDataList));
                //dispatch(getTargetPrice(plant?.value, value?.value, Number(technology?.value), (res) => {}))

            }
            setTimeout(() => {
                setLoader(false)
            }, 100);
        })
        )

    }

    const deleteFile = (FileId, OriginalFileName) => {
        if (dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll) {
            return false
        }
        if (FileId != null) {
            let tempArr = files.filter((item) => item?.FileId !== FileId)
            setFiles(tempArr);
            setIsOpen(!IsOpen)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item?.FileName !== OriginalFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }
    const hyphenFormatter = (props) => {

        const cellValue = props?.value;
        return cellValue !== " " &&
            cellValue !== null &&
            cellValue !== "" &&
            cellValue !== undefined
            ? cellValue
            : "-";
    };
    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }



    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files?.length) - Number(files?.length)
        if (Number(loop) === 1 || Number(dropzone.current.files?.length) === Number(files?.length)) {
            setIsDisable(false)
        }
    }

    const handleChangeStatus = ({ meta, file }, status) => {

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files && files.filter(item => item?.OriginalFileName !== removedFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            setApiCallCounter(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
            setAttachmentLoader(true);
            setIsDisable(true)
            dispatch(fileUploadQuotation(data, (res) => {
                setDisableFalseFunction()
                if ('response' in res) {
                    status = res && res?.response?.status
                    dropzone.current.files.pop()
                    setAttachmentLoader(false)
                }
                else {
                    let Data = res.data[0]
                    setFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
                }
                setApiCallCounter(prevCounter => prevCounter - 1);

                // Check if this is the last API call
                if (apiCallCounter === 0) {
                    setAttachmentLoader(false)
                    setIsDisable(false)
                    setTimeout(() => {
                        setIsOpen(!IsOpen);
                    }, 500);
                }

            }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, docx, pptx jpeg, pdf, zip files.');
        } else if (status === 'error_file_size') {
            setDisableFalseFunction()
            setAttachmentLoader(false)
            dropzone.current.files.pop()
            Toaster.warning("File size greater than 20 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            // setDisableFalseFunction()
            setAttachmentLoader(false)
            dropzone.current.files.pop()
            Toaster.warning("Something went wrong")
        }
    }


    const closePopUp = () => {
        setValue('vendor', '')
        setShowPopup(false)
    }

    const onPopupConfirm = () => {

    }

    const deleteItemPartTable = (rowData, final) => {
        dispatch(deleteQuotationPartDetail(rowData?.QuotationPartId, (res) => {
            const type = selectedOption === 'Raw Material' ? 'Raw Material' : selectedOption === "Bought Out Part" ? "Bought Out Part" : 'Part';
            Toaster.success(`${type} has been deleted successfully.`);

        }))
        if (selectedOption === "componentAssembly") {
            let arr = final && final.filter(item => item?.PartId !== rowData?.PartId)
            setPartList(arr)
        } else if (selectedOption === "Raw Material") {
            let arr = final && final.filter(item => item?.RawMaterialChildId !== rowData?.RawMaterialChildId)
            setRmDataList(arr)
        } else if (selectedOption === "Bought Out Part") {
            let arr = final && final.filter(item => item?.BoughtOutPartChildId !== rowData?.BoughtOutPartChildId)
            setBopDataList(arr)
        }
        else {
            let arr = final && final.filter(item => item?.PartId !== rowData?.PartId)
            setToolingList(arr)
        }


        setDeleteToggle({ deleteToggle: !deleteToggle, rowData: rowData })


        onResetPartNoTable()
    }
    const editItemPartTable = (rowData, final, viewMode) => {


        setResetRmFields(false)
        setResetBopFields(false)
        setUpdateButtonPartNoTable(true)
        setResetDrawer(false)

        if (selectedOption === "componentAssembly") {
            setTimeout(() => {
                setValue('partNumber', { label: rowData?.PartNumber, value: rowData?.PartId })
                setValue('PartType', { label: rowData?.PartType, value: rowData?.PartTypeId })
                setValue('HavellsDesignPart', { label: rowData?.HavellsDesignPart, value: rowData?.HavellsDesignPartId })
                setValue('UOM', { label: rowData?.UOMSymbol, value: rowData?.UnitOfMeasurementId })
                setValue('Description', rowData?.PartName)
                setValue("TargetPrice", rowData?.TargetPrice)

                setPartType({ label: rowData?.PartType, value: rowData?.PartTypeId })
                setPartName({ label: rowData?.PartNumber, value: rowData?.PartId })
                setRequirementDate(rowData?.TimeLine || '')
                setAssemblyPartNumber({ label: rowData?.PartNumber, value: rowData?.PartId })
                //setPartNumberWithName({ label: rowData?.PartNumberWithName, value: rowData?.PartId })
                setPartTypeforRM(rowData?.PartTypeId)

            }, 200);
        } else if (selectedOption === "Raw Material") {
            setValue('UOM', { label: rowData?.UOMSymbol, value: rowData?.UnitOfMeasurementId })
            setRequirementDate(rowData?.TimeLine || '')
            setEditRawMaterialId(rowData?.RawMaterialChildId
            )
        } else if (selectedOption === "Bought Out Part") {
            setValue('UOM', { label: rowData?.UOMSymbol, value: rowData?.UnitOfMeasurementId })
            setRequirementDate(rowData?.TimeLine || '')
            setEditBopId(rowData?.BoughtOutPartChildId)
        } else {
            setTimeout(() => {
                setValue('partNumber', { label: rowData?.PartNumber, value: rowData?.PartId })
                setValue('PartType', { label: rowData?.PartType, value: rowData?.PartTypeId })
                setValue('Description', rowData?.PartName)
                setValue("TargetPrice", rowData?.TargetPrice)
                setValue('UOM', { label: rowData?.UOMSymbol, value: rowData?.UnitOfMeasurementId })
                setPartType({ label: rowData?.PartType, value: rowData?.PartTypeId })
                setPartName({ label: rowData?.PartNumber, value: rowData?.PartId })
                setRequirementDate(rowData?.TimeLine || '')
                setAssemblyPartNumber({ label: rowData?.PartNumber, value: rowData?.PartId })
                //setPartNumberWithName({ label: rowData?.PartNumberWithName, value: rowData?.PartId })

                setPartTypeforRM(rowData?.PartTypeId)

            }, 200);

            setEditToolingId(rowData?.PartId)
        }


        // setValue('uom', { label: rowData[0]?.Uom, value: rowData[0]?.UomId })
        dispatch(getRfqPartDetails(rowData?.QuotationPartId, res => {

            if (selectedOption === "componentAssembly") {
                const PartList = res?.data?.Data?.PartList
                setStorePartsDetail(PartList)
                if (!drawerOpen) {
                    setRemark(PartList[0]?.Remarks)
                    setChildPartFiles(PartList[0]?.Attachments || [])
                }


            } else if (selectedOption === "Raw Material") {
                const RawMaterialList = res?.data?.Data?.RawMaterialList

                dispatch(setRmSpecificRowData(RawMaterialList))
            } else if (selectedOption === "Bought Out Part") {
                const bopList = res?.data?.Data?.BoughtOutPartList

                dispatch(setBopSpecificRowData(bopList))

            } else {
                const ToolingList = res?.data?.Data?.ToolDataList
                dispatch(setToolingSpecificRowData(ToolingList))

            }



        }))
        setEditQuotationPart(viewMode)
        //setDrawerOpen(true)

    }
    const ViewItemPartTable = (rowData, final, viewMode) => {
        setViewQuotationPart(true)
        dispatch(getRfqPartDetails(rowData?.QuotationPartId, res => {
            if (selectedOption === "Raw Material") {
                const RawMaterialList = res?.data?.Data?.RawMaterialList

                dispatch(setRmSpecificRowData(RawMaterialList))
            } else if (selectedOption === "Bought Out Part") {
                const bopList = res?.data?.Data?.BoughtOutPartList

                dispatch(setBopSpecificRowData(bopList))
            } else {
                const ToolingList = res?.data?.Data?.ToolDataList
                dispatch(setToolingSpecificRowData(ToolingList))
            }
        }))
        setDrawerViewMode(true)
        setResetDrawer(false)
        setDrawerOpen(true)

    }

    const deleteItemVendorTable = (gridData, props) => {
        let arr = []
        gridData && gridData.map((item) => {

            if (item?.VendorId !== props?.node?.data?.VendorId) {
                arr.push(item)
            }
            return null
        })
        setVendorList(arr)
        onResetVendorTable()
    }

    const editItemVendorTable = (gridData, props) => {

        setSelectedVendorTable(props?.node.data)

        setUpdateButtonVendorTable(true)
        setValue('vendor', { label: props?.node?.data?.Vendor, value: props?.node?.data?.VendorId })
        setValue('contactPerson', {
            label: props?.node?.data?.ContactPerson
            , value: props?.node?.data?.ContactPersonId

        })
        setValue('LDClause', props?.node?.data?.LDClause)

    }
    function createQuotationObject(isSent, IsPartDetailsSent, quotationId) {
        return {
            QuotationId: quotationId !== undefined ? quotationId : (getQuotationIdForRFQ ? getQuotationIdForRFQ : null),
            QuotationNumber: apiData.QuotationNumber ? apiData.QuotationNumber : null,
            Remark: getValues('remark') || null,
            TechnologyId: getValues('technology')?.value || null,
            PlantId: getValues('plant')?.value || null,
            LoggedInUserId: loggedInUserId(),
            StatusId: null,
            IsSent: isSent,
            IsConditionallyVisible: isConditionalVisible,
            VisibilityMode: visibilityMode?.label || null,
            VisibilityDate: dateAndTime || null,
            VisibilityDuration: getValues('Time') || null,
            LastSubmissionDate: submissionDate ? DayTime(submissionDate).format('YYYY-MM-DD HH:mm:ss') : null,
            VendorList: vendorList && vendorList.length > 0 ? vendorList : null,
            Timezone: getTimeZone() || null,
            Attachments: files && files.length > 0 ? files : [],
            NfrId: nfrId?.value || null,
            PartList: [],
            PrNumberId: prNumber?.value || null,
            // QuotationPartIdList: uniquePartList,
            PartDataSentOn: null,
            IsPartDetailsSent: IsPartDetailsSent,

        };
    };

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {


        const temp = [];
        if (label === 'UOM') {
            UOMSelectList && UOMSelectList?.map(item => {
                const accept = AcceptableRMUOM.includes(item?.Type)
                if (accept === false) return false
                if (item?.Value === '0') return false
                temp.push({ label: item?.Display, value: item?.Value })
                return null
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item?.PlantId === '0') return false
                temp.push({ label: item?.PlantNameCode, value: item?.PlantId })
                return null
            })
            return temp
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item?.Value === '0') return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return temp
        }
        if (label === 'nfrId') {
            nfrSelectList && nfrSelectList.map((item) => {
                if (item?.Value === '0') return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return temp
        }

        if (label === 'reporter') {

            getReporterListDropDown && getReporterListDropDown.map(item => {
                if (item?.Value === '0') return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return temp;
        }
        if (label === 'PartType') {
            partTypeList && partTypeList.map((item) => {

                if (item?.Value === '0') return false
                if (item?.Value === PRODUCT_ID) return false
                if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item?.Text === BOUGHTOUTPARTSPACING) return false
                if (String(technology?.value) === String(ASSEMBLY) && ((item?.Text === COMPONENT_PART) || (item?.Text === BOUGHTOUTPARTSPACING))) return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return temp
        }
        if (label === 'prNo') {
            SelectPurchaseRequisition && SelectPurchaseRequisition.map((item) => {
                if (item?.Value === '0') return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return temp
        }
    }

    const handleSubmitClick = (data, e, isPartDetailSent) => {

        //handleSubmit(() => onSubmit(data, e, isSent))()
        onSubmit(data, e, isPartDetailSent)
    };

    const onRadioSubmit = (data) => {
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props?.closeDrawer('', {})
        setResetRmFields(false)
        setResetBopFields(false)
        setResetDrawer(false)
        dispatch(setQuotationIdForRfq(""))
        dispatch(setTargetPriceDetail({}))

    }
    const heading = () => {
        let warningMessgae = ""
        let title = ""

        switch (selectedOption) {
            case "Bought Out Part":
                warningMessgae = 'Select a BOP, then add specification and attachment documents'
                title = 'BOP'
                break
            case "Raw Material":
                warningMessgae = 'Select a RM, then add attachment doucments'
                title = 'RM'
                break
            case "componentAssembly":
                warningMessgae = "Select a part, then click on + button to start inputing Specification, RM details and mandatory attachments."
                title = 'Part'
                break
            case "Tooling":
                warningMessgae = "Select a PR Number, then edit the Tool No, add the specification and attachment documents"
                title = 'Tooling'
                break
            default:
                return <HeaderTitle customClass="d-flex" title={title}><WarningMessage dClass={"mt-1 ml-3"} message={warningMessgae} /></HeaderTitle>
        }
        return <HeaderTitle customClass="d-flex" title={title}><WarningMessage dClass={"mt-1 ml-3"} message={warningMessgae} /></HeaderTitle>
    }
    const onSubmit = (data, e, isPartDetailsSent) => {

        switch (selectedOption) {
            case "Bought Out Part":
                if (bopDataList?.length === 0) {
                    Toaster.warning("Please add at least one BOP.");
                    return false;
                } else if (isPartDetailsSent && (showSendButton !== PREDRAFT && showSendButton !== "")) {
                    if (vendorList?.length === 0) {
                        Toaster.warning("Please add the minimum threshold vendor.");
                        return false
                    }
                }
                break;

            case "Raw Material":
                if (rmDataList?.length === 0) {
                    Toaster.warning("Please add at least one RM.");
                    return false;
                } else if (isPartDetailsSent && (showSendButton !== PREDRAFT && showSendButton !== "")) {
                    if (vendorList?.length === 0) {
                        Toaster.warning("Please add the minimum threshold vendor.");
                        return false
                    }
                }
                break;

            case "componentAssembly":
                if (partList?.length === 0) {
                    Toaster.warning("Please add at least one part.");
                    return false;
                } else if (isPartDetailsSent && (showSendButton !== PREDRAFT && showSendButton !== "")) {
                    if (vendorList?.length === 0) {
                        Toaster.warning("Please add the minimum threshold vendor.");
                        return false
                    }
                }
                break;
            case "Tooling":
                if (toolingList?.length === 0) {
                    Toaster.warning("Please add at least one part.");
                    return false;
                } else if (isPartDetailsSent && (showSendButton !== PREDRAFT && showSendButton !== "")) {
                    if (vendorList?.length === 0) {
                        Toaster.warning("Please add the minimum threshold vendor.");
                        return false
                    }
                }
                break;
            default:
                return false;
        }
        if ((!showVendorSection && !isConditionalVisible)) {
            Toaster.warning("Visibility of price field is mandatory.");
            return false
        }


        if ((!showVendorSection && getValues("VisibilityMode") === "")) {
            Toaster.warning("Please select Visibility Mode.");
            return false
        }
        if (!showVendorSection && (getValues('remark') === "" || getValues('remark') === null)) {
            Toaster.warning("Notes field is mandatory.");
            return false
        }
        //dispatch(getTargetPrice(plant, technology, assemblyPartNumber, (res) => { }))
        // dispatch(getRfqPartDetails( (res) => {
        //const quotationPartIds = res?.data?.Data.map(item => item?.QuotationPartId);
        //  }))


        let tempArr = [...partList]
        let list = []
        list = tempArr && tempArr?.map(item => {
            if (isNaN(Number(item?.Quantity))) {
                item.Quantity = 0
            }
            return item
        })
        if (Vendor?.add || Vendor?.edit || !havellsKey && vendorList.length === 0) {
            Toaster.warning("Please enter vendor details")
            return false
        } else if (Part?.add || Part?.edit || !havellsKey && partList.length === 0) {
            Toaster.warning("Please enter part details")
            return false
        } else if (!havellsKey && files?.length === 0) {
            Toaster.warning("Please add atleast one attachment file")
            return false
        } else if (!submissionDate) {
            setIsWarningMessageShow(true)
            return false
        } else if (Object.keys(errors).length > 0) {
            return false
        }

        let IsPartDetailsSent;
        let isSent;
        const isShowRfqPartDetail = initialConfiguration?.IsShowRFQPartDetailBreakup
        const hasParts = partList && partList.length > 0;
        const hasRm = rmDataList && rmDataList.length > 0
        const hasBop = bopDataList && bopDataList.length > 0
        const hasTooling = toolingList && toolingList.length > 0

        // const hasBop=bopList && bopList.length>0
        const hasVendors = vendorList && vendorList.length > 0;
        if (!isShowRfqPartDetail) {
            IsPartDetailsSent = isPartDetailsSent;
            isSent = isPartDetailsSent;
        } else {
            IsPartDetailsSent = (showSendButton === PREDRAFT || showSendButton === '')
                ? (isPartDetailsSent ? (hasParts || hasRm || hasBop || hasTooling) : false)
                : partDetailSent;

            isSent = (showSendButton === PREDRAFT || showSendButton === '') ? false : ((hasParts || hasRm || hasBop || hasTooling) && hasVendors && isPartDetailsSent)
        }
        // const IsPartDetailsSent = isShowRfqPartDetail ? ((isPartDetailSent && partList && partList.length > 0) ? true : (partList && partList.length > 0 && vendorList && vendorList.length > 0) ? true : false) : false
        // const isSent = isShowRfqPartDetail ? ((partList && vendorList && partList.length > 0 && vendorList.length > 0) ? IsPartDetailsSent : false) : false

        //const isSent = partList && vendorList && partList.length > 0 && vendorList.length > 0 ? true : false





        const obj = createQuotationObject(isSent, IsPartDetailsSent);

        // let obj = {}
        // obj.QuotationId = apiData.QuotationId ? apiData.QuotationId : ""
        // obj.QuotationNumber = apiData.QuotationNumber ? apiData.QuotationNumber : ""
        // obj.Remark = getValues('remark')
        // obj.TechnologyId = getValues('technology').value
        // obj.PlantId = getValues('plant')?.value
        // obj.LoggedInUserId = loggedInUserId()
        // obj.StatusId = ''
        // obj.IsSent = isSent
        // obj.IsConditionallyVisible = isConditionalVisible
        // obj.VisibilityMode = visibilityMode?.label
        // obj.VisibilityDate = dateAndTime
        // obj.VisibilityDuration = getValues('Time')
        // obj.LastSubmissionDate = DayTime(submissionDate).format('YYYY-MM-DD HH:mm:ss')
        // obj.VendorList = vendorList
        // obj.Timezone = getTimeZone()
        // //obj.QuotaionPartIds = quotationPartIds
        // obj.Attachments = files
        // obj.IsSent = isSent
        // obj.NfrId = nfrId?.value
        // if (dataProps?.isEditFlag) {
        //     dispatch(updateRfqQuotation(obj, (res) => {

        //         if (res?.data?.Result) {
        //             setQuotationIdentity(res?.data?.Identity)
        //             if (isSent) {
        //                 Toaster.success(MESSAGES.RFQ_SENT_SUCCESS)
        //             } else {
        //                 Toaster.success(MESSAGES.RFQ_UPDATE_SUCCESS)
        //             }
        //             cancel()
        //         }
        //     }))

        dispatch(createRfqQuotation(obj, (res) => {

            setQuotationIdentity(res?.data?.Identity)
            if (res?.data?.Result) {
                setPrNumber([])
                dispatch(setQuotationIdForRfq(""))
                dispatch(setTargetPriceDetail({}))
                if ((!showSendButton === "") && (!(showSendButton === DRAFT) || !(showSendButton === PREDRAFT))) {
                    Toaster.success(MESSAGES.RFQ_UPDATE_SUCCESS)
                } else if (isSent) {
                    Toaster.success(MESSAGES.RFQ_SENT_SUCCESS)
                } else {
                    Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                }
                cancel()
            }
        }))

        dispatch(setVendorDetails({}))
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,

    };

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        setGridApi(params.api)
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);
    };




    const sopFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-'
    }
    const visualAdDetails = (cell) => {

        setIsOpenVisualDrawer(true)
        setVisualAdId(cell)
    };
    const closeVisualDrawer = () => {
        setIsOpenVisualDrawer(false)

    };
    const buttonFormatterFirst = (props) => {

        const cellValue = props?.value;

        const rowData = props?.valueFormatted ? props?.valueFormatted : props?.data;

        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        const show = (selectedOption === "componentAssembly" || selectedOption === "Tooling")
            ? (rowData?.PartNumber !== undefined)
            : (selectedOption === "Bought Out Part" ? rowData?.BoughtOutPartChildId !== undefined : rowData?.RawMaterialChildId !== undefined)


        const row = props?.data;

        const isSendButtonVisible = dataProps?.isViewFlag || (dataProps?.isAddFlag ? false : (dataProps?.isEditFlag && showSendButton === PREDRAFT ? false : true))
        return (
            <>
                {show && selectedOption === TOOLINGPART && (<button title="button" className="hirarchy-btn Tour_List_View_BOM" type="button" onClick={() => visualAdDetails(cellValue)} />)}
                {show && < button title='Edit' className="Edit mr-2 align-middle" disabled={isSendButtonVisible} type={'button'} onClick={() => editItemPartTable(rowData, props, true)} />}
                {show && < button title='View' className="View mr-2 align-middle" disabled={false} type={'button'} onClick={() => ViewItemPartTable(rowData, props, false)} />}

                {/*  {<button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !dataProps?.isEditFlag)} type={'button'} onClick={() => deleteItemPartTable(final, props)} />} */}
                {(show && selectedOption !== BOUGHTOUTPARTSPACING) && <button title='Delete' className="Delete align-middle" disabled={isSendButtonVisible} type={'button'} onClick={() => deleteItemPartTable(row, final)} />}

            </>
        )
    };

    const buttonFormatterVendorTable = (props) => {
        return (
            <>
                {<button title='Edit' className="Edit mr-2 align-middle" type={'button'} disabled={(dataProps?.isAddFlag || showSendButton === DRAFT) ? false : (dataProps?.isViewFlag || !isEditAll)} onClick={() => editItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button title='Delete' className="Delete align-middle" type={'button'} disabled={(dataProps?.isAddFlag || showSendButton === DRAFT) ? false : (dataProps?.isViewFlag || !isEditAll)} onClick={() => deleteItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };
    const addRowVendorTable = () => {
        let isDuplicateEntry = false
        let data = {}
        let temp = []
        partList && partList.map((item) => {
            temp.push(item?.PartId)
            return null
        })
        data.PartIdList = _.uniq(temp)
        data.PlantId = getValues('plant')?.value
        data.VendorId = getValues('vendor')?.value
        dispatch(checkLPSAndSCN(data, (res, err) => {
            if (err) {
                Toaster.error('An error occurred while checking LPS and SCN.');

                return;
            }
            let Data = res?.data?.Data;
            if (res?.data?.Result && Data && ((Data?.LPSRatingIsBlocked || Data?.ClassificationIsBlocked))) {
                const additionalMessage = " Do you want to initiate an unblocking deviation for this vendor at the specified plant? If yes, please click \"OK\"";

                if (Data?.ClassificationDeviationIsInApprovalProcess || Data?.LPSRatingDeviationIsInApprovalProcess) {
                    // setShowPopup(true)
                    setBlocked(true)
                    Toaster.warning(res?.data?.Message)
                    setAlreadyInDeviation(true)
                    setValue('vendor', '')
                    setShowPopup(false)
                    return false
                } else {
                    setPopupMessage(res?.data?.Message + additionalMessage);
                    setShowPopup(true)
                    setVendorId(getValues('vendor'));
                    setPlantId(getValues('plant'));
                    setBlocked(true)
                    return false
                }

            }
            dispatch(checkExistCosting(data, (res) => {
                if (res?.data?.DynamicData?.IsExist) {
                    Toaster.warning("Costing already exists for this vendor.")
                    return false
                } else {

                    let obj = {}
                    obj.VendorId = getValues('vendor')?.value
                    obj.ContactPersonId = getValues('contactPerson')?.value
                    obj.Vendor = getValues('vendor')?.label
                    obj.ContactPerson = getValues('contactPerson')?.label
                    obj.IncoTermsIdRef = getRfqVendorDetail?.IncoTermIdRef
                    obj.IncoTerms = getRfqVendorDetail?.IncoTerms
                    obj.PaymentTermsIdRef = getRfqVendorDetail?.PaymentTermIdRef
                    obj.PaymentTerms = getRfqVendorDetail?.PaymentTerms
                    obj.WarrantyTerms = getValues('WarrantyTerms')?.label
                    obj.LDClause = getValues('LDClause')
                    if (obj.VendorId === null || obj.VendorId === undefined) {
                        Toaster.warning("Please fill all the mandatory fields first.");
                        return false;
                    }

                    // Check IsSendQuotationToPointOfContact() result and ContactPersonId
                    if (IsSendQuotationToPointOfContact() && (obj.ContactPersonId === null || obj.ContactPersonId === undefined)) {
                        Toaster.warning("Please fill all the mandatory fields first.");
                        return false;
                    }


                    if (!updateButtonVendorTable) {
                        vendorList && vendorList.map((item) => {
                            if (item?.VendorId === obj.VendorId) {
                                isDuplicateEntry = true
                            }
                            return null
                        })
                    }

                    if (isDuplicateEntry) {
                        Toaster.warning("This vendor is already added.")
                        return false;
                    }
                    else if (selectedOption === TOOLING && !showVendorSection && !getValues('LDClause')) {
                        Toaster.warning("Please enter LD Clause.");
                        return false
                    }
                    let arr = [...vendorList, obj]

                    if (updateButtonVendorTable) {       //EDIT CASE
                        arr = []
                        vendorList && vendorList.map((item) => {
                            if (JSON.stringify(selectedRowVendorTable) === JSON.stringify(item)) {
                                return false
                            } else {
                                arr.push(item)
                            }
                            return null
                        })

                        arr.map((item) => {
                            if (item?.VendorId === obj.VendorId) {
                                isDuplicateEntry = true
                            }
                            return null
                        })

                        if (isDuplicateEntry) {
                            Toaster.warning("This vendor is already added.")
                            return false;
                        }

                        arr.push(obj)
                    }

                    setVendorList(arr)
                    setValue('vendor', "")
                    setValue('contactPerson', "")
                    setValue('LDClause', "")
                    setValue('WarrantyTerms', "")
                    setValue('PaymentTerms', "")
                    setValue('IncoTerms', "")
                    setUpdateButtonVendorTable(false)
                    setGetReporterListDropDown([])
                    dispatch(setVendorDetails({}))
                }

            }))

        }))
    }

    const updateRawMaterialList = (obj) => {

        setRawMaterialList(prevList => [
            obj
        ]);
    }
    const updateBopList = (obj) => {

        setBopList(prevList => [
            obj
        ]);
    }
    const handleDrawer = (value) => {
        setDrawerViewMode(value)
    }
    const addRowPartNoTable = () => {
        setResetRmFields(false)
        setResetBopFields(false)
        if (isNFRFlow) {
            dispatch(getPartNFRRMList(nfrId.value, getValues('partNumber')?.value, (res) => {


                let list = [...rmAPIList]
                let obj = {
                    partName: getValues('partNumber'),
                    RmList: res.data.DataList,
                }
                list.push(obj)

                setRMAPIList(list)

                let objTemp = {};
                let arrTemp = [];
                let Data = {}
                if (nfrId && nfrId.value !== null) {
                    dispatch(getNfrAnnualForecastQuantity(nfrId.value, getValues('partNumber')?.value, sopdate = "", (res) => {  //CHECK_NFR
                        Data = res.data.Data
                    }));
                }
                let dataObj = {
                    "PartIdList": [
                        getValues('partNumber')?.value
                    ],
                    "PlantId": getValues('plant')?.value,
                    "VendorId": null
                };

                let vendorList = [];
                let vendorListFinal = [];

                dispatch(checkExistCosting(dataObj, (res) => {
                    if (res?.data?.Result) {
                        vendorList = [...res?.data?.DataList];
                        vendorList && vendorList?.map((item) => {
                            vendorListFinal.push(`${item?.VendorName} (${item?.VendorCode})`);
                        });
                    }

                    let tempArrayparts = [...selectedparts, getValues('partNumber')];
                    setSelectedParts(tempArrayparts);

                    let partNumber = getValues('partNumber');

                    // sopObjectTemp && sopObjectTemp.map((item, index) => {
                    //     let newObjTemp = { ...objTemp }; // Create a new object in each iteration
                    //     newObjTemp.PartNo = partNumber?.label;
                    //     newObjTemp.PartId = getValues('partNumber')?.value;
                    //     newObjTemp.UOM = getValues('UOM')?.label
                    //     newObjTemp.UOMId = getValues('UOM')?.value
                    //     newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0
                    //     newObjTemp.TimeLine = requirementDate
                    //     newObjTemp.PartType = getValues('PartType')?.label
                    //     newObjTemp.PartTypeId = getValues('PartType')?.value

                    //     newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label
                    //     newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value
                    //     newObjTemp.Description = getValues('Description')

                    //     if (index === 2) {
                    //         newObjTemp.PartNumber = partNumber?.label;
                    //         newObjTemp.VendorListExisting = vendorListFinal.join(',') ?? '-';

                    //     }
                    //     if (nfrId && nfrId.value !== null) {
                    //         if (index === 0) {
                    //             newObjTemp.Quantity = checkForDecimalAndNull(Data.FirstYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //             newObjTemp.YearName = Data.FirstYear
                    //         } else if (index === 1) {
                    //             newObjTemp.Quantity = checkForDecimalAndNull(Data.SecondYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //             newObjTemp.YearName = Data.SecondYear
                    //         } else if (index === 2) {
                    //             newObjTemp.Quantity = checkForDecimalAndNull(Data.ThirdYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //             newObjTemp.YearName = Data.ThirdYear
                    //         } else if (index === 3) {
                    //             newObjTemp.Quantity = 0;
                    //             newObjTemp.YearName = parseInt(Data.ThirdYear) + 1
                    //             newObjTemp.isEdit = true
                    //         } else if (index === 4) {
                    //             newObjTemp.Quantity = 0;
                    //             newObjTemp.YearName = parseInt(Data.ThirdYear) + 2
                    //             newObjTemp.isEdit = true
                    //         }
                    //     } else {
                    //         newObjTemp.Quantity = 0
                    //         newObjTemp.YearName = fiveyearList[index]
                    //         newObjTemp.isEdit = true
                    //     }
                    //     arrTemp.push(newObjTemp);
                    //     return null;
                    // });
                    let arrTemp = [];


                    let newObjTemp = {};  // Initialize the new object

                    newObjTemp.PartNo = partNumber?.label;
                    newObjTemp.PartId = getValues('partNumber')?.value;
                    newObjTemp.UOM = getValues('UOM')?.label;
                    newObjTemp.UOMSymbol = getValues('UOM')?.label
                    newObjTemp.UnitOfMeasurementId = getValues('UOM')?.value;
                    newObjTemp.TargetPrice = getTargetprice?.TargetPrice || "-";
                    newObjTemp.TimeLine = requirementDate.split(' ')[0] || '';
                    newObjTemp.PartType = getValues('PartType')?.label;
                    newObjTemp.PartTypeId = getValues('PartType')?.value;
                    newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label;
                    newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value;
                    newObjTemp.Description = getValues('Description') || "";
                    newObjTemp.PartName = getValues('Description') || "";



                    arrTemp.push(newObjTemp);  // Push the new object to the array

                    let dataList = [...arrTemp]
                    list[list.length - 1].RmList && list[list.length - 1].RmList?.map((item, index) => {

                        let obj = arrTemp[index] ?? {}
                        obj.RMGrade = item?.RawMaterialGrade
                        obj.RawMaterialGradeId = item?.RawMaterialGradeId
                        obj.RMName = item?.RawMaterialName
                        obj.RawMaterialChildId = item?.RawMaterialChildId
                        obj.RMSpecification = item?.RawMaterialSpecification
                        obj.RawMaterialSpecificationId = item?.RawMaterialSpecificationId

                        if (index > arrTemp?.length - 1) {
                            obj.PartId = arrTemp[0].PartId
                            obj.PartNo = arrTemp[0].PartNo
                            obj.Quantity = 0
                            obj.isEdit = true
                            dataList.push(obj)

                        } else {
                            Object.assign([...dataList], { index: obj })
                        }
                    })

                    let arr = [...partList, ...dataList];
                    setPartList(arr);
                    setValue('partNumber', "");

                    setRequirementDate("")

                    setValue('RMName', "");
                    setValue('RMGrade', "");
                    setValue('RMSpecification', "");
                    setUpdateButtonPartNoTable(false);
                    setRMName('');
                    setRMGrade('');
                    setRMSpecification('');
                    dispatch(clearGradeSelectList([]));
                    dispatch(clearSpecificationSelectList([]));
                }));



            }));


        } else {

            if (!updateButtonPartNoTable && rmDataList?.map(item => item?.RawMaterialCode)?.includes(RawMaterialList[0]?.RawMaterialCode)) {
                Toaster.warning('This Raw Material is already added.');
                return false

            } else if (!updateButtonPartNoTable && bopDataList?.map(item => item?.BoughtOutPartChildId)?.includes(bopList[0]?.BoughtOutPartChildId)) {
                Toaster.warning('This BOP is already added.');
                return false
            } else if (!updateButtonPartNoTable && partList?.map(item => item?.PartId)?.includes(getValues('partNumber')?.value)) {
                Toaster.warning('This Part is already added.');
                return false


            }
            let objTemp = {};
            let arrTemp = [];
            let Data = {}
            if (selectedOption === "Raw Material") {

                if (RawMaterialList.length === 0) {

                    Toaster.warning("Please select all the mandatory fields");
                    return false
                }
                else if (selectedOption === "Raw Material" && (RawMaterialList[0]?.RawMaterialReamrk === '' || RawMaterialList[0]?.RawMaterialAttachments?.length === 0)) {
                    Toaster.warning('Please fill the remark and attachment documents!');
                    return false;
                }
                // const label = RawMaterialList[0]?.RawMaterialName;
                // const isRMGradeMissing = !RawMaterialList[0]?.RawMaterialGrade;
                // const isRMSpecificationMissing = !RawMaterialList[0]?.RawMaterialSpecification;
                // if (label !== undefined && (isRMGradeMissing || isRMSpecificationMissing)) {
                //     const missingRequirements = [];
                //     if (isRMGradeMissing) {
                //         missingRequirements.push('RM Grade');
                //     }
                //     if (isRMSpecificationMissing) {
                //         missingRequirements.push('RM Specification');
                //     } if (requirementDate === "") {
                //         Toaster.warning("Please select Requirement Date");
                //         return false;
                //     }
                //     const message = `Please select ${missingRequirements.join(' and ')}`;
                //     Toaster.warning(message);
                // }
            } else if (selectedOption === "componentAssembly") {

                if (getValues("partNumber") === "") {
                    Toaster.warning("Please select all the mandatory fields");
                    return false
                }

                else if (!getValues('HavellsDesignPart')) {
                    Toaster.warning("Please select Havells Design part");
                    return false;
                }
                else if (["", "-"].includes(getValues('TargetPrice')) && getValues("HavellsDesignPart")?.label === HAVELLS_DESIGN_PARTS) {
                    Toaster.warning("ZBC costing approval is required for this plant to raise a quote.");
                    return false;
                } else if ((remark === '' || childPartFiles?.length === 0)) {
                    Toaster.warning('Please fill the remark and attachment documents!');
                    return;
                }
            } else if (selectedOption === "Bought Out Part") {

                if (bopList.length === 0) {


                    Toaster.warning("Please select all the mandatory fields");
                    return false
                } else if (selectedOption === "Bought Out Part" && (bopList[0]?.BopReamrk === "" || bopList[0]?.BopAttachments?.length === 0)) {
                    Toaster.warning('Remarks and Attachments are required!');
                    return false;
                }
            }
            if (selectedOption !== "Tooling") {
                if (getValues('UOM')?.label === "" || getValues('UOM')?.label === undefined) {
                    Toaster.warning("Please select UOM");
                    return false;
                }

            } if (requirementDate === "") {
                Toaster.warning(`Please select ${selectedOption === 'TOOLING' ? 'Delivery Date' : 'N-100 Timeline'}`);
                return false;
            }
            if (nfrId && nfrId.value !== null) {//CHECK_NFR
                dispatch(getNfrAnnualForecastQuantity(nfrId.value, getValues('partNumber')?.value, sopdate = "", (res) => {
                    Data = res.data.Data
                }));
            }
            let dataObj = {                 // Part Handle change
                "PartIdList": [
                    getValues('partNumber')?.value
                ],
                "PlantId": getValues('plant')?.value,
                "VendorId": null
            };

            let vendorList = [];
            let vendorListFinal = [];

            dispatch(checkExistCosting(dataObj, (res) => {                 // Part Handle change
                if (res?.data?.Result) {
                    vendorList = [...res?.data?.DataList];
                    vendorList && vendorList?.map((item) => {
                        vendorListFinal.push(`${item?.VendorName} (${item?.VendorCode})`);
                    });
                }

                let tempArrayparts = [...selectedparts, getValues('partNumber')];
                setSelectedParts(tempArrayparts);

                let partNumber = getValues('partNumber');

                // sopObjectTemp && sopObjectTemp.map((item, index) => {
                //     let newObjTemp = { ...objTemp }; // Create a new object in each iteration

                //     newObjTemp.PartNo = partNumber?.label;
                //     newObjTemp.PartId = getValues('partNumber')?.value;
                //     newObjTemp.UOM = getValues('UOM')?.label
                //     newObjTemp.UOMId = getValues('UOM')?.value
                //     newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0
                //     newObjTemp.TimeLine = requirementDate || ''
                //     newObjTemp.PartType = getValues('PartType')?.label
                //     newObjTemp.PartTypeId = getValues('PartType')?.value

                //     newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label
                //     newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value
                //     newObjTemp.Description = getValues('Description')



                //     if (index === 2) {
                //         newObjTemp.PartNumber = partNumber?.label;
                //         newObjTemp.VendorListExisting = vendorListFinal.join(',') ?? '-';
                //         newObjTemp.RMName = rmName?.label ?? '-';
                //         newObjTemp.RawMaterialChildId = rmName?.value ?? '-';
                //         newObjTemp.RMGrade = rmgrade?.label ?? '-';
                //         newObjTemp.RawMaterialGradeId = rmgrade?.value ?? '-';
                //         newObjTemp.RMSpecification = rmspecification?.label ?? '-';
                //         newObjTemp.RawMaterialSpecificationId = rmspecification?.value ?? '-';
                //     }
                //     if (nfrId) {
                //         if (index === 0) {
                //             newObjTemp.Quantity = checkForDecimalAndNull(Data.FirstYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                //             newObjTemp.YearName = Data.FirstYear
                //         } else if (index === 1) {
                //             newObjTemp.Quantity = checkForDecimalAndNull(Data.SecondYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                //             newObjTemp.YearName = Data.SecondYear
                //         } else if (index === 2) {
                //             newObjTemp.Quantity = checkForDecimalAndNull(Data.ThirdYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                //             newObjTemp.YearName = Data.ThirdYear
                //         } else if (index === 3) {
                //             newObjTemp.Quantity = 0;
                //             newObjTemp.YearName = parseInt(Data.ThirdYear) + 1
                //             newObjTemp.isEdit = true
                //         } else if (index === 4) {
                //             newObjTemp.Quantity = 0;
                //             newObjTemp.YearName = parseInt(Data.ThirdYear) + 2
                //             newObjTemp.isEdit = true
                //         }
                //     } else {
                //         newObjTemp.Quantity = 0
                //         newObjTemp.YearName = fiveyearList[index]
                //     }
                //     return null;
                // });
                let arrTemp = [];

                let newObjTemp = {};  // Initialize the new object

                // Common properties
                newObjTemp.UOM = getValues('UOM')?.label;
                newObjTemp.UOMSymbol = getValues('UOM')?.label
                newObjTemp.UnitOfMeasurementId = getValues('UOM')?.value;
                newObjTemp.TargetPrice = getTargetprice?.TargetPrice || "-";
                newObjTemp.TimeLine = requirementDate.split(' ')[0] || '';
                newObjTemp.PartType = getValues('PartType')?.label;
                newObjTemp.PartTypeId = getValues('PartType')?.value;
                newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label;
                newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value;
                newObjTemp.Description = getValues('Description') || "";
                newObjTemp.SOPQuantityDetails = sopQuantityList;
                newObjTemp.PartName = getValues('Description') || "";


                if (selectedOption === "Raw Material") {
                    // Set properties specific to Raw Material
                    newObjTemp.RawMaterialGrade = RawMaterialList[0]?.RawMaterialGrade
                    newObjTemp.RawMaterialName = RawMaterialList[0]?.RawMaterialName
                    newObjTemp.RawMaterialSpecification = RawMaterialList[0]?.RawMaterialSpecification
                    newObjTemp.RawMaterialSpecificationId = RawMaterialList[0]?.RawMaterialSpecificationId
                    newObjTemp.RawMaterialGradeId = RawMaterialList[0]?.RawMaterialGrade
                    newObjTemp.RawMaterialChildId = RawMaterialList[0]?.RawMaterialChildId
                    newObjTemp.RawMaterialCode = RawMaterialList[0]?.RawMaterialCode
                    newObjTemp.RawMaterialCodeId = RawMaterialList[0]?.RawMaterialCodeId


                } else if (selectedOption === "componentAssembly") {
                    // Set properties specific to Component Assembly
                    newObjTemp.PartNumber = partNumber?.label;
                    newObjTemp.PartId = getValues('partNumber')?.value;
                } else if (selectedOption === "Bought Out Part") {
                    newObjTemp.BoughtOutPartName = bopList[0]?.BoughtOutPartName
                    newObjTemp.BoughtOutPartCategoryName = bopList[0]?.BoughtOutPartCategoryName
                    newObjTemp.BoughtOutPartCategoryId = bopList[0]?.BoughtOutPartCategoryId
                    newObjTemp.BoughtOutPartNumber = bopList[0]?.BoughtOutPartNumber
                    newObjTemp.BoughtOutPartChildId = bopList[0]?.BoughtOutPartChildId
                } else if (selectedOption === "Tooling") {
                    newObjTemp.ToolNumber = partNumber?.label;
                    newObjTemp.ToolPartId = getValues('partNumber')?.value;
                    newObjTemp.ToolName = getValues('partNumber')?.label;
                }

                arrTemp.push(newObjTemp);
                let arr
                let QuotationPartId = ''
                if (updateButtonPartNoTable) {

                    if (selectedOption === "Raw Material") {
                        arr = rmDataList.map(item => {
                            if (item?.RawMaterialChildId === editRawMaterialId) {
                                QuotationPartId = item?.QuotationPartId
                            }
                            return item?.RawMaterialChildId === editRawMaterialId ? { ...item, ...arrTemp[0] } : item;
                        });
                    } else if (selectedOption === "componentAssembly") {
                        arr = partList?.map(item => {
                            // Check PartId for componentAssembly
                            if (item?.PartId === getValues('partNumber')?.value) {
                                QuotationPartId = item?.QuotationPartId
                            }
                            return item?.PartId === getValues('partNumber')?.value ? { ...item, ...arrTemp[0] } : item;
                        });
                    } else if (selectedOption === "Bought Out Part") {
                        arr = bopDataList.map(item => {
                            if (item?.BoughtOutPartChildId === editBopId) {
                                QuotationPartId = item?.QuotationPartId
                            }
                            return item?.BoughtOutPartChildId === editBopId ? { ...item, ...arrTemp[0] } : item;
                        });
                    } else {
                        arr = toolingList.map(item => {
                            if (item?.PartId === editToolingId) {
                                QuotationPartId = item?.QuotationPartId
                            }
                            return item?.PartId === editToolingId ? { ...item, ...arrTemp[0] } : item;
                        });

                    }
                } else {
                    if (selectedOption === "Raw Material") {
                        arr = [...rmDataList, ...arrTemp];

                    } else if (selectedOption === "componentAssembly") {
                        arr = [...partList, ...arrTemp];
                    } else if (selectedOption === "Bought Out Part") {
                        arr = [...bopDataList, ...arrTemp];

                    } else {
                        arr = [...toolingList, ...arrTemp];

                    }
                }



                let obj = {}

                let temppartArr = []
                let tempArr = [...arr]
                let list = []
                list = tempArr && tempArr?.map(item => {
                    if (isNaN(Number(item?.Quantity))) {
                        item.Quantity = 0
                    }
                    return item
                })


                obj.QuotationId = getQuotationIdForRFQ ? getQuotationIdForRFQ : ""
                obj.TechnologyId = getValues('technology').value || null
                obj.PlantId = getValues('plant')?.value
                obj.LoggedInUserId = loggedInUserId()
                let partIdList = _.uniq(_.map(list, 'PartId'))
                let childPartIdList = _.uniq(_.map(tableData, 'PartId'));
                partIdList && partIdList?.map((item) => {
                    if (item !== getValues('partNumber')?.value) return false
                    let temppartObj = {}
                    let partListArr = []
                    let partObject = []
                    temppartObj.PartId = item
                    let obj = arr && arr?.filter(ele => ele?.PartId === item)

                    let rmList = []
                    if (isNFRFlow) {
                        let arrList = rmAPIList && rmAPIList?.filter(element => element?.partName?.value === item)[0]?.RmList
                        rmList = arrList && arrList?.filter(element => element?.RawMaterialChildId || element?.RawMaterialGradeId || element?.RawMaterialSpecificationId)
                    } else {
                        tableData && tableData.map((item2) => {

                            if (item2?.PartId === item) {
                                rmList = [{
                                    "RawMaterialChildId": item2?.RawMaterialChildId || null,
                                    "RawMaterialGradeId": item2?.RawMaterialGradeId || null,
                                    "RawMaterialSpecificationId": item2?.RawMaterialSpecificationId || null
                                }]
                            }
                        })
                    }



                    temppartObj.RMDetails = rmList
                    temppartObj.SOPQuantityDetails = sopQuantityList
                    temppartObj.IsChildPart = false
                    temppartObj.QuotationPartId = updateButtonPartNoTable ? QuotationPartId : ""
                    temppartObj.PartType = partType?.label || ''
                    temppartObj.TargetPrice = getTargetprice?.TargetPrice || "-"
                    temppartObj.TimeLine = requirementDate || "";
                    temppartObj.Remarks = remark || null
                    temppartObj.Attachments = childPartFiles || []
                    temppartObj.HavellsDesignPart = getValues('HavellsDesignPart')?.label || ''
                    temppartObj.UnitOfMeasurementId = getValues('UOM')?.value || ''
                    temppartObj.ExistingVendor = vendorList.join(',') || '';
                    temppartObj.Description = getValues('Description') || ""
                    temppartObj.SopDate = sopdate || null
                    //temppartObj.SOPQuantityDetails = obj[0]?.SOPQuantityDetails

                    //ExistingVendor
                    let PartSpecificationList = {};
                    let PartSpecification = [];

                    if (specificationList?.length > 0) {
                        specificationList.forEach((item) => {
                            let specObj = {
                                Specification: item?.Specification,
                                Value: item?.Value,
                                LoggedInUserId: loggedInUserId()
                            };
                            PartSpecification.push(specObj);
                        });
                    }

                    // Populate PartSpecificationList object
                    PartSpecificationList = {
                        QuotationPartIdRef: updateButtonPartNoTable ? QuotationPartId : null,
                        PartSpecification: PartSpecification
                    };

                    // Assuming temppartObj already exists and you're assigning PartSpecificationList to it
                    temppartObj.PartSpecificationList = PartSpecificationList;

                    temppartArr.push(temppartObj);
                    // if (updateButtonPartNoTable) {
                    //     let updatedarr = temppartArr[partIndex];
                    //     const updatedSopQuantityList = sopQuantityList; // Store sopQuantityList in a constant
                    //     if (updatedarr) {
                    //         updatedarr.SOPQuantityDetails = updatedSopQuantityList;
                    //         temppartArr[partIndex] = updatedarr;
                    //     }
                    // }


                    // Child Part Details
                    if (partType?.label === "Assembly") {
                        childPartIdList && childPartIdList.map((childItem) => {
                            tableData && tableData.map((item2) => {
                                if (item2?.PartId === childItem) {
                                    let childPartObj = {};
                                    childPartObj.PartId = item2?.PartId;
                                    childPartObj.RMDetails = [{
                                        "RawMaterialChildId": item2?.RawMaterialChildId,
                                        "RawMaterialGradeId": item2?.RawMaterialGradeId,
                                        "RawMaterialSpecificationId": item2?.RawMaterialSpecificationId
                                    }];
                                    childPartObj.SOPQuantityDetails = [];
                                    childPartObj.IsChildPart = true;
                                    childPartObj.PartType = null;
                                    childPartObj.QuotationPartId = ""
                                    childPartObj.PartSpecificationList = {
                                        "QuotationPartIdRef": null,
                                        "PartSpecification": null
                                    };

                                    childPartObj.HavellsDesignPart = null
                                    childPartObj.TargetPrice = null
                                    childPartObj.TimeLine = null
                                    childPartObj.UnitOfMeasurementId = null
                                    childPartObj.SopDate = null
                                    childPartObj.Remarks = null
                                    childPartObj.Description = null
                                    childPartObj.Attachments = []
                                    temppartArr.push(childPartObj);
                                }
                                return null;
                            });
                        })
                    }

                    return null
                })

                let updatedPartList = [];
                if (updateButtonPartNoTable) {
                    if (isPartDetailUpdate) {
                        updatedPartList = temppartArr;
                    } else if (!isPartDetailUpdate) {

                        updatedPartList = [...storePartsDetail];
                        updatedPartList[0] = {
                            ...updatedPartList[0], // Preserve existing properties
                            UnitOfMeasurementId: getValues('UOM')?.value || '',
                            HavellsDesignPart: getValues('HavellsDesignPart')?.label || '',
                            TimeLine: requirementDate || ''
                        };
                    }
                } else {

                    updatedPartList = temppartArr;
                }


                switch (selectedOption) {
                    case 'componentAssembly':

                        obj.PartList = updatedPartList;
                        obj.RawMaterialList = []
                        obj.BoughtOutPartList = []
                        obj.ToolDataList = []
                        break;
                    case 'Raw Material':

                        let tempRmArr = [];
                        let rmIdList = _.uniq(_.map(RawMaterialList, 'RawMaterialChildId'));
                        rmIdList && rmIdList.forEach((rmId) => {
                            RawMaterialList && RawMaterialList.forEach((item2) => {


                                if (item2?.RawMaterialChildId === rmId) {
                                    let tempRmObj = {
                                        RawMaterialChildId: item2.RawMaterialChildId,
                                        RawMaterialGradeId: item2.RawMaterialGradeId,
                                        RawMaterialSpecificationId: item2.RawMaterialSpecificationId,
                                        RawMaterialSpecification: item2?.RawMaterialSpecification,
                                        RawMaterialGrade: item2?.RawMaterialGrade,
                                        RawMaterialName: item2?.RawMaterialName,
                                        PartType: selectedOption || "",
                                        TargetPrice: getTargetprice?.TargetPrice || "-",
                                        TimeLine: requirementDate || "",
                                        Remarks: item2?.RawMaterialReamrk || null,
                                        Attachments: item2?.RawMaterialAttachments || [],
                                        HavellsDesignPart: getValues('HavellsDesignPart')?.label || '',
                                        UnitOfMeasurementId: getValues('UOM')?.value || '',
                                        ExistingVendor: vendorList.join(',') || '',
                                        QuotationPartId: updateButtonPartNoTable ? QuotationPartId : "",
                                    };
                                    tempRmArr.push(tempRmObj);
                                }
                            });
                        });
                        obj.PartList = [];
                        obj.RawMaterialList = tempRmArr;
                        obj.BoughtOutPartList = [];
                        obj.ToolDataList = []

                        break;
                    case "Bought Out Part":
                        let tempBopArr = [];
                        let bopIdList = _.uniq(_.map(bopList, 'BoughtOutPartChildId'));
                        bopIdList && bopIdList.forEach((bopId) => {
                            bopList && bopList.forEach((item2) => {

                                if (item2?.BoughtOutPartChildId === bopId) {
                                    let tempBopObj = {
                                        BoughtOutPartChildId: item2.BoughtOutPartChildId,
                                        BoughtOutPartCategoryId: item2.BoughtOutPartCategoryId,
                                        PartType: selectedOption || "",
                                        TargetPrice: getTargetprice?.TargetPrice || "-",
                                        TimeLine: requirementDate || "",
                                        Remarks: item2?.BopReamrk || null,
                                        Attachments: item2?.BopAttachments || [],
                                        HavellsDesignPart: getValues('HavellsDesignPart')?.label || '',
                                        UnitOfMeasurementId: getValues('UOM')?.value || '',
                                        ExistingVendor: vendorList.join(',') || '',
                                        QuotationPartId: updateButtonPartNoTable ? QuotationPartId : "",
                                    };
                                    let PartSpecificationList = {};
                                    let PartSpecification = [];


                                    if (item2?.BopSpecification?.length > 0) {
                                        item2?.BopSpecification.forEach((item) => {

                                            let specObj = {
                                                Specification: item?.Specification,
                                                Value: item?.Value,
                                                LoggedInUserId: loggedInUserId()
                                            };
                                            PartSpecification.push(specObj);
                                        });
                                    }

                                    // Populate PartSpecificationList object
                                    PartSpecificationList = {
                                        QuotationPartIdRef: updateButtonPartNoTable ? QuotationPartId : null,
                                        PartSpecification: PartSpecification
                                    };
                                    tempBopObj.PartSpecificationList = PartSpecificationList;

                                    tempBopArr.push(tempBopObj);
                                }
                            });
                        });
                        obj.PartList = [];
                        obj.RawMaterialList = [];
                        obj.BoughtOutPartList = tempBopArr;
                        obj.ToolDataList = []

                        break;
                    case 'Tooling':
                        let tempToolingArr = [];
                        let toolingIdList = _.uniq(_.map(toolingList, 'PartId'))
                        let toolPartData = toolingSpecificRowData[0]?.ToolPartData
                        let toolPartSpecificationList = toolPartData?.ToolPartSpecificationList
                        let toolData = toolingSpecificRowData[0]?.ToolData
                        toolingIdList && toolingIdList?.map((item) => {
                            if (item !== getValues('partNumber')?.value) return false
                            let temppartObj = {}
                            temppartObj.ToolId = item
                            let rmList = []
                            if (toolingSpecificRowData && toolingSpecificRowData[0]?.ToolChildList?.length > 0) {
                                toolingSpecificRowData[0].ToolChildList.forEach((item2) => {
                                    let rmObj = {
                                        "PartId": item2?.PartId || null,
                                        "RawMaterial": item2?.RawMaterial || null,
                                        "PartName": item2?.PartName || null
                                    };
                                    rmList.push(rmObj);
                                });

                                // Assign the entire rmList array to temppartObj.ToolChildList
                                temppartObj.ToolChildList = rmList;
                            }
                            temppartObj.IsChildPart = false
                            temppartObj.QuotationPartId = updateButtonPartNoTable ? QuotationPartId : null
                            temppartObj.PartType = partType?.label || ''
                            temppartObj.TargetPrice = getTargetprice?.TargetPrice || "-"
                            temppartObj.TimeLine = requirementDate || "";
                            temppartObj.Remarks = remark || null
                            temppartObj.Attachments = childPartFiles || []
                            temppartObj.HavellsDesignPart = null
                            temppartObj.UnitOfMeasurementId = getValues('UOM')?.value
                            temppartObj.ExistingVendor = vendorList.join(',') || '';
                            temppartObj.Description = getValues('Description') || ""
                            temppartObj.SopDate = sopdate || null
                            temppartObj.SOPQuantity = sopQuantityList || [];

                            temppartObj.ToolNumber = toolingSpecificRowData[0]?.ToolNumber
                            temppartObj.ToolName = toolingSpecificRowData[0]?.ToolName
                            temppartObj.ToolDescription = toolingSpecificRowData[0]?.ToolDescription

                            let PartSpecification = [];
                            let ToolData = {};
                            let ToolPartData = {};

                            ToolData = {
                                ToolType: toolData?.ToolType,  // Replace with actual data
                                ToolTechnology: toolData?.ToolTechnology,  // Replace with actual data
                                ToolLife: toolData?.ToolLife,  // Replace with actual data
                                NoOfCavity: toolData?.NoOfCavity,  // Replace with actual data
                                MachineTonnage: toolData?.MachineTonnage, // Replace with actual data
                                ToolRunningLocation: toolData?.ToolRunningLocation  // Replace with actual data
                            };
                            ToolPartData = {
                                ToolPartName: toolPartData?.ToolPartName,  // Replace with actual data
                                ToolPartRawMaterial: toolPartData?.ToolPartRawMaterial,  // Replace with actual data
                                ToolPartSpecificationList: toolPartSpecificationList
                            };

                            if (specificationList?.length > 0) {
                                specificationList.forEach((item) => {
                                    let specObj = {
                                        Specification: item?.Specification,
                                        Value: item?.Value,
                                        LoggedInUserId: loggedInUserId()
                                    };
                                    PartSpecification.push(specObj);
                                });


                                // Populate PartSpecificationList array
                                let PartSpecificationList = PartSpecification.map(specObj => ({
                                    QuotationPartSpecificationIdRef: temppartObj?.PartId || "00000000-0000-0000-0000-000000000000",
                                    Specification: specObj.Specification,
                                    Value: specObj.Value
                                }));

                                // Assign PartSpecificationList to ToolSpecificationList
                                temppartObj.ToolSpecificationList = PartSpecificationList;
                            }

                            temppartObj.ToolData = ToolData;
                            temppartObj.ToolPartData = ToolPartData;
                            tempToolingArr.push(temppartObj);


                            return null
                        })

                        obj.RawMaterialList = [];
                        obj.BoughtOutPartList = [];
                        obj.PartList = [];
                        obj.ToolDataList = tempToolingArr
                        break;
                    default:
                        obj.RawMaterialList = [];
                        obj.BoughtOutPartList = [];
                        obj.ToolDataList = []
                        obj.PartList = updatedPartList;
                        break;
                }

                let updatedArr = []
                setIsLoader(true)
                dispatch(saveRfqPartDetails(obj, (res) => {
                    if (res?.data?.Result) {
                        setIsLoader(false)
                        const type = selectedOption === 'Raw Material' ? 'Raw Material' : selectedOption === "Bought Out Part" ? "Bought Out Part" : selectedOption === "Tooling" ? "Tooling" : "Part";
                        const action = updateButtonPartNoTable ? 'updated' : 'added';
                        Toaster.success(`${type} details have been ${action} successfully.`);
                        setPartIdentity(res?.data?.Identity);
                        // onResetPartNoTable();
                        // setTableData([]);
                        // setSpecificationList([]);
                        // 
                        // 
                        // updatedArr = arr.map(obj => {
                        //     if (obj.PartId === assemblyPartNumber.value) {
                        //         // 
                        //         return { ...obj, QuotationPartId: res?.data?.Identity };
                        //     }
                        //     return obj;
                        // });
                        let updatedArr = arr.map(obj => {
                            if (selectedOption === "Raw Material") {
                                if (obj.RawMaterialChildId === RawMaterialList[0]?.RawMaterialChildId) {
                                    return { ...obj, QuotationPartId: res?.data?.Identity };
                                }
                            } else if (selectedOption === "componentAssembly") {
                                if (obj.PartId === assemblyPartNumber.value) {
                                    return { ...obj, QuotationPartId: res?.data?.Identity };
                                }
                            } else if (selectedOption === "Bought Out Part") {
                                if (obj.BoughtOutPartChildId === bopList[0]?.BoughtOutPartChildId) {
                                    return { ...obj, QuotationPartId: res?.data?.Identity };
                                }
                            } else {
                                if (obj.PartId === assemblyPartNumber.value) {
                                    return { ...obj, QuotationPartId: res?.data?.Identity };
                                }
                            }
                            return obj;
                        });


                        // State update should be outside the map function
                        if (selectedOption === "Raw Material") {
                            setRmDataList(updatedArr);
                        } else if (selectedOption === "componentAssembly") {
                            setPartList(updatedArr);
                        } else if (selectedOption === "Bought Out Part") {
                            setBopDataList(updatedArr);
                        } else {
                            setToolingList(updatedArr);
                        }

                    }
                    setIsLoader(false)

                    const newIdentityArray = _.uniq(_.map(updatedArr, 'QuotationPartId')); // Convert to number
                    // 
                    setUniquePartList(newIdentityArray);

                }))

                setTimeout(() => {
                    setValue('partNumber', "");
                    setRequirementDate("")
                    setValue('RMName', "");
                    setValue('RMGrade', "");
                    setValue('RMSpecification', "");
                    setValue("PartType", "");
                    setValue('HavellsDesignPart', "");
                    setValue("UOM", "")
                    setValue("Description", "")
                    setValue("TargetPrice", "")

                    setUpdateButtonPartNoTable(false);
                    setEditQuotationPart(false);
                    setIsPartDeailUpdate(false)
                    setRMName('');
                    setRMGrade('');
                    setRMSpecification('');
                    // setAssemblyPartNumber("")
                    setTableData([]);
                    setSpecificationList([]);
                    setSopQuantityList([])
                    setSOPDate('')
                    setAssemblyPartNumber('')
                    //setPartNumberWithName("")

                    // setQuotationIdentity('');
                    setStorePartsDetail([]);
                    dispatch(clearGradeSelectList([]));
                    dispatch(clearSpecificationSelectList([]));
                    dispatch(setRfqPartDetails([]));
                    setRawMaterialList([])
                    setResetRmFields(true)
                    setResetBopFields(true)
                    setEditRawMaterialId("")
                    setEditBopId("")
                    setEditToolingId("")

                    setBopList([])
                    setIsDisabled(false)
                    onResetPartNoTable()
                    // setPrNumber([])
                    //dispatch(setQuotationIdForRfq(""))
                }, 200)

            }));
            // }
        }

    };
    const handleReviewButtonClick = () => {

        setRemarkDrawer(true)
    }
    const handleCloseReamrkDrawer = () => {
        setRemarkDrawer(false)
    }
    const onResetPartNoTable = (toggleButton = false) => {

        if (!toggleButton) {
            setTimeout(() => {
                setResetRmFields(false)
                setResetBopFields(false)
            }, 50)
            setResetRmFields(true)
            setResetBopFields(true)

        }

        setRawMaterialList([])
        setValue('partNumber', "")
        setValue('annualForecastQuantity', "")
        setValue('RMName', "")
        setValue('RMGrade', "")
        setValue('RMSpecification', "")
        setValue("PartType", "")
        setValue('HavellsDesignPart', "")
        setValue("UOM", "")
        setValue("Description", "")
        setValue("SOPDate", "")
        setValue('TargetPrice', "")
        setRequirementDate("")
        setUpdateButtonPartNoTable(false);
        setEditQuotationPart(false)
        setTableData([]);
        setSpecificationList([]);
        setChildPartFiles([]);
        setRemark('')
        setSopQuantityList([])
        setSOPDate('')
        setStorePartsDetail([]);
        setIsDisabled(false)
        setResetDrawer(true)

        // setValue('technology', "")
    }

    const bulkToggle = () => {
        setisBulkUpload(true);
    }

    const closeBulkUploadDrawer = () => {
        setisBulkUpload(false);
    }

    const onResetVendorTable = () => {
        setUpdateButtonVendorTable(false)
        setValue('vendor', "")
        setValue('contactPerson', "")
        setValue('WarrantyTerms', "")
        setValue('PaymentTerms', "")
        setValue('IncoTerms', "")
        setValue('LDClause', "")
        setGetReporterListDropDown([])
    }
    const viewAddButtonIcon = (data, type) => {

        let className = ''
        let title = ''
        if (data === "EDIT") {
            className = 'edit-icon-primary'
            title = 'Edit'
        } else {
            className = 'plus-icon-square'
            title = 'Add'
        }
        if (type === "className") {

            return className
        } else if (type === "title") {

            return title
        }
    }

    /**
    * @method handleTechnologyChange
    * @description  USED TO HANDLE TECHNOLOGY CHANGE
    */
    const handleTechnologyChange = (newValue) => {
        if (newValue) {
            setPartNoDisable(false)
            setValue('partNumber', "")
            setTechnology(newValue)
        } else {
            setPartNoDisable(true)
        }
        setVendor('')
        setValue("vendor", "")
        setPartName('')
        setState(false)
        setShowTooltip(false)
        setTimeout(() => {
            setState(true)
            setTimeout(() => {
                setShowTooltip(true)
            }, 250);
        }, 500);
        reactLocalStorage.setObject('PartData', [])

    }
    const handlePlant = (newValue) => {
        if (newValue && newValue !== '') {
            setPlant(newValue)
        } else {
            setPlant('')
        }
        setVendor('')
        setValue("vendor", "")
    }
    const handleNfrChnage = (newValue) => {
        if (newValue && newValue !== '') {
            // setPartNoDisable(false)
            setPrNumber({ label: newValue.label, value: newValue.value })
            setValue('partNumber', "")
            setPartName('')
            let obj = {
                quotationId: quotationIdentity,
                prNumbersId: newValue.value,
                loggedInUserId: loggedInUserId(),
                IsToolRequest: selectedOption === "Tooling" ? true : false,
                PartIdList: []
            }
            dispatch(createQuotationPrParts(obj, (res) => {

                if (res?.status === 200) {
                    setTimeout(() => {
                        getQuotationDataById(res.data?.Identity)

                    }, 300)

                }
            }))
            reactLocalStorage.setObject('PartData', [])
            dispatch(getPlantSelectListByType(ZBC, 'RFQ', newValue?.value, () => { }))
            //setNfrId(newValue)
            // setIsNFRFlow(true)
        } else {
            //setNfrId(null)
            // setIsNFRFlow(false)
        }
    }
    /**
        * @method handlePartChange
        * @description  USED TO HANDLE PART CHANGE
        */
    const handlePartTypeChange = (newValue) => {
        if (newValue && newValue !== '') {
            setPartType(newValue)
            setValue('PartNumber', '')
            setPart('')
            setPartTypeforRM(newValue.value)
            setSelectedPartType(newValue?.label)
        } else {
            setPartType([])
            setSelectedPartType("")
        }
        setPartName([])
        reactLocalStorage.setObject('PartData', [])
    }
    const handleVendorChange = (data) => {
        dispatch(getContactPerson(data.value, (res) => {
            setGetReporterListDropDown(res?.data?.SelectList)
            setValue('contactPerson', "")
        }))
        dispatch(checkRegisteredVendor(data.value, (res) => {
            let isRegisteredVendor = res?.data?.Data?.IsRegisteredVendor;
            if (isRegisteredVendor) {

                dispatch(getrRqVendorDetails(data.value, (res) => {
                    const { PaymentTerms, IncoTerms, IncoTermIdRef, PaymentTermIdRef } = res?.data?.Data;
                    setValue('IncoTerms', IncoTerms);
                    setValue('PaymentTerms', PaymentTerms);
                }));
            } else {
                setValue('IncoTerms', "");
                setValue('PaymentTerms', "");
            }
        }));

    }
    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput, initialConfiguration?.IsCriticalVendorConfigured ? technology.value : '', initialConfiguration?.IsCriticalVendorConfigured ? plant.value : '')
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

    const removeAddedParts = (arr) => {

        const filteredArray = arr.filter((item) => {

            return !selectedparts.some((element) => {
                return element.value === item?.value;
            });
        });
        return filteredArray
    }
    const handleHavellsDesignPart = (newValue) => {

        setHavellsDesignPart(newValue)
        if (getTargetprice && getTargetprice?.TargetPrice && newValue?.label === HAVELLS_DESIGN_PARTS) {
            setValue('TargetPrice', getTargetprice?.TargetPrice)
        } else {
            setValue('TargetPrice', "-")

        }
        if (updateButtonPartNoTable) {
            setStorePartsDetail((prevDetails) => {
                const updatedDetails = prevDetails?.map((item) => {
                    let QuotationPartId = null;

                    switch (selectedOption) {
                        case "Bought Out Part":
                            bopDataList?.forEach(item => {
                                if (item?.BoughtOutPartChildId === editBopId) {
                                    QuotationPartId = item?.QuotationPartId
                                }
                            })
                            break
                        case "Raw Material":
                            rmDataList?.forEach(item => {
                                if (item?.RawMaterialChildId === editRawMaterialId) {
                                    QuotationPartId = item?.QuotationPartId
                                }
                            })
                            break
                        case "componentAssembly":
                            partList?.forEach((part) => {
                                if (part?.PartId === getValues('partNumber')?.value) {
                                    QuotationPartId = part?.QuotationPartId;
                                }
                            })
                            break
                        case "Tooling":
                            toolingList?.forEach(item => {
                                if (item?.PartId === editToolingId) {
                                    QuotationPartId = item?.QuotationPartId
                                }
                            })
                            break
                        default:
                    }
                    const PartSpecificationList = {
                        QuotationPartIdRef: QuotationPartId || null,
                        PartSpecification: item?.PartSpecification || [],
                    };
                    if (item?.PartId === getValues('partNumber')?.value) {
                        const { PartSpecification, ...rest } = item;

                        return {
                            ...rest,
                            UnitOfMeasurementId: getValues('UOM')?.value || null,
                            HavellsDesignPart: newValue?.label || "",
                            TimeLine: requirementDate || "",
                            PartSpecificationList,
                            QuotationPartId
                        }
                    } else {
                        return {
                            ...item,
                            UnitOfMeasurementId: null,
                            HavellsDesignPart: null,
                            TimeLine: null,
                            PartSpecificationList,
                            QuotationPartId
                        };
                    }
                });
                return updatedDetails;
            });
        }
    }
    const partFilterList = async (inputValue, type) => {
        const resultInput = inputValue.slice(0, searchCount)
        const nfrChange = nfrId?.value;

        if (inputValue?.length >= searchCount && (partName !== resultInput || nfrChange !== storeNfrId)) {
            const res = await getPartSelectListWtihRevNo(resultInput, technology.value, nfrId?.value, type)

            setPartName(resultInput)
            setStoreNfrId(nfrId?.value)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                let temp = [...autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)]

                return removeAddedParts(temp)

            } else {
                return removeAddedParts([...partDataAPI])
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('PartData')
                if (inputValue) {
                    let arr = [...autoCompleteDropdownPart(inputValue, partData, false, [], false)]
                    return removeAddedParts([...arr])
                } else {
                    return removeAddedParts([...partData])
                }
            }
        }

    }
    const quantityHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text d-flex'>Annual Forecast Quantity<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"quantity-tooltip"}></i> </span>
            </div>
        );
    };

    /**
    * @method beforeSaveCell
    * @description CHECK FOR ENTER NUMBER IN CELL
    */
    const beforeSaveCell = (props) => {
        let cellValue = props
        if (cellValue === undefined) {
            return true
        }
        if (cellValue && !/^[0-9]+(\.[0-9]+)?$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive number.');
            return false;
        }
        return true
    }

    const afcFormatter = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        const cell = props?.value;
        const value = beforeSaveCell(cell)
        setPartList(final)
        let isEnable
        if (getValues('nfrId')) {
            isEnable = dataProps?.isAddFlag && props?.data.isEdit ? true : dataProps?.isViewFlag ? false : isEditAll && props?.data.isEdit ? true : false
        } else {
            isEnable = dataProps?.isAddFlag ? true : dataProps?.isViewFlag ? false : isEditAll ? true : false
        }
        return (
            <>
                {<span className={`form-control custom-max-width-110px  ${isEnable ? '' : 'disabled'}`} >{value ? Number(cell) : 0}</span>}
            </>
        )
    }

    const handleVisibilityMode = (value) => {
        if (value?.label === "Duration") {
            setDateAndTime('')
        }
        setVisibilityMode(value)
        setValue('startPlanDate', '')
        setValue('Time', '')
    }

    const partNumberFormatter = (props) => {
        const row = props?.data;
        const value = row?.RevisionNumber ? (row?.PartNumber + ' (' + row?.RevisionNumber + ')') : (row?.PartNumber ? row?.PartNumber : '-')
        return <div className={`${value ? 'font-ellipsis' : 'row-merge'}`}>{value}</div>
    }

    /**
     * @method handleSubmissionDateChange
     * @description handleSubmissionDateChange
     */
    const handleSubmissionDateChange = (value) => {
        setSubmissionDate(value)
        setIsWarningMessageShow(false)
    }

    const handleChangeDateAndTime = (value) => {
        const localCurrentDate = new Date();
        if (localCurrentDate.toLocaleDateString() !== value.toLocaleDateString()) {
            setMinHours(0)
            setMinMinutes(0)
            setDateAndTime(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
        } else {
            setMinHours(currentHours)
            setMinMinutes(currentMinutes)
            if (value.getHours() > currentHours ? true : value.getMinutes() > currentMinutes) {
                setDateAndTime(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
            } else {
                const selectedDateTime = setHours(setMinutes(value, new Date().getMinutes()), new Date().getHours());
                setDateAndTime(DayTime(selectedDateTime).format('YYYY-MM-DD HH:mm:ss'))
            }

        }

    }

    const tooltipToggle = () => {
        setViewTooltip(!viewTooltip)
    }

    const checkBoxHandler = () => {
        setIsConditionalVisible(!isConditionalVisible)
        setVisibilityMode('')
        setValue('VisibilityMode', '')
        setValue('startPlanDate', '')
        setValue('Time', '')
    }

    function getNextFiveYears(currentYear) {
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear + i);
        }
        return years;
    }


    const handleRequirementDateChange = (value) => {
        setRequirementDate(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
        if (updateButtonPartNoTable && !isPartDetailUpdate) {
            setStorePartsDetail((prevDetails) => {
                const updatedDetail = prevDetails?.map((item) => {
                    let QuotationPartId = null;

                    switch (selectedOption) {
                        case "Bought Out Part":
                            bopDataList?.forEach(bopItem => {
                                if (bopItem?.BoughtOutPartChildId === editBopId) {
                                    QuotationPartId = bopItem?.QuotationPartId;
                                }
                            });
                            break;
                        case "Raw Material":
                            rmDataList?.forEach(rmItem => {
                                if (rmItem?.RawMaterialChildId === editRawMaterialId) {
                                    QuotationPartId = rmItem?.QuotationPartId;
                                }
                            });
                            break;
                        case "componentAssembly":
                            partList?.forEach(part => {
                                if (part?.PartId === getValues('partNumber')?.value) {
                                    QuotationPartId = part?.QuotationPartId;
                                }
                            });
                            break;
                        case "Tooling":
                            toolingList?.forEach(toolItem => {
                                if (toolItem?.PartId === editToolingId) {
                                    QuotationPartId = toolItem?.QuotationPartId;
                                }
                            });
                            break;
                        default:
                            break;
                    }

                    const PartSpecificationList = {
                        QuotationPartIdRef: QuotationPartId || null,
                        PartSpecification: item?.PartSpecification || []
                    };

                    const { PartSpecification, ...rest } = item; // Destructure to omit PartSpecification

                    return {
                        ...rest,
                        UnitOfMeasurementId: getValues('UOM')?.value || null,
                        HavellsDesignPart: getValues('HavellsDesignPart')?.value || null,
                        TimeLine: DayTime(value).format('YYYY-MM-DD HH:mm:ss') || null,
                        PartSpecificationList,
                        QuotationPartId
                    };
                });



                return updatedDetail;
            });
        }
    }

    const renderListingRM = (label) => {

        let opts1 = []
        if (label === 'rmname') {
            if (rawMaterialNameSelectList?.length > 0) {
                let opts = [...rawMaterialNameSelectList]
                opts && opts?.map(item => {
                    if (item?.Value === '0') return false
                    item.label = item?.Text
                    item.value = item?.Value
                    opts1.push(item)
                    return null
                })
            }
        }
        if (label === 'rmgrade') {
            if (gradeSelectList?.length > 0) {
                let opts = [...gradeSelectList]
                opts && opts?.map(item => {
                    if (item?.Value === '0') return false
                    item.label = item?.Text
                    item.value = item?.Value
                    opts1.push(item)
                    return null
                })
            }
        }

        if (label === 'rmspecification') {
            if (rmSpecification?.length > 0) {
                let opts = [...rmSpecification]
                opts && opts?.map(item => {
                    if (item?.Value === '0') return false
                    item.label = item?.Text
                    item.value = item?.Value
                    opts1.push(item)
                    return null
                })
            }
        }

        return opts1
    }

    const handleRMName = (newValue) => {
        setRMName({ label: newValue?.label, value: newValue?.value })
        setRmNameSelected(true)
        dispatch(getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => { }))
    }

    const handleRMGrade = (newValue) => {
        setRMGrade({ label: newValue?.label, value: newValue?.value })
        dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
    }

    const handleRMSpecification = (newValue) => {
        setRMSpecification({ label: newValue?.label, value: newValue?.value })
    }
    const setDisabled = (state) => {
        setIsDisabled(state);
    };

    const handleChangeUOM = (newValue) => {
        setSelectedUOM(newValue)
        if (updateButtonPartNoTable) {
            setStorePartsDetail((prevDetails) => {
                return prevDetails.map((item) => {
                    let QuotationPartId = null;


                    switch (selectedOption) {
                        case "Bought Out Part":
                            bopDataList?.forEach(bopItem => {
                                if (bopItem?.BoughtOutPartChildId === editBopId) {
                                    QuotationPartId = bopItem?.QuotationPartId;
                                }
                            });
                            break;
                        case "Raw Material":
                            rmDataList?.forEach(rmItem => {
                                if (rmItem?.RawMaterialChildId === editRawMaterialId) {
                                    QuotationPartId = rmItem?.QuotationPartId;
                                }
                            });
                            break;
                        case "componentAssembly":
                            partList?.forEach(part => {
                                if (part?.PartId === getValues('partNumber')?.value) {
                                    QuotationPartId = part?.QuotationPartId;
                                }
                            });
                            break;
                        case "Tooling":
                            toolingList?.forEach(toolingItem => {
                                if (toolingItem?.PartId === editToolingId) {
                                    QuotationPartId = toolingItem?.QuotationPartId;
                                }
                            });
                            break;
                        default:
                            break;
                    }

                    const PartSpecificationList = {
                        QuotationPartIdRef: QuotationPartId || null,
                        PartSpecification: item?.PartSpecification || []
                    };
                    if (item?.PartId === getValues('partNumber')?.value) {
                        return {
                            ...item,
                            UnitOfMeasurementId: newValue?.value || null,
                            HavellsDesignPart: getValues('HavellsDesignPart')?.value || null,
                            TimeLine: requirementDate || "",
                            PartSpecificationList,
                            QuotationPartId
                        };
                    } else {
                        return {
                            ...item,
                            UnitOfMeasurementId: null,
                            HavellsDesignPart: null,
                            TimeLine: null,
                            PartSpecificationList,
                            QuotationPartId
                        };
                    }
                });
            });
        }
    }
    const EditableCallback = (props) => {
        let value
        if (getValues('nfrId')) {
            value = dataProps?.isAddFlag && props?.data.isEdit ? true : dataProps?.isViewFlag ? false : isEditAll && props?.data.isEdit ? true : false
        } else {
            value = dataProps?.isAddFlag ? true : dataProps?.isViewFlag ? false : isEditAll ? true : false
        }

        return value
    }
    const DrawerToggle = () => {
        // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setDrawerOpen(true)
        setResetDrawer(false)
    }
    const closeDrawer = (e, isUpdate) => {
        setIsPartDeailUpdate(isUpdate)
        setDrawerOpen(false)
    }
    const handlePartNoChange = (value) => {

        setAssemblyPartNumber(value)
        dispatch(getPartInfo(value?.value, (res) => {
            let Data = res?.data?.Data
            setValue("Description", res?.data?.Data?.PartName);
            if ((selectedOption !== "Raw Material" || selectedOption !== "Bought Out Part")) {
                let uomObject = { label: Data?.UnitOfMeasurementSymbol, value: Data?.UnitOfMeasurementId }
                setValue("UOM", uomObject);
                setSelectedUOM(uomObject)
            }

            setPartEffectiveDate(res.data.Data?.EffectiveDate);
        }));
        dispatch(getTargetPrice(plant?.value, value?.value, Number(technology?.value), (res) => {
            const { TargetPrice } = res?.data?.Data;
            setTargetPrice(TargetPrice !== undefined ? TargetPrice : "");
        }));

    }
    const getPartType = (option) => {
        const map = {
            "componentAssembly": 'Component',
            "Bought Out Part": "Bought Out Part",
            "Tooling": 'Tooling'
        };
        return map[option] || 'Raw Material';
    };

    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
    function shouldEnableRadioButton(partList, rmDataList, bopDataList, toolingList) {
        return (partList?.length !== 0 || rmDataList?.length !== 0 || bopDataList?.length !== 0 || toolingList?.length !== 0);
    }
    function ShowLdClause(partType) {

        const partTypesToReturnFalse = ['Component', 'Assembly', 'componentAssembly', 'Raw Material'];

        return !partTypesToReturnFalse.includes(partType);
    }
    function ShowQuoteSubmissionDate(partType) {
        return havellsKey
            ? /* (partType !== 'Tooling' && */ (!showVendorSection && showSendButton && showSendButton !== 'PREDRAFT')
            : true;
    }

    const sendQuotationForReviewHnadle = (values) => {
        const obj = {
            loggedInUserId: loggedInUserId(),
            QuotationId: (getQuotationIdForRFQ ? getQuotationIdForRFQ : null),
            Remark: values?.remark
        }
        dispatch(sendQuotationForReview(obj, () => {
            props?.closeDrawer('', {})
        }))


    }
    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        buttonFormatterFirst: buttonFormatterFirst,
        buttonFormatterVendorTable: buttonFormatterVendorTable,
        customNoRowsOverlay: NoContentFound,
        partNumberFormatter: partNumberFormatter,
        sopFormatter: sopFormatter,
        EditableCallback: EditableCallback,
        afcFormatter: afcFormatter,
        quantityHeader: quantityHeader,
        effectiveDateFormatter: effectiveDateFormatter,
    };

    const VendorLoaderObj = { isLoader: VendorInputLoader }
    const plantLoaderObj = { isLoader: inputLoader }
    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div className="container-fluid">
            <div className="signup-form raise-rfq">
                <div className="row">
                    <div className="col-md-12">
                        <div className="shadow-lgg login-formg">
                            <div className="row">
                                <div className="col-md-6">
                                    <h3>{isViewFlag ? "View" : props?.isEditFlag ? "Update" : "Add"} {showOnlyFirstModule && (showSendButton === PREDRAFT || showSendButton === "") ? "RFI" : "RFQ"}

                                        {!isViewFlag && <TourWrapper
                                            buttonSpecificProp={{ id: "Add_Rfq_Form" }}
                                            stepsSpecificProp={{
                                                steps: Steps(t).RFQ_FORM
                                            }} />}
                                    </h3>
                                </div>
                            </div>
                            <div>
                                <div className='raise-rfq-radio-wrap mt-3'>
                                    <Form>
                                        <Label id="rfq_componentAssembly" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="radioGroup"
                                                className=''
                                                id='componentAssembly'
                                                checked={selectedOption === 'componentAssembly' ? true : false}
                                                onClick={handleRadioChange("componentAssembly")}
                                                disabled={/* props?.isAddFlag ? Object.keys(plant).length !== 0 : (props?.isEditFlag || props?.isViewFlag) ||  */props?.isViewFlag || shouldEnableRadioButton(partList, rmDataList, bopDataList, toolingList)}
                                            />{" "}
                                            <span> Component/Assembly</span>
                                        </Label>
                                        <Label id="rfq_rawMaterial" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="radioGroup"
                                                className=''
                                                id='rawMaterial'
                                                checked={
                                                    selectedOption === 'Raw Material' ? true : false
                                                }
                                                onClick={handleRadioChange("Raw Material")
                                                }
                                                disabled={/* props?.isAddFlag ? Object.keys(plant).length !== 0 : (props?.isEditFlag || props?.isViewFlag) ||  */props?.isViewFlag || shouldEnableRadioButton(partList, rmDataList, bopDataList, toolingList)}
                                            />{" "}
                                            <span> RM</span>
                                        </Label>

                                        <Label id="rfq_boughtOutPart" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="radioGroup"
                                                className=''
                                                id='bougthOutPart'
                                                checked={
                                                    selectedOption === "Bought Out Part" ? true : false
                                                }
                                                onClick={handleRadioChange("Bought Out Part")
                                                }
                                                disabled={/* props?.isAddFlag ? Object.keys(plant).length !== 0 : (props?.isEditFlag || props?.isViewFlag) || */ props?.isViewFlag || shouldEnableRadioButton(partList, rmDataList, bopDataList, toolingList)}
                                            />{" "}
                                            <span> BOP</span>
                                        </Label>

                                        <Label id=" rfq_tooling" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="radioGroup"
                                                className=''
                                                id='Tooling'
                                                checked={
                                                    selectedOption === 'Tooling' ? true : false
                                                }
                                                onClick={handleRadioChange("Tooling")
                                                }
                                                disabled={/* (props?.isAddFlag ? Object.keys(plant).length !== 0 : props?.isViewFlag)  */props?.isViewFlag || shouldEnableRadioButton(partList, rmDataList, bopDataList, toolingList)}
                                            />{" "}
                                            <span>Tooling</span>
                                        </Label>
                                    </Form>

                                </div>
                                <form>

                                    <Row className="part-detail-wrapper">
                                        <TooltipCustom id="technology" disabledIcon={true} tooltipText="To initiate RFI creation, select the technology, plant code, part type, and input part number (all three characters are necessary)" />

                                        {quotationType !== "Bought Out Part" && (
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={technologyLabel}
                                                    name={"technology"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    defaultValue={Object.keys(technology).length !== 0 ? technology : ""}
                                                    options={renderListing("technology")}
                                                    mandatory={true}
                                                    handleChange={handleTechnologyChange}
                                                    errors={errors.technology}
                                                    disabled={selectedOption === 'Tooling' || ((dataProps?.isViewFlag) ? true : false)
                                                        || (partList?.length !== 0 || rmDataList?.length !== 0 || bopDataList?.length !== 0 || vendorList?.length !== 0)}
                                                />
                                            </Col>)}
                                        {(quotationType === "Bought Out Part" || quotationType === 'Tooling') && <Col md="3" className={isRmSelected ? 'd-none' : ''}>
                                            <SearchableSelectHookForm
                                                label={(quotationType === "Bought Out Part" || quotationType === 'Tooling') ? "PR No." : "NFR No."}
                                                name={(quotationType === "Bought Out Part" || quotationType === 'Tooling') ? "prId" : "nfrId"}
                                                isClearable={true}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={nfrId?.length !== 0 ? nfrId : ""}
                                                options={renderListing(quotationType === "Bought Out Part" || quotationType === 'Tooling' ? "prNo" : "nfrId")}
                                                mandatory={quotationType === 'Tooling' ? true : false}

                                                handleChange={handleNfrChnage}
                                                errors={errors.nfrId}
                                                disabled={Object.keys(prNumber).length !== 0 || ((dataProps?.isViewFlag /* || dataProps?.isEditFlag */ || showSendButton === DRAFT) ? true : false)
                                                    || (partList?.length !== 0 || bopDataList?.length !== 0 || vendorList?.length !== 0)}
                                            // isLoading={VendorLoaderObj}
                                            />
                                        </Col>}
                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"Plant (Code)"}
                                                name={"plant"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue={Object.keys(plant).length !== 0 ? plant : ""}
                                                options={renderListing("plant")}
                                                mandatory={true}
                                                handleChange={handlePlant}
                                                errors={errors.plant}
                                                // disabled={((dataProps?.isViewFlag || isEditAll) ? true : false)
                                                //     || (partList?.length !== 0 || vendorList?.length !== 0)}
                                                //     selectedOption === 'Tooling' || ((dataProps?.isViewFlag ) ? true : false)
                                                // || (partList?.length !== 0 || rmDataList?.length !== 0 || bopDataList?.length !== 0 || vendorList?.length !== 0)
                                                disabled={Object.keys(prNumber).length !== 0 || ((partList?.length !== 0 || rmDataList?.length !== 0 || bopDataList?.length !== 0 || vendorList?.length !== 0) /* || showSendButton === PREDRAFT  */ || (dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll || disabledPartUid)))}
                                            />
                                        </Col>

                                        {ShowQuoteSubmissionDate(quotationType) && <Col md="3">
                                            <div className="inputbox date-section">
                                                <div className="form-group">
                                                    <label>Quote Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            id="submissionDate_container"
                                                            name={'SubmissionDate'}
                                                            placeholder={'Select'}
                                                            //selected={submissionDate}
                                                            selected={DayTime(submissionDate).isValid() ? new Date(submissionDate) : ''}
                                                            onChange={handleSubmissionDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            minDate={new Date()}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            mandatory={true}
                                                            errors={errors.SubmissionDate}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={dataProps?.isEditFlag ? !isEditSubmissionDate : dataProps?.isViewFlag ? true : false || disabledPartUid}
                                                        />
                                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>}
                                    </Row>

                                    {(selectedOption === 'componentAssembly' || selectedOption === 'Tooling') && <>
                                        {heading()}
                                        <Row className="part-detail-wrapper">
                                            {havellsKey && <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={`Part Type`}
                                                    name={"PartType"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    defaultValue={partType.length !== 0 ? partType : ""}
                                                    options={renderListing('PartType')}
                                                    mandatory={true}
                                                    handleChange={handlePartTypeChange}
                                                    errors={errors.Part}
                                                    disabled={Object.keys(prNumber).length !== 0 || (dataProps?.isViewFlag) ? true : false || (technology.length === 0) ? true : false || updateButtonPartNoTable || disabledPartUid}
                                                />
                                            </Col>}

                                            <Col md="3" className='d-flex align-items-center' >

                                                <AsyncSearchableSelectHookForm
                                                    label={`${selectedOption === TOOLING ? 'Tool' : 'Part'} No`}
                                                    name={"partNumber"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                                    mandatory={true}
                                                    handleChange={(newValue) => handlePartNoChange(newValue)}
                                                    errors={errors.partNumber}
                                                    disabled={Object.keys(prNumber).length !== 0 || disabledPartUid || (dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || updateButtonPartNoTable}
                                                    isLoading={plantLoaderObj}
                                                    asyncOptions={(inputValue) => partFilterList(inputValue, partTypeforRM)}
                                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                />

                                                {partType.length !== 0 && partTypeforRM !== BoughtOutPart && (
                                                    <>
                                                        <TooltipCustom id="addComponentSpecification" disabledIcon={true} tooltipText="Click on the + button to start inputting Specification, RM details, and mandatory attachments." />
                                                        <Button id="addComponentSpecification" className={"ml-2 mb-2"}
                                                            // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}
                                                            variant={updateButtonPartNoTable ? 'Edit' : 'plus-icon-square'}
                                                            title={updateButtonPartNoTable ? 'Edit' : 'Add'} onClick={DrawerToggle} disabled={partName?.length === 0 || disabledPartUid}></Button>
                                                    </>

                                                )}
                                            </Col>
                                            {havellsKey && <Col md="3">
                                                <TextFieldHookForm
                                                    // title={titleObj.descriptionTitle}
                                                    label={selectedOption === TOOLING ? 'Assembly/Tool Description' : 'Assembly/Part Description'}

                                                    name={'Description'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Description}
                                                    disabled={true}
                                                    placeholder="-"
                                                />
                                            </Col>

                                            }

                                            {havellsKey && quotationType !== 'Tooling' && <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Havells Design part /Proprietary part"}
                                                    name={"HavellsDesignPart"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    // defaultValue={partType.length !== 0 ? partType : ""}
                                                    options={havellsPartTypeList}
                                                    mandatory={true}
                                                    handleChange={(value) => handleHavellsDesignPart(value)}
                                                    //handleChange={handlePartTypeChange}
                                                    errors={errors.Part}
                                                    disabled={(dataProps?.isViewFlag) ? true : false || updateButtonPartNoTable || disabledPartUid}
                                                />
                                            </Col>}
                                        </Row>
                                    </>}
                                    {loader && <LoaderCustom customClass="Rfq-Loader" />}
                                    {quotationType === 'Raw Material' && <AddRfqRmDetails updateRawMaterialList={updateRawMaterialList} resetRmFields={resetRmFields} rmSpecificRowData={rmSpecificRowData} updateButtonPartNoTable={updateButtonPartNoTable} dataProps={dataProps} isEditFlag={editQuotationPart} isViewFlag={viewQuotationPart} setViewQuotationPart={setViewQuotationPart} disabledPartUid={disabledPartUid} technology={technology} setDisabled={setDisabled} isDisabled={isDisabled} heading={heading} dataProp={dataProps} resetDrawer={resetDrawer} />}
                                    <Row>

                                        {quotationType === "Bought Out Part" && <RaiseRfqBopDetails updateButtonPartNoTable={updateButtonPartNoTable} dataProps={dataProps} isEditFlag={editQuotationPart} isViewFlag={viewQuotationPart} setViewQuotationPart={setViewQuotationPart} updateBopList={updateBopList} resetBopFields={resetBopFields} plant={plant} prNumber={prNumber} disabledPartUid={disabledPartUid} heading={heading} dataProp={dataProps} resetDrawer={resetDrawer} />}

                                        {!havellsKey && (
                                            checkForNull(technology?.value) !== LOGISTICS && (
                                                <>
                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            label="RM Name"
                                                            name={"RMName"}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            selected={rmName ? rmName : ''}
                                                            rules={{ required: false }}
                                                            register={register}
                                                            customClassName="costing-version"
                                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                                            options={renderListingRM('rmname')}
                                                            mandatory={false}
                                                            handleChange={(newValue) => handleRMName(newValue)}
                                                            disabled={(dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                                        // errors={`${indexInside} CostingVersion`}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            label="RM Grade"
                                                            name={"RMGrade"}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            selected={rmgrade ? rmgrade : ''}
                                                            rules={{ required: false }}
                                                            register={register}
                                                            customClassName="costing-version"
                                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                                            options={renderListingRM('rmgrade')}
                                                            mandatory={rmNameSelected}
                                                            handleChange={(newValue) => handleRMGrade(newValue)}
                                                            disabled={(dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                                        // errors={`${indexInside} CostingVersion`}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            label="RM Specification"
                                                            name={"RMSpecification"}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            selected={rmspecification ? rmspecification : ''}
                                                            rules={{ required: false }}
                                                            register={register}
                                                            customClassName="costing-version"
                                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                                            options={renderListingRM('rmspecification')}
                                                            mandatory={rmNameSelected}
                                                            handleChange={(newValue) => handleRMSpecification(newValue)}
                                                            disabled={(dataProps?.isAddFlag ? partNoDisable || isNFRFlow : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                                        // errors={`${indexInside} CostingVersion`}
                                                        />
                                                    </Col>
                                                </>))}

                                        <Col md={12}>
                                            {/* {selectedOption !== "BOP" && ( */}

                                            <Row>

                                                {UOMSelectList && havellsKey &&


                                                    <Col md="3">
                                                        <SearchableSelectHookForm
                                                            label={"UOM"}
                                                            name={'UOM'}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            rules={{ required: false }}
                                                            register={register}
                                                            customClassName="costing-version"
                                                            options={renderListing("UOM")}
                                                            mandatory={true}
                                                            handleChange={(newValue) => handleChangeUOM(newValue)}
                                                            errors={errors?.UOM}
                                                            disabled={disableUOMFiled}
                                                        //Object.keys(prNumber).length !== 0 || (dataProps?.isViewFlag) ? true : false || disabledPartUid
                                                        />
                                                    </Col>
                                                }
                                                {havellsKey && (selectedOption === 'componentAssembly') &&


                                                    <Col md="3">
                                                        <TextFieldHookForm
                                                            // title={titleObj.descriptionTitle}
                                                            label="Target Price"
                                                            name={'TargetPrice'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            rules={{ required: false }}
                                                            mandatory={false}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            errors={errors.TargetPrice}
                                                            disabled={true}
                                                            placeholder="-"
                                                        />
                                                    </Col>
                                                }

                                                <Col md="3">
                                                    <div className="inputbox date-section h-auto">
                                                        <div className="form-group">

                                                            <label>{selectedOption === TOOLING ? 'Delivery Date' : "N-100 Timeline"}<span className="asterisk-required">*</span></label>
                                                            {selectedOption !== TOOLING && <TooltipCustom id="timeline" tooltipText="Part Rediness timeline for Quality, N-10 & N-100" />}
                                                            <div id="addRFQDate_container" className="inputbox date-section">
                                                                <DatePicker

                                                                    name={'RequirementDate'}
                                                                    placeholder={'Select'}
                                                                    //selected={submissionDate}
                                                                    selected={DayTime(requirementDate).isValid() ? new Date(requirementDate) : ''}
                                                                    onChange={handleRequirementDateChange}
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode='select'
                                                                    minDate={new Date()}
                                                                    dateFormat="dd/MM/yyyy"
                                                                    placeholderText="Select date"
                                                                    className="withBorder"
                                                                    autoComplete={"off"}
                                                                    mandatory={true}
                                                                    disabled={selectedOption === 'Tooling' ? true : Object.keys(prNumber).length !== 0 ? !updateButtonPartNoTable : (dataProps?.isViewFlag) ? true : false || disabledPartUid}
                                                                    errors={errors.RequirementDate}
                                                                    disabledKeyboardNavigation
                                                                    onChangeRaw={(e) => e.preventDefault()}
                                                                // disabled={dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)}
                                                                />
                                                                {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                </Col>



                                                <Col md="3" className='d-flex align-items-center pb-1'>
                                                    <button
                                                        id="add_part"
                                                        type="button"
                                                        className={'user-btn pull-left'}
                                                        onClick={() => addRowPartNoTable()}
                                                        disabled={dataProps?.isAddFlag ? ((!updateButtonPartNoTable && prNumber.length !== 0) ? true : false) : (dataProps?.isViewFlag || !isEditAll) || disabledPartUid}
                                                    >
                                                        <div className={'plus'}></div>{!updateButtonPartNoTable ? "ADD" : "UPDATE"}
                                                    </button>
                                                    <button
                                                        id="reset_part"
                                                        onClick={() => onResetPartNoTable()} // Need to change this cancel functionality
                                                        type="button"
                                                        value="CANCEL"
                                                        className="reset ml-2 mr5"
                                                        disabled={dataProps?.isAddFlag ? (!updateButtonPartNoTable && prNumber.length !== 0) : (dataProps?.isViewFlag || !isEditAll) || disabledPartUid}
                                                    >
                                                        <div className={''}></div>
                                                        RESET
                                                    </button>
                                                    {(false && checkForNull(technology?.value) === LOGISTICS) && <button
                                                        type="button"
                                                        className={"user-btn "}
                                                        onClick={bulkToggle}
                                                        title="Bulk Upload"
                                                        disabled={partNoDisable || disabledPartUid}
                                                    >
                                                        <div className={"upload mr-0"}></div>
                                                    </button>}
                                                </Col>
                                            </Row>
                                            {/* )} */}
                                        </Col>




                                        {/* <Col md="3">
                                            <NumberFieldHookForm
                                                label="Annual Forecast Quantity"
                                                name={"annualForecastQuantity"}
                                                errors={errors.annualForecastQuantity}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                disableErrorOverflow={true}
                                                mandatory={true}
                                                rules={{
                                                    required: false,
                                                    validate: { postiveNumber, maxLength10, nonZero }
                                                }}
                                                handleChange={() => { }}
                                                disabled={dataProps?.isViewFlag}
                                                placeholder={'Enter'}
                                                customClassName={'withBorder'}
                                            />
                                        </Col> */}

                                    </Row >

                                    <div className='rfq-part-list'>
                                        {/* {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"quantity-tooltip"} >{"To edit the quantity please double click on the field."}</Tooltip>} */}
                                        {!loader ? <div className={`ag-grid-react`}>
                                            <Row>
                                                <Col>
                                                    <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${partList && partList.length <= 0 ? "overlay-contain border" : ""} `}>

                                                        <div className={`ag-theme-material ${!state ? "custom-min-height-208px" : ''}`}>
                                                            {!showGrid || isLoader ? <LoaderCustom customClass={"bg-none"} /> :
                                                                <AgGridReact
                                                                    defaultColDef={defaultColDef}
                                                                    floatingFilter={false}
                                                                    domLayout='autoHeight'
                                                                    // columnDefs={c}
                                                                    rowData={selectedOption === "Raw Material" ? rmDataList : (selectedOption === "Bought Out Part" ? bopDataList : (selectedOption === "Tooling" ?
                                                                        toolingList
                                                                        : partList))}

                                                                    //pagination={true}
                                                                    paginationPageSize={10}
                                                                    onGridReady={onGridReady}
                                                                    gridOptions={gridOptionsPart}
                                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                    noRowsOverlayComponentParams={{
                                                                        title: EMPTY_DATA,
                                                                        imagClass: 'imagClass'
                                                                    }}
                                                                    frameworkComponents={frameworkComponents}
                                                                    stopEditingWhenCellsLoseFocus={true}
                                                                    suppressColumnVirtualisation={true}
                                                                    enableBrowserTooltips={true}
                                                                >
                                                                    {selectedOption === "Raw Material" && <AgGridColumn width={"230px"} field="RawMaterialName" headerName="Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    {selectedOption === "Raw Material" && <AgGridColumn width={"230px"} field="RawMaterialGrade" headerName="Grade" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    {selectedOption === "Raw Material" && <AgGridColumn width={"230px"} field="RawMaterialSpecification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    {selectedOption === "Raw Material" && <AgGridColumn width={"230px"} field="RawMaterialCode" headerName="Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    {selectedOption === "Tooling" && <AgGridColumn width={"230px"} field="PartType" headerName={`Part Type`} tooltipField="PartType" ></AgGridColumn>}

                                                                    {(selectedOption === "componentAssembly" || selectedOption === "Tooling") && <AgGridColumn width={"230px"} field="PartNumber" headerName={`${selectedOption === 'Tooling' ? 'Tool' : 'Part'} No`} tooltipField="PartNumber" cellRenderer={'partNumberFormatter'}></AgGridColumn>}
                                                                    {(selectedOption === "componentAssembly" || selectedOption === "Tooling") && <AgGridColumn width={"230px"} field="PartName" headerName={`${selectedOption === 'Tooling' ? 'Tool' : 'Part'} Description`} cellRenderer={'hyphenFormatter'}></AgGridColumn>}

                                                                    {/* {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMName" tooltipField="RMName" headerName="RM Name" cellClass={"colorWhite"}></AgGridColumn>}
                                                                    {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMGrade" headerName="RM Grade" cellClass={"colorWhite"}></AgGridColumn>}
                                                                    {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMSpecification" headerName="RM Specification" cellClass={"colorWhite"}></AgGridColumn>} */}
                                                                    {/* <AgGridColumn width={"230px"} field="YearName" headerName="Production Year" cellRenderer={'sopFormatter'}></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" headerComponent={'quantityHeader'} cellRenderer={'afcFormatter'} editable={EditableCallback} colId="Quantity"></AgGridColumn> */}
                                                                    <AgGridColumn width={"0px"} field="PartId" headerName="Part Id" hide={true} ></AgGridColumn>

                                                                    {(selectedOption === 'componentAssembly') && <AgGridColumn width={"230px"} field="TargetPrice" headerName="Target Price" cellRenderer={'hyphenFormatter'}></AgGridColumn>}

                                                                    {quotationType === "Bought Out Part" && <AgGridColumn width={"190px"} field="BoughtOutPartNumber" headerName="BOP No." cellRenderer={'hyphenFormatter'}></AgGridColumn>}

                                                                    {quotationType === "Bought Out Part" && <AgGridColumn width={"190px"} field="BoughtOutPartName" headerName="BOP Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>}

                                                                    {quotationType === "Bought Out Part" && <AgGridColumn width={"190px"} field="BoughtOutPartCategoryName" headerName="Category" cellRenderer={'hyphenFormatter'}></AgGridColumn>}


                                                                    {/* {(quotationType=== "BOP" || quotationType=== 'RM' || quotationType=== 'componentAssembly') && <AgGridColumn width={"190px"} field="UOM" cellClass="ag-grid-action-container" headerName="UOM" floatingFilter={false} type="" cellRenderer={'buttonFormatterFirst'}></AgGridColumn>} */}
                                                                    {selectedOption === "componentAssembly" && <AgGridColumn width={"230px"} field="HavellsDesignPart" headerName="Havells Design Part" ></AgGridColumn>}

                                                                    {<AgGridColumn width={"230px"} field="UOMSymbol" headerName="UOM" ></AgGridColumn>}

                                                                    <AgGridColumn width={"230px"} field="TimeLine" headerName={selectedOption === TOOLING ? 'Delivery Date' : "N-100 Timeline"} cellRenderer={'effectiveDateFormatter'} ></AgGridColumn>
                                                                    {(selectedOption === 'componentAssembly' || selectedOption === 'Raw Material' || selectedOption === "Bought Out Part") && <AgGridColumn width={"230px"} field="VendorListExisting" headerName="Existing Vendor" cellRenderer={'hyphenFormatter'}></AgGridColumn>}

                                                                    {(selectedOption === "componentAssembly" || selectedOption === 'Tooling') && (<AgGridColumn width={"230px"} field="PartId" cellClass="ag-grid-action-container text-right" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatterFirst'} />)}
                                                                    {selectedOption === "Raw Material" && (<AgGridColumn width={"230px"} field="RawMaterialChildId" cellClass="ag-grid-action-container text-right" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatterFirst'} />)}
                                                                    {selectedOption === "Bought Out Part" && (<AgGridColumn width={"230px"} field="BoughtOutPartChildId" cellClass="ag-grid-action-container text-right" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatterFirst'} />)}

                                                                </AgGridReact>
                                                            }
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row >
                                        </div > : <div>
                                            <LoaderCustom />
                                        </div>
                                        }
                                    </div >

                                    {/* BOP Comp */}
                                    {/* <RaiseRfqBopDetails/> */}



                                    {!showVendorSection && (<>
                                        <HeaderTitle title={'Vendor:'} customClass="mt-4" />
                                        <Row className="mt-1 part-detail-wrapper">
                                            <Col md="3">
                                                <AsyncSearchableSelectHookForm
                                                    label={"Vendor (Code)"}
                                                    name={"vendor"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    defaultValue={vendor.length !== 0 ? vendor : ""}
                                                    options={renderListing("vendor")}
                                                    mandatory={true}
                                                    handleChange={handleVendorChange}
                                                    // handleChange={() => { }}
                                                    errors={errors.vendor}
                                                    isLoading={VendorLoaderObj}
                                                    asyncOptions={vendorFilterList}
                                                    disabled={(dataProps?.isViewFlag) ? true : false || isDropdownDisabled || disabledVendoUi}
                                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                />
                                            </Col>
                                            {IsSendQuotationToPointOfContact() && (
                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        label={"Vendor's Point of Contact"}
                                                        name={"contactPerson"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: false }}
                                                        register={register}
                                                        //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                                        options={renderListing("reporter")}
                                                        mandatory={true}
                                                        // handleChange={handleDestinationPlantChange}
                                                        handleChange={() => { }}
                                                        errors={errors.contactPerson}
                                                        disabled={disabledVendoUi ? true : dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                                        isLoading={plantLoaderObj}
                                                    />
                                                </Col>
                                            )}

                                            {havellsKey && (<>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        // title={titleObj.descriptionTitle}
                                                        label="Inco Terms"
                                                        name={'IncoTerms'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        rules={{ required: false }}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.IncoTerms}
                                                        disabled={true}
                                                        placeholder="-"
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        // title={titleObj.descriptionTitle}
                                                        label="Payment Terms"
                                                        name={'PaymentTerms'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        rules={{ required: false }}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.PaymentTerms}
                                                        disabled={true}
                                                        placeholder="-"
                                                    />
                                                </Col>
                                                {ShowLdClause(selectedOption) && (
                                                    <Col md="3">
                                                        <TextFieldHookForm
                                                            // title={titleObj.descriptionTitle}
                                                            label="LD Clause"
                                                            name={'LDClause'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            rules={{
                                                                required: true,
                                                                maxLength: 250
                                                            }}
                                                            mandatory={selectedOption === TOOLING ? true : false}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            errors={errors.LDClause}
                                                            disabled={(dataProps?.isViewFlag) ? true : false || disabledVendoUi}

                                                        />
                                                    </Col>
                                                )}
                                            </>)
                                            }
                                            <Col md="3" className='d-flex align-items-center pb-1'>
                                                <button
                                                    id="add_vendor"
                                                    type="button"
                                                    className={'user-btn pull-left'}
                                                    onClick={() => addRowVendorTable()}
                                                    disabled={disabledVendoUi ? true : dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                                >
                                                    <div className={'plus'}></div>{!updateButtonVendorTable ? "ADD" : "UPDATE"}
                                                </button>

                                                <button
                                                    id="reset_vendor"
                                                    onClick={onResetVendorTable} // Need to change this cancel functionality
                                                    type="button"
                                                    value="CANCEL"
                                                    className="reset ml-2"
                                                    disabled={disabledVendoUi ? true : dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                                >
                                                    <div className={''}></div>
                                                    RESET
                                                </button>
                                            </Col>
                                        </Row >


                                        <div>
                                            {!loader ? <div className={`ag-grid-react`}>
                                                <Row>
                                                    <Col>
                                                        <div className={`ag-grid-wrapper height-width-wrapper ${vendorList && vendorList.length <= 0 ? "overlay-contain non-filter border" : ""} `}>

                                                            <div className={`ag-theme-material  max-loader-height`}>
                                                                <AgGridReact
                                                                    defaultColDef={defaultColDef}
                                                                    //floatingFilter={true}
                                                                    domLayout='autoHeight'
                                                                    // columnDefs={c}
                                                                    rowData={vendorList}
                                                                    //pagination={true}
                                                                    paginationPageSize={10}
                                                                    onGridReady={onGridReady}
                                                                    gridOptions={gridOptionsVendor}
                                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                    noRowsOverlayComponentParams={{
                                                                        title: EMPTY_DATA,
                                                                        imagClass: 'imagClass mt-0'
                                                                    }}
                                                                    frameworkComponents={frameworkComponents}
                                                                >
                                                                    <AgGridColumn field="Vendor" headerName="Vendor (Code)" tooltipField="Vendor"></AgGridColumn>
                                                                    {IsSendQuotationToPointOfContact() && (
                                                                        <AgGridColumn width={"270px"} field="ContactPerson" headerName="Point of Contact" ></AgGridColumn>)}
                                                                    {vendorList && havellsKey && <AgGridColumn field='IncoTerms' header='Inco Terms' cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    {vendorList && havellsKey && <AgGridColumn field='PaymentTerms' header='Payment Terms' cellRenderer={'hyphenFormatter'} ></AgGridColumn>}
                                                                    {vendorList && havellsKey && ShowLdClause(selectedOption) && <AgGridColumn field='LDClause' header='LD Clause' tooltipField="LDClause" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                    <AgGridColumn width={"270px"} field="VendorId" headerName="Vendor Id" hide={true} ></AgGridColumn>
                                                                    <AgGridColumn width={"180px"} field="VendorId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatterVendorTable'}></AgGridColumn>
                                                                </AgGridReact>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div> : <div>
                                                <LoaderCustom />
                                            </div>
                                            }
                                        </div>

                                        <Row className="mt-3 conditional-date">
                                            <Col md="2">
                                                < div id="checkbox_container" className="custom-check1 visibility-container">
                                                    <label
                                                        className="custom-checkbox mb-0"
                                                        onChange={() => checkBoxHandler()}
                                                    >
                                                        {'Visibility of Price'}
                                                        <input
                                                            type="checkbox"
                                                            value={"All"}
                                                            checked={isConditionalVisible}

                                                            disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                        />

                                                        <span className=" before-box"
                                                            checked={isConditionalVisible}
                                                        />
                                                    </label>
                                                    <span className="asterisk-required">*</span>

                                                </div>
                                            </Col>
                                            {(isConditionalVisible && dataProps) &&
                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        label={"Visibility Mode"}
                                                        name={"VisibilityMode"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: true }}
                                                        register={register}
                                                        // defaultValue={vendor.length !== 0 ? vendor : ""}
                                                        options={visibilityModeDropdownArray}
                                                        mandatory={true}
                                                        handleChange={handleVisibilityMode}
                                                        errors={errors.VisibilityMode}
                                                        isLoading={VendorLoaderObj}
                                                        disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                    />
                                                </Col>

                                            }
                                            {isConditionalVisible &&
                                                <Col md="3">
                                                    {visibilityMode?.value === DATE_STRING && <div className="inputbox date-section">
                                                        <div className="form-group">
                                                            <label>Date & Time</label>
                                                            <div className="inputbox date-section rfq-calendar">
                                                                <DatePicker
                                                                    name="startPlanDate"
                                                                    selected={DayTime(dateAndTime).isValid() ? new Date(dateAndTime) : null}
                                                                    onChange={handleChangeDateAndTime}
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode='select'
                                                                    minDate={new Date()}
                                                                    timeFormat='HH:mm'
                                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                                    minTime={setHours(setMinutes(new Date(), minMinutes), minHours)}
                                                                    maxTime={setHours(setMinutes(new Date(), 59), 23)}
                                                                    placeholderText="Select"
                                                                    className="withBorder "
                                                                    autoComplete={'off'}
                                                                    showTimeSelect={true}
                                                                    timeIntervals={1}
                                                                    errors={errors.startPlanDate}
                                                                    disabledKeyboardNavigation
                                                                    onChangeRaw={(e) => e.preventDefault()}
                                                                    disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    {visibilityMode?.value === DURATION_STRING && <div className="inputbox date-section">
                                                        <div className="form-group">
                                                            <label>Time</label>
                                                            <div className="inputbox date-section">
                                                                {/* <DatePicker
                                                                name="startPlanDate"
                                                                selected={time}
                                                                showTimeInput
                                                                timeFormat='HH:mm'
                                                                showTimeSelectOnly                                                    
                                                                placeholderText="Select"
                                                                onChange={handleChangeTime}
                                                                disabledKeyboardNavigation
                                                                className="withBorder"
                                                                autoComplete={'off'}
                                                                dateFormat="HH:mm"
                                                            /> */}
                                                                <TextFieldHookForm
                                                                    label=""
                                                                    name={'Time'}
                                                                    selected={'00:00'}
                                                                    Controller={Controller}
                                                                    control={control}
                                                                    register={register}
                                                                    rules={{
                                                                        required: false,
                                                                        pattern: {
                                                                            value: /^([0-9]*):([0-5]?[0-9])$/i,
                                                                            message: 'Hours should be in hh:mm format.',
                                                                        },
                                                                    }}
                                                                    mandatory={false}
                                                                    handleChange={() => { }}
                                                                    defaultValue={''}
                                                                    className=""
                                                                    customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                                                    errors={errors.Time}
                                                                    disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>}
                                                </Col>
                                            }

                                        </Row>


                                        <HeaderTitle title={'Notes:'} customClass="mt-3" />
                                        <Row className='part-detail-wrapper'>
                                            <Col md="4">
                                                <TextAreaHookForm
                                                    label={"Notes"}
                                                    name={"remark"}
                                                    // placeholder={"Select"}
                                                    placeholder={isViewFlag ? '-' : "Type here..."}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{
                                                        required: true,
                                                        maxLength: REMARKMAXLENGTH,
                                                    }}
                                                    register={register}
                                                    //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                                    // options={renderListing("DestinationPlant")}
                                                    mandatory={true}
                                                    customClassName={"withBorder"}
                                                    handleChange={() => { }}
                                                    errors={errors.remark}
                                                    disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                    rowHeight={6}
                                                // isLoading={plantLoaderObj}
                                                />
                                            </Col>
                                            <Col md="4" className="height152-label">
                                                <TooltipCustom id="uploadFile" tooltipText="Upload upto 4 file, size of each file upto 20MB" />

                                                <label>Upload Attachment (upload up to 4 files){/* <span className="asterisk-required"></span> */}</label>
                                                <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                                    Maximum file upload limit has been reached.
                                                </div>
                                                <div id="addRFQ_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                                    <Dropzone
                                                        ref={dropzone}
                                                        onChangeStatus={handleChangeStatus}
                                                        PreviewComponent={Preview}
                                                        //onSubmit={this.handleSubmit}
                                                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx,.zip, .docx,.pptx"
                                                        initialFiles={[]}
                                                        maxFiles={4}
                                                        maxSizeBytes={20000000}  // 20 MB in bytes
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
                                                        disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md="4" className=' p-relative'>
                                                <div className={"attachment-wrapper"}>
                                                    {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                                    {files &&
                                                        files.map((f) => {
                                                            const withOutTild = f.FileURL?.replace("~", "");
                                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                                            return (
                                                                <div className={"attachment images"}>
                                                                    <a href={fileURL} target="_blank" rel="noreferrer">
                                                                        {f.OriginalFileName}
                                                                    </a>
                                                                    {
                                                                        !isViewFlag &&
                                                                        <img
                                                                            alt={""}
                                                                            className="float-right"
                                                                            onClick={() => deleteFile(f.FileId, f.FileName)}
                                                                            src={redcrossImg}
                                                                        ></img>
                                                                    }
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </Col>
                                        </Row>
                                    </>)}
                                    <Row className="justify-content-between sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">

                                        <div className="col-sm-12 text-right bluefooter-butn">
                                            <button
                                                id="addRFQ_cancel"
                                                type={"button"}
                                                className="reset mr-2 cancel-btn"
                                                onClick={cancel}
                                            >
                                                <div className={"cancel-icon"}></div>
                                                {"Cancel"}
                                            </button>
                                            {reviewButtonPermission && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="submit-button save-btn mr-2"
                                                        value="save"
                                                        id="Return_RFQ_for_Review"
                                                        onClick={(data, e) => handleReviewButtonClick(data, e, false)}
                                                        disabled={isViewFlag}
                                                    >
                                                        <div className={"review-icon"}></div>
                                                        {"Send for Review"}
                                                    </button>
                                                </>
                                            )}


                                            {
                                                <button type="button" className="submit-button save-btn mr-2" value="save"
                                                    // {!dataProps?.rowData?.IsSent && <button type="button" className="submit-button save-btn mr-2" value="save"     //RE
                                                    id="addRFQ_save"
                                                    onClick={(data, e) => handleSubmitClick(data, e, false)}
                                                    disabled={isViewFlag || showSendButton === PREDRAFT && disabledPartUid}>
                                                    <div className={"save-icon"}></div>
                                                    {"Save"}
                                                </button>
                                            }

                                            {!isDropdownDisabled && <button type="button" className="submit-button save-btn" value="send"
                                                id="addRFQ_send"
                                                onClick={(data, e) => handleSubmitClick(data, e, true)}
                                                disabled={isViewFlag || (showSendButton === PREDRAFT && disabledPartUid)}>
                                                <div className="send-for-approval mr-1"></div>
                                                {"Send"}
                                            </button>}
                                        </div >
                                    </Row >
                                </form >

                                {
                                    isBulkUpload && (
                                        <BulkUpload
                                            isOpen={isBulkUpload}
                                            closeDrawer={closeBulkUploadDrawer}
                                            isEditFlag={false}
                                            // densityAlert={densityAlert}
                                            fileName={"ADD RFQ"}
                                            messageLabel={"RFQ Part's"}
                                            anchor={"right"}
                                            technologyId={technology}
                                        // isFinalApprovar={isFinalLevelUser}
                                        />
                                    )
                                }
                                {
                                    drawerOpen &&
                                    (
                                        <ProcessDrawer
                                            isOpen={drawerOpen}
                                            anchor={"right"}
                                            closeDrawer={closeDrawer}
                                            isEditFlag={editQuotationPart}
                                            dataProp={dataProps}
                                            technology={technology}
                                            nfrId={nfrId}
                                            partName={partName}
                                            AssemblyPartNumber={assemblyPartNumber}
                                            type={partTypeforRM}
                                            tableData={tableData}
                                            setTableData={setTableData}
                                            specificationList={specificationList}
                                            setSpecificationList={setSpecificationList}
                                            setChildPartFiles={setChildPartFiles}
                                            childPartFiles={childPartFiles}
                                            setRemark={setRemark}
                                            remark={remark}
                                            partType={getPartType(selectedOption)}
                                            isViewFlag={viewQuotationPart}
                                            partListData={partList}
                                            setViewQuotationPart={setViewQuotationPart}
                                            addRowPartNoTable={addRowPartNoTable}
                                            setSopQuantityList={setSopQuantityList}
                                            sopQuantityList={sopQuantityList}
                                            sopdate={sopdate}
                                            setSOPDate={setSOPDate}
                                            effectiveMinDate={effectiveMinDate}
                                            quotationType={selectedOption}
                                            rmSpecificRowData={rmSpecificRowData}
                                            drawerViewMode={drawerViewMode}
                                            handleDrawer={handleDrawer}
                                            resetDrawer={resetDrawer}
                                        />
                                    )
                                }


                            </div>
                        </div >
                    </div >
                </div >
            </div >
            {
                showPopup && <PopupMsgWrapper disablePopup={alreadyInDeviation} vendorId={vendorId}
                    plantId={plantId} redirectPath={blocked ? "/initiate-unblocking" : ""} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={blocked ? `${popupMessage}` : `${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
            {isOpenVisualDrawer && (
                <BOMViewer
                    isOpen={isOpenVisualDrawer}
                    closeDrawer={closeVisualDrawer}
                    isEditFlag={true}
                    PartId={visualAdId}
                    anchor={"right"}
                    isFromVishualAd={true}
                    NewAddedLevelOneChilds={[]}
                />
            )}
            {remarkDrawer && (
                <RemarkFieldDrawer anchor={"right"} isOpen={remarkDrawer} cancelHandler={handleCloseReamrkDrawer} onSubmitHandler={sendQuotationForReviewHnadle} />
            )}

        </div >


    );
}

export default AddRfq