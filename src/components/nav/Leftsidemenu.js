import React, { Component } from "react";
import MetisMenu from "react-metismenu";
import "./LeftMenu.scss";

const dashboardMenu = [

];

const masterMenu = [
	{
		label: 'Plant',
		to: '/plant-master',
	},
	{
		icon: 'icon-class-name',
		label: 'Supplier',
		to: '/supplier-master',
	},
	{
		label: 'Raw Material',
		to: '/raw-material-master',
	},
	{
		label: 'Part',
		to: '/PartMaster',
	},
	{
		label: 'BOM Master Old',
		to: '/bom-master',
	},
	{
		label: 'Bill Of Material',
		to: '/part-bom-register',
	},
	{
		label: 'Bought Out Parts',
		to: '/bop-master',
	},
	{
		label: 'Other Operation',
		to: '/other-operation',
	},
	{
		label: 'CED Other Operation',
		to: '/ced-other-operation',
	},
	{
		label: 'Machine Rate',
		to: '/mhr-master',
	},
	{
		label: 'Machine Type',
		to: '/machine-type-master',
	},
	{
		label: 'Machine',
		to: '/machine-master',
	},
	{
		label: 'Power',
		to: '/power-master',
	},
];

const additionalMasterMenu = [
	{
		label: 'Process Operation',
		to: '/operation-master',
	},
	{
		icon: 'icon-class-name',
		label: 'UOM',
		to: '/UOMMaster',
	},
	{
		label: 'Category',
		to: '/category-master',
	},
	{
		label: 'Freight',
		to: '/freight-master',
	},
	{
		label: 'Labour',
		to: '/labour-master',
	},
	{
		label: 'Overhead and Profit',
		to: '/overhead-profit-master',
	},
	{
		label: 'Depreciation',
		to: '/depreciation-master',
	},
	{
		label: 'Process MHR',
		to: '/process-master',
	},
	{
		label: 'Interest Rate',
		to: '/interest-rate-master',
	},
	{
		label: 'Fuel',
		to: '/fuel-master',
	},
	{
		label: 'Reason',
		to: '/reason-master',
	},
];

const costingMenu = [
	{
		label: 'Technology',
		to: '/costing',
	},
];

const userMenu = [
	{
		label: 'User',
		to: '/user',
	}
];

class Leftmenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeURL: '',
		};
	}

	componentDidMount() {
		const { location } = this.props;
		if (location && location.pathname) {
			this.setState({ activeURL: location.pathname })
		}
	}

	masterMenusCheck = () => {
		const { activeURL } = this.state;
		if (activeURL == '/plant-master' ||
			activeURL == '/supplier-master' ||
			activeURL == '/raw-material-master' ||
			activeURL == '/PartMaster' ||
			activeURL == '/bom-master' ||
			activeURL == '/part-bom-register' ||
			activeURL == '/bop-master' ||
			activeURL == '/other-operation' ||
			activeURL == '/PartMaster' ||
			activeURL == '/ced-other-operation' ||
			activeURL == '/mhr-master' ||
			activeURL == '/machine-type-master' ||
			activeURL == '/machine-master' ||
			activeURL == '/power-master') {
			return true;
		} else {
			return false;
		}
	}

	additionalMasterMenusCheck = () => {
		const { activeURL } = this.state;
		if (activeURL == '/operation-master' ||
			activeURL == '/UOMMaster' ||
			activeURL == '/category-master' ||
			activeURL == '/freight-master' ||
			activeURL == '/labour-master' ||
			activeURL == '/overhead-profit-master' ||
			activeURL == '/depreciation-master' ||
			activeURL == '/process-master' ||
			activeURL == '/interest-rate-master' ||
			activeURL == '/fuel-master' ||
			activeURL == '/reason-master') {
			return true;
		} else {
			return false;
		}
	}

	afterSelection = () => {
		console.log('ddddd')
	}


	render() {
		const { activeURL } = this.state;
		let content = [];

		if (activeURL == '/') {
			content = dashboardMenu;
		} else if (this.masterMenusCheck()) {
			content = masterMenu;
		} else if (this.additionalMasterMenusCheck()) {
			content = additionalMasterMenu;
		} else if (activeURL == '/costing') {
			content = costingMenu;
		} else if (activeURL == '/user') {
			content = userMenu;
		} else {
			content = [];
		}

		return (
			<div className="left-side-menu">
				<div className="h-100 menuitem-active">
					<ul>
						{
							content && content.map((item, i) => {
								return (
									<li className={activeURL == item.to ? 'active' : null}>
										<a href={item.to} >{item.label}</a>
									</li>
								)
							})
						}
					</ul>
					{/* <MetisMenu
						content={content}
						activeLinkFromLocation
						classNameItemActive={'cc'}
						onSelected={this.afterSelection}
						iconNameStateVisible="minus"
						iconNameStateHidden="plus" /> */}
				</div>
			</div>
		)
	}
}

export default Leftmenu;