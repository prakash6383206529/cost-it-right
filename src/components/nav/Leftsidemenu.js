import React, { Component } from "react";
import { connect } from "react-redux";
import { getLeftMenu, getModuleIdByPathName } from '../../actions/auth/AuthActions';
import { loggedInUserId } from '../../helper/auth';
import { Link } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import "./LeftMenu.scss";
import { SIMULATION_LEFT_MENU_NOT_INCLUDED } from "../../config/masterData";
import LoaderCustom from "../common/LoaderCustom";

class Leftmenu extends Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}

	UNSAFE_componentWillMount() {

		//COMMENTED FOR USE BELOW CONDITION
		// const ModuleId = reactLocalStorage.get('ModuleId')
		// this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => { })

		//07-10-2020 COMMENTED, FOR LEFT MENU RENDER WHEN DIRECT URL HIT
		const { location } = this.props;
		if (location && location !== undefined) {

			this.props.getModuleIdByPathName(location.pathname, res => {
				// this.props.getLeftMenu(res.data.Data.ModuleId, loggedInUserId(), (res) => { })
			})
		}

	}

	setModuleId = (ModuleId) => {
		reactLocalStorage.set('ModuleId', ModuleId)
	}

	render() {
		const { leftMenuData, location } = this.props;
		const activeURL = location && location.pathname ? location.pathname : null;
		const ModuleId = reactLocalStorage.get('ModuleId')
		return (
			<>
				{/* {leftMenuData && leftMenuData.length === 0 && <LoaderCustom />} */}
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
											>{item.PageName === 'Client' ? 'Customer' : item.PageName}</Link>
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
		getModuleIdByPathName,
	})(Leftmenu);