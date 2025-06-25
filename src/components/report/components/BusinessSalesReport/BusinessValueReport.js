import React, { useEffect, useState } from "react";
import ReactExport from 'react-export-excel';
import _ from "lodash"
import DayTime from "../../../common/DayTimeWrapper";
import { Row, Col } from "reactstrap";
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, DatePickerHookForm } from "../../../layout/HookFormInputs";
import { useForm, Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { loggedInUserId, checkForDecimalAndNull } from "../../../../helper";
import { getCostingSpecificTechnology, getPartSelectListByTechnology } from "../../../costing/actions/Costing";
import { getFinancialYearSelectList } from "../../../masters/actions/Volume";
import { getAllProductLevels, getPartFamilySelectList, getModelList, getProductDataList, getNepNumberList } from "../../../masters/actions/Part";
import { getVendorNameByVendorSelectList, getPlantSelectListByType } from '../../../../actions/Common';
import { useDispatch, useSelector } from "react-redux";
import { getSelectListPartType } from "../../../masters/actions/Part";
import { EMPTY_DATA, searchCount, defaultPageSize } from "../../../../config/constants";
import { autoCompleteDropdown } from "../../../common/CommonFunctions";
import { reactLocalStorage } from "reactjs-localstorage";
import { MESSAGES } from "../../../../config/message";
import LoaderCustom from "../../../common/LoaderCustom";
import NoContentFound from "../../../common/NoContentFound";
import { getBusinessValueReportHeads, getBusinessValueReportData } from '../../actions/ReportListing';
import { getProductGroupSelectList } from "../../../masters/actions/Part"
import { FinancialQuarterOptions } from "../../../../config/masterData";
import { getClientSelectList } from '../../../masters/actions/Client';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from "../../../common/commonPagination";
import { CommonSummaryReportGraph } from "../../../dashboard/CommonSummaryReportGraph";
import GraphOptionsList from "../../../dashboard/GraphOptionsList";
import { hyphenFormatter } from "../../../masters/masterUtil";
import { graphDropDownOptions } from "../../../../helper";

const BusinessValueReport = ({ }) => { 
  const initialConfiguration = useSelector((state) => state?.auth?.initialConfiguration)
  const gridOptions = {}
  const { control, register, getValues, setValue, handleSubmit, formState: { errors } } = useForm();
  const [partTypeList, setPartTypeList] = useState([])
  const [isLoader, setIsLoader] = useState(true);
  const [vendorName, setVendorName] = useState('')
  const [partName, setPartName] = useState('')
  const [isTechnologySelected, setIsTechnologySelected] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filterAccordian, setFilterAccordian] = useState(true)
  const [detailAccordian, setDetailAccordian] = useState(true)
  const [graphAccordian, setGraphAccordian] = useState(true)
  const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
  const [partModelOptions, setModelOptions] = useState([])
  const [IsRequestedForBudgeting, setIsRequestedForBudgeting] = useState(false)
  const [fromAndToDate, setFromAndToDate] = useState(false)
  const [financialQuarterAndYear, setFinancialQuarterAndYear] = useState(false)
  const [actualCostLabelArray, setActualCostLabelArray] = useState([])
  const [actualCostDataArray, setActualCostDataArray] = useState([])
  const [budgetedCostLabelArray, setBudgetedCostLabelArray] = useState([])
  const [budgetedCostDataArray, setBudgetedCostDataArray] = useState([])
  const [reportDetailsByGroup, setReportDetailsByGroup] = useState([])
  const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [graphType, setGraphType] = useState('Bar Chart')
  const { businessValueReportHeads, businessValueReportData } = useSelector(state => state.report);
  const productGroupSelectList = useSelector(state => state.part.productGroupSelectList)
  const clientSelectList = useSelector((state) => state.client.clientSelectList)
  const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
  const financialYearSelectList = useSelector(state => state.volume.financialYearSelectList)
  const { productHierarchyData, productDataList, nepNumberSelectList } = useSelector((state) => state.part)
  const partFamilySelectList = useSelector((state) => state.part.partFamilySelectList)
  const plantSelectList = useSelector(state => state.comman.plantSelectList)
  const defaultTechnology = _.get(initialConfiguration, 'BusinessSummaryReportFields.BusinessValueSummaryDefaultTechnology', false)
  const defaultGroupBy = _.get(initialConfiguration, 'BusinessSummaryReportFields.BusinessValueSummaryHeadDefault', false)
  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
  
  useEffect(() => {
    if (businessValueReportData) {
      // Safely retrieve the 'ReportDetails' array from `businessValueReportData`, or return an empty array if not present
      const reportDetails = _.get(businessValueReportData, 'ReportDetails', [])
      const updatedTableData = _.map(reportDetails, row => {
        // Get the 'ProductHierarchyLevels' from the row (or an empty array if missing), 
        // then convert it into an object where each key is the 'HierarchyName' and the value is the corresponding level object
        const hierarchyMap = _.keyBy(_.get(row, 'ProductHierarchyLevels', '') || [], 'HierarchyName')
        // Create a new object where each key is the same as in `hierarchyMap`, 
        const dynamicHierarchyFields = _.mapValues(hierarchyMap, level => _.get(level, 'HierarchyNumber', ''))
        // Merge the original row with the dynamicHierarchyFields, so new hierarchy keys (like 'Plant', 'Division', etc.) get added to each row
        return Object.assign({}, row, dynamicHierarchyFields)
      })
      setTableData(updatedTableData)
      setTableHeaderColumnDefs(businessValueReportData?.TableHeads)
      setReportDetailsByGroup(businessValueReportData?.ReportDetailsByGroup)
    }
  }, [businessValueReportData])

  useEffect(() => {
    if (!businessValueReportHeads || !defaultTechnology || !defaultGroupBy || !technologySelectList) return
    const defaultTechnologyFound = technologySelectList.find(item => _.get(item, 'Text', null) === defaultTechnology)
    const defaultGroupByFound = businessValueReportHeads.find(item => _.get(item, 'Value', null) === defaultGroupBy)
    if (defaultTechnologyFound) {
      setValue('TechnologyName', { label: _.get(defaultTechnologyFound, 'Text', ''), value: _.get(defaultTechnologyFound, 'Value', '')})
    }
    if (defaultGroupBy) {
      setValue('GroupBy', { label: _.get(defaultGroupByFound, 'Text', ''), value: _.get(defaultGroupByFound, 'Value', '') })
    }
  }, [businessValueReportHeads, technologySelectList, defaultTechnology, defaultGroupBy, setValue])

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getPlantSelectListByType('', '', '', () => { }))
    dispatch(getBusinessValueReportHeads(() => { }))
    dispatch(getBusinessValueReportData({}, () => {
      setIsLoader(false)
    }))
    dispatch(getProductGroupSelectList(() => { }))
    dispatch(getClientSelectList(() => { }))
    dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
    dispatch(getFinancialYearSelectList(() => {}, false))
    dispatch(getAllProductLevels(() => { }))
    dispatch(getPartFamilySelectList(() => { }))
    dispatch(getProductDataList(() => { }))
    dispatch(getNepNumberList(() => { }))
    dispatch(getSelectListPartType((res) => {
      setPartTypeList(_.get(res, 'data.SelectList', []))
    }))
    dispatch(getModelList((res) => {
      setModelOptions(_.get(res, 'data.SelectList', []))
    }))
 }, [])

  useEffect(() => {
    viewPieData() 
  }, [reportDetailsByGroup])

  const renderListing = (label, text = '', IsProductHierarchy = false) => {
    const temp = []
    if (label === 'GroupCode') {
      productGroupSelectList && productGroupSelectList.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      })
      return temp;
    }
    if (label === 'CustomerCode') {
      clientSelectList && clientSelectList.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      })
      return temp;
    }
    if (label === 'FinancialQuarter') {
      FinancialQuarterOptions && FinancialQuarterOptions.map(item => {
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      })
      return temp;
    }
    if (label === 'TechnologyName') {
      technologySelectList && technologySelectList.map(item => {
        if (item?.Value === '0') return false;
        temp.push({ label: item?.Text, value: item?.Value })
        return null;
      })
      return temp;
    }
    if (label === 'FinancialYear') {
      financialYearSelectList && financialYearSelectList.map((item) => {
          if (item?.Value === '0') return false
          temp.push({ label: item?.Text, value: item?.Value })
          return null
        })
      return temp
    }
    if (label === 'PartFamilyCode') {
      partFamilySelectList && partFamilySelectList.map((item) => {
        if (item?.Value === '--0--') return false
          temp.push({ label: item?.Text, value: item?.Value })
          return null
        })
      return temp
    }
    if (label === 'PartModelName') {      
      partModelOptions && partModelOptions.map((item) => {
        if (item?.Value === '0') return false
          temp.push({ label: item?.Text, value: item?.Value })
          return null
        })
      return temp
    }
    if (label === 'PartType') {
      partTypeList && partTypeList.map((item) => {
        if (item?.Value === '0') return false
          temp.push({ label: item?.Text, value: item?.Value })
          return null
        })
      return temp
    }
    
    if (label === 'PlantCode') {
      plantSelectList && plantSelectList.map((item) => {
        if (item?.PlantId === '0') return false
          temp.push({ label: item?.PlantNameCode, value: item?.PlantId })
          return null
        })
      return temp
    }
    if (label === 'PartNepNumber' || label === 'NepNumber') {
      nepNumberSelectList && nepNumberSelectList.map((item) => {
        if (item?.Value === '0') return false
          temp.push({ label: item?.Text, value: item?.Value })
          return null
        })
      return temp
    }
    if (label === 'GroupBy') {
      businessValueReportHeads && businessValueReportHeads.map((item) => {
        if (item?.Value === '0') return false
        if (item?.Value === "IsRequestedForBudgeting") return false
        if (_.get(item, 'IsProductHierarchy', false)) {
          temp.push({ label: item?.Text, value: item?.Text })
        } else {
          temp.push({ label: item?.Text, value: item?.Value })
        }
          return null
        })
      return temp
    }
    if (IsProductHierarchy) {
      const associatedHierarchy = _.find(productHierarchyData, hierarchyData => {
        return String(text) === String(_.get(hierarchyData, 'ProductHierarchyName', 0))
      })
      if (_.size(_.get(associatedHierarchy, 'ProductHierarchyValueDetail', []))) {
        _.map(_.get(associatedHierarchy, 'ProductHierarchyValueDetail', []), item => {        
          temp.push({ label: item?.ProductHierarchyValue, value: item?.ProductHierarchyValueDetailsId, IsProductHierarchy })
            return null
        })
      } else {
        productDataList && productDataList.map((item) => {
          temp.push({ label: item?.ProductName, value: item?.ProductHierarchyValueDetailsIdRef, IsProductHierarchy })
          return null
        })
      }
      return temp
    }
  }

  const handleSelectFieldChange = async (data, e) => {
    if (data === 'FinancialYear') {
      setFinancialQuarterAndYear(true)
    }
    if (data === 'IsRequestedForBudgeting') {
      setIsRequestedForBudgeting(_.get(e, 'target.checked', false))
    }
    if (data === 'TechnologyName') {
      setIsTechnologySelected(true)
    }
    if (data === 'fromDate' || data === 'toDate') {
      setFromAndToDate(true)
    }
    if (data === 'FinancialQuarter') {
      setFinancialQuarterAndYear(true)
    }
  }

  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && vendorName !== resultInput) {
      let res
      res = await getVendorNameByVendorSelectList(null, resultInput)
      setVendorName(resultInput)
      let vendorDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
      } else {
        return vendorDataAPI
      }
    } else {
      if (inputValue?.length < searchCount) return false
      else {
        let VendorData = reactLocalStorage?.getObject('Data')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false)
        } else {
          return VendorData
        }
      }
    }
  }

  const partNumberfilterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)    
    if (inputValue?.length >= searchCount) {
      const res = await getPartSelectListByTechnology(_.get(getValues('TechnologyName'), 'value', null), resultInput, _.get(getValues('PartType'), 'value', null), _.get(getValues('PartFamilyCode'), 'value', null));
      setPartName(resultInput)
      let partDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, partDataAPI, false, [], true, true)
      } else {
        return partDataAPI
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let partData = reactLocalStorage.getObject('PartDataOptions')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, partData, false, [], false, true)
        } else {
          return partData
        }
      }
    }
  }  

  const frameworkComponents = {
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
    setGlobalTake(newPageSize);
  };

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    floatingFilter: true,
    valueFormatter: hyphenFormatter
  }

  const runReport = () => {
    setIsLoader(true)
    const values = getValues()
    const data = {
      ...values,
      fromDate: DayTime(_.get(values, 'fromDate', '')).isValid() ? DayTime(_.get(values, 'fromDate', '')).format('YYYY-MM-DD') : _.get(values, 'fromDate', ''),
      toDate: DayTime(_.get(values, 'toDate', '')).isValid() ? DayTime(_.get(values, 'toDate', '')).format('YYYY-MM-DD') : _.get(values, 'toDate', ''),
      FinancialQuarter: _.get(values, 'FinancialQuarter.label', ''),
      FinancialYear: _.get(values, 'FinancialYear.label', ''),
      IsRequestedForBudgeting: IsRequestedForBudgeting,
      TechnologyName: _.get(values, 'TechnologyName.value', ''),
      PartType: _.get(values, 'PartType.value', ''),
      PartGroup: _.get(values, 'GroupCode.value', ''),
      PartFamilyCode: _.get(values, 'PartFamilyCode.value', ''),
      PartNepNumber: _.get(values, 'NepNumber.value', ''),
      PlantCode: _.get(values, 'PlantCode.value', ''),
      VendorCode: _.get(values, 'VendorCode.value', ''),
      CustomerCode: _.get(values, 'CustomerCode.value', ''),
      PartModelName: _.get(values, 'PartModelName.value', ''),
      PartNumber : _.get(values, 'PartNumber.value', ''),
      GroupBy : _.get(values, 'GroupBy.value', ''),
      SegmentId :''
    }
    const keys = _.keys(data);
    const validKeys = _.filter(keys, key => {
      const item = data[key];
      return item && _.get(item, 'IsProductHierarchy', false) && !_.isNil(_.get(item, 'value', '')) && _.get(item, 'value', '') !== '';
    })  
    const segmentKeys = _.map(validKeys, key => data[key].value)
    const segmentId = segmentKeys.join(',')
    data.SegmentId = segmentId
    dispatch(getBusinessValueReportData(data, (res) => {
      setIsLoader(false)
     }))  
  }

  const reset = () => {
    const values = getValues()
    _.forEach(_.keys(values), (key) => {
      setValue(key, '')
    });
    setIsRequestedForBudgeting('')
    setFinancialQuarterAndYear(false)
    setFromAndToDate(false)
  }

  const viewPieData = _.debounce(() => {
    const labelArray = []
    const dataArray = reportDetailsByGroup.filter(item => item?.ActualTotalCostPercentage > 0).map(item => {
      const name = _.get(item, 'GroupByValue', '')
      const truncatedPercentage = checkForDecimalAndNull(item?.ActualTotalCostPercentage, initialConfiguration?.NoOfDecimalForPrice)
      const totalCost = checkForDecimalAndNull(item?.ActualTotalCost, initialConfiguration?.NoOfDecimalForPrice)
      labelArray.push(`${name} (${totalCost})`)
      return truncatedPercentage
    })
    setActualCostDataArray(dataArray)
    setActualCostLabelArray(labelArray)
    
    const labelArray1 = []
    const dataArray1 = reportDetailsByGroup.filter(item => item?.BudgetedTotalCostPercentage > 0).map(item => {
      const name = _.get(item, 'GroupByValue', '')
      const truncatedPercentage = checkForDecimalAndNull(item?.BudgetedTotalCostPercentage, initialConfiguration?.NoOfDecimalForPrice)
      const totalCost = checkForDecimalAndNull(item?.BudgetedTotalCost, initialConfiguration?.NoOfDecimalForPrice)
      labelArray1.push(`${name} (${totalCost})`)
      return truncatedPercentage
    })
    setBudgetedCostDataArray(dataArray1)
    setBudgetedCostLabelArray(labelArray1)
  }, [100])

  const valueChanged = (event) => {
    setGraphType(event?.label)
  }

  const downloadAllData = () => {
    let button = document.getElementById('Excel-Downloads')
    button.click()
  }
 
  const renderColumn = () => {
    return (
      <ExcelSheet data={tableData} name={"Business Value Summary Report"}>
        {tableHeaderColumnDefs && tableHeaderColumnDefs.map((ele, index) => {
          return <ExcelColumn key={index} label={ele?.headerName} value={ele?.field} style={ele?.style} /> 
        })}
      </ExcelSheet>
    )
  }

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
                    disabled={financialQuarterAndYear}
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
                    disabled={financialQuarterAndYear}
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
                              checked={IsRequestedForBudgeting}
                              disabled={false}
                            />
                            <span
                              className="before-box"
                              checked={IsRequestedForBudgeting}
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
                      <SearchableSelectHookForm
                        label={`${_.get(reportFields, 'Text', '')}`}
                        name={`${_.get(reportFields, 'Value', '')}`}
                        placeholder={`${_.get(reportFields, 'Text', '')}`}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={''}
                        options={renderListing(_.get(reportFields, 'Value', ''))}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        errors={`${errors}.${_.get(reportFields, 'Value', '')}`}   
                        disabled={fromAndToDate}
                      />
                    </Col>
                  )
                } else if (_.get(reportFields, 'Value', '') === 'FinancialQuarter') {
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
                        options={renderListing(_.get(reportFields, 'Value', ''), _.get(reportFields, 'Text', ''), _.get(reportFields, 'IsProductHierarchy', false))}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        errors={`${errors}.${_.get(reportFields, 'Value', '')}`}
                        // buttonCross={resetData('Masters')}   
                        disabled={fromAndToDate}
                      />
                    </Col>
                  )
                } else if (_.get(reportFields, 'Value', '') === 'VendorCode') {
                  return (
                    <Col md="3">
                      <AsyncSearchableSelectHookForm
                        label={_.get(reportFields, 'Text', '')}
                        name={_.get(reportFields, 'Value', '')}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={renderListing(`${_.get(reportFields, 'Value', '')}`)}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        asyncOptions={filterList}
                        errors={false}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                      />
                    </Col>
                  )
                } else if (_.get(reportFields, 'Value', '') === 'PartNumber') {
                  // const fieldDisabled = _.get(reportFields, 'Value', '') === 'PartNumber' && !isTechnologySelected
                  return (
                    <Col md="3">
                      <AsyncSearchableSelectHookForm
                        label={_.get(reportFields, 'Text', '')}
                        name={_.get(reportFields, 'Value', '')}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={renderListing(`${_.get(reportFields, 'Value', '')}`)}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        asyncOptions={partNumberfilterList}
                        errors={false}
                        disabled={false}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                      />
                    </Col>
                  )
                } else {
                  // const fieldDisabled = _.get(reportFields, 'Value', '') === 'PartModelName' && !isTechnologySelected
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
                        options={renderListing(_.get(reportFields, 'Value', ''), _.get(reportFields, 'Text', ''), _.get(reportFields, 'IsProductHierarchy', false))}
                        mandatory={false}
                        handleChange={(e) => handleSelectFieldChange(`${_.get(reportFields, 'Value', '')}`, e)}
                        errors={`${errors}.${_.get(reportFields, 'Value', '')}`}
                        // buttonCross={resetData('Masters')}   
                        disabled={false}
                      />
                    </Col>
                  )
                }
              })}
              <Col md="3">
                <SearchableSelectHookForm
                  label={'Group By'}
                  name={'GroupBy'}
                  placeholder={'Group By'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: false }}
                  register={register}
                  defaultValue={''}
                  options={renderListing('GroupBy')}
                  mandatory={false}
                  handleChange={(e) => handleSelectFieldChange('GroupBy', e)}
                  errors={''}
                  disabled={false}
                />
              </Col>
              {
                <Col md="3" className="mt-4">
                  <button type="button" className={"user-btn mr5 save-btn"} onClick={reset} disabled={false}> <div className={"Run-icon"}></div>reset</button>
                  <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport} disabled={false}> <div className={"Run-icon"}></div>RUN REPORT</button>
                </Col>
              }
            </Row>
            }
          </div>
        </Row>

      </form>
      {isLoader ? <LoaderCustom customClass="loader-center" /> :
        <Row className="m-0">
          <div className="graph-box w-100">
            <Row className={`pb-${graphAccordian ? 3 : 0}`}>
              <Col md="8" className="d-flex align-items-center">
                <h3 className={`mr-3`}>Graph View</h3>
                <GraphOptionsList valueChanged={valueChanged} dropDownOptions={graphDropDownOptions}/>
              </Col>
              <Col md="4" className="text-right">
                <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setGraphAccordian(!graphAccordian) }}>
                  {graphAccordian ? (<i className="fa fa-minus" ></i>) : (<i className="fa fa-plus"></i>)}
                </button>
              </Col>
            </Row>
            {graphAccordian && (
              <div className='column-data'>
                <div className="graph-container-grid d-flex">
                  <Col md="6" className="border">
                    <div className='p-3'>
                      <h6>{_.size(actualCostDataArray) ? 'All values are shown under (Actual Total Cost) as Actual Percentage.' : 'No data to show'}</h6>
                    </div>
                    {_.size(actualCostDataArray) > 0 && <CommonSummaryReportGraph graphType={graphType} labelData={actualCostLabelArray} chartData={actualCostDataArray} />}
                  </Col>
                  <Col md="6" className="border">
                    <div className='p-3'>
                      <h6>{_.size(budgetedCostDataArray) ? 'All values are shown under (Budgeted Total Cost) as Budgeted Percentage.' : 'No data to show'}</h6>
                    </div>
                    {_.size(budgetedCostDataArray) > 0 && <CommonSummaryReportGraph graphType={graphType} labelData={budgetedCostLabelArray} chartData={budgetedCostDataArray} />}
                  </Col>
                </div>
              </div>
            )}
          </div>
        </Row>
      }
      {
        <Row className="m-0">
        <div className="graph-box w-100">
          <Row>
            <Col md="8"><h3 className={`mb-${detailAccordian ? 3 : 0}`}>Detail View</h3></Col>
            <Col md="4" className="text-right">
              <button title={"All"} type="button" onClick={downloadAllData} className={'user-btn Tour_List_Download'}><div className="download mr-1"></div>
                {"All"}
              </button>
              <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setDetailAccordian(!detailAccordian) }}>
                {detailAccordian ? (<i className="fa fa-minus" ></i>) : (<i className="fa fa-plus"></i>)}
              </button>
            </Col>
             <ExcelFile filename={'Business Value Summary Report'} fileExtension={'.xls'} element={
                <button id={'Excel-Downloads'} type="button" className='p-absolute right-22'>
                </button>}>
                {renderColumn()}
             </ExcelFile>
          </Row>
         { detailAccordian && 
          <div className={`ag-grid-react ag-grid-wrapper height-width-wrapper  ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className={`ag-theme-material grid-parent-wrapper mt-2 ${isLoader && "max-loader-height"} ${tableData && tableData?.length <= 0 && "overlay-contain"}`}>
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
                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
            </div>
          </div>
        }
        </div>
        </Row>
      }
    </>
  )

}

export default BusinessValueReport

