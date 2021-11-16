import React, { Component } from "react";
import { connect } from "react-redux";
import { getModuleIdByPathName } from '../../actions/auth/AuthActions';
import { Link } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import "./LeftMenu.scss";
import { SIMULATION_LEFT_MENU_NOT_INCLUDED } from "../../config/masterData";
import { getTopAndLeftMenuData } from '../../actions/auth/AuthActions';

class Leftmenu extends Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}

	UNSAFE_componentWillMount() {
	}

	setModuleId = (ModuleId) => {
		reactLocalStorage.set('ModuleId', ModuleId)
	}

	render() {
		const { location, topAndLeftMenuData } = this.props;
		const activeURL = location && location.pathname ? location.pathname : null;
		const ModuleId = reactLocalStorage.get('ModuleId')
		let leftMenuFromAPI = []
		topAndLeftMenuData &&
			topAndLeftMenuData.map((el, i) => {
				if (el.ModuleId === ModuleId) {
					leftMenuFromAPI = el.Pages
				}
				return null;
			})
		return (
			<>
				{/* {leftMenuData && leftMenuData.length === 0 && <LoaderCustom />} */}
				<div className="left-side-menu">
					<div className="h-100 menuitem-active">
						<ul>
							{
								leftMenuFromAPI && leftMenuFromAPI.map((item, i) => {
									if (
										item.PageName === 'Raw Material Name and Grade' ||
										item.PageName === 'Role' ||
										item.PageName === 'Permisson' ||
										item.PageName === 'Levels' ||
										item.PageName === 'Department' ||
										item.PageName === 'Simulation Upload' ||
										(item.NavigationURL !== "/exchange-master" && SIMULATION_LEFT_MENU_NOT_INCLUDED.includes(item.PageName))
									) return false;
									return (

										<li key={i} className={`${activeURL === item.NavigationURL ? 'active' : null} mb5`}>
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
			</>
		)
	}
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
	const { menusData, leftMenuData, topAndLeftMenuData } = auth
	return { menusData, leftMenuData, topAndLeftMenuData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
	{
		getModuleIdByPathName,
		getTopAndLeftMenuData
	})(Leftmenu);