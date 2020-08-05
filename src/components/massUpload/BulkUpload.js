import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, maxLength25, minLength3 } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import { bulkUploadRMDomestic, bulkfileUploadRM, bulkUploadRMImport, } from '../../actions/master/Material';
import { fuelBulkUpload } from '../../actions/master/Fuel';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { loggedInUserId } from "../../helper/auth";
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import Downloadxls from './Downloadxls';
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class BulkUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: [],
            rows: [],
            fileData: [],

            faildRecords: false,
            failedData: [],
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {

    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.props.closeDrawer('')
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            unitTypes: [],
        })
        this.toggleDrawer('')
    }

    /**
     * @method fileChangedHandler
     * @description called for profile pic change
     */
    fileHandler = event => {
        const { fileName } = this.props;
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType != '.xls' || uploadfileName != `${fileName}.xls`) {
            if (uploadfileName != `${fileName}.xls`) {
                toastr.warning(`File name should be ${fileName}.xls`)
            }
            if (fileType != '.xls') {
                toastr.warning('File type should be .xls')
            }
        } else {

            let data = new FormData()
            data.append('file', fileObj)
            this.props.bulkfileUploadRM(data, res => { }); //temp for file upload in folder on server

            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {
                    console.log(err);
                } else {

                    fileHeads = resp.rows[0];
                    // fileHeads = ["SerialNumber", "BillNumber", "AssemblyBOMPartNumber", "PartNumber", "MaterialDescription",
                    //     "MaterialTypeName", "UnitOfMeasurementName", "Quantity", "AssemblyPartNumberMark", "BOMLevel", "EcoNumber",
                    //     "RevisionNumber"]

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            let obj = {
                                // PlantId: uploadBOMplantID.value,
                                // CreatedBy: loggedInUserId(),
                            }
                            val.map((el, i) => {
                                obj[fileHeads[i]] = el
                            })
                            fileData.push(obj)
                            obj = {}
                        }
                    })
                    console.log("customData", fileData)
                    this.setState({
                        cols: resp.cols,
                        rows: resp.rows,
                        fileData: fileData
                    });
                }
            });
        }
    }

    responseHandler = (res) => {
        const { messageLabel } = this.props;
        if (res.data.Result == false) {
            let Data = res.data.Data;
            toastr.warning(res.data.Message);
            if (Data.CountSucceeded > 0) {
                toastr.success(`${messageLabel} ${Data.CountSucceeded} has been uploaded successfully.`)
            }
            if (Data.FaildRecords.length > 0) {
                this.setState({
                    faildRecords: true,
                    failedData: Data.FaildRecords,
                })
            }
        } else {
            let Data = res.data.Data;
            if (Data.CountSucceeded > 0) {
                toastr.success(`${messageLabel} ${Data.CountSucceeded} has been uploaded successfully.`)
            }
        }
        this.toggleDrawer('')
    }


    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData } = this.state;
        const { fileName } = this.props;
        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
        }

        if (fileName == 'RMDomestic') {

            this.props.bulkUploadRMDomestic(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'RMImport') {

            this.props.bulkUploadRMImport(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'Fuel') {

            this.props.fuelBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else {

        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, fileName, messageLabel } = this.props;
        const { faildRecords, failedData } = this.state;

        if (faildRecords) {
            return <Downloadxls isFailedFlag={true} fileName={fileName} failedData={failedData} />
        }

        return (
            <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                <Container>
                    <div className={'drawer-wrapper'}>
                        <form
                            noValidate
                            className="form"
                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{isEditFlag ? '' : `${messageLabel} BULK UPLOAD`}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>

                                <div className="input-group mt25 col-md-12 input-withouticon" >
                                    <Downloadxls fileName={fileName} isFailedFlag={false} />
                                </div>

                                <div className="input-group mt25 col-md-12 input-withouticon" >
                                    <label>Choose upload file</label>
                                    <input
                                        type="file"
                                        name="File"
                                        onChange={this.fileHandler}
                                        //accept="xls/*"
                                        className="" />
                                </div>

                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-center">
                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn" >
                                        {isEditFlag ? 'Update' : 'Save'}
                                    </button>

                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                        {'Cancel'}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {

    return {};
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    bulkUploadRMDomestic,
    bulkfileUploadRM,
    bulkUploadRMImport,
    fuelBulkUpload,
})(reduxForm({
    form: 'BulkUpload',
    enableReinitialize: true,
})(BulkUpload));
