import './squads.css'
import React from 'react';
import { Link } from 'react-router-dom';
import Member from './member'

class SquadBox extends React.Component {
  constructor(props){
    super(props);
    
  }
  
  render() {
    // let requestToJoinSquad
    if (Object.values(this.props).length < 1){
      return <> </>
    }
    let chooseDisplay
    if (this.props.comingFromProfile === true) {
      chooseDisplay = 
           <div className="squad-box-profile">
        <div className="squad-box-picture">
          Game image 
        </div>
        <div className="squad-box-left-div">
          <h3 className="squad-box-h3">
            <Link to={`/squads/${this.props.squadId}`} className="squad-box-show-link">{this.props.squad.name}</Link>
          </h3>
          <div className="squad-box-game-skill-div">
            <span className="squad-box-game">{this.props.squad.game.name} </span> 
            <span className="squad-box-skill">{this.props.squad.skillLevel} </span>
          </div>
          <div className="squad-box-left-div">
            <h3 className="squad-box-h3">
              <Link id='squad-link' to={`/squads/${this.props.squadId}`} className="squad-box-show-link">{this.props.squad.name}</Link>
            </h3>
            <span className="squad-box-game">{this.props.squad.game.name}</span> 
            <div className="squad-box-game-skill-div">
              <div>
                <span>Skill Level: </span>
                <span className="squad-box-skill">{this.props.squad.skillLevel} </span>
              </div>
            </div>
            {/* <div>
              <p>Squad Bio:</p>
              <p className="squad-box-bio"> {this.props.squad.generalBio}</p>
            </div> */}
            <div> 
              <span>Squad Size: </span>
              <span>{this.props.squad.squadSize}</span>
            </div>

            <span>{this.props.otherForm}</span>
          </div>
          <span>{this.props.otherForm}</span>
        </div>
          <span>{this.props.squad.squadSize}</span>
          <div className="squad-box-members-div">

          </div>
          
          
      </div>
    }


    
    
    else {
      chooseDisplay = 
            <div className="squad-box-body">
        <div className="squad-box-picture">
          <img className="squad-box-image" src={`${this.props.squad.game.images[0]}`} alt=""/>
        </div>
        <div className="squad-box-left-div">
          <h3 className="squad-box-h3">
            <Link to={`/squads/${this.props.squadId}`} className="squad-box-show-link">{this.props.squad.name}</Link>
          </h3>
          <div className="squad-box-game-skill-div">
            <span className="squad-box-game">{this.props.squad.game.name} </span> 
            <span className="squad-box-skill">{this.props.squad.skillLevel} </span>
          </div>
          <div>
            <p className="squad-box-bio"> {this.props.squad.generalBio}</p>
          </div>
          <span>{this.props.otherForm}</span>
        </div>
          <span>{this.props.squad.squadSize}</span>

          <div className="squad-box-members-div">
            {this.props.squad.members.map((member) => {
              let vari
              member === null ? vari = <div>hi</div> : vari = 
              
              <li className="squad-box-member-li" 
                  key={`${member._id}${this.props.squadId}`}>
                  <Member member={member} />
                </li>
              
              return (
                vari
              );
            })
            
            }
          </div>
      </div>
    }
  

    return (

      chooseDisplay
    );
  }
}

export default SquadBox;









//this was under render before:
    // const data = {
    //   id: this.props.squad._id,
    //   newMemberId: this.props.currentUserId,
    //   type: "addRequest"
    // }