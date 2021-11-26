import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getTaxDetailsDataList, deleteTaxDetails, } from '../actions/TaxMaster';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { TAX } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import AddTaxDetails from './AddTaxDetails';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const gridOptions = {};
class TaxListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      ID: '',
      tableData: [],
      gridApi: null,
      gridColumnApi: null,

      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      showPopup:false,
      deletedId:''
    }
  }

  /**
   * @method componentDidMount
   * @description  called before rendering the component
   */
  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props;
      if (leftMenuData !== undefined) {
        let Data = leftMenuData;
        const accessData = Data && Data.find(el => el.PageName === TAX)
        const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

        if (permmisionData !== undefined) {
          this.setState({
            ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
            AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
            EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
            DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          })
        }
      }
    })

    this.getTableListData()
  }

  /**
   * @method getTableListData
   * @description  GET DATALIST
   */
  getTableListData = () => {
    this.props.getTaxDetailsDataList(res => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [], })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({ tableData: Data, })
      } else {
        this.setState({ tableData: [], })
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
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  closeDrawer = (e = '') => {
    this.setState({ isOpen: false }, () => {
      this.getTableListData()
    })
  }

  /**
  * @method editItemDetails
  * @description confirm delete UOM
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
  * @description confirm delete TAX
  */
  deleteItem = (Id) => {
    this.setState({showPopup:true, deletedId:Id })
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id)
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />
    };
    // return Toaster.confirm(MESSAGES.TAX_DELETE_ALERT, toastrConfirmOptions);
  }

  /**
  * @method confirmDelete
  * @description confirm delete TAX
  */
  confirmDelete = (Id) => {
    this.props.deleteTaxDetails(Id, (res) => {
      if (res.data.Result) {
        Toaster.success(MESSAGES.DELETE_TAX_SUCCESS);
        this.getTableListData()
      }
    });
    this.setState({showPopup:false})
  }
  onPopupConfirm =() => {
    this.confirmDelete(this.state.deletedId);
   
}
closePopUp= () =>{
    this.setState({showPopup:false})
  }
  /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
  }


  /**
* @method buttonFormatter
* @description Renders buttons
*/
  buttonFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
      </>
    )
  }
  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
  };
  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };
  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method render
  * @description Renders the component
  */

  render() {
    const { isOpen, isEditFlag, AddAccessibility } = this.state;
    // const options = {
    //   clearSearch: true,
    //   noDataText: (this.props.taxDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
    //   //exportCSVText: 'Download Excel',
    //   //onExportToCSV: this.onExportToCSV,
    //   //paginationShowsTotal: true,
    //   paginationShowsTotal: this.renderPaginationShowsTotal,
    //   prePage: <span className="prev-page-pg"></span>, // Previous page button text
    //   nextPage: <span className="next-page-pg"></span>, // Next page button text
    //   firstPage: <span className="first-page-pg"></span>, // First page button text
    //   lastPage: <span className="last-page-pg"></span>,

    // };
    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,
    };
    const frameworkComponents = {

      effectiveDateRenderer: this.effectiveDateFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound
    };
    return (
      < >
        {/* {this.props.loading && <Loader />} */}
        <div className="container-fluid">
          <Row>
            <Col md={12}>
              <h1 className="mb-0">{`Tax Details Master`}</h1>
            </Col>
          </Row>

          <Row className="no-filter-row mt-4">
            {AddAccessibility && (
              <>
                <Col md={6} className="filter-block"></Col>
                <Col md={6} className="text-right search-user-block pr-0">
                  <div className="d-flex justify-content-end bd-highlight w100">
                    <button
                      type={"button"}
                      className={"user-btn"}
                      onClick={this.openModel}
                    >
                      <div className={"plus"}></div>
                      {`ADD`}
                    </button>
                  </div>
                </Col>
              </>
            )}
          </Row>


          <Row>
            <Col>
              {/* <BootstrapTable
                data={this.props.taxDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                ref={'table'}
                trClassName={'userlisting-row'}
                tableHeaderClass='my-custom-class'
                pagination>
                <TableHeaderColumn dataField="TaxName" dataSort={true}>Tax Name</TableHeaderColumn>
                <TableHeaderColumn dataField="Country" dataSort={true}>Country</TableHeaderColumn>
                <TableHeaderColumn dataField="Rate" dataSort={true}>Rate (%)</TableHeaderColumn>
                <TableHeaderColumn dataField="EffectiveDate" columnTitle={true} dataSort={true} dataAlign="center" dataFormat={this.effectiveDateFormatter} >{'Effective Date'}</TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} dataField="TaxDetailId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>

              </BootstrapTable> */}
              <div className="ag-grid-react">
                <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                  <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                  </div>
                  <div
                    className="ag-theme-material">
                    <AgGridReact
                      defaultColDef={defaultColDef}
                      floatingFilter={true}
                      domLayout='autoHeight'
                      // columnDefs={c}
                      rowData={this.props.taxDataList}
                      pagination={true}
                      paginationPageSize={10}
                      onGridReady={this.onGridReady}
                      gridOptions={this.gridOptions}
                      loadingOverlayComponent={'customLoadingOverlay'}
                      noRowsOverlayComponent={'customNoRowsOverlay'}
                      noRowsOverlayComponentParams={{
                        title: EMPTY_DATA,
                        imagClass: 'imagClass'
                      }}
                      frameworkComponents={frameworkComponents}
                      suppressRowClickSelection={true}
                      rowSelection={'multiple'}
                    >
                      {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                      <AgGridColumn field="TaxName" headerName="Tax Name"></AgGridColumn>
                      <AgGridColumn field="Country" headerName="Country"></AgGridColumn>
                      <AgGridColumn field="Rate" headerName="Rate (%)"></AgGridColumn>
                      <AgGridColumn field="OriginalFileName" headerName="File Name"></AgGridColumn>
                      <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateFormatter'></AgGridColumn>
                      <AgGridColumn field="TaxDetailId" headerName="Actions" cellRenderer='buttonFormatter'></AgGridColumn>
                    </AgGridReact>
                    <div className="paging-container d-inline-block float-right">
                      <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                        <option value="10" selected={true}>10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          {isOpen && (
            <AddTaxDetails
              isOpen={isOpen}
              closeDrawer={this.closeDrawer}
              isEditFlag={isEditFlag}
              ID={this.state.ID}
              anchor={'right'}
            />
          )}
           {
                this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.TAX_DELETE_ALERT}`}  />
                }
        </div>
      </ >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth, tax }) {
  const { leftMenuData } = auth;
  const { taxDataList } = tax
  return { leftMenuData, taxDataList }
}

export default connect(mapStateToProps,
  {
    getTaxDetailsDataList,
    deleteTaxDetails,
    getLeftMenu,
  })(TaxListing);

