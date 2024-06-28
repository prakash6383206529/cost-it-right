import React, { useState, useEffect, useRef, useContext } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Tooltip } from 'reactstrap';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '.././layout/HookFormInputs'
import { getReporterList, getVendorNameByVendorSelectList, getPlantSelectListByType, fetchSpecificationDataAPI, getUOMSelectList } from '../.././actions/Common';
import { getCostingSpecificTechnology, getExistingCosting, getPartInfo, } from '../costing/actions/Costing'
import { IsSendQuotationToPointOfContact, addDays, checkPermission, getConfigurationKey, getTimeZone, loggedInUserId } from '../.././helper';
import { checkForNull, checkForDecimalAndNull } from '../.././helper/validation'
import { BOUGHTOUTPARTSPACING, BoughtOutPart, COMPONENT_PART, DRAFT, EMPTY_DATA, FILE_URL, PREDRAFT, PRODUCT_ID, RFQ, RFQVendor, VBC_VENDOR_TYPE, ZBC, searchCount } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation, fileUploadQuotation, getQuotationById, updateRfqQuotation, getContactPerson, checkExistCosting, setRFQBulkUpload, getNfrSelectList, getNfrAnnualForecastQuantity, getNFRRMList, getPartNFRRMList, checkLPSAndSCN, getrRqVendorDetails, getTargetPrice, setVendorDetails, getAssemblyChildpart, getRfqRaiseNumber, saveRfqPartDetails, getRfqPartDetails, deleteQuotationPartDetail, setRfqPartDetails, setQuotationIdForRfq } from './actions/rfq';
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
import { ASSEMBLY, AcceptableRMUOM, DATE_STRING, DURATION_STRING, LOGISTICS, REMARKMAXLENGTH, visibilityModeDropdownArray } from '../../config/masterData';
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

const gridOptionsPart = {}
const gridOptionsVendor = {}

function AddRfq(props) {
    const permissions = useContext(ApplyPermission);

    const Vendor = permissions.permissionDataVendor


    const Part = permissions.permissionDataPart


    const dispatch = useDispatch()
    const { t } = useTranslation("Rfq")
    const { data: dataProps } = props


    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
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
    const { getRfqVendorDetail, getTargetprice, getPartIndentity, getQuotationIdForRFQ } = useSelector((state) => state.rfq)
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



    const [disabledVendoUi, setDisabledVendoUId] = useState(true)





    const isPartEffectiveDateValid = partEffectiveDate && new Date(partEffectiveDate).getTime() > new Date().getTime();
    const effectiveMinDate = isPartEffectiveDateValid ? new Date(partEffectiveDate) : new Date();
    let partIndex = ""
    useEffect(() => {
        if (dataProps?.isAddFlag) {
            const obj = createQuotationObject(null);
            dispatch(createRfqQuotation(obj, (res) => {
                setQuotationIdentity(res?.data?.Identity)
            }))
        }
    }, [])


    useEffect(() => {
        if (showSendButton === DRAFT) {
            setDisabledVendoUId((Vendor && (Vendor?.Add || Vendor?.Edit)) ? false : true)
        } else if (dataProps?.isAddFlag || showSendButton === PREDRAFT) {

            setDisabledPartUId((Part && (Part?.Add || Part?.Edit)) ? false : true)
        }
    }, [showSendButton, Vendor, Part])

    useEffect(() => {
        if (getTargetprice && getTargetprice?.TargetPrice) {
            setValue('TargetPrice', getTargetprice?.TargetPrice)
        }
    }, [getTargetprice])
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

    useEffect(() => {
        const filteredArray = selectedparts.filter((obj) => {
            return obj.value !== deleteToggle?.rowData?.PartId;
        });
        setSelectedParts(filteredArray)
    }, [deleteToggle])

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

                item.SOPQuantity.map((ele, ind) => {
                    let obj = {}
                    obj.PartNo = item.PartNumber
                    obj.PartId = item?.PartId
                    obj.Quantity = ele?.Quantity
                    obj.YearName = ele?.YearName
                    if (ind === 2) {
                        obj.PartNumber = item.PartNumber
                        obj.VendorListExisting = item.VendorList
                        obj.TargetPrice = item.TargetPrice
                        obj.UOM = item.UOMSymbol
                        obj.RequirementDate = item.TimeLine

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
                    partName: { label: item.PartNumber, value: item.PartId, RevisionNumber: item.RevisionNumber },
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
            let rmListTemp = listtt && listtt?.filter(item => item.IsRMAdded)
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

                // item.SOPQuantity.map((ele, ind) => {
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

    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getReporterList(() => { }))

        var newDate = addDays(new Date(), 7);
        setSubmissionDate(newDate)

        if (dataProps?.isEditFlag || dataProps?.isViewFlag) {
            setLoader(true)
            dispatch(getQuotationById(dataProps?.Id, (res) => {
                setPartNoDisable(false)

                if (res?.data?.Data) {
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
                    setVendorList(data.VendorList)
                    setValue("remark", data.Remark)
                    setValue("nfrId", { label: data?.NfrNumber, value: data?.NfrId })
                    setNfrId({ label: data?.NfrNumber, value: data?.NfrId })
                    setData(data)
                    setIsNFRFlow(data?.NfrId ? true : false)
                }
                setTimeout(() => {
                    setLoader(false)
                }, 100);
            })
            )
        }
    }, [])


    const deleteFile = (FileId, OriginalFileName) => {
        if (dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll) {
            return false
        }
        if (FileId != null) {
            let tempArr = files.filter((item) => item.FileId !== FileId)
            setFiles(tempArr);
            setIsOpen(!IsOpen)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
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
            let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
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
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
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
            Toaster.success('Part has been deleted successfully')
        }))
        let arr = final && final.filter(item => item.PartId !== rowData?.PartId)

        setPartList(arr)
        setDeleteToggle({ deleteToggle: !deleteToggle, rowData: rowData })


        onResetPartNoTable()
    }
    const editItemPartTable = (rowData, final, viewMode) => {

        partIndex = final?.rowIndex


        setUpdateButtonPartNoTable(true)
        setTimeout(() => {


            setValue('partNumber', { label: rowData?.PartNumber, value: rowData?.PartId })
            setValue('PartType', { label: rowData?.PartType, value: rowData?.PartTypeId })
            setValue('HavellsDesignPart', { label: rowData?.HavellsDesignPart, value: rowData?.HavellsDesignPartId })
            setValue('UOM', { label: rowData?.UOM, value: rowData?.UOMId })
            setValue('Description', rowData?.Description)
            setPartType({ label: rowData?.PartType, value: rowData?.PartTypeId })
            setPartName({ label: rowData?.PartNumber, value: rowData?.PartId })
            setRequirementDate(rowData?.TimeLine || '')
            setAssemblyPartNumber({ label: rowData?.PartNumber, value: rowData?.PartId })
        }, 200);


        // setValue('uom', { label: rowData[0]?.Uom, value: rowData[0]?.UomId })
        dispatch(getRfqPartDetails(rowData?.QuotationPartId, res => {
            const PartList = res?.data?.Data?.PartList
            setStorePartsDetail(PartList)


        }))
        setEditQuotationPart(viewMode)
        //setDrawerOpen(true)

    }
    const ViewItemPartTable = (rowData, final, viewMode) => {

        setViewQuotationPart(true)
        dispatch(getRfqPartDetails(rowData?.QuotationPartId, res => { }))
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

        setSelectedVendorTable(props.node.data)

        setUpdateButtonVendorTable(true)
        setValue('vendor', { label: props?.node?.data?.Vendor, value: props?.node?.data?.VendorId })
        setValue('contactPerson', {
            label: props?.node?.data?.ContactPerson
            , value: props?.node?.data?.ContactPersonId

        })
        setValue('LDClause', props?.node?.data?.LDClause)

    }
    function createQuotationObject(isSent, quotationId, IsPartDetailsSent) {
        return {
            QuotationId: getQuotationIdForRFQ ? getQuotationIdForRFQ : null,
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
                const accept = AcceptableRMUOM.includes(item.Type)
                if (accept === false) return false
                if (item.Value === '0') return false
                temp.push({ label: item.Display, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'nfrId') {
            nfrSelectList && nfrSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'reporter') {

            getReporterListDropDown && getReporterListDropDown.map(item => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp;
        }
        if (label === 'PartType') {
            partTypeList && partTypeList.map((item) => {

                if (item.Value === '0') return false
                if (item.Value === PRODUCT_ID) return false
                if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured && item.Text === BOUGHTOUTPARTSPACING) return false
                if (String(technology?.value) === String(ASSEMBLY) && ((item.Text === COMPONENT_PART) || (item.Text === BOUGHTOUTPARTSPACING))) return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const handleSubmitClick = (data, e, isPartDetailSent) => {

        //handleSubmit(() => onSubmit(data, e, isSent))()
        onSubmit(data, e, isPartDetailSent)
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.closeDrawer('', {})
        dispatch(setQuotationIdForRfq(""))
    }

    const onSubmit = (data, e, isPartDetailSent) => {

        //dispatch(getTargetPrice(plant, technology, assemblyPartNumber, (res) => { }))
        // dispatch(getRfqPartDetails( (res) => {
        //const quotationPartIds = res?.data?.Data.map(item => item.QuotationPartId);
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
        const IsPartDetailsSent = isPartDetailSent && partList && partList.length > 0
        const isSent = partList && vendorList && partList.length > 0 && vendorList.length > 0 ? true : false



        const obj = createQuotationObject(isSent, quotationIdentity, IsPartDetailsSent);

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
                dispatch(setQuotationIdForRfq(""))
                if (!(dataProps?.rowData?.Status === DRAFT) || !(dataProps?.rowData?.Status === PREDRAFT)) {
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


    const buttonFormatterFirst = (props) => {

        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;


        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        let show = (rowData?.PartNumber === undefined) ? false : true
        const row = props?.data;


        return (
            <>
                {show && < button title='Edit' className="Edit mr-2 align-middle" disabled={showSendButton === DRAFT ? true : dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} type={'button'} onClick={() => editItemPartTable(rowData, props, true)} />}
                {show && < button title='View' className="View mr-2 align-middle" disabled={false} type={'button'} onClick={() => ViewItemPartTable(rowData, props, false)} />}

                {/*  {<button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !dataProps?.isEditFlag)} type={'button'} onClick={() => deleteItemPartTable(final, props)} />} */}
                {show && <button title='Delete' className="Delete align-middle" disabled={showSendButton === DRAFT ? true : dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} type={'button'} onClick={() => deleteItemPartTable(row, final)} />}
            </>
        )
    };

    const buttonFormatterVendorTable = (props) => {
        return (
            <>
                {<button title='Edit' className="Edit mr-2 align-middle" type={'button'} disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} onClick={() => editItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button title='Delete' className="Delete align-middle" type={'button'} disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} onClick={() => deleteItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };
    const addRowVendorTable = () => {
        let isDuplicateEntry = false
        let data = {}
        let temp = []
        partList && partList.map((item) => {
            temp.push(item.PartId)
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
                            if (item.VendorId === obj.VendorId) {
                                isDuplicateEntry = true
                            }
                            return null
                        })
                    }

                    if (isDuplicateEntry) {
                        Toaster.warning("This vendor is already added.")
                        return false;
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
                            if (item.VendorId === obj.VendorId) {
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


    const addRowPartNoTable = () => {

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
                    newObjTemp.UOMId = getValues('UOM')?.value;
                    newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0;
                    newObjTemp.TimeLine = requirementDate.split(' ')[0] || '';
                    newObjTemp.PartType = getValues('PartType')?.label;
                    newObjTemp.PartTypeId = getValues('PartType')?.value;
                    newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label;
                    newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value;
                    newObjTemp.Description = getValues('Description');

                    arrTemp.push(newObjTemp);  // Push the new object to the array

                    let dataList = [...arrTemp]
                    list[list.length - 1].RmList && list[list.length - 1].RmList?.map((item, index) => {

                        let obj = arrTemp[index] ?? {}
                        obj.RMGrade = item.RawMaterialGrade
                        obj.RawMaterialGradeId = item.RawMaterialGradeId
                        obj.RMName = item.RawMaterialName
                        obj.RawMaterialChildId = item.RawMaterialChildId
                        obj.RMSpecification = item.RawMaterialSpecification
                        obj.RawMaterialSpecificationId = item.RawMaterialSpecificationId

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
            let objTemp = {};
            let arrTemp = [];
            let Data = {}
            const { label } = getValues('RMName') || {};
            const isRMGradeMissing = !getValues('RMGrade');
            const isRMSpecificationMissing = !getValues('RMSpecification');
            if (label !== undefined && (isRMGradeMissing || isRMSpecificationMissing)) {
                const missingRequirements = [];
                if (isRMGradeMissing) {
                    missingRequirements.push('RM Grade');
                }
                if (isRMSpecificationMissing) {
                    missingRequirements.push('RM Specification');
                }
                const message = `Please select ${missingRequirements.join(' and ')}`;
                Toaster.warning(message);
            } else if (getValues('HavellsDesignPart') === "") {
                Toaster.warning("Please select Havells Design part");
                return false;
            } else if (requirementDate === "") {
                Toaster.warning("Please select Requirement Date");
                return false;
            } else if (/* getTargetprice && Object.keys(getTargetprice).length === 0 */targetPrice === "" && havellsDesignPart === "Havells Design part") {
                Toaster.warning("ZBC costing approval is required for this plant to raise a quote.")
                return false
            } else {

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

                    newObjTemp.PartNumber = partNumber?.label;
                    newObjTemp.PartId = getValues('partNumber')?.value;
                    newObjTemp.UOM = getValues('UOM')?.label;
                    newObjTemp.UOMId = getValues('UOM')?.value;
                    newObjTemp.TargetPrice = getTargetprice?.TargetPrice || 0;
                    newObjTemp.TimeLine = requirementDate.split(' ')[0] || '';
                    newObjTemp.PartType = getValues('PartType')?.label;
                    newObjTemp.PartTypeId = getValues('PartType')?.value;
                    newObjTemp.HavellsDesignPart = getValues('HavellsDesignPart')?.label;
                    newObjTemp.HavellsDesignPartId = getValues('HavellsDesignPart')?.value;
                    newObjTemp.Description = getValues('Description');
                    newObjTemp.SOPQuantityDetails = sopQuantityList

                    arrTemp.push(newObjTemp);  // Push the new object to the array



                    //let dataList = [...arrTemp]

                    let arr = updateButtonPartNoTable
                        ? partList.map(item => item.PartId === getValues('partNumber')?.value ? { ...item, ...arrTemp[0] } : item)
                        : [...partList, ...arrTemp];






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
                    obj.TechnologyId = getValues('technology').value
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
                        // temppartObj.QuotationPartId = ""
                        temppartObj.PartType = partType?.label || ''
                        temppartObj.TargetPrice = getTargetprice?.TargetPrice || 0
                        temppartObj.TimeLine = requirementDate || "";
                        temppartObj.Remarks = remark || null
                        temppartObj.PartAttachments = childPartFiles || []
                        temppartObj.HavellsDesignPart = getValues('HavellsDesignPart')?.label || ''
                        temppartObj.UnitOfMeasurementId = getValues('UOM')?.value || ''
                        temppartObj.ExistingVendor = vendorList.join(',') || '';
                        temppartObj.Description = getValues('Description') || null
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
                            QuotationPartIdRef: temppartObj?.PartId || 0,
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
                                        childPartObj.PartAttachments = []
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

                    obj.PartList = updatedPartList; // Move this line inside the block
                    



                    //obj.PartList = updateButtonPartNoTable ? (isPartDetailUpdate ? temppartArr : storePartsDetail) : temppartArr







                    let updatedArr = []
                    // 



                    dispatch(saveRfqPartDetails(obj, (res) => {

                        if (res?.data?.Result) {
                            if (!updateButtonPartNoTable) {
                                Toaster.success('Part Details has been added successfully.');
                            } else {
                                Toaster.success('Part Details has been updated successfully.');
                            }

                            setPartIdentity(res?.data?.Identity);
                            // onResetPartNoTable();
                            // setTableData([]);
                            // setSpecificationList([]);
                            // 
                            // 
                            updatedArr = arr.map(obj => {
                                if (obj.PartId === assemblyPartNumber.value) {
                                    // 
                                    return { ...obj, QuotationPartId: res?.data?.Identity };
                                }
                                return obj;
                            });
                            // 

                            setPartList(updatedArr);
                        }
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
                        // setQuotationIdentity('');
                        setStorePartsDetail([]);
                        dispatch(clearGradeSelectList([]));
                        dispatch(clearSpecificationSelectList([]));
                        dispatch(setRfqPartDetails([]));
                        //dispatch(setQuotationIdForRfq(""))
                    }, 200)

                }));
            }
        }
    };

    const onResetPartNoTable = () => {
        setUpdateButtonPartNoTable(false)
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
        setRequirementDate("")
        setUpdateButtonPartNoTable(false);
        setEditQuotationPart(false)
        setTableData([]);
        setSpecificationList([]);
        setSopQuantityList([])
        setSOPDate('')
        setStorePartsDetail([]);

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
            setValue('partNumber', "")
            setPartName('')
            reactLocalStorage.setObject('PartData', [])
            dispatch(getPlantSelectListByType(ZBC, 'RFQ', newValue?.value, () => { }))
            setNfrId(newValue)
            setIsNFRFlow(true)
        } else {
            setNfrId(null)
            setIsNFRFlow(false)
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
        } else {
            setPartType([])
        }
        setPartName([])
        reactLocalStorage.setObject('PartData', [])
    }
    const handleVendorChange = (data) => {
        dispatch(getContactPerson(data.value, (res) => {
            setGetReporterListDropDown(res?.data?.SelectList)
            setValue('contactPerson', "")
        }))
        dispatch(getrRqVendorDetails(data.value, (res) => {
            const { PaymentTerms, IncoTerms, IncoTermIdRef, PaymentTermIdRef } = res?.data?.Data
            setValue('IncoTerms', IncoTerms)
            setValue('PaymentTerms', PaymentTerms)
        }))
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
                return element.value === item.value;
            });
        });
        return filteredArray
    }
    const handleHavellsDesignPart = (newValue) => {

        setHavellsDesignPart(newValue)
        if (updateButtonPartNoTable) {
            setStorePartsDetail((prevDetails) => {
                return prevDetails.map((item) => {
                    if (item.PartId === getValues('partNumber')?.value) {
                        return {
                            ...item,
                            UnitOfMeasurementId: getValues('UnitOfMeasurementId')?.value || null,
                            HavellsDesignPart: newValue?.label || "",
                            TimeLine: requirementDate || ""
                        };
                    } else {
                        return {
                            ...item,
                            UnitOfMeasurementId: null,
                            HavellsDesignPart: null,
                            TimeLine: null
                        };
                    }
                });
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
            isEnable = dataProps?.isAddFlag && props.data.isEdit ? true : dataProps?.isViewFlag ? false : isEditAll && props.data.isEdit ? true : false
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
        const value = row?.RevisionNumber ? (row?.PartNumber + ' (' + row?.RevisionNumber + ')') : (row?.PartNumber ? row?.PartNumber : '')
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
                return prevDetails?.map((item) => {
                    if (item.PartId === getValues('partNumber')?.value) {
                        return {
                            ...item,
                            UnitOfMeasurementId: getValues('UnitOfMeasurementId')?.value || null,
                            HavellsDesignPart: getValues('HavellsDesignPart')?.value || null,
                            TimeLine: DayTime(value).format('YYYY-MM-DD HH:mm:ss') || null
                        };
                    } else {
                        return {
                            ...item,
                            UnitOfMeasurementId: null,
                            HavellsDesignPart: null,
                            TimeLine: null
                        };
                    }
                });
            });
        }
    }

    const renderListingRM = (label) => {

        let opts1 = []
        if (label === 'rmname') {
            if (rawMaterialNameSelectList?.length > 0) {
                let opts = [...rawMaterialNameSelectList]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
                    opts1.push(item)
                    return null
                })
            }
        }
        if (label === 'rmgrade') {
            if (gradeSelectList?.length > 0) {
                let opts = [...gradeSelectList]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
                    opts1.push(item)
                    return null
                })
            }
        }

        if (label === 'rmspecification') {
            if (rmSpecification?.length > 0) {
                let opts = [...rmSpecification]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
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
    const handleChangeUOM = (newValue) => {
        setSelectedUOM(newValue)
        if (updateButtonPartNoTable) {
            setStorePartsDetail((prevDetails) => {
                return prevDetails.map((item) => {
                    if (item.PartId === getValues('partNumber')?.value) {
                        return {
                            ...item,
                            UnitOfMeasurementId: newValue?.value || null,
                            HavellsDesignPart: getValues('HavellsDesignPart')?.value || null,
                            TimeLine: requirementDate || ""
                        };
                    } else {
                        return {
                            ...item,
                            UnitOfMeasurementId: null,
                            HavellsDesignPart: null,
                            TimeLine: null
                        };
                    }
                });
            });
        }
    }
    const EditableCallback = (props) => {
        let value
        if (getValues('nfrId')) {
            value = dataProps?.isAddFlag && props.data.isEdit ? true : dataProps?.isViewFlag ? false : isEditAll && props.data.isEdit ? true : false
        } else {
            value = dataProps?.isAddFlag ? true : dataProps?.isViewFlag ? false : isEditAll ? true : false
        }

        return value
    }
    const DrawerToggle = () => {
        // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setDrawerOpen(true)
    }
    const closeDrawer = (e, isUpdate) => {

        setIsPartDeailUpdate(isUpdate)
        setDrawerOpen(false)
    }
    const handlePartNoChange = (value) => {

        setAssemblyPartNumber(value)
        dispatch(getPartInfo(value?.value, (res) => {

            setValue("Description", res.data?.Data?.Description);
            setPartEffectiveDate(res.data.Data?.EffectiveDate);
        }));
        dispatch(getTargetPrice(plant?.value, value?.value, Number(technology?.value), (res) => {
            const { TargetPrice } = res?.data?.Data;
            setTargetPrice(TargetPrice !== undefined ? TargetPrice : "");
        }));

    }


    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
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
            <div className="signup-form">
                <div className="row">
                    <div className="col-md-12">
                        <div className="shadow-lgg login-formg">
                            <div className="row">
                                <div className="col-md-6">
                                    <h3>{isViewFlag ? "View" : props?.isEditFlag ? "Update" : "Add"} RFQ
                                        {!isViewFlag && <TourWrapper
                                            buttonSpecificProp={{ id: "Add_Rfq_Form" }}
                                            stepsSpecificProp={{
                                                steps: Steps(t).RFQ_FORM
                                            }} />}
                                    </h3>
                                </div>
                            </div>
                            <div >
                                <form>
                                    <Row className="part-detail-wrapper">
                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"Technology"}
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
                                                disabled={((dataProps?.isViewFlag || isEditAll) ? true : false)
                                                    || (partList?.length !== 0 || vendorList?.length !== 0)}
                                            />
                                        </Col>
                                        {initialConfiguration.IsNFRConfigured && <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"NFR No."}
                                                name={"nfrId"}
                                                isClearable={true}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={nfrId?.length !== 0 ? nfrId : ""}
                                                options={renderListing("nfrId")}
                                                mandatory={false}
                                                handleChange={handleNfrChnage}
                                                errors={errors.nfrId}
                                                disabled={((dataProps?.isViewFlag || dataProps?.isEditFlag) ? true : false)
                                                    || (partList?.length !== 0)}
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
                                                disabled={(vendorList?.length !== 0 || (dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll || disabledPartUid)))}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <div className="inputbox date-section">
                                                <div className="form-group">
                                                    <label>Last Submission Date</label>
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
                                        </Col>
                                    </Row>
                                    <HeaderTitle title={'Part:'} />
                                    <Row className="part-detail-wrapper">
                                        {havellsKey && <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"Part Type"}
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
                                                disabled={(dataProps?.isViewFlag) ? true : false || (technology.length === 0) ? true : false || updateButtonPartNoTable || disabledPartUid}
                                            />
                                        </Col>}
                                        <Col md="3" className='d-flex align-items-center' >

                                            <AsyncSearchableSelectHookForm
                                                label={"Part No"}
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
                                                disabled={disabledPartUid || (dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || updateButtonPartNoTable}
                                                isLoading={plantLoaderObj}
                                                asyncOptions={(inputValue) => partFilterList(inputValue, partTypeforRM)}
                                                NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                            />
                                            {partType.length !== 0 && partTypeforRM !== BoughtOutPart && (
                                                <Button id="addRMSpecificatione" className={"ml-2 mb-2"}
                                                    // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}
                                                    variant={updateButtonPartNoTable ? 'Edit' : 'plus-icon-square'}
                                                    title={updateButtonPartNoTable ? 'Edit' : 'Add'} onClick={DrawerToggle} disabled={partName?.length === 0 || disabledPartUid}></Button>
                                            )}
                                        </Col>

                                        {havellsKey && <Col md="3">
                                            <TextFieldHookForm
                                                // title={titleObj.descriptionTitle}
                                                label="Assembly/Part Description"
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
                                        {havellsKey && <Col md="3">
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
                                                    mandatory={false}
                                                    handleChange={(newValue) => handleChangeUOM(newValue)}
                                                    errors={errors?.UOM}
                                                    disabled={(dataProps?.isViewFlag) ? true : false || disabledPartUid}
                                                />
                                            </Col>
                                        }
                                        {havellsKey &&


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
                                        {
                                            <Col md="3">
                                                <div className="inputbox date-section">
                                                    <div className="form-group">
                                                        <label>Requirement Timeline<span className="asterisk-required">*</span></label>
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
                                                                disabled={(dataProps?.isViewFlag) ? true : false || disabledPartUid}
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

                                        }

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
                                        <Col md="3" className='d-flex align-items-center pb-1'>
                                            <button
                                                id="add_part"
                                                type="button"
                                                className={'user-btn pull-left'}
                                                onClick={() => addRowPartNoTable()}
                                                disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll) || disabledPartUid}
                                            >
                                                <div className={'plus'}></div>{!updateButtonPartNoTable ? "ADD" : "UPDATE"}
                                            </button>
                                            <button
                                                id="reset_part"
                                                onClick={onResetPartNoTable} // Need to change this cancel functionality
                                                type="button"
                                                value="CANCEL"
                                                className="reset ml-2 mr5"
                                                disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll) || disabledPartUid}
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
                                    </Row >
                                    <div className='rfq-part-list'>
                                        {/* {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"quantity-tooltip"} >{"To edit the quantity please double click on the field."}</Tooltip>} */}
                                        {!loader ? <div className={`ag-grid-react`}>
                                            <Row>
                                                <Col>
                                                    <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${partList && partList.length <= 0 ? "overlay-contain border" : ""} `}>

                                                        <div className={`ag-theme-material ${!state ? "custom-min-height-208px" : ''}`}>
                                                            {!state ? <LoaderCustom customClass={""} /> :
                                                                <AgGridReact
                                                                    defaultColDef={defaultColDef}
                                                                    floatingFilter={false}
                                                                    domLayout='autoHeight'
                                                                    // columnDefs={c}
                                                                    rowData={partList}
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
                                                                    <AgGridColumn width={"230px"} field="PartNumber" headerName="Part No" tooltipField="PartNumber" cellRenderer={'partNumberFormatter'}></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="VendorListExisting" headerName="Existing Vendor" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                                    {/* {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMName" tooltipField="RMName" headerName="RM Name" cellClass={"colorWhite"}></AgGridColumn>}
                                                                    {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMGrade" headerName="RM Grade" cellClass={"colorWhite"}></AgGridColumn>}
                                                                    {checkForNull(technology?.value) !== LOGISTICS && <AgGridColumn width={"230px"} field="RMSpecification" headerName="RM Specification" cellClass={"colorWhite"}></AgGridColumn>} */}
                                                                    {/* <AgGridColumn width={"230px"} field="YearName" headerName="Production Year" cellRenderer={'sopFormatter'}></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" headerComponent={'quantityHeader'} cellRenderer={'afcFormatter'} editable={EditableCallback} colId="Quantity"></AgGridColumn> */}
                                                                    <AgGridColumn width={"0px"} field="PartId" headerName="Part Id" hide={true} ></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="UOM" headerName="UOM" ></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="TargetPrice" headerName="Target Price" ></AgGridColumn>
                                                                    <AgGridColumn width={"230px"} field="TimeLine" headerName="Requirement Timeline" cellRenderer={'effectiveDateFormatter'} ></AgGridColumn>

                                                                    <AgGridColumn width={"190px"} field="PartId" cellClass="ag-grid-action-container text-right" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatterFirst'}></AgGridColumn>
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
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    // title={titleObj.descriptionTitle}
                                                    label="LD Clause"
                                                    name={'LDClause'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.LDClause}
                                                    disabled={(dataProps?.isViewFlag) ? true : false || disabledVendoUi}
                                                    placeholder="-"
                                                />
                                            </Col>
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
                                                                <AgGridColumn field="Vendor" headerName="Vendor (Code)" ></AgGridColumn>
                                                                {IsSendQuotationToPointOfContact() && (
                                                                    <AgGridColumn width={"270px"} field="ContactPerson" headerName="Point of Contact" ></AgGridColumn>)}
                                                                {vendorList && havellsKey && <AgGridColumn field='IncoTerms' header='Inco Terms' cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                {vendorList && havellsKey && <AgGridColumn field='PaymentTerms' header='Payment Terms' cellRenderer={'hyphenFormatter'} ></AgGridColumn>}
                                                                {vendorList && havellsKey && <AgGridColumn field='WarrantyTerms' header='Warranty Terms' cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                                                {vendorList && havellsKey && <AgGridColumn field='LDClause' header='LD Clause' cellRenderer={'hyphenFormatter'}></AgGridColumn>}
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
                                            < div id="checkbox_container" className="custom-check1">
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
                                            </div>
                                        </Col>
                                        {isConditionalVisible && <>
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
                                        </>}

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

                                        {/* <Col md="4" className="height152-label">
                                            <label>Upload Attachment (upload up to 4 files)<span className="asterisk-required">*</span></label>
                                            <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                                Maximum file upload limit has been reached.
                                            </div>
                                            <div id="addRFQ_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                                <Dropzone
                                                    ref={dropzone}
                                                    onChangeStatus={handleChangeStatus}
                                                    PreviewComponent={Preview}
                                                    //onSubmit={this.handleSubmit}
                                                    accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                                    initialFiles={[]}
                                                    maxFiles={4}
                                                    maxSizeBytes={2000000}
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
                                        </Col> */}
                                    </Row>

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
                                            isViewFlag={viewQuotationPart}
                                            partListData={partList}
                                            setPartListData={setPartList}
                                            setViewQuotationPart={setViewQuotationPart}
                                            addRowPartNoTable={addRowPartNoTable}
                                            setSopQuantityList={setSopQuantityList}
                                            sopQuantityList={sopQuantityList}
                                            sopdate={sopdate}
                                            setSOPDate={setSOPDate}
                                            effectiveMinDate={effectiveMinDate}



                                        />
                                    )
                                }


                            </div >
                        </div >
                    </div >
                </div >
            </div >

            {/* </Drawer > */}
            {
                showPopup && <PopupMsgWrapper disablePopup={alreadyInDeviation} vendorId={vendorId}
                    plantId={plantId} redirectPath={blocked ? "/initiate-unblocking" : ""} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={blocked ? `${popupMessage}` : `${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
        </div >
    );
}

export default AddRfq