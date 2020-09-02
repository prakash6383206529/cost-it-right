import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { required, maxLength25, minLength3, getJsDateFromExcel } from "../../helper/validation";
import { renderText, searchableSelect } from "../layout/FormInputs";
import {
    bulkUploadRMDomesticZBC, bulkUploadRMDomesticVBC, bulkUploadRMImportZBC, bulkUploadRMImportVBC,
    bulkfileUploadRM, bulkUploadRMSpecification,
} from '../../actions/master/Material';
import { fuelBulkUpload } from '../../actions/master/Fuel';
import { vendorBulkUpload } from '../../actions/master/Supplier';
import { overheadBulkUpload, profitBulkUpload } from '../../actions/master/OverheadProfit';
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
            costingHead: 'ZBC',
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
    * @method onPressHeads
    * @description Used for Costing head check
    */
    onPressHeads = (costingHeadFlag) => {
        this.setState({ costingHead: costingHeadFlag, });
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
        if (fileType != '.xls' && fileType != '.xlsx') {
            toastr.warning('File type should be .xls or .xlsx')
        } else {

            let data = new FormData()
            data.append('file', fileObj)
            if (fileName == 'RMDomestic') {
                this.props.bulkfileUploadRM(data, res => { }); //temp for file upload in folder on server
            }
            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {
                    console.log(err);
                } else {

                    fileHeads = resp.rows[0];
                    // fileHeads = ["SerialNumber", "BillNumber"]

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            let obj = {
                                // PlantId: uploadBOMplantID.value,
                                // CreatedBy: loggedInUserId(),
                            }
                            val.map((el, i) => {
                                if (fileHeads[i] == 'EffectiveDate' && typeof el == 'number') {
                                    el = getJsDateFromExcel(el)
                                }
                                obj[fileHeads[i]] = el;
                            })
                            fileData.push(obj)
                            obj = {}
                        }
                    })
                    //console.log("customData", fileData)
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
        const { messageLabel, fileName } = this.props;
        if (res.data.Data) {
            let Data = res.data.Data;
            let DynamicData = res.data.DynamicData;

            if (Data.CountSucceeded > 0) {
                toastr.success(`${messageLabel} ${Data.CountSucceeded} has been uploaded successfully.`)
                if (DynamicData && DynamicData.IsDensityAvailable == false) {
                    this.props.densityAlert()
                }
            }

            if (Data.CountFailed > 0) {
                toastr.warning(res.data.Message);
                this.setState({
                    failedData: Data.FaildRecords,
                    faildRecords: true,
                })
            }

        }
        //this.toggleDrawer('')
    }


    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData, costingHead } = this.state;
        const { fileName } = this.props;
        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
        }

        if (fileName == 'RMDomestic' && costingHead == 'ZBC') {

            this.props.bulkUploadRMDomesticZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'RMDomestic' && costingHead == 'VBC') {

            this.props.bulkUploadRMDomesticVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'RMImport' && costingHead == 'ZBC') {

            this.props.bulkUploadRMImportZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'RMImport' && costingHead == 'VBC') {

            this.props.bulkUploadRMImportVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'RMSpecification') {

            this.props.bulkUploadRMSpecification(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'Vendor') {

            this.props.vendorBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'Fuel') {

            this.props.fuelBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'Overhead') {

            this.props.overheadBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName == 'Profit') {

            this.props.profitBulkUpload(uploadData, (res) => {
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
        const { handleSubmit, isEditFlag, reset, fileName, messageLabel, isZBCVBCTemplate = '' } = this.props;
        const { faildRecords, failedData, costingHead } = this.state;

        if (faildRecords) {
            return <Downloadxls
                isFailedFlag={true}
                fileName={fileName}
                failedData={failedData}
                costingHead={costingHead}
            />
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
                                        <h3>{isEditFlag ? '' : `${messageLabel} `}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                {isZBCVBCTemplate &&
                                    <Col md="12">
                                        <Label sm={2} className={'pl0 pr0'} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                checked={costingHead == 'ZBC' ? true : false}
                                                onClick={() => this.onPressHeads('ZBC')}
                                            />{' '}
                                        ZBC
                                    </Label>
                                        <Label sm={2} className={'pl0 pr0'} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                checked={costingHead == 'VBC' ? true : false}
                                                onClick={() => this.onPressHeads('VBC')}
                                            />{' '}
                                        VBC
                                    </Label>
                                    </Col>}

                                <div className="input-group mt25 col-md-12 input-withouticon" >
                                    <Downloadxls
                                        isZBCVBCTemplate={isZBCVBCTemplate}
                                        fileName={fileName}
                                        isFailedFlag={false}
                                        costingHead={costingHead}
                                    />
                                </div>

                                <div className="input-group mt25 col-md-12 input-withouticon " >
                                   <div className="file-uploadsection">
                                    <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload</label>
                                    <input
                                        type="file"
                                        name="File"
                                        onChange={this.fileHandler}
                                        //accept="xls/*"
                                        className="" placeholder="bbb" /></div>
                                </div>

                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12  bluefooter-butn1 text-right">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                        <div className={'cross-icon'}><img src={require('../../assests/images/times.png')}></img></div> {'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn" >
                                        <div className={'check-icon'}><img src={require('../../assests/images/check.png')}></img>
                                        </div> {isEditFlag ? 'Update' : 'Save'}
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
    bulkfileUploadRM,
    bulkUploadRMSpecification,
    fuelBulkUpload,
    vendorBulkUpload,
    bulkUploadRMDomesticZBC,
    bulkUploadRMDomesticVBC,
    bulkUploadRMImportZBC,
    bulkUploadRMImportVBC,
    overheadBulkUpload,
    profitBulkUpload,
})(reduxForm({
    form: 'BulkUpload',
    enableReinitialize: true,
})(BulkUpload));
