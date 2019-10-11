import React, { Component } from 'react';
import { compose, withProps, withStateHandlers } from 'recompose';
import { connect } from "react-redux";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import { Link } from "react-router-dom";
import './Map.scss';
import { OPPORTUNITY_LOGO_MEDIA_URL } from '../../config/constants';
import { Redirect } from 'react-router-dom'
// import Spiderfy from "./Spiderfy";

const LATITUDE_DELTA = 0.04864195044303443;
const LONGITUDE_DELTA = 0.040142817690068;
class MapComponent extends Component {
    constructor(props) {
        super(props);
        const initialRegion = {
            latitude: parseFloat(22.753284),
            longitude: parseFloat(75.893700),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        };
        this.state = {
            latitudeDelta: null,
            longitudeDelta: null,
            error: null,
            initialPosition: initialRegion,
            applyRoleIndex: '',
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        // console.log('this.props.userCurrentLatitude', this.props.userCurrentLatitude);

        if ((this.props.mapData && this.props.mapData.length > 0 && this.props.mapData[0].loc[0] !== 0 && this.props.mapData[0].loc[0] !== '0' && this.props.mapData[0].loc[0] !== '' &&
            this.props.mapData[0].loc[0] !== 'undefined' && this.props.userCurrentLatitude !== undefined) &&
            (this.props.mapData.length > 0 && this.props.mapData[0].loc[1] !== 0 && this.props.mapData[0].loc[1] !== '0'
                && this.props.mapData[0].loc[1] !== '' && this.props.mapData[0].loc[1] !== 'undefined'
                && this.props.mapData[0].loc[1] !== undefined)) {
            const initialRegion = {
                latitude: parseFloat(this.props.mapData[0].loc[0]),
                longitude: parseFloat(this.props.mapData[0].loc[1]),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            };
            this.setState({
                initialPosition: initialRegion,
                latitude: parseFloat(this.props.userCurrentLatitude),
                longitude: parseFloat(this.props.userCurrentLongitude),
                error: null,
            });
        } else {
            const initialRegion = {
                latitude: parseFloat(22.753920),
                longitude: parseFloat(75.892036),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            };
            this.setState({
                initialPosition: initialRegion,
            });
        }
    }

    /**
    * @method componentWillReceiveProps
    * @description called when props changed
    */
    componentWillReceiveProps(nextprops) {
        //console.log('nextprops.mapData.length',nextprops.mapData.length)
        if (nextprops.mapData.length > 0) {
            const initialRegion = {
                latitude: parseFloat(nextprops.mapData[0].loc[0]),
                longitude: parseFloat(nextprops.mapData[0].loc[1]),
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            };
            this.setState({
                initialPosition: initialRegion,
            });

        }
    }

    toolTipDisplay = (props, i, mapData) => {
        const similarAddress = mapData.filter((item) => {
            if (item.loc[0] == mapData[i].loc[0] && item.loc[1] == mapData[i].loc[1]) {
                return true;
            }
        })
        return (props.isOpen && props.showInfoIndex === i) &&
            <InfoWindow onCloseClick={props.onToggleOpen}>
                <div>
                    {similarAddress && similarAddress.map((address, index) => {
                        return <div>
                            <div className="d-flex map-popup">
                                <img className='img-circle' height='50' width='50' src={address && address.image ? `${OPPORTUNITY_LOGO_MEDIA_URL}${address.image}` : require('../../assests/images/no-image-grays.png')} alt='' />
                                <a href='javaScript:Void(0);' className="map-popup-detail" onClick={() => this.setState({ isRoleApply: true, applyRoleIndex: address._id })}><h6>{address.name}</h6>
                                    <p>{address.auditionAddress}</p></a>
                            </div>
                            <div className="d-flex detail-distance">
                                <span> 2 kM away</span>
                                {/* <Link to={`/opportunity-detail/${mapData[i]._id}/${''}`}className="btn btn-link m-0 p-0 text-right" > {mapData[i].name}</Link> */}
                                {/* <div className={'btn btn-link distance-link m-0 p-0 text-right'} onClick={() => this.setState({ isRoleApply: true, applyRoleIndex: i })}> {mapData[i].name}</div> */}
                            </div>
                        </div>
                    })}
                </div>
            </InfoWindow>

    }

    render() {
        const { isRoleApply, applyRoleIndex } = this.state;
        if (isRoleApply === true) {
            return <Redirect push
                to={{
                    pathname: `/opportunity-detail/${applyRoleIndex}`,
                    state: {
                        showApplyRole: false,
                        applyDisplay: this.state.applyDisplay
                    }
                }} />
        }

        /** Get the list from the props  */
        const { mapData } = this.props;
        let defaultCenters = {}
        if (mapData && mapData.length > 0 && mapData[0].loc !== '') {
            defaultCenters.lat = parseFloat(this.props.mapData[0].loc[0]);
            defaultCenters.lng = parseFloat(this.props.mapData[0].loc[1]);
        } else {
            defaultCenters.lat = 22.753284;
            defaultCenters.lng = 75.893700;
        }

        const MyMapComponent = compose(
            withStateHandlers(() => ({
                isOpen: false,
                selected: '',
            }), {
                    onToggleOpen: ({ isOpen }) => () => ({
                        isOpen: !isOpen,
                    }),
                    showInfo: ({ showInfo, isOpen }) => (a) => ({
                        isOpen: !isOpen,
                        showInfoIndex: a
                    })
                }),
            withProps({
                googleMapURL: process.env.REACT_APP_GOOGLE_MAP_URL,
                loadingElement: <div className="loading-element" />,
                containerElement: <div className="container-element" />,
                mapElement: <div className="map-element" />
            }),
            withScriptjs,
            withGoogleMap
        )(props => (
            <GoogleMap className="google-map" defaultZoom={12} defaultCenter={{ lat: defaultCenters.lat, lng: defaultCenters.lng }}>
                {/* <Spiderfy> */}
                {mapData && mapData.map((item, i) => {
                    // console.log('item on map', item)
                    var icon = '../../images/mapletter.png';
                    if (item.loc) {
                        return <Marker key={i}
                            position={{ lat: parseFloat(item.loc[0]), lng: parseFloat(item.loc[1]) }}
                            icon={{ url: icon }}
                            onClick={() => { props.showInfo(i) }}
                        >
                            {this.toolTipDisplay(props, i, mapData)}
                        </Marker>;
                    }
                    else {
                        return <div key={i}></div>;
                    }
                })}
                {/* </Spiderfy> */}
            </GoogleMap>
        ))
        return (
            <MyMapComponent

            />
        )
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { userData } = auth;
    // console.log('userData', userData);
    return {
        userData,
    };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(
    mapStateToProps, null
)(MapComponent);

