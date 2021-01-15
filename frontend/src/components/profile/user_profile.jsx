import React from "react";
import { Link } from 'react-router-dom';
import './user_profile.css';
import SquadBoxContainer from '../squads/squad_box_container'
import GameStatsFormContainer from './game_stats_form_container'
import CarouselContainer from './carousel_container'
import ImageUpload from './image_upload'

class UserProfile extends React.Component{
    constructor(props){
        super(props);
        // if (this.props.games[0] !== undefined){
        // this.state = {
        //     gameState: this.props.games[0]
        // }}


    }

    componentDidMount(){
        this.props.fetchUser(this.props.profileUserId)
        this.props.fetchGames()
        .then(games => 
         this.setState({gameState:games.games.data[0]._id})   )
    }

    componentWillUnmount(){
        this.props.removeUser()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.profileUserId !== this.props.profileUserId) {
            this.props.fetchUser(this.props.profileUserId)
        }
    }
    // componentDidReceiveProps(){
    //     this.props.fetchUser(this.props.profileUserId)
    //     this.props.fetchGames()
    //     .then(games => 
    //      this.setState({gameState:games.games.data[0]._id})   )
    // }

    render() {
        // {
        //     // this.setState({gameState: this.props.games[0]._id})
        //     return <> </>
        // }

        if (!this.props.profileUser || !this.props.profileUser.squads || !this.state){
            return <> </>
        }
        const { profileUser, profileUserId} = this.props

        return(
            <div>
                <div className="profile-squad-boxes">
                    <h3>{profileUser.username}'s Squads</h3>
                    {profileUser.squads.map(squad => (
                        <SquadBoxContainer 
                        squad={squad} 
                        currentUserId={this.props.currentUserId} 
                        key={squad._id} 
                        comingFromProfile={true}
                        />
                    ))}
                </div>
                <div className='user-profile-carousel'>
                    <CarouselContainer
                        currentUserId= {this.props.currentUserId}
                        profileUserId= {this.props.profileUserId}
                        />
                </div>
                <span className='img-upload'>
                    {this.props.currentUserId === profileUserId ? <ImageUpload fetchUser={this.props.fetchUser} profileUserId={profileUserId}/> : <> </>}
                </span>

                <header className='user-profile-header'>
                        <h2 id='user-name'>{profileUser.username}'s Profile </h2>
                </header>

                <div id='pp-game-btn-container'>
                    {/* <h1 id='profile-title'>Click a game to view your stats</h1> */}
                    {this.props.games.map((game) => {
                    return (
                        <button id='pp-game-button' onClick={()=> this.setState({gameState: game._id})} key={`${game._id}`} >{game.name}</button> //value={`${game._id}`}
                    );
                    })}
                </div>
                
                <div className="user-profile-body">
                    <div className="user-profile-main">
                        <div className="user-stat-section">
                          {profileUser.userStats.map(stat => {
                            if (stat.game === this.state.gameState){
                                return (
                                    <div key={`${profileUser.username}${stat._id}`}className="user-stat-box">
                                        <h2>{stat.gameName}</h2>
                                        <h3>{(stat.updatedAt).slice(0,10)}</h3>
                                        <h2 id='profile-stat-name'>{stat.gameName} Stats</h2>
                                        {Object.keys(stat.stats).map((key, idx) => {
                                            return (
                                                <h3 id='profile-stat' key={`${idx}${stat.game}`} className="stat-item">{key}: {stat.stats[key]}</h3> 
                                            )
                                        })}
                                    </div> )
                            }
                          })}
                        </div>

                    {this.props.games.map((game, idx) => {
                        // if (game.id )
                        if (game._id !== this.state.gameState){
                            return <div key={idx}> </div>
                        }
                        if (this.props.currentUserId === profileUserId){ 
                            if (profileUser.userStats.find(stat => stat.game === this.state.gameState)){
                                return (
                                    <div key={idx} className="user-stat-form-section">
                                        <GameStatsFormContainer statId={(profileUser.userStats.find(stat => stat.game === this.state.gameState))._id} key={`${game._id}${idx}`} type="edit" game={game} profileUserId={profileUserId} profileUser={profileUser} /> 
                                    </div>
                        )} else {
                            return (
                                <div key={idx}className="user-stat-form-section">
                                        <GameStatsFormContainer key={`${game._id}${idx}`} type="create" game={game} profileUserId={profileUserId} profileUser={profileUser} /> 
                                    </div>
                            )
                        }
                        
                        ;}
                    })}   


                    </div>

                </div>
            </div>
        )
    }
}

export default UserProfile;


