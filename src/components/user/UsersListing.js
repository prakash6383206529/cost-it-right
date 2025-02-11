import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getAllUserDataAPI, getAllRoleAPI, activeInactiveUser } from '../../actions/auth/AuthActions';
import $ from 'jquery';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { defaultPageSize, EMPTY_DATA, RFQUSER } from '../../config/constants';
import { USER } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import Switch from "react-switch";
import { IsSendQuotationToPointOfContact, handleDepartmentHeader, loggedInUserId } from '../../helper/auth';
import ViewUserDetails from './ViewUserDetails';
import { checkPermission, searchNocontentFilter, setLoremIpsum, showTitleForActiveToggle } from '../../helper/util';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import ReactExport from 'react-export-excel';
import { USER_LISTING_DOWNLOAD_EXCEl } from '../../config/masterData';
import { UserListing } from '../../config/constants';
import { PaginationWrapper } from '../common/commonPagination';
import ScrollToTop from '../common/ScrollToTop';
import Button from '../layout/Button';
import DayTime from '../common/DayTimeWrapper';
import TourWrapper from '../common/Tour/TourWrapper';
import { Steps } from '../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next'
import { hideMultipleColumnFromExcel } from '../../components/common/CommonFunctions';
import { useLabels } from '../../helper/core';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const UsersListing = (props) => {
	const dispatch = useDispatch();
	const searchRef = useRef(null);
	const { t } = useTranslation("common")
	const { vendorLabel } = useLabels()
	const { userDataList, rfqUserList, initialConfiguration, topAndLeftMenuData } = useSelector((state) => state.auth);
	const [state, setState] = useState({
		isEditFlag: false,
		shown: false,
		RoleId: '',
		userData: [],
		departmentType: {},
		roleType: {},
		department: [],
		role: [],
		UserId: '',
		isOpen: false,
		AddAccessibility: false,
		EditAccessibility: false,
		DeleteAccessibility: false,
		ActivateAccessibility: false,
		gridApi: null,
		gridColumnApi: null,
		rowData: null,
		showPopup: false,
		showPopup2: false,
		deletedId: '',
		cell: [],
		row: [],
		isLoader: false,
		noData: false,
		dataCount: 0,
		render: false,
		showExtraData: false
	});
	useEffect(() => {
		getUsersListData(null, null);
		if (props.tabId === '1') {
			if (topAndLeftMenuData !== undefined) {
				const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
				const userPermissions = userMenu && userMenu.Pages.find(el => el.PageName === USER);
				const permmisionData = userPermissions && userPermissions.Actions && checkPermission(userPermissions.Actions)
				if (permmisionData !== undefined) {
					setState((prevState) => ({
						...prevState,
						AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
						EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
						DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
						ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
					}))
				}
			}
		}
		if (props.tabId === '6') {
			if (topAndLeftMenuData !== undefined) {
				const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
				const userPermissions = userMenu && userMenu.Pages.find(el => el.PageName === RFQUSER);
				const permmisionData = userPermissions && userPermissions.Actions && checkPermission(userPermissions.Actions)
				if (permmisionData !== undefined) {
					setState((prevState) => ({
						...prevState,
						AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
						EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
						DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
						ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
					}))
				}
			}
		}

		// Get roles listing
		dispatch(getAllRoleAPI((res) => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				let obj = {}
				Data && Data.map((el, i) => {
					obj[el.RoleId] = el.RoleName
					return null
				})
				setState((prevState) => ({ ...prevState, roleType: obj, }))
			}
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps

	}, []);

	var filterParams = {
		date: "",
		comparator: function (filterLocalDateAtMidnight, cellValue) {
			var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
			var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
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
	/**
		  * @method toggleExtraData
		  * @description Handle specific module tour state to display lorem data
		  */
	const toggleExtraData = (showTour) => {
		// dispatch(TourStartAction({
		//   showExtraData: showTour,
		// }));
		setState((prevState) => ({ ...prevState, render: true }));
		setTimeout(() => {
			setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
		}, 100);

	}

	/**
		* @method getUsersListData
		* @description Get user list data
		*/
	const getUsersListData = (departmentId = null, roleId = null) => {
		let data = { logged_in_user: loggedInUserId(), DepartmentId: departmentId, RoleId: roleId, userType: props.RFQUser ? 'RFQ' : 'CIR' }
		setState((prevState) => ({ ...prevState, isLoader: true }))
		dispatch(getAllUserDataAPI(data, res => {
			setState((prevState) => ({ ...prevState, isLoader: false }))
			if (res.status === 204 && res.data === '') {
				setState((prevState) => ({ ...prevState, userData: [], }))
			} else if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				setState((prevState) => ({ ...prevState, userData: Data, }))
			} else {
			}
		}))
	}

	const onRowSelect = () => {
		const selectedRows = state.gridApi?.getSelectedRows()
		setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
	}

	const onBtExport = () => {
		let tempArr = state.gridApi?.getSelectedRows() || [];
		if (tempArr.length === 0) {
			tempArr = props.RFQUser ? rfqUserList : userDataList;
		}
		return returnExcelColumn(USER_LISTING_DOWNLOAD_EXCEl, tempArr)
	};

	const returnExcelColumn = (data = [], TempData) => {

		let filteredData = [...data];

		if (TempData != null && (TempData === userDataList || TempData.length > 0)) {
			if (!props.RFQUser) {

				filteredData = hideMultipleColumnFromExcel(data, ["PointOfContact", "VendorName", "CreatedDate", "ModifiedDate"]);
			}
			else {
				filteredData = hideMultipleColumnFromExcel(data, ["CreatedDateExcel", "ModifiedDateExcel"]);
				TempData = TempData.map(item => {
					if (item.CreatedDate?.includes('T')) {
						item.CreatedDate = DayTime(item.CreatedDate).format('DD/MM/YYYY HH:mm:ss');
					}
					if (item.ModifiedDate?.includes('T')) {
						item.ModifiedDate = DayTime(item.ModifiedDate).format('DD/MM/YYYY HH:mm:ss');
					}
					return item;
				});
			}
		}


		return (
			<ExcelSheet data={TempData} name={UserListing}>
				{filteredData && filteredData.map((ele, index) => <ExcelColumn key={index} label={(ele.label === "Department") ? `${handleDepartmentHeader()}` : ele.label} value={ele.value} style={ele.style} />)}
			</ExcelSheet>);
	}
	/**
		* @method editItemDetails
		* @description confirm edit item
		*/
	const editItemDetails = (Id, passwordFlag = false) => {
		let data = { isEditFlag: true, UserId: Id, passwordFlag: passwordFlag, RFQUser: props.RFQUser }
		closeUserDetails()
		props.getUserDetail(data)
	}
	const onPopupConfirm = () => {
		let data = { Id: state.row.UserId, ModifiedBy: loggedInUserId(), IsActive: !state.cell, }
		dispatch(activeInactiveUser(data, (res) => {
			if (res && res.data && res.data.Result) {
				if (Boolean(state.cell) === true) {
					Toaster.success(MESSAGES.USER_INACTIVE_SUCCESSFULLY)
				} else {
					Toaster.success(MESSAGES.USER_ACTIVE_SUCCESSFULLY)
				}
				getUsersListData(null, null);
				setState((prevState) => ({ ...prevState, dataCount: 0 }))
			}
		}))
		setState((prevState) => ({ ...prevState, showPopup: false }))
		setState((prevState) => ({ ...prevState, showPopup2: false }))

	}
	const closePopUp = () => {
		setState((prevState) => ({ ...prevState, showPopup: false }))
		setState((prevState) => ({ ...prevState, showPopup2: false }))
	}

	/**
		* @method buttonFormatter
		* @description Renders buttons
		*/
	const buttonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
		const { EditAccessibility } = state;
		if (rowData?.UserId === loggedInUserId()) return null;
		return (
			<div className="">
				{EditAccessibility && <Button id={`userListing_edit${props.rowIndex}`} className={"Edit Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(rowData?.UserId, false)} title={"Edit"} />}
			</div>
		)
	}
	/**
		* @method hyphenFormatter
		*/
	const hyphenFormatter = (props) => {
		const cellValue = props?.value;
		return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
	}

	const handleChange = (cell, row) => {
		setState((prevState) => ({ ...prevState, showPopup: true, row: row, cell: cell }))
	}
	/**
		* @method statusButtonFormatter
		* @description Renders buttons
		*/
	const statusButtonFormatter = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
		const { ActivateAccessibility } = state;
		if (rowData.UserId === loggedInUserId()) return null;
		showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive');
		return (
			<>
				<label htmlFor="normal-switch" className="normal-switch Tour_List_Status">
					<Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!ActivateAccessibility} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
				</label>
			</>
		)
	}

	/**
	* @method linkableFormatter
	* @description Renders Name link
	*/

	const linkableFormatter = (props) => {
		const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
		const row = props?.valueFormatted ? props.valueFormatted : props?.data;
		return (
			<><div id="view_details" onClick={() => viewDetails(row.UserId)} className={'link'}>{cell}</div></>
		)
	}

	const viewDetails = (UserId) => {
		$('html, body').animate({ scrollTop: 0 }, 'slow');
		setState((prevState) => ({ ...prevState, UserId: UserId, isOpen: true, }))

	}
	const dateRenderer = (props) => {
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		return cellValue != null ? cellValue : '';
	}

	const closeUserDetails = () => {
		setState((prevState) => ({ ...prevState, UserId: '', isOpen: false, }))
	}

	const formToggle = () => {
		props.formToggle(props?.RFQUser)
	}

	const onPageSizeChanged = (newPageSize) => {
		state.gridApi.paginationSetPageSize(Number(newPageSize));
	};

	const onFilterTextBoxChanged = (e) => {
		state.gridApi.setQuickFilter(e.target.value)

	}
	const resetState = () => {
		setState((prevState) => ({ ...prevState, noData: false }));
		state.gridApi.setQuickFilter(null)
		state.gridApi.deselectAll();
		gridOptions.columnApi.resetColumnState();
		gridOptions.api.setFilterModel(null);
		window.screen.width >= 1920 && state.gridApi.sizeColumnsToFit()
		if (searchRef.current) {
			searchRef.current.value = '';
		}
	}
	const renderRowData = () => {
		if (props?.RFQUser) {
			return state.showExtraData ? [...setLoremIpsum(rfqUserList[0]), ...rfqUserList] : rfqUserList;
		} else {
			if (state.showExtraData && userDataList && userDataList.length > 0) {
				return [...setLoremIpsum(userDataList[0]), ...userDataList];
			} else {
				return userDataList;
			}
		}
	}

	const onGridReady = (params) => {
		setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
		params.api.paginationGoToPage(0);
		//if resolution greater than 1920 table listing fit to 100%
		window.screen.width >= 1920 && params.api.sizeColumnsToFit()
		//if resolution greater than 1920 table listing fit to 100%
	};

	// rest of the component logic
	const { EditAccessibility, AddAccessibility, noData } = state;
	const isFirstColumn = (params) => {
		var displayedColumns = params.columnApi.getAllDisplayedColumns();
		var thisIsFirstColumn = displayedColumns[0] === params.column;
		return thisIsFirstColumn;
	}

	const defaultColDef = {
		resizable: true,
		filter: true,
		sortable: false,
		headerCheckboxSelectionFilteredOnly: true,
		checkboxSelection: isFirstColumn

	};

	const frameworkComponents = {
		totalValueRenderer: buttonFormatter,
		customNoRowsOverlay: NoContentFound,
		statusButtonFormatter: statusButtonFormatter,
		hyphenFormatter: hyphenFormatter,
		linkableFormatter: linkableFormatter,
		dateRenderer: dateRenderer
	};

	return (
		<div className={"ag-grid-react"} id={'userlist-go-to-top'}>
			<ScrollToTop pointProp={"userlist-go-to-top"} />
			<>
				<form noValidate>
					<Row className="pt-4">
						<Col md="6" className="search-user-block mb-3">
							<div className="d-flex justify-content-end bd-highlight w100">
								{AddAccessibility && (
									<div>
										<ExcelFile filename={`${props.RFQUser ? 'RFQ User Listing' : 'User Listing'}`} fileExtension={'.xls'} element={
											<Button id={"Excel-Downloads-userListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />}>
											{onBtExport()}
										</ExcelFile>
										<Button id="userListing_add" className={"mr5 Tour_List_Add "} onClick={formToggle} title={"Add"} icon={"plus"} />
									</div>
								)}
								<Button id={"userListing_refresh"} className="user-btn Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
							</div>
						</Col>
					</Row>
				</form>
				{state.isLoader ? <LoaderCustom customClass="loader-center" /> : <div className={`ag-grid-wrapper height-width-wrapper ${(userDataList && userDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
					<div className="ag-grid-header">
						<input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
						<TourWrapper
							buttonSpecificProp={{ id: "User_listing_Tour", onClick: toggleExtraData }}
							stepsSpecificProp={{
								steps: Steps(t, { viewUserDetails: true, filterButton: false, bulkUpload: false, addLimit: false, viewButton: false, DeleteButton: false, costMovementButton: false, copyButton: false, viewBOM: false, updateAssociatedTechnology: false, addAssociation: false, addMaterial: false, generateReport: false, approve: false, reject: false, }).COMMON_LISTING
							}} />
					</div>
					<div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
						{noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
						<AgGridReact
							defaultColDef={defaultColDef}
							floatingFilter={true}
							domLayout='autoHeight'
							// columnDefs={c}
							rowData={renderRowData()}

							pagination={true}
							paginationPageSize={defaultPageSize}
							onGridReady={onGridReady}
							gridOptions={gridOptions}
							noRowsOverlayComponent={'customNoRowsOverlay'}
							noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
							frameworkComponents={frameworkComponents}
							enableBrowserTooltips={true}
							onSelectionChanged={onRowSelect}
							onFilterModified={(e) => {
								setTimeout(() => {
									setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(e) }));
								}, 500);
							}}
							rowSelection={'multiple'}
							suppressRowClickSelection={true}
						>
							{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
							<AgGridColumn field="FullName" headerName="Name" cellRenderer={'linkableFormatter'}></AgGridColumn>
							{initialConfiguration && !initialConfiguration?.IsLoginEmailConfigure ? (
								<AgGridColumn field="UserName" headerName="User Name"></AgGridColumn>
							) : null}
							{props?.RFQUser && <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
							<AgGridColumn field="EmailAddress" headerName="Email Id"></AgGridColumn>
							<AgGridColumn field="Mobile" headerName="Mobile No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
							<AgGridColumn field="PhoneNumber" headerName="Phone No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
							{/* {getConfigurationKey().IsMultipleDepartmentAllowed && <AgGridColumn field="Departments" filter={true} cellRenderer='departmentFormatter' headerName="Company"></AgGridColumn>}
								{!getConfigurationKey().IsMultipleDepartmentAllowed && <AgGridColumn sort={true} field="DepartmentName" headerName="Company"></AgGridColumn>} */}
							<AgGridColumn field="DepartmentName" tooltipField="DepartmentName" headerName={`${handleDepartmentHeader()}`}></AgGridColumn>
							{/* //RE    */}

							{IsSendQuotationToPointOfContact() && props?.RFQUser && (<AgGridColumn field="PointOfContact" tooltipField="PointOfContact" headerName="Point of Contact" />
							)}
							<AgGridColumn field="CreatedBy" headerName="Created By" cellRenderer={'hyphenFormatter'}></AgGridColumn>
							<AgGridColumn field="CreatedDate" width={props?.RFQUser ? 220 : ''} headerName="Created Date (Created Time)" cellRenderer={'dateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
							<AgGridColumn field="ModifiedDate" width={props?.RFQUser ? 220 : ''} headerName="Modified Date (Modified Time)" cellRenderer={'dateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
							<AgGridColumn field="ModifiedBy" headerName="Modified By" cellRenderer={'hyphenFormatter'}></AgGridColumn>
							<AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
							<AgGridColumn pinned="right" field="IsActive" width={120} headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
							<AgGridColumn field="RoleName" width={120} cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
						</AgGridReact>
						{<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
					</div>
				</div>}

				{state.isOpen && (<ViewUserDetails UserId={state.UserId} isOpen={state.isOpen} editItemDetails={editItemDetails} closeUserDetails={closeUserDetails} EditAccessibility={EditAccessibility} anchor={"right"} IsLoginEmailConfigure={initialConfiguration?.IsLoginEmailConfigure} RFQUser={props.RFQUser} />)}

			</>
			{state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${state.cell ? MESSAGES.USER_DEACTIVE_ALERT : MESSAGES.USER_ACTIVE_ALERT}`} />}

		</div >
	);
};

export default UsersListing
