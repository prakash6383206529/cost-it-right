import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactExport from 'react-export-excel';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
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
import cloudImg from '../../assests/images/uploadcloud.png';
import { validateForm } from '../layout/FormInputs';

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
                this.setState({ fileData: fileObj, uploadfileName: uploadfileName })

            });
        }
    }
    responseHandler = (res) => {
        if (res?.data) {
            if (res?.data?.Result === true) {
                Toaster.success(res?.data?.Message)
            }
            if (res?.data?.Result === false) {
                Toaster.error(res?.data?.Message);
            }
        }
        this.toggleDrawer('', false)
    }

    onSubmit = () => {
        const { fileData } = this.state;
        if (!fileData) {
            Toaster.warning('Please select a file to upload.');
            return false;
        }
        const data = new FormData();
        data.append('file', fileData)
        data.append('loggedInUserId', loggedInUserId());

        if (this.props.fileName === 'Volume') {
            this.props.bulkUploadVolume(data, (res) => {

                let Data = res && res.data && res.data[0];
                const { files } = this.state;
                files.push(Data);
                this.responseHandler(res);
            });
            this.toggleDrawer('', 'save');
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
                            <div className="input-group mt25 col-md-12 input-withouticon " >
                                <div className="file-uploadsection">
                                    {this.state.bulkUploadLoader && <LoaderCustom customClass="attachment-loader" />}
                                    <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={cloudImg} ></img> </label>
                                    <input
                                        ref={this.fileUploadRef}
                                        type="file"
                                        name="File"
                                        onChange={this.fileHandler}
                                        onClick={(event) => { event.target.value = [] }}
                                        //accept="xls/*"
                                        className="" placeholder="bbb" />
                                    <p> {this.state.uploadfileName}</p>
                                </div>
                            </div>
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
        validate: validateForm,
        form: 'VolumeBulkUploadDrawer',
        enableReinitialize: true,
        touchOnChange: true
    })(VolumeBulkUploadDrawer));