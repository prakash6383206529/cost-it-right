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
import { checkForSameFileUpload, loggedInUserId } from '../../helper';
import ExcelFile from 'react-export-excel/dist/ExcelPlugin/components/ExcelFile';
import { Volume, VolumeTempData } from '../../config/masterData';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import WarningMessage from '../common/WarningMessage';
import { ExcelRenderer } from 'react-excel-renderer';

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
            attachmentLoader: false,
            showPopup: false,
            bomUploadLoader: false,
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

    toggleDrawer = (event, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', type)
    };

    cancel = (type) => {
        this.toggleDrawer('', 'cancel')
    }
    cancelHandler = () => {
        this.cancel('cancel')
        // this.setState({ showPopup: true })
    }
    onPopupConfirm = () => {
        this.cancel('cancel')
        this.setState({ showPopup: false })
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
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
    returnExcelColumn = (data = []) => {
        const fileName = "Volume"
        return (<ExcelSheet data={VolumeTempData} name={fileName}>
            {Volume && Volume.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }
    fileHandler = event => {
        this.setState({ bomUploadLoader: true })
        let fileObj = event.target.files[0];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));
        let fileHeads = [];
        let checkForFileHead
        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            Toaster.warning('File type should be .xls or .xlsx')
            this.setState({ bomUploadLoader: false })
        } else {
            let data = new FormData()
            data.append('file', fileObj)

            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {

                }
                else {
                    fileHeads = resp.rows[0];
                    const { fileName } = this.props;
                    switch (String(fileName)) {
                        case 'Volume':
                            checkForFileHead = checkForSameFileUpload(Volume, fileHeads)
                            break;
                        default:
                            break;
                    }
                }
                this.setState({ bomUploadLoader: false })
                if (!checkForFileHead) {
                    Toaster.warning('Please select file of same Master')
                    return false
                }
                this.setState({
                    cols: resp.cols,
                    rows: resp.rows,
                    uploadfileName: uploadfileName,
                });
            });
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
            this.toggleDrawer('', 'save')
        }
    }
    onBtExport = () => {
        return this.returnExcelColumn(VolumeTempData)
    };
    render() {
        const { handleSubmit } = this.props
        return (
            <>
                <form
                    noValidate
                    className="form bulkupload-drawer"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <Col md="12" className='px-3'>
                        <div>
                            <ExcelFile filename={'Volume'} fileExtension={'.xls'} element={
                                <button type="button" className={'btn btn-primary pull-right w-100 mb-3'}><div className="download mr-1" ></div>
                                    {"Download Volume"}
                                </button>}>
                                {this.onBtExport()}
                            </ExcelFile>
                        </div>
                        {this.state.fileName !== "" ? (
                            <div class="alert alert-danger" role="alert">
                                {this.state.fileName}
                            </div>
                        ) : (
                            <Dropzone
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                onChange={this.fileHandler}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
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
                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <WarningMessage dClass="ml-5 mb-2" message={'In order to upload, Part must have an approved costing version'} />
                        <div className="col-md-12 pl-3 pr-3">
                            <div className="text-right ">
                                <button
                                    onClick={this.cancelHandler}
                                    type="button"
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
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }
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