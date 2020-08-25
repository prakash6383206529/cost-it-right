import React, { Component } from "react";
import MetisMenu from 'react-metismenu';
import "./Breadcrumb.scss";

class Breadcrumb extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		}
	}

	/**
    * @method componentDidMount
    * @description Called after rendering the component
    */
	componentDidMount() {
		this.props.onRef(this)
	}

	setBreadCrumbs = (data) => {
		this.setState({ data })
	}

	displayTitle = () => {
		const { data } = this.state;
		const titleWithDash = data && data.Bread3rdTitle ? data.Bread3rdTitle.replace('/', '') : ''
		return titleWithDash && titleWithDash != '' ? titleWithDash.replace('-', ' ') : ''
	}

	render() {
		const { data } = this.state;
		let secondTitle = '';
		if (data.Bread2ndTitle == 'Dashboard' || data.Bread2ndTitle == 'Dashboard' || data.Bread2ndTitle == 'Audit') {
			secondTitle = 'Dashboard';
		} else if (data.Bread2ndTitle == 'Masters' || data.Bread2ndTitle == 'Raw Material' || data.Bread2ndTitle == 'BOP' || data.Bread2ndTitle == 'Part' ||
			data.Bread2ndTitle == 'Machine' || data.Bread2ndTitle == 'Vendor' || data.Bread2ndTitle == 'Client' ||
			data.Bread2ndTitle == 'Plant') {
			secondTitle = 'Masters';
		} else if (data.Bread2ndTitle == 'Additional Masters' || data.Bread2ndTitle == 'Overhead and Profits' || data.Bread2ndTitle == 'Labour' || data.Bread2ndTitle == 'Reason' ||
			data.Bread2ndTitle == 'Operation' || data.Bread2ndTitle == 'Fuel and Power' || data.Bread2ndTitle == 'UOM' ||
			data.Bread2ndTitle == 'Volume' || data.Bread2ndTitle == 'Exchange Rate' || data.Bread2ndTitle == 'Freight' ||
			data.Bread2ndTitle == 'Interest Rate' || data.Bread2ndTitle == 'Tax') {
			secondTitle = 'Additional Master';
		} else if (data.Bread2ndTitle == 'Technology' || data.Bread2ndTitle == 'Sheet Metal') {
			secondTitle = 'Costing';
		} else if (data.Bread2ndTitle == 'Users' || data.Bread2ndTitle == 'User') {
			secondTitle = 'Users';
		}

		return (
			<div className="breadcrumbs fixed-top">
				<div className="container-fluid">
					<div className="row">
						<div className="col-12">
							<div className="bread-inner">
								<ul className="bread-list d-inline-flex">
									<li><a href="/">Home</a></li>
									<li><a href={`${data.Bread2ndURL}`}>{secondTitle}</a></li>
									<li className="active"><a href={`${data.Bread3rdTitle}`}>{this.displayTitle()}</a></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Breadcrumb;