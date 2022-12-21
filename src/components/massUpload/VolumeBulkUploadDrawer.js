import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Dropzone from 'react-dropzone-uploader'
import LoaderCustom from '../common/LoaderCustom';
import Toaster from '../common/Toaster';
import { bulkUploadVolume } from '../masters/actions/Volume';
import { loggedInUserId } from '../../helper';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class VolumeBulkUploadDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            fileData: '',
            fileName: '',
            Technology: [],
            attachmentLoader: false
        }
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
            let tempArr = files.filter(
                (item) => item.OriginalFileName !== removedFileName,
            )
            this.setState({ files: tempArr })
        }

        if (status === 'done') {

            this.setState({ fileName: file.name, fileData: file, attachmentLoader: false })

        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xlsx files.')
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

        const fileName = "Volume"

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
        let data = new FormData()
        data.append('file', fileData)
        data.append('loggedInUserId', loggedInUserId())
        if (fileData.length === 0) {
            Toaster.warning('Please select a file to upload.')
            return false
        }
        if (this.props.fileName === 'Volume') {
            this.props.bulkUploadVolume(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state
                files.push(Data)
            })
            this.cancel()
        }
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
                                                {"Volume Bulk Upload"}
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
                                        <label>Upload File</label>
                                        {this.state.fileName !== "" ? (
                                            <div class="alert alert-danger" role="alert">
                                                {this.state.fileName}
                                            </div>
                                        ) : (
                                            <Dropzone
                                                onChangeStatus={this.handleChangeStatus}
                                                PreviewComponent={this.Preview}
                                                onChange={this.fileHandler}
                                                accept=".xlsx"
                                                initialFiles={this.state.initialFiles}
                                                maxFiles={1}
                                                maxSizeBytes={2000000}
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
    return {};
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        bulkUploadVolume
    })(reduxForm({
        form: 'VolumeBulkUploadDrawer',
        enableReinitialize: true,
        touchOnChange: true
    })(VolumeBulkUploadDrawer));