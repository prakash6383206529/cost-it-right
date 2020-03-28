import React, { Component } from "react";
import { Row, Container, Col, CardTitle } from 'reactstrap';
import { Field, reduxForm } from "redux-form";
import { searchableSelect, focusOnError } from "../layout/FormInputs";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { maxLength70, minLength5, maxLength25, required, email } from "../../helper/validation";
import { MESSAGES } from "../../config/message";
import { Loader } from "../common/Loader";
import { reactLocalStorage } from "reactjs-localstorage";
import DownloadMasterxls from './DownloadMasterxls';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import {
    supplierMassUpload, plantMassUpload, BOPMassUpload, ProcessesMassUpload,
    MachineClassMassUpload, LabourMassUpload, OperationMassUpload, OtherOperationMassUpload,
    PowerMassUpload, OverheadAndProfitMassUpload, MHRMassUpload,
} from '../../actions/MassUpload';
import { getAllTechnologyAPI } from '../../actions/auth/AuthActions';
import { Masters } from '../../config/masterData';
import { loggedInUserId } from '../../helper/auth';

class MassUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            fileData: [],
            selectedMaster: [],
            selectedTechnology: [],
        };
    }

    componentDidMount() {
        this.props.getAllTechnologyAPI(() => { })
    }

    /**
    * @method masterHandler
    * @description Used to handle master
    */
    masterHandler = (newValue, actionMeta) => {
        this.setState({ selectedMaster: newValue });
    };

    /**
    * @method technologyHandler
    * @description Used to handle technology
    */
    technologyHandler = (newValue, actionMeta) => {
        this.setState({ selectedTechnology: newValue });
    };

    /**
    * @method renderListing
    * @description Used show listing
    */
    renderListing = (label) => {
        const { technologyList } = this.props;
        const temp = [];
        if (label == 'technology') {
            temp.push({ label: '---Select Technology---', value: 0 })
            technologyList && technologyList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    /**
     * @method fileChangedHandler
     * @description Used for file upload
     */
    fileHandler = event => {
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let fileName = fileObj.name;
        let fileType = fileName.substr(fileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType != '.xls') {
            // if (fileName != 'BOM.xls') {
            //     toastr.warning('File name should be BOM.xls')
            // }
            toastr.warning('File type should be .xls')
        } else {
            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {
                    console.log(err);
                } else {

                    fileHeads = resp.rows[0];
                    // fileHeads = ["SerialNumber", "BillNumber", "AssemblyBOMPartNumber", "PartNumber", "MaterialDescription",
                    //     "MaterialTypeName", "UnitOfMeasurementName", "Quantity", "AssemblyPartNumberMark", "BOMLevel", "EcoNumber",
                    //     "RevisionNumber"];

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            let obj = { CreatedBy: loggedInUserId() }
                            //let obj = {}
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
     * @method UploadMassHandler
     * @description Used for mass upload
     */
    UploadMassHandler = () => {
        const { fileData, selectedMaster, selectedTechnology } = this.state;

        if (selectedTechnology && selectedTechnology.value == 0) {
            return false;
        } else {
            //fileData.TechnologyName = selectedTechnology.label;
            fileData && fileData.map(el => {
                el.TechnologyName = selectedTechnology.label;
            })
        }

        if (selectedMaster.label == 'Supplier') {
            this.props.supplierMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'Plant') {
            this.props.plantMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'BOP') {
            this.props.BOPMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'Processes') {
            this.props.ProcessesMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'MachineClass') {
            this.props.MachineClassMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'Labour') {
            this.props.LabourMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'Operation') {
            this.props.OperationMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'OtherOperation') {
            this.props.OtherOperationMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'Power') {
            this.props.PowerMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'OverheadAndProfit') {
            this.props.OverheadAndProfitMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

        if (selectedMaster.label == 'MHR') {
            this.props.MHRMassUpload(fileData, () => {
                toastr.success(`${selectedMaster.label} has been uploaded successfully.`)
            });
        }

    }

    /**
    * Submit the login form
    * @param values
    */
    onSubmit(values) {

    }

    render() {
        const { handleSubmit, reset, pristine, submitting } = this.props;
        const { isLoader, isSubmitted, selectedMaster } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <Container className="dashboard-top">
                    <div className="login-form">
                        <div className="form-heading">
                            <h2>Mass Upload</h2>
                        </div>
                        <form
                            noValidate
                            className="form"
                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                        >
                            <Row>
                                <hr />
                                <Col md="3" className={'mt20'}>
                                    <label>Upload Attachement</label>
                                    <input
                                        type="file"
                                        name="FileName"
                                        onChange={this.fileHandler}
                                        accept="xls/*"
                                        className="" />
                                </Col>
                                <Col md="3" className={'mt20'}>
                                    <Field
                                        id="technology"
                                        name="technology"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        label="Technology"
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={this.renderListing('technology')}
                                        required={true}
                                        handleChangeDescription={this.technologyHandler}
                                        valueDescription={this.state.selectedTechnology}
                                    />
                                </Col>
                                <Col md="3" className={'mt20'}>
                                    <Field
                                        id="master"
                                        name="master"
                                        type="text"
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        label="Select Master"
                                        component={searchableSelect}
                                        //validate={[required, maxLength50]}
                                        options={Masters}
                                        required={true}
                                        handleChangeDescription={this.masterHandler}
                                        valueDescription={this.state.selectedMaster}
                                    />
                                </Col>
                                <Col md="3" className={'mt40'}>
                                    <DownloadMasterxls selectedMaster={selectedMaster} />
                                </Col>
                                <hr />
                            </Row>
                            <Row>
                                <Col md="2" className={''}>
                                    <button
                                        onClick={this.UploadMassHandler}
                                        disabled={selectedMaster && selectedMaster.hasOwnProperty('value') ? false : true}
                                        className={'btn btn-primary pull-right'}>Save</button>
                                </Col>
                                <Col md="2">
                                    <button
                                        onClick={reset}
                                        disabled={pristine || submitting}
                                        className={'btn btn-secondary'}>Cancel</button>
                                </Col>
                            </Row>
                        </form>
                    </div>
                </Container>
            </div>
        );
    }
}

/**
* Form validations
* @param values
* @returns {{}}
*/
const validate = values => {
    let errors = {};

    return errors;
};

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { technologyList, loading } = auth;;
    return { technologyList, loading }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getAllTechnologyAPI,
    supplierMassUpload,
    plantMassUpload,
    BOPMassUpload,
    ProcessesMassUpload,
    MachineClassMassUpload,
    LabourMassUpload,
    OperationMassUpload,
    OtherOperationMassUpload,
    PowerMassUpload,
    OverheadAndProfitMassUpload,
    MHRMassUpload,
})(reduxForm({
    form: 'MassUpload',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(MassUpload));