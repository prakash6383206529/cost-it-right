import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import CostSummary from './costsummary';
import CostWorking from './costworking';
import { getCostingBySupplier } from '../../actions/costing/CostWorking';
import { fetchPlantDataAPI } from '../../actions/master/Comman';
import { uploadBOMxlsAPI } from '../../actions/master/BillOfMaterial';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import { searchableSelect } from '../../components/layout/FormInputs'
import DownloadBOMxls from './DownloadBOMxls';


class Costing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: '1',
            supplierId: '',
            plantId: '',
            partId: '',
            isShowFileUpload: false,
            cols: [],
            rows: [],
            fileData: [],
            uploadBOMplantID: [],
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        this.props.fetchPlantDataAPI(() => { })
    }

    /**
   * @method toggle
   * @description toggling the tabs
   */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    supplierCosting = (reqData) => {
        this.setState({
            activeTab: '2',
            supplierId: reqData.supplierId,
            plantId: reqData.plantId,
            partId: reqData.partId,
        }, () =>
            this.props.getCostingBySupplier(this.state.supplierId, (res) => { console.log('res', res) })
        );

    }

    /**
     * @method toggleUpload
     * @description toggling the file upload tabs
     */
    toggleUpload = () => {
        this.setState({
            isShowFileUpload: !this.state.isShowFileUpload
        })
    }

    /**
     * @method fileChangedHandler
     * @description called for profile pic change
     */
    fileHandler = event => {
        const { uploadBOMplantID } = this.state;
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let fileName = fileObj.name;
        let fileType = fileName.substr(fileName.indexOf('.'));

        //pass the fileObj as parameter
        if (fileType != '.xls' || fileName != 'BOM.xls') {
            if (fileName != 'BOM.xls') {
                toastr.warning('File name should be BOM.xls')
            }
            if (fileType != '.xls') {
                toastr.warning('File type should be .xls')
            }
        } else {
            ExcelRenderer(fileObj, (err, resp) => {
                if (err) {
                    console.log(err);
                } else {

                    //fileHeads = resp.rows[0];
                    fileHeads = ["SerialNumber", "BillNumber", "AssemblyBOMPartNumber", "PartNumber", "MaterialDescription",
                        "MaterialTypeName", "UnitOfMeasurementName", "Quantity", "AssemblyPartNumberMark", "BOMLevel", "EcoNumber",
                        "RevisionNumber"]

                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            let obj = { PlantId: uploadBOMplantID.value }
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

    UploadBOMHandler = () => {
        const { fileData } = this.state;
        this.props.uploadBOMxlsAPI(fileData, () => {
            toastr.success('BOM has been uploaded successfully.')
        });
    }

    /**
    * @method BOMplantHandler
    * @description Used to handle plant
    */
    BOMplantHandler = (newValue, actionMeta) => {
        this.setState({ uploadBOMplantID: newValue });
    };

    /**
    * @method renderTypeOfListing
    * @description Used to show type of listing
    */
    renderTypeOfListing = (label) => {
        const { plantList } = this.props;
        const temp = [];

        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    fileUploadSection = () => {
        const { isShowFileUpload, rows, uploadBOMplantID } = this.state;
        return (
            <div>
                <Row>
                    <Col>
                        <button onClick={this.toggleUpload} className={'btn btn-primary pull-right'}>{!isShowFileUpload ? 'Show Upload Panel' : 'Hide Upload Panel'}</button>
                    </Col>
                </Row>
                {isShowFileUpload && <Row>
                    <hr />
                    <Col md="4" className={'mt20'}>
                        <Field
                            id="PlantId"
                            name="PlantId"
                            type="text"
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            label="Plant"
                            component={searchableSelect}
                            //validate={[required, maxLength50]}
                            options={this.renderTypeOfListing('plant')}
                            //options={options}
                            required={true}
                            handleChangeDescription={this.BOMplantHandler}
                            valueDescription={this.state.uploadBOMplantID}
                        />
                    </Col>
                    <Col md="3" className={'mt20'}>
                        <label>Choose BOM upload file</label>
                        <input
                            type="file"
                            name="bomFile"
                            onChange={this.fileHandler}
                            //accept="xls/*"
                            className="" />
                    </Col>
                    <Col md="2" className={'mt40'}>
                        <button
                            onClick={this.UploadBOMHandler}
                            disabled={uploadBOMplantID && uploadBOMplantID.hasOwnProperty('value') ? false : true}
                            className={'btn btn-primary pull-right'}>Save</button>
                    </Col>
                    <Col md="3" className={'mt40'}>
                        <DownloadBOMxls />
                        {/* <button
                            onClick={this.downloadBOM}
                            className={'btn btn-primary pull-right'}>Download BOM Format</button> */}
                    </Col>
                    <hr />
                </Row>}
            </div>
        )
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, supplierId, plantId, partId, isShowFileUpload } = this.state;
        return (
            <Container>
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3 className={'mt20'}>{`${CONSTANT.COSTING} Summary`}</h3>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                Cost Summary
                                </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                Cost Working
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            {this.fileUploadSection()}
                            <Col>
                                <CostSummary
                                    supplierCosting={this.supplierCosting} />
                            </Col>
                        </TabPane>
                        <TabPane tabId="2">
                            <CostWorking
                                supplierId={supplierId}
                                plantId={plantId}
                                toggle={this.toggle}
                                partId={partId} />
                        </TabPane>
                    </TabContent>

                </Row>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman }) {
    const { plantList } = comman;
    return { plantList }
}


export default connect(
    mapStateToProps, {
    getCostingBySupplier,
    fetchPlantDataAPI,
    uploadBOMxlsAPI,
}
)(reduxForm({
    form: 'CostingForm',
    enableReinitialize: true,
})(Costing));

