import React, { Component } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMDomesticDataList, getRawMaterialNameChild, getGradeSelectList, getVendorListByVendorType,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getVendorFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
    getVendorFilterByGradeSelectList, getRawMaterialFilterByVendorSelectList, getGradeFilterByVendorSelectList, setFilterForRM
} from '../actions/Material';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common'
import { INR, ZBC, RmImport, RM_MASTER_ID, APPROVAL_ID } from '../../../config/constants'
import { costingHeadObjs, RMDOMESTIC_DOWNLOAD_EXCEl, RMIMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CheckApprovalApplicableMaster, getFilteredRMData, loggedInUserId, userDepartmetList, userDetails } from '../../../helper';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
        if (dateAsString == null) return -1;
        var dateParts = dateAsString.split('/');
        var cellDate = new Date(
            Number(dateParts[2]),
            Number(dateParts[1]) - 1,
            Number(dateParts[0])
        );
        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
    },
    browserDatePicker: true,
    minValidYear: 2000,
};

function RMDomesticListing(props) {
    const { AddAccessibility, BulkUploadAccessibility, loading, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, apply } = props;
    const [tableData, settableData] = useState([]);
    const [RawMaterial, setRawMaterial] = useState([]);
    const [RMGrade, setRMGrade] = useState([]);
    const [vendorName, setvendorName] = useState([]);
    const [costingHead, setcostingHead] = useState([]);
    const [plant, setplant] = useState([]);
    const [value, setvalue] = useState({ min: 0, max: 0 });
    const [maxRange, setmaxRange] = useState(0);
    const [isBulkUpload, setisBulkUpload] = useState(false);
    const [shown, setshown] = useState(false);
    const [technology, settechnology] = useState([]);
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [loader, setloader] = useState(true);
    const [statusId, setstatusId] = useState(0);
    const [count, setCount] = useState(0)
    const dispatch = useDispatch();

    const rmDataList = useSelector((state) => state.material.rmDataList);
    const filteredRMData = useSelector((state) => state.material.filteredRMData);
    const filterRMSelectList = useSelector((state) => state.material.filterRMSelectList);
    const { plantSelectList, technologySelectList } = useSelector((state) => state.comman)
    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({ mode: 'onChange', reValidateMode: 'onChange', })
    const [selectedRowData, setSelectedRowData] = useState([]);


    /**
    * @method FIRST RNDER COMPONENT
    * @description Called after rendering the component
    */

    //////////
    // useEffect(() => {
    //     // callFilterApi()
    //     getDataList()
    // }, [])

    const callFilterApi = () => {
        if (isSimulation || shown) {
            dispatch(getRawMaterialNameChild(() => { }))
            dispatch(getGradeSelectList(() => { }))
            dispatch(getVendorListByVendorType(false, () => { }))
            dispatch(getRawMaterialFilterSelectList(() => { }))
            dispatch(getTechnologySelectList(() => { }))
            dispatch(getPlantSelectListByType(ZBC, () => { }))
        }
        getDataList()
    }

    useEffect(() => {
        callFilterApi()
    }, [shown])

    // const handleFilterButton = ()=>{
    //     setshown(!shown)
    //     callFilterApi()
    // }

    useEffect(() => {

        if (isSimulation) {
            setcostingHead(filteredRMData && filteredRMData.costingHeadTemp && filteredRMData.costingHeadTemp.value ? { label: filteredRMData.costingHeadTemp.label, value: filteredRMData.costingHeadTemp.value } : []);
            setplant(filteredRMData && filteredRMData.plantId && filteredRMData.plantId.value ? { label: filteredRMData.plantId.label, value: filteredRMData.plantId.value } : []);
            setRawMaterial(filteredRMData && filteredRMData.RMid && filteredRMData.RMid.value ? { label: filteredRMData.RMid.label, value: filteredRMData.RMid.value } : []);
            setRMGrade(filteredRMData && filteredRMData.RMGradeid && filteredRMData.RMGradeid.value ? { label: filteredRMData.RMGradeid.label, value: filteredRMData.RMGradeid.value } : []);
            setvendorName(filteredRMData && filteredRMData.Vendorid && filteredRMData.Vendorid.value ? { label: filteredRMData.Vendorid.label, value: filteredRMData.Vendorid.value } : []);
            setstatusId(CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0);
            setvalue({ min: 0, max: 0 });
        }
        getDataList()
    }, [])


    const getFilterRMData = () => {
        if (isSimulation) {
            return getFilteredRMData(rmDataList)
        } else {
            return rmDataList
        }
    }

    /**
    * @method getInitialRange
    * @description GET INTIAL RANGE OF MIN AND MAX VALUES FOR SLIDER
    */
    const getInitialRange = () => {
        // const { value } = this.state;

        // this.props.setFilterForRM({ costingHeadTemp: costingHeadTemp, plantId: plantId, RMid: RMid, RMGradeid: RMGradeid, Vendorid: Vendorid })
        // const filterData = {
        //     costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : null,
        //     plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : null,
        //     material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : null,
        //     grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : null,
        //     vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : null,
        //     // technologyId: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp :null,
        //     technologyId: isSimulation ? props.technology : 0,
        //     net_landed_min_range: value.min,
        //     net_landed_max_range: value.max,
        //     statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
        // }

        // //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
        // if (!props.isMasterSummaryDrawer) {
        //     dispatch(getRMDomesticDataList(filterData, (res) => {
        //         if (res && res.status === 200) {
        //             let DynamicData = res.data.DynamicData;
        //             setvalue({ min: 0, max: DynamicData.MaxRange });
        //         }
        //         setloader(false);
        //     }))
        // }
    }




    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0) => {
        const { isSimulation } = props

        const filterData = {
            costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
            plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
            material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
            grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
            vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
            technologyId: isSimulation ? props.technology : technologyId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
            departmentCode: isSimulation ? userDepartmetList() : "",
            statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
        }
        //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
        if (!props.isMasterSummaryDrawer) {
            dispatch(getRMDomesticDataList(filterData, (res) => {
                if (res && res.status === 200) {
                    let Data = res.data.DataList;
                    let DynamicData = res.data.DynamicData;
                    settableData(Data);
                    setmaxRange(DynamicData.MaxRange);
                    setloader(false);

                    // if (isSimulation) {
                    //     props.apply(Data)
                    // }

                    // const func = () => {
                    // }
                    // func()

                } else if (res && res.response && res.response.status === 412) {
                    settableData([]);
                    setmaxRange(0);
                    setloader(false);

                } else {
                    settableData([]);
                    setmaxRange(0);
                    setloader(false);
                }
            }))
        }
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    const editItemDetails = (Id, rowData = {}) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
        }
        props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    const deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        dispatch(deleteRawMaterialAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                toastr.warning(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                getDataList()
            }
        }));
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isEditbale = false
        //const { EditAccessibility, DeleteAccessibility } = props;

        if (CheckApprovalApplicableMaster(RM_MASTER_ID)) {
            if (EditAccessibility && !rowData.IsRMAssociated) {
                isEditbale = true
            } else {
                isEditbale = false
            }
        } else {
            isEditbale = EditAccessibility
        }
        return (
            <>
                {isEditbale && <button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete align-middle" type={'button'} onClick={() => deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

        let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';

        return data;
    }



    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const { initialConfiguration } = props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '';
    }

    const companyFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (cellValue !== null && cellValue !== '-') ? `${cellValue}(${rowData.DepartmentCode !== null ? rowData.DepartmentCode : '-'})` : '-'
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue != null ? cellValue : '-';
    }

    /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }


    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }




    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    const renderListing = (label) => {

        const temp = [];
        if (label === 'costingHead') {
            return costingHeadObjs;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'material') {
            filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'grade') {
            filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            filterRMSelectList && filterRMSelectList.Vendors && filterRMSelectList.Vendors.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    const handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setRawMaterial(newValue);
            dispatch(getGradeFilterByRawMaterialSelectList(RawMaterial.value, res => { }))
            dispatch(getVendorFilterByRawMaterialSelectList(RawMaterial.value, res => { }))
            dispatch(getGradeSelectList(res => { }))

        } else {
            setRawMaterial([]);
        }
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
    */
    const handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setRMGrade(newValue);

            const fun = () => {

                dispatch(getRawMaterialFilterByGradeSelectList(RMGrade.value, () => { }))
                dispatch(getVendorFilterByGradeSelectList(RMGrade.value, () => { }))
            }
            fun();
        } else {
            setRMGrade([]);
        }
    }

    /**
     * @method handleVendorName
     * @description called
     */
    const handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setvendorName(newValue);
            dispatch(getRawMaterialFilterByVendorSelectList(vendorName.value, () => { }))
            dispatch(getGradeFilterByVendorSelectList(vendorName.value, () => { }))


        } else {
            setvendorName([]);
        }
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    const filterList = () => {
        // const { costingHead, RawMaterial, RMGrade, vendorName, plant, technology } = this.state;
        const plants = getValues('Plant')

        const costingHeadTemp = costingHead && costingHead.label === 'Zero Based' ? 0 : costingHead.label === 'Vendor Based' ? 1 : '';
        const plantId = plants ? plants.value : null;
        const RMid = RawMaterial ? RawMaterial.value : null;
        const RMGradeid = RMGrade ? RMGrade.value : null;
        const Vendorid = vendorName ? vendorName.value : null;
        const technologyId = technology ? technology.value : 0

        if (isSimulation) {
            dispatch(setFilterForRM({ costingHeadTemp: { label: costingHead.label, value: costingHead.value }, plantId: { label: plants.label, value: plants.value }, RMid: { label: RawMaterial.label, value: RawMaterial.value }, RMGradeid: { label: RMGrade.label, value: RMGrade.value }, Vendorid: { label: vendorName.label, value: vendorName.value } }))
            setTimeout(() => {

                getDataList(costingHeadTemp, plantId, RMid, RMGradeid, Vendorid, technologyId)
                // this.props.apply()  
                // props.apply()

            }, 500);
        } else {
            getDataList(costingHeadTemp, plantId, RMid, RMGradeid, Vendorid, technologyId)

        }
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    const resetFilter = () => {
        if (isSimulation) {
            dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        }

        setcostingHead([]);
        setRawMaterial([]);
        setRMGrade([]);
        setvendorName([]);
        setplant([]);
        settechnology([]);
        setvalue({ min: 0, max: 0 });
        setValue('CostingHead', '')
        setValue('Plant', '')
        setValue('Technology', '')
        setValue('RawMaterialId', '')
        setValue('RawMaterialGradeId', '')
        setValue('VendorId', '')
        getDataList(null)
        dispatch(getRawMaterialFilterSelectList(() => { }))

    }

    const formToggle = () => {
        props.formToggle()
    }

    const bulkToggle = () => {
        setisBulkUpload(true);
    }

    const closeBulkUploadDrawer = () => {
        setisBulkUpload(false);
        getInitialRange()
        getDataList(null, null, null)


    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    const densityAlert = () => {
        const toastrConfirmOptions = {
            onOk: () => {
                confirmDensity()
            },
            onCancel: () => { }
        };
        return toastr.confirm(`Recently Created Material's Density is not created, Do you want to create?`, toastrConfirmOptions);
    }

    const handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setcostingHead(newValue);
        } else {
            setcostingHead([]);
        }
    };

    const handlePlantChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setplant(newValue);
        } else {
            setplant([]);
        }
    }

    const handleTechnologyChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            settechnology(newValue);
        } else {
            settechnology([]);
        }
    }
    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    const confirmDensity = () => {
        props.toggle('4')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    const onSubmit = (values) => { }

    const onGridReady = (params) => {
        setgridApi(params.api);

        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={'RM Domestic'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }



    const onBtExport = () => {
        let tempArr = []
        const data = gridApi && gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return returnExcelColumn(RMDOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState(null);
        gridOptions.api.setFilterModel(null);
    }

    /**
    * @method render
    * @description Renders the component
    */


    //const { isBulkUpload, } = this.state;
    const isFirstColumn = (params) => {
        if (isSimulation) {

            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;

            return thisIsFirstColumn;
        } else {
            return false
        }
    }

    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        // if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        if (isSimulation) {
            let len = gridApi.getSelectedRows().length
            props.isRowSelected(len)
            apply(selectedRows)
        }
        setSelectedRowData(selectedRows)
    }

    const onFloatingFilterChanged = (p) => {
        gridApi.deselectAll()
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadRenderer: costingHeadFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        costFormatter: costFormatter,
        freightCostFormatter: freightCostFormatter,
        shearingCostFormatter: shearingCostFormatter,
        statusFormatter: statusFormatter,
        hyphenFormatter: hyphenFormatter,
        companyFormatter: companyFormatter,
        statusFormatter: statusFormatter,
    }


    return (
        <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
            {/* { this.props.loading && <Loader />} */}
            < form onSubmit={handleSubmit(onSubmit)} noValidate >
                <Row className="filter-row-large pt-4 ">

                    {
                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                        (!isSimulation && !props.isMasterSummaryDrawer) &&
                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    <>
                                        {/* {shown ? (
                                            <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => { setshown(!shown) }}>
                                                <div className="cancel-icon-white"></div>
                                            </button>
                                        ) : (
                                            <button title="Filter" type="button" className="user-btn mr5" onClick={() => { setshown(!shown) }}>
                                                <div className="filter mr-0"></div>
                                            </button>
                                        )} */}
                                        {AddAccessibility && (
                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={formToggle}
                                                title="Add"
                                            >
                                                <div className={"plus mr-0"}></div>
                                                {/* ADD */}
                                            </button>
                                        )}
                                        {BulkUploadAccessibility && (
                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={bulkToggle}
                                                title="Bulk Upload"
                                            >
                                                <div className={"upload mr-0"}></div>
                                                {/* Bulk Upload */}
                                            </button>
                                        )}
                                        {
                                            DownloadAccessibility &&
                                            <>

                                                <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                                                    <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                        {/* DOWNLOAD */}
                                                    </button>}>

                                                    {onBtExport()}
                                                </ExcelFile>


                                            </>

                                            //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

                                        }
                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </>
                                </div>
                            </div>
                        </Col>
                    }
                </Row>
            </form >
            <Row>
                <Col>
                    {(loader && !props.isMasterSummaryDrawer) && <LoaderCustom />}
                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                        >
                            <AgGridReact
                                style={{ height: '100%', width: '100%' }}
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={getFilterRMData()}
                                pagination={true}
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                // loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                                rowSelection={'multiple'}
                                onSelectionChanged={onRowSelect}
                                onFilterModified={onFloatingFilterChanged}
                            >
                                <AgGridColumn field="CostingHead" headerName="Head"></AgGridColumn>

                                <AgGridColumn field="TechnologyName" headerName="Technology"></AgGridColumn>

                                <AgGridColumn field="RawMaterial" headerName="Raw Material"></AgGridColumn>

                                <AgGridColumn field="RMGrade" headerName="RM Grade"></AgGridColumn>

                                <AgGridColumn field="RMSpec" headerName="RM Specs"></AgGridColumn>

                                <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>

                                <AgGridColumn field="Category" headerName="Category"></AgGridColumn>

                                <AgGridColumn field="MaterialType" headerName="Material"></AgGridColumn>

                                <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>

                                <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>

                                <AgGridColumn field="DepartmentName" headerName="Company" cellRenderer='companyFormatter'></AgGridColumn>

                                <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>

                                <AgGridColumn field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>

                                <AgGridColumn field="ScrapRate" headerName="Scrap Rate(INR)" ></AgGridColumn>

                                <AgGridColumn field="RMFreightCost" headerName="RM Freight Cost(INR)" cellRenderer='freightCostFormatter'></AgGridColumn>

                                <AgGridColumn field="RMShearingCost" headerName="Shearing Cost(INR)" cellRenderer='shearingCostFormatter'></AgGridColumn>

                                <AgGridColumn field="NetLandedCost" headerName="Net Cost(INR)" cellRenderer='costFormatter'></AgGridColumn>

                                <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>

                                {CheckApprovalApplicableMaster(RM_MASTER_ID) && <AgGridColumn field="DisplayStatus" headerName="Status" cellRenderer='statusFormatter'></AgGridColumn>}

                                {!isSimulation && <AgGridColumn width={120} field="RawMaterialId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer'></AgGridColumn>}

                                <AgGridColumn field="VendorId" hide={true}></AgGridColumn>

                                <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>

                            </AgGridReact>
                            <div className="paging-container d-inline-block float-right">
                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                    <option value="10" selected={true}>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            {
                isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={closeBulkUploadDrawer}
                        isEditFlag={false}
                        densityAlert={densityAlert}
                        fileName={"RMDomestic"}
                        isZBCVBCTemplate={true}
                        messageLabel={"RM Domestic"}
                        anchor={"right"}
                    />
                )
            }
        </div >
    );
}
export default RMDomesticListing;

