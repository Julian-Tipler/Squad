import { connect } from 'react-redux';
import { fetchSquad, updateSquad, fetchSquadMessages, deleteSquad, removeSquadFromState } from '../../../actions/squad_actions';
import SquadShow from './squad_show';
import { closeModal, openModal } from '../../../actions/modal_actions';

const mapStateToProps = (state, ownProps) => {
    return {
        currentSquad: state.squads.currentSquad,
        currentUser: state.session.user,
        squadId: ownProps.match.params.squadId,
        messages: state.squads.currentSquad.messages,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchSquad: id => dispatch(fetchSquad(id)),
        updateSquad: data => dispatch(updateSquad(data)),
        deleteSquad: data => dispatch(deleteSquad(data)),
        closeModal: () => dispatch(closeModal()),
        fetchSquadMessages: id => dispatch(fetchSquadMessages(id)),
        removeSquadFromState: () => dispatch(removeSquadFromState()),
        otherForm: (
            <button className="edit-button" onClick={() => dispatch (openModal( { word: 'editBio'}))}>
            Edit Bio
            </button>
        )
        
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SquadShow);