// import React, { Component } from 'react';
// import { connect } from "react-redux";
// import { toastr } from 'react-redux-toastr';
// import { Link } from "react-router-dom";
// import MapComponent from '../common/Map';
// import { Loader } from '../common/Loader';
// import { langs } from "../../config/localization";
// import Moment from 'moment';


// class AssetMap extends Component {

//     constructor(props) {
//         super(props);
//         /** Initialize the states */
//         this.state = {
//             loading: true,
//             showDeviceStatusButton: false,
//             isEnabled: false,
//             deviceDisplayName: '',
//             deviceAddress: '',
//             statusName: '',
//             assetName: '',
//             deviceStatus: '',
//             deviceId: '',
//             lightOffData: ''
//         };
//     }

//     /** Call API for fetch detail of Site's Assets */

//     componentDidMount() {
//         const userData = checkLocalStorage();
//         const currentRole = userData.userRole
//         const deviceId = this.props.match.params.deviceId;
//         const deviceStatus = this.props.match.params.deviceStatus;
//         if (deviceStatus > 0) {
//             const currentTime = Moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
//             const currentDateTime = Moment.utc(currentTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
//             this.props.getDeviceParametersAPI(deviceId, (response, parameterIds) => {
//                 if (response.status === 200) {
//                     const lightOffData = {
//                         parameter: parameterIds.onParameterId,
//                         dateTime: currentDateTime,
//                         data: 0
//                     }
//                     this.setState({ lightOffData })
//                 }
//             });
//         }
//         this.setState({ role: currentRole, deviceId: deviceId, deviceStatus: deviceStatus, loader: true });
//         this.props.getSingleDeviceDetailAPI(deviceId, (response) => {
//             this.setState({ loader: false });
//             if (response.status !== 200) {
//                 window.location.assign('/overview');
//             }
//         });
//         if ((currentRole.parentRole === AMP_CONTROL_ROLE || currentRole._id === AMP_CONTROL_ROLE) || (currentRole.parentRole === COUNCIL_ADMIN_ROLE)) {
//             this.setState({ showDeviceStatusButton: true });
//         } else {
//             this.setState({ showDeviceStatusButton: false });
//         }
//     }

//     /**
//     * @method componentWillReceiveProps
//     * @description called when props changed
//     */
//     componentWillReceiveProps(nextProps) {
//         if (this.props.singleDeviceData !== nextProps.singleDeviceData) {
//             this.setState({
//                 isEnabled: nextProps.singleDeviceData.isEnabled,
//                 deviceDisplayName: nextProps.singleDeviceData.displayName,
//                 assetName: nextProps.singleDeviceData.asset.name,
//                 deviceAddress: nextProps.singleDeviceData.location.address,
//                 loader: false,
//                 statusName: nextProps.singleDeviceData.isEnabled ? '' : 'CLOSED'
//             });
//         }
//     }

//     /**
//     * @method renderDevicetMap
//     * @description use to show device on map 
//     */

//     renderDevicetMap = () => {
//         if (this.props.singleDeviceData) {
//             const formatedDeviceData = {};
//             formatedDeviceData.name = this.props.singleDeviceData.asset.name;
//             formatedDeviceData.location = this.props.singleDeviceData.location;
//             formatedDeviceData.isEnabled = this.props.singleDeviceData.isEnabled;

//             const centre = formatedDeviceData.location;
//             centre.lng = formatedDeviceData.location.long;
//             return <MapComponent key="map" list={[formatedDeviceData]} centre={centre} zoom={17} />;
//         }
//     }


//     /**
//     * @method onChangeDeviceStatus
//     * @description used to change device status
//     */

//     onChangeDeviceStatus = () => {
//         this.setState({ isEnabled: !this.state.isEnabled }, () => {
//             const toastrConfirmOptions = {
//                 onOk: () => { this.confirmDeviceUpdateStatus(); },
//                 onCancel: () => { this.setState({ isEnabled: !this.state.isEnabled }) }
//             };

//             if (!this.state.isEnabled) {
//                 toastr.confirm(langs.update_device_status, toastrConfirmOptions);
//             }
//             else {
//                 this.confirmDeviceUpdateStatus();
//             }
//         });
//     }

//     /**
//     * @method confirmDeviceUpdateStatus
//     * @description used to call api to change site
//     * status
//     */
//     confirmDeviceUpdateStatus = () => {
//         const { isEnabled, deviceId, deviceStatus, lightOffData } = this.state;
//         const { isActive, asset, deviceType, location, name, displayName } = this.props.singleDeviceData;
//         const requestData = {
//             isActive: isActive,
//             isEnabled: isEnabled,
//             _id: this.props.singleDeviceData.deviceId,
//             asset: asset,
//             deviceType: deviceType,
//             location: location,
//             name: name,
//             displayName: displayName
//         };

//         this.setState({ loader: true });
//         this.props.openCloseDeviceAPI(requestData, deviceId, deviceStatus, lightOffData, (response) => {
//             this.setState({ loader: false });
//             if (deviceStatus === 0) {
//                 if (response) {
//                     if (response.status === 204 || response.status === 200) {
//                         toastr.success(langs.messages.device_status_update_success);
//                         window.location.assign('/site');
//                     } else {
//                         toastr.error(langs.error, langs.messages.default_error);
//                     }
//                 }
//             } else {
//                 if (response) {
//                     if (response[0].status === 204 && response[1].status === 201) {
//                         toastr.success(langs.messages.device_status_update_success);
//                         window.location.assign('/site');
//                     } else {
//                         toastr.error(langs.error, langs.messages.default_error);
//                     }
//                 }
//             }
//         });
//     }
//     /** Render the HTML on the page */
//     render() {
//         const { isEnabled, statusName, loader, showDeviceStatusButton, deviceAddress, assetName } = this.state;
//         return (
//             <div>
//                 <div className="container sf-organisation sf-organisation-details">
//                     {(loader) ?
//                         <Loader /> :
//                         <div>
//                             <div className="row">
//                                 <div className="col">
//                                     <div className="container-header">
//                                         <Link to="/site">
//                                             <i className="fas fa-arrow-left"></i>
//                                         </Link>
//                                         <div className="d-inline ml-2">Field Details</div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="sf-siteinfohead">
//                                 <div className="row">
//                                     <div className="col-sm-6 mr-auto">
//                                         <div className="row justify-content-between align-items-center ml-0">
//                                             <div className="image-edit-parent text-center">
//                                                 <div className="organisation-thumb">
//                                                     <span><img src="../../images/location-gray.svg" alt="org" width="80" height="80" /></span>
//                                                 </div>
//                                             </div>
//                                             <div className="col">
//                                                 <h3 className="sf-subheading d-inline-block"> {assetName}  </h3>
//                                                 <div className="sf-smallheading mt-1">{deviceAddress}  </div>
//                                                 {isEnabled !== true && <p className="mb-1 text-help">{statusName}</p>}

//                                             </div>
//                                         </div>
//                                     </div>
//                                     {showDeviceStatusButton && <div className="col-auto text-center sf-cstmswitchbtn">
//                                         <div className="sf-switchbtn">
//                                             <span className="d-block sf-cstmlabel">Field Open/Closed</span>
//                                             <label className="sf-switchlabel">
//                                                 <input onChange={this.onChangeDeviceStatus} checked={isEnabled ? true : false} type="checkbox" className="ios-switch green bigswitch" />
//                                                 <div><div></div></div>
//                                             </label>
//                                         </div>
//                                     </div>}
//                                 </div>
//                             </div>
//                             <div className="sf-graycontainer sf-mapcontainer">
//                                 {this.renderDevicetMap()}
//                             </div>
//                         </div>
//                     }
//                 </div>
//             </div>
//         )
//     }
// }

// /** Connect state to props */
// const mapStateToProps = ({ asset }) => {
//     let returnObj = { assetList: [], singleDeviceData: asset.singleDeviceData };
//     return returnObj;
// };

// export default connect(mapStateToProps, null)(AssetMap);
