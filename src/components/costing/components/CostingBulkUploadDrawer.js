import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import { bulkUploadCosting } from '../actions/CostWorking'
import { CostingBulkUpload, CostingBulkUploadTempData } from '../../../config/masterData'
import { fileUploadRMDomestic, } from '../../masters/actions/Material'
import { FILE_URL } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class CostingBulkUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            fileData: '',
            fileName: ''
        }
    }

    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post' }
    }
    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {

        const { files } = this.state

        if (status === 'removed') {
            const removedFileName = file.name
            let tempArr = files.filter(
                (item) => item.OriginalFileName !== removedFileName,
            )
            this.setState({ files: tempArr })
        }

        if (status === 'done') {

            this.setState({ fileName: file.name, fileData: file })


        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xlsx files.')
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
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    /**
    * @method returnExcelColumn
    * @description Used to get excel column names
    */
    returnExcelColumn = (data = [], TempData) => {
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


    onSubmit = () => {
        const { fileData } = this.state

        let data = new FormData()
        data.append('file', fileData)

        let obj = {
            file: data,
            LoggedInUserId: loggedInUserId(),
        }

        this.props.bulkUploadCosting(obj, (res) => {
            let Data = res.data[0]
            const { files } = this.state
            files.push(Data)
        })
        this.cancel()
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
                                    <Col md="12">
                                        <ExcelFile fileExtension={'.xls'} filename={"Costing"} element={<button type="button" className={'btn btn-primary pull-right'}><img alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>}>
                                            {this.returnExcelColumn(CostingBulkUpload, CostingBulkUploadTempData)}
                                        </ExcelFile>
                                    </Col>
                                    <Col md="12">
                                        <label>Upload File</label>
                                        {this.state.fileName !== "" ? (
                                            <div class="alert alert-danger" role="alert">
                                                {this.state.fileName}
                                            </div>
                                        ) : (
                                            <Dropzone
                                                getUploadParams={this.getUploadParams}
                                                onChangeStatus={this.handleChangeStatus}
                                                PreviewComponent={this.Preview}
                                                //onSubmit={this.handleSubmit}
                                                accept=".xlsx"
                                                initialFiles={this.state.initialFiles}
                                                maxFiles={1}
                                                maxSizeBytes={2000000}
                                                inputContent={(files, extra) =>
                                                    extra.reject ? (
                                                        "Image, audio and video files only"
                                                    ) : (
                                                        <div className="text-center">
                                                            <i className="text-primary fa fa-cloud-upload"></i>
                                                            <span className="d-block">
                                                                Drag and Drop or{" "}
                                                                <span className="text-primary">
                                                                    Browse
                                                                        </span>
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
                                            />
                                        )}
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
                                                <div className={"cross-icon"}>
                                                    <img
                                                        src={require("../../../assests/images/times.png")}
                                                        alt="cancel-icon.jpg"
                                                    />
                                                </div>
                                                    CANCEL
                                            </button>
                                            <button type="submit" className="btn-primary save-btn">
                                                <div className={"check-icon"}>
                                                    <img src={require("../../../assests/images/check.png")} alt="" />
                                                </div>
                                                {"SAVE"}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
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

}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        bulkUploadCosting
    })(reduxForm({
        form: 'CostingBulkUploadDrawer',
        enableReinitialize: true,
    })(CostingBulkUploadDrawer));

// export default CostingBulkUploadDrawer;