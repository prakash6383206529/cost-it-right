import React, { Component } from 'react';
import $ from "jquery";
import errImg from "../../assests/images/error_image.svg";

class NotFoundPage extends Component {

	/**
	* @method componentDidMount
	* @description used to called after mounting component
	*/
	componentDidMount() {
		//if (this.props.isLoggeIn) {
		this.props.handlePageNotFound()
		//}
	}

	componentWillUnmount() {
		this.props.hidePageNotFound()
	}

	render() {
    // adding class for this error page only on body tag and removing back on other pages
    const pageclass = () => {
      setTimeout(() => {
        $("body").addClass("error-page");
      }, 100);
      (function () {
        if (window.history && window.history.pushState) {
          $(window).on("popstate", function () {
            $("body").removeClass("error-page");
          });
        }
      })();
    };
    // adding class for this error page only on body tag and removing back on other pages

    pageclass();
    const { location } = this.props;
    return (
      <div className="d-flex  error-block row">
        {location.pathname !== "/" ? (
              <>
              <div className="col-md-6 ">
                <img src={errImg} alt="error-icon" />
              </div>
              <div className="col-md-6 d-inline-flex align-items-center">
                <div className="">
                  <h1 className="fw-500 mt-20 ">Page not found</h1>
                  <h5 className="fw-500">
                    Oops. There was an error, please try again later.
                  </h5>
                  <p className=" mt-15">
                    The server encountered an internal server error and was
                    unable to complete your request.
                  </p>
                  <div className="mg-b-40">
                    <a href="/" className="btn btn-primary">
                      Back to Home
                    </a>
                  </div>
                </div>
              </div>
          </>
        ) : (
          <div />
        )}
        <style jsx>{`
          .error-404 {
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .error404-text {
            font-size: 6rem;
            color: red;
          }
        `}</style>
      </div>
    );
  }
}
export default NotFoundPage;