import React, { Component } from "react";
import { connect } from "react-redux";
import { getLeftMenu } from '../../actions';
import { loggedInUserId } from '../../helper/auth';
import { Link } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import "./LeftMenu.scss";

class Leftmenu extends Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}

	componentWillMount() {
		const ModuleId = reactLocalStorage.get('ModuleId')
		this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => { })
	}

	setModuleId = (ModuleId) => {
		reactLocalStorage.set('ModuleId', ModuleId)
	}

	render() {
		const { leftMenuData, location } = this.props;
		const activeURL = location && location.pathname ? location.pathname : null;
		const ModuleId = reactLocalStorage.get('ModuleId')
		return (
			<div className="left-side-menu">
				<div className="h-100 menuitem-active">
					<ul>
						{
							leftMenuData && leftMenuData.map((item, i) => {
								if (
									item.PageName === 'Raw Material Name and Grade' ||
									item.PageName === 'Role' ||
									item.PageName === 'Permisson' ||
									item.PageName === 'Levels' ||
									item.PageName === 'Department'
								) return false;
								return (
									<li className={`${activeURL === item.NavigationURL ? 'active' : null} mb5`}>
										<Link
											onClick={() => this.setModuleId(ModuleId)}
											to={{
												pathname: item.NavigationURL,
												state: { ModuleId: ModuleId, PageName: item.PageName, PageURL: item.NavigationURL }
											}}
										>{item.PageName}</Link>
									</li>
								)
							})
						}
					</ul>

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
	const { menusData, leftMenuData } = auth
	return { menusData, leftMenuData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
	{
		getLeftMenu,
	})(Leftmenu);