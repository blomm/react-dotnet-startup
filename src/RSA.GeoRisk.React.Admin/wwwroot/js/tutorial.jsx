//based on this tutorial
//https://reactjs.net/getting-started/tutorial.html

//install the React.AspNet package

//var data = [
//  { id: 1, author: "Daniel Lo Nigro", text: "Hello ReactJS.NET World!" },
//  { id: 2, author: "Pete Hunt", text: "This is one comment" },
//  { id: 3, author: "Jordan Walke", text: "This is *another* comment mb" }
//];

var CommentBox = React.createClass({
    //getInitialState() executes exactly once during the lifecycle of the component and sets up the initial state of the component.
    getInitialState: function () {
        return { data: [] };
    },
    //componentDidMount() is a method called automatically by React after a component is rendered for the first time
    componentDidMount: function () {
        this.loadCommentsFromServer();
        window.setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    //by moving the XMLHttpRequest call from componentWillMount(), which is executed only once before rendering, 
    //to a function called loadCommentsFromServer(), we can then call it multiple times from componentDidMount() 
    //at a set interval to check for any updates to the comments
    loadCommentsFromServer: function () {
        var xhr = new XMLHttpRequest();
        xhr.open('get', this.props.url, true);
        xhr.onload = function () {
            var data = JSON.parse(xhr.responseText);
            //The key to dynamic updates is the call to this.setState(). We replace the old array of comments with the new one from the server and the UI automatically updates itself
            this.setState({ data: data });
        }.bind(this);
        xhr.send();
    },
    handleCommentSubmit: function (comment) {
        var data = new FormData();
        data.append('author', comment.author);
        data.append('text', comment.text);

        var xhr = new XMLHttpRequest();
        xhr.open('post', this.props.submitUrl, true);
        xhr.onload = function () {
            this.loadCommentsFromServer();
        }.bind(this);
        xhr.send(data);
    },
    //componentWillMount() executes immediately and only once before the rendering occurs
    //componentWillMount() loads the data from our XMLHttpRequest and assigns it to the data variable
    //componentWillMount: function() {
    //    var xhr = new XMLHttpRequest();
    //    xhr.open('get', this.props.url, true);
    //    xhr.onload = function() {
    //        var data = JSON.parse(xhr.responseText);
    //        this.setState({ data: data });
    //    }.bind(this);
    //    xhr.send();
    //},
    render: function() {
        return (
          <div className="commentBox">
            <h1>Comments</h1>
            <CommentList data={this.state.data} />
            <CommentForm onCommentSubmit={this.handleCommentSubmit} />
          </div>
      );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return(
                <Comment author={comment.author} key={comment.id}>
                  {comment.text}
                </Comment>
            );
        });
        return (
          <div className="commentList">
            {commentNodes}
          </div>
        );
    }
});

var Comment = React.createClass({
    rawMarkup: function() {
        var md = new Remarkable();
        var rawMarkup = md.render(this.props.children.toString());
        return { __html: rawMarkup };
    },
    render: function () {
        var md = new Remarkable();
        return (
          <div className="comment">
            <h2 className="commentAuthor">
              {this.props.author}
            </h2>
            <span dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
      );
    }
});

var CommentForm = React.createClass({
    getInitialState: function () {
        return { author: '', text: '' };
    },
    handleAuthorChange: function (e) {
        this.setState({ author: e.target.value });
    },
    handleTextChange: function (e) {
        this.setState({ text: e.target.value });
    },
    handleSubmit: function (e) {
        //Call preventDefault() on the event to prevent the browser's default action of submitting the form
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        // send request to the server
        this.props.onCommentSubmit({ author: author, text: text });
        this.setState({author: '', text: ''});
    },
    //React.createClass(...) automatically binds each method to its component instance
    render: function() {
        return (
          <form className="commentForm" onSubmit={this.handleSubmit}>
            <input
                type="text"
                placeholder="Your name"
                value={this.state.author}
                onChange={this.handleAuthorChange}
            />
            <input
                type="text"
                placeholder="Say something..."
                value={this.state.text}
                onChange={this.handleTextChange}
            />
            <input type="submit" value="Post" />
        </form>
      );
    }
});


ReactDOM.render(
  <CommentBox url="/comments" submitUrl="/comments/new" pollInterval={2000}/>,
  document.getElementById('content')
);