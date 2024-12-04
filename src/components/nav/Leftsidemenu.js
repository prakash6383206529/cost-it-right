import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { SIMULATION_LEFT_MENU_NOT_INCLUDED } from "../../config/masterData";
import { getTopAndLeftMenuData } from '../../actions/auth/AuthActions';
import CalculatorWrapper from "../common/Calculator/CalculatorWrapper";
import { reactLocalStorage } from "reactjs-localstorage";
import { disabledClass } from '../../actions/Common'
import { MESSAGES } from "../../config/message";
import { LabelsClass } from "../../helper/core";
import { withTranslation } from "react-i18next";

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
	getLocalizedPageName = (pageName) => {
		const { t } = this.props;
		const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
	
		if (pageName.includes('Vendor')) {
			return pageName.replace(/Vendor/g, VendorLabel);
		}
		return pageName;
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
				<div className="left-side-menu p-relative">
					{this.props.disabledClass && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>}
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
										item.PageName === 'Vendor Classification Status' ||
										item.PageName === 'LPS Rating Status' ||
										item.PageName === 'Initiate Unblocking' ||
										item.PageName === 'Login Audit' ||

										(item.NavigationURL !== "/exchange-master" && SIMULATION_LEFT_MENU_NOT_INCLUDED.includes(item.PageName))
									) return false;
									const localizedPageName = this.getLocalizedPageName(item.PageName);

									return (

										<li key={i} className={`${activeURL === item.NavigationURL ? 'active' : null} mb5`}>
											<Link
												onClick={() => this.setModuleId(ModuleId)}
												to={{
													pathname: item.NavigationURL,
													state: { ModuleId: ModuleId, PageName: item.PageName, PageURL: item.NavigationURL }
												}}
											>{localizedPageName}</Link>
										</li>
									)
								})
							}
						</ul>

					</div>
				</div>
				<CalculatorWrapper />
			</>
		)
	}
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth, comman }) {
	const { menusData, leftMenuData, topAndLeftMenuData } = auth
	const { disabledClass } = comman
	return { menusData, leftMenuData, topAndLeftMenuData, disabledClass }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
	{
		getTopAndLeftMenuData},
	)(withTranslation(['NavBar', 'MasterLabels'])(Leftmenu));
