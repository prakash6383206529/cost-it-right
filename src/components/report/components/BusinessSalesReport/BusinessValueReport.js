import React, { useEffect, useState } from "react";
import { Field, clearFields, reduxForm } from 'redux-form'
import { searchableSelect } from "../../../layout/FormInputs";
import { Row, Col } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, DatePickerHookForm } from "../../../layout/HookFormInputs";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useLabels } from "../../../../helper/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formViewData, getConfigurationKey, loggedInUserId } from "../../../../helper";
import { checkPartWithTechnology, getCostingSpecificTechnology, getExistingCosting, getPartInfo, getPartSelectListByTechnology, getSingleCostingDetails, setCostingViewData } from "../../../costing/actions/Costing";
import { getFinancialYearSelectList } from "../../../masters/actions/Volume";
import { getAllProductLevels } from "../../../masters/actions/Part";
import { useDispatch, useSelector } from "react-redux";
import { getSelectListPartType } from "../../../masters/actions/Part";
import { ApprovedCostingStatus, EMPTY_DATA, searchCount, defaultPageSize } from "../../../../config/constants";
import { autoCompleteDropdown } from "../../../common/CommonFunctions";
import { reactLocalStorage } from "reactjs-localstorage";
import { MESSAGES } from "../../../../config/message";
import { BarChartComparison } from "../../../costing/components/BarChartComparison";
import CostingSummaryTable from "../../../costing/components/CostingSummaryTable";
import { getMultipleCostingDetails } from "../../../rfq/actions/rfq";
import LoaderCustom from "../../../common/LoaderCustom";
import NoContentFound from "../../../common/NoContentFound";
import { useLocation, useHistory } from "react-router-dom/cjs/react-router-dom";
import Button from "../../../layout/Button";
import { getBusinessValueReportHeads, getBusinessValueReportData } from '../../actions/ReportListing';
import { getProductGroupSelectList } from "../../../masters/actions/Part"
import { FinancialQuarterOptions } from "../../../../config/masterData";
import { getClientSelectList } from '../../../masters/actions/Client';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import _ from "lodash"

const BusinessValueReport = ({ }) => {
  const gridOptions = {}
  const { control, register, getValues, setValue, handleSubmit, formState: { errors } } = useForm();
  const [partTypeList, setPartTypeList] = useState([])
  const [isLoader, setIsLoader] = useState(false);
  const [isTechnologySelected, setIsTechnologySelected] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filterAccordian, setFilterAccordian] = useState(true)
  const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
  const { businessValueReportHeads, businessValueReportData } = useSelector(state => state.report);
  const productGroupSelectList = useSelector(state => state.part.productGroupSelectList)
  const clientSelectList = useSelector((state) => state.client.clientSelectList)
  const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
  const financialYearSelectList = useSelector(state => state.volume.financialYearSelectList)
  const productHierarchyData = useSelector((state) => state.part);

  console.log(productHierarchyData, "productHierarchyData");

  useEffect(() => {
    if (businessValueReportData) {
      // console.log(businessValueReportData, "businessValueReportData");

      setTableData(businessValueReportData.ReportDetails);
      setTableHeaderColumnDefs(businessValueReportData.TableHeads)
    }
  }, [businessValueReportData]); // Runs only when businessValueReportData changes

  // console.log(tableData, "tableData");
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getBusinessValueReportHeads((res) => { }))
    dispatch(getBusinessValueReportData(loggedInUserId(), (res) => { }))
    dispatch(getProductGroupSelectList((res) => { }))
    dispatch(getClientSelectList((res) => { }))
    dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
    dispatch(getFinancialYearSelectList(() => {}, false))
    dispatch(getAllProductLevels((res) => { }))
  }, [])

  const renderListing = (label) => {
    // console.log(label);
    const temp = []
    if (label === 'PartGroup') {
      productGroupSelectList && productGroupSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      })
      return temp;
    }
    if (label === 'CustomerCode') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      })
      return temp;
    }
    if (label === 'FinancialQuarter') {
      FinancialQuarterOptions && FinancialQuarterOptions.map(item => {
        temp.push({ label: item.Text, value: item.Value })
        return null;
      })
      return temp;
    }
    if (label === 'TechnologyName') {
      technologySelectList && technologySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      })
      return temp;
    }
    if (label === 'FinancialYear') {
      financialYearSelectList &&
        financialYearSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }
  const handleSelectFieldChange = (data, e) => {
    if (data === 'FinancialYear') {
      setValue('FinancialYear', _.get(e, 'label', ''))
    }
    if (data === 'IsRequestedForBudgeting') {
      setValue('IsRequestedForBudgeting',  _.get(e, 'target.checked', false))
    }
    if (data === 'TechnologyName') {
      setIsTechnologySelected(true)
    }
    console.log("handleChange", getValues())
  }


  const handleFinancialYear = (newValue, actionMeta) => {
    // if (newValue && newValue !== '') {
    //   this.setState({ year: newValue })
    // } else {
    //   this.setState({ year: [] })
    // }
  }
  

  const frameworkComponents = {
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);
  };

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    floatingFilter: true
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Row className="m-0">
          <div className="graph-box w-100">
            <Row>
              <Col md="8"><h3 className={`mb-${filterAccordian ? 3 : 0}`}>Report Filters</h3></Col>
              <Col md="4" className="text-right">
                <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setFilterAccordian(!filterAccordian) }}>
                  {filterAccordian ? (<i className="fa fa-minus" ></i>) : (<i className="fa fa-plus"></i>)}
                </button>
              </Col>
            </Row>
            {filterAccordian && <Row>
              <div className="form-group mb-0 col-md-3">
                <div className="inputbox date-section">
                  <DatePickerHookForm
                    name={`fromDate`}
                    label={'From Date'}
                    selected={''}
                    handleChange={(e) => handleSelectFieldChange(`fromDate`, e)}
                    rules={{ required: false }}
                    maxDate={''}
                    Controller={Controller}
                    control={control}
                    register={register}
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="DD/MM/YYYY"
                    placeholder="Select date"
                    customClassName="withBorder"
                    className="withBorder"
                    autoComplete={"off"}
                    disabledKeyboardNavigation
                    onChangeRaw={(e) => e.preventDefault()}
                    disabled={false}
                    mandatory={false}
                    errors={false}
                  />
                </div>
              </div>
              <div className="form-group mb-0 col-md-3">
                <div className="inputbox date-section">
                  <DatePickerHookForm
                    name={`toDate`}
                    label={'To Date'}
                    selected={''}
                    handleChange={(e) => handleSelectFieldChange(`toDate`, e)}
                    rules={{ required: false }}
                    maxDate={''}
                    Controller={Controller}
                    control={control}
                    register={register}
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="DD/MM/YYYY"
                    placeholder="Select date"
                    customClassName="withBorder"
                    className="withBorder"
                    autoComplete={"off"}
                    disabledKeyboardNavigation
                    onChangeRaw={(e) => e.preventDefault()}
                    disabled={false}
                    mandatory={false}
                    errors={false}
                  />
                </div>
              </div>
              {_.size(businessValueReportHeads) && _.map(_.filter(businessValueReportHeads, reportFields => _.get(reportFields, 'Value', '0') !== '0'), reportFields => {
                if (_.get(reportFields, 'Value', '') === 'IsRequestedForBudgeting') {
                  return (
                    <Col md="3">
                      <div className="mt-3">
                        <span className="d-inline-block mt15">
                          <label
                            className={`custom-checkbox mb-0`}
                            onChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                          >
                            {_.get(reportFields, 'Text', '')}
                            <input
                              type="checkbox"
                              checked={_.get(getValues('IsRequestedForBudgeting'), false)}
                              disabled={false}
                            />
                            <span
                              className="before-box"
                              checked={_.get(getValues('IsRequestedForBudgeting'), false)}
                              onChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                            />
                          </label>
                        </span>
                      </div>
                    </Col>
                  )
                } else if (_.get(reportFields, 'Value', '') === 'FinancialYear') {
                  return (
                    <Col md="3">
                      <Field
                        name={_.get(reportFields, 'Value', '')}
                        type="text"
                        label={_.get(reportFields, 'Text', '')}
                        component={searchableSelect}
                        placeholder={'Select'}
                        options={renderListing(`${_.get(reportFields, 'Value', '')}`)}
                        required={false}
                        handleChangeDescription={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        valueDescription={_.get(getValues('FinancialYear'), '')}
                        disabled={false}
                      />
                    </Col>
                  )
                } else {
                  const fieldDisabled = ((_.get(reportFields, 'Value', '') === 'PartNumber' || _.get(reportFields, 'Value', '') === 'PartModelName') && !isTechnologySelected)
                  return (
                    <Col md="3">
                      <SearchableSelectHookForm
                        label={`${_.get(reportFields, 'Text', '')}`}
                        name={`${_.get(reportFields, 'Value', '')}`}
                        placeholder={`${_.get(reportFields, 'Text', '')}`}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={renderListing(`${_.get(reportFields, 'Value', '')}`)}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        errors={`${errors}.${_.get(reportFields, 'Value', '')}`}
                        // buttonCross={resetData('Masters')}   
                        disabled={fieldDisabled ? true : false}
                      />
                    </Col>
                  )
                }
              })}
            </Row>
            }
          </div>
        </Row>

      </form>
      {
        <div className="container-fluid custom-pagination report-listing-page ag-grid-react">
          <div className={`ag-grid-wrapper height-width-wrapper  ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className={`ag-theme-material grid-parent-wrapper mt-2 ${isLoader && "max-loader-height"}`}>
              {isLoader ? <LoaderCustom customClass="loader-center" /> :
                <AgGridReact
                  defaultColDef={defaultColDef}
                  domLayout='autoHeight'
                  columnDefs={tableHeaderColumnDefs}
                  rowData={tableData}
                  pagination={true}
                  paginationPageSize={defaultPageSize}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  // onFilterModified={onFloatingFilterChanged}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                    imagClass: 'imagClass pt-3'
                  }}
                  // rowSelection={'multiple'}
                  suppressRowClickSelection={true}
                  // onSelectionChanged={onRowSelect}
                  frameworkComponents={frameworkComponents}
                >
                </AgGridReact>
              }
            </div>
          </div>
        </div>
      }
    </>
  )

}

export default reduxForm({
  form: 'businessValueReportForm',
})(BusinessValueReport);

