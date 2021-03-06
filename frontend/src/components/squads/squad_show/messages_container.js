import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

import { formatDateTime } from '../../../util/date_util';

class MessagesContainer extends Component {
    render() {
        if (!this.props.messages){
            return <> </>
        } else {
            return(
                <div>
                    {this.props.messages.map((message, idx) => {
                        return (
                            <div key={"c" + idx} className={`${
                                message.sender === this.props.currentUser ? "message-container-right" : "message-container-left"
                            }`}>
                                <strong>{message.sender}</strong>
                                <p>{message.content}</p>
                                <span className={`${
                                    message.sender === this.props.currentUser ? "time-left" : "time-right"
                                }`}>{formatDateTime(message.timestamp)}</span>
                            </div>
                        );
                    })}
                </div>
            )
        }
    }

}

export default withRouter(MessagesContainer);