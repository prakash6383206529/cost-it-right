import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getAllLevelMappingAPI, deleteUserLevelAPI, getSimulationLevelDataList, getMasterLevelDataList } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA, } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getConfigurationKey } from '../../helper/auth';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { PaginationWrapper } from '../common/commonPagination';
import { ApplyPermission } from './LevelsListing';
import { useContext } from 'react';
const gridOptions = {};
const defaultPageSize = 5;
const LevelTechnologyListing = (props) => {
	const agGrid1 = useRef(null);
	const agGrid2 = useRef(null);
	const agGrid3 = useRef(null);
	const [state, setState] = useState({
		isEditFlag: false,
		tableData: [],
		gridApi: null,
		gridColumnApi: null,
		rowData: null,
		sideBar: { toolPanels: ['columns'] },
		showData: false,
		showPopup: false,
		deletedId: '',
		isLoader: false,
		
	});
	const permissions = useContext(ApplyPermission);
	const dispatch = useDispatch();
	const { simulationLevelDataList, masterLevelDataList } = useSelector((state) => state.auth)
	const [levelMappingFilter, setLevelMappingFilter] = useState("")
	const [simulationFilter, setSimulationFilter] = useState("")
	const [masterFilter, setMasterFilter] = useState("")

	useEffect(() => {
		getLevelsListData();
		getSimulationDataList();
		getMasterDataList()
		props.onRef(this);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (props.updateApi) {
			if (!props.cancelButton) {
				getUpdatedData();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getLevelsListData = () => {
		setState((prevState) => ({ ...prevState, isLoader: true }))
		dispatch(getAllLevelMappingAPI(res => {
			setState((prevState) => ({ ...prevState, isLoader: false }))
			if (res.status === 204 && res.data === '') {
				setState((prevState) => ({ ...prevState, tableData: [], }))
			} else if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				setState((prevState) => ({
					...prevState,
					tableData: Data,
				}))
			} else {

			}
		}));
	}

	const getSimulationDataList = () => {
		setState((prevState) => ({ ...prevState, isLoader: true }))
		dispatch(getSimulationLevelDataList(res => {
			setState((prevState) => ({ ...prevState, isLoader: false }))
		}))
	}
	const getMasterDataList = () => {
		setState((prevState) => ({ ...prevState, isLoader: true }))
		dispatch(getMasterLevelDataList(res => {
			setState((prevState) => ({ ...prevState, isLoader: false }))
		}))
	}
	/**
	  * @method getUpdatedData
	  * @description get updated data after updatesuccess
	  */
	const getUpdatedData = () => {
		getLevelsListData()
		getSimulationDataList()
		getMasterDataList()
	}

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	const editItemDetails = (Id, levelType, rowData = []) => {
		props.getLevelMappingDetail(Id, levelType, rowData?.ApprovalTypeId)
	}
/**
	* @method confirmDeleteItem
	* @description confirm delete level item
	*/
	const confirmDeleteItem = (LevelId) => {
		dispatch(deleteUserLevelAPI(LevelId, (res) => {
			if (res.data.Result === true) {
				Toaster.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
				getUpdatedData()
			}
		}));
		setState((prevState) => ({ ...prevState, showPopup: false }))
	}
	const onPopupConfirm = () => {
		confirmDeleteItem(state.deletedId);

	}
	const closePopUp = () => {
		setState((prevState) => ({ ...prevState, showPopup: false }))
	}
	const buttonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
		console.log("button", permissions)
		return (
			<>
				{permissions.Edit && <button title="Edit" type={'button'} className="Edit " onClick={() => editItemDetails(cellValue, 'Costing', rowData)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => deleteItem(cell)} />} */}
			</>
		)
	}

	/**
		* @method simulationButtonFormatter
		* @description Renders buttons
		*/

	const simulationButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
		console.log("simulation", permissions)
		return (
			<>
				{permissions.Edit && <button title="Edit" type={'button'} className="Edit " onClick={() => editItemDetails(cellValue, 'Simulation', rowData)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => deleteItem(cell)} />} */}
			</>
		)
	}
	/**
	* @method masterButtonFormatter
	* @description Renders buttons
	*/
	const masterButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
		return (
			<>
				{permissions.Edit && <button title={"Edit"} type={'button'} className="Edit " onClick={() => editItemDetails(cellValue, 'Master', rowData)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => deleteItem(cell)} />} */}
			</>
		)
	}

	const onGridReady = (params) => {
		state.gridApi = params.api;
		state.gridApi.sizeColumnsToFit();
		setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
		params.api.paginationGoToPage(0);
	};

	const levelMappingFilterHandler = (e) => {
		setLevelMappingFilter(agGrid1?.current.api.setQuickFilter(e.target.value));

	}

	const simulationFilterHandler = (e) => {
		setSimulationFilter(agGrid2?.current.api.setQuickFilter(e.target.value));
	}

	const masterFilterHandler = (e) => {
		setMasterFilter(agGrid3?.current.api.setQuickFilter(e.target.value));
	}

	const levelMappingResetState = () => {
		const searchBox = document.getElementById("filter-text-box");
		if (searchBox) {
			searchBox.value = ""; // Reset the input field's value
		}
		agGrid1?.current.api.setQuickFilter(null)
		
		agGrid1?.current?.columnApi?.resetColumnState();
		agGrid1?.current?.api.setFilterModel(null)
	}
	const simulationResetState = () => {
		console.log("simulationResetState")
		const searchBox1 = document.getElementById("filter-text-box-simulation");
		if (searchBox1) {
			searchBox1.value = ""; // Reset the input field's value
		}
		agGrid2?.current.api.setQuickFilter(null)
		agGrid2?.current?.columnApi?.resetColumnState();
		agGrid2?.current?.api.setFilterModel(null)
	}
	const masterResetState = () => {
		const searchBox2 = document.getElementById("filter-text-box-master");
		if (searchBox2) {
			searchBox2.value = ""; // Reset the input field's value
		}
		agGrid3?.current.api.setQuickFilter(null)
		agGrid3?.current?.columnApi?.resetColumnState();
		agGrid3?.current?.api.setFilterModel(null)
	}

	const levelMappingPagination = (newPageSize) => {
		agGrid1?.current.api.paginationSetPageSize(Number(newPageSize + 1))
		agGrid1?.current.api.paginationSetPageSize(Number(newPageSize))
	};

	const simulationPagination = (newPageSize) => {
		agGrid2?.current.api.paginationSetPageSize(Number(newPageSize + 1))
		agGrid2?.current.api.paginationSetPageSize(Number(newPageSize))
	};

	const masterPagination = (newPageSize) => {
		agGrid3?.current.api.paginationSetPageSize(Number(newPageSize + 1))
		agGrid3?.current.api.paginationSetPageSize(Number(newPageSize))
	};
	const { AddAccessibility } = props;
	const defaultColDef = {
		resizable: true, filter: true, sortable: false,

	};

	const frameworkComponents = {
		totalValueRenderer: buttonFormatter,
		simulationButtonFormatter: simulationButtonFormatter,
		customNoRowsOverlay: NoContentFound,
		masterButtonFormatter: masterButtonFormatter
	};
	

	return (
		<>
			<div className='p-relative'>
				{state.isLoader && <LoaderCustom />}
				<Row className="levellisting-page">
					<Col md="12">
						<h2 className="manage-level-heading">{`Costing Level Mapping`}</h2>
					</Col>
				</Row>
				<Row className="levellisting-page">
					<Col md="6" className=""></Col>
					<Col md="6" className="text-right search-user-block mb-3">
						{AddAccessibility && <button
							type="button" className={'user-btn mr5'} title="Add" onClick={props.mappingToggler}>							<div className={'plus mr-0'}></div>
						</button>}
						<button type="button" className="user-btn" title="Reset Grid" onClick={() => levelMappingResetState()}>
							<div className="refresh mr-0"></div>
						</button>
					</Col>
				</Row>
				<Row className="levellisting-page">
					<Col className="level-table" md="12">
						<div className={`ag-grid-wrapper height-width-wrapper ${state.tableData && state.tableData?.length <= 0 ? "overlay-contain" : ""}`}>
							<div className="ag-grid-header">
								<input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => levelMappingFilterHandler(e)} />
							</div>
							<div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
								{!state.isLoader && <AgGridReact
									defaultColDef={defaultColDef}
									floatingFilter={true}
									domLayout='autoHeight'
									// columnDefs={c}
									rowData={state.tableData}
									pagination={true}
									ref={agGrid1}
									paginationPageSize={defaultPageSize}
									onGridReady={onGridReady}
									gridOptions={gridOptions}
									loadingOverlayComponent={'customLoadingOverlay'}
									noRowsOverlayComponent={'customNoRowsOverlay'}
									noRowsOverlayComponentParams={{
										title: EMPTY_DATA,
										imagClass: 'imagClass'
									}}
									frameworkComponents={frameworkComponents}
								>
									{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
									<AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
									<AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
									<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
									<AgGridColumn field="TechnologyId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
								</AgGridReact>
								}
								{<PaginationWrapper gridApi={state.gridApi} setPage={levelMappingPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
							</div>
						</div>
					</Col>
				</Row>
			</div>
			<div className='p-relative'>
				{state.isLoader && <LoaderCustom />}
				<Row className="levellisting-page mt20">
					<Col md="12">
						<h2 className="manage-level-heading">{`Simulation Level Mapping`}</h2>
					</Col>
				</Row>
				<Row className="levellisting-page">
					<Col md="6" className=""></Col>
					<Col md="6" className="text-right search-user-block mb-3">
						{/* <Button
                        id="Simulation_resetButton"
						type="button"
						title="Reset Grid"
                        onClick={(e) => simulationResetState()}}
                       className="user-btn"
                        
                      /> */}
						<button type="button" className="user-btn" title="Reset Grid" onClick={() => simulationResetState()}>
							<div className="refresh mr-0"></div>
						</button>
					</Col>
				</Row>

				<Row className="levellisting-page">
					<Col className="level-table" md="12 ">
						<div className={`ag-grid-wrapper height-width-wrapper ${simulationLevelDataList && simulationLevelDataList?.length <= 0 ? "overlay-contain" : ""}`}>
							<div className="ag-grid-header">
								<input type="text" className="form-control table-search" id="filter-text-box-simulation" placeholder="Search" autoComplete={'off'} onChange={(e) => simulationFilterHandler(e)} />
							</div>
							<div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
								{!state.isLoader &&<AgGridReact
									defaultColDef={defaultColDef}
									domLayout='autoHeight'
									// columnDefs={c}
									rowData={simulationLevelDataList}
									pagination={true}
									paginationPageSize={defaultPageSize}
									ref={agGrid2}
									onGridReady={onGridReady}
									gridOptions={gridOptions}
									loadingOverlayComponent={'customLoadingOverlay'}
									noRowsOverlayComponent={'customNoRowsOverlay'}
									noRowsOverlayComponentParams={{
										title: EMPTY_DATA,
										imagClass: 'imagClass'
									}}
									frameworkComponents={frameworkComponents}
								>
									{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
									<AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
									<AgGridColumn field="Technology" headerName="Heads"></AgGridColumn>
									<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
									<AgGridColumn field="TechnologyId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'simulationButtonFormatter'}></AgGridColumn>
								</AgGridReact>}
								{<PaginationWrapper gridApi={state.gridApi} setPage={simulationPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
							</div>
						</div>
					</Col>
				</Row>
			</div>
			{
				getConfigurationKey().IsMasterApprovalAppliedConfigure &&
				<>
					<div className='p-relative'>
						{state.isLoader && <LoaderCustom />}
						<Row className="levellisting-page mt20">
							<Col md="12">
								<h2 className="manage-level-heading">{`Master Level Mapping`}</h2>
							</Col>
						</Row>
						<Row className="levellisting-page">
							<Col md="6" className=""></Col>
							<Col md="6" className="text-right search-user-block mb-3">
								<button type="button" className="user-btn" title="Reset Grid" onClick={() => masterResetState()}>
									<div className="refresh mr-0"></div>
								</button>
							</Col>
						</Row>

						<Row className="levellisting-page">
							<Col className="level-table" md="12 ">
								<div className={`ag-grid-wrapper height-width-wrapper ${masterLevelDataList && masterLevelDataList?.length <= 0 ? "overlay-contain" : ""}`}>
									<div className="ag-grid-header">
										<input type="text" className="form-control table-search" id="filter-text-box-master" placeholder="Search" autoComplete={'off'} onChange={(e) => masterFilterHandler(e)} />
									</div>
									<div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
										{!state.isLoader &&<AgGridReact
											defaultColDef={defaultColDef}
											domLayout='autoHeight'
											// columnDefs={c}
											rowData={masterLevelDataList}
											pagination={true}
											ref={agGrid3}
											paginationPageSize={defaultPageSize}
											onGridReady={onGridReady}
											gridOptions={gridOptions}
											loadingOverlayComponent={'customLoadingOverlay'}
											noRowsOverlayComponent={'customNoRowsOverlay'}
											noRowsOverlayComponentParams={{
												title: EMPTY_DATA,
												imagClass: 'imagClass'
											}}
											frameworkComponents={frameworkComponents}
										>
											{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
											<AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
											<AgGridColumn field="Master" headerName="Master"></AgGridColumn>
											<AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
											<AgGridColumn field="MasterId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'masterButtonFormatter'}></AgGridColumn>
										</AgGridReact>}
										{<PaginationWrapper gridApi={state.gridApi} setPage={masterPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
									</div>
								</div>

								{
									state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.LEVEL_DELETE_ALERT}`} />
								}
							</Col>
						</Row>
					</div>
				</>
			}
		</>
	);
};

export default LevelTechnologyListing;