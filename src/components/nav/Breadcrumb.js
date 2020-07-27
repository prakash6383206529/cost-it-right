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
		return (
			<div className="breadcrumbs fixed-top">
				<div className="container-fluid">
					<div className="row">
						<div className="col-12">
							<div className="bread-inner">
								<ul className="bread-list d-inline-flex">
									<li><a href="/">Home</a></li>
									<li><a href={`${data.Bread2ndURL}`}>{data.Bread2ndTitle}</a></li>
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