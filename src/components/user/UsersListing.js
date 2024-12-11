import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getAllUserDataAPI, getAllRoleAPI, activeInactiveUser } from '../../actions/auth/AuthActions';
import $ from 'jquery';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA, RFQUSER } from '../../config/constants';
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
import ScrollToTop from '../common/ScrollToTop';
import Button from '../layout/Button';
import DayTime from '../common/DayTimeWrapper';
import TourWrapper from '../common/Tour/TourWrapper';
import { Steps } from '../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next'
import { hideMultipleColumnFromExcel } from '../../components/common/CommonFunctions';
import { useLabels } from '../../helper/core';
import { PaginationWrappers } from '../common/Pagination/PaginationWrappers';
import PaginationControls from '../common/Pagination/PaginationControls';
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../common/Pagination/paginationAction';
import WarningMessage from '../common/WarningMessage';
import { setSelectedRowForPagination } from '../simulation/actions/Simulation';
import { disabledClass } from '../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import _ from 'lodash';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const UsersListing = (props) => {
	const dispatch = useDispatch();
	const searchRef = useRef(null);
	const { t } = useTranslation("common")
	const { vendorLabel } = useLabels()
	const { selectedRowForPagination } = useSelector((state => state?.simulation))
	const { userDataList, rfqUserList, initialConfiguration, topAndLeftMenuData } = useSelector((state) => state?.auth);
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
	const [skip, setSkip] = useState(0);  // Starting record
	const [take, setTake] = useState(10); // Number of records per page
	const [totalRecordCount, setTotalRecordCount] = useState(0);
	const [floatingFilterData, setFloatingFilterData] = useState({ UserName: "", CreatedDate: "", ModifiedDate: "", RoleName: "", EmailAddress: "", FullName: "", Mobile: "", DepartmentName: "", CreatedBy: "", PhoneNumber: "", ModifiedBy: "" });
	const { globalTakes } = useSelector((state) => state?.pagination);
	const [disableFilter, setDisableFilter] = useState(true)
	const [filterModel, setFilterModel] = useState({});
	const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
	const [warningMessage, setWarningMessage] = useState(false)
	const [isReset, setIsReset] = useState(false);
	const [disableDownload, setDisableDownload] = useState(false)
	const { isSimulation } = props;
	useEffect(() => {
		getDataList(null, null, skip, take, floatingFilterData, true);
		if (props?.tabId === '1' || props?.tabId === '6') {
			const moduleName = 'Users';
			const pageType = props?.tabId === '1' ? USER : RFQUSER;

			if (topAndLeftMenuData) {
				const userMenu = topAndLeftMenuData?.find(el => el?.ModuleName === moduleName);
				const userPermissions = userMenu && userMenu?.Pages?.find(el => el?.PageName === pageType);
				const permissionData = userPermissions && userPermissions?.Actions && checkPermission(userPermissions?.Actions);

				if (permissionData) {
					setState(prevState => ({
						...prevState,
						AddAccessibility: permissionData?.Add || false,
						EditAccessibility: permissionData?.Edit || false,
						DeleteAccessibility: permissionData?.Delete || false,
						ActivateAccessibility: permissionData?.Activate || false,
					}));
				}
			}
		}

		dispatch(getAllRoleAPI((res) => {
			if (res && res?.data && res?.data?.DataList) {
				let Data = res?.data?.DataList;
				let obj = {}
				Data && Data?.map((el, i) => {
					obj[el?.RoleId] = el?.RoleName
					return null
				})
				setState((prevState) => ({ ...prevState, roleType: obj, }))
			}
		}))

	}, [isReset]);

	useEffect(() => {
		reactLocalStorage.setObject('selectedRow', {})
		if (!props.stopApiCallOnCancel) {
			return () => {
				dispatch(setSelectedRowForPagination([]))
				dispatch(resetStatePagination());

				reactLocalStorage.setObject('selectedRow', {})
			}
		}
	}, [])

	var filterParams = (fieldName) => ({
		date: "",
		inRangeInclusive: true,
		filterOptions: ['equals', 'inRange'],
		comparator: function (filterLocalDateAtMidnight, cellValue) {

			if (!cellValue || typeof cellValue !== 'string') {
				return -1;
			}

			var dateAsString = cellValue?.split(' ')[0];
			var newDate = filterLocalDateAtMidnight
				? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY')
				: '';
			setDate(newDate, fieldName);
			var dateParts = dateAsString?.split('/');
			if (dateParts?.length !== 3) {
				return -1;
			}

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
	});



	// Updated setDate function 
	var setDate = (date, fieldName) => {
		setFloatingFilterData((prevState) => ({
			...prevState,
			[fieldName]: date
		}));

		setTimeout(() => {
			let dateInputs = document.getElementsByClassName('ag-input-field-input');
			for (let i = 0; i < dateInputs?.length; i++) {
				if (dateInputs[i].type === 'radio') {
					dateInputs[i].click();
				}
			}
		}, 300);
	};



	/**
		  * @method toggleExtraData
		  * @description Handle specific module tour state to display lorem data
		  */
	const toggleExtraData = (showTour) => {
		setState((prevState) => ({ ...prevState, render: true }));
		setTimeout(() => {
			setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
		}, 100);

	}

	/**
		* @method getDataList
		* @description Get user list data
		*/

	const getDataList = (departmentId, roleId, skip, take, dataObj, isPagination) => {
		let data = {
			logged_in_user: loggedInUserId(),
			DepartmentId: departmentId,
			RoleId: roleId,
			userType: props?.RFQUser ? 'RFQ' : 'CIR',
			skip: skip,
			take: take,
			userName: dataObj?.UserName,
			name: dataObj.FullName,
			email: dataObj?.EmailAddress,
			mobileNo: dataObj?.Mobile,
			phone: dataObj?.PhoneNumber,
			company: dataObj?.DepartmentName,
			createdDate: dataObj?.CreatedDate,
			modifiedDate: dataObj?.ModifiedDate,
			createdBy: dataObj?.CreatedBy,
			role: dataObj?.RoleName,
			modifiedBy: dataObj?.ModifiedBy,
			isPagination: isPagination
		};


		setState((prevState) => ({ ...prevState, isLoader: true }));

		dispatch(getAllUserDataAPI(data, res => {
			setState((prevState) => ({ ...prevState, isLoader: false }));
			let isReset = true;
			Object.keys(floatingFilterData).forEach((prop) => {
				if (floatingFilterData[prop] !== "") {
					isReset = false;
				}
			});

			setTimeout(() => {
				if (isReset) {
					gridOptions?.api?.setFilterModel({});
				} else {
					gridOptions?.api?.setFilterModel(filterModel);
				}
			}, 300);

			if (res.status === 204 && res?.data === '') {
				setTotalRecordCount(0)
				dispatch(updatePageNumber(0))
				setState((prevState) => ({ ...prevState, noData: true, userData: [], dataCount: 0 }));
			} else if (res && res?.data && res?.data?.DataList) {
				let Data = res?.data?.DataList;
				setTotalRecordCount(Data[0]?.TotalRecordCount);
				setWarningMessage(false);
				setIsFilterButtonClicked(false);
				setState((prevState) => ({ ...prevState, userData: Data }));

				setTimeout(() => {
					setWarningMessage(false)
				}, 330);
				setTimeout(() => {
					setIsFilterButtonClicked(false)
				}, 600);
				if (res && isPagination === false) {
					setDisableDownload(false)
					setTimeout(() => {
						dispatch(disabledClass(false))
						let button = document.getElementById('Excel-Downloads-userListing')
						button && button.click()
					}, 500);
				}
			}
		}));
	};

	const onSearch = () => {
		setState(prevState => ({
			...prevState, noData: false
		}))
		setWarningMessage(false)
		setIsFilterButtonClicked(true)
		dispatch(updatePageNumber(1))
		dispatch(updateCurrentRowIndex(10))
		gridOptions?.columnApi?.resetColumnState();
		getDataList(null, null, skip, globalTakes, floatingFilterData, true);
	}


	const onFloatingFilterChanged = (value) => {
		setTimeout(() => {
			if (state?.userData?.length !== 0) {
				setState((prevState) => ({
					...prevState,
					noData: searchNocontentFilter(value, state?.noData),
				}));
			}
		}, 500);
		setDisableFilter(false);
		const model = gridOptions?.api?.getFilterModel();
		setFilterModel(model);
		if (!isFilterButtonClicked) {
			setWarningMessage(true);
		}

		if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
			let isFilterEmpty = true;
			if (model && Object.keys(model)?.length > 0) {
				isFilterEmpty = false;
				setFloatingFilterData((prevData) => ({
					...prevData,
					[value.column.colId]: "",
				}));
			}

			if (isFilterEmpty) {
				setWarningMessage(false);
				setFloatingFilterData((prevData) =>
					Object.keys(prevData).reduce((acc, key) => {
						acc[key] = "";
						return acc;
					}, {})
				);
			}
		} else {
			if (value?.column?.colId === "ModifiedDate" || value?.column?.colId === "CreatedDate") {
				return false;
			}

			setFloatingFilterData({
				...floatingFilterData,
				[value?.column?.colId]: value?.filterInstance?.appliedModel?.filter
			});
		}
	};

	const onRowSelect = () => {
		const selectedRows = state.gridApi?.getSelectedRows();
		let selectedRowForPagination = reactLocalStorage.getObject('selectedRow')?.selectedRow || [];

		const allNodes = [];
		state.gridApi?.forEachNode(node => allNodes?.push(node));

		allNodes.forEach(node => {
			const rowData = node.data;

			if (node.isSelected()) {
				if (!selectedRowForPagination?.some(existingRow => existingRow.UserId === rowData.UserId)) {
					selectedRowForPagination?.push(rowData);
				}
			} else {
				const indexToRemove = selectedRowForPagination?.findIndex(existingRow => existingRow?.UserId === rowData?.UserId);
				if (indexToRemove !== -1) {
					selectedRowForPagination?.splice(indexToRemove, 1);
				}
			}
		});

		const uniqueSelectedRows = _.uniqBy(selectedRowForPagination, "UserId");
		reactLocalStorage.setObject('selectedRow', { selectedRow: uniqueSelectedRows });

		setState((prevState) => ({
			...prevState,
			dataCount: uniqueSelectedRows?.length,
		}));
		dispatch(setSelectedRowForPagination(uniqueSelectedRows));
	};

	const onBtExport = () => {
		let tempArr = [];
		tempArr = selectedRowForPagination
		if (tempArr?.length === 0) {
			tempArr = props?.RFQUser ? rfqUserList : userDataList;
		}

		if (tempArr && tempArr?.length > 0) {
			return returnExcelColumn(USER_LISTING_DOWNLOAD_EXCEl, tempArr);
		} else {
			return null;
		}
	};

	const onExcelDownload = () => {
		setDisableDownload(true)
		dispatch(disabledClass(true))
		let tempArr = selectedRowForPagination
		if (tempArr?.length > 0) {
			setTimeout(() => {
				setDisableDownload(false)
				dispatch(disabledClass(false))
				let button = document.getElementById('Excel-Downloads-userListing')
				button && button.click()
			}, 400);


		} else {
			getDataList(null, null, skip, globalTakes, floatingFilterData, false);
		}

	}

	const modifyDate = (TempData) => {
		TempData = TempData?.map(item => {
			if (item?.CreatedDate?.includes('T')) {
				item.CreatedDate = DayTime(item?.CreatedDate).format('DD/MM/YYYY HH:mm:ss');
			}
			if (item?.ModifiedDate?.includes('T')) {
				item.ModifiedDate = DayTime(item?.ModifiedDate).format('DD/MM/YYYY HH:mm:ss');
			}
			return item;
		});
	}

	const returnExcelColumn = (data = [], TempData) => {
		if (!TempData || TempData?.length === 0) {
			return null;
		}

		let filteredData = [...data];

		if (TempData != null && (TempData === userDataList || TempData?.length > 0)) {
			if (!props?.RFQUser) {
				filteredData = hideMultipleColumnFromExcel(data, ["PointOfContact", "VendorName", "CreatedDate", "ModifiedDate"]);
			} else {
				filteredData = hideMultipleColumnFromExcel(data, ["CreatedDateExcel", "ModifiedDateExcel"]);
			}
			modifyDate(TempData);
		}

		return (
			<ExcelSheet data={TempData} name="UserListing">
				{filteredData && filteredData?.map((ele, index) => (
					<ExcelColumn key={index} label={ele?.label} value={ele?.value} style={ele?.style} />
				))}
			</ExcelSheet>
		);
	};


	/**
		* @method editItemDetails
		* @description confirm edit item
		*/
	const editItemDetails = (Id, passwordFlag = false) => {
		let data = { isEditFlag: true, UserId: Id, passwordFlag: passwordFlag, RFQUser: props?.RFQUser }
		closeUserDetails()
		props.getUserDetail(data)
	}

	const onPopupConfirm = () => {
		let data = { Id: state?.row?.UserId, ModifiedBy: loggedInUserId(), IsActive: !state?.cell, }
		dispatch(activeInactiveUser(data, (res) => {
			if (res && res?.data && res?.data?.Result) {
				if (Boolean(state?.cell) === true) {
					Toaster.success(MESSAGES?.USER_INACTIVE_SUCCESSFULLY)
				} else {
					Toaster.success(MESSAGES?.USER_ACTIVE_SUCCESSFULLY)
				}
				getDataList(null, null, skip, take, floatingFilterData, true);
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
		const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
		const rowData = props?.valueFormatted ? props?.valueFormatted : props?.data;
		const { EditAccessibility } = state;
		if (rowData?.UserId === loggedInUserId()) return null;
		return (
			<div className="">
				{EditAccessibility && <Button id={`userListing_edit${props?.rowIndex}`} className={"Edit Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(rowData?.UserId, false)} title={"Edit"} />}
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
		if (rowData?.UserId === loggedInUserId()) return null;
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



	const onFilterTextBoxChanged = (e) => {
		const filterValue = e?.target?.value || "";
		state?.gridApi.setQuickFilter(filterValue);
	}


	const resetState = () => {

		setState(prevState => ({
			...prevState,
			dataCount: 0,
			noData: false // Reset no data state
		}));
		setIsFilterButtonClicked(false);
		gridOptions?.columnApi?.resetColumnState(null);
		gridOptions?.api?.setFilterModel(null);

		for (let prop in floatingFilterData) {
			floatingFilterData[prop] = "";
		}

		setFloatingFilterData(floatingFilterData)
		setWarningMessage(false);
		dispatch(updatePageNumber(1))
		setDisableFilter(true);
		getDataList(null, null, 0, 10, floatingFilterData, true);
		dispatch(updateCurrentRowIndex(10))
		dispatch(setSelectedRowForPagination([]))
		dispatch(updateGlobalTake(10))
		reactLocalStorage.remove('selectedRow');
		dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))
		dispatch(resetStatePagination());
		if (isSimulation) {
			props.isReset()
		}

	};

	const renderRowData = () => {
		if (props?.RFQUser) {
			return state?.showExtraData ? [...setLoremIpsum(rfqUserList[0]), ...rfqUserList] : rfqUserList;
		} else {
			if (state?.showExtraData && userDataList && userDataList?.length > 0) {
				return [...setLoremIpsum(userDataList[0]), ...userDataList];
			} else {
				return userDataList;
			}
		}
	}

	const checkBoxRenderer = (props) => {
		let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
		const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
		if (selectedRowForPagination?.length > 0) {
			selectedRowForPagination.map((item) => {
				if (item.UserId === props?.node?.data?.UserId) {
					props.node.setSelected(true)
				}
				return null
			})
			return cellValue
		} else {
			return cellValue
		}
	}

	const onGridReady = (params) => {
		setState((prevState) => ({ ...prevState, gridApi: params?.api, gridColumnApi: params?.columnApi }))
		params.api.paginationGoToPage(0);
		window.screen.width >= 1920 && params.api.sizeColumnsToFit()
	};

	const { EditAccessibility, AddAccessibility, noData } = state;
	const isFirstColumn = (params) => {
		var displayedColumns = params?.columnApi.getAllDisplayedColumns();
		var thisIsFirstColumn = displayedColumns[0] === params?.column;
		return thisIsFirstColumn;
	}

	const defaultColDef = {
		resizable: true,
		filter: true,
		sortable: false,
		headerCheckboxSelection: (isSimulation || props?.benchMark) ? isFirstColumn : false,
		headerCheckboxSelectionFilteredOnly: true,
		checkboxSelection: isFirstColumn
	};

	const frameworkComponents = {
		totalValueRenderer: buttonFormatter,
		customNoRowsOverlay: NoContentFound,
		statusButtonFormatter: statusButtonFormatter,
		hyphenFormatter: hyphenFormatter,
		linkableFormatter: linkableFormatter,
		dateRenderer: dateRenderer,
		checkBoxRenderer: checkBoxRenderer,
	};

	return (
		<div className={"ag-grid-react custom-pagination"} id={'userlist-go-to-top'}>
			<ScrollToTop pointProp={"userlist-go-to-top"} />
			<>
				<form noValidate>
					<Row className="pt-4">
						<Col md="6" className="search-user-block mb-3">
							<div className="d-flex justify-content-end bd-highlight w100">
								{warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}

								<div>
									<Button
										id="userListing_filter"
										className={"mr5 Tour_List_Filter"}
										onClick={() => onSearch()}
										title={"Filtered data"}
										icon={"filter"}
										disabled={disableFilter}
									/>
									<Button
										className="mr5 Tour_List_Download"
										id={"userListing_excel_download"}
										onClick={onExcelDownload}
										title={`Download ${state?.dataCount === 0 ? "All" : `(${state?.dataCount})`}`}
										icon={"download mr-1"}
										buttonName={`${state?.dataCount === 0 ? "All" : `(${state?.dataCount})`}`}
									/>

									<ExcelFile
										filename={`${props?.RFQUser ? 'RFQ User Listing' : 'User Listing'}`}
										fileExtension={'.xls'}
										element={<Button id={"Excel-Downloads-userListing"} className="p-absolute" onClick={onBtExport} />}
									>
										{onBtExport()}
									</ExcelFile>
									<Button id="userListing_add" className={"mr5 Tour_List_Add "} onClick={formToggle} title={"Add"} icon={"plus"} />
								</div>

								<Button id={"userListing_refresh"} className="user-btn Tour_List_Reset" onClick={resetState} title={"Reset Grid"} icon={"refresh"} />
							</div>
						</Col>
					</Row>
				</form>
				{state?.isLoader ? <LoaderCustom customClass="loader-center" /> : <div className={`ag-grid-wrapper height-width-wrapper ${(userDataList && userDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
					<div className="ag-grid-header">

						<input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
						<TourWrapper
							buttonSpecificProp={{ id: "User_listing_Tour", onClick: toggleExtraData }}
							stepsSpecificProp={{
								steps: Steps(t, { viewUserDetails: true, filterButton: false, bulkUpload: false, addLimit: false, viewButton: false, DeleteButton: false, costMovementButton: false, copyButton: false, viewBOM: false, updateAssociatedTechnology: false, addAssociation: false, addMaterial: false, generateReport: false, approve: false, reject: false, }).COMMON_LISTING
							}} />
					</div>
					<div className={`ag-theme-material ${state?.isLoader && "max-loader-height"}`}>
						{noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
						<AgGridReact
							defaultColDef={defaultColDef}
							floatingFilter={true}
							domLayout='autoHeight'
							// columnDefs={c}
							rowData={renderRowData()}
							pagination={true}
							paginationPageSize={globalTakes}
							onGridReady={onGridReady}
							gridOptions={gridOptions}
							noRowsOverlayComponent={'customNoRowsOverlay'}
							noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
							frameworkComponents={frameworkComponents}
							enableBrowserTooltips={true}
							onSelectionChanged={onRowSelect}
							onFilterModified={onFloatingFilterChanged}
							rowSelection={'multiple'}
							suppressRowClickSelection={true}
						>
							{/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
							<AgGridColumn field="FullName" headerName="Name" cellRenderer={'linkableFormatter'}></AgGridColumn>
							{initialConfiguration && !initialConfiguration?.IsLoginEmailConfigure ? (
								<AgGridColumn field="UserName" headerName="User Name" cellRenderer={checkBoxRenderer}  ></AgGridColumn>
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
							<AgGridColumn field="CreatedDate" width={props?.RFQUser ? 220 : ''} headerName="Created Date (Created Time)" cellRenderer={'dateRenderer'} filter="agDateColumnFilter" filterParams={filterParams("CreatedDate")}></AgGridColumn>
							<AgGridColumn field="ModifiedDate" width={props?.RFQUser ? 220 : ''} headerName="Modified Date (Modified Time)" cellRenderer={'dateRenderer'} filter="agDateColumnFilter" filterParams={filterParams("ModifiedDate")}></AgGridColumn>
							<AgGridColumn field="ModifiedBy" headerName="Modified By" cellRenderer={'hyphenFormatter'}></AgGridColumn>
							<AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
							<AgGridColumn pinned="right" field="IsActive" width={120} headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
							<AgGridColumn field="RoleName" width={120} cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
						</AgGridReact>
						<div className='button-wrapper'>
							{<PaginationWrappers gridApi={state?.gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="User" />}
							<PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="User" />
						</div>

					</div>
				</div>}

				{state?.isOpen && (<ViewUserDetails UserId={state?.UserId} isOpen={state?.isOpen} editItemDetails={editItemDetails} closeUserDetails={closeUserDetails} EditAccessibility={EditAccessibility} anchor={"right"} IsLoginEmailConfigure={initialConfiguration.IsLoginEmailConfigure} RFQUser={props?.RFQUser} />)}

			</>
			{state?.showPopup && <PopupMsgWrapper isOpen={state?.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${state?.cell ? MESSAGES?.USER_DEACTIVE_ALERT : MESSAGES?.USER_ACTIVE_ALERT}`} />}

		</div >
	);
};

export default UsersListing
