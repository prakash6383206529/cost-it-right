import React, { Component } from "react";
import { connect } from "react-redux";
import { reactLocalStorage } from 'reactjs-localstorage';
import { Link, } from "react-router-dom";
import "./Breadcrumb.scss";

class Breadcrumb extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			secondTitle: '',
			secondURL: '',
			ThirdTitle: '',
		}
	}

	/**
	* @method UNSAFE_componentWillReceiveProps
	* @description CALLED WHEN CHANGED IN PROPS
	*/
	UNSAFE_componentWillReceiveProps(prevProps) {
		if (prevProps.location !== this.props.location || prevProps.leftMenuData !== this.props.leftMenuData) {
			const { location, leftMenuData, menusData } = prevProps;
			if (location) {
				const ModuleID = reactLocalStorage.get('ModuleId');
				const breadObj = leftMenuData && leftMenuData.find(el => el.NavigationURL === location.pathname);
				const menuObj = menusData && menusData.find(el => el.ModuleId === ModuleID);
				const cleanURL = menuObj && menuObj.NavigationURL.replace('/', '')
				this.setState({
					secondTitle: menuObj && menuObj.ModuleName,
					secondURL: cleanURL,
					ThirdTitle: breadObj && breadObj.PageName,
				})
			}
		}
	}

	render() {
		const { secondTitle, } = this.state;

		let url = this.state.secondURL;

		if (secondTitle === 'Master') {
			url = 'raw-material-master'
		}
		if (secondTitle === 'Additional Masters') {
			url = 'reason-master'
		}

		return (
			<div className="breadcrumbs fixed-top">
				<div className="container-fluid">
					<div className="row">
						<div className="col-12 pl-0">
							<div className="bread-inner">
								<ul className="bread-list d-inline-flex">
									<li><a href="/">Home</a></li>
									<li><a href={`/${url}`}>{this.state.secondTitle}</a></li>
									<li className="active">{this.state.ThirdTitle}</li>
									{/* <Link className="bell-notifcation-icon" to="/">
										Home
                  </Link>
									<Link className="bell-notifcation-icon" to={`/${url}`}>
										{this.state.secondTitle}
									</Link>
									<Link className="bell-notifcation-icon active" >
										{this.state.ThirdTitle}
									</Link> */}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

/**
* @name mapStateToProps
* @desc map state containing organisation details from the api to props
* @return object{}
*/
function mapStateToProps({ auth }) {
	const { leftMenuData, menusData, moduleSelectList, } = auth
	return { leftMenuData, menusData, moduleSelectList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
	{

	})(Breadcrumb);