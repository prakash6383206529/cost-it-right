import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI, getLeftMenu, getUsersByTechnologyAndLevel } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import Switch from "react-switch";
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { loggedInUserId } from '../../helper/auth';
import { checkPermission } from '../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import LevelTechnologyListing from './LevelTechnologyListing';
import Level from './Level';
import { LEVELS } from '../../config/constants';
import { GridTotalFormate } from '../common/TableGridFunctions';
import ConfirmComponent from '../../helper/ConfirmComponent';
import { renderText } from '../layout/FormInputs';
import { Field, reduxForm } from 'redux-form';
import { focusOnError } from "../layout/FormInputs";
import ImpactDrawer from './ImpactDrawer';

/*************************************THIS FILE IS FOR SHOWING LEVEL LISTING ****************************************/

class LevelsListing extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isEditFlag: false,
			tableData: [],
			isShowForm: false,
			isShowMappingForm: false,
			AddAccessibility: false,
			EditAccessibility: false,
			DeleteAccessibility: false,

			showImpact: false,
			idForImpact: ''
		}
	}

	UNSAFE_componentWillMount() {
		let ModuleId = reactLocalStorage.get('ModuleId');
		this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
			const { leftMenuData } = this.props;
			if (leftMenuData !== undefined) {
				let Data = leftMenuData;
				const accessData = Data && Data.find(el => el.PageName === LEVELS)
				const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

				if (permmisionData !== undefined) {
					this.setState({
						AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
						EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
						DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
					})
				}
			}
		})
	}

	componentDidMount() {
		this.getLevelsListData();
		this.props.getUsersByTechnologyAndLevel(() => { })
		//this.props.onRef(this);
	}

	getLevelsListData = () => {
		this.props.getAllLevelAPI(res => {
			if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				this.setState({
					tableData: Data,
				})
			}
		});
	}

	/**
	* @method getUpdatedData
	* @description get updated data after updatesuccess
	*/
	getUpdatedData = () => {
		this.getLevelsListData()
	}

	mappingToggler = () => {
		this.setState({
			isShowMappingForm: true,
			isOpen: true,
			isShowForm: false,
		})
	}

	levelToggler = () => {
		this.setState({
			isShowForm: true,
			isOpen: true,
			isShowMappingForm: false,
		})
	}

	/**
	 * @method closeDrawer
	 * @description  used to cancel filter form
	 */
	closeDrawer = (e = '') => {
		this.setState({
			isOpen: false,
			isShowMappingForm: false,
			isShowForm: false,
			isEditFlag: false,
		}, () => {
			this.getUpdatedData()
			this.child.getUpdatedData();
		})
	}

	/**
	 * @method getLevelMappingDetail
	 * @description confirm edit item
	 */
	getLevelMappingDetail = (Id) => {
		this.setState({
			isEditFlag: true,
			LevelId: Id,
			isOpen: true,
			isShowForm: false,
			isShowMappingForm: true,
		})
	}

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	editItemDetails = (cell, Id) => {

		this.setState({
			// isEditFlag: true,
			// LevelId: Id,
			//isOpen: true,
			// isShowForm: true,
			idForImpact: Id,
			showImpact: true,
			isShowMappingForm: false,
		})
	}

	closeImpactDrawer = (e = '', ImpactValue = '') => {
		const { idForImpact, tableData } = this.state


		let tempData = tableData[idForImpact]

		tempData = {
			...tempData,
			Condition: ImpactValue
		}
		let gridTempArr = Object.assign([...tableData], { [idForImpact]: tempData })


		this.setState({
			// isOpen: false,
			// isShowMappingForm: false,
			tableData: gridTempArr,
			isShowForm: false,
			showImpact: false
			// isEditFlag: false,
		}, () => {
			this.getUpdatedData()
			this.child.getUpdatedData();
		})
	}
	/**
	* @method deleteItem
	* @description confirm delete level
	*/
	deleteItem = (Id) => {
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeleteItem(Id)
			},
			onCancel: () => { },
			component: () => <ConfirmComponent />
		};
		return toastr.confirm(`${MESSAGES.LEVEL_DELETE_ALERT}`, toastrConfirmOptions);
	}

	/**
	* @method confirmDeleteItem
	* @description confirm delete level item
	*/
	confirmDeleteItem = (LevelId) => {
		this.props.deleteUserLevelAPI(LevelId, (res) => {
			if (res.data.Result === true) {
				toastr.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
				this.getLevelsListData()
			}
		});
	}

	renderPaginationShowsTotal(start, to, total) {
		return <GridTotalFormate start={start} to={to} total={total} />
	}

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	buttonFormatter = (cell, row, enumObject, rowIndex) => {
		const { EditAccessibility, DeleteAccessibility } = this.state;
		return (
			<>
				{EditAccessibility && <button type={'button'} className="Edit mr-2" onClick={() => this.editItemDetails(cell, rowIndex)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}

	afterSearch = (searchText, result) => {

	}

	handleChange = (cell, row, enumObject, rowIndex) => {
		let data = {
			Id: row.LevelId,
			ModifiedBy: loggedInUserId(),
			IsActive: !cell, //Status of the user.
		}
		const toastrConfirmOptions = {
			onOk: () => {
				this.confirmDeactivateItem(data, cell)
			},
			onCancel: () => { },
			component: () => <ConfirmComponent />,
		};
		return toastr.confirm(`${cell ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`, toastrConfirmOptions);
	}

	confirmDeactivateItem = (data, cell) => {
		//   this.props.activeInactiveStatus(data, res => {
		//     if (res && res.data && res.data.Result) {
		//         // if (cell == true) {
		//         //     toastr.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
		//         // } else {
		//         //     toastr.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
		//         // }
		//         // this.getTableListData()
		//         this.filterList()
		//     }
		// })
	}

	/**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
	statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
		const { ActivateAccessibility } = this.props;
		// if (ActivateAccessibility) {
		return (
			<>
				<label htmlFor="normal-switch">
					{/* <span>Switch with default style</span> */}
					<Switch
						onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
						checked={cell}
						background="#ff6600"
						onColor="#4DC771"
						onHandleColor="#ffffff"
						offColor="#FC5774"
						id="normal-switch"
						height={24}
					/>
				</label>
			</>
		)
		// } else {
		// 	return (
		// 		<>
		// 			{
		// 				cell ?
		// 					<div className={'Activated'}> {'Active'}</div>
		// 					:
		// 					<div className={'Deactivated'}>{'Deactive'}</div>
		// 			}
		// 		</>
		// 	)
		// }
	}

	/**
   * @method TextFormatter
   * @description Renders buttons
   */
	TextFormatter = (cell, row, enumObject, rowIndex) => {
		// 
		// this.setState({
		// 	idForImpact: rowIndex
		// })
		return (
			<>
				{/* <input type="text" value={cell} name={rowIndex} /> */}
				<Field
					label=""
					name={`Condition${rowIndex}`}
					type="text"
					placeholder={'Enter'}
					//validate={[required, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength80]}
					component={renderText}
					//required={true}
					// maxLength={26}
					customClassName={'withBorder'}
				/>
			</>
		)
	}

	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { isEditFlag, isShowForm, isShowMappingForm, isOpen, LevelId,
			AddAccessibility, EditAccessibility, DeleteAccessibility, showImpact } = this.state;
		const options = {
			clearSearch: true,
			noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
			afterSearch: this.afterSearch,
			paginationShowsTotal: this.renderPaginationShowsTotal,
			prePage: <span className="prev-page-pg"></span>, // Previous page button text
			nextPage: <span className="next-page-pg"></span>, // Next page button text
			firstPage: <span className="first-page-pg"></span>, // First page button text
			lastPage: <span className="last-page-pg"></span>,
			pagination: true,
			sizePerPageList: [{
				text: '5', value: 5
			}, {
				text: '10', value: 10
			}],
			sizePerPage: 5,
		};
		return (
			<>
				<form className="levellisting-page">
					{this.props.loading && <Loader />}
					<Row className="pt-4">
						<Col md="12">
							<LevelTechnologyListing
								onRef={ref => (this.child = ref)}
								mappingToggler={this.mappingToggler}
								getLevelMappingDetail={this.getLevelMappingDetail}
								AddAccessibility={AddAccessibility}
								EditAccessibility={EditAccessibility}
								DeleteAccessibility={DeleteAccessibility}
							/>
						</Col>
					</Row>
					<Row className="pt-4">
						<Col md="12">
							<Row>
								<Col md="12">
									<h2 className="manage-level-heading">{`Levels`}</h2>
								</Col>

								<Col className="mt-0 level-table">
									<BootstrapTable
										data={this.props.usersListByTechnologyAndLevel}
										striped={false}
										bordered={false}
										hover={false}
										options={options}
										search
										ignoreSinglePage
										ref={'table'}
										trClassName={'userlisting-row'}
										tableHeaderClass={'my-custom-header'}
										pagination>
										<TableHeaderColumn  dataField="Technology" dataAlign="left">Technology</TableHeaderColumn>
										<TableHeaderColumn  dataField="Level" isKey={true} dataAlign="left" dataSort={true}>Level</TableHeaderColumn>
										<TableHeaderColumn dataField="Users" columnTitle={true} dataAlign="left">Users</TableHeaderColumn>
										{/* <TableHeaderColumn dataField="IsActive" dataAlign="left" dataFormat={this.statusButtonFormatter}>Conditional Approval</TableHeaderColumn>
										<TableHeaderColumn dataField="Condition" dataAlign="left" dataFormat={this.TextFormatter}>Condition</TableHeaderColumn>

										{/* <TableHeaderColumn dataField="Sequence" dataAlign="center" dataSort={true}>Sequence</TableHeaderColumn> */}
										{/* <TableHeaderColumn dataField="LevelId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>  */}
									</BootstrapTable>
								</Col>
							</Row>
						</Col>

					</Row>

					{isOpen && (
						<Level
							isOpen={isOpen}
							isShowForm={isShowForm}
							isShowMappingForm={isShowMappingForm}
							closeDrawer={this.closeDrawer}
							isEditFlag={isEditFlag}
							LevelId={LevelId}
							anchor={'right'}
						/>
					)}
					{showImpact && (
						<ImpactDrawer
							isOpen={showImpact}
							isShowForm={isShowForm}
							isShowMappingForm={isShowMappingForm}
							closeDrawer={this.closeImpactDrawer}
							//isEditFlag={isEditFlag}
							//LevelId={LevelId}
							anchor={'right'}
						/>
					)}
				</form>
			</>
		);
	}
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
	const { levelList, leftMenuData, loading, usersListByTechnologyAndLevel } = auth;

	return { levelList, leftMenuData, loading, usersListByTechnologyAndLevel };
}


export default connect(mapStateToProps,
	{
		getAllLevelAPI,
		deleteUserLevelAPI,
		getLeftMenu,
		getUsersByTechnologyAndLevel
	})(reduxForm({
		form: 'LevelsListing',
		onSubmitFail: errors => {
			focusOnError(errors);
		},
		enableReinitialize: true,
	})(LevelsListing));

