import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { checkForNull, getJsDateFromExcel } from "../../helper/validation";
import {
    bulkUploadRMDomesticZBC, bulkUploadRMDomesticVBC, bulkUploadRMImportZBC, bulkUploadRMImportVBC,
    bulkfileUploadRM, bulkUploadRMSpecification,
} from '../masters/actions/Material';
import { bulkUploadMachineZBC, bulkUploadMachineVBC, bulkUploadMachineMoreZBC } from '../masters/actions/MachineMaster';
import { fuelBulkUpload } from '../masters/actions/Fuel';
import { labourBulkUpload } from '../masters/actions/Labour';
import { vendorBulkUpload } from '../masters/actions/Supplier';
import { overheadBulkUpload, profitBulkUpload } from '../masters/actions/OverheadProfit';
import { operationZBCBulkUpload, operationVBCBulkUpload } from '../masters/actions/OtherOperation';
import { partComponentBulkUpload } from '../masters/actions/Part';
import { bulkUploadBOPDomesticZBC, bulkUploadBOPDomesticVBC, bulkUploadBOPImportZBC, bulkUploadBOPImportVBC, } from '../masters/actions/BoughtOutParts';
import { bulkUploadVolumeActualZBC, bulkUploadVolumeActualVBC, bulkUploadVolumeBudgetedZBC, bulkUploadVolumeBudgetedVBC, } from '../masters/actions/Volume';
import { bulkUploadInterestRateZBC, bulkUploadInterestRateVBC, } from '../masters/actions/InterestRateMaster';
import { toastr } from 'react-redux-toastr';
import { loggedInUserId } from "../../helper/auth";
import { ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import Downloadxls from './Downloadxls';
import moment from 'moment';

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
            uploadfileName: "",
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

        let fileObj = event.target.files[0];
        let fileHeads = [];
        let uploadfileName = fileObj.name;
        let fileType = uploadfileName.substr(uploadfileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType !== '.xls' && fileType !== '.xlsx') {
            toastr.warning('File type should be .xls or .xlsx')
        } else {

            let data = new FormData()
            data.append('file', fileObj)

            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {

                } else {

                    fileHeads = resp.rows[0];

                    //
                    // fileHeads = ["SerialNumber", "BillNumber"]

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {

                            // BELOW CODE FOR HANDLE EMPTY CELL VALUE
                            const i = val.findIndex(e => e === undefined);
                            if (i !== -1) {
                                val[i] = '';
                            }

                            let obj = {}
                            val.map((el, i) => {
                                if (fileHeads[i] === 'EffectiveDate' && typeof el === 'string') {
                                    el = moment(Date(el)).format('YYYY-MM-DD HH:mm:ss')
                                }
                                if (fileHeads[i] === 'EffectiveDate' && typeof el === 'number') {
                                    el = getJsDateFromExcel(el)
                                }
                                if (fileHeads[i] === 'NoOfPcs' && typeof el == 'number') {
                                    el = parseInt(checkForNull(el))
                                }
                                if (fileHeads[i] === 'MachineSpecification') {
                                    fileHeads[i] = 'Description'
                                }
                                obj[fileHeads[i]] = el;
                                return null;
                            })
                            fileData.push(obj)
                            obj = {}

                        }
                        return null;
                    })
                    this.setState({
                        cols: resp.cols,
                        rows: resp.rows,
                        fileData: fileData,
                        uploadfileName: uploadfileName,
                    });
                }
            });
        }
    }

    responseHandler = (res) => {
        const { messageLabel, } = this.props;
        if (res.data.Data) {
            let Data = res.data.Data;
            let DynamicData = res.data.DynamicData;

            if (Data.CountSucceeded > 0) {
                toastr.success(`${Data.CountSucceeded} ${messageLabel}  has been uploaded successfully.`)
                if (DynamicData && DynamicData.IsDensityAvailable === false) {
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
        this.toggleDrawer('')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData, costingHead } = this.state;
        const { fileName } = this.props;
        if (fileData.length === 0) {
            toastr.warning('Please select a file to upload.')
            return false
        }
        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
        }

        if (fileName === 'RMDomestic' && costingHead === 'ZBC') {

            this.props.bulkUploadRMDomesticZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'RMDomestic' && costingHead === 'VBC') {

            this.props.bulkUploadRMDomesticVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'RMImport' && costingHead === 'ZBC') {

            this.props.bulkUploadRMImportZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'RMImport' && costingHead === 'VBC') {

            this.props.bulkUploadRMImportVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'RMSpecification') {

            this.props.bulkUploadRMSpecification(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Vendor') {

            this.props.vendorBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation' && costingHead === 'ZBC') {

            this.props.operationZBCBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Operation' && costingHead === 'VBC') {

            this.props.operationVBCBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Fuel') {

            this.props.fuelBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Overhead') {

            this.props.overheadBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Profit') {

            this.props.profitBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Labour') {

            this.props.labourBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });
        } else if (fileName === 'Machine' && costingHead === 'ZBC') {

            this.props.bulkUploadMachineZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Machine' && costingHead === 'VBC') {

            this.props.bulkUploadMachineVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'Machine' && costingHead === 'ZBC_MACHINE_MORE') {

            this.props.bulkUploadMachineMoreZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'PartComponent') {

            this.props.partComponentBulkUpload(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BOPDomestic' && costingHead === 'ZBC') {

            this.props.bulkUploadBOPDomesticZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BOPDomestic' && costingHead === 'VBC') {

            this.props.bulkUploadBOPDomesticVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BOPImport' && costingHead === 'ZBC') {

            this.props.bulkUploadBOPImportZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BOPImport' && costingHead === 'VBC') {

            this.props.bulkUploadBOPImportVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'ActualVolume' && costingHead === 'ZBC') {

            this.props.bulkUploadVolumeActualZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'ActualVolume' && costingHead === 'VBC') {

            this.props.bulkUploadVolumeActualVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BudgetedVolume' && costingHead === 'ZBC') {

            this.props.bulkUploadVolumeBudgetedZBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'BudgetedVolume' && costingHead === 'VBC') {

            this.props.bulkUploadVolumeBudgetedVBC(uploadData, (res) => {
                this.responseHandler(res)
            });

        } else if (fileName === 'InterestRate' && costingHead === 'VBC') {

            this.props.bulkUploadInterestRateVBC(uploadData, (res) => {
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
        const { handleSubmit, isEditFlag, fileName, messageLabel, isZBCVBCTemplate = '', isMachineMoreTemplate } = this.props;
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
            <Drawer anchor={this.props.anchor} open={this.props.isOpen}
            // onClose={(e) => this.toggleDrawer(e)}
            >
                <Container>
                    <div className={'drawer-wrapper WIDTH-400'}>
                        <form
                            noValidate
                            className="form"
                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{isEditFlag ? '' : `${messageLabel} Bulk Upload `}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="pl-3">
                                {isZBCVBCTemplate &&
                                    <Col md="12">
                                        {fileName != 'InterestRate' &&
                                            <Label sm={4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingHead === 'ZBC' ? true : false}
                                                    onClick={() => this.onPressHeads('ZBC')}
                                                />{' '}
                                                <span>Zero Based</span>
                                            </Label>
                                        }
                                        <Label sm={4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                            <input
                                                type="radio"
                                                name="costingHead"
                                                checked={costingHead === 'VBC' ? true : fileName === 'InterestRate' ? true : false}
                                                onClick={() => this.onPressHeads('VBC')}
                                            />{' '}
                                            <span>Vendor Based</span>
                                        </Label>
                                        {isMachineMoreTemplate &&
                                            <Label sm={4} className={'pl0 pr0 radio-box mb-0 pb-0'} check>
                                                <input
                                                    type="radio"
                                                    name="costingHead"
                                                    checked={costingHead === 'ZBC_MACHINE_MORE' ? true : false}
                                                    onClick={() => this.onPressHeads('ZBC_MACHINE_MORE')}
                                                />{' '}
                                                <span>ZBC More Details</span>
                                            </Label>}
                                    </Col>}

                                <div className="input-group mt25 col-md-12 input-withouticon download-btn" >
                                    <Downloadxls
                                        isZBCVBCTemplate={isZBCVBCTemplate}
                                        isMachineMoreTemplate={isMachineMoreTemplate}
                                        fileName={fileName}
                                        isFailedFlag={false}
                                        costingHead={costingHead}
                                    />
                                </div>

                                <div className="input-group mt25 col-md-12 input-withouticon " >
                                    <div className="file-uploadsection">
                                        <label>Drag a file here or<span className="blue-text">Browse</span> for a file to upload <img alt={''} src={require('../../assests/images/uploadcloud.png')} ></img> </label>
                                        <input
                                            type="file"
                                            name="File"
                                            onChange={this.fileHandler}
                                            //accept="xls/*"
                                            className="" placeholder="bbb" />
                                        <p> {this.state.uploadfileName}</p>
                                    </div>
                                </div>

                            </Row>
                            <Row className=" justify-content-between">
                                <div className="col-sm-12  text-right">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                        <div className={'cross-icon'}><img alt={''} src={require('../../assests/images/times.png')}></img></div> {'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-button save-btn" >
                                        <div className={'check-icon'}><img alt={''} src={require('../../assests/images/check.png')}></img>
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
function mapStateToProps() {

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
    operationZBCBulkUpload,
    operationVBCBulkUpload,
    labourBulkUpload,
    bulkUploadMachineZBC,
    bulkUploadMachineVBC,
    bulkUploadMachineMoreZBC,
    partComponentBulkUpload,
    bulkUploadBOPDomesticZBC,
    bulkUploadBOPDomesticVBC,
    bulkUploadBOPImportZBC,
    bulkUploadBOPImportVBC,
    bulkUploadVolumeActualZBC,
    bulkUploadVolumeActualVBC,
    bulkUploadVolumeBudgetedZBC,
    bulkUploadVolumeBudgetedVBC,
    bulkUploadInterestRateZBC,
    bulkUploadInterestRateVBC
})(reduxForm({
    form: 'BulkUpload',
    enableReinitialize: true,
})(BulkUpload));
