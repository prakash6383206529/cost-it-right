import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import CostSummary from './costsummary';
import CostWorking from './costworking';
import { getCostingBySupplier } from '../../actions/costing/CostWorking';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';


class Costing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            activeTab: '1',
            supplierId: '',
            plantId: '',
            isShowFileUpload: false,
            cols: [],
            rows: [],
            fileData: []
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {

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

    supplierCosting = (supplierId, plantId) => {
        console.log('%c 🦑 supplierId: ', 'font-size:20px;background-color: #B03734;color:#fff;', supplierId);
        this.setState({
            activeTab: '2',
            supplierId: supplierId,
            plantId: plantId
        });
        this.props.getCostingBySupplier(supplierId, (res) => { console.log('res', res) })
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
        let fileObj = event.target.files[0];
        let fileHeads = [];
        let fileName = fileObj.name;
        let fileType = fileName.substr(fileName.indexOf('.'));
        console.log('filename', fileName, fileName.substr(fileName.indexOf('.')))

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

                    fileHeads = resp.rows[0];
                    let fileData = [];
                    resp.rows.map((val, index) => {
                        if (index > 0) {
                            let obj = {}
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

    fileUploadSection = () => {
        const { isShowFileUpload, rows } = this.state;
        return (
            <div>
                <Row>
                    <Col>
                        <button onClick={this.toggleUpload} className={'btn btn-primary pull-right'}>Show Upload Panel</button>
                    </Col>
                </Row>
                {isShowFileUpload && <Row>
                    <Col md="6" className={'mt20'}>
                        <input type="file"
                            name="bomFile"
                            onChange={this.fileHandler}
                            //accept="xls/*"
                            className="" />
                        <button onClick={this.onUploadFile} className={'btn btn-primary pull-right'}>Save</button>
                    </Col>
                    <Col md="6" className={'mt20'}>
                        <button className={'btn btn-primary pull-right'}>BOM Format</button>
                    </Col>
                </Row>}
            </div>
        )
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, supplierId, plantId, isShowFileUpload } = this.state;
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
                                plantId={plantId} />
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
function mapStateToProps({ }) {
    return {}
}


export default connect(
    mapStateToProps, { getCostingBySupplier }
)(Costing);

