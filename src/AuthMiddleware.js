import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Redirect } from 'react-router-dom';
import { checkPageAuthorization } from './actions/auth/AuthActions'
import { loggedInUserId } from './helper';
import { APPROVAL_APP, Simulation_Page } from './config/constants';

export default function AuthMiddleware(ComposedComponent, PAGENAME) {
    class AuthMiddleware extends Component {

        constructor(props) {
            super(props);
            this.state = {
                redirectToLogin: false,
            }
        }

        UNSAFE_componentWillMount() {

            // CONDITION TO CHECK IF USER LOGGED IN THEN CONTINUE, OTHERWISE REDIRECT TO LOGIN PAGE
            if (this.props.authenticated === false) {
                this.setState({ redirectToLogin: true })
                return false;
            }

            // CONDITION TO CHECK REQUEST (PAGE OR URL) IS ACCESSIBLE OR NOT
            console.log(reactLocalStorage.getObject('receiverId'),'reactLocalStorage.getObject')
            if (this.props.authenticated === true) {
                    let reqData = {
                        PageName: PAGENAME,
                        LoggedInUserId: loggedInUserId(),
                        ReceiverId: (PAGENAME===Simulation_Page||PAGENAME===APPROVAL_APP)?reactLocalStorage.getObject('receiverId'):null
                }
                this.props.checkPageAuthorization(reqData, res => {
                    if (res && res.status === 401 && res.statusText === 'Unauthorized') {
                        //NEW ADDED FOR (DISABLED THIS IF ANY ERROR)
                        reactLocalStorage.setObject("isUserLoggedIn", false);
                        reactLocalStorage.setObject("userDetail", {});
                        reactLocalStorage.set('ModuleId', '');
                        this.setState({ redirectToLogin: true })
                    }
                })
            }
        }

        render() {

            if (this.state.redirectToLogin === true) {
                return <Redirect to={'/login'} />
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

        if (reactLocalStorage.getObject("isUserLoggedIn") === true) {
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
    return connect(mapStateToProps, { checkPageAuthorization })(AuthMiddleware);
}