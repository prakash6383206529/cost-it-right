import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Redirect } from 'react-router-dom';

export default function (ComposedComponent) {
    class AuthMiddleware extends Component {

        constructor(props) {
            super(props);
            this.state = {
                redirectToLogin: false
            }
        }

        componentWillMount() {
            if (this.props.authenticated == false) {
                this.setState({ redirectToLogin: true })
                return false;
            }
        }

        render() {

            if (this.state.redirectToLogin === true) {
                return (<Redirect
                    to={{
                        pathname: `/login`,
                    }} />
                )
            }

            //Render the component with all props
            return <ComposedComponent {...this.props} />
        }
    }

    /**
     * Assign user's authentication status
     * @returns {{authenticated: *}}
     */
    function mapStateToProps() {
        let isAuthenticated;

        if (reactLocalStorage.getObject("isUserLoggedIn") == true) {
            isAuthenticated = true;
        } else {
            isAuthenticated = false;
        }

        return {
            authenticated: isAuthenticated,
        }
    }

    /**
    * @method connect
    * @description connect with redux
    * @param {function} mapStateToProps
    * @param {function} mapDispatchToProps
    */
    return connect(mapStateToProps)(AuthMiddleware);
}