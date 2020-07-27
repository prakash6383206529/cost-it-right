import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, Table, Button } from 'reactstrap';
import {
    getAllRMSpecificationList, getRowMaterialDataAPI, deleteRMSpecificationAPI,
    getRMTypeSelectListAPI, getGradeByRMTypeSelectListAPI,
} from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { searchableSelect } from "../../../../layout/FormInputs";
import { required } from "../../../../../helper/validation";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { MESSAGES } from '../../../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AddSpecification from './AddSpecification';

class SpecificationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ID: '',
            specificationData: [],
            RawMaterial: [],
            RMGrade: [],
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.props.getRMTypeSelectListAPI(() => { });
        this.props.getMaterialTypeSelectList(() => { })
        this.getSpecificationListData('', '');
    }

    /**
    * @method getSpecificationListData
    * @description Get user list data
    */
    getSpecificationListData = (materialId = '', gradeId = '') => {
        let data = {
            PageSize: 0,
            LastIndex: 0,
            MaterialId: materialId,
            GradeId: gradeId
        }
        this.props.getAllRMSpecificationList(data, res => {
            if (res.status == 204 && res.data == '') {
                this.setState({ specificationData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ specificationData: Data, })
            }
        });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getSpecificationListData('', '');
        })
    }

    /**
    * @method renderListing
    * @description Used show listing of row material
    */
    renderListing = (label) => {
        const { gradeByRMTypeSelectList, rawMaterialTypeSelectList } = this.props;
        const temp = [];


        if (label === 'RMGrade') {
            gradeByRMTypeSelectList && gradeByRMTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'material') {
            rawMaterialTypeSelectList && rawMaterialTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method handleGrade
    * @description  used to handle type of listing change
    */
    handleGrade = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RMGrade: newValue });
        } else {
            this.setState({ RMGrade: [], });
        }
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeByRMTypeSelectListAPI(RawMaterial.value, (res) => {

                })
            });
        } else {
            this.setState({ RawMaterial: [] });
        }
    }

    /**
    * @method editItemDetails
    * @description edit RM Specification
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
    }

    /**
    * @method openModel
    * @description  used to open filter form 
    */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete RM Specification
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.SPECIFICATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Specification
    */
    confirmDelete = (ID) => {
        this.props.deleteRMSpecificationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
                this.getSpecificationListData('', '');
            }
        });
    }

    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                Showing {start} of {to} entries.
            </p>
        );
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} />
                <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />
            </>
        )
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        const { table } = this.refs;
        let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
        let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
        let serialNumber = '';
        if (currentPage == 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { RMGrade, RawMaterial } = this.state;
        const filterRM = RawMaterial ? RawMaterial.value : '';
        const filterGrade = RMGrade ? RMGrade.value : '';
        this.getSpecificationListData(filterRM, filterGrade)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            RMGrade: [],
            RawMaterial: [],
        }, () => {
            const { RMGrade, RawMaterial } = this.state;
            const filterRM = RawMaterial ? RawMaterial.value : '';
            const filterGrade = RMGrade ? RMGrade.value : '';
            this.getSpecificationListData(filterRM, filterGrade)
        })
    }

    /**
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit(values) {
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID } = this.state;
        const { handleSubmit } = this.props;

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            paginationSize: 2,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                <Row className="pt-30">
                        <Col md="10" className="filter-block ">
                <div className="d-inline-flex justify-content-start align-items-top w100">
                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                    
                        <Col md="3">
                            <Field
                                name="MaterialTypeId"
                                type="text"
                                // label="Raw Material"
                                component={searchableSelect}
                                placeholder={'Select Raw Material'}
                                options={this.renderListing('material')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleMaterialChange}
                                valueDescription={this.state.RawMaterial}
                            />
                        </Col>
                        <Col md="3">
                            <Field
                                name="GradeId"
                                type="text"
                                // label="RM Grade"
                                component={searchableSelect}
                                placeholder={'Select RM Grade'}
                                options={this.renderListing('RMGrade')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.RMGrade == null || this.state.RMGrade.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleGrade}
                                valueDescription={this.state.RMGrade}
                            />
                        </Col>
                        <Col md="3">
                            <button
                                type="button"
                                //disabled={pristine || submitting}
                                onClick={this.resetFilter}
                                className="reset mr10"
                            >
                                {'Reset'}
                            </button>
                        
                            <button
                                type="button"
                                //disabled={pristine || submitting}
                                onClick={this.filterList}
                                className="apply mr5"
                            >
                                {'Apply'}
                            </button>
                        </Col>
                       
                    </div>
                    </Col> 
                    <Col md={2} className="text-right">
                            <button
                                type={'button'}
                                className={'user-btn'}
                                onClick={this.openModel}>
                                <div className={'plus'}></div>{`ADD SPEC`}</button>
                        </Col>
                    </Row>
                </form>
             
                <Row>
                    <Col>
                        {/* <hr /> */}
                        <BootstrapTable
                            data={this.state.specificationData}
                            striped={true}
                            hover={true}
                            options={options}
                            search
                            // exportCSV
                            ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="" dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMName" dataAlign="center" dataSort={true}>Raw Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="RawMaterial" dataAlign="center" >Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMGrade" dataAlign="center" >Grade</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMSpec" >Specification</TableHeaderColumn>
                            <TableHeaderColumn dataField="SpecificationId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpen && <AddSpecification
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                />}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rmSpecificationDetail, rawMaterialTypeSelectList, gradeByRMTypeSelectList } = material;
    return {
        rmSpecificationDetail, rawMaterialTypeSelectList,
        gradeByRMTypeSelectList
    }
}

export default connect(mapStateToProps, {
    getAllRMSpecificationList,
    getRMTypeSelectListAPI,
    getGradeByRMTypeSelectListAPI,
    deleteRMSpecificationAPI,
    getMaterialTypeSelectList,
})(reduxForm({
    form: 'SpecificationListing',
    enableReinitialize: true,
})(SpecificationListing));