import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    getRMSpecificationDataList, deleteRMSpecificationAPI, getRMGradeSelectListByRawMaterial, getGradeSelectList, getRawMaterialNameChild,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
} from '../actions/Material';
import { searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AddSpecification from './AddSpecification';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';

class SpecificationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            isBulkUpload: false,
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
        this.props.getRawMaterialFilterSelectList(() => { })
        this.getSpecificationListData('', '');
    }

    /**
    * @method getSpecificationListData
    * @description Get user list data
    */
    getSpecificationListData = (materialId = '', gradeId = '') => {
        let data = {
            MaterialId: materialId,
            GradeId: gradeId
        }
        this.props.getRMSpecificationDataList(data, res => {
            if (res.status === 204 && res.data === '') {
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
        const { filterRMSelectList } = this.props;
        const temp = [];

        if (label === 'material') {
            filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'grade') {
            filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method handleGrade
    * @description  used to handle type of listing change
    */
    handleGrade = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RMGrade: newValue }, () => {
                const { RMGrade } = this.state;
                this.props.getRawMaterialFilterByGradeSelectList(RMGrade.value, () => { })
            });
        } else {
            this.setState({ RMGrade: [], });
        }
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { })
            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [] });
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
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(`${MESSAGES.SPECIFICATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Specification
    */
    confirmDelete = (ID) => {
        this.props.deleteRMSpecificationAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                //toastr.warning(res.data.Message)
                toastr.warning('The specification is associated in the system. Please remove the association to delete')
            } else if (res && res.data && res.data.Result === true) {
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
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
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
        if (currentPage === 1) {
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
            this.props.getRawMaterialFilterSelectList(() => { })
            this.getSpecificationListData(filterRM, filterGrade)
        })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getSpecificationListData('', '');
        })
    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    densityAlert = () => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDensity()
            },
            onCancel: () => { }
        };
        return toastr.confirm(`Recently Created Material Density is not created, Do you want to create?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    confirmDensity = () => {
        this.props.toggle('4')
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
        const { isOpen, isEditFlag, ID, isBulkUpload, } = this.state;
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility } = this.props;

        const options = {
            clearSearch: true,
            noDataText: (this.props.rmSpecificationList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="MaterialTypeId"
                                            type="text"
                                            // label="Raw Material"
                                            component={searchableSelect}
                                            placeholder={'Raw Material'}
                                            options={this.renderListing('material')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.RawMaterial == null || this.state.RawMaterial.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleMaterialChange}
                                            valueDescription={this.state.RawMaterial}

                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="GradeId"
                                            type="text"
                                            // label="RM Grade"
                                            component={searchableSelect}
                                            placeholder={'RM Grade'}
                                            options={this.renderListing('grade')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.RMGrade == null || this.state.RMGrade.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleGrade}
                                            valueDescription={this.state.RMGrade}
                                        />
                                    </div>
                                    <div className="flex-fill">
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
                                            className="user-btn mr5"
                                        >
                                            {'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col md={6} className="text-right mb-3 search-user-block">
                            {this.state.shown ? (
                                <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                    <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                            ) : (
                                <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                            )}
                            {BulkUploadAccessibility && <button
                                type="button"
                                className={'user-btn mr5 '}
                                onClick={this.bulkToggle}>
                                <div className={'upload'}></div>Bulk upload</button>}
                            {AddAccessibility && <button
                                type={'button'}
                                className={'user-btn'}
                                onClick={this.openModel}>
                                <div className={'plus'}></div>{`ADD`}</button>}
                        </Col>
                    </Row>
                </form>

                <Row>
                    <Col>
                        {/* <hr /> */}
                        <BootstrapTable
                            data={this.props.rmSpecificationList}
                            striped={false}
                            bordered={false}
                            hover={false}
                            options={options}
                            search
                            // exportCSV
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={100} dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="RMName" dataAlign="left" dataSort={true}>Raw Material</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="RMGrade" dataAlign="left" >Grade</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMSpec" dataAlign="left">Specification</TableHeaderColumn>
                            <TableHeaderColumn searchable={false} dataField="SpecificationId" export={false} isKey={true} dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpen && <AddSpecification
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                    AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                    EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
                    isRMDomesticSpec={false}
                />}
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    densityAlert={this.densityAlert}
                    fileName={'RMSpecification'}
                    messageLabel={'RM Specification'}
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
    const { rmSpecificationDetail, filterRMSelectList, rmSpecificationList } = material;
    return { rmSpecificationDetail, filterRMSelectList, rmSpecificationList }
}

export default connect(mapStateToProps, {
    getRMSpecificationDataList,
    deleteRMSpecificationAPI,
    getRawMaterialNameChild,
    getRMGradeSelectListByRawMaterial,
    getGradeSelectList,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
})(reduxForm({
    form: 'SpecificationListing',
    enableReinitialize: true,
})(SpecificationListing));