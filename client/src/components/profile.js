import React, { Component } from 'react';
import Header from './header';
import Footer from './footer';
import Favorites from './favorites';
import { Redirect } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';


class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: [],
      interestTag: [],
      favoritesList: [],
      isAuthenticated: true,
      userId: 0
    };
  }

  componentDidMount() {
    const {id} = this.props.match.params;
    fetch('/login') 
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      console.log('res is ' + res);
      return res.json();
    })
    .then(json => {
      console.log(json);
      this.setState ({
        userId: json[0].userId
      });
      return Promise.all ([
        fetch(`/api/v1/users/${id}`),
        fetch(`/api/v1/users/${id}/interests`),
        fetch(`/api/v1/users/${id}/favorites`)
      ]);
    })
      .then(([results1, results2, results3]) => {
        if (results1.status === 401 || results2.status === 401 || results3.status === 401) {
          return this.setState ({
            isAuthenticated: false
          });
        }
        return Promise.all([results1.json(), results2.json(), results3.json()]);
      })
      .then(([json1, json2, json3]) => {
        console.log(json2);
        this.setState ({
          user: json1,
          interestTag: json2,
          favoritesList: json3
        });
      })
      .catch(error => console.log(error))
  }
 

  removeFavoite(event, i) {
    event.preventDefault(event);
    const {id} = this.props.match.params;
    console.log(this.state.favoritesList[i]);
    
    fetch(`/api/v1/users/${id}/favorites/${this.state.favoritesList[i].selectedUserId}`, {
      method: 'DELETE'
    })
    .then (results => {
      if (!results.ok) {
        throw Error(results.statusText);
      }
      let arr = this.state.favoritesList;
      arr.splice(i, 1);
      this.setState ({
        favoritesList: arr
      });
    })
  }

  render() {

    if (this.state.isAuthenticated === false) {
      return <Redirect to="/" />
    }

    const id = this.props.match.params.id;

    return (

        <div>
        <div><Header/></div>
          <hr/>
          <hr/>
          <hr/>
          <hr/>
          <div className="text-center bg-white">      
            {
              this.state.user.map((e, i) => {
                return <div className="container" key={e.userId}>
                          <img src={e.photo}></img>
                          <p>{e.firstName} {e.lastName}</p>
                          <p>{e.jobType}</p>
                          <p>{e.location}</p>
                          <p>{e.intro}</p>
                          <p>{e.meeting ? 'in person' : 'online'}</p>
                          
                          {
                          (e.role === 0) ? <p>{'mentor'}</p>
                          : (e.role === 1) ? <p>{'mentee'}</p>  
                          : (e.role === 2) ? <p>{'mentor' + 'mentee'}</p>
                          : <p></p>
                          }

                          <p>{e.years} year</p>
                          <p>{e.industry}</p>
                          {this.state.interestTag.map( e => {
                            return <p key={e.interestId}>{e.interestTag}</p>


                          })
                        
                        
                        }                       
                      </div>
              })
            }
          </div> 
          {console.log(id)}
          {console.log(this.state.userId)}
        {
          
          id === this.state.userId 
          ? <div><Favorites favoritesList={this.state.favoritesList} removeFavoite={(e, i) => this.removeFavoite(e, i)}/></div>
          : null
        } 
      
        <div><Footer/></div>
        </div>
    );
  }
}

export default Profile;