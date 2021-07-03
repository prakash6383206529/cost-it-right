import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { getManageBOPSOBDataList, getInitialFilterData, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { BOP_SOBLISTING_DOWNLOAD_EXCEl, costingHeadObj } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey } from '../../../helper';
import { Sob } from '../../../config/constants';
import ReactExport from 'react-export-excel';

class SOBListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      ID: '',
      tableData: [],
      shown: false,
      costingHead: [],
      BOPCategory: [],
      plant: [],
      vendor: [],

    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    this.props.getBOPCategorySelectList(() => { })
    this.props.getPlantSelectList(() => { })
    this.props.getAllVendorSelectList(() => { })
    // this.props.getInitialFilterData('', () => { })
    this.getDataList()
  }

  /**
  * @method getDataList
  * @description GET DATALIST OF IMPORT BOP
  */
  getDataList = (bought_out_part_id = null, plant_id = null) => {
    const filterData = {
      bought_out_part_id: bought_out_part_id,
      plant_id: plant_id
    }
    this.props.getManageBOPSOBDataList(filterData, (res) => {
      if (res && res.status === 200) {
        let Data = res.data.DataList;
        this.setState({ tableData: Data })
      } else if (res && res.response && res.response.status === 412) {
        this.setState({ tableData: [] })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
  * @method editItemDetails
  * @description edit material type
  */
  editItemDetails = (Id) => {
    this.setState({
      isEditFlag: true,
      ID: Id,
      isOpen: true,
    })
  }

  /**
  * @method handleHeadChange
  * @description called
  */
  handleHeadChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ costingHead: newValue, });
    } else {
      this.setState({ costingHead: [], })
    }
  };

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
    const { EditAccessibility, } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
      </>
    )
  }

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'Vendor Based' : 'Zero Based';
  }

  renderweightnet = () => {
    return <>Weighted Net <br /> Cost (INR)</>
  }

  rendernetlandedCost = () => {
    return <>Net <br />Cost(INR)</>
  }

  renderbopNo = () => {
    return <> BOP <br /> Part No. </>
  }

  renderbopName = () => {
    return <> BOP <br /> Part Name </>
  }

  renderbopCategory = () => {
    return <> BOP <br /> Category </>
  }

  renderNoOfVendor = () => {
    return <>No of <br />Vendors </>
  }

  costRender = (cell, cellValue, row, rowIndex) => {
    return cell !== null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { BOPVendorDataList, } = this.props;
    const temp = [];

    if (label === 'SOBVendors') {
      BOPVendorDataList && BOPVendorDataList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.BoughtOutPartNumber, value: item.BoughtOutPartNumber })
        return null;
      });
      return temp;
    }

  }

  /**
  * @method closeDrawer
  * @description Filter listing
  */
  closeDrawer = (e = '') => {
    this.setState({
      isOpen: false,
      isEditFlag: false,
      ID: '',
    }, () => {
      this.getDataList()
    })
  }

  /**
  * @method filterList
  * @description Filter listing
  */
  filterList = () => {
    const { costingHead } = this.state;

    const costingHeadTemp = costingHead ? costingHead.value : '';

    this.getDataList(costingHeadTemp)
  }

  /**
  * @method resetFilter
  * @description Reset user filter
  */
  resetFilter = () => {
    this.setState({
      costingHead: [],
      BOPCategory: [],
      plant: [],
      vendor: [],
    }, () => {
      this.getDataList()
    })

  }
  formToggle = () => {
    this.props.displayForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {

  }

  returnExcelColumn = (data = [], TempData) => {
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
    let temp = []
    temp = TempData.map((item) => {
      if (item.CostingHead === true) {
        item.CostingHead = 'Vendor Based'
      } else if (item.CostingHead === false) {
        item.CostingHead = 'Zero Based'
      }
      return item
    })

    return (<ExcelSheet data={temp} name={`${Sob}`}>
      {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
      }
    </ExcelSheet>);
  }
  renderColumn = (fileName) => {
    let arr = this.props.bopSobList && this.props.bopSobList.length > 0 ? this.props.bopSobList : []
    if (arr != []) {
      arr && arr.map(item => {
        let len = Object.keys(item).length
        for (let i = 0; i < len; i++) {
          // let s = Object.keys(item)[i]
          if (item.Specification === null) {
            item.Specification = ' '
          } if (item.Plants === '-') {
            item.Plants = ' '
          }
        }
      })
    }
    return this.returnExcelColumn(BOP_SOBLISTING_DOWNLOAD_EXCEl, arr)
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, DownloadAccessibility } = this.props;
    const { isOpen, isEditFlag } = this.state;
    const ExcelFile = ReactExport.ExcelFile;

    const onExportToCSV = (row) => {
      // ...
      let products = []
      products = this.props.bopSobList
      return products; // must return the data which you want to be exported
    }

    const options = {
      clearSearch: true,
      noDataText: (this.props.bopSobList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      // exportCSVBtn: this.createCustomExportCSVButton,
      // onExportToCSV: this.handleExportCSVButtonClick,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };

    return (
      <div className="">
        {/* {this.props.loading && <Loader />} */}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4 ">
            {this.state.shown && (
              <Col md="8" className="filter-block">
                <div className="d-inline-flex justify-content-start align-items-top w100">
                  <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                  <div className="flex-fill">
                    <Field
                      name="BOPPartNumber"
                      type="text"
                      label=""
                      component={searchableSelect}
                      placeholder={'BOP Part No.'}
                      isClearable={false}
                      options={this.renderListing('SOBVendors')}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={(this.state.costingHead == null || this.state.costingHead.length === 0) ? [required] : []}
                      required={true}
                      handleChangeDescription={this.handleHeadChange}
                      valueDescription={this.state.costingHead}
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
              </Col>)}

            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                {this.state.shown ? (
                  <button type="button" className="user-btn filter-btn-top topminus88" onClick={() => this.setState({ shown: !this.state.shown })}>
                    <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                ) : (
                  <button type="button" className="user-btn" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                )}
                {DownloadAccessibility &&
                  <ExcelFile filename={`${Sob}`} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                    {this.renderColumn(`${Sob}`)}
                  </ExcelFile>
                }
              </div>
            </Col>
          </Row>

        </form>
        <Row>
          <Col>
            <BootstrapTable
              data={this.props.bopSobList}
              striped={false}
              hover={false}
              bordered={false}
              options={options}
              // exportCSV={DownloadAccessibility}
              // csvFileName={`${Sob}.csv`}
              search
              ref={'table'}
              pagination>
              <TableHeaderColumn width={100} dataField="BoughtOutPartNumber" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopNo()}</TableHeaderColumn>
              <TableHeaderColumn width={100} dataField="BoughtOutPartName" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopName()}</TableHeaderColumn>
              <TableHeaderColumn width={100} dataField="BoughtOutPartCategory" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderbopCategory()}</TableHeaderColumn>
              <TableHeaderColumn width={110} dataField="Specification" columnTitle={true} dataAlign="left" >{'Specification'}</TableHeaderColumn>
              <TableHeaderColumn width={90} dataField="NoOfVendors" columnTitle={true} dataAlign="left" dataSort={true} >{this.renderNoOfVendor()}</TableHeaderColumn>
              <TableHeaderColumn width={90} dataField="Plant" columnTitle={true} dataAlign="left" dataSort={true} >{'Plant'}</TableHeaderColumn>
              {/* <TableHeaderColumn width={120} dataField="NetLandedCost" columnTitle={true} dataAlign="left" dataFormat={this.costRender} dataSort={true} >{this.rendernetlandedCost()}</TableHeaderColumn> */}
              <TableHeaderColumn width={100} dataField="ShareOfBusinessPercentage" columnTitle={true} dataAlign="left"  >{'Total SOB%'}</TableHeaderColumn>
              {/* <TableHeaderColumn width={100} dataField="UOM" columnTitle={true} dataAlign="left"  >{'UOM'}</TableHeaderColumn> */}
              <TableHeaderColumn width={140} dataField="WeightedNetLandedCost" columnTitle={true} dataAlign="left"  >{this.renderweightnet()}</TableHeaderColumn>
              <TableHeaderColumn dataAlign="right" width={80} dataField="BoughtOutPartNumber" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable>
          </Col>
        </Row>
        {isOpen && <ManageSOBDrawer
          isOpen={isOpen}
          closeDrawer={this.closeDrawer}
          isEditFlag={isEditFlag}
          ID={this.state.ID}
          anchor={'right'}
        />}

      </div >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ boughtOutparts, comman }) {
  const { bopCategorySelectList, vendorAllSelectList, BOPVendorDataList, bopSobList } = boughtOutparts;
  const { plantSelectList, } = comman;
  return { bopCategorySelectList, plantSelectList, vendorAllSelectList, BOPVendorDataList, bopSobList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getManageBOPSOBDataList,
  getBOPCategorySelectList,
  getPlantSelectList,
  getAllVendorSelectList,
  getInitialFilterData,
})(reduxForm({
  form: 'SOBListing',
  enableReinitialize: true,
})(SOBListing));