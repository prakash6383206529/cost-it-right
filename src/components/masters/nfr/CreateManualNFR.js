import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Row, Col, Table } from 'reactstrap';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { useDispatch, useSelector } from 'react-redux';
import { getPlantSelectListByType, getUOMSelectList } from '../../../actions/Common';
import { EMPTY_DATA, FILE_URL, PartTypeIDFromAPI, ZBC, searchCount } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { AcceptableRMUOM, NFR_BOP_STANDARD_ID, NFR_BOP_STANDARD_LABEL, NFR_BOP_STANDARD_NAME, NFR_COMPONENT_CUSTOMIZED_ID, NFR_COMPONENT_CUSTOMIZED_LABEL, NFR_COMPONENT_CUSTOMIZED_NAME, NFR_RAW_MATERIAL_ID, NFR_RAW_MATERIAL_LABEL, NFR_RAW_MATERIAL_NAME, PART_TYPE_LIST_FOR_NFR } from '../../../config/masterData';
import { getBoughtOutPartSelectList } from '../actions/Part';
import { getPartSelectListByTechnology } from '../../costing/actions/Costing';
import { autoCompleteDropdown } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { getRMSpecificationDataList } from '../actions/Material';
import Toaster from '../../common/Toaster';
import { debounce } from 'lodash';
import AddRMDetails from './AddRMDetails';
import { createNFRBOMDetails } from './actions/nfr'
import { number, checkWhiteSpaces, decimalNumberLimit6, validateFileName } from '../../../helper'
import { Steps } from './TourMessages';
import TourWrapper from "../../common/Tour/TourWrapper"
import { useTranslation } from 'react-i18next';
import Dropzone from 'react-dropzone-uploader';
import LoaderCustom from '../../common/LoaderCustom';
import redcrossImg from '../../../assests/images/red-cross.png'
import { fileUploadQuotation } from '../../rfq/actions/rfq';
import HeaderTitle from '../../common/HeaderTitle';

function CreateManualNFR(props) {
    const { t } = useTranslation("Nfr")
    const dropzone = useRef(null);
    const { handleSubmit, formState: { errors }, register, control, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    })
    const dispatch = useDispatch();

    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const UOMSelectList = useSelector(state => state.comman.UOMSelectList)
    const { rmSpecificationList } = useSelector((state) => state.material);
    const boughtOutPartSelectList = useSelector(state => state.part.boughtOutPartSelectList)

    const [gridData, setGridData] = useState([]);
    const [editIndex, setEditIndex] = useState('');
    const [selectedPartType, setSelectedPartType] = useState('');
    const [inputLoader, setInputLoader] = useState(false)
    const [partName, setpartName] = useState('')
    const [technology, setTechnology] = useState([]);
    const [selectedPart, setSelectedPart] = useState('');
    const [selectedUOM, setSelectedUOM] = useState('');
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
    const [selectedBOPNumber, setSelectedBOPNumber] = useState('');
    const [openAddRMDetails, setOpenAddRMDetails] = useState(false);
    const [rmDetailsGrid, setRMDetailsGrid] = useState([]);
    const [rmDetailsGridIndex, setRMDetailsGridIndex] = useState('');
    const [selectedPartList, setSelectedPartList] = useState([]);
    const [selectedBOPList, setSelectedBOPList] = useState([]);
    const [selectedRMList, setSelectedRMList] = useState([]);
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const [files, setFiles] = useState([])
    const [apiCallCounter, setApiCallCounter] = useState(0)

    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
        dispatch(getUOMSelectList(() => { }))
        dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
        dispatch(getBoughtOutPartSelectList(null, () => { }))
    }, [])

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

    /**
    * @method updateRateGrid
    * @description used to Reset form
    */
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
            NFRPartRawMaterialDetails: selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID ? tempData?.NFRPartRawMaterialDetails : []
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

    const cancelEdit = () => {
        setEditIndex('')
        resetData()
    }

    const filterRMFromList = (rmSpecificationList, RawMaterialCode) => {
        return rmSpecificationList && rmSpecificationList?.filter(item => item?.RawMaterialCode === RawMaterialCode)
    }

    /**
    * @method editItemDetails
    * @description used to Reset form
    */
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

    /**
    * @method deleteItem
    * @description used to Reset form
    */
    const deleteItem = (index) => {
        const updatedData = gridData.filter((_, i) => i !== index);
        setGridData(updatedData);
        resetData()
    }

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
        setSelectedPlant(newValue)
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

    const addRMDetails = (index) => {
        setOpenAddRMDetails(true)
        setRMDetailsGridIndex(index)
    }

    const openAndCloseDrawer = (isSave, dataList = []) => {
        setOpenAddRMDetails(false)
        if (isSave === true) {
            let tempObj = gridData[rmDetailsGridIndex]
            tempObj.NFRPartRawMaterialDetails = [...dataList]
            let tempArray = Object.assign([...gridData], { [rmDetailsGridIndex]: tempObj })
            setGridData(tempArray)
            setRMDetailsGrid(dataList)
        } else {

        }
    }

    const cancel = (isSaveAPICalled = false) => {
        props?.closeDrawer(isSaveAPICalled)
    }

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

    const onSubmit = () => {
        if (gridData?.length === 0) {
            Toaster.warning("Please enter at least pone record to save Customer RFQ.")
            return false
        }

        if (gridData?.filter(item => item?.PartType === NFR_COMPONENT_CUSTOMIZED_LABEL && item?.NFRPartRawMaterialDetails?.length === 0)?.length > 0) {
            Toaster.warning("Please enter data for RM in each component.")
            return false
        }

        let requestObj = {
            "NfrVersion": getValues("NFRVersion"),
            "ProductCode": getValues("ProductCode"),
            "PlantCode": selectedPlant?.plantCode,
            "NfrBOMDetails": changePartType([...gridData])
        }
        dispatch(createNFRBOMDetails(requestObj, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Customer RFQ created successfully.")
            }
            cancel(true)
        }))
    }

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
                    this.dropzone.current.files.pop()
                    this.setDisableFalseFunction()
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
            // setDisableFalseFunction()
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

        }
    }

    const loaderObj = { isLoader: inputLoader, }

    return (
        <>
            <div className="container-fluid">
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-6">
                            <h1>
                                Add Customer RFQ
                                <TourWrapper
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
                                                    label="Customer RFQ Version"
                                                    name={"NFRVersion"}
                                                    Controller={Controller}
                                                    placeholder={props?.isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: true }}
                                                    mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.NFRVersion}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Product Code"
                                                    name={"ProductCode"}
                                                    Controller={Controller}
                                                    placeholder={props?.isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: true }}
                                                    mandatory={true}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.ProductCode}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Plant"}
                                                    name={`Plant`}
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
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Header Material"
                                                    name={"HeaderMaterial"}
                                                    Controller={Controller}
                                                    placeholder={props?.isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    handleChange={(e) => { }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.HeaderMaterial}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Part Type"}
                                                    name={`PartType`}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    options={renderListing("PartType")}
                                                    mandatory={false}
                                                    handleChange={(newValue) => handleChangePartType(newValue)}
                                                    errors={errors?.PartType}
                                                />
                                            </Col>
                                            {selectedPartType?.value === NFR_COMPONENT_CUSTOMIZED_ID && <Col md="3">
                                                <AsyncSearchableSelectHookForm
                                                    label={"Assembly/Part No."}
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
                                                    disabled={false}
                                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                />
                                            </Col>}
                                            {selectedPartType?.value === NFR_BOP_STANDARD_ID && <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"BOP Number"}
                                                    name={`BOPNumber`}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    defaultValue={selectedBOPNumber ? selectedBOPNumber : ''}
                                                    options={renderListing("BOPNumber")}
                                                    mandatory={false}
                                                    handleChange={(newValue) => handleChangeBOPNumber(newValue)}
                                                    errors={errors?.BOPNumber}
                                                />
                                            </Col>}
                                            {selectedPartType?.value === NFR_RAW_MATERIAL_ID && <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"Raw Material"}
                                                    name={`RawMaterial`}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    customClassName="costing-version"
                                                    defaultValue={selectedRawMaterial ? selectedRawMaterial : ''}
                                                    options={renderListing("RawMaterial")}
                                                    mandatory={false}
                                                    handleChange={(newValue) => handleChangeRawMaterial(newValue)}
                                                    errors={errors?.RawMaterial}
                                                />
                                            </Col>}
                                            <Col md="3">
                                                <SearchableSelectHookForm
                                                    label={"UOM"}
                                                    name={`UOM`}
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
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Quantity"
                                                    name={"Quantity"}
                                                    Controller={Controller}
                                                    placeholder={props?.isViewFlag ? '-' : "Enter"}
                                                    control={control}
                                                    register={register}
                                                    handleChange={(e) => { }}
                                                    rules={{
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                    }}
                                                    defaultValue={""}
                                                    className=""
                                                    customClassName={"withBorder"}
                                                    errors={errors?.Quantity}
                                                    disabled={false}
                                                />
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
                                                            <th>{`Header Material`}</th>
                                                            <th>{`Part Type`}</th>
                                                            <th>{`Part Number`}</th>
                                                            <th>{`Bought Out Part`}</th>
                                                            <th>{`Raw Material`}</th>
                                                            <th>{`UOM`}</th>
                                                            <th>{`Quantity`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gridData && gridData?.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{item.HeaderMaterial ? item.HeaderMaterial : '-'}</td>
                                                                    <td>{item.PartType ? item.PartType : '-'}</td>
                                                                    <td>{item.PartNumber ? item.PartNumber : '-'}</td>
                                                                    <td>{item.BoughtOutPartNumber ? item.BoughtOutPartNumber : '-'}</td>
                                                                    <td>{item.RawMaterialCode ? item.RawMaterialCode : '-'}</td>
                                                                    <td>{item.Uom ? item.Uom : '-'}</td>
                                                                    <td>{item.Quantity ? item.Quantity : '-'}</td>
                                                                    <td>
                                                                        <button
                                                                            className="Edit mr-2"
                                                                            title='Edit'
                                                                            type={"button"}
                                                                            disabled={item?.IsAssociated}
                                                                            onClick={() => editItemDetails(index)}
                                                                        />
                                                                        <button
                                                                            className="Delete "
                                                                            title='Delete'
                                                                            type={"button"}
                                                                            disabled={item?.IsAssociated}
                                                                            onClick={() => deleteItem(index)}
                                                                        />
                                                                        {item?.PartTypeId === NFR_COMPONENT_CUSTOMIZED_ID && <button
                                                                            type="button"
                                                                            className={"Add ml-2"}
                                                                            onClick={() => addRMDetails(index)}
                                                                            title="Add"
                                                                        />}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>

                                                    {gridData?.length === 0 && (
                                                        <tbody className='border'>
                                                            <tr>
                                                                <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                                                            </tr>
                                                        </tbody>
                                                    )}
                                                </Table>
                                            </Col>

                                        </Row>
                                        <Row>
                                            <HeaderTitle title={'Attachment:'} customClass="mt-3" />
                                            <Col md="6" className="height152-label">
                                                {/* <TooltipCustom id="uploadFile" tooltipText="Upload upto 4 file, size of each file upto 20MB" /> */}

                                                <label>Upload Attachment (upload up to 4 files){/* <span className="asterisk-required"></span> */}  <AttachmentValidationInfo /> </label>
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
                                                        disabled={false}
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
                                        <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                            <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                                <button
                                                    id="AddNFR_CancelData"
                                                    type={'button'}
                                                    className="reset cancel-btn mr5"
                                                    onClick={cancel}
                                                >
                                                    <div className={'cancel-icon'}></div> {'Cancel'}
                                                </button>
                                                <button
                                                    id="AddNFR_SubmitData"
                                                    type={'submit'}
                                                    className="submit-button save-btn"
                                                >
                                                    <div className={"save-icon"}></div> {'Submit'}
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
        </>
    );
}

export default CreateManualNFR;