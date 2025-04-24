import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
import DatePicker from "react-datepicker";
import Dropzone from 'react-dropzone-uploader';

// Components
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import HeaderTitle from '../../common/HeaderTitle';
import DayTime from '../../common/DayTimeWrapper';
import TourWrapper from "../../common/Tour/TourWrapper";
import NoContentFound from '../../common/NoContentFound';

// Actions
import { getPlantSelectListByType, getUOMSelectList } from '../../../actions/Common';
import { getBoughtOutPartSelectList, getSelectListPartType } from '../actions/Part';
import { getPartInfo } from '../../costing/actions/Costing';
import { getRMSpecificationDataList, getRawMaterialNameChild } from '../../masters/actions/Material';
import { getClientSelectList } from '../actions/Client';
import { fileUploadQuotation } from '../../rfq/actions/rfq';
import { createNFRBOMDetails, getNFRPartWiseGroupDetail } from './actions/nfr';
import { getPartSelectListWtihRevNo } from '../actions/Volume';

// Constants and Config
import { FILE_URL, ZBC, searchCount, PRODUCT_ID, EMPTY_DATA } from '../../../config/constants';
import { AcceptableRMUOM, NFR_BOP_STANDARD_ID, NFR_BOP_STANDARD_LABEL, NFR_COMPONENT_CUSTOMIZED_ID, NFR_COMPONENT_CUSTOMIZED_LABEL, NFR_RAW_MATERIAL_ID, NFR_RAW_MATERIAL_LABEL, NFR_RAW_MATERIAL_NAME, PART_TYPE_LIST_FOR_NFR } from '../../../config/masterData';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { Steps } from './TourMessages';

// Helpers
import { autoCompleteDropdownPart } from '../../common/CommonFunctions';
import { maxLength20, checkForDecimalAndNull, validateFileName, minLength3 } from "../../../helper/validation";
import AddForecast from './AddForecast';
// Assets
import redcrossImg from '../../../assests/images/red-cross.png';

function CreateManualNFR(props) {
    const { t } = useTranslation("Nfr")
    const { isViewFlag, partListData, data } = props;
    const dropzone = useRef(null);
    const { handleSubmit, formState: { errors }, register, control, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    })
    const dispatch = useDispatch();

    // Redux selectors
    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const UOMSelectList = useSelector(state => state.comman.UOMSelectList)
    const { rmSpecificationList } = useSelector((state) => state.material);
    const boughtOutPartSelectList = useSelector(state => state.part.boughtOutPartSelectList)
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    // Form data state
    const [sopQuantityList, setSopQuantityList] = useState([])
    const [partName, setpartName] = useState('')
    const [selectedPart, setSelectedPart] = useState('');
    const [selectedUOM, setSelectedUOM] = useState('');
    const [selectedPlant, setSelectedPlant] = useState('');
    const [remarks, setRemarks] = useState('');
    const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
    const [selectedBOPNumber, setSelectedBOPNumber] = useState('');
    const [selectedPartType, setSelectedPartType] = useState('');
    const [previousPartType, setPreviousPartType] = useState('');
    const [customer, setCustomer] = useState([]);
    const [zbcDate, setZbcDate] = useState('')
    const [cbcDate, setCbcDate] = useState('')

    const [sopDate, setSOPDate] = useState('')
    const [fiveyearList, setFiveyearList] = useState([])

    // Table and grid state
    const [rowData, setRowData] = useState([]);
    const [modifiedRowData, setModifiedRowData] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [editIndex, setEditIndex] = useState('');
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [rfqData, setRfqData] = useState([])
    const gridOptionsPart = {}

    // UI state
    const [tableLoader, setTableLoader] = useState(false);
    const [inputLoader, setInputLoader] = useState(false)
    const [loader, setLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)

    // Drawer state
    const [openAddRMDetails, setOpenAddRMDetails] = useState(false);
    const [rmDetailsGridIndex, setRMDetailsGridIndex] = useState('');
    const [openAddForecast, setOpenAddForecast] = useState(false)
    const [rmDetails, setRMDetails] = useState([]);
    const [viewRMDetails, setViewRMDetails] = useState(false)

    // Selection lists
    const [selectedPartList, setSelectedPartList] = useState([]);
    const [selectedBOPList, setSelectedBOPList] = useState([]);
    const [selectedRMList, setSelectedRMList] = useState([]);

    // File upload state
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [files, setFiles] = useState([])
    const [apiCallCounter, setApiCallCounter] = useState(0)

    const [partTypeList, setPartTypeList] = useState([]);
    useEffect(() => {
        if (!isViewFlag) {
            dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
            dispatch(getUOMSelectList(() => { }))
            dispatch(getSelectListPartType((res) => {
                setPartTypeList(res?.data?.SelectList)
            }))
            dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
            dispatch(getBoughtOutPartSelectList(null, () => { }))
            dispatch(getRawMaterialNameChild(() => { }))
        }
    }, [])

    useEffect(() => {
        setVendorInputLoader(true)
        const { cbcGrid } = props;
        dispatch(getClientSelectList((res) => {
            setVendorInputLoader(false)
        }))
        dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))

        let tempArr = [];
        cbcGrid && cbcGrid.map(el => {
            tempArr.push(el.CustomerId)
            return null;
        })
        initialConfiguration?.IsDestinationPlantConfigure === false && setCustomer(tempArr)
    }, []);

    useEffect(() => {
        if (data?.Id) {
            setTableLoader(true);
            dispatch(getNFRPartWiseGroupDetail(data?.Id, (res) => {
                if (res?.data?.DataList?.length > 0) {
                    setRowData(res?.data?.DataList);
                    setModifiedRowData(res?.data?.DataList);
                }
                setTableLoader(false);
            }));
        }
    }, [data]);

    // Utility functions
    const renderListing = (value) => {
        const temp = [];
        
        switch(value) {
            case 'Plant':
                plantSelectList && plantSelectList?.map(item => {
                    if (item.PlantId === '0') return false;
                    temp.push({ 
                        label: item.PlantNameCode, 
                        value: item.PlantId, 
                        plantCode: item.PlantCode, 
                        plantName: item.PlantName 
                    })
                    return null
                });
                break;
                
            case 'Customer':
                clientSelectList && clientSelectList.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                break;
                
            case 'PartType':
                partTypeList && partTypeList?.map(item => {
                    if (item?.Value === '0' || item?.Value === PRODUCT_ID || item?.Value === '3' || item?.Value === '5') return false;
                    temp.push({ label: item?.Text, value: item?.Value });
                    return null
                });
                break;
                
            case 'UOM':
                UOMSelectList && UOMSelectList?.map(item => {
                    const accept = AcceptableRMUOM.includes(item.Type)
                    if (accept === false) return false
                    if (item.Value === '0') return false
                    temp.push({ label: item.Display, value: item.Value })
                    return null
                });
                break;
                
            case 'BOPNumber':
                boughtOutPartSelectList && boughtOutPartSelectList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                break;
                
            case 'RawMaterial':
                rmSpecificationList && rmSpecificationList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
                    return null;
                });
                break;
        }
        
        return temp;
    }

    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if ((inputValue?.length >= searchCount && partName !== resultInput) ||
            (selectedPartType?.value !== previousPartType && inputValue?.length >= searchCount)) {
            setInputLoader(true)
            const res = await getPartSelectListWtihRevNo(resultInput, null, null, selectedPartType?.value);
            setInputLoader(false)
            setpartName(resultInput)
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

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        setGridApi(params.api)
        params.api.paginationGoToPage(0);
    };



    const resetData = () => {
        // Clear form errors
        errors.Quantity = {};

        // Reset form values
        setValue("PartType", '');
        setValue("Part", '');
        setValue("PartNumber", '');
        setValue("Plant", '');
        setValue("CustomerRFQNo", '');
        setValue("Customer", '');
        setValue("PartName", '');
        setValue("Description", '');
        setValue("UnitOfMeasurement", '');

        // Reset state variables
        setSelectedPartType('');
        setSelectedPart('');
        setSelectedBOPNumber('');
        setSelectedRawMaterial('');
        setEditIndex('');
    }

    const checkIsDataFilled = () => {
        let value = ''
        switch (selectedPartType?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                value = selectedPart
                break;
            case NFR_BOP_STANDARD_ID:
                value = selectedBOPNumber
                break;
            case NFR_RAW_MATERIAL_ID:
                value = selectedRawMaterial
                break;
            default:
                break;
        }
        let check = false
        if (selectedPartType?.length === 0 || value?.length === 0 || getValues("HeaderMaterial") === '') {
            check = true
        }
        return check
    }

    // Event handlers for form fields
    const handleChangePartType = (value) => {
        setPreviousPartType(selectedPartType?.value);
        setSelectedPartType(value)
        setSelectedBOPNumber('')
        setSelectedRawMaterial('')
        setSelectedPart('')
        setValue("Part", '')
        setValue("BOPNumber", '')
        setValue("RawMaterial", '')
    }

    const handlePartChange = (newValue) => {
        setSelectedPart(newValue);

        if (newValue && newValue !== '') {
            dispatch(getPartInfo(newValue.value, (res) => {
                let Data = res.data.Data;

                setValue('PartName', Data?.PartName ? Data.PartName : '');
                setValue('Description', Data?.Description ? Data.Description : '');
                setValue('UnitOfMeasurement', Data?.UnitOfMeasurement ? Data.UnitOfMeasurement : '');

                if (sopDate) {
                    const newSopQuantityList = fiveyearList.map(yearItem => ({
                        PartNumber: newValue?.label || '',
                        YearName: yearItem.toString(),
                        Quantity: '0'
                    }));

                    setSopQuantityList(newSopQuantityList);
                }
            }));
        } else {
            setValue('PartName', '');
            setValue('Description', '');
            setValue('UnitOfMeasurement', '');
        }
    }

    const handleChangePlant = (newValue) => {
        setSelectedPlant(newValue)
    }

    const handleCustomerChange = (newValue) => {
        if (newValue && newValue !== '') {
            setCustomer(newValue)
        }
    }

    const handleRemarkChange = (newValue) => {
        setRemarks(newValue)
    }

    // Date change handlers
    const handleZBCDateChange = (date) => {
        setZbcDate(DayTime(date).isValid() ? DayTime(date) : '')
    };

    const handleCBCDateChange = (date) => {
        setCbcDate(DayTime(date).isValid() ? DayTime(date) : '')
    };

    const handleSOPDateChange = (date) => {
        const newDate = DayTime(date).isValid() ? DayTime(date) : '';

        // Validate that SOP date is not before ZBC date
        if (zbcDate && newDate && new Date(newDate) < new Date(zbcDate)) {
            Toaster.warning("SOP Date cannot be before ZBC Last Submission Date");
            return;
        }

        setSOPDate(newDate);

        let year = new Date(date).getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(year + i);
        }
        setFiveyearList(years);

        if (date) {
            const partNumber = selectedPart?.label || '';

            const newSopQuantityList = years.map(yearItem => ({
                PartNumber: partNumber,
                YearName: yearItem.toString(),
                Quantity: '0'
            }));

            setSopQuantityList(newSopQuantityList);
        }
    };

    const addTableHandler = debounce(() => {
        if (selectedPartList?.includes(selectedPart?.value) ||
            selectedBOPList?.includes(selectedBOPNumber?.value) ||
            selectedRMList?.includes(selectedRawMaterial?.value)) {
            Toaster.warning("This item has already been added to the table.")
            return false
        }

        let tempData = rfqData ? [...rfqData] : []
        let obj = {
            HeaderMaterial: getValues("HeaderMaterial"),
            PartType: selectedPartType?.label,
            PartTypeId: selectedPartType?.value,
            PartId: selectedPart?.value,
            PartNumber: selectedPart?.label,
            BoughtOutPartChildId: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.value : '',
            BoughtOutPartNumber: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.label : '',
            RawMaterialCode: selectedPartType?.value === NFR_RAW_MATERIAL_ID ? selectedRawMaterial?.label : '',
            CustomerRFQNo: getValues("CustomerRFQNo"),
            CustomerId: customer?.value,
            CustomerName: customer?.label || '',
            PartName: getValues("PartName"),
            Description: getValues("Description"),
            UnitOfMeasurement: getValues("UnitOfMeasurement"),
            GroupCode: getValues("GroupCode"),
            Plant: selectedPlant?.label || '',
            ZBCLastSubmissionDate: zbcDate ? DayTime(zbcDate).format('DD/MM/YYYY') : '',
            QuotationLastSubmissionDate: cbcDate ? DayTime(cbcDate).format('DD/MM/YYYY') : '',
            Remarks: remarks
        }

        switch (selectedPartType?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setSelectedPartList([...selectedPartList, selectedPart?.value])
                break;
            case NFR_BOP_STANDARD_ID:
                setSelectedBOPList([...selectedBOPList, selectedBOPNumber?.value])
                break;
            case NFR_RAW_MATERIAL_ID:
                setSelectedRMList([...selectedRMList, selectedRawMaterial?.value])
                break;
            default:
                break;
        }

        tempData.push(obj)
        setGridData(tempData)
        setRfqData(tempData)
        resetData()

        Toaster.success("Item added successfully")
    }, 500)

    const updateRateGrid = () => {
        let tempData = gridData[editIndex];

        switch (selectedPartType?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                if (gridData?.findIndex(item => item?.PartId === selectedPart?.value) !== editIndex) {
                    if (selectedPartList?.includes(selectedPart?.value)) {
                        Toaster.warning("This part has already been added to the table.")
                        return false
                    }
                }
                break;
            case NFR_BOP_STANDARD_ID:
                if (gridData?.findIndex(item => item?.BoughtOutPartChildId === selectedBOPNumber?.value) !== editIndex) {
                    if (selectedBOPList?.includes(selectedBOPNumber?.value)) {
                        Toaster.warning("This bought out part has already been added to the table.")
                        return false
                    }
                }
                break;
            case NFR_RAW_MATERIAL_ID:
                if (gridData?.findIndex(item => item?.RawMaterialCode === selectedRawMaterial?.label) !== editIndex) {
                    if (selectedRMList?.includes(selectedRawMaterial?.value)) {
                        Toaster.warning("This raw material has already been added to the table.")
                        return false
                    }
                }
                break;
            default:
                break;
        }

        tempData = {
            ...tempData,
            HeaderMaterial: getValues("HeaderMaterial"),
            PartType: selectedPartType?.label,
            PartTypeId: selectedPartType?.value,
            PartId: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? selectedPart?.value : '',
            PartNumber: selectedPart?.label,
            BoughtOutPartChildId: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.value : '',
            BoughtOutPartNumber: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.label : '',
            RawMaterialCode: selectedPartType?.value === NFR_RAW_MATERIAL_ID ? selectedRawMaterial?.label : '',
            NFRPartRawMaterialDetails: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? tempData?.NFRPartRawMaterialDetails : [],
            CustomerRFQNo: getValues("CustomerRFQNo"),
            CustomerName: customer?.label || '',
            PartName: getValues("PartName"),
            Description: getValues("Description"),
            UnitOfMeasurement: getValues("UnitOfMeasurement"),
            GroupCode: getValues("GroupCode"),
            Plant: selectedPlant?.label || '',
            ZBCLastSubmissionDate: zbcDate ? DayTime(zbcDate).format('DD/MM/YYYY') : '',
            QuotationLastSubmissionDate: cbcDate ? DayTime(cbcDate).format('DD/MM/YYYY') : '',
            Remarks: remarks
        }

        // Update the grid data
        let tempArray = Object.assign([...gridData], { [editIndex]: tempData })

        // Update the selected lists
        const boughtOutPartChildIdArray = [];
        const partIdArray = [];
        const rawMaterialCodeArray = [];

        tempArray?.forEach(item => {
            boughtOutPartChildIdArray?.push(item?.BoughtOutPartChildId);
            partIdArray?.push(item?.PartId);
            rawMaterialCodeArray?.push(item?.RawMaterialCode);
        });

        switch (selectedPartType?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setSelectedPartList(partIdArray)
                break;
            case NFR_BOP_STANDARD_ID:
                setSelectedBOPList(boughtOutPartChildIdArray)
                break;
            case NFR_RAW_MATERIAL_ID:
                setSelectedRMList(rawMaterialCodeArray)
                break;
            default:
                break;
        }

        // Update both gridData and rfqData
        setGridData(tempArray)
        setRfqData(tempArray)
        resetData()

        // Show success message
        Toaster.success("Item updated successfully")
    }

    const cancelEdit = () => {
        setEditIndex('')
        resetData()
    }

    const editItemDetails = (index) => {
        let tempObj = rfqData[index]
        setViewRMDetails(false)
        setEditIndex(index)

        errors.Quantity = {}
        
        setValue('HeaderMaterial', tempObj?.HeaderMaterial)
        setValue('Quantity', tempObj?.Quantity)
        setValue('CustomerRFQNo', tempObj?.CustomerRFQNo)
        setValue('Customer', tempObj?.CustomerName)
        setValue('PartName', tempObj?.PartName)
        setValue('PartNumber', tempObj?.PartNumber)
        setValue('Description', tempObj?.Description)
        setValue('Plant', tempObj?.Plant)
        setValue('UnitOfMeasurement', tempObj?.UnitOfMeasurement)
        setValue('GroupCode', tempObj?.GroupCode)

        // Set PartType and update related state
        setValue('PartType', { label: tempObj?.PartType, value: tempObj?.PartTypeId })
        setSelectedPartType({ label: tempObj?.PartType, value: tempObj?.PartTypeId })

        // Set Customer
        setValue('Customer', { label: tempObj?.CustomerName, value: tempObj?.CustomerId })
        setCustomer({ label: tempObj?.CustomerName, value: tempObj?.CustomerId })

        // Set Plant
        setValue('Plant', { label: tempObj?.Plant, value: tempObj?.Plant })
        setSelectedPlant({ label: tempObj?.Plant, value: tempObj?.Plant })

        // Set UOM
        setValue('UOM', { label: tempObj?.Uom, value: tempObj?.Uom })
        setSelectedUOM({ label: tempObj?.Uom, value: tempObj?.Uom })

        // Set Part details
        setValue('Part', { label: tempObj?.PartNumber, value: tempObj?.PartId })
        setSelectedPart({ label: tempObj?.PartNumber, value: tempObj?.PartId })

        // Set Raw Material if exists
        if (tempObj?.RawMaterialCode) {
            const rmId = filterRMFromList(rmSpecificationList, tempObj?.RawMaterialCode)[0]?.SpecificationId
            setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId })
            setSelectedRawMaterial({ label: tempObj?.RawMaterialCode, value: rmId })
        }

        // Set Customer
        if (tempObj?.CustomerName) {
            setCustomer({ label: tempObj?.CustomerName, value: tempObj?.CustomerName })
        }

        // Set plant
        if (tempObj?.Plant) {
            setSelectedPlant({ label: tempObj?.Plant, value: tempObj?.Plant })
        }

        // Set dates
        if (tempObj?.ZBCLastSubmissionDate) {
            setZbcDate(tempObj?.ZBCLastSubmissionDate)
        }
        if (tempObj?.QuotationLastSubmissionDate) {
            setCbcDate(tempObj?.QuotationLastSubmissionDate)
        }

        // Set remarks
        if (tempObj?.Remarks) {
            setRemarks(tempObj?.Remarks)
        }

        // Handle different part types
        switch (tempObj?.PartTypeId) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setValue('Part', { label: tempObj?.PartNumber, value: tempObj?.PartId })
                break;
            case NFR_BOP_STANDARD_ID:
                setValue('BOPNumber', { label: tempObj?.BoughtOutPartNumber, value: tempObj?.BoughtOutPartChildId })
                setSelectedBOPNumber({ label: tempObj?.BoughtOutPartNumber, value: tempObj?.BoughtOutPartChildId })
                break;
            case NFR_RAW_MATERIAL_ID:
                const rmId = filterRMFromList(rmSpecificationList, tempObj?.RawMaterialCode)[0]?.SpecificationId
                setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId })
                setSelectedRawMaterial({ label: tempObj?.RawMaterialCode, value: rmId })
                break;
            default:
                break;
        }
    }

    const deleteItem = (index) => {
        const updatedData = gridData.filter((_, i) => i !== index);
        setGridData(updatedData);
        setRfqData(updatedData)
        resetData()
    }

    const viewItemDetails = () => {
        setViewRMDetails(true)
        setOpenAddForecast(true)
    }

    // File upload related functions
    const handleChangeStatus = ({ meta, file }, status) => {
        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files && files.filter(item => item?.OriginalFileName !== removedFileName)
            setFiles(tempArr)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            if (!validateFileName(file.name)) {
                dropzone.current.files.pop()
                setDisableFalseFunction()
                return false;
            }
            setApiCallCounter(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
            setAttachmentLoader(true);

            dispatch(fileUploadQuotation(data, (res) => {
                if (res && res?.status !== 200) {
                    dropzone.current.files.pop()
                    setDisableFalseFunction()
                    return false
                }
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
            setAttachmentLoader(false)
            dropzone.current.files.pop()
            Toaster.warning("Something went wrong")
        }
    }

    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let tempArr = files.filter((item) => item?.FileId !== FileId)
            setFiles(tempArr);
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item?.FileName !== OriginalFileName)
            setFiles(tempArr)
        }
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }

    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files?.length) - Number(files?.length)
        if (Number(loop) === 1 || Number(dropzone.current.files?.length) === Number(files?.length)) {
            // No action needed
        }
    }

    // Drawer related functions
    const addRMDetails = (index) => {
        setRMDetailsGridIndex(index);

        const currentRMDetails = gridData[index]?.NFRPartRawMaterialDetails || [];

        setRMDetails(currentRMDetails);
    }

    const openAndCloseDrawer = (isSave, dataList = [], rmDetails = []) => {

        setOpenAddRMDetails(false);

        if (isSave === true && ((dataList && dataList.length > 0) || (rmDetails && rmDetails.length > 0))) {
            setRMDetails(rmDetails);

            setSopQuantityList([...dataList]);

            // Update the gridData with the new RM details
            if (rmDetailsGridIndex !== '') {
                const updatedGridData = [...gridData];
                updatedGridData[rmDetailsGridIndex] = {
                    NFRPartRawMaterialDetails: rmDetails
                };
                setGridData(updatedGridData);
            }

            // Show success message
            Toaster.success("RM details saved successfully");
        }

        // Close the forecast drawer
        setOpenAddForecast(false);
    }

    const cancel = (isSaveAPICalled = false) => {
        props?.closeDrawer(isSaveAPICalled)
    }

    const filterRMFromList = (rmSpecificationList, RawMaterialCode) => {
        return rmSpecificationList && rmSpecificationList?.filter(item => item?.RawMaterialCode === RawMaterialCode)
    }

    // Form submission function
    const onSubmit = (values) => {
        // Prepare the request object with all the necessary data
        let requestObj = {
            "CustomerRFQNo": values?.CustomerRFQNo,
            "GroupCode": values?.GroupCode,
            "Plant": [{
                "PlantName": selectedPlant?.label,
                "PlantId": selectedPlant?.value,
                "PlantCode": selectedPlant?.plantCode
            }],
            "CustomerName": customer,
            "PartNumber": selectedPart,
            "PartName": values?.CustomerPartName,
            "PartDescription": values?.CustomerPartDescription,
            "UOM": values?.UnitOfMeasurement,
            "SOPDate": sopDate,
            "LastSubmissionDate": zbcDate,
            "Files": files
        }
        
        setLoader(true);
        dispatch(createNFRBOMDetails(requestObj, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Customer RFQ created successfully.");
            }
            setLoader(false);
            cancel(true);
        }));
    }

    const loaderObj = { isLoader: inputLoader }
    const VendorLoaderObj = { isLoader: VendorInputLoader }

    return (
        <>
            <div className="container-fluid">
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-6">
                            <h1>
                                {isViewFlag ? 'View Customer RFQ' : 'Add Customer RFQ'}  <TourWrapper
                                    buttonSpecificProp={{ id: "Create_Manual_Nfr_Form" }}
                                    stepsSpecificProp={{
                                        steps: Steps(t).ADD_NFR
                                    }} />
                            </h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <>
                                        <Row>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Customer RFQ No."
                                                    name={"CustomerRFQNo"}
                                                    id="AddNFR_Customer_RFQ_No"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    rules={{
                                                        required: true,
                                                        validate: { maxLength20, minLength3 },
                                                    }}
                                                    mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.CustomerRFQNo}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>

                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Customer Name"}
                                                    name={"Customer"}
                                                    id="AddNFR_Customer_Name"
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    defaultValue={customer.length !== 0 ? customer : ""}
                                                    options={renderListing("Customer")}
                                                    mandatory={true}
                                                    handleChange={handleCustomerChange}
                                                    errors={errors.Customer}
                                                    isLoading={VendorLoaderObj}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Part Type"}
                                                    name={`PartType`}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    mandatory={true}
                                                    customClassName="costing-version"
                                                    options={renderListing("PartType")}
                                                    handleChange={(newValue) => handleChangePartType(newValue)}
                                                    errors={errors?.PartType}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>

                                            <Col md="3" className="input-container">
                                                <div id="AddNFR_Customer_Part_No" className="d-flex">
                                                    <AsyncSearchableSelectHookForm
                                                        label={"Part No."}
                                                        name={"Part"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: true }}
                                                        register={register}
                                                        defaultValue={selectedPart?.length !== 0 ? selectedPart : ""}
                                                        asyncOptions={filterList}
                                                        mandatory={true}
                                                        isLoading={loaderObj}
                                                        handleChange={handlePartChange}
                                                        errors={errors?.Part}
                                                        disabled={isViewFlag}
                                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                    />
                                                    <button
                                                        id="AddNFR_AddForecast"
                                                        className="user-btn mt-30 ml-3"
                                                        title="Add RM & Forecast"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setOpenAddForecast(true);
                                                        }}
                                                        type="button"
                                                        disabled={!selectedPart}
                                                    >
                                                        {rmDetails?.length > 0 ? <div className="view mr-2"></div> : <div className="plus"></div>}
                                                    </button>
                                                </div>
                                            </Col>
                                            <Col md="3" className="input-container">
                                                <TextFieldHookForm
                                                    label="Part Name"
                                                    name={"PartName"}
                                                    id="AddNFR_Part_Name"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.CustomerPartName}
                                                    disabled={true}
                                                />
                                            </Col>

                                            <Col md="3" className="input-container">
                                                <TextFieldHookForm
                                                    label="Part Description"
                                                    name={"Description"}
                                                    id="AddNFR_Part_Description"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.CustomerPartDescription}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md="3" className="input-container">
                                                <TextFieldHookForm
                                                    label={'UOM'}
                                                    name={'UnitOfMeasurement'}
                                                    id="AddNFR_UOM"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: true }}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors.Uom}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Group Code"
                                                    name={"GroupCode"}
                                                    id="AddNFR_Product_Code"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Select"}
                                                    control={control}
                                                    register={register}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.GroupCode}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Segment"}
                                                    name={`Segment`}
                                                    id="AddNFR_Segment"
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    options={renderListing("Segment")}
                                                    errors={errors?.Segment}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                            <Col md="3" className="input-container">
                                                <SearchableSelectHookForm
                                                    label={"Plant"}
                                                    name={`Plant`}
                                                    id="AddNFR_Plant"
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    mandatory={true}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    options={renderListing("Plant")}
                                                    handleChange={(newValue) => handleChangePlant(newValue)}
                                                    errors={errors?.Plant}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>ZBC Last Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="ZBC Last Submission Date"
                                                            id="AddNFR_ZBC_Date"
                                                            selected={DayTime(zbcDate).isValid() ? new Date(zbcDate) : ''}
                                                            onChange={handleZBCDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={new Date()}
                                                            maxDate={sopDate ? new Date(sopDate) : null}
                                                            placeholderText="Select Date"
                                                            className="withBorder"
                                                            mandatory={true}
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            yearDropdownItemNumber={100}
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isViewFlag}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>Quotation Last Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="Quotation Last Submission Date"
                                                            id="AddNFR_CBC_Date"
                                                            selected={DayTime(cbcDate).isValid() ? new Date(cbcDate) : ''}
                                                            onChange={handleCBCDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={new Date(zbcDate)}
                                                            maxDate={sopDate ? new Date(sopDate) : null}
                                                            placeholderText="Select Date"
                                                            className="withBorder"
                                                            mandatory={true}
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            yearDropdownItemNumber={100}
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isViewFlag}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="3">
                                                <div className='pt-2 pr-0'>
                                                    {editIndex !== '' ? (
                                                        <>
                                                            <button type="button" className={"btn btn-primary mt30 pull-left mr5"} onClick={updateRateGrid}>Update</button>
                                                            <button
                                                                type="button"
                                                                className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                                                onClick={() => cancelEdit()}
                                                            >
                                                                <div className={"cancel-icon"}></div>Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button id="AddNFR_AddData"
                                                                type="button"
                                                                className={"user-btn mt30 pull-left"}
                                                                onClick={addTableHandler}
                                                            >
                                                                <div className={"plus"}></div>ADD
                                                            </button>
                                                            <button
                                                                id="AddNFR_ResetData"
                                                                type="button"
                                                                className={"mr15 ml-1 mt30 reset-btn"}
                                                                onClick={() => resetData()}
                                                            >
                                                                Reset
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="12">
                                                <Table className="table border" size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>{`Part Type`}</th>
                                                            <th>{`Part Number`}</th>
                                                            <th>{`Part Name`}</th>
                                                            <th>{`Customer RFQ No.`}</th>
                                                            <th>{`Customer Name`}</th>
                                                            <th>{`Description`}</th>
                                                            <th>{`Plant`}</th>
                                                            <th>{`UOM`}</th>
                                                            <th>{`Group Code`}</th>
                                                            <th>{`Segment`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rfqData && rfqData?.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{item.PartType ? item.PartType : '-'}</td>
                                                                    <td>{item.PartNumber ? item.PartNumber : '-'}</td>
                                                                    <td>{item.PartName ? item.PartName : '-'}</td>
                                                                    <td>{item.CustomerRFQNo ? item.CustomerRFQNo : '-'}</td>
                                                                    <td>{item.CustomerName ? item.CustomerName : '-'}</td>
                                                                    <td>{item.Description ? item.Description : '-'}</td>
                                                                    <td>{item.Plant ? item.Plant : '-'}</td>
                                                                    <td>{item.UnitOfMeasurement ? item.UnitOfMeasurement : '-'}</td>
                                                                    <td>{item.GroupCode ? item.GroupCode : '-'}</td>
                                                                    <td>{item.Segment ? item.Segment : '-'}</td>
                                                                    <td>
                                                                        <button
                                                                            className="Edit mr-2"
                                                                            title='Edit'
                                                                            type={"button"}
                                                                            disabled={item?.IsAssociated}
                                                                            onClick={() => editItemDetails(index)}
                                                                        />
                                                                        <button
                                                                            className="View mr-2"
                                                                            title='View'
                                                                            type={"button"}
                                                                            disabled={item?.IsAssociated}
                                                                            onClick={viewItemDetails}
                                                                        />
                                                                        <button
                                                                            className="Delete "
                                                                            title='Delete'
                                                                            type={"button"}
                                                                            disabled={item?.IsAssociated}
                                                                            onClick={() => deleteItem(index)}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>

                                                    {rfqData?.length === 0 && (
                                                        <tbody className='border'>
                                                            <tr>
                                                                <td colSpan={"12"}> <NoContentFound title={EMPTY_DATA} /></td>
                                                            </tr>
                                                        </tbody>
                                                    )}
                                                </Table>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <div className="left-border">
                                                    {"Remarks & Attachments:"}
                                                </div>
                                            </Col>
                                            <Col md="6">
                                                <TextAreaHookForm
                                                    label={"Remarks"}
                                                    name={"remark"}
                                                    placeholder={"Type here..."}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    value={remarks}
                                                    customClassName={"withBorder"}
                                                    handleChange={(e) => { handleRemarkChange(e.target.value) }}
                                                    errors={errors.remark}
                                                    rowHeight={6}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                            <Col md="3" className="height152-label">
                                                <label>Upload Attachment (upload up to 4 files) <AttachmentValidationInfo /> </label>
                                                <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                                    Maximum file upload limit has been reached.
                                                </div>
                                                <div id="AddNFR_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                                    <Dropzone
                                                        ref={dropzone}
                                                        onChangeStatus={handleChangeStatus}
                                                        PreviewComponent={Preview}
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
                                                                        <span className="text-primary">Browse </span>
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
                                                        disabled={isViewFlag}
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

                                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                                            <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                                                <button
                                                    id="AddNFR_CancelData"
                                                    type={'button'}
                                                    className="reset cancel-btn mr-2"
                                                    onClick={cancel}
                                                >
                                                    <div className={'cancel-icon'}></div> {'Cancel'}
                                                </button>
                                                <button
                                                    id="SaveNFR_SubmitData"
                                                    type={'submit'}
                                                    className="submit-button save-btn mr-2"
                                                    disabled={isViewFlag}
                                                >
                                                    <div className={"save-icon"}></div> {'Save'}
                                                </button>
                                                <button
                                                    id="AddNFR_SubmitData"
                                                    type={'submit'}
                                                    disabled={isViewFlag}
                                                    className="submit-button save-btn"
                                                    value="send"
                                                >
                                                    <div className="send-for-approval mr-1"></div>Submit
                                                </button>
                                            </div>
                                        </Row>
                                    </>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {loader && <LoaderCustom customClass="Rfq-Loader" />}

            {openAddForecast &&
                <AddForecast
                    isOpen={openAddForecast}
                    closeDrawer={openAndCloseDrawer}
                    anchor={'right'}
                    isViewFlag={isViewFlag || viewRMDetails}
                    partListData={partListData}
                    rmDetails={rmDetails}
                    sopDate={sopDate}
                    handleSOPDateChange={handleSOPDateChange}
                    zbcDate={zbcDate}
                    errors={errors}
                    gridOptionsPart={gridOptionsPart}
                    onGridReady={onGridReady}
                    EditableCallback={!isViewFlag}
                    partType={selectedPartType}
                    AssemblyPartNumber={selectedPart}
                    sopQuantityList={sopQuantityList}
                    setSopQuantityList={setSopQuantityList}
                    addrmdetails={addRMDetails}
                />
            }
        </>
    );
}

export default CreateManualNFR;