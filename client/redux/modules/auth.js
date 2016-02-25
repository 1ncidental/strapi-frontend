import { push } from 'react-router-redux';
import fetch from 'isomorphic-fetch';

const baseURL = 'http://localhost:1337/api';

// Constants

const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
const SIGNIN_FAILURE = 'SIGNIN_FAILURE';
const SIGNOUT = 'SIGNOUT';

// Actions

function requestJwt(creds) {
  return {
    type: SIGNIN_REQUEST,
    creds,
  };
}

function receiveJwt(user, jwt) {
  return {
    type: SIGNIN_SUCCESS,
    user,
    jwt,
  };
}

function signinError(message) {
  return {
    type: SIGNIN_FAILURE,
    message,
  };
}

function signinUser(creds) {
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json', // eslint-disable-line quote-props
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(creds),
  };

  return dispatch => {
    dispatch(requestJwt(creds));

    return fetch(`${baseURL}/auth/local`, options).then((response) => {
      return response.json();
    }).then((json) => {
      if (!json.jwt) {
        return Promise.reject(json.message);
      }

      localStorage.setItem('strapiUser', json.user);
      localStorage.setItem('strapiJwt', json.jwt);
      dispatch(receiveJwt(json.user, json.jwt));
      dispatch(push('/'));
      return Promise.resolve();
    }).catch((err) => {
      dispatch(signinError(err));
    });
  };
}

function signout() {
  return {
    type: SIGNOUT,
  };
}

function signoutUser() {
  return dispatch => {
    localStorage.removeItem('strapiUser');
    localStorage.removeItem('strapiJwt');
    dispatch(signout());
    dispatch(push('/'));
  };
}

// Exposed Actions

export const actions = {
  signinUser,
  signoutUser,
};

// Reducers

const initialState = {
  isFetching: false,
  isAuthenticated: localStorage.getItem('strapiJwt') !== null,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case SIGNIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
      });
    case SIGNIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        user: action.user,
        jwt: action.jwt,
      });
    case SIGNIN_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
      });
    case SIGNOUT:
      return Object.assign({}, state, {
        isAuthenticated: false,
      });
    default:
      return state;
  }
}
