import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from "../../../layout/HookFormInputs";
import { useForm, Controller } from "react-hook-form";
import { useLabels } from "../../../../helper/core";
import { formViewData, getConfigurationKey, loggedInUserId } from "../../../../helper";
import { checkPartWithTechnology, getCostingSpecificTechnology, getExistingCosting, getPartInfo, getPartSelectListByTechnology, getSingleCostingDetails, setCostingViewData } from "../../../costing/actions/Costing";
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
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import _ from "lodash"

const BusinessValueReport = ({ }) => {
  const gridOptions = {}
  const { control, register, setValue, handleSubmit, formState: { errors } } = useForm();
  const [partTypeList, setPartTypeList] = useState([])
  const [isLoader, setIsLoader] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
  const { businessValueReportHeads, businessValueReportData } = useSelector(state => state.report);
  const productGroupSelectList = useSelector(state => state.part.productGroupSelectList)
  console.log(productGroupSelectList, "productGroupSelectList");
  
  useEffect(() => {
    if (businessValueReportData) {
      console.log(businessValueReportData, "businessValueReportData");
      
      setTableData(businessValueReportData.ReportDetails);
      setTableHeaderColumnDefs(businessValueReportData.TableHeads)
    }
  }, [businessValueReportData]); // Runs only when businessValueReportData changes

  console.log(tableData, "tableData");
  const dispatch = useDispatch(); 
  useEffect(() => {
    dispatch(getBusinessValueReportHeads((res) => { }))
    dispatch(getBusinessValueReportData(loggedInUserId(), (res) => { }))
    dispatch(getProductGroupSelectList((res) => { }))
  }, [])

  const renderListing = (label) => {
    const temp = []
    if (label === 'PartGroup') {
      productGroupSelectList && productGroupSelectList.map(item => {
          if (item.Value === '0') return false;
          temp.push({ label: item.Text, value: item.Value })
          return null;
      })
      return temp;
    }
  }
  const handleSelectFieldChange = (data, e) => {
    console.log(data, e);
    // setValue(data, )
    
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
    <Row>
      {_.size(businessValueReportHeads) && _.map(businessValueReportHeads, reportFields => {
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
              disabled={false}
            />
          </Col>
        )      
      })}
    </Row>
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

export default BusinessValueReport;
