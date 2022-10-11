import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm, } from '.././layout/HookFormInputs'
import { getVendorWithVendorCodeSelectList, getPlantBySupplier, getPlantSelectListByType, getReporterList } from '../.././actions/Common';
import { getCostingSpecificTechnology, getPartSelectListByTechnology, getVBCDetailByVendorId, } from '../costing/actions/Costing'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../.././helper';
import { EMPTY_GUID_0, ZBC, EMPTY_DATA, FILE_URL } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import redcrossImg from '../../assests/images/red-cross.png'

const gridOptions = {};

function AddRfq(props) {

    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, control } = useForm();

    const [vendor, setVendor] = useState([]);
    const [data, setData] = useState({});
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [DestinationPlant, setDestinationPlant] = useState([]);
    //dropdown loader 
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [agGridTable, setAgGridTable] = useState(true)
    const [tableData, setTableData] = useState([])
    const [partList, setPartList] = useState([])
    const [vendorList, setVendorList] = useState([])
    const [updateButton, setUpdateButton] = useState(false)
    const [updateButtonSecond, setUpdateButtonSecond] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedRowFirst, setSelectedRowFirst] = useState({})
    const [selectedRowSecond, setSelectedSecond] = useState({})
    const [rmRowDataState, setRmRowDataState] = useState({})
    const [disableCondition, setDisableCondition] = useState(true)
    const [files, setFiles] = useState([])
    const [initialFiles, setInitialFiles] = useState([])
    const [IsOpen, setIsOpen] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [partNoDisable, setPartNoDisable] = useState(true)
    const [attachmentLoader, setAttachmentLoader] = useState(false)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
    const dispatch = useDispatch()
    const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)

    useEffect(() => {
        setVendorInputLoader(true)
        const { vbcVendorGrid } = props;
        dispatch(getVendorWithVendorCodeSelectList(() => {
            setVendorInputLoader(false)
        }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))

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

        }

    }, [])


    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            Toaster.success('File has been deleted successfully.')
            let tempArr = files && files.filter(item => item.FileId !== FileId)
            setFiles(tempArr)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
            setFiles(tempArr)
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
            // dispatch(fileUploadCosting(data, (res) => {
            //     // setDisableFalseFunction()
            //     if ('response' in res) {
            //         status = res && res?.response?.status
            //         dropzone.current.files.pop()
            //     }
            //     else {
            //         let Data = res.data[0]
            //         files.push(Data)
            //         setFiles(files)
            //         setAttachmentLoader(false)
            //         setTimeout(() => {
            //             setIsOpen(!IsOpen)
            //         }, 500);
            //     }
            // }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
            // setDisableFalseFunction()
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

    const deleteItem = (gridData, props) => {

        let arr = []
        gridData && gridData.map((item) => {

            if (item?.PartId !== props?.node?.data?.PartId) {
                arr.push(item)
            }
        })
        setPartList(arr)
    }

    const deleteItemSecond = (gridData, props) => {

        let arr = []
        gridData && gridData.map((item) => {

            if (item?.VendorId !== props?.node?.data?.VendorId) {
                arr.push(item)
            }
        })
        setVendorList(arr)
    }

    const editItemSecond = (gridData, props) => {

        setSelectedSecond(props.node.data)

        setUpdateButtonSecond(true)
        setValue('vendor', { label: props?.node?.data?.Vendor, value: props?.node?.data?.VendorId })
        setValue('contactPerson', {
            label: props?.node?.data?.ContactPerson
            , value: props?.node?.data?.ContactPersonId

        })


    }

    const editItem = (gridData, props) => {

        setSelectedRowFirst(props.node.data)
        setUpdateButton(true)
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

        if (label === 'Vendor') {
            vendorSelectList && vendorSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'DestinationPlant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantName: item.PlantName, PlantCode: item.PlantCode })
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

        dispatch(createRfqQuotation(obj, (res) => {
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.RFQ_ADD_SUCCESS)
                cancel()
            }
        }))

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
                {<button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItem(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button className="Delete align-middle" type={'button'} onClick={() => deleteItem(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };

    const buttonFormatterSecond = (props) => {

        return (
            <>
                {<button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItemSecond(props?.agGridReact?.gridOptions.rowData, props)} />}
                {<button className="Delete align-middle" type={'button'} onClick={() => deleteItemSecond(props?.agGridReact?.gridOptions.rowData, props)} />}
            </>
        )
    };


    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        totalValueRenderer: buttonFormatter,
        buttonFormatter: buttonFormatterSecond

    };


    const addRowSecond = () => {

        let obj = {}
        obj.VendorId = getValues('vendor')?.value
        obj.ContactPersonId = getValues('contactPerson')?.value
        obj.Vendor = getValues('vendor')?.label
        obj.ContactPerson = getValues('contactPerson')?.label

        if (obj.VendorId === null || obj.VendorId === undefined || obj.ContactPersonId === null || obj.ContactPersonId === undefined) {

            Toaster.warning("Please fill all the mandatory fields first.")
            return false;
        }

        setVendorList([...vendorList, obj])
        setValue('vendor', "")
        setValue('contactPerson', "")
        setUpdateButtonSecond(false)

    }


    const addRowFirst = () => {

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

        setPartList(arr)
        setValue('partNumber', "")
        setValue('annualForecastQuantity', "")
        setValue('technology', "")
        setUpdateButton(false)

    }


    const onCancel = () => {
        setUpdateButton(false)
        setValue('partNumber', "")
        setValue('annualForecastQuantity', "")
        setValue('technology', "")
    }


    const onCancelSecond = () => {
        setUpdateButtonSecond(false)
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
            >
                <Container>
                    <div className={`drawer-wrapper WIDTH-700 drawer-700px`}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper right"}>
                                    <h3>{"Add RFQ"}</h3>
                                </div>
                                <div
                                    onClick={cancel}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="pl-3">
                                <Col md="12">
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
                                        isLoading={VendorLoaderObj}
                                    />
                                </Col>



                                <Col md="12">
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
                                        disabled={partNoDisable}
                                        isLoading={plantLoaderObj}
                                    />
                                </Col>


                                <div className="input-group col-md-3 input-withouticon">
                                    <NumberFieldHookForm
                                        label="Annual Forecast Quantity"
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
                                        placeholder={'Enter'}
                                        customClassName={'withBorder'}
                                    />
                                </div>
                            </Row>

                            <button
                                type="button"
                                className={'user-btn mt30 pull-left ml-3'}
                                onClick={() => addRowFirst()}
                                disabled={false}
                            >
                                <div className={'plus'}></div>{!updateButton ? "ADD" : "UPDATE"}
                            </button>

                            <button
                                onClick={onCancel} // Need to change this cancel functionality
                                type="submit"
                                value="CANCEL"
                                className="reset ml-10 cancel-btn mt-4 ml-2"
                                disabled={false}
                            >
                                <div className={''}></div>
                                RESET
                            </button>


                            <div>
                                {true && <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper height-width-wrapper ${tableData && tableData.length <= 0 ? "overlay-contain" : ""} `}>

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
                                                    //noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                >
                                                    <AgGridColumn field="PartNo" headerName="Part No" ></AgGridColumn>

                                                    <AgGridColumn minWidth="150" field="Quantity" headerName="Annual Forecast Quantity" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                    <AgGridColumn minWidth="150" field="PartId" headerName="Part Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>

                                                    <AgGridColumn minWidth="120" field="PartId" headerName="Action" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                                </AgGridReact>

                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                }
                            </div>


                            <Row className="pl-3">
                                <Col md="12">
                                    <SearchableSelectHookForm
                                        label={"Vendor"}
                                        name={"vendor"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        defaultValue={vendor.length !== 0 ? vendor : ""}
                                        options={renderListing("Vendor")}
                                        mandatory={true}
                                        // handleChange={handleVendorChange}
                                        handleChange={() => { }}
                                        errors={errors.Vendor}
                                        isLoading={VendorLoaderObj}
                                    />
                                </Col>


                                <Col md="12">
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
                                        errors={errors.DestinationPlant}
                                        disabled={false}
                                        isLoading={plantLoaderObj}
                                    />
                                </Col>
                            </Row>

                            <button
                                type="button"
                                className={'user-btn mt30 pull-left ml-3'}
                                onClick={() => addRowSecond()}
                                disabled={false}
                            >
                                <div className={'plus'}></div>{!updateButtonSecond ? "ADD" : "UPDATE"}
                            </button>

                            <button
                                onClick={onCancelSecond} // Need to change this cancel functionality
                                type="submit"
                                value="CANCEL"
                                className="reset ml-10 cancel-btn mt-4 ml-2"
                                disabled={false}
                            >
                                <div className={''}></div>
                                RESET
                            </button>
                            <div>
                                {true && <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper height-width-wrapper ${tableData && tableData.length <= 0 ? "overlay-contain" : ""} `}>

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

                                                    <AgGridColumn minWidth="150" field="ContactPerson" headerName="Contact Person" ></AgGridColumn>
                                                    <AgGridColumn minWidth="150" field="VendorId" headerName="Vendor Id" hide={true} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                    <AgGridColumn minWidth="120" field="partId" headerName="Action" floatingFilter={false} cellRenderer={'buttonFormatter'}></AgGridColumn>
                                                </AgGridReact>

                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                }
                            </div>
                            <Row className="pl-3">
                                <Col md="12">
                                    <SearchableSelectHookForm
                                        label={"Plant"}
                                        name={"plant"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        // defaultValue={vendor.length !== 0 ? vendor : ""}
                                        options={renderListing("DestinationPlant")}
                                        mandatory={true}
                                        // handleChange={handleVendorChange}
                                        handleChange={() => { }}
                                        errors={errors.plant}
                                        isLoading={VendorLoaderObj}
                                    />
                                </Col>
                                <Col md="12">
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
                                        disabled={false}
                                    // isLoading={plantLoaderObj}
                                    />
                                </Col>
                            </Row>


                            <Col md="3" className="height152-label">
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
                                        disabled={false}
                                    />
                                </div>
                            </Col>
                            <Col md="3">
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

                                    <button type="submit" className="submit-button save-btn">
                                        <div class="plus"></div>
                                        {"Send"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
        </div>
    );
}

export default AddRfq