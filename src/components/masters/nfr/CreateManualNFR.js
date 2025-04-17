import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
import DatePicker from "react-datepicker";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import Dropzone from 'react-dropzone-uploader';
import { dummyData } from './DummyData';
// Components
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import HeaderTitle from '../../common/HeaderTitle';
import DayTime from '../../common/DayTimeWrapper';
import NoContentFound from '../../common/NoContentFound';
import TourWrapper from "../../common/Tour/TourWrapper";
import AddRMDetails from './AddRMDetails';
import AddForecast from './AddForecast';

// Actions
import { getPlantSelectListByType, getUOMSelectList } from '../../../actions/Common';
import { getBoughtOutPartSelectList } from '../actions/Part';
import { getPartInfo, getPartSelectListByTechnology } from '../../costing/actions/Costing';
import { getRMSpecificationDataList } from '../actions/Material';
import { getClientSelectList } from '../actions/Client';
import { fileUploadQuotation } from '../../rfq/actions/rfq';
import { createNFRBOMDetails, getNFRPartWiseGroupDetail } from './actions/nfr';

// Constants and Config
import { EMPTY_DATA, FILE_URL, PartTypeIDFromAPI, ZBC, searchCount, DRAFTID } from '../../../config/constants';
import { AcceptableRMUOM, NFR_BOP_STANDARD_ID, NFR_BOP_STANDARD_LABEL, NFR_BOP_STANDARD_NAME, NFR_COMPONENT_CUSTOMIZED_ID, NFR_COMPONENT_CUSTOMIZED_LABEL, NFR_COMPONENT_CUSTOMIZED_NAME, NFR_RAW_MATERIAL_ID, NFR_RAW_MATERIAL_LABEL, NFR_RAW_MATERIAL_NAME, PART_TYPE_LIST_FOR_NFR } from '../../../config/masterData';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { Steps } from './TourMessages';

// Helpers
import { autoCompleteDropdown, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import { acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation, positiveAndDecimalNumber, maxLength15, number, decimalNumberLimit3, maxLength20, decimalLengthsix, checkForNull, checkForDecimalAndNull, integerOnly, validateFileName, minLength3 } from "../../../helper/validation";

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
    const [technology, setTechnology] = useState([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [selectedUOM, setSelectedUOM] = useState('');
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
    const [selectedBOPNumber, setSelectedBOPNumber] = useState('');
    const [selectedPartType, setSelectedPartType] = useState('');
    const [customer, setCustomer] = useState([]);
    const [zbcDate, setZbcDate] = useState('')
    const [cbcDate, setCbcDate] = useState('')

    const [sopDate, setSOPDate] = useState('')
    const [maxDate, setMaxDate] = useState('');
    const [fiveyearList, setFiveyearList] = useState([])

    // Table and grid state
    const [rowData, setRowData] = useState([]);
    const [modifiedRowData, setModifiedRowData] = useState(dummyData);
    const [costingOptionsSelectedObject, setCostingOptionsSelectedObject] = useState({});
    const [gridData, setGridData] = useState([]);
    const [editIndex, setEditIndex] = useState('');
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const gridOptionsPart = {}

    // UI state
    const [showPopup, setShowPopup] = useState(false);
    const [tableLoader, setTableLoader] = useState(false);
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)

    // Drawer state
    const [openAddRMDetails, setOpenAddRMDetails] = useState(false);
    const [rmDetailsGridIndex, setRMDetailsGridIndex] = useState('');
    const [openAddForecast, setOpenAddForecast] = useState(false)

    // Selection lists
    const [selectedPartList, setSelectedPartList] = useState([]);
    const [selectedBOPList, setSelectedBOPList] = useState([]);
    const [selectedRMList, setSelectedRMList] = useState([]);

    // File upload state
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [files, setFiles] = useState([])
    const [apiCallCounter, setApiCallCounter] = useState(0)

    useEffect(() => {
        if (!isViewFlag) {
            dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
            dispatch(getUOMSelectList(() => { }))
            dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
            dispatch(getBoughtOutPartSelectList(null, () => { }))
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
        if (value === 'Plant') {
            plantSelectList && plantSelectList?.map(item => {
                if (item.PlantId === '0') return false;
                temp.push({ label: item.PlantNameCode, value: item.PlantId, plantCode: item.PlantCode, plantName: item.PlantName })
                return null
            });
            return temp;
        }
        if (value === 'Customer') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (value === 'PartType') {
            PART_TYPE_LIST_FOR_NFR && PART_TYPE_LIST_FOR_NFR?.map(item => {
                if (item?.value === '0') return false;
                temp.push({ label: item?.label, value: item?.value })
                return null
            });
            return temp;
        }
        if (value === 'UOM') {
            UOMSelectList && UOMSelectList?.map(item => {
                const accept = AcceptableRMUOM.includes(item.Type)
                if (accept === false) return false
                if (item.Value === '0') return false
                temp.push({ label: item.Display, value: item.Value })
                return null
            });
            return temp;
        }
        if (value === 'BOPNumber') {
            boughtOutPartSelectList && boughtOutPartSelectList?.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (value === 'RawMaterial') {
            rmSpecificationList && rmSpecificationList?.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
                return null;
            });
            return temp;
        }

    }

    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {
            setInputLoader(true)
            const res = await getPartSelectListByTechnology(technology.value, resultInput, PartTypeIDFromAPI);
            setInputLoader(false)
            setpartName(resultInput)
            let partDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, partDataAPI, false, [], true)

            } else {
                return partDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, partData, false, [], false)
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
        setTimeout(() => {
            // setShowTooltip(true)
        }, 100);
    };

    const updateRateGrid = () => {
        let tempData = gridData[editIndex];
        switch (selectedPartType?.value) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                if (gridData?.findIndex(item => item?.PartId === selectedPart?.value) !== editIndex) {
                    if (selectedPartList?.includes(selectedPart?.value)) {
                        Toaster.warning("Data already added.")
                        return false
                    }
                }
                break;
            case NFR_BOP_STANDARD_ID:
                if (gridData?.findIndex(item => item?.BoughtOutPartChildId === selectedBOPNumber?.value) !== editIndex) {
                    if (selectedBOPList?.includes(selectedBOPNumber?.value)) {
                        Toaster.warning("Data already added.")
                        return false
                    }
                }
                break;
            case NFR_RAW_MATERIAL_ID:
                if (gridData?.findIndex(item => item?.RawMaterialCode === selectedRawMaterial?.label) !== editIndex) {
                    if (selectedRMList?.includes(selectedRawMaterial?.value)) {
                        Toaster.warning("Data already added.")
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
            Uom: selectedUOM?.label,
            Quantity: getValues("Quantity"),
            PartId: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? selectedPart?.value : '',
            PartNumber: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? selectedPart?.label : '',
            BoughtOutPartChildId: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.value : '',
            BoughtOutPartNumber: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.label : '',
            RawMaterialCode: selectedPartType?.value === NFR_RAW_MATERIAL_ID ? selectedRawMaterial?.label : '',
            // NFRPartRawMaterialDetails: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? tempData?.NFRPartRawMaterialDetails : []
        }
        let tempArray = Object.assign([...gridData], { [editIndex]: tempData })

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
        setGridData(tempArray)
        resetData()
    }

    const resetData = () => {
        errors.Quantity = {}
        setValue("HeaderMaterial", '')
        setValue("Quantity", '')
        setValue("PartType", '')
        setValue("Part", '')
        setValue("BOPNumber", '')
        setValue("RawMaterial", '')
        setValue("UOM", '')
        setSelectedPartType('')
        setSelectedUOM('')
        setSelectedPart('')
        setEditIndex('')
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
        if (selectedPartType?.length === 0 || value?.length === 0 || getValues("HeaderMaterial") === '' || getValues("Quantity") === '') {
            check = true
        }
        return check
    }

    const cancelEdit = () => {
        setEditIndex('')
        resetData()
    }

    const filterRMFromList = (rmSpecificationList, RawMaterialCode) => {
        return rmSpecificationList && rmSpecificationList?.filter(item => item?.RawMaterialCode === RawMaterialCode)
    }

    const editItemDetails = (index) => {
        let tempObj = gridData[index]

        setEditIndex(index)

        errors.Quantity = {}

        setValue('HeaderMaterial', tempObj?.HeaderMaterial)
        setValue('Quantity', tempObj?.Quantity)

        setValue('PartType', { label: tempObj?.PartType, value: tempObj?.PartTypeId })
        setSelectedPartType({ label: tempObj?.PartType, value: tempObj?.PartTypeId })

        setValue('UOM', { label: tempObj?.Uom, value: tempObj?.Uom })
        setSelectedUOM({ label: tempObj?.Uom, value: tempObj?.Uom })

        setValue('Part', { label: tempObj?.PartNumber, value: tempObj?.PartId })
        setSelectedPart({ label: tempObj?.PartNumber, value: tempObj?.PartId })

        setValue('BOPNumber', { label: tempObj?.BoughtOutPartNumber, value: tempObj?.BoughtOutPartChildId })
        setSelectedBOPNumber({ label: tempObj?.BoughtOutPartNumber, value: tempObj?.BoughtOutPartChildId })

        const rmId = filterRMFromList(rmSpecificationList, tempObj?.RawMaterialCode)[0]?.SpecificationId

        setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId })
        setSelectedRawMaterial({ label: tempObj?.RawMaterialCode, value: rmId })

        switch (tempObj?.PartTypeId) {
            case NFR_COMPONENT_CUSTOMIZED_ID:
                setValue('Part', { label: tempObj?.PartNumber, value: tempObj?.PartId })

                break;
            case NFR_BOP_STANDARD_ID:
                setValue('BOPNumber', { label: tempObj?.BoughtOutPartNumber, value: tempObj?.BoughtOutPartChildId })

                break;
            case NFR_RAW_MATERIAL_ID:
                setValue('RawMaterial', { label: tempObj?.RawMaterialCode, value: rmId })

                break;
            default:
                break;
        }
    }

    const deleteTableItem = (dataItem, indexInside, indexOuter) => {
        setShowPopup(true);
    };

    const handleChangePartType = (value) => {
        setSelectedPartType(value)
        setSelectedBOPNumber('')
        setSelectedRawMaterial('')
        setSelectedPart('')
        setValue("Part", '')
        setValue("BOPNumber", '')
        setValue("RawMaterial", '')
    }

    const handlePartChange = (newValue) => {
        setSelectedPart(newValue)
        if (newValue && newValue !== '') {
            dispatch(getPartInfo(newValue.value, (res) => {
                let Data = res.data.Data
                setValue('PartName', Data?.PartName ? Data.PartName : '')
                setValue('Description', Data?.Description ? Data.Description : '')
                setValue('UnitOfMeasurement', Data?.UnitOfMeasurement ? Data.UnitOfMeasurement : '')

                // If there's already a valid SOP date, update the sopQuantityList with the new part
                if (sopDate) {
                    const newSopQuantityList = fiveyearList.map(yearItem => ({
                        PartNumber: newValue?.label || '',
                        YearName: yearItem.toString(),
                        Quantity: '0'
                    }));
                    
                    setSopQuantityList(newSopQuantityList);
                }
            }),
            )
            setValue('PartName', '')
            setValue('Description', '')
            setValue('UnitOfMeasurement', '')
        }
    }

    const handleChangeRawMaterial = (newValue) => {
        setSelectedRawMaterial(newValue)
    }

    const handleChangeBOPNumber = (newValue) => {
        setSelectedBOPNumber(newValue)
    }

    const handleChangeUOM = (newValue) => {
        setSelectedUOM(newValue)
    }

    const handleChangePlant = (newValue) => {
        console.log("newValue,setSelectedPlant", newValue)
        setSelectedPlant(newValue)
    }

    const addTableHandler = debounce(() => {
        if (checkIsDataFilled()) {
            Toaster.warning("Please enter all details to add a row.")
            return false
        }
        if (selectedPartList?.includes(selectedPart?.value) || selectedBOPList?.includes(selectedBOPNumber?.value) || selectedRMList?.includes(selectedRawMaterial?.value)) {
            Toaster.warning("Data already added.")
            return false
        }
        if (Object.keys(errors)?.length > 0) {
            return false
        }
        let tempData = gridData ? [...gridData] : []
        let obj = {
            HeaderMaterial: getValues("HeaderMaterial"),
            PartType: selectedPartType?.label,
            PartTypeId: selectedPartType?.value,
            Uom: selectedUOM?.label,
            Quantity: getValues("Quantity"),
            PartId: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? selectedPart?.value : '',
            PartNumber: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? selectedPart?.label : '',
            BoughtOutPartChildId: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.value : '',
            BoughtOutPartNumber: selectedPartType?.value === NFR_BOP_STANDARD_ID ? selectedBOPNumber?.label : '',
            RawMaterialCode: selectedPartType?.value === NFR_RAW_MATERIAL_ID ? selectedRawMaterial?.label : '',
            NFRPartRawMaterialDetails: []
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
        resetData()
    }, 500)

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
                    setTimeout(() => {
                        ;
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

    const handleZBCDateChange = (date) => {
        setZbcDate(DayTime(date).isValid() ? DayTime(date) : '')
    };

    const handleCBCDateChange = (date) => {
        setCbcDate(DayTime(date).isValid() ? DayTime(date) : '')
    };

    const handleSOPDateChange = (date) => {
        setSOPDate(DayTime(date).isValid() ? DayTime(date) : '')
        let year = new Date(date).getFullYear()
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(year + i);
        }
        setFiveyearList(years)
        
        // Only initialize the sopQuantityList when both SOP date and selectedPart are available
        if (date && selectedPart) {
            const newSopQuantityList = years.map(yearItem => ({
                PartNumber: selectedPart?.label || '',
                YearName: yearItem.toString(),
                Quantity: '0'
            }));
            
            setSopQuantityList(newSopQuantityList);
        }
    };

    const loaderObj = { isLoader: inputLoader }

    // Table related functions
    const handleCostingChange = (newValue, indexOuter, indexInside) => {
        let tempData = [...modifiedRowData];
        let tempCostingOptionsSelectedObject = { ...costingOptionsSelectedObject };
        tempCostingOptionsSelectedObject[indexInside] = newValue;
        setCostingOptionsSelectedObject(tempCostingOptionsSelectedObject);

        if (newValue) {
            tempData[indexOuter].data[indexInside].SelectedCostingVersion = newValue;
            setModifiedRowData(tempData);
        }
    };

    const handleCostingHeadChange = (newValue, indexOuter, indexInside) => {
        let tempData = [...modifiedRowData];

        if (newValue) {
            tempData[indexOuter].data[indexInside].CostingHead = newValue.value;
            setModifiedRowData(tempData);
        }
    };

    const viewDetails = (index) => {
        // Implement view details functionality
    };

    const editCosting = (index) => {
        // Implement edit costing functionality
    };

    const copyCosting = (index) => {
        // Implement copy costing functionality
    };

    const editRow = (item, index) => {
        // Implement edit row functionality
    };

    const onPopupConfirm = () => {
        // Implement popup confirm functionality
    };

    const closePopUp = () => {
        setShowPopup(false);
    };

    const formToggle = (data, indexOuter, indexInside) => {
        // Implement form toggle functionality
    };

    const addDetails = (dataItem, indexInside, indexOuter) => {
        // Implement add details functionality
    };

    const deleteRowItem = (index) => {
        // Implement delete row item functionality
    };

    const addRMDetails = (index) => {
        setOpenAddRMDetails(true)
        setRMDetailsGridIndex(index)
    }

    const openAndCloseDrawer = (isSave, dataList = []) => {
        setOpenAddRMDetails(false)
        if (isSave === true && dataList && dataList.length > 0) {
            setSopQuantityList([...dataList]);
        }
        setOpenAddForecast(false)
    }

    const cancel = (isSaveAPICalled = false) => {
        props?.closeDrawer(isSaveAPICalled)
    }

    const handleCustomerChange = (newValue) => {
        if (newValue && newValue !== '') {
            setCustomer(newValue)
        }
    }

    const VendorLoaderObj = { isLoader: VendorInputLoader }

    const changePartType = (list) => {
        let tempList = list && list?.map(item => {
            let value = ''
            switch (item?.PartType) {
                case NFR_COMPONENT_CUSTOMIZED_LABEL:
                    value = 'Part'
                    break;
                case NFR_BOP_STANDARD_LABEL:
                    value = 'BoughtOutPart'
                    break;
                case NFR_RAW_MATERIAL_LABEL:
                    value = 'RawMaterial'
                    break;
                default:
                    break;
            }
            item.PartType = value
            return item
        })
        return tempList
    }

    const onSubmit = (values) => {

        let requestObj = {
            "CustomerRFQNo": values?.CustomerRFQNo,
            "ProductCode": values?.ProductCode,
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
            "NfrBOMDetails": changePartType([...gridData]),
            "SOPDate": sopDate,
            "LastSubmissionDate": zbcDate,
            "SOPQuantity": values?.fiveyearList,
            "Files": files
        }
        dispatch(createNFRBOMDetails(requestObj, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Customer RFQ created successfully.")
            }
            cancel(true)
        }))
    }



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
                                            {
                                                // selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID && 
                                                <Col md="3" className="input-container">
                                                    <div id="AddNFR_Customer_Part_No">
                                                        <AsyncSearchableSelectHookForm
                                                            label={"Customer Part No."}
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
                                                    </div>
                                                </Col>}
                                            <Col md="3" className="input-container">
                                                <TextFieldHookForm
                                                    label="Part Name"
                                                    name={"PartName"}
                                                    id="AddNFR_Part_Name"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    // rules={{ required: true }}
                                                    // mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.CustomerPartName}
                                                    disabled={true}
                                                />
                                            </Col>


                                        </Row>
                                        <Row>
                                            <Col md="3" className="input-container">
                                                <TextFieldHookForm
                                                    label="Part Description"
                                                    name={"Description"}
                                                    id="AddNFR_Part_Description"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    // rules={{ required: true }}
                                                    // mandatory={true}
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
                                                    // mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors.Uom}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label="Product Code"
                                                    name={"ProductCode"}
                                                    id="AddNFR_Product_Code"
                                                    Controller={Controller}
                                                    placeholder={isViewFlag ? '-' : "Select"}
                                                    control={control}
                                                    register={register}
                                                    // rules={{ required: true }}
                                                    // mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.ProductCode}
                                                    disabled={isViewFlag}
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
                                                    // rules={{ required: true }}
                                                    // mandatory={true}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    options={renderListing("Segment")}
                                                    // handleChange={(newValue) => handleChangeSegment(newValue)}
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

                                                    <label>ZBC Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="ZBC Submission Date"
                                                            id="AddNFR_ZBC_Date"
                                                            selected={DayTime(zbcDate).isValid() ? new Date(zbcDate) : ''}
                                                            onChange={handleZBCDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={new Date()}
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

                                                    <label>CBC Submission Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="Quotation Submission Date"
                                                            id="AddNFR_CBC_Date"
                                                            selected={DayTime(cbcDate).isValid() ? new Date(cbcDate) : ''}
                                                            onChange={handleCBCDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={DayTime(zbcDate).isValid() ? new Date(zbcDate) : new Date(maxDate)}
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
                                                    <label>SOP Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="sopDate"
                                                            id="AddNFR_SOP_Date"
                                                            label="SOP Date"
                                                            selected={DayTime(sopDate).isValid() ? new Date(sopDate) : ''}
                                                            onChange={handleSOPDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            mandatory={true}
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={DayTime(cbcDate).isValid() ? new Date(cbcDate) : new Date(maxDate)}
                                                            placeholderText="Select Date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            yearDropdownItemNumber={100}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isViewFlag}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <button
                                                id="AddNFR_AddForecast"
                                                className="user-btn mt-30 ml-3"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpenAddForecast(true);
                                                }}
                                                type="button"
                                                disabled={!sopDate || !selectedPart}
                                            >
                                                {sopQuantityList?.some(item => parseInt(item?.Quantity) !== 0) ? <div className="view mr-2"></div> : <div className="plus"></div>}
                                                {sopQuantityList?.some(item => parseInt(item?.Quantity) !== 0) ? "View Forecast" : "ADD Forecast"}
                                            </button>
                                        </Row>
                                        <Row>
                                            <HeaderTitle title={'Attachment:'} customClass="mt-3" />
                                            <Col md="6" className="height152-label">
                                                {/* <TooltipCustom id="uploadFile" tooltipText="Upload upto 4 file, size of each file upto 20MB" /> */}
                                                <label>Upload Attachment (upload up to 4 files) <AttachmentValidationInfo /> </label>
                                                <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                                    Maximum file upload limit has been reached.
                                                </div>
                                                <div id="AddNFR_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
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

                                        {/* Add the table here */}
                                        {data?.NfrId && isViewFlag && (
                                            <>
                                                <HeaderTitle title={'Quotation Details:'} customClass="mt-3" />
                                                <div className="table-responsive">
                                                    {tableLoader ? (
                                                        <LoaderCustom customClass="loader-center" />
                                                    ) : (
                                                        <Table className="table table-bordered text-center">
                                                            <thead>
                                                                <tr>
                                                                    <th className="table-record">Plant (Code)</th>
                                                                    <th className="table-record">Customer (Code)</th>
                                                                    <th className="table-record">Costing Head </th>
                                                                    <th className="table-record">Costing Version</th>
                                                                    <th className="table-record">Status</th>
                                                                    <th className="table-record">Net Cost</th>
                                                                    <th className="table-record">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {modifiedRowData?.map((item, indexOuter) => (
                                                                    <React.Fragment key={item?.groupName}>
                                                                        {item?.data?.map((dataItem, indexInside) => (
                                                                            <tr key={`${item?.groupName} -${indexInside} `}>
                                                                                <td>{dataItem?.Plant}</td>
                                                                                <td>{dataItem?.Customer}</td>
                                                                                <td>
                                                                                    <SearchableSelectHookForm
                                                                                        id="CostingHead_container"
                                                                                        label={""}
                                                                                        name={`${indexInside}.CostingHead`}
                                                                                        placeholder={"Select"}
                                                                                        Controller={Controller}
                                                                                        control={control}
                                                                                        rules={{ required: false }}
                                                                                        register={register}
                                                                                        customClassName="costing-version"
                                                                                        defaultValue={dataItem?.CostingHead ? {
                                                                                            label: dataItem?.CostingHead,
                                                                                            value: dataItem?.CostingHead
                                                                                        } : ''}
                                                                                        options={[
                                                                                            { label: "Zero Based", value: "Zero Based" },
                                                                                            { label: "Customer Based", value: "Customer Based" }
                                                                                        ]}
                                                                                        handleChange={(newValue) => handleCostingHeadChange(newValue, indexOuter, indexInside)}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <SearchableSelectHookForm
                                                                                        id="CostingVersion_container"
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
                                                                                    />
                                                                                </td>
                                                                                <td rowSpan={item?.data.length} className="table-record"><div className={item?.status}>{item?.displayStatus}</div></td>
                                                                                <td>{checkForDecimalAndNull(dataItem?.SelectedCostingVersion?.Price, initialConfiguration?.NoOfDecimalForPrice)}</td>

                                                                                <td> <div className=''>
                                                                                    {/* {item?.Status !== '' && dataItem?.SelectedCostingVersion && (<button className="View" type={"button"} title={"View Costing"} onClick={() => viewDetails(indexInside)} />)} */}
                                                                                    {/* <button className="Add-file ml-2" id="nfr_AddCosting" type={"button"} title={`${item?.groupName === 'PFS2' ? 'Create PFS2 Costing' : 'Add Costing'}`} onClick={() => addDetails(dataItem, indexInside, indexOuter)} /> */}
                                                                                    <button className="View ml-2" type={"button"} id="nfr_ViewCosting" title={"View Costing"} onClick={() => viewDetails(indexInside)} />
                                                                                    {/* <button className="Edit ml-2" id="nfr_EditCosting" type={"button"} title={"Edit Costing"} onClick={() => editCosting(indexInside)} /> */}
                                                                                    <button className="Copy All ml-2" id="nfr_CopyCosting" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(indexInside)} />
                                                                                    {/* <button className="Delete All ml-2" title={"Delete Costing"} id="nfr_DeleteCosting" type={"button"} onClick={() => deleteTableItem(dataItem, indexInside, indexOuter)} /> */}
                                                                                    {/* <button title='Discard' id="nfr_DiscardCosting" className="CancelIcon ml-2" type={'button'} onClick={() => deleteRowItem(indexInside)} /> */}
                                                                                    {/* {(item?.isShowCreateCostingButton === true && dataItem?.SelectedCostingVersion && dataItem?.SelectedCostingVersion?.StatusId === DRAFTID) &&
                                                                                        <>
                                                                                            {(<button className="Edit" type={"button"} title={"Edit Costing"} onClick={() => editCosting(indexInside)} />)}
                                                                                            {(<button className="Copy All" title={"Copy Costing"} type={"button"} onClick={() => copyCosting(indexInside)} />)}
                                                                                            {(<button className="Delete All" title={"Delete Costing"} type={"button"} onClick={() => deleteTableItem(dataItem, indexInside, indexOuter)} />)}
                                                                                            {<button title='Discard' className="CancelIcon" type={'button'} onClick={() => deleteRowItem(indexInside)} />}
                                                                                        </>} */}
                                                                                </div></td>
                                                                            </tr>
                                                                        ))
                                                                        }
                                                                    </React.Fragment>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    )}
                                                </div>
                                            </>
                                        )}

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
                                                    <div className="send-for-approval mr-1"></div>Send
                                                </button>
                                            </div>
                                        </Row>
                                    </>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
            {openAddRMDetails &&
                <AddRMDetails
                    isOpen={openAddRMDetails}
                    closeDrawer={openAndCloseDrawer}
                    anchor={'right'}
                    dataList={gridData[rmDetailsGridIndex]?.NFRPartRawMaterialDetails}
                />
            }

            {openAddForecast &&
                <AddForecast
                    isOpen={openAddForecast}
                    closeDrawer={openAndCloseDrawer}
                    anchor={'right'}
                    isViewFlag={isViewFlag}
                    partListData={partListData}
                    sopDate={sopDate}
                    handleSOPDateChange={handleSOPDateChange}
                    zbcDate={zbcDate}
                    errors={errors}
                    gridOptionsPart={gridOptionsPart}
                    onGridReady={onGridReady}
                    EditableCallback={!isViewFlag}
                    fiveyearList={fiveyearList}
                    setFiveyearList={setFiveyearList}
                    AssemblyPartNumber={selectedPart}
                    sopQuantityList={sopQuantityList}
                    setSopQuantityList={setSopQuantityList}
                />
            }

        </>
    );
}

export default CreateManualNFR;
