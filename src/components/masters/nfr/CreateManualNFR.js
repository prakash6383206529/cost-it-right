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
import DayTime from '../../common/DayTimeWrapper';
import TourWrapper from "../../common/Tour/TourWrapper";
import NoContentFound from '../../common/NoContentFound';

// Actions
import { getGroupCodeSelectList, getPlantSelectListByType, getSegmentSelectList, getUOMSelectList } from '../../../actions/Common';
import { getProductGroupSelectList, getSelectListPartType } from '../actions/Part';
import { getPartInfo } from '../../costing/actions/Costing';
import { getRMSpecificationDataList, getRawMaterialNameChild } from '../../masters/actions/Material';
import { getClientSelectList } from '../actions/Client';
import { fileUploadQuotation } from '../../rfq/actions/rfq';
import { getPartSelectListWtihRevNo } from '../actions/Volume';

// Constants and Config
import { FILE_URL, ZBC, searchCount, PRODUCT_ID, EMPTY_DATA, EMPTY_GUID } from '../../../config/constants';
import { AcceptableRMUOM, NFR_COMPONENT_CUSTOMIZED_ID, NFR_RAW_MATERIAL_ID } from '../../../config/masterData';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { Steps } from './TourMessages';

// Helpers
import { autoCompleteDropdownPart } from '../../common/CommonFunctions';
import { maxLength20, validateFileName, minLength3 } from "../../../helper/validation";
import AddForecast from './AddForecast';
// Assets
import redcrossImg from '../../../assests/images/red-cross.png';
import BOMViewer from '../part-master/BOMViewer';
import { loggedInUserId } from '../../../helper';
import { createCustomerRfq, getCustomerRfqDetails, updateCustomerRfq } from './actions/nfr';

function CreateManualNFR(props) {
    const { t } = useTranslation("Nfr")
    const { isViewFlag, partListData, cbcGrid, isEditFlag } = props;
    const dropzone = useRef(null);
    const { handleSubmit: handleSubmitTableForm, formState: { errors }, register, control, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    })
    const dispatch = useDispatch();

    // Redux selectors
    const plantSelectList = useSelector(state => state?.comman?.plantSelectList);
    const UOMSelectList = useSelector(state => state?.comman?.UOMSelectList)
    const { rmSpecificationList } = useSelector((state) => state?.material);
    const clientSelectList = useSelector((state) => state?.client?.clientSelectList)
    const initialConfiguration = useSelector((state) => state?.auth?.initialConfiguration)

    // Unified state object
    const [state, setState] = useState({
        sopQuantityList: [],
        zbcDate: '',
        cbcDate: '',
        sopDate: '',
        editIndex: '',
        remarks: '',
        gridColumnApi: null,
        gridApi: null,
        fiveyearList: [],
        gridData: [],
        rfqData: [],
        rmDetails: [],
        selectedPartList: [],
        selectedRMList: [],
        files: [],
        partTypeList: [],
        segmentList: [],
        groupCodeList: [],
        partDetails: [],
        rmDetailsGridIndex: '',
        apiCallCounter: 0,
        attachmentLoader: false,
        fieldDisabled: false,
        openBOMViewer: false,
        inputLoader: false,
        loader: false,
        VendorInputLoader: false,
        openAddForecast: false,
        isViewMode: false,
    });

    useEffect(() => {
        if (!isViewFlag) {
            dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
            dispatch(getUOMSelectList(() => { }))
            dispatch(getSelectListPartType((res) => {
                setState(prevState => ({ ...prevState, partTypeList: res?.data?.SelectList }));
            }))
            dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
            dispatch(getRawMaterialNameChild(() => { }))
            dispatch(getSegmentSelectList((res) => {
                setState(prevState => ({ ...prevState, segmentList: res?.data?.SelectList }));
            }))
            setState(prevState => ({ ...prevState, VendorInputLoader: true }));
            dispatch(getClientSelectList((res) => {
                setState(prevState => ({ ...prevState, VendorInputLoader: false }));
            }))
            dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
            let tempArr = [];
            cbcGrid && cbcGrid.map(el => {
                tempArr.push(el.CustomerId)
                return null;
            })
            initialConfiguration?.IsDestinationPlantConfigure === false && setValue('Customer', tempArr);
        }
    }, [])

    useEffect(() => {
        if (isEditFlag || isViewFlag) {
            setState(prevState => ({
                ...prevState,
                loader: true
            }));
            dispatch(getCustomerRfqDetails(props?.data?.NfrId, loggedInUserId(), (res) => {
                const Data = res?.data?.Data?.[0];
                const partwiseDetail = res?.data?.Data?.[0]?.NfrPartwiseDetailResponse?.[0];
                const partDetail = partwiseDetail?.PartDetailResponses?.[0];
                setState(prevState => ({
                    ...prevState,
                    files: Data?.NfrAttachments || [],
                    sopQuantityList: partwiseDetail?.ForecastQuantities || [],
                    remarks: Data?.Remarks || '',
                    zbcDate: Data?.ZBCLastSubmissionDate || '',
                    cbcDate: Data?.QuotationLastSubmissionDate || '',
                    sopDate: partwiseDetail?.SOPDate || null,
                    rmDetails: partDetail?.NfrRawMaterialList,
                    loader: false
                }));

                setValue('CustomerRFQNo', Data?.CustomerRFQNumber || '');
                setValue('Plant', { label: Data?.PlantName, value: Data?.PlantId });
                setValue('Customer', { label: Data?.CustomerName, value: Data?.CustomerId });
                const formValues = [{
                    PartType: { label: partwiseDetail?.PartType, value: partwiseDetail?.PartTypeId },
                    Part: { label: partwiseDetail?.PartNumber, value: partwiseDetail?.PartId },
                    PartName: partwiseDetail?.PartName || '',
                    PartNumber: partwiseDetail?.PartNumber || '',
                    Description: partwiseDetail?.PartDescription || '',
                    UnitOfMeasurement: { label: partwiseDetail?.UOM, value: partwiseDetail?.UOMId },
                    GroupCode: { label: partwiseDetail?.GroupCode, value: partwiseDetail?.GroupCodeId },
                    Segment: { label: Data?.Segment, value: Data?.SegmentId },
                    ZBCLastSubmissionDate: Data?.ZBCLastSubmissionDate ? DayTime(Data?.ZBCLastSubmissionDate).format('DD/MM/YYYY') : "-" || '',
                    QuotationLastSubmissionDate: Data?.QuotationLastSubmissionDate ? DayTime(Data?.QuotationLastSubmissionDate).format('DD/MM/YYYY') : "-" || '',
                }];
                setState(prevState => ({ ...prevState, rfqData: formValues }));
                // addTableHandler();
            }))
        }
    }, [isEditFlag, isViewFlag])

    const renderListing = (value) => {
        const temp = [];

        switch (value) {
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
                state.partTypeList && state.partTypeList?.map(item => {
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

            case 'RawMaterial':
                rmSpecificationList && rmSpecificationList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
                    return null;
                });
                break;
            case 'Segment':
                state.segmentList && state.segmentList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                break;
            case 'GroupCode':
                state.groupCodeList && state.groupCodeList?.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                break;

            default:
                return null;
        }
        return temp;
    }

    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if ((inputValue?.length >= searchCount && getValues('PartName') !== resultInput) || (inputValue?.length >= searchCount)) {
            setState(prevState => ({ ...prevState, inputLoader: true }));
            const res = await getPartSelectListWtihRevNo(resultInput, null, null, getValues('PartType')?.value);
            setState(prevState => ({ ...prevState, inputLoader: false }));
            setValue('PartName', resultInput);
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

    useEffect(() => {
        if (state.rmDetails && state.rmDetails.length > 0) {
            setState(prevState => ({ ...prevState, rmDetails: state.rmDetails }));
        }
    }, [state.rmDetails]);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setState(prevState => ({ ...prevState, gridColumnApi: params.columnApi }));
        setState(prevState => ({ ...prevState, gridApi: params.api }));
        params.api.paginationGoToPage(0);
    };

    const resetData = () => {
        errors.Quantity = {};
        setValue("PartType", '');
        setValue("Part", '');
        setValue("PartNumber", '');
        setValue("GroupCode", '');
        setValue("Segment", '');
        setValue("PartName", '');
        setValue("Description", '');
        setValue("UnitOfMeasurement", '');
    }

    // Event handlers for form fields
    const handleChangePartType = (value) => {
        setValue("PartType", value);
        setValue("Part", '');
        setState(prevState => ({ ...prevState, rmDetails: [], sopQuantityList: [] }));
    }

    const handlePartChange = (newValue) => {
        if (getValues("Part")?.value !== newValue?.value) {
            setState(prevState => ({ ...prevState, rmDetails: [], sopQuantityList: [], groupCodeList: [] }));
        }
        setValue("Part", newValue);

        if (newValue && newValue !== '') {
            dispatch(getPartInfo(newValue.value, (res) => {
                let Data = res.data.Data;
                setState(prevState => ({ ...prevState, isViewFlag: true }));

                setValue('PartName', Data?.PartName ? Data.PartName : '');
                setValue('Description', Data?.Description ? Data.Description : '');
                setValue('UnitOfMeasurement', { label: Data?.UnitOfMeasurementSymbol, value: Data?.UnitOfMeasurementId });
                dispatch(getGroupCodeSelectList(newValue.value, (res) => {
                    setState(prevState => ({ ...prevState, groupCodeList: res?.data?.SelectList }));
                }))
                if (state.sopDate) {
                    const newSopQuantityList = state.fiveyearList.map(yearItem => ({
                        PartNumber: newValue?.label || '',
                        YearName: yearItem.toString(),
                        Quantity: 0,
                        SOPDate: state.sopDate
                    }));

                    setState(prevState => ({ ...prevState, sopQuantityList: newSopQuantityList }));
                }
            }));
        } else {
            setValue('PartName', '');
            setValue('Description', '');
            setValue('UnitOfMeasurement', '');
        }
    }

    const handleChangePlant = (newValue) => {
        setValue("Plant", newValue);
    }

    const handleCustomerChange = (newValue) => {
        if (newValue && newValue !== '') {
            setValue("Customer", newValue);
        }
    }

    const handleRemarkChange = (newValue) => {
        setValue("Remarks", newValue);
    }

    // Date change handlers
    const handleZBCDateChange = (date) => {
        setState(prevState => ({
            ...prevState,
            zbcDate: DayTime(date).isValid() ? DayTime(date) : ''
        }));
    };

    const handleCBCDateChange = (date) => {
        setState(prevState => ({
            ...prevState,
            cbcDate: DayTime(date).isValid() ? DayTime(date) : ''
        }));
    };

    const handleChangeSegment = (newValue) => {
        setValue("Segment", newValue);
    }
    const handleGroupCodeChange = (newValue) => {
        setValue("GroupCode", newValue);
    }

    const handleSOPDateChange = (date) => {
        const newDate = DayTime(date).isValid() ? DayTime(date) : '';

        // Validate that SOP date is not before ZBC date
        if (state.zbcDate && newDate && new Date(newDate) < new Date(state.zbcDate)) {
            Toaster.warning("SOP Date cannot be before ZBC Last Submission Date");
            return;
        }

        setState(prevState => ({ ...prevState, sopDate: newDate }));

        let year = new Date(date).getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(year + i);
        }
        setState(prevState => ({ ...prevState, fiveyearList: years }));

        if (date) {
            const partNumber = getValues('Part')?.label || '';

            const newSopQuantityList = years.map(yearItem => ({
                PartNumber: partNumber,
                YearName: yearItem.toString(),
                Quantity: 0,
                SOPDate: state.sopDate
            }));

            setState(prevState => ({ ...prevState, sopQuantityList: newSopQuantityList }));
        }
    };

    const addTableHandler = debounce(() => {
        // Check if required fields are filled
        if (!getValues("CustomerRFQNo") || !getValues("Customer") || !getValues("PartType") || !getValues("Plant")) {
            Toaster.warning("Please fill all the required fields")
            return false
        }
        let obj = {
            PartType: getValues("PartType"),
            Part: getValues("Part"),
            PartNumber: getValues("Part")?.label,
            PartName: getValues("PartName"),
            Segment: getValues("Segment"),
            Description: getValues("Description"),
            UnitOfMeasurement: getValues("UnitOfMeasurement"),
            GroupCode: getValues("GroupCode"),
            ZBCLastSubmissionDate: state?.zbcDate ? DayTime(state?.zbcDate).format('DD/MM/YYYY') : '',
            QuotationLastSubmissionDate: state?.cbcDate ? DayTime(state?.cbcDate).format('DD/MM/YYYY') : '',
        }

        switch (getValues("PartType")?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setState(prevState => ({
                    ...prevState,
                    selectedPartList: [...prevState.selectedPartList, getValues("Part")?.value]
                }));
                break;
            case NFR_RAW_MATERIAL_ID:
                setState(prevState => ({
                    ...prevState,
                    selectedRMList: [...prevState.selectedRMList, getValues("RawMaterial")?.value]
                }));
                break;
            default:
                break;
        }

        let tempData = state.rfqData ? [...state.rfqData] : []
        tempData.push(obj)
        setState(prevState => ({
            ...prevState,
            gridData: tempData,
            rfqData: tempData,
            fieldDisabled: true,
            editIndex: ''
        }));
        // resetData();

    }, 500)

    const updateRateGrid = () => {
        // let tempData = state.gridData[state.editIndex];
        let tempData = state.rfqData[state.editIndex];
        let hasChanges = false;

        // First check for duplicate parts/raw materials
        switch (getValues("PartType")?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                if (state.gridData?.findIndex(item => item?.PartId === getValues("Part")?.value) !== state.editIndex) {
                    if (state.selectedPartList?.includes(getValues("Part")?.value)) {
                        Toaster.warning("This part has already been added to the table.")
                        return false
                    }
                }
                break;
            case NFR_RAW_MATERIAL_ID:
                if (state.gridData?.findIndex(item => item?.RawMaterialCode === getValues("RawMaterial")?.label) !== state.editIndex) {
                    if (state.selectedRMList?.includes(getValues("RawMaterial")?.value)) {
                        Toaster.warning("This raw material has already been added to the table.")
                        return false
                    }
                }
                break;
            default:
                break;
        }

        const newData = {
            ...tempData,
            PartType: getValues("PartType") || '',
            PartNumber: getValues("Part")?.label || '',
            Part: getValues("Part"),
            PartName: getValues("PartName") || '',
            Segment: getValues("Segment") || '',
            Description: getValues("Description") || '',
            UnitOfMeasurement: getValues("UnitOfMeasurement") || '',
            GroupCode: getValues("GroupCode") || '',
            ZBCLastSubmissionDate: state.zbcDate ? DayTime(state.zbcDate).format('DD/MM/YYYY') : '',
            QuotationLastSubmissionDate: state.cbcDate ? DayTime(state.cbcDate).format('DD/MM/YYYY') : '',
        }

        // Check if any field has been updated
        Object.keys(newData).forEach(key => {
            if (tempData && JSON.stringify(tempData[key]) !== JSON.stringify(newData[key])) {
                hasChanges = true;
            }
        });

        if (!hasChanges) {
            Toaster.warning("No changes were made to update.")
            return;
        }

        // Update the grid data
        let tempArray = Object.assign([...state.gridData], { [state.editIndex]: newData })

        // Update the selected lists
        const partIdArray = [];
        const rawMaterialCodeArray = [];

        tempArray?.forEach(item => {
            if (item?.PartId) partIdArray.push(item.PartId);
            if (item?.RawMaterialCode) rawMaterialCodeArray.push(item.RawMaterialCode);
        });

        switch (getValues("PartType")?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setState(prevState => ({ ...prevState, selectedPartList: partIdArray }));
                break;
            case NFR_RAW_MATERIAL_ID:
                setState(prevState => ({ ...prevState, selectedRMList: rawMaterialCodeArray }));
                break;
            default:
                break;
        }
        setState(prevState => ({ ...prevState, gridData: tempArray, rfqData: tempArray, fieldDisabled: true, editIndex: '' }));
        // resetData();
        Toaster.success("Item updated successfully")
    }

    const cancelEdit = () => {
        setState(prevState => ({ ...prevState, fieldDisabled: true, editIndex: '' }));
    }

    const editItemDetails = (isView, index) => {
        let tempObj = state.rfqData[index]

        setState(prevState => ({ ...prevState, editIndex: index, fieldDisabled: false, isViewMode: isView, errors: {} }));
        setValue('PartType', tempObj?.PartType);
        setValue('Part', tempObj?.Part);
        setValue('PartName', tempObj?.PartName);
        setValue('Description', tempObj?.Description);
        setValue('PartNumber', tempObj?.Part?.label);
        setValue('UnitOfMeasurement', tempObj?.UnitOfMeasurement);
        setValue('GroupCode', tempObj?.GroupCode);
        setValue('UnitOfMeasurement', tempObj?.UnitOfMeasurement);
        setValue('Segment', tempObj?.Segment)

        // Set Raw Material if exists
        if (tempObj?.RawMaterialCode) {
            const rmId = filterRMFromList(rmSpecificationList, tempObj?.RawMaterialCode)[0]?.SpecificationId;
            setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId });
            setState(prevState => ({ ...prevState, selectedRawMaterial: { label: tempObj?.RawMaterialCode, value: rmId } }));
        }

        // Handle different part types
        switch (tempObj?.PartTypeId) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setValue('Part', { label: tempObj?.PartNumber, value: tempObj?.PartId });
                break;
            case NFR_RAW_MATERIAL_ID:
                const rmId = filterRMFromList(rmSpecificationList, tempObj?.RawMaterialCode)[0]?.SpecificationId;
                setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId });
                setState(prevState => ({ ...prevState, selectedRawMaterial: { label: tempObj?.RawMaterialCode, value: rmId } }));
                break;
            default:
                break;
        }
    }

    const deleteItem = (index) => {
        const updatedData = state.gridData.filter((_, i) => i !== index);
        setState(prevState => ({ ...prevState, gridData: updatedData, rfqData: updatedData, fieldDisabled: false, isViewMode: false }));
        resetData();
    }

    const viewItemDetails = () => {
        setState(prevState => ({ ...prevState, isViewFlag: true, fieldDisabled: true }));
    }

    const toggleBOMViewer = () => {
        if (getValues("Part")?.value) {
            setState(prevState => ({ ...prevState, openBOMViewer: !prevState.openBOMViewer }));
        }
    }

    // File upload related functions
    const handleChangeStatus = ({ meta, file }, status) => {
        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = state.files && state.files.filter(item => item?.OriginalFileName !== removedFileName)
            setState(prevState => ({ ...prevState, files: tempArr }));
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            if (!validateFileName(file.name)) {
                dropzone.current.files.pop()
                setDisableFalseFunction()
                return false;
            }
            setState(prevState => ({ ...prevState, apiCallCounter: prevState.apiCallCounter + 1 }));
            setState(prevState => ({ ...prevState, attachmentLoader: true }));

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
                    setState(prevState => ({ ...prevState, attachmentLoader: false }));
                }
                else {
                    let Data = res.data[0]
                    setState(prevState => ({ ...prevState, files: [...prevState.files, Data] })); // Update the state using the callback function
                }
                setState(prevState => ({ ...prevState, apiCallCounter: prevState.apiCallCounter - 1 }));
                if (state.apiCallCounter === 0) {
                    setState(prevState => ({ ...prevState, attachmentLoader: false }));
                }
            }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, docx, pptx jpeg, pdf, zip files.');
        } else if (status === 'error_file_size') {
            setDisableFalseFunction()
            setState(prevState => ({ ...prevState, attachmentLoader: false }));
            dropzone.current.files.pop()
            Toaster.warning("File size greater than 20 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            setState(prevState => ({ ...prevState, attachmentLoader: false }));
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
            let tempArr = state.files.filter((item) => item?.FileId !== FileId)
            setState(prevState => ({ ...prevState, files: tempArr }));
        }
        if (FileId == null) {
            let tempArr = state.files && state.files.filter(item => item?.FileName !== OriginalFileName)
            setState(prevState => ({ ...prevState, files: tempArr }));
        }
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }

    const setDisableFalseFunction = () => {
        const loop = Number(dropzone.current.files?.length) - Number(state.files?.length)
        if (Number(loop) === 1 || Number(dropzone.current.files?.length) === Number(state.files?.length)) {
            // No action needed
        }
    }

    const openAndCloseDrawer = (isSave, dataList = [], rmDetails = []) => {

        if (isSave === true && ((dataList && dataList.length > 0) || (rmDetails && rmDetails.length > 0))) {
            setState(prevState => ({ ...prevState, rmDetails: rmDetails }));

            setState(prevState => ({ ...prevState, sopQuantityList: [...dataList] }));

            // Update the gridData with the new RM details
            if (state.rmDetailsGridIndex !== '') {
                const updatedGridData = [...state.gridData];
                updatedGridData[state.rmDetailsGridIndex] = {
                    ...updatedGridData[state.rmDetailsGridIndex],
                    NFRPartRawMaterialDetails: rmDetails
                };
                setState(prevState => ({ ...prevState, gridData: updatedGridData }));
            }

            // Show success message
            Toaster.success("RM details saved successfully");
        }

        // Close the forecast drawer
        setState(prevState => ({ ...prevState, openAddForecast: false }));
    }

    const cancel = (isSaveAPICalled = false) => {
        props?.closeDrawer(isSaveAPICalled)
    }

    const filterRMFromList = (rmSpecificationList, RawMaterialCode) => {
        return rmSpecificationList && rmSpecificationList?.filter(item => item?.RawMaterialCode === RawMaterialCode)
    }

    // Form submission function
    const onSubmit = (type = false) => {
        if (state.rfqData?.length === 0) {
            Toaster.warning("Please add at least one part to the table.")
            return false
        }

        const obj = {
            "NfrId": props?.data?.NfrId ? props?.data?.NfrId : EMPTY_GUID,
            "CustomerRFQNumber": getValues("CustomerRFQNo"),
            "CustomerId": getValues("Customer")?.value,
            "QuotationLastSubmissionDate": state.cbcDate,
            "ZBCLastSubmissionDate": state.zbcDate,
            "PlantId": getValues("Plant")?.value,
            "LoggedInUserId": loggedInUserId(),
            "Remarks": state.remarks,
            "GroupCodeId": getValues("GroupCode")?.value,
            "SegmentId": getValues("Segment")?.value,
            "IsSent": type,
            "NfrPartwiseDetailRequest": [
                {
                    "TechnologyId": 7,
                    "PartId": getValues("Part")?.value,
                    "GroupCodeId": getValues("GroupCode")?.value,
                    "PartTypeId": getValues("PartType")?.value,
                    "SegmentId": getValues("Segment")?.value,
                    "UOMId": getValues("UnitOfMeasurement")?.value,
                    "SOPDate": state.sopDate,
                    "PartDetailResponses": [
                        {
                            "PartId": getValues("Part")?.value,
                            "PartTypeId": getValues("PartType")?.value,
                            "NfrRawMaterialList": state.rmDetails
                        }
                    ],
                    "ForecastQuantities": state.sopQuantityList
                }
            ],
            "NfrAttachments": state.files
        }   
        setState(prevState => ({ ...prevState, loader: true }));
        if (!isEditFlag) {
            dispatch(createCustomerRfq(obj, (res) => {
                if (res?.data?.Result) {
                    Toaster.success("Customer RFQ created successfully.");
                }
                setState(prevState => ({ ...prevState, loader: false }));
                cancel(true);
            }));
        } else {
            dispatch(updateCustomerRfq(obj, (res) => {
                if (res?.data?.Result) {
                    Toaster.success("Customer RFQ updated successfully.");
                }
                setState(prevState => ({ ...prevState, loader: false }));
                cancel(true);
            }));
        }
    }

    const loaderObj = { isLoader: state.inputLoader }
    const VendorLoaderObj = { isLoader: state.VendorInputLoader }

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
                                <Row>
                                    <Col md="12">
                                        <div className="left-border">
                                            {"Customer RFQ Details:"}
                                        </div>
                                    </Col>
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
                                            disabled={isViewFlag || isEditFlag || state.fieldDisabled || state.isViewMode}
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
                                            defaultValue={getValues("Customer")?.length !== 0 ? getValues("Customer") : ""}
                                            options={renderListing("Customer")}
                                            mandatory={true}
                                            handleChange={handleCustomerChange}
                                            errors={errors.Customer}
                                            isLoading={VendorLoaderObj}
                                            disabled={isViewFlag || isEditFlag || state.fieldDisabled || state.isViewMode}
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
                                            disabled={isViewFlag || isEditFlag || state.fieldDisabled || state.isViewMode}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <div className="form-group">
                                            <label>ZBC Last Submission Date</label>
                                            <div className="inputbox date-section">
                                                <DatePicker
                                                    name="ZBC Last Submission Date"
                                                    id="AddNFR_ZBC_Date"
                                                    selected={DayTime(state.zbcDate).isValid() ? new Date(state.zbcDate) : ''}
                                                    onChange={handleZBCDateChange}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode='select'
                                                    dateFormat="dd/MM/yyyy"
                                                    minDate={new Date()}
                                                    maxDate={state.sopDate ? new Date(state.sopDate) : null}
                                                    placeholderText="Select Date"
                                                    className="withBorder"
                                                    mandatory={true}
                                                    autoComplete={"off"}
                                                    disabledKeyboardNavigation
                                                    yearDropdownItemNumber={100}
                                                    onChangeRaw={(e) => e.preventDefault()}
                                                    disabled={state.fieldDisabled || (state.editIndex === '' && isEditFlag) || isViewFlag || state.isViewMode}
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
                                                    selected={DayTime(state.cbcDate).isValid() ? new Date(state.cbcDate) : ''}
                                                    onChange={handleCBCDateChange}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode='select'
                                                    dateFormat="dd/MM/yyyy"
                                                    minDate={new Date(state.zbcDate)}
                                                    maxDate={state.sopDate ? new Date(state.sopDate) : null}
                                                    placeholderText="Select Date"
                                                    className="withBorder"
                                                    mandatory={true}
                                                    autoComplete={"off"}
                                                    disabledKeyboardNavigation
                                                    yearDropdownItemNumber={100}
                                                    onChangeRaw={(e) => e.preventDefault()}
                                                    disabled={state.fieldDisabled || (state.editIndex === '' && isEditFlag) || isViewFlag || state.isViewMode}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <div className="left-border">
                                            {"Part Details:"}
                                        </div>
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
                                            disabled={isViewFlag || isEditFlag || state.fieldDisabled || state.isViewMode}
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
                                                defaultValue={getValues("Part")?.length !== 0 ? getValues("Part") : ""}
                                                asyncOptions={filterList}
                                                mandatory={true}
                                                isLoading={loaderObj}
                                                handleChange={handlePartChange}
                                                errors={errors?.Part}
                                                disabled={isViewFlag || !getValues("PartType")?.value || isEditFlag || state.fieldDisabled || state.isViewMode}
                                                NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                            />
                                            {getValues("PartType")?.label === "Assembly" && getValues("Part")?.value && <button
                                                id="AssemblyPart_Add_BOM"
                                                type="button"
                                                disabled={!getValues("Part")?.value}
                                                onClick={toggleBOMViewer}
                                                className={"user-btn pull-left mt30 mb-4 ml-2"}>
                                                <div className={'fa fa-eye pr-1'}></div> BOM
                                            </button>}
                                            <button
                                                id="AddNFR_AddForecast"
                                                className="user-btn mt-30 ml-3"
                                                title="Add RM & Forecast"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setState(prevState => ({ ...prevState, openAddForecast: true }));
                                                }}
                                                type="button"
                                                disabled={!getValues("Part")?.value}
                                            >
                                                {state.rmDetails?.length > 0 ? <div className="view mr-2"></div> : <div className="plus"></div>}
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
                                        {/* <TextFieldHookForm
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
                                        /> */}
                                        <SearchableSelectHookForm
                                            label={"UOM"}
                                            name={`UnitOfMeasurement`}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            mandatory={true}
                                            customClassName="costing-version"
                                            options={renderListing("UOM")}
                                            handleChange={(e) => { }}
                                            errors={errors?.UOM}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <SearchableSelectHookForm
                                            label={"Group Code"}
                                            name={`GroupCode`}
                                            id="AddNFR_Group_Code"
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            handleChange={(newValue) => handleGroupCodeChange(newValue)}
                                            register={register}
                                            customClassName="costing-version"
                                            options={renderListing("GroupCode")}
                                            errors={errors?.GroupCode}
                                            disabled={isViewFlag || isEditFlag || state.fieldDisabled || state.isViewMode}
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
                                            handleChange={(newValue) => handleChangeSegment(newValue)}
                                            register={register}
                                            customClassName="costing-version"
                                            options={renderListing("Segment")}
                                            errors={errors?.Segment}
                                            disabled={isViewFlag || state.fieldDisabled || (state.editIndex === '' && isEditFlag) || state.isViewMode}
                                        />
                                    </Col>

                                    <Col md="3">
                                        <div className='mt30'>
                                            {state.editIndex !== '' ? (
                                                <>
                                                    <button type="button" className={"btn btn-primary pull-left mt-2 mr5"} onClick={handleSubmitTableForm(updateRateGrid)} disabled={state.fieldDisabled || state.isViewMode || isViewFlag}>Update</button>
                                                    <button
                                                        type="button"
                                                        disabled={state.fieldDisabled || state.isViewMode || isViewFlag}
                                                        className={"mr15 ml-2 add-cancel-btn cancel-btn"}
                                                        onClick={() => cancelEdit()}
                                                    >
                                                        <div className={"cancel-icon"}></div>Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button id="AddNFR_AddData"
                                                        type="button"
                                                        className={"user-btn pull-left"}
                                                        onClick={handleSubmitTableForm(addTableHandler)}
                                                        disabled={state.fieldDisabled || state.isViewMode || isViewFlag || (state.editIndex === '' && isEditFlag)}
                                                    >
                                                        <div className={"plus"}></div>ADD
                                                    </button>
                                                    <button
                                                        id="AddNFR_ResetData"
                                                        type="button"
                                                        className={"mr15 ml-2  reset-btn"}
                                                        onClick={() => resetData()}
                                                        disabled={state.fieldDisabled || state.isViewMode || isViewFlag || (state.editIndex === '' && isEditFlag)}
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
                                        <Table className="table border mt-2" size="sm">
                                            <thead>
                                                <tr>
                                                    <th>{`Part Type`}</th>
                                                    <th>{`Part Number`}</th>
                                                    <th>{`Part Name`}</th>
                                                    <th>{`Description`}</th>
                                                    <th>{`UOM`}</th>
                                                    <th>{`Group Code`}</th>
                                                    <th>{`Segment`}</th>
                                                    <th>{`ZBC Last Submission Date`}</th>
                                                    <th>{`Quotation Last Submission Date`}</th>
                                                    <th>{`Action`}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {state.rfqData && state.rfqData?.map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item?.PartType?.label ? item.PartType.label : '-'}</td>
                                                            <td>{item?.Part?.label ? item.Part.label : '-'}</td>
                                                            <td>{item?.PartName ? item.PartName : '-'}</td>
                                                            <td>{item?.Description ? item.Description : '-'}</td>
                                                            <td>{item?.UnitOfMeasurement?.label ? item.UnitOfMeasurement.label : '-'}</td>
                                                            <td>{item?.GroupCode?.label ? item.GroupCode.label : '-'}</td>
                                                            <td>{item?.Segment?.label ? item.Segment.label : '-'}</td>
                                                            <td>{item?.ZBCLastSubmissionDate ? item.ZBCLastSubmissionDate : '-'}</td>
                                                            <td>{item?.QuotationLastSubmissionDate ? item.QuotationLastSubmissionDate : '-'}</td>
                                                            <td>
                                                                {!isViewFlag && <button
                                                                    className="Edit mr-2"
                                                                    title='Edit'
                                                                    type={"button"}
                                                                    disabled={item?.IsAssociated}
                                                                    onClick={() => editItemDetails(false, index)}
                                                                />}
                                                                <button
                                                                    className="View mr-2"
                                                                    title='View'
                                                                    type={"button"}
                                                                    disabled={item?.IsAssociated}
                                                                    onClick={() => editItemDetails(true, index)}
                                                                />
                                                                {!isViewFlag && <button
                                                                    className="Delete "
                                                                    title='Delete'
                                                                    type={"button"}
                                                                    disabled={item?.IsAssociated}
                                                                    onClick={() => deleteItem(index)}
                                                                />}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>

                                            {state.rfqData?.length === 0 && (
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
                                            value={state.remarks}
                                            customClassName={"withBorder"}
                                            handleChange={(e) => { handleRemarkChange(e.target.value) }}
                                            errors={errors.remark}
                                            rowHeight={6}
                                            disabled={isViewFlag}
                                        />
                                    </Col>
                                    <Col md="3" className="height152-label">
                                        <label>Upload Attachment (upload up to 4 files) <AttachmentValidationInfo /> </label>
                                        <div className={`alert alert-danger mt-2 ${state.files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                            Maximum file upload limit has been reached.
                                        </div>
                                        <div id="AddNFR_uploadFile" className={`${state.files?.length >= 4 ? 'd-none' : ''}`}>
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
                                    <Col md="3" className=' p-relative'>
                                        <div className={"attachment-wrapper"}>
                                            {state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                            {state.files &&
                                                state.files.map((f) => {
                                                    const withOutTild = f.FileURL?.replace("~", "");
                                                    const fileURL = `${FILE_URL}${withOutTild}`;
                                                    return (
                                                        <div className={"attachment images"}>
                                                            <a href={fileURL} target="_blank" rel="noreferrer">
                                                                {f.OriginalFileName}
                                                            </a>
                                                            {!isViewFlag && <img
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
                                            onClick={() => onSubmit(false)}
                                            className="submit-button save-btn mr-2"
                                            disabled={isViewFlag}
                                        >
                                            <div className={"save-icon"}></div> {'Save'}
                                        </button>
                                        <button
                                            id="AddNFR_SubmitData"
                                            type={'submit'}
                                            onClick={() => onSubmit(true)}
                                            disabled={isViewFlag}
                                            className="submit-button save-btn"
                                            value="send"
                                        >
                                            <div className="send-for-approval mr-1"></div>Submit
                                        </button>
                                    </div>
                                </Row>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {state.loader && <LoaderCustom customClass="Rfq-Loader" />}

            {state.openAddForecast &&
                <AddForecast
                    isOpen={state.openAddForecast}
                    closeDrawer={openAndCloseDrawer}
                    anchor={'right'}
                    isViewFlag={isViewFlag || state.fieldDisabled}
                    partListData={partListData}
                    rmDetails={state.rmDetails}
                    setRMDetails={(details) => setState(prevState => ({ ...prevState, rmDetails: details }))}
                    sopDate={state.sopDate}
                    handleSOPDateChange={handleSOPDateChange}
                    zbcDate={state.zbcDate}
                    errors={errors}
                    onGridReady={onGridReady}
                    EditableCallback={!isViewFlag}
                    partType={getValues("PartType")}
                    AssemblyPartNumber={getValues("Part")}
                    sopQuantityList={state.sopQuantityList}
                    setSopQuantityList={(list) => setState(prevState => ({ ...prevState, sopQuantityList: list }))}
                />
            }

            {state.openBOMViewer && <BOMViewer
                isOpen={state.openBOMViewer}
                anchor="right"
                isEditFlag={true}
                PartId={getValues("Part")?.value}
                avoidAPICall={false}
                closeDrawer={() => setState(prevState => ({ ...prevState, openBOMViewer: false }))}
                BOMViewerData={[]}
                isFromVishualAd={true}
                NewAddedLevelOneChilds={[]}
            />}
        </>
    );
}

export default CreateManualNFR;

