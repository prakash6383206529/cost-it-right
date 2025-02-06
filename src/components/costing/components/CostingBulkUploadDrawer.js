import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactExport from 'react-export-excel';
import { Field } from "redux-form";
import { Container, Row, Col, Label, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import { bulkUploadCosting, plasticBulkUploadCosting, machiningBulkUploadCosting, corrugatedBoxBulkUploadCosting, assemblyBulkUploadCosting, wiringHarnessBulkUploadCosting, diecastingBulkUploadCosting, InsulationBulkUploadCosting, ElectricalStampingCostingBulkImport, MonocartonBulkUploadCosting } from '../actions/CostWorking'
import { CostingBulkUploadTechnologyDropdown, TechnologyDropdownBulkUploadV1, TechnologyDropdownBulkUploadV2, TechnologyDropdownBulkUploadV4 } from '../../../config/masterData'
import { ASSEMBLY, CORRUGATED_BOX, MACHINING_GROUP_BULKUPLOAD, PLASTIC_GROUP_BULKUPLOAD, SHEETMETAL_GROUP_BULKUPLOAD, FILE_URL, WIRINGHARNESS, SHEET_METAL, SHEETMETAL, DIE_CASTING, INSULATION, ELECTRICAL_STAMPING, MONOCARTON, PLASTIC_RUBBER_WITH_EXTRUSION } from '../../../config/constants';
import { getCostingTechnologySelectList, } from '../actions/Costing'
import { searchableSelect } from '../../layout/FormInputs';
import { getConfigurationKey, loggedInUserId } from '../../../helper';
import { useForm } from 'react-hook-form';
import LoaderCustom from '../../common/LoaderCustom';
import { reduxForm } from 'redux-form';



const CostingBulkUploadDrawer = ({
    isOpen,
    closeDrawer,
    anchor,
    handleSubmit
}) => {


    const dropzone = useRef(null);
    const dispatch = useDispatch();
    // const { register, formState: { errors }, control } = useForm();
    const [state, setState] = useState({
        files: [],
        fileData: '',
        fileName: '',
        Technology: [],
        attachmentLoader: false,
        costingVersion: 'V1',
        isLoader: false
    });


    useEffect(() => {
        dispatch(getCostingTechnologySelectList(() => { }))
    })



    const renderListing = (label) => {
        if (label === 'TechnologyV1') {
            return TechnologyDropdownBulkUploadV1
        }
        if (label === 'TechnologyV2') {
            return TechnologyDropdownBulkUploadV2
        }
        if (label === 'TechnologyV3') {
            return CostingBulkUploadTechnologyDropdown
        }
        if (label === 'TechnologyV4') {
            return TechnologyDropdownBulkUploadV4
        }
        return []
    }

    const handleTechnologyChange = (value) => {
        setState((prev) => ({ ...prev, Technology: value }))
    }

    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }, status) => {
        const { files } = state;
        let fileObj = files[0];

        let data = new FormData();
        data.append('file', fileObj);

        setState((prev) => ({ ...prev, attachmentLoader: true }));

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter((item) => item.OriginalFileName !== removedFileName);
            setState((prev) => ({
                ...prev,
                files: tempArr,
                attachmentLoader: false
            }));
        } else if (status === 'done') {
            setState((prev) => ({
                ...prev,
                fileName: file.name,
                fileData: file,
                attachmentLoader: false
            }));
        } else if (status === 'rejected_file_type') {
            dropzone.current.files.pop();
            setState((prev) => ({ ...prev, attachmentLoader: false }));
            Toaster.warning('Allowed only xlsx files.');
        } else if (status === 'error_file_size') {
            dropzone.current.files.pop();
            setState((prev) => ({ ...prev, attachmentLoader: false }));
            Toaster.warning("File size greater than 2mb not allowed");
        } else if (status === 'error_validation'
            || status === 'error_upload_params'
            || status === 'exception_upload'
            || status === 'aborted'
            || status === 'error_upload') {
            dropzone.current.files.pop();
            setState((prev) => ({ ...prev, attachmentLoader: false }));
            Toaster.warning("Something went wrong");
        }
    };

    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('')
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



    const fileHandler = event => {

        let fileObj = event.target.files[0];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
        }
    }
    const handleApiResponse = (res) => {
        setState((prev) => ({ ...prev, isLoader: false }));
        if (res?.status === 400) {
            let Data = res?.data.Data
            const withOutTild = Data?.FileURL?.replace("~", "");
            const fileURL = `${FILE_URL}${withOutTild}`;
            window.open(fileURL, '_blank');
            // Display error message in Toaster
            Toaster.error(res?.data.Message || "Please upload the file with correct data");
        } else if (res?.status === 200) {
            let Data = res?.data[0]
            setState((prev) => ({
                ...prev,
                files: [...prev.files, Data]
            }));
            // Display success message in Toaster
            Toaster.success(res?.data.Message || 'File uploaded successfully');
        }
        // else {
        //     // Display unexpected response message in Toaster
        //     Toaster.error(res?.data.Message || 'Unexpected response from server');
        // }
        cancel(); // Close the drawer after handling the response
    }
    const uploadFunctions = {
        [SHEETMETAL_GROUP_BULKUPLOAD]: bulkUploadCosting,
        [SHEETMETAL]: bulkUploadCosting,
        [PLASTIC_GROUP_BULKUPLOAD]: plasticBulkUploadCosting,
        [MACHINING_GROUP_BULKUPLOAD]: machiningBulkUploadCosting,
        [CORRUGATED_BOX]: corrugatedBoxBulkUploadCosting,
        [ASSEMBLY]: assemblyBulkUploadCosting,
        [WIRINGHARNESS]: wiringHarnessBulkUploadCosting,
        [DIE_CASTING]: diecastingBulkUploadCosting,
        [INSULATION]: InsulationBulkUploadCosting,
        [ELECTRICAL_STAMPING]: ElectricalStampingCostingBulkImport,
        [MONOCARTON]: MonocartonBulkUploadCosting,
        [PLASTIC_RUBBER_WITH_EXTRUSION]: plasticBulkUploadCosting,
    };

    const onSubmit = (value) => {
        const { fileData, Technology, costingVersion } = state;

        if (!Technology || !Technology.value) {
            Toaster.warning('Please select a Technology.');
            return false;
        }

        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }

        let data = new FormData()
        data.append('file', fileData)
        data.append('loggedInUserId', loggedInUserId())
        data.append('IsShowRawMaterialInOverheadProfitAndICC', getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC)
        data.append('version', costingVersion)
        if (Number(Technology.value) === PLASTIC_RUBBER_WITH_EXTRUSION) {
            data.append('processCalculatorType', Number(Technology.value) === PLASTIC_RUBBER_WITH_EXTRUSION ? 'extrusion' : '')
        }
        setState((prev) => ({ ...prev, isLoader: true }));
        switch (Number(Technology.value)) {
            case SHEETMETAL_GROUP_BULKUPLOAD:
            case SHEETMETAL:
            case PLASTIC_GROUP_BULKUPLOAD:
            case PLASTIC_RUBBER_WITH_EXTRUSION:
            case MACHINING_GROUP_BULKUPLOAD:
                dispatch(uploadFunctions[Number(Technology.value)](data, costingVersion, handleApiResponse));
                break;
            case CORRUGATED_BOX:
            case ASSEMBLY:
            case WIRINGHARNESS:
            case DIE_CASTING:
            case INSULATION:
            case ELECTRICAL_STAMPING:
            case MONOCARTON:
                dispatch(uploadFunctions[Number(Technology.value)](data, handleApiResponse));
                break;
            default:
                setState((prev) => ({ ...prev, isLoader: false }));
                Toaster.error('Invalid technology selected');
                break;
        }
    }

    const setCostingVersion = (value) => {

        setState((prev) => ({ ...prev, costingVersion: value, Technology: [] }))
    }

    return (
        <>
            <Drawer
                anchor={anchor}
                open={isOpen}
                onClose={closeDrawer}

            // onClose={(e) => toggleDrawer(e)}
            >

                {state.isLoader && <LoaderCustom customClass={"loader-center"} />}
                <Container>

                    <div className={"drawer-wrapper"}>
                        <form
                            noValidate
                            // className="form"
                            onSubmit={handleSubmit(onSubmit)}
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
                                        options={
                                            state.costingVersion === 'V1'
                                                ? renderListing("TechnologyV1")
                                                : (state.costingVersion === 'V2'
                                                    ? renderListing("TechnologyV2")
                                                    : (state.costingVersion === 'V3'
                                                        ? renderListing("TechnologyV3")
                                                        : renderListing("TechnologyV4")))
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
                                    {state.attachmentLoader && <div className="position-absolute top-0 left-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
                                        <LoaderCustom customClass="attachment-loader" />
                                    </div>}
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
                                        <button type="submit" className="btn-primary save-btn" disabled={state.isLoader || state.attachmentLoader}>
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

// Wrap the component with reduxForm
const CostingBulkUploadDrawerForm = reduxForm({
    form: 'costingBulkUploadForm', // Unique name for the form
    enableReinitialize: true,
    initialValues: {
        Technology: [],
        costingVersion: 'V1'
    }
})(CostingBulkUploadDrawer);

export default CostingBulkUploadDrawerForm;
