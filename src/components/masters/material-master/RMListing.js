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
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { GridTotalFormate } from '../../common/TableGridFunctions';

class RMListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ID: '',
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
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.MATERIAL_DELETE_ALERT}`, toastrConfirmOptions);
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
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID } = this.state;
        const { AddAccessibility, } = this.props;
        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            paginationShowsTotal: this.renderPaginationShowsTotal,
			prePage: <span className="prev-page-pg"></span>, // Previous page button text
			nextPage: <span className="next-page-pg"></span>, // Next page button text
			firstPage: <span className="first-page-pg"></span>, // First page button text
			lastPage: <span className="last-page-pg"></span>,
            paginationSize: 5,
        };

        return (
            <div>
                {this.props.loading && <Loader />}
                <Row className="pt-4 mb-3">
                    <Col md={12} className="text-right ">
                        {AddAccessibility && <button
                            type={'button'}
                            className={'user-btn'}
                            onClick={this.openModel}>
                            <div className={'plus'}></div>{`Add`}</button>}
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
                            // exportCSV
                            //ignoreSinglePage
                            ref={'table'}
                            className={'RM-table'}
                            pagination>
                            {/* <TableHeaderColumn dataField="" width={100} dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="MaterialType" dataAlign="left" dataSort={true}>Material</TableHeaderColumn>
                            <TableHeaderColumn dataField="Density" dataSort={true}>Density (g/cm3)</TableHeaderColumn>
                            <TableHeaderColumn dataField="MaterialTypeId" dataAlign="right" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

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

