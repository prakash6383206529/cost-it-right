import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import LevelTechnologyListing from './LevelTechnologyListing';
import Level from './Level';

class LevelsListing extends Component {
	constructor(props) {
		super(props);
		this.child = React.createRef();
		this.state = {
			isEditFlag: false,
			tableData: [],
			isShowForm: false,
			isShowMappingForm: false,
		}
	}

	componentDidMount() {
		this.getLevelsListData();
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
	editItemDetails = (Id) => {
		this.setState({
			isEditFlag: true,
			LevelId: Id,
			isOpen: true,
			isShowForm: true,
			isShowMappingForm: false,
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
			onCancel: () => console.log('CANCEL: clicked')
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

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	buttonFormatter = (cell, row, enumObject, rowIndex) => {
		return (
			<>
				<button type={'button'} className="Edit mr5" onClick={() => this.editItemDetails(cell)} />
				<button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />
			</>
		)
	}

	afterSearch = (searchText, result) => {
		console.log('search', searchText, result)
		//...
	}

	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { isEditFlag, isShowForm, isShowMappingForm, isOpen, LevelId } = this.state;
		const options = {
			//clearSearch: true,
			noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
			afterSearch: this.afterSearch,
		};
		return (
			<>
				{this.props.loading && <Loader />}
				<Row className="pt-30">
					<Col md="6">
						<Row>
							<Col md="6">
								<h2 className="manage-level-heading">{`Levels`}</h2>
							</Col>
							<Col md="6" className="text-right">
								<button
									type="button"
									className={'user-btn'}
									onClick={this.levelToggler}>
									<div className={'plus'}></div>{'Add Level'}</button>
							</Col>
							<Col className="mt-0 level-table">
								<BootstrapTable
									data={this.state.tableData}
									striped={false}
									bordered={false}
									hover={true}
									options={options}
									//search
									ignoreSinglePage
									ref={'table'}
									trClassName={'userlisting-row'}
									tableHeaderClass='my-custom-header'
									pagination>
									<TableHeaderColumn dataField="LevelName" isKey={true} dataAlign="left" dataSort={true}>Level</TableHeaderColumn>
									<TableHeaderColumn dataField="Sequence" dataAlign="center" dataSort={true}>Sequence</TableHeaderColumn>
									<TableHeaderColumn dataField="LevelId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
								</BootstrapTable>
							</Col>
						</Row>
					</Col>
					<Col md="6">
						<LevelTechnologyListing
							onRef={ref => (this.child = ref)}
							mappingToggler={this.mappingToggler}
							getLevelMappingDetail={this.getLevelMappingDetail}
						/>
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
	const { levelList, loading } = auth;

	return { levelList, loading };
}


export default connect(mapStateToProps,
	{
		getAllLevelAPI,
		deleteUserLevelAPI,
	})(LevelsListing);

