import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, maxLength25, minLength3 } from "../../../../../helper/validation";
import { renderText, searchableSelect } from "../../../../layout/FormInputs";
import { bulkUploadRMDomestic, bulkfileUploadRM } from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { loggedInUserId } from "../../../../../helper/auth";
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import Drawer from '@material-ui/core/Drawer';
import DownloadRMDomesticxls from './DownloadRMDomesticxls';

class DomesticBulkUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cols: [],
            rows: [],
            fileData: [],
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

        let fileObj = event.target.files[0];
        let fileHeads = [];
        let fileName = fileObj.name;
        let fileType = fileName.substr(fileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType != '.xls' || fileName != 'RMDomestic.xls') {
            if (fileName != 'RMDomestic.xls') {
                toastr.warning('File name should be RMDomestic.xls')
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

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { fileData } = this.state;
        let uploadData = {
            Records: fileData,
            LoggedInUserId: loggedInUserId(),
        }
        this.props.bulkUploadRMDomestic(uploadData, (res) => {
            console.log('res upload >>', res)
            toastr.success('RM Domestic has been uploaded successfully.')
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
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
                                        <h3>{isEditFlag ? '' : 'BULK UPLOAD'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>

                                <div className="input-group mt25 col-md-12 input-withouticon" >
                                    <DownloadRMDomesticxls />
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
                                <div className="col-sm-12 text-right">
                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn" >
                                       <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' />
                          </div> {isEditFlag ? 'Update' : 'Save'}
                                    </button>

                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                       <div className={'cross-icon'}><img src={require('../../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
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
})(reduxForm({
    form: 'DomesticBulkUpload',
    enableReinitialize: true,
})(DomesticBulkUpload));
