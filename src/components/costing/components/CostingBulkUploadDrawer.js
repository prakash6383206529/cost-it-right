import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Label, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import { bulkUploadCosting, plasticBulkUploadCosting, machiningBulkUploadCosting, corrugatedBoxBulkUploadCosting, assemblyBulkUploadCosting, wiringHarnessBulkUploadCosting } from '../actions/CostWorking'
import { CostingBulkUploadTechnologyDropdown, TechnologyDropdownBulkUpload } from '../../../config/masterData'
import { ASSEMBLY, CORRUGATED_BOX, MACHINING_GROUP_BULKUPLOAD, PLASTIC_GROUP_BULKUPLOAD, SHEETMETAL_GROUP_BULKUPLOAD, FILE_URL, WIRINGHARNESS, SHEET_METAL, SHEETMETAL } from '../../../config/constants';
import { getCostingTechnologySelectList, } from '../actions/Costing'
import { searchableSelect } from '../../layout/FormInputs';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey, loggedInUserId } from '../../../helper';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class CostingBulkUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.dropzone = React.createRef();
        this.state = {
            files: [],
            fileData: '',
            fileName: '',
            Technology: [],
            attachmentLoader: false,
            costingVersion: 'V1'
        }
    }


    /**
 * @method componentWillMount
 * @description Called before render the component
 */
    UNSAFE_componentWillMount() {
        this.props.getCostingTechnologySelectList(() => { })

    }


    renderListing = (label) => {
        const { technologySelectList } = this.props
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
                if (item.Value === '0') return false
                tempArr.push({ label: item.label, value: item.value })
                return null
            })
            return tempArr
        }
    }

    handleTechnologyChange = (value) => {
        this.setState({ Technology: value })
    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {

        const { files } = this.state
        let fileObj = files[0];

        let data = new FormData()
        data.append('file', fileObj)
        this.setState({ attachmentLoader: true })
        if (status === 'removed') {
            const removedFileName = file.name
            let tempArr = files.filter((item) => item.OriginalFileName !== removedFileName)
            this.setState({ files: tempArr })
        }

        if (status === 'done') {
            this.setState({ fileName: file.name, fileData: file, attachmentLoader: false })
        }

        if (status === 'rejected_file_type') {
            this.dropzone.current.files.pop()
            this.setState({ attachmentLoader: false })
            Toaster.warning('Allowed only xlsx files.')
        } else if (status === 'error_file_size') {
            this.dropzone.current.files.pop()
            this.setState({ attachmentLoader: false })
            Toaster.warning("File size greater than 2mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            this.dropzone.current.files.pop()
            this.setState({ attachmentLoader: false })
            Toaster.warning("Something went wrong")
        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    cancel = () => {
        this.toggleDrawer('')
    }

    Preview = ({ meta }) => {
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
    returnExcelColumn = (data = [], TempData) => {

        // DON'T REMOVE THIS MIGHT BE USED LATER
        // const { fileName, failedData, isFailedFlag } = this.props;

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
    fileHandler = event => {

        let fileObj = event.target.files[0];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
        }
    }

    onSubmit = (value) => {
        const { fileData } = this.state

        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }

        let data = new FormData()
        data.append('file', fileData)
        data.append('loggedInUserId', loggedInUserId())
        data.append('IsShowRawMaterialInOverheadProfitAndICC', getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC)

        switch (Number(this.state.Technology.value)) {
            case SHEETMETAL_GROUP_BULKUPLOAD:
            case SHEETMETAL:
                this.props.bulkUploadCosting(data, this.state.costingVersion, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;
            case PLASTIC_GROUP_BULKUPLOAD:
                this.props.plasticBulkUploadCosting(data, this.state.costingVersion, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;
            case MACHINING_GROUP_BULKUPLOAD:
                this.props.machiningBulkUploadCosting(data, this.state.costingVersion, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;
            case CORRUGATED_BOX:
                this.props.corrugatedBoxBulkUploadCosting(data, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;
            case ASSEMBLY:
                this.props.assemblyBulkUploadCosting(data, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;

            case WIRINGHARNESS:
                this.props.wiringHarnessBulkUploadCosting(data, (res) => {
                    if (res.status === 400) {
                        let Data = res.data.Data
                        const withOutTild = Data?.FileURL?.replace("~", "");
                        const fileURL = `${FILE_URL}${withOutTild}`;
                        window.open(fileURL, '_blank');
                    } else {
                        let Data = res.data[0]
                        const { files } = this.state
                        files.push(Data)
                    }
                })
                this.cancel()
                break;

            default:
                break;
        }
    }

    setCostingVersion = (value) => {

        this.setState({ costingVersion: value, Technology: [] })
    }

    render() {
        const { handleSubmit } = this.props
        return (
            <>
                <Drawer
                    anchor={this.props.anchor}
                    open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper"}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {"Costing Bulk Upload"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <Row className="pl-12">
                                    {/* <Col md="12">
                                        <ExcelFile fileExtension={'.xls'} filename={"Costing"} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>}>
                                            {this.returnExcelColumn(CostingBulkUpload, CostingBulkUploadTempData)}
                                        </ExcelFile>
                                    </Col> */}
                                    {/* <Col md="12">
                                        <div className="input-group mt25 col-md-12 input-withouticon " >
                                            <div className="file-uploadsection">
                                                <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={require('../../../assests/images/uploadcloud.png')} ></img> </label>
                                                <input
                                                    type="file"
                                                    name="File"
                                                    onChange={this.fileHandler}
                                                    //accept="xls/*"
                                                    className="" placeholder="bbb" />
                                                <p> {this.state.uploadfileName}</p>
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
                                                        this.setCostingVersion("V1")
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
                                                        this.setCostingVersion("V2")
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
                                                        this.setCostingVersion("V3")
                                                    }
                                                    disabled={false}
                                                />{" "}
                                                <span>Version 3</span>
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
                                            options={this.state.costingVersion === 'V3' ? CostingBulkUploadTechnologyDropdown : this.renderListing("TechnologyMixed")}
                                            handleChangeDescription={this.handleTechnologyChange}
                                            valueDescription={this.state.Technology}
                                        />
                                    </Col>

                                    <Col md="12">
                                        <label>Upload File</label>
                                        {this.state.fileName !== "" ? (
                                            <div class="alert alert-danger" role="alert">
                                                {this.state.fileName}
                                            </div>
                                        ) : (
                                            <Dropzone
                                                ref={this.dropzone}
                                                onChangeStatus={this.handleChangeStatus}
                                                PreviewComponent={this.Preview}
                                                onChange={this.fileHandler}
                                                accept=".xls,.xlsx"
                                                initialFiles={this.state.initialFiles}
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
                                        {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                    </Col>
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12 pl-3 pr-3">
                                        <div className="text-right ">
                                            <button
                                                onClick={this.cancel}
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
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { costing } = state
    const { technologySelectList } = costing
    return { technologySelectList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        bulkUploadCosting,
        getCostingTechnologySelectList,
        plasticBulkUploadCosting,
        machiningBulkUploadCosting,
        corrugatedBoxBulkUploadCosting,
        assemblyBulkUploadCosting,
        wiringHarnessBulkUploadCosting,
    })(reduxForm({
        form: 'CostingBulkUploadDrawer',
        enableReinitialize: true,
        touchOnChange: true
    })(CostingBulkUploadDrawer));