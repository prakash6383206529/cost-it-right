import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddMaterialType from './AddMaterialType';
import { getMaterialTypeDataListAPI, deleteMaterialTypeAPI } from '../actions/Material';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { applySuperScripts } from '../../../helper';
import Association from './Association';
import { RmMaterial } from '../../../config/constants';

class RMListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ID: '',
            isOpenAssociation: false
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.getListData();
    }

    /**
    * @method getListData
    * @description Get list data
    */
    getListData = () => {
        this.props.getMaterialTypeDataListAPI(res => { });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '') => {
        this.setState({ isOpen: false }, () => {
            this.getListData()
        })
    }


    /**
  * @method closeDrawer
  * @description  used to cancel filter form
  */
    closeAssociationDrawer = (e = '') => {
        this.setState({ isOpenAssociation: false }, () => {
            this.getListData()
        })
    }

    /**
    * @method editItemDetails
    * @description edit Raw Material
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(`${MESSAGES.MATERIAL1_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material
    */
    confirmDelete = (ID) => {
        this.props.deleteMaterialTypeAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                toastr.warning(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
                this.getListData();
            }
        });
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

    openAssociationModel = () => {
        this.setState({
            isOpenAssociation: true
        })
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
                {DeleteAccessibility && <button className="Delete" type={'button'} type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    renderDensity = (cell, row, enumObject, rowIndex) => {

        // return applySuperScripts('Density(g/cm^3)')
        // return <>Density(g/cm)       </>
        // return <>Vendor <br />Location </>
        return (<>
            Density(g/cm<sup>3</sup>)
        </>)

    }

    handleExportCSVButtonClick = (onClick) => {
        onClick();
        let products = []
        products = this.props.rawMaterialTypeDataList
        return products; // must return the data which you want to be exported
    }

    createCustomExportCSVButton = (onClick) => {
        return (
            <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
        );
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID } = this.state;
        const { AddAccessibility, DownloadAccessibility } = this.props;

        const options = {
            clearSearch: true,
            noDataText: (this.props.rawMaterialTypeDataList === undefined ? <Loader /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            exportCSVBtn: this.createCustomExportCSVButton,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <div className={DownloadAccessibility ? "show-table-btn" : ""}>
                {this.props.loading && <Loader />}
                <Row className="pt-4 no-filter-row">
                    <Col md={6} className="text-right search-user-block pr-0">
                        {AddAccessibility && (
                            <button
                                type={"button"}
                                className={"user-btn mr5"}
                                onClick={this.openAssociationModel}
                            >
                                <div className={"plus"}></div>
                                {`Association`}
                            </button>
                        )}
                        {AddAccessibility && (
                            <button
                                type={"button"}
                                className={"user-btn"}
                                onClick={this.openModel}
                            >
                                <div className={"plus"}></div>
                                {`Add`}
                            </button>
                        )}
                    </Col>

                </Row>

                <Row>
                    <Col>
                        <BootstrapTable
                            data={this.props.rawMaterialTypeDataList}
                            striped={false}
                            bordered={false}
                            hover={false}
                            options={options}
                            search
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${RmMaterial}.csv`}
                            //ignoreSinglePage
                            ref={'table'}
                            className={'RM-table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={100} dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="RawMaterial" dataAlign="left" dataSort={true}>Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="Density" dataAlign="center" dataSort={true}>{this.renderDensity()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMName" dataAlign="center" dataSort={true}>{'Raw Material'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RMGrade" dataAlign="center" dataSort={true}>{'Grade'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialId" searchable={false} dataAlign="right" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

                        </BootstrapTable>
                    </Col>
                </Row>
                {isOpen && <AddMaterialType
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                />}
                {
                    this.state.isOpenAssociation && <Association
                        isOpen={this.state.isOpenAssociation}
                        closeDrawer={this.closeAssociationDrawer}
                        anchor={'right'} />
                }
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
    const { rawMaterialTypeDataList } = material;
    return { rawMaterialTypeDataList }
}

export default connect(
    mapStateToProps, {
    getMaterialTypeDataListAPI,
    deleteMaterialTypeAPI,
}
)(RMListing);

