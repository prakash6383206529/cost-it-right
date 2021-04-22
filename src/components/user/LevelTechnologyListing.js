import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllLevelMappingAPI, deleteUserLevelAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ConfirmComponent from '../../helper/ConfirmComponent';

class LevelTechnologyListing extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditFlag: false,
			tableData: [],
		}
	}

	componentDidMount() {
		this.getLevelsListData();
		this.props.onRef(this);
	}

	getLevelsListData = () => {
		this.props.getAllLevelMappingAPI(res => {
			if (res.status == 204 && res.data == '') {
				this.setState({ tableData: [], })
			} else if (res && res.data && res.data.DataList) {
				let Data = res.data.DataList;
				this.setState({
					tableData: Data,
				})
			} else {

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

	/**
	 * @method editItemDetails
	 * @description confirm edit item
	 */
	editItemDetails = (Id) => {
		this.props.getLevelMappingDetail(Id)
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
				this.getUpdatedData()
			}
		});
	}

	/**
	* @method buttonFormatter
	* @description Renders buttons
	*/
	buttonFormatter = (cell, row, enumObject, rowIndex) => {
		const { EditAccessibility, DeleteAccessibility } = this.props;
		return (
			<>
				{EditAccessibility && <button type={'button'} className="Edit " onClick={() => this.editItemDetails(cell)} />}
				{/* {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />} */}
			</>
		)
	}

	afterSearch = (searchText, result) => {

	}

	/**
	* @method render
	* @description Renders the component
	*/
	render() {
		const { isEditFlag } = this.state;
		const { AddAccessibility } = this.props;
		const options = {
			//clearSearch: true,
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
				{this.props.loading && <Loader />}
				<Row className="levellisting-page">
					<Col md="6">
						<h2 className="manage-level-heading">{`Level Mapping`}</h2>
					</Col>
					<Col md="6" className="text-right">
						{AddAccessibility && <button
							type="button"
							className={'user-btn'}
							onClick={this.props.mappingToggler}>
							<div className={'plus'}></div>
							{'Add'}</button>}
					</Col>

					<Col className="level-table">
						<BootstrapTable
							data={this.state.tableData}
							striped={false}
							bordered={false}
							hover={false}
							options={options}
							//search
							ignoreSinglePage
							ref={'table'}
							trClassName={'userlisting-row'}
							tableHeaderClass='my-custom-header'
							pagination>
							<TableHeaderColumn dataField="Technology" isKey={true} dataAlign="left" dataSort={true}>Technology</TableHeaderColumn>
							<TableHeaderColumn dataField="Level" dataAlign="left" dataSort={true}>Highest Approval Level</TableHeaderColumn>
							<TableHeaderColumn dataAlign="right" dataField="LevelId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
						</BootstrapTable>
					</Col>
				</Row>
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
	const { loading } = auth;

	return { loading };
}


export default connect(mapStateToProps,
	{
		getAllLevelMappingAPI,
		deleteUserLevelAPI,
	})(LevelTechnologyListing);

