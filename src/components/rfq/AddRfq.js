import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm, NumberFieldHookForm } from '.././layout/HookFormInputs'
import { getVendorWithVendorCodeSelectList, getReporterList, fetchPlantDataAPI } from '../.././actions/Common';
import { getCostingSpecificTechnology, } from '../costing/actions/Costing'
import { addDays, checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../.././helper';
import { postiveNumber, maxLength10, nonZero, checkForNull } from '../.././helper/validation'
import { EMPTY_DATA, FILE_URL, searchCount } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation, fileDeleteQuotation, fileUploadQuotation, getQuotationById, updateRfqQuotation, getContactPerson, checkExistCosting, setRFQBulkUpload } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import redcrossImg from '../../assests/images/red-cross.png'
import NoContentFound from '../common/NoContentFound';
import HeaderTitle from '../common/HeaderTitle';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, autoCompleteDropdownPart } from '../common/CommonFunctions';
import BulkUpload from '../massUpload/BulkUpload';
import _, { debounce } from 'lodash';
import { getPartSelectListWtihRevNo } from '../masters/actions/Volume';
import { DATE_STRING, DURATION_STRING, LOGISTICS, REMARKMAXLENGTH, visibilityModeDropdownArray } from '../../config/masterData';
import DayTime from '../common/DayTimeWrapper';
import DatePicker from 'react-datepicker'
import { label } from 'react-dom-factories';
import WarningMessage from '../common/WarningMessage';

const gridOptions = {};

function AddRfq(props) {
    const { data: dataProps } = props
    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const sopObjectTemp = [
        { sop: 'SOP1' },
        { sop: 'SOP2' },
        { sop: 'SOP3' },
        { sop: 'SOP4' },
        { sop: 'SOP5' },
    ]

    const [getReporterListDropDown, setGetReporterListDropDown] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [initialFiles, setInitialFiles] = useState([]);
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
    const [selectedRowPartNoTable, setSelectedRowPartNoTable] = useState({})
    const [selectedRowVendorTable, setSelectedVendorTable] = useState({})
    const [files, setFiles] = useState([])
    const [IsOpen, setIsOpen] = useState(false);
    const [apiData, setData] = useState({});
    const [isDisable, setIsDisable] = useState(false)
    const [disableTechnology, setDisableTechnology] = useState(false)
    const [partNoDisable, setPartNoDisable] = useState(true)
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [partName, setPartName] = useState(false)
    const [technology, setTechnology] = useState({})
    const [submissionDate, setSubmissionDate] = useState('')
    const [visibilityMode, setVisibilityMode] = useState({})
    const [dateAndTime, setDateAndTime] = useState('')
    const [time, setTime] = useState(new Date())
    const [isConditionalVisible, setIsConditionalVisible] = useState(false)
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [loader, setLoader] = useState(false)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const dispatch = useDispatch()
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const checkRFQPartBulkUpload = useSelector((state) => state.rfq.checkRFQPartBulkUpload)
    // const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)
    const plantList = useSelector(state => state.comman.plantList)
    const [isBulkUpload, setisBulkUpload] = useState(false);

    useEffect(() => {
        const { vbcVendorGrid } = props;
        dispatch(fetchPlantDataAPI(() => { }))
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
        let tempp = _.unionBy(partList, checkRFQPartBulkUpload?.SuccessfulRecord, 'PartNumber');
        setPartList(tempp)
    }, [checkRFQPartBulkUpload])

    const convertToPartList = (partListTemp) => {
        let tempArr = []
        partListTemp && partListTemp?.map((item) => {
            item.SOPQuantity.map((ele, ind) => {
                if (ind !== 2) {
                    ele.PartNo = ele.PartNumber
                    ele.PartId = item.PartId
                    delete ele.PartNumber
                } else {
                    ele.PartNo = ele.PartNumber
                    ele.PartId = item.PartId
                }
            })
            tempArr = [...tempArr, ...item?.SOPQuantity]
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
                    // setInitialFiles(data?.Attachments)
                    // setValue('SubmissionDate', data?.LastSubmissionDate)
                    setSubmissionDate(data?.LastSubmissionDate)
                    setIsConditionalVisible(data?.IsConditionallyVisible)
                    setValue('VisibilityMode', { value: data?.VisibilityMode, label: data?.VisibilityMode })
                    setVisibilityMode({ value: data?.VisibilityMode, label: data?.VisibilityMode })
                    setDateAndTime(data?.VisibilityDate)
                    setTime(data?.VisibilityDuration)
                    setValue('Time', data?.VisibilityDuration)
                    setFiles(data?.Attachments)
                    setPartList(convertToPartList(data.PartList))
                    setVendorList(data.VendorList)
                    setValue("remark", data.Remark)
                    setData(data)
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
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            dispatch(fileDeleteQuotation(deleteData, (res) => {
                Toaster.success('File has been deleted successfully.')
                let tempArr = files && files.filter(item => item.FileId !== FileId)
                setFiles(tempArr)
                setIsOpen(!IsOpen)
            }))
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


    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }



    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files?.length) - Number(files?.length)
        if (Number(loop) === 1) {
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

        setIsDisable(true)
        setAttachmentLoader(true)
        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            dispatch(fileUploadQuotation(data, (res) => {
                setDisableFalseFunction()
                if ('response' in res) {
                    status = res && res?.response?.status
                    dropzone.current.files.pop()
                    setAttachmentLoader(false)
                }
                else {
                    let Data = res.data[0]
                    files.push(Data)
                    setFiles(files)
                    setAttachmentLoader(false)
                    setTimeout(() => {
                        setIsOpen(!IsOpen)
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
        setShowPopup(false)
    }

    const onPopupConfirm = () => {

    }

    const deleteItemPartTable = (rowData, final) => {

        let arr = final && final.filter(item => item.PartNo !== rowData?.PartNo)
        if (arr.length === 0) {
            setDisableTechnology(false)
        }
        setPartList(arr)
        onResetPartNoTable()
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

    }

    const editItemPartTable = (gridData, props) => {

        setSelectedRowPartNoTable(props.node.data)
        setUpdateButtonPartNoTable(true)
        setValue('partNumber', { label: props?.node?.data?.PartNumber, value: props?.node?.data?.PartId })
        setValue('annualForecastQuantity', props?.node?.data?.Quantity)
        setValue('technology', props?.node?.data?.technology)
    }


    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {

        const temp = [];

        if (label === 'plant') {
            plantList && plantList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value, PlantName: item.Text, PlantCode: item.Value })
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


        // if (label === 'partNo') {
        //     partSelectListByTechnology && partSelectListByTechnology.map((item) => {
        //         let isExist = false
        //         if (item.Value === '0') { return false }
        //         if (partList.length > 0) {            // EXISTING PART IN TABLE SHOULD NOT APPEAR IN DROPDOWN
        //             partList.map((element) => {
        //                 if (element.PartId === item.Value) {
        //                     isExist = true
        //                 }
        //             })
        //         }
        //         if (!isExist) {
        //             temp.push({ label: item.Text, value: item.Value })
        //         }
        //         return null
        //     })
        //     return temp
        // }

        if (label === 'reporter') {

            getReporterListDropDown && getReporterListDropDown.map(item => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp;
        }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.closeDrawer('', {})
    }

    const onSubmit = debounce((data, e, isSent) => {
        if (vendorList.length === 0) {
            Toaster.warning("Please enter vendor details")
            return false
        } else if (partList.length === 0) {
            Toaster.warning("Please enter part details")
            return false
        } else if (files?.length === 0) {
            Toaster.warning("Please add atleast one attachment file")
            return false
        } else if (!submissionDate) {
            setIsWarningMessageShow(true)
            return false
        } else if (Object.keys(errors).length > 0) {
            return false
        }
        let obj = {}
        obj.QuotationId = apiData.QuotationId ? apiData.QuotationId : ""
        obj.QuotationNumber = apiData.QuotationNumber ? apiData.QuotationNumber : ""

        obj.Remark = getValues('remark')
        obj.TechnologyId = getValues('technology').value
        obj.PlantId = getValues('plant')?.value
        obj.LoggedInUserId = loggedInUserId()
        obj.StatusId = ''

        obj.IsSent = isSent
        obj.IsConditionallyVisible = isConditionalVisible
        obj.VisibilityMode = visibilityMode?.label
        obj.VisibilityDate = dateAndTime
        obj.VisibilityDuration = getValues('Time')
        obj.LastSubmissionDate = DayTime(submissionDate).format('YYYY-MM-DD HH:mm:ss')

        obj.VendorList = vendorList

        let temppartArr = []
        let partIdList = _.uniq(_.map(partList, 'PartId'))
        partIdList && partIdList?.map((item) => {
            let temppartObj = {}
            let partListArr = []
            temppartObj.PartId = item
            partList && partList.map((item1) => {
                let partListObj = {}
                if (item1?.PartId === item) {
                    partListObj.PartNumber = item1?.PartNo
                    partListObj.YearName = item1?.YearName
                    partListObj.Quantity = item1?.Quantity
                    partListArr.push(partListObj)
                }
            })
            temppartObj.SOPQuantityDetails = partListArr
            temppartArr.push(temppartObj)
        })

        obj.PartList = temppartArr
        obj.Attachments = files
        obj.IsSent = isSent

        if (dataProps?.isEditFlag) {
            dispatch(updateRfqQuotation(obj, (res) => {
                if (res?.data?.Result) {
                    if (isSent) {
                        Toaster.success(MESSAGES.RFQ_SENT_SUCCESS)
                    } else {
                        Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                    }
                    cancel()
                }
            }))

        } else {

            dispatch(createRfqQuotation(obj, (res) => {
                if (res?.data?.Result) {
                    if (isSent) {
                        Toaster.success(MESSAGES.RFQ_SENT_SUCCESS)
                    } else {
                        Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                    }
                    cancel()
                }
            }))

        }
    }, 500)


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
    };


    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForInputOutput)
    }

    const sopFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-'
    }


    const buttonFormatterFirst = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        let show = (props?.data?.PartNumber === undefined) ? false : true
        const row = props?.data;
        return (
            <>
                {/* {< button title='Edit' className="Edit mr-2 align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !dataProps?.isEditFlag)} type={'button'} onClick={() => editItemPartTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !dataProps?.isEditFlag)} type={'button'} onClick={() => deleteItemPartTable(final, props)} />} */}
                {show && <button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} type={'button'} onClick={() => deleteItemPartTable(row, final)} />}
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

        data.PartIdList = temp
        data.PlantId = getValues('plant')?.value
        data.VendorId = getValues('vendor')?.value

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

                if (obj.VendorId === null || obj.VendorId === undefined || obj.ContactPersonId === null || obj.ContactPersonId === undefined) {

                    Toaster.warning("Please fill all the mandatory fields first.")
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
                setUpdateButtonVendorTable(false)
            }

        }))

    }


    const addRowPartNoTable = () => {
        let arrTemp = []
        let partNumber = getValues('partNumber')

        sopObjectTemp && sopObjectTemp.map((item, index) => {
            let objTemp = {}
            objTemp.YearName = `SOP${index + 1}`
            objTemp.PartNo = partNumber?.label
            objTemp.PartId = getValues('partNumber')?.value
            if (index === 2) {
                objTemp.PartNumber = partNumber?.label
            }
            objTemp.Quantity = 0

            arrTemp.push(objTemp)
        })

        let arr = [...partList, ...arrTemp]

        setPartList(arr)
        setValue('partNumber', "")
        setValue('annualForecastQuantity', "")
        // setValue('technology', "")
        setUpdateButtonPartNoTable(false)
        setDisableTechnology(true)
    }

    const onResetPartNoTable = () => {
        setUpdateButtonPartNoTable(false)
        setValue('partNumber', "")
        setValue('annualForecastQuantity', "")
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
    }


    /**
    * @method handleTechnologyChange
    * @description  USED TO HANDLE TECHNOLOGY CHANGE
    */
    const handleTechnologyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setPartNoDisable(false)
            setValue('partNumber', "")
            setTechnology(newValue)
        }
    }


    const handleVendorChange = (data) => {

        dispatch(getContactPerson(data.value, (res) => {
            setGetReporterListDropDown(res?.data?.SelectList)
            setValue('contactPerson', "")
        }))
    }
    const vendorFilterList = async (inputValue) => {
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
    const partFilterList = async (inputValue) => {

        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            const res = await getPartSelectListWtihRevNo(resultInput, technology.value)
            setPartName(resultInput)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)

            } else {
                return partDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('PartData')
                if (inputValue) {
                    return autoCompleteDropdownPart(inputValue, partData, false, [], false)
                } else {
                    return partData
                }
            }
        }

    }

    /**
    * @method beforeSaveCell
    * @description CHECK FOR ENTER NUMBER IN CELL
    */
    const beforeSaveCell = (props) => {
        const cellValue = props
        if (cellValue === undefined) {
            return true
        }
        if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }

    const afcFormatter = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        const cell = props?.value;
        const value = beforeSaveCell(cell)

        setPartList(final)
        return (
            <>
                {<span className='form-control height33' >{value ? Number(cell) : 0}</span>}
            </>
        )
    }

    const handleVisibilityMode = (value) => {
        setVisibilityMode(value)
        setValue('startPlanDate', '')
        setValue('Time', '')
    }

    const partNumberFormatter = (props) => {
        const row = props?.data;
        const value = row?.RevisionNumber ? (row?.PartNumber + ' (' + row?.RevisionNumber + ')') : (row?.PartNumber ? row?.PartNumber : '')
        return <div className={`${value ? '' : 'row-merge'}`}>{value}</div>
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
        setDateAndTime(value)
    }

    const handleChangeTime = (value) => {
        setTime(value)
    }

    const checkBoxHandler = () => {
        setIsConditionalVisible(!isConditionalVisible)
        setVisibilityMode('')
        setValue('VisibilityMode', '')
        setValue('startPlanDate', '')
        setValue('Time', '')
    }

    const EditableCallback = (props) => {
        let value = dataProps?.isAddFlag ? true : dataProps?.isViewFlag ? false : isEditAll ? true : false
        return value
    }

    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        buttonFormatterFirst: buttonFormatterFirst,
        buttonFormatterVendorTable: buttonFormatterVendorTable,
        customNoRowsOverlay: NoContentFound,
        partNumberFormatter: partNumberFormatter,
        sopFormatter: sopFormatter,
        EditableCallback: EditableCallback,
        afcFormatter: afcFormatter
    };

    const VendorLoaderObj = { isLoader: VendorInputLoader }
    const plantLoaderObj = { isLoader: inputLoader }
    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div className="container-fluid">
            <div className="login-container signup-form">
                <div className="row">
                    <div className="col-md-12">
                        <div className="shadow-lgg login-formg">
                            <div className="row">
                                <div className="col-md-6">
                                    <h3>{isViewFlag ? "View" : props?.isEditFlag ? "Update" : "Add"} RFQ</h3>
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
                                                defaultValue={vendor.length !== 0 ? vendor : ""}
                                                options={renderListing("technology")}
                                                mandatory={true}
                                                handleChange={handleTechnologyChange}
                                                errors={errors.technology}
                                                disabled={((dataProps?.isViewFlag || isEditAll) ? true : false)
                                                    || (partList?.length !== 0)}
                                                isLoading={VendorLoaderObj}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"Plant (Code)"}
                                                name={"plant"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                // defaultValue={vendor.length !== 0 ? vendor : ""}
                                                options={renderListing("plant")}
                                                mandatory={true}
                                                // handleChange={handleVendorChange}
                                                handleChange={() => { }}
                                                errors={errors.plant}
                                                isLoading={VendorLoaderObj}
                                                disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <div className="inputbox date-section">
                                                <div className="form-group">
                                                    <label>Last Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name={'SubmissionDate'}
                                                            placeholder={'Select'}
                                                            //selected={submissionDate}
                                                            selected={DayTime(submissionDate).isValid() ? new Date(submissionDate) : ''}
                                                            onChange={handleSubmissionDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            minDate={new Date()}
                                                            dateFormat="dd/MM/yyyy"
                                                            dropdownMode="select"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            mandatory={true}
                                                            errors={errors.SubmissionDate}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={dataProps?.isEditFlag ? !isEditSubmissionDate : dataProps?.isViewFlag ? true : false}
                                                        />
                                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <HeaderTitle title={'Part:'} />
                                    <Row className="part-detail-wrapper">
                                        <Col md="3">
                                            <AsyncSearchableSelectHookForm
                                                label={"Part No"}
                                                name={"partNumber"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                                options={renderListing("partNo")}
                                                mandatory={true}
                                                // handleChange={handleDestinationPlantChange}
                                                handleChange={() => { }}
                                                errors={errors.partNumber}
                                                disabled={dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)}
                                                isLoading={plantLoaderObj}
                                                asyncOptions={partFilterList}
                                                NoOptionMessage={"Enter 3 characters to show data"}
                                            />
                                        </Col>
                                        {/* <Col md="3">
                                            <NumberFieldHookForm
                                                label="YearName"
                                                name={"YearName"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                disableErrorOverflow={true}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                disabled={false}
                                                placeholder={'Enter'}
                                                customClassName={'withBorder'}
                                                errors={errors.YearName}
                                            />
                                        </Col> */}
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
                                                type="button"
                                                className={'user-btn pull-left'}
                                                onClick={() => addRowPartNoTable()}
                                                disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                            >
                                                <div className={'plus'}></div>{!updateButtonPartNoTable ? "ADD" : "UPDATE"}
                                            </button>
                                            <button
                                                onClick={onResetPartNoTable} // Need to change this cancel functionality
                                                type="button"
                                                value="CANCEL"
                                                className="reset ml-2 mr5"
                                                disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                            >
                                                <div className={''}></div>
                                                RESET
                                            </button>
                                            {(checkForNull(technology?.value) === LOGISTICS) && <button
                                                type="button"
                                                className={"user-btn "}
                                                onClick={bulkToggle}
                                                title="Bulk Upload"
                                                disabled={partNoDisable}
                                            >
                                                <div className={"upload mr-0"}></div>
                                            </button>}
                                        </Col>
                                    </Row>
                                    <div>
                                        { }
                                        {!loader ? <div className={`ag-grid-react`}>
                                            <Row>
                                                <Col>
                                                    <div className={`ag-grid-wrapper height-width-wrapper ${partList && partList.length <= 0 ? "overlay-contain border" : ""} `}>

                                                        <div className={`ag-theme-material`}>
                                                            <AgGridReact
                                                                defaultColDef={defaultColDef}
                                                                //floatingFilter={true}
                                                                domLayout='autoHeight'
                                                                // columnDefs={c}
                                                                rowData={partList}
                                                                //pagination={true}
                                                                paginationPageSize={10}
                                                                onGridReady={onGridReady}
                                                                gridOptions={gridOptions}
                                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: EMPTY_DATA,
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                                stopEditingWhenCellsLoseFocus={true}
                                                            >
                                                                <AgGridColumn width={"230px"} field="PartNumber" headerName="Part No" cellClass={"colorWhite"} cellRenderer={'partNumberFormatter'}></AgGridColumn>

                                                                <AgGridColumn width={"230px"} field="YearName" headerName="Production Year" cellRenderer={'sopFormatter'}></AgGridColumn>
                                                                <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" cellRenderer={'afcFormatter'} editable={EditableCallback} colId="Quantity"></AgGridColumn>
                                                                <AgGridColumn width={"0px"} field="PartId" headerName="Part Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                                <AgGridColumn width={"190px"} field="PartId" headerName="Action" cellClass={"colorWhite text-right"} floatingFilter={false} type="rightAligned" cellRenderer={'buttonFormatterFirst'}></AgGridColumn>
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
                                                disabled={dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                                NoOptionMessage={"Enter 3 characters to show data"}
                                            />
                                        </Col>


                                        <Col md="3">
                                            <SearchableSelectHookForm
                                                label={"Point of Contact"}
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
                                                disabled={dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                                isLoading={plantLoaderObj}
                                            />
                                        </Col>
                                        <Col md="3" className='d-flex align-items-center pb-1'>
                                            <button
                                                type="button"
                                                className={'user-btn pull-left'}
                                                onClick={() => addRowVendorTable()}
                                                disabled={dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                            >
                                                <div className={'plus'}></div>{!updateButtonVendorTable ? "ADD" : "UPDATE"}
                                            </button>

                                            <button
                                                onClick={onResetVendorTable} // Need to change this cancel functionality
                                                type="button"
                                                value="CANCEL"
                                                className="reset ml-2"
                                                disabled={dataProps?.isAddFlag ? false : (isViewFlag || !isEditAll)}
                                            >
                                                <div className={''}></div>
                                                RESET
                                            </button>
                                        </Col>
                                    </Row>

                                    <div>
                                        {!loader ? <div className={`ag-grid-react`}>
                                            <Row>
                                                <Col>
                                                    <div className={`ag-grid-wrapper height-width-wrapper ${vendorList && vendorList.length <= 0 ? "overlay-contain border" : ""} `}>

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
                                                                gridOptions={gridOptions}
                                                                //noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: EMPTY_DATA,
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                            >
                                                                <AgGridColumn field="Vendor" headerName="Vendor (Code)" ></AgGridColumn>

                                                                <AgGridColumn width={"270px"} field="ContactPerson" headerName="Point of Contact" ></AgGridColumn>
                                                                <AgGridColumn width={"270px"} field="VendorId" headerName="Vendor Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                                <AgGridColumn width={"180px"} field="partId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatterVendorTable'}></AgGridColumn>
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
                                            < div className="custom-check1">
                                                <label
                                                    className="custom-checkbox mb-0"
                                                    onChange={() => checkBoxHandler()}
                                                >
                                                    {'Visibility'}
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
                                                        <div className="inputbox date-section">
                                                            <DatePicker
                                                                name="startPlanDate"
                                                                selected={DayTime(dateAndTime).isValid() ? new Date(dateAndTime) : null}
                                                                onChange={handleChangeDateAndTime}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                showTimeInput
                                                                timeFormat='HH:mm'
                                                                dateFormat="dd/MM/yyyy HH:mm"
                                                                dropdownMode="select"
                                                                placeholderText="Select"
                                                                className="withBorder"
                                                                autoComplete={'off'}
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
                                                                dropdownMode="select"
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


                                    <HeaderTitle title={'Remark and Attachments:'} customClass="mt-3" />
                                    <Row className='part-detail-wrapper'>
                                        <Col md="4">
                                            <TextAreaHookForm
                                                label={"Remark"}
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
                                            <label>Upload Attachment (upload up to 4 files)<span className="asterisk-required">*</span></label>
                                            <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                                Maximum file upload limit has been reached.
                                            </div>
                                            <div className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                                <Dropzone
                                                    ref={dropzone}
                                                    onChangeStatus={handleChangeStatus}
                                                    PreviewComponent={Preview}
                                                    //onSubmit={this.handleSubmit}
                                                    accept="*"
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
                                        </Col>
                                    </Row>

                                    <Row className="justify-content-between sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">

                                        <div className="col-sm-12 text-right bluefooter-butn">
                                            <button
                                                type={"button"}
                                                className="reset mr-2 cancel-btn"
                                                onClick={cancel}
                                            >
                                                <div className={"cancel-icon"}></div>
                                                {"Cancel"}
                                            </button>

                                            <button type="button" className="submit-button save-btn mr-2" value="save"
                                                onClick={(data, e) => { handleSubmit(onSubmit(data, e, false)) }}
                                                disabled={isViewFlag}>
                                                <div className={"save-icon"}></div>
                                                {"Save"}
                                            </button>

                                            <button type="button" className="submit-button save-btn" value="send"
                                                onClick={(data, e) => { handleSubmit(onSubmit(data, e, true)) }}
                                                disabled={isViewFlag}>
                                                <div className="send-for-approval mr-1"></div>
                                                {"Send"}
                                            </button>
                                        </div>
                                    </Row>
                                </form>

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

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* </Drawer > */}
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
        </div >
    );
}

export default AddRfq