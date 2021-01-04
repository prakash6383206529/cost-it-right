import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { getManageBOPSOBDataList, getInitialFilterData, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';

class SOBListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      ID: '',
      tableData: [],

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
    this.props.getInitialFilterData('', () => { })
    this.getDataList()
  }

  /**
  * @method getDataList
  * @description GET DATALIST OF IMPORT BOP
  */
  getDataList = (boughtOutPartNumber = '') => {
    const filterData = {
      boughtOutPartNumber: boughtOutPartNumber,
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

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isOpen, isEditFlag } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      paginationSize: 5,
    };

    return (
      <div>
        {this.props.loading && <Loader />}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-30">
            <Col md="10" className="filter-block">
              <div className="d-inline-flex justify-content-start align-items-top w100">
                <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                <div className="flex-fill">
                  <Field
                    name="BOPPartNumber"
                    type="text"
                    label=""
                    component={searchableSelect}
                    placeholder={'-BOP Part No.-'}
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
                    className="apply mr5"
                  >
                    {'Apply'}
                  </button>
                </div>
              </div>
            </Col>
            <Col md="2" className="search-user-block">
              <div className="d-flex justify-content-end bd-highlight w100">

              </div>
            </Col>
          </Row>

        </form>
        <Row>
          <Col>
            <BootstrapTable
              data={this.state.tableData}
              striped={false}
              hover={false}
              bordered={false}
              options={options}
              search
              ref={'table'}
              pagination>
              <TableHeaderColumn dataField="BoughtOutPartNumber" columnTitle={true} dataAlign="center" dataSort={true} >{'BOP Part No.'}</TableHeaderColumn>
              <TableHeaderColumn dataField="BoughtOutPartName" columnTitle={true} dataAlign="center" dataSort={true} >{'BOP Part Name'}</TableHeaderColumn>
              <TableHeaderColumn dataField="BoughtOutPartCategory" columnTitle={true} dataAlign="center" dataSort={true} >{'BOP Category'}</TableHeaderColumn>
              <TableHeaderColumn dataField="Specification" columnTitle={true} dataAlign="center" >{'Specification'}</TableHeaderColumn>
              <TableHeaderColumn dataField="NoOfVendors" columnTitle={true} dataAlign="center" dataSort={true} >{'No Of Vendors'}</TableHeaderColumn>
              <TableHeaderColumn dataField="NetLandedCost" columnTitle={true} dataAlign="center" dataSort={true} >{'Net Landed Cost'}</TableHeaderColumn>
              <TableHeaderColumn dataField="ShareOfBusinessPercentage" columnTitle={true} dataAlign="center"  >{'Total SOB%'}</TableHeaderColumn>
              <TableHeaderColumn dataField="UOM" columnTitle={true} dataAlign="center"  >{'UOM'}</TableHeaderColumn>
              <TableHeaderColumn dataField="WeightedNetLandedCost" columnTitle={true} dataAlign="center"  >{'Weighted Net Landed Cost(INR)'}</TableHeaderColumn>
              <TableHeaderColumn width={100} dataField="BoughtOutPartNumber" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
  const { bopCategorySelectList, vendorAllSelectList, BOPVendorDataList } = boughtOutparts;
  const { plantSelectList, } = comman;
  return { bopCategorySelectList, plantSelectList, vendorAllSelectList, BOPVendorDataList }
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