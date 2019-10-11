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
			<div className="d-flex  error-404">
				{location.pathname !== '/' ? <div className="sf-pagenotfound row h-100 justify-content-center align-items-center align-self-center">
					<div className="col-sm-12 sf-notfoundtext">
						<div className="text-center">
							<h1 className="error404-text">404</h1>
							<h2>Page not found</h2>
							<p>Sorry, there is nothing to see here.</p>
							<a href="/">Back to Home</a>
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