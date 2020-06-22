import React, { Component } from 'react';

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

	render() {
		const { location } = this.props;
		return (
			<div className="d-flex  error-block">
				{location.pathname !== '/' ? <div className="sf-pagenotfound row h-100 justify-content-center align-items-center align-self-center">
					{/* <div className="col-sm-12 sf-notfoundtext">
						<div className="text-center">
							<h1 className="error404-text">404</h1>
							<h2>Page not found</h2>
							<p>Sorry, there is nothing to see here.</p>
							<a href="/" className="btn btn-primary">Back to Home</a>
						</div>
					</div> */}
					<div className="row d-flex justify-content-center align-items-center text-center">
						<div className="col-md-6 ">
							<div className=" text-center">
								<img src={require('../../assests/images/error-icon.jpg')} alt='error-icon.jpg' />
								<h1 className="fw-500 mt-20 text-center">404 Page not found</h1>
								<h5 className="fw-500">Oopps. There was an error, please try again later.</h5>
								<p className=" mt-15">The server encountered an internal server error and was unable to complete your request.</p>
								<div className="mg-b-40"><a href="/" className="btn btn-primary">Back to Home</a></div>
							</div>
						</div>
					</div>
				</div> : <div />}
				<style jsx>{`
				 .error-404{
					justify-content: center;
					align-items: center;
					height: 100vh;
				 }
				 .error404-text{font-size:6rem; color:red;}
				`}</style>
			</div>
		);
	}
}


export default NotFoundPage;