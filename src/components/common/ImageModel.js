import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { PROFILE_MEDIA_URL } from '../../config/constants';
import { OPPORTUNITY_LOGO_MEDIA_URL } from '../../config/constants';

class ImageModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      videoId: this.props._id
    };
  }

  handleSubmit = () => {
    this.props.onOk();
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  toggle = () => {
    this.props.onCancel();
  }

  render() {
    const { modelData } = this.props;
    console.log("model data", modelData)
    return (
      <div>
        <Modal width="100%" height="100%" isOpen={this.props.modalVisible} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}></ModalHeader>
          <ModalBody>
            {(modelData.uniqueFilename.includes('mp4') === true || modelData.uniqueFilename.includes('mov') || modelData.uniqueFilename.includes('quicktime')) ?
              <video width="100%" height="100%" controls>
                <source src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`} type="video/mp4" />
                <source src="mov_bbb.ogg" type="video/ogg" />
                Your browser does not support HTML5 video.
                </video>

              // <VideoPlayer
              //   playsInline
              //   poster='../../../assests/images/thumbnail.png'
              //   src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`}
              // />
              // <ReactPlayer
              //   playsInline
              //   poster='../../../assests/images/thumbnail.png'
              //   src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`}
              // />
              // <video id={this.state.videoId} poster={this.state.poster} ref="video" controlsList="nodownload" width="100%" height="100%" controls>
              //   <source src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`} type="video/mp4"
              //     onPlaying={() => this.playVideo(false)}
              //     onPause={() => this.pauseVideo(false)}
              //     onTimeUpdate={this.calculateVideoTime.bind(this)} />
              //   <source src="mov_bbb.ogg" type="video/ogg" />
              //   Your browser does not support HTML5 video.
              //    </video>
              // <Player>
              //   <source src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" />
              // </Player>

              // <Video autoPlay loop muted
              //   controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
              //   onCanPlayThrough={() => {
              //     // Do stuff
              //   }}>
              //   <source src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`} type="video/webm" />
              //   <track label="English" kind="subtitles" srcLang="en" src="http://source.vtt" default />
              // </Video>
              // <ReactJWPlayer
              //   playerId={this.state.videoId}
              //   playerScript={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`}
              //   playlist='https://link-to-my-playlist.json'
              // />,
              :
              <img src={`${PROFILE_MEDIA_URL}${modelData.uniqueFilename}`} width="100%" height="100%" />
            }
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ImageModel;
