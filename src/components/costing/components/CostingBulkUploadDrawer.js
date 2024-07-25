import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactExport from 'react-export-excel';
import { Field } from "redux-form";
import { Container, Row, Col, Label, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import { bulkUploadCosting, plasticBulkUploadCosting, machiningBulkUploadCosting, corrugatedBoxBulkUploadCosting, assemblyBulkUploadCosting, wiringHarnessBulkUploadCosting, diecastingBulkUploadCosting } from '../actions/CostWorking'
import { CostingBulkUploadTechnologyDropdown, TechnologyDropdownBulkUpload, TechnologyDropdownBulkUploadV4 } from '../../../config/masterData'
import { ASSEMBLY, CORRUGATED_BOX, MACHINING_GROUP_BULKUPLOAD, PLASTIC_GROUP_BULKUPLOAD, SHEETMETAL_GROUP_BULKUPLOAD, FILE_URL, WIRINGHARNESS, SHEET_METAL, SHEETMETAL, DIE_CASTING } from '../../../config/constants';
import { getCostingTechnologySelectList, } from '../actions/Costing'
import { searchableSelect } from '../../layout/FormInputs';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey, loggedInUserId } from '../../../helper';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const CostingBulkUploadDrawer = (props) => {
    const dropzone = useRef(null);
    const dispatch = useDispatch();
    const [state, setState] = useState({
        files: [],
        fileData: '',
        fileName: '',
        Technology: [],
        attachmentLoader: false,
        costingVersion: 'V1'
    });


    useEffect(() => {
        dispatch(getCostingTechnologySelectList(() => { }))
    })

    const renderListing = (label) => {
        const { technologySelectList } = props
        let tempArr = []
        // DON'T REMOVE THIS MIGHT BE USED LATER
        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                tempArr.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempArr
        }
        if (label === 'TechnologyMixed') {
            TechnologyDropdownBulkUpload && TechnologyDropdownBulkUpload.map((item) => {
                if (item.value === '0') return false
                tempArr.push({ label: item.label, value: item.value })
                return null
            })
            return tempArr
        }
        if (label === 'TechnologyMixedV4') {
            TechnologyDropdownBulkUploadV4 && TechnologyDropdownBulkUploadV4.map((item) => {
                if (item.value === '0') return false
                tempArr.push({ label: item.label, value: item.value })
                return null
            })
            return tempArr

        }
    }

    const handleTechnologyChange = (value) => {
        setState((prev) => ({ ...prev, Technology: value }))
    }

    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }, status) => {

        const { files } = state
        let fileObj = files[0];

        let data = new FormData()
        data.append('file', fileObj)
        setState((prev) => ({ ...prev, attachmentLoader: true }))
        if (status === 'removed') {
            const removedFileName = file.name
            let tempArr = files.filter((item) => item.OriginalFileName !== removedFileName)
            setState((prev) => ({ ...prev, files: tempArr }))
        }

        if (status === 'done') {
            setState((prev) => ({ ...prev, fileName: file.name, fileData: file, attachmentLoader: false }))
        }

        if (status === 'rejected_file_type') {
            dropzone.current.files.pop()
            setState((prev) => ({ ...prev, attachmentLoader: false }))
            Toaster.warning('Allowed only xlsx files.')
        } else if (status === 'error_file_size') {
            dropzone.current.files.pop()
            setState((prev) => ({ ...prev, attachmentLoader: false }))
            Toaster.warning("File size greater than 2mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            dropzone.current.files.pop()
            setState((prev) => ({ ...prev, attachmentLoader: false }))
            Toaster.warning("Something went wrong")
        }
    }

    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('')
    };

    const cancel = () => {
        toggleDrawer('')
    }

    const Preview = ({ meta }) => {
        return (
            <span
                style={{
                    alignSelf: 'flex-start',
                    margin: '10px 3%',
                    fontFamily: 'Helvetica',
                }}
            >
            </span>
        )
    }

    /**
    * @method returnExcelColumn
    * @description Used to get excel column names
    */
    const returnExcelColumn = (data = [], TempData) => {

        // DON'T REMOVE THIS MIGHT BE USED LATER
        // const { fileName, failedData, isFailedFlag } = props;

        // if (isFailedFlag) {

        //     //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
        //     let isContentReason = data.filter(d => d.label === 'Reason')
        //     if (isContentReason.length === 0) {
        //         let addObj = { label: 'Reason', value: 'Reason' }
        //         data.push(addObj)
        //     }
        // }
        const fileName = "Costing"

        return (<ExcelSheet data={TempData} name={fileName}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }
    const fileHandler = event => {

        let fileObj = event.target.files[0];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
        }
    }
    const handleApiResponse = (res, files) => {

        if (res.status === 400) {
            let Data = res.data.Data
            const withOutTild = Data?.FileURL?.replace("~", "");
            const fileURL = `${FILE_URL}${withOutTild}`;
            window.open(fileURL, '_blank');
        } else {
            let Data = res.data[0]
            const { files } = state
            files.push(Data)
        }
    }

    const onSubmit = (value) => {
        const { fileData, Technology, costingVersion } = state;

        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }

        let data = new FormData()
        data.append('file', fileData)
        data.append('loggedInUserId', loggedInUserId())
        data.append('IsShowRawMaterialInOverheadProfitAndICC', getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC)
        data.append('version', costingVersion)

        switch (Number(Technology.value)) {
            case SHEETMETAL_GROUP_BULKUPLOAD:
            case SHEETMETAL:
                dispatch(bulkUploadCosting(data, costingVersion, handleApiResponse))
                cancel()
                break;
            case PLASTIC_GROUP_BULKUPLOAD:
                dispatch(plasticBulkUploadCosting(data, costingVersion, handleApiResponse))
                cancel()
                break;
            case MACHINING_GROUP_BULKUPLOAD:
                dispatch(machiningBulkUploadCosting(data, costingVersion, handleApiResponse))
                cancel()
                break;
            case CORRUGATED_BOX:
                dispatch(corrugatedBoxBulkUploadCosting(data, handleApiResponse))
                cancel()
                break;
            case ASSEMBLY:
                dispatch(assemblyBulkUploadCosting(data, handleApiResponse))
                cancel()
                break;
            case WIRINGHARNESS:
                dispatch(wiringHarnessBulkUploadCosting(data, handleApiResponse))
                cancel()
                break;

            case DIE_CASTING:
                dispatch(diecastingBulkUploadCosting(data, handleApiResponse))
                cancel()
                break;

            default:
                break;
        }
    }

    const setCostingVersion = (value) => {

        setState((prev) => ({ ...prev, costingVersion: value, Technology: [] }))
    }


    return (
        <>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper"}>
                        <form
                            noValidate
                            className="form"
                            onSubmit={onSubmit}
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            {"Costing Bulk Upload"}
                                        </h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row className="pl-12">
                                {/* <Col md="12">
                                        <ExcelFile fileExtension={'.xls'} filename={"Costing"} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>}>
                                            {returnExcelColumn(CostingBulkUpload, CostingBulkUploadTempData)}
                                        </ExcelFile>
                                    </Col> */}
                                {/* <Col md="12">
                                        <div className="input-group mt25 col-md-12 input-withouticon " >
                                            <div className="file-uploadsection">
                                                <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={require('../../../assests/images/uploadcloud.png')} ></img> </label>
                                                <input
                                                    type="file"
                                                    name="File"
                                                    onChange={fileHandler}
                                                    //accept="xls/*"
                                                    className="" placeholder="bbb" />
                                                <p> {state.uploadfileName}</p>
                                            </div>
                                        </div>
 
                                    </Col> */}

                                <Row>
                                    <Col md="12">
                                        <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                defaultChecked={true}
                                                onClick={() =>
                                                    setCostingVersion("V1")
                                                }
                                                disabled={false}
                                            />{" "}
                                            <span>Version 1</span>
                                        </Label>
                                        <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                onClick={() =>
                                                    setCostingVersion("V2")
                                                }
                                                disabled={false}
                                            />{" "}
                                            <span>Version 2</span>
                                        </Label>
                                        <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                onClick={() =>
                                                    setCostingVersion("V3")
                                                }
                                                disabled={false}
                                            />{" "}
                                            <span>Version 3</span>
                                        </Label>
                                        <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                onClick={() =>
                                                    setCostingVersion("V4")
                                                }
                                                disabled={false}
                                            />{" "}
                                            <span>Version 4</span>
                                        </Label>
                                    </Col>
                                </Row>

                                <Col md="12">

                                    <Field
                                        name="Technology"
                                        type="text"
                                        label="Technology"
                                        component={searchableSelect}
                                        placeholder={"Select"}
                                        // options={state.costingVersion === 'V3' ? CostingBulkUploadTechnologyDropdown : renderListing("TechnologyMixed")}
                                        options={
                                            state.costingVersion === 'V3'
                                                ? CostingBulkUploadTechnologyDropdown
                                                : (state.costingVersion === 'V4'
                                                    ? renderListing("TechnologyMixedV4")
                                                    : renderListing("TechnologyMixed"))
                                        }
                                        handleChangeDescription={handleTechnologyChange}
                                        valueDescription={state.Technology}
                                    />
                                </Col>

                                <Col md="12">
                                    <label>Upload File</label>
                                    {state.fileName !== "" ? (
                                        <div class="alert alert-danger" role="alert">
                                            {state.fileName}
                                        </div>
                                    ) : (
                                        <Dropzone
                                            ref={dropzone}
                                            onChangeStatus={handleChangeStatus}
                                            PreviewComponent={Preview}
                                            onChange={fileHandler}
                                            accept=".xls,.xlsx"
                                            initialFiles={state.initialFiles}
                                            maxFiles={1}
                                            inputContent={(files, extra) =>
                                                extra.reject ? (
                                                    "Image, audio and video files only"
                                                ) : (<div className="text-center">
                                                    <i className="text-primary fa fa-cloud-upload"></i>
                                                    <span className="d-block">
                                                        Drag and Drop or{" "}
                                                        <span className="text-primary">
                                                            Browse
                                                        </span>
                                                        <br />
                                                        file to upload
                                                    </span>
                                                </div>)
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
                                        />
                                    )}
                                    {state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                </Col>
                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 pl-3 pr-3">
                                    <div className="text-right ">
                                        <button
                                            onClick={cancel}
                                            type="submit"
                                            value="CANCEL"
                                            className="reset mr15 cancel-btn"
                                        >
                                            <div className={'cancel-icon'}></div>
                                            CANCEL
                                        </button>
                                        <button type="submit" className="btn-primary save-btn">
                                            <div className={'save-icon'}></div>
                                            {"SAVE"}
                                        </button>
                                    </div>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer >
        </>
    );

}


export default CostingBulkUploadDrawer