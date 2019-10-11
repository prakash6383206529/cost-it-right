import React from "react"
import ReactGoogleMapLoader from "react-google-maps-loader"
import ReactGooglePlacesSuggest from "react-google-places-suggest"
import { toastr } from 'react-redux-toastr'
const API_KEY = "AIzaSyBRaP2V6woKa6mQ8AE9Sej0YUFd-aO1J-4"

class GoogleSuggest extends React.Component {
    constructor(){
        super();
        this.locationText = React.createRef();
            this.state = {
                search: "",
                value: "",
                newLocation: "",
                oldLocationArray: [],
                location: [],
                error: false
            }
    }

    handleInputChange = (e) => {
        this.setState({
            search: e.target.value, 
            value: e.target.value,
            newLocation: e.target.value
        })
    }

    handleSelectSuggest = (suggest)=> {
        console.log(suggest)
        this.setState({
            search: "", 
            value: suggest.formatted_address,
            newLocation: suggest.formatted_address
        })
    }

    

    /**
    * @method addServiceHandler
    * @description  add new service in local formData object
    */
   addLocation = () => {
    
    if((newLocation === 'undefined' && newLocation === null && newLocation === "")){
        return <div className="text-help">This field is required.</div>
    }
    const newLocation = document.getElementById('location').value;
    
    if (newLocation !== '' ) {
        this.setState({
            newLocation
        })
    }
    if ((this.state.newLocation && this.state.newLocation !== '' && this.state.newLocation.length > 2) || (newLocation !== '' && this.state.newLocation.length > 2)) {
        let oldLocationArray = [];
        oldLocationArray = this.state.location;
        console.log(this.state.location, "this.state.location");
        if ( newLocation !== "") {
            oldLocationArray.push(newLocation);
        }else{
            oldLocationArray.push(this.state.newLocation);
        }

        this.setState({ 
            location: oldLocationArray,  
            //oldLocationArray: '',
            newLocation : ''
        }, () => {
            //this.locationText.current.value = '';
             this.state.newLocation = ''
        });
    }
}
    
    /**
     * @method renderLocation
     * @description  Used to render location 
     */
    renderLocation = () => {
        if (typeof this.state.location === 'object' && this.state.location.length > 0) {
            return (
                this.state.location.map((val, i) => {
                    return (
                        <div className="award-list" key={i}>
                            <span className="icon"><i className="icon-location"></i>{val}</span>
                            <span className="delete-icon" onClick={() => this.removeLocation(i)}><i className="far fa-trash-alt"></i></span>
                        </div>
                    );
                })
            );
        } else {
            return (
                <div>
                    <div>No Location available </div>
                </div>
            );
        }
    }

    /**
    * @method removeServices
    * @description  Used to remove service from formData object
    */
   removeLocation = (locationIndex) => {

        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteService(locationIndex)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm('Are you sure you want to delete this location', toastrConfirmOptions);
    }

     /**
    * @method confirmDeleteService
    * @description Used to call delete Service after confirmation from user
    */
    confirmDeleteService = (serviceIndex) => {
        const locationArray = this.state.location;
        locationArray.splice(serviceIndex, 1);
        this.setState({ location: locationArray });
    }

    render() {
        const {search, value} = this.state
        return (
        <ReactGoogleMapLoader
            params={{
            key: API_KEY,
            libraries: "places,geocode",
            }}
            render={googleMaps =>
            googleMaps && (
                <div >
                <ReactGooglePlacesSuggest
                    autocompletionRequest={{input: search}}
                    googleMaps={googleMaps}
                    onSelectSuggest={this.handleSelectSuggest}
                >
                 {(this.state.location.length < 3) && (
                <div>
                    <div className="search-inputs">
                        <input
                            type="text"
                            ref={this.locationText}
                            //value={value}
                            value={this.state.newLocation}
                            placeholder="Search"
                            onChange={this.handleInputChange}
                            id={'location'}
                            autocomplete="off"
                            className="form-control withoutBorder"
                        />
                    </div>
                    <button type="button" onClick={this.addLocation} className="add-icon btn black-btn">
                        <i className="fas fa-plus" /> Add
                    </button>
                </div>)}
                </ReactGooglePlacesSuggest>
                    <br/>
                    <br/>
                <div className="scroll-yaxis">{this.renderLocation()}</div>  
                </div>
            )
            }
        />
        )
    }
}

export default GoogleSuggest
