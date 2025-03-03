import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI, getUsersByTechnologyAndLevel } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import { getConfigurationKey } from '../../helper/auth';
import { checkPermission, searchNocontentFilter } from '../../helper/util';
import { LEVELS } from '../../config/constants';
import ImpactDrawer from './ImpactDrawer';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { PaginationWrapper } from '../common/commonPagination';
import ScrollToTop from '../common/ScrollToTop';
import Button from '../layout/Button';
import ManageLevelTabs from './LevelListingIndex';

export const ApplyPermission = React.createContext();
const gridOptions = {};

/*************************************THIS FILE IS FOR SHOWING LEVEL LISTING ****************************************/

const LevelsListing = (props) => {
	const [state, setState] = useState({
		isEditFlag: false,
		tableData: [],
		isShowForm: false,
		isShowMappingForm: false,
		AddAccessibility: false,
		EditAccessibility: false,
		DeleteAccessibility: false,
		showImpact: false,
		idForImpact: '',
		levelType: '',
		gridApi: null,
		gridColumnApi: null,
		rowData: null,
		sideBar: { toolPanels: ['columns'] },
		showData: false,
		showPopup: false,
		deletedId: '',
		cellData: {},
		cellValue: '',
		showPopupToggle: false,
		isLoader: false,
		updateApi: false,
		cancelButton: false,
		noData: false,
		approvalTypeId: '',
		levelValue: "",
		pageSize1: 5,
        pageSize2: 15,
        pageSize3: 25,
        globalTake: 5
	});
	const [permissionData, setPermissionData] = useState({});
	const dispatch = useDispatch();
	const { usersListByTechnologyAndLevel, topAndLeftMenuData } = useSelector(state => state.auth)
	const child = useRef();
	const searchRef = useRef(null);

	useEffect(() => {
		setState(prevState => ({ ...prevState, isLoader: true }));

		if (topAndLeftMenuData !== undefined) {
			const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
			const accessData = userMenu && userMenu.Pages.find(el => el.PageName === LEVELS)
			const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions);
			if (permmisionData !== undefined) {
				setPermissionData(permmisionData);
				setState(prevState => ({
					...prevState,
					AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
					EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
					DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
				}));
			}
		}

		// Move the loader state update after the API call
		dispatch(getUsersByTechnologyAndLevel(() => {
			setState(prevState => ({ ...prevState, isLoader: false }));
		}));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


	const getLevelsListData = () => {
		setState(prevState => ({ ...prevState, isLoader: true }));
		dispatch(getAllLevelAPI(res => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				setState(prevState => ({ ...prevState, tableData: Data, isLoader: false }));
			}
		}));
	};

	/**
	* @method getUpdatedData
	* @description get updated data after updatesuccess
	*/
	const getUpdatedData = () => {
		getLevelsListData();
	};

	const mappingToggler = () => {
		setState(prevState => ({ ...prevState, isShowMappingForm: true, isOpen: true, isShowForm: false, }));
	};
	/**
	   * @method closeDrawer
	   * @description  used to cancel filter form
	   */
	const closeDrawer = (e = '', levelValue = "") => {

		setState(prevState => ({
			...prevState, isOpen: false,
			isShowMappingForm: false,
			isShowForm: false,
			isEditFlag: false,
			updateApi: !prevState.updateApi,
			cancelButton: e === 'cancel' ? true : false,
			levelValue: levelValue
		}));
	};

	/**
	 * @method getLevelMappingDetail
	 * @description confirm edit item
	 */
	const getLevelMappingDetail = (Id, levelType, approvalTypeId) => {
		let obj = {}
		obj[levelType] = approvalTypeId
		setState(prevState => ({ ...prevState, isEditFlag: true, TechnologyId: Id, isOpen: true, isShowForm: false, isShowMappingForm: true, levelType: levelType, approvalTypeId: obj }));
	};

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	const editItemDetails = (cell, Id) => {
		setState(prevState => ({ ...prevState, idForImpact: Id, showImpact: true, isShowMappingForm: false, }));
	};

	const closeImpactDrawer = (e = '', ImpactValue = '') => {
		const { idForImpact, tableData } = state;

		let tempData = tableData[idForImpact];
		tempData = { ...tempData, Condition: ImpactValue };
		let gridTempArr = Object.assign([...tableData], { [idForImpact]: tempData });

		setState(prevState => ({ ...prevState, tableData: gridTempArr, isShowForm: false, showImpact: false }), () => {
			getUpdatedData();
			child.current.getUpdatedData();
		});
	};

	/**
	* @method confirmDeleteItem
	* @description confirm delete level item
	*/
	const confirmDeleteItem = (LevelId) => {
		dispatch(deleteUserLevelAPI(LevelId, (res) => {
			if (res.data.Result === true) {
				Toaster.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
				getLevelsListData();
			}
		}));
		setState(prevState => ({ ...prevState, showPopup: false }));
	};

	const onPopupConfirm = () => {
		confirmDeleteItem(state.deletedId);
	};

	const closePopUp = () => {
		setState(prevState => ({ ...prevState, showPopup: false }));
	};



	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	const buttonFormatter = (cell, row, enumObject, rowIndex) => {
		const { EditAccessibility } = state;
		return (
			<>
				{EditAccessibility && <Button id={`levelListing_edit${props.rowIndex}`} className={"Edit mr-2"} variant="Edit" onClick={() => editItemDetails(cell, rowIndex)} title={"Edit"} />}
			</>
		);
	};



	const onGridReady = (params) => {
		state.gridApi = params.api;
		state.gridApi.sizeColumnsToFit();
		setState(prevState => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }));
		params.api.paginationGoToPage(0);
	};

	const onPageSizeChanged = (newPageSize) => {
		state.gridApi.paginationSetPageSize(Number(newPageSize));
		setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
	};

	const onFilterTextBoxChanged = (e) => {
		state.gridApi.setQuickFilter(e.target.value)
	};

	const resetState = () => {
		state.gridApi.setQuickFilter(null)
		gridOptions.columnApi.resetColumnState();
		gridOptions.api.setFilterModel(null);
		state.gridApi.sizeColumnsToFit();
		if (searchRef.current) {
			searchRef.current.value = '';
		}
		setState((prevState) => ({ ...prevState, globalTake: 5 }));
		getUpdatedData();
	};
	const { isEditFlag, isShowForm, isShowMappingForm, isOpen, TechnologyId,
		showImpact, noData } = state;


	const defaultColDef = {
		resizable: true, filter: true, sortable: false,
	};

	const frameworkComponents = {
		totalValueRenderer: buttonFormatter,
		customNoRowsOverlay: NoContentFound
	};
	return (
		<div className={"levellisting-page-main"} id={'level-go-to-top'}>
			<ScrollToTop pointProp={"level-go-to-top"} />
			<div className={"ag-grid-react"}>
				<>
					{state.isLoader && <LoaderCustom />}
					<form className="levellisting-page">
						<ApplyPermission.Provider value={permissionData}>
							<Row className="pt-4">
								<Col md="12">
									<ManageLevelTabs onRef={ref => (child.current = ref)} mappingToggler={mappingToggler} getLevelMappingDetail={getLevelMappingDetail} cancelButton={state.cancelButton} levelValue={state.levelValue} permissionData={permissionData} />
								</Col>
							</Row>
						</ApplyPermission.Provider>
						<Row className="pt-4">
							<Col md="12">
								<Row>
									<Col md="12">
										<h2 className="manage-level-heading">{`Levels`}</h2>
									</Col>
								</Row>
								<Row>
									<Col md="6" className=""></Col>
									<Col md="6" className="search-user-block mb-3 text-right">
										<Button id={"levelListing_refresh"} className="user-btn" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
									</Col>
								</Row>
								<Row>
									<Col className="mt-0 level-table" md="12">

										<div className={`ag-grid-wrapper height-width-wrapper ${(usersListByTechnologyAndLevel && usersListByTechnologyAndLevel?.length <= 0) || noData ? "overlay-contain" : ""}`}>
											<div className="ag-grid-header">
												<input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box-levels" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
											</div>
											<div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
												{noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
												{!state.isLoader && <AgGridReact
													defaultColDef={defaultColDef}
													floatingFilter={true}
													domLayout='autoHeight'
													// columnDefs={c}
													rowData={usersListByTechnologyAndLevel}
													pagination={true}
													paginationPageSize={5}
													onGridReady={onGridReady}
													gridOptions={gridOptions}
													noRowsOverlayComponent={'customNoRowsOverlay'}
													onFilterModified={(e) => {
														setTimeout(() => {
															setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(e) }));
														}, 500);
													}}
													noRowsOverlayComponentParams={{ title: EMPTY_DATA, }}
													frameworkComponents={frameworkComponents}
													enableBrowserTooltips={true}
												>
													{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
													<AgGridColumn width="40" field="ApprovalType" headerName="Approval Type"></AgGridColumn>
													<AgGridColumn width="35" field="Module" headerName="Module"></AgGridColumn>
													<AgGridColumn width="65" field="Technology" headerName={`Technology/Heads${getConfigurationKey().IsMasterApprovalAppliedConfigure ? '/Masters' : ''}`}></AgGridColumn>
													<AgGridColumn width="35" field="Level" headerName="Level"></AgGridColumn>
													<AgGridColumn field="Users" tooltipField="Users" headerName="Users"></AgGridColumn>
												</AgGridReact>}
												{<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} pageSize1={state.pageSize1} pageSize2={state.pageSize2} pageSize3={state.pageSize3} globalTake={state.globalTake} />}
											</div>
										</div>


									</Col>
								</Row>
							</Col>

						</Row>

						{/* {isOpen && (<Level isOpen={isOpen} isShowForm={isShowForm} isShowMappingForm={isShowMappingForm} closeDrawer={closeDrawer} isEditFlag={isEditFlag} TechnologyId={TechnologyId} anchor={'right'} isEditedlevelType={state.levelType} approvalTypeId={state.approvalTypeId} levelValue={state.level} />)} */}
						{showImpact && (<ImpactDrawer isOpen={showImpact} isShowForm={isShowForm} isShowMappingForm={isShowMappingForm} closeDrawer={closeImpactDrawer} anchor={'right'} />)}
					</form>
				</>
			</div>
			{state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.LEVEL_DELETE_ALERT}`} />}
		</div>
	);

}
export default LevelsListing


