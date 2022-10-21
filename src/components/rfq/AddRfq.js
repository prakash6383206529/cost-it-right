import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm, } from '.././layout/HookFormInputs'
import { getVendorWithVendorCodeSelectList, getReporterList, fetchPlantDataAPI } from '../.././actions/Common';
import { getCostingSpecificTechnology, getPartSelectListByTechnology, } from '../costing/actions/Costing'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../.././helper';
import { EMPTY_DATA, FILE_URL } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation, fileDeleteQuotation, fileUploadQuotation, getQuotationById, updateRfqQuotation, getContactPerson, checkExistCosting } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import redcrossImg from '../../assests/images/red-cross.png'
import NoContentFound from '../common/NoContentFound';
import HeaderTitle from '../common/HeaderTitle';

const gridOptions = {};

function AddRfq(props) {

    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, control } = useForm();

    const [getReporterListDropDown, setGetReporterListDropDown] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [isEditFlag, setIsEditFlag] = useState(false);
    const [isViewFlag, setIsViewFlag] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [tableData, setTableData] = useState([])
    const [partList, setPartList] = useState([])
    const [vendorList, setVendorList] = useState([])
    const [updateButtonPartNoTable, setUpdateButtonPartNoTable] = useState(false)
    const [updateButtonVendorTable, setUpdateButtonVendorTable] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedRowPartNoTable, setSelectedRowPartNoTable] = useState({})
    const [selectedRowVendorTable, setSelectedVendorTable] = useState({})
    const [files, setFiles] = useState([])
    const [IsOpen, setIsOpen] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [disableTechnology, setDisableTechnology] = useState(false)
    const [partNoDisable, setPartNoDisable] = useState(true)
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
    const dispatch = useDispatch()
    const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    // const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)
    const plantList = useSelector(state => state.comman.plantList)

    useEffect(() => {
        setVendorInputLoader(true)
        const { vbcVendorGrid } = props;
        dispatch(getVendorWithVendorCodeSelectList(() => {
            setVendorInputLoader(false)
        }))
        dispatch(fetchPlantDataAPI(() => { }))
        let tempArr = [];
        vbcVendorGrid && vbcVendorGrid.map(el => {
            tempArr.push(el.VendorId)
            return null;
        })
        initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr)
    }, []);



    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getReporterList(() => { }))
        if (props?.data?.isEditFlag) {
            setIsEditFlag(true)
            setIsViewFlag(props?.data?.isViewFlag)
            dispatch(getQuotationById(props?.data?.Id, (res) => {


                if (res?.data?.Data) {
                    let data = res?.data?.Data
                    setValue("technology", {
                        label: data.TechnologyName, value: data.TechnologyId
                    })
                    setValue("plant", {
                        label: data.PlantName, value: data.PlantId
                    })
                    setPartList(data.PartList)
                    setVendorList(data.VendorList)
                    setValue("remark", data.Remark)
                }

            })
            )
        }
    }, [])


    const deleteFile = (FileId, OriginalFileName) => {
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
        const loop = Number(dropzone.current.files.length) - Number(files.length)
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

    const deleteItemPartTable = (gridData, props) => {

        let arr = []
        gridData && gridData.map((item) => {

            if (item?.PartId !== props?.node?.data?.PartId) {
                arr.push(item)
            }
        })

        if (arr.length === 0) {
            setDisableTechnology(false)
        }
        setPartList(arr)
    }

    const deleteItemVendorTable = (gridData, props) => {

        let arr = []
        gridData && gridData.map((item) => {

            if (item?.VendorId !== props?.node?.data?.VendorId) {
                arr.push(item)
            }
        })

        setVendorList(arr)
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
        setValue('partNumber', { label: props?.node?.data?.PartNo, value: props?.node?.data?.PartId })
        setValue('annualForecastQuantity', props?.node?.data?.Quantity)
        setValue('technology', props?.node?.data?.technology)
    }


    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {

        const temp = [];

        if (label === 'vendor') {

            vendorSelectList && vendorSelectList.map(item => {
                let isExist = false
                if (item.Value === '0') { return false }
                if (vendorList.length > 0) {            // EXISTING VENDOR IN TABLE SHOULD NOT APPEAR IN DROPDOWN
                    vendorList.map((element) => {
                        if (element.VendorId === item.Value) {
                            isExist = true
                        }
                    })
                }
                if (!isExist) {
                    temp.push({ label: item.Text, value: item.Value })
                }
                return null;
            });
            return temp;
        }

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


        if (label === 'partNo') {
            partSelectListByTechnology && partSelectListByTechnology.map((item) => {
                let isExist = false
                if (item.Value === '0') { return false }
                if (partList.length > 0) {            // EXISTING PART IN TABLE SHOULD NOT APPEAR IN DROPDOWN
                    partList.map((element) => {
                        if (element.PartId === item.Value) {
                            isExist = true
                        }
                    })
                }
                if (!isExist) {
                    temp.push({ label: item.Text, value: item.Value })
                }
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
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.closeDrawer('', {})
    }

    const onSubmit = data => {
        if (vendorList.length === 0) {
            Toaster.warning("Please enter vendor details")
            return false
        } else if (partList.length === 0) {
            Toaster.warning("Please enter part details")
            return false
        }

        let obj = {}
        obj.Remark = data?.remark
        obj.TechnologyId = data?.technology?.value
        obj.PlantId = data?.plant?.value
        obj.LoggedInUserId = loggedInUserId()
        obj.VendorList = vendorList
        obj.PartList = partList
        obj.Attachments = []

        if (isEditFlag) {
            dispatch(updateRfqQuotation(obj, (res) => {
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                    cancel()
                }
            }))

        } else {

            dispatch(createRfqQuotation(obj, (res) => {
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                    cancel()
                }
            }))

        }
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,

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


    const buttonFormatter = (props) => {

        return (
            <>
                {!isEditFlag && < button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItemPartTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {!isEditFlag && <button className="Delete align-middle" type={'button'} onClick={() => deleteItemPartTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };

    const buttonFormatterVendorTable = (props) => {

        return (
            <>
                {!isEditFlag && <button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
                {!isEditFlag && <button className="Delete align-middle" type={'button'} onClick={() => deleteItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };


    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        totalValueRenderer: buttonFormatter,
        buttonFormatter: buttonFormatterVendorTable,
        customNoRowsOverlay: NoContentFound

    };


    const addRowVendorTable = () => {

        let data = {}
        let temp = []
        partList && partList.map((item) => {
            temp.push(item.PartId)
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

                let arr = [...vendorList, obj]

                if (updateButtonVendorTable) {
                    arr = []
                    vendorList && vendorList.map((item) => {
                        if (JSON.stringify(selectedRowVendorTable) === JSON.stringify(item)) {
                            return false
                        } else {
                            arr.push(item)
                        }
                    })
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

        let obj = {}
        obj.PartId = getValues('partNumber').value
        obj.Quantity = Number(getValues('annualForecastQuantity'))
        obj.PartNo = getValues('partNumber').label
        obj.technology = getValues('technology')

        if (obj.PartId === null || obj.PartId === undefined || obj.Quantity === null || obj.Quantity === undefined || isNaN(obj.Quantity)) {
            Toaster.warning("Please fill all the mandatory fields first.")
            return false;
        }

        let arr = [...partList, obj]

        if (updateButtonPartNoTable) {
            arr = []
            partList && partList.map((item) => {
                if (JSON.stringify(selectedRowPartNoTable) === JSON.stringify(item)) {
                    return false
                } else {
                    arr.push(item)
                }
            })
            arr.push(obj)
        }

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
            setInputLoader(true)
            dispatch(getPartSelectListByTechnology(newValue.value, () => {
                setInputLoader(false)
                setPartNoDisable(false)
                setValue('partNo', "")
            }))

        }
    }


    const handleVendorChange = (data) => {

        dispatch(getContactPerson(data.value, (res) => {
            setGetReporterListDropDown(res?.data?.SelectList)
        }))



    }


    const VendorLoaderObj = { isLoader: VendorInputLoader }
    const plantLoaderObj = { isLoader: inputLoader }
    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
                onClose={(e) => cancel}
                className='rfq-container-drawer'
            >
                <Container>
                    <div className={`drawer-wrapper drawer-700px`}>
                        <Row className="drawer-heading">
                            <Col className='pl-0'>
                                <div className={"header-wrapper d-flex justify-content-between right"}>
                                    <h3>{"Add RFQ"}</h3>
                                    <div
                                        onClick={cancel}
                                        className={"close-button right"}
                                    ></div>
                                </div>

                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="part-detail-wrapper">
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={"Technology"}
                                        name={"technology"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        defaultValue={vendor.length !== 0 ? vendor : ""}
                                        options={renderListing("technology")}
                                        mandatory={true}
                                        handleChange={handleTechnologyChange}
                                        errors={errors.Vendor}
                                        disabled={isEditFlag || disableTechnology}
                                        isLoading={VendorLoaderObj}
                                    />
                                </Col>
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={"Plant"}
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
                                        disabled={isEditFlag}
                                    />
                                </Col>
                            </Row>
                            <HeaderTitle title={'Part:'} />
                            <Row className="part-detail-wrapper">
                                <Col md="4">
                                    <SearchableSelectHookForm
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
                                        errors={errors.partNo}
                                        disabled={partNoDisable || isEditFlag}
                                        isLoading={plantLoaderObj}
                                    />
                                </Col>
                                <Col md="4">
                                    <NumberFieldHookForm
                                        label="Annual Forecast Q."
                                        name={"annualForecastQuantity"}
                                        errors={errors.ZipCode}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        disableErrorOverflow={true}
                                        mandatory={true}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                value: /^[0-9]{0,6}$/i,
                                                message: 'Field should be positive no with Max length 6'
                                            }
                                        }}
                                        handleChange={() => { }}
                                        disabled={isEditFlag}
                                        placeholder={'Enter'}
                                        customClassName={'withBorder'}
                                    />
                                </Col>
                                <Col md="4" className='d-flex align-items-center pb-1'>
                                    <button
                                        type="button"
                                        className={'user-btn pull-left ml-2'}
                                        onClick={() => addRowPartNoTable()}
                                        disabled={isEditFlag}
                                    >
                                        <div className={'plus'}></div>{!updateButtonPartNoTable ? "ADD" : "UPDATE"}
                                    </button>
                                    <button
                                        onClick={onResetPartNoTable} // Need to change this cancel functionality
                                        type="submit"
                                        value="CANCEL"
                                        className="reset ml-10 ml-2"
                                        disabled={isEditFlag}
                                    >
                                        <div className={''}></div>
                                        RESET
                                    </button>
                                </Col>
                            </Row>
                            <div>
                                {true && <div className={`ag-grid-react`}>
                                    <Row>
                                        <Col>
                                            <div className={`ag-grid-wrapper height-width-wrapper ${partList && partList.length <= 0 ? "overlay-contain" : ""} `}>

                                                <div className={`ag-theme-material  max-loader-height`}>
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
                                                    >
                                                        <AgGridColumn width={"230px"} field="PartNo" headerName="Part No" ></AgGridColumn>

                                                        <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                        <AgGridColumn width={"0px"} field="PartId" headerName="Part Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>

                                                        <AgGridColumn width={"190px"} field="PartId" headerName="Action" floatingFilter={false} type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                                    </AgGridReact>

                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                }
                            </div>

                            <HeaderTitle title={'Vendor:'} customClass="mt-4" />
                            <Row className="mt-1 part-detail-wrapper">
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={"Vendor"}
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
                                        errors={errors.Vendor}
                                        isLoading={VendorLoaderObj}
                                        disabled={isViewFlag || partList.length === 0}
                                    />
                                </Col>


                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={"Contact Person"}
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
                                        disabled={isViewFlag}
                                        isLoading={plantLoaderObj}
                                    />
                                </Col>
                                <Col md="4" className='d-flex align-items-center pb-1'>
                                    <button
                                        type="button"
                                        className={'user-btn pull-left ml-2'}
                                        onClick={() => addRowVendorTable()}
                                        disabled={isViewFlag}
                                    >
                                        <div className={'plus'}></div>{!updateButtonVendorTable ? "ADD" : "UPDATE"}
                                    </button>

                                    <button
                                        onClick={onResetVendorTable} // Need to change this cancel functionality
                                        type="submit"
                                        value="CANCEL"
                                        className="reset ml-10 ml-2"
                                        disabled={isViewFlag}
                                    >
                                        <div className={''}></div>
                                        RESET
                                    </button>
                                </Col>
                            </Row>


                            <div>
                                {true && <div className={`ag-grid-react`}>
                                    <Row>
                                        <Col>
                                            <div className={`ag-grid-wrapper height-width-wrapper ${vendorList && vendorList.length <= 0 ? "overlay-contain" : ""} `}>

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

                                                        <AgGridColumn width={"270px"} field="ContactPerson" headerName="Contact Person" ></AgGridColumn>
                                                        <AgGridColumn width={"270px"} field="VendorId" headerName="Vendor Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                        <AgGridColumn width={"180px"} field="partId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatter'}></AgGridColumn>
                                                    </AgGridReact>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                }
                            </div>
                            <HeaderTitle title={'Remark and Attachments:'} customClass="mt-4" />
                            <Row className='part-detail-wrapper'>
                                <Col md="6">
                                    <TextAreaHookForm
                                        label={"Remark"}
                                        name={"remark"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                        // options={renderListing("DestinationPlant")}
                                        mandatory={true}
                                        // handleChange={handleDestinationPlantChange}
                                        handleChange={() => { }}
                                        errors={errors.remark}
                                        disabled={isEditFlag}
                                    // isLoading={plantLoaderObj}
                                    />
                                </Col>

                                <Col md="6" className="height152-label pr-2">
                                    <label>Upload Attachment (upload up to 4 files)</label>
                                    <div className={`alert alert-danger mt-2 ${files.length === 4 ? '' : 'd-none'}`} role="alert">
                                        Maximum file upload limit has been reached.
                                    </div>
                                    <div className={`${files.length >= 4 ? 'd-none' : ''}`}>
                                        <Dropzone
                                            ref={dropzone}
                                            onChangeStatus={handleChangeStatus}
                                            PreviewComponent={Preview}
                                            //onSubmit={this.handleSubmit}
                                            accept="*"
                                            initialFiles={[]}
                                            maxFiles={4}
                                            maxSizeBytes={20000000}
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
                                            disabled={isEditFlag}
                                        />
                                    </div>
                                </Col>
                                <Col md="4">
                                    <div className={"attachment-wrapper"}>
                                        {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                        {files &&
                                            files.map((f) => {
                                                const withOutTild = f.FileURL.replace("~", "");
                                                const fileURL = `${FILE_URL}${withOutTild}`;
                                                return (
                                                    <div className={"attachment images"}>
                                                        <a href={fileURL} target="_blank" rel="noreferrer">
                                                            {f.OriginalFileName}
                                                        </a>
                                                        {
                                                            true &&
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

                            <Row className="justify-content-between">
                                <div className="col-sm-12 text-right">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button type="submit" className="submit-button save-btn"
                                        disabled={isViewFlag}>
                                        <div className={"save-icon"}></div>
                                        {"Send"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container >
            </Drawer >
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
        </div >
    );
}

export default AddRfq