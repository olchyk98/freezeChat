import React, { Component } from 'react';
import './main.css';

import { connect } from 'react-redux';
import { gql } from 'apollo-boost';

import { cookieControl } from '../../glTools';
import client from '../../apollo';
import apiPath from '../../api';
import { convertTime } from '../../glTools';

import Navigation from './Navigation';
import DisplayConversationsList from './DisplayConversationsList';

const messagesLimiter = 20; 

let stickers = {},
    actions = {};

{ // stickers
    let path = "/stickers/";
    stickers = {
        "HEART_STICKER": require('.'+path+'heart.png'),
        "AGENDA_STICKER": require('.'+path+'agenda.svg'),
        "ALARM_STICKER": require('.'+path+'alarm.svg'),
        "BOX_STICKER": require('.'+path+'box.svg'),
        "BRIEFCASE_STICKER": require('.'+path+'briefcase.svg'),
        "BURGER_STICKER": require('.'+path+'burger.svg'),
        "CALENDAR_STICKER": require('.'+path+'calendar.svg'),
        "CAR_STICKER": require('.'+path+'car.svg'),
        "CLEANING_STICKER": require('.'+path+'clearning.svg'),
        "COFFEE_STICKER": require('.'+path+'coffee.svg'),
        "COOKING_STICKER": require('.'+path+'cooking.svg'),
        "COSMETICS_STICKER": require('.'+path+'cosmetics.svg'),
        "DUMBBELL_STICKER": require('.'+path+'dumbbell.svg'),
        "FATHERHOOD_STICKER": require('.'+path+'fatherhood.svg'),
        "GARBAGE_STICKER": require('.'+path+'garbage.svg'),
        "HANDBAG_STICKER": require('.'+path+'handbag.svg'),
        "HOUSE_STICKER": require('.'+path+'house.svg'),
        "INVOICE_STICKER": require('.'+path+'invoice.svg'),
        "IRONING_STICKER": require('.'+path+'ironing.svg'),
        "LAUNDRY_STICKER": require('.'+path+'laundry.svg'),
        "LAUNDRY1_STICKER": require('.'+path+'laundry1.svg'),
        "LIST_STICKER": require('.'+path+'list.svg'),
        "MAILBOX_STICKER": require('.'+path+'mailbox.svg'),
        "MEAT_STICKER": require('.'+path+'meat.svg'),
        "NEWSPAPPER": require('.'+path+'newspaper.svg'),
        "PET_STICKER": require('.'+path+'pet.svg'),
        "PILLOW_STICKER": require('.'+path+'key.svg'),
        "PROFITS_STICKER": require('.'+path+'profits.svg'),
        "SCHELUDE_STICKER": require('.'+path+'schelude.svg'),
        "SEWING_STICKER": require('.'+path+'sewing.svg'),
    }
}

{ // actions
    let path = "/actions/";
    actions = {
        "SALE_ACTION": {
            url: require('.'+path+'wallet.svg'),
            title: "Offer sale",
            description: "Offered sale"
        },
        "GAME_ACTION": {
            url: require('.'+path+'gamepad.svg'),
            title: "Offer to play",
            description: "Offered to play"
        },
        "EAT_ACTION": {
            url: require('.'+path+'toaster.svg'),
            title: "Offer to eat",
            description: "Offered to eat"
        },
        "LIKE_ACTION": {
            url: require('.'+path+'like.svg'),
            title: "Like",
            description: "Liked"
        },
        "REPAIR_ACTION": {
            url: require('.'+path+'repair.svg'),
            title: "Offer to repair",
            description: "Offered to repair"
        }
    }
}

class DisplayConversationsSearch extends Component {
    render() {
        return(
            <div className="rn-home-display-conversations-search">
                <div className="rn-home-display-conversations-search-icon">
                    <i className="fas fa-search" />
                </div>
                <input
                    type="text"
                    className="rn-home-display-conversations-search-input definp"
                    placeholder="Search"
                />
            </div>
        );
    }
}

class DisplayConversations extends Component {
    render() {
        return(
            <div className="rn-home-display-conversations">
                <DisplayConversationsSearch />
                <DisplayConversationsList
                    onRequestConversation={ this.props.onRequestConversation }
                />
            </div>
        );
    }
}

const DisplayChatDisplayMessage = ({ clients, content, type, creator: { avatar }, time }) => {
    function getContent() {
        let a = null;

        switch(type) {
            default:
            case 'TEXT_TYPE':
                a = (
                    <div className="rn-home-display-chat-display-message-content-mat">
                        <span className="rn-home-display-chat-display-message-content-mat-text">
                            { content }
                        </span>
                    </div>
                );
            break;
            case 'STICKER_TYPE':
                a = (
                    <div className="rn-home-display-chat-display-message-content-mat nobg">
                        <img src={ stickers[content] } alt="sticker" />
                    </div>
                );
            break;
            case 'ACTION_TYPE':
                a = (
                    <div className="rn-home-display-chat-display-message-content-mat nobg action">
                        <img src={ actions[content].url } alt="action sticker" />
                        <p>{ actions[content].description }</p>
                    </div>
                )
            break;
        }

        return a;
    }

    return(
        <div className={ `rn-home-display-chat-display-message${ (!clients) ? "" : " right" }` }>
            <div className="rn-home-display-chat-display-message-content">
                <div className="rn-home-display-chat-display-message-content-avatar">
                    <img src={ (avatar) ? apiPath.storage + avatar : "" } alt="user's avatar" />
                </div>
                { getContent() }
            </div>
            <div className="rn-home-display-chat-display-message-time">
                <span>{ convertTime(time) }</span>
            </div>
        </div>
    );
}

class DisplayChatDisplay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fetchingMore: false
        }

        this.anchorRef = this.matDisplayRef = React.createRef();
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate(nProps) {
        if(this.state.fetchingMore) { // fetched
            this.matDisplayRef.scrollTo({
                top: this.matDisplayRef.scrollHeight - this.state.fetchingMore
            });
        } else if( // added
            nProps.messages &&
            this.props.messages &&
            nProps.messages.length < this.props.messages.length
        ) { // best way
            if(!this.state.fetchingMore) this.scrollToBottom();
            else this.setState(() => ({ fetchingMore: false }));
        }
    }

    scrollToBottom = () => {
        this.anchorRef.scrollIntoView();
    }

    fetchMoreMessages = () => {
        let a = this.matDisplayRef;
        if(a.scrollTop === 0) {
            this.setState(() => ({
                fetchingMore: a.scrollHeight
            }), this.props.fetchMoreMessages);
        }
    }

    render() {
        return(
            <div
                className="rn-home-display-chat-display"
                ref={ ref => this.matDisplayRef = ref }
                onScroll={ this.fetchMoreMessages }>
                {
                    this.props.messages.map(({ id, content, time, type, isSeen, creator }) => (
                        <DisplayChatDisplayMessage
                            key={ id }
                            content={ content }
                            time={ time }
                            type={ type }
                            isSeen={ isSeen }
                            creator={ creator }
                            clients={ creator.id === cookieControl.get("userdata").id }
                        />
                    ))
                }
                <div className="rn-home-display-chat-display-anchor" ref={ ref => this.anchorRef = ref } />
            </div>
        );
    }
}

const DisplayChatInputAction = ({ title, _onClick }) => (
    <button
        className="rn-home-display-chat-input-actions-action definp"
        onClick={ _onClick }>
        { title }
    </button>
)

class DisplayChatInput extends Component {
    constructor(props) {
        super(props);

        this.matRef = React.createRef();
    }

    sendMessage = (type = "", content = "") => {
        let a = a => (a.toString().replace(/ /g, "").length) ? true:false,
            b = this.matRef.value;
        if(!a(content) && !a(b)) return;

        this.props.onSendMessage(type || "TEXT_TYPE", content || b);
        this.matRef.value = "";
    }

    render() {
        return(
            <div className="rn-home-display-chat-input">
                <div className="rn-home-display-chat-input-actions">
                {
                    Object.keys(actions).map((session, index) => (
                        <DisplayChatInputAction
                            key={ index }
                            title={ actions[session].title }
                            _onClick={ () => this.sendMessage("ACTION_TYPE", session) }
                        />
                    ))
                }
                </div>
                <div className="rn-home-display-chat-input-mat">
                    <div className="rn-home-display-chat-input-mat-btn">
                        <div className="rn-home-display-chat-input-mat-btn-display">
                            {
                                Object.keys(stickers).map((session, index) => (
                                    <img
                                        key={ index }
                                        alt="chat sticker display"
                                        className="rn-home-display-chat-input-mat-btn-display-btn"
                                        src={ stickers[session] }
                                        onClick={ () => this.sendMessage("STICKER_TYPE", session) }
                                    />
                                ))
                            }
                        </div>
                        <button className="definp"><i className="far fa-sticky-note" /></button>
                    </div>
                    <input
                        type="text"
                        className="rn-home-display-chat-input-mat-input definp"
                        placeholder="Type a message.."
                        ref={ ref => this.matRef = ref }
                        onKeyDown={ ({ keyCode }) => (keyCode === 13) ? this.sendMessage() : null }
                    />
                    <div className="rn-home-display-chat-input-mat-send">
                        <button className="definp" onClick={ this.sendMessage }>
                            <i className="far fa-paper-plane" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class DisplayChat extends Component {
    render() {
        if(this.props.isVoid) return(
            <div className="rn-home-display-chat">
                <p className="rn-home-display-chat-alert">Choose a conversation</p>
            </div>
        );
        else if(this.props.isLoading) return(
            <div className="rn-home-display-chat">
                <div className="rn-home-display-chat-loader" />
            </div>
        )

        return(
            <div className="rn-home-display-chat">
                <div className="rn-home-display-chat-name">
                    {
                        (this.props.isVoid) ? null : (
                            <h2 className="rn-home-display-chat-name-mat">Oles Odynets</h2>
                        )
                    }
                </div>
                <DisplayChatDisplay
                    messages={ (this.props.conversation) ? this.props.conversation.messages : [] }
                    fetchMoreMessages={ this.props.fetchMoreMessages }
                />
                <DisplayChatInput
                    onSendMessage={ this.props.onSendChatMessage }
                />
            </div>
        );
    }
}

class Display extends Component {
    render() {
        return(
            <div className="rn-home-display">
                <DisplayConversations
                    onRequestConversation={ this.props.onRequestConversation }
                />
                <DisplayChat
                    isLoading={ this.props.conversation === false }
                    isVoid={ this.props.conversation === null }
                    conversation={ this.props.conversation }
                    onSendChatMessage={ this.props.onSendChatMessage }
                    fetchMoreMessages={ this.props.fetchMoreMessages }
                />
            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            conversation: null,
            isFetchingMessages: false,
            messagesIsFetchable: true
        }
    }

    componentDidMount() {
        this.fetchPrimary();
    }

    fetchPrimary = () => {
        this.props.updateSession({ conversations: false });

        let { id, authToken } = cookieControl.get("userdata");
        client.query({
            query: gql`
                query($id: ID!, $authToken: String!) {
                    user(id: $id, authToken: $authToken) {
                        id,
                        status,
                        conversations {
                            id,
                            previewTitle(id: $id),
                            previewImage(id: $id),
                            previewContent,
                            previewTime,
                            unSeenMessages(id: $id)
                        }
                    }
                } 
            `,
            variables: {
                id, authToken
            }
        }).then(({ data: { user } }) => {
            if(!user) this.props.failSession();

            this.props.updateSession(user);
            this.subscribeToConversations();
        }).catch(this.props.failSession);
    }

    subscribeToMessages = () => {
        if(!this.state.conversation || !this.state.conversation.id) return;
        let a = this.state.conversation;

        let { id, authToken } = cookieControl.get("userdata");
       this.conversationSubscriptionPromise = client.subscribe({
            query: gql`
                subscription($id: ID!, $authToken: String!, $conversationID: ID!) {
                    newChatMessage(id: $id, authToken: $authToken, conversationID: $conversationID) {
                        id,
                        content,
                        time,
                        type,
                        isSeen,
                        conversation {
                            id
                        },
                        creator {
                            id,
                            avatar
                        }
                    }
                }
            `,
            variables: {
                id, authToken,
                conversationID: a.id
            }
        }).subscribe({next: ({ data: { newChatMessage: message } }) => {
            if(!message || !this.state.conversation || this.state.conversation.id !== a.id) this.failSession();

            this.setState(({ conversation, conversation: { messages } }) => ({
                conversation: {
                    ...conversation,
                    messages: [
                        ...messages,
                        message
                    ]
                }
            }));
        }});
    }

    subscribeToConversations = () => {
        let { id, authToken } = cookieControl.get("userdata");
        client.subscribe({
            query: gql`
                subscription($id:ID! , $authToken: String!) {
                    chatConversationUpdated(id: $id, authToken: $authToken) {
                        id,
                        previewTitle(id: $id),
                        previewImage(id: $id),
                        previewContent,
                        previewTime,
                        unSeenMessages(id: $id)
                    }
                }              
            `,
            variables: {
                id, authToken
            }
        }).subscribe({next: ({ data: { chatConversationUpdated: conversation } }) => {
            if(!this.props.user || !this.props.user.conversations) return;

            let a = Array.from(this.props.user.conversations),
                b = a.findIndex( ({ id }) => id === conversation.id );
            if(b === -1) return;

            a[b] = conversation;
            this.props.updateSession({ conversations: a });
        }});
    }

    viewMessages = () => {
        let a = this.state.conversation;
        if(!a) return;

        this.setState(() => ({
            messagesIsFetchable: true
        }));

        {
            let b = Array.from(this.props.user.conversations);
            if(b) {
                let c = b[b.findIndex( ({ id }) => a.id )];
                if(c === -1) return;

                c.unSeenMessages = 0;
                this.props.updateSession({ conversations: b });
            }
        }

        let { id, authToken } = cookieControl.get("userdata");
        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $conversationID: ID!) {
                    viewMessages(id: $id, authToken: $authToken, conversationID: $conversationID)
                }
            `,
            variables: {
                id, authToken,
                conversationID: a.id
            }
        }).then(({ data: { viewMessages: data } }) => {
            if(!data) return this.failSession();
        }).catch(this.failSession);
    }

    getConversation = conversationID => {
        if(this.state.conversation && conversationID === this.state.conversation.id) return;

        this.setState(() => ({
            conversation: false
        }));

        let { id, authToken } = cookieControl.get("userdata");
        client.query({
            query: gql`
                query($id: ID!, $authToken: String!, $conversationID: ID!, $limit: Int) {
                    conversation(id: $id, authToken: $authToken, conversationID: $conversationID) {
                        id,
                        messages(limit: $limit) {
                            id,
                            content,
                            time,
                            type,
                            isSeen,
                            creator {
                                id,
                                avatar
                            }
                        }
                    }
                }
            `,
            variables: {
                id, authToken, conversationID,
                limit: messagesLimiter
            }
        }).then(({ data: { conversation } }) => {
            if(!conversation) return this.props.failSession();

            this.setState(() => ({
                conversation: {
                    ...conversation,
                    messages: conversation.messages.reverse()
                }
            }), () => {
                this.viewMessages();
                this.subscribeToMessages();
            });
        }).catch(this.props.failSession)
    }

    sendMessage = (type, content) => {
        if(!this.state.conversation) return;

        let a = cookieControl.get("userdata"),
            b = Array.from(this.state.conversation.messages),
            c = {
                id: b.length * 2,
                content, type,
                time: (new Date()).getTime().toString(), // compress to default
                isSeen: false,
                creator: {
                    id: a.id,
                    avatar: ""
                }
            }

        this.setState(({ conversation }) => ({
            conversation: {
                ...conversation,
                messages: [
                    ...b,
                    c
                ]
            }
        }));

        client.mutate({
            mutation: gql`
                mutation($id: ID!, $authToken: String!, $content: String!, $type: String!, $conversationID: ID!) {
                    createMessage(id: $id, authToken: $authToken, content: $content, type: $type, conversationID: $conversationID) {
                        id,
                        isSeen,
                        creator {
                            id,
                            avatar
                        }
                    }
                }
            `,
            variables: {
                id: a.id,
                authToken: a.authToken,
                content, type,
                conversationID: this.state.conversation.id
            }
        }).then(({ data: { createMessage: message } }) => {
            if(!message) return this.props.failSession;

            c.id = message.id;
            c.isSeen = message.isSeen;
            c.creator.id = message.creator.id;
            c.creator.avatar = message.creator.avatar;

            b.push(c);
            this.setState(({ conversation }) => ({
                conversation: {
                    ...conversation,
                    messages: b
                }
            }));
        }).catch(this.props.failSession);
    }

    fetchMoreMessages = () => {
        if(this.state.isFetchingMessages || !this.state.messagesIsFetchable) return;
        let QrP = fl => this.setState(() => ({ isFetchingMessages: fl }));

        QrP(true);

        let { id, authToken } = cookieControl.get("userdata");
        let a = this.state.conversation,
            b = a.messages,
            c = a.id;

        client.query({
            query: gql`
                query($id: ID!, $authToken: String!, $conversationID: ID!, $cursorID: ID, $limit: Int) {
                    conversationMessages(id: $id, authToken: $authToken, conversationID: $conversationID, cursorID: $cursorID, limit: $limit) {
                        id,
                        content,
                        time,
                        type,
                        isSeen,
                        conversation {
                            id
                        },
                        creator {
                            id,
                            avatar
                        }
                    }
                }
            `,
            variables: {
                id, authToken,
                conversationID: c,
                cursorID: b[0].id,
                limit: messagesLimiter
            }
        }).then(({ data: { conversationMessages: pack } }) => {
            QrP(false);
            if(!pack) return this.props.failSession();
            if(!this.state.conversation || c !== this.state.conversation.id) return;

            this.setState(({ conversation, conversation: { messages } }) => ({
                conversation: {
                    ...conversation,
                    messages: [
                        ...pack.reverse(),
                        ...messages
                    ]
                },
                messagesIsFetchable: pack.length >= messagesLimiter // XIE
            }));
        }).catch(this.props.failSession);
    }

    render() {
        return(
            <div className="rn rn-home">
                <Navigation />
                <Display
                    conversation={ this.state.conversation }
                    onRequestConversation={ this.getConversation }
                    onSendChatMessage={ this.sendMessage }
                    fetchMoreMessages={ this.fetchMoreMessages }
                />
            </div>
        );
    }
}

const mapStateToProps = ({ user }) => ({
    user
});

const mapActionsToProps = {
    failSession: () => ({ type: "UPDATE_ERROR_STATE", payload: true }),
    updateSession: payload => ({ type: "SET_SESSION_DATA", payload })
}

export default connect(
    mapStateToProps,
    mapActionsToProps
)(App);