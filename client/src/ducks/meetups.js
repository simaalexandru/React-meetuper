import { appName } from '../config';
import { List, fromJS, Map } from 'immutable';
import { createSelector } from 'reselect';
import { takeEvery, call, put, all } from 'redux-saga/effects';
import ApiService from '../services/api';
import { replace } from 'connected-react-router';

export const moduleName = 'meetups';
const prefix = `${appName}/${moduleName}`;

/*
 * Constants
 * */
export const FETCH_ALL_REQUEST = `${prefix}/FETCH_ALL_REQUEST`;

export const FETCH_BOOKS_REQUEST = `${prefix}/FETCH_BOOKS_REQUEST`;
export const FETCH_BOOKS_SUCCESS = `${prefix}/FETCH_BOOKS_SUCCESS`;
export const FETCH_BOOKS_ERROR = `${prefix}/FETCH_BOOKS_ERROR`;

export const FETCH_BOOK_BY_ID = `${prefix}/FETCH_BOOK_BY_ID`;
export const FETCH_BOOK_BY_ID_REQUEST = `${prefix}/FETCH_BOOK_BY_ID_REQUEST`;
export const FETCH_BOOK_BY_ID_SUCCESS = `${prefix}/FETCH_BOOK_BY_ID_SUCCESS`;
export const FETCH_BOOK_BY_ID_ERROR = `${prefix}/FETCH_BOOK_BY_ID_ERROR`;

export const ADD_BOOK_REQUEST = `${prefix}/ADD_BOOK_REQUEST`;
export const ADD_BOOK_SUCCESS = `${prefix}/ADD_BOOK_SUCCESS`;
export const ADD_BOOK_ERROR = `${prefix}/ADD_BOOK_ERROR`;

export const DELETE_BOOK_REQUEST = `${prefix}/DELETE_BOOK_REQUEST`;
export const DELETE_BOOK_SUCCESS = `${prefix}/DELETE_BOOK_SUCCESS`;
export const DELETE_BOOK_ERROR = `${prefix}/DELETE_BOOK_ERROR`;

export const FETCH_MEETUPS_REQUEST = `${prefix}/FETCH_MEETUPS_REQUEST`;
export const FETCH_MEETUPS_SUCCESS = `${prefix}/FETCH_MEETUPS_SUCCESS`;
export const FETCH_MEETUPS_ERROR = `${prefix}/FETCH_MEETUPS_ERROR`;

export const FETCH_MEETUP_BY_ID = `${prefix}/FETCH_MEETUP_BY_ID`;
export const FETCH_MEETUP_BY_ID_REQUEST = `${prefix}/FETCH_MEETUP_BY_ID_REQUEST`;
export const FETCH_MEETUP_BY_ID_SUCCESS = `${prefix}/FETCH_MEETUP_BY_ID_SUCCESS`;
export const FETCH_MEETUP_BY_ID_ERROR = `${prefix}/FETCH_MEETUP_BY_ID_ERROR`;

/**
 * Reducer
 * */

export const ReducerRecord = fromJS({
  user: 'Alex',
  error: null,
  loading: false,
  meetups: new List([]),
  meetup: {}
});

export default function reducer(state = ReducerRecord, action) {
  const { type, payload } = action;

  switch (type) {
    case FETCH_MEETUP_BY_ID_REQUEST:
    case FETCH_MEETUPS_REQUEST:
    case ADD_BOOK_REQUEST:
    case FETCH_BOOK_BY_ID_REQUEST:
    case FETCH_BOOK_BY_ID:
      return state.set('loading', true);

    case FETCH_MEETUPS_SUCCESS:
      return state
        .set('meetups', fromJS(payload.data))
        .set('loading', false)
        .set('error', null);

    case FETCH_MEETUP_BY_ID_SUCCESS:
      return state
        .set('meetup', fromJS(payload.data))
        .set('loading', false)
        .set('error', null);

    case FETCH_MEETUPS_ERROR:
    case FETCH_MEETUP_BY_ID_ERROR:
    case ADD_BOOK_ERROR:
    case DELETE_BOOK_ERROR:
      return state.set('error', payload.err).set('loading', false);

    case ADD_BOOK_SUCCESS:
      return state
        .set('error', null)
        .set('loading', false)
        .update('books', (books) => books.push(fromJS(payload.data)));

    case DELETE_BOOK_SUCCESS:
      return state
        .set('loading', false)
        .set('error', null)
        .update('books', (books) => {
          return books.filter((book) => book.get('id') !== payload);
        });

    case 'UPDATE_MEETUP_SUCCESS':
      return state
        .set('error', null)
        .set('loading', false)
        .update('books', (books) =>
          books.map((book) =>
            book.get('id') === payload.data.id ? fromJS(payload.data) : book
          )
        );

    default:
      return state;
  }
}

/**
 * Selectors
 * */

export const stateSelector = (state) => state[moduleName];

export const loadingMeetupsSelector = createSelector(
  stateSelector,
  (state) => state.get('loading')
);
export const allMeetupsSelector = createSelector(
  stateSelector,
  (state) => state.get('meetups').toJS()
);
export const meetupSelector = createSelector(
  stateSelector,
  (state) => state.get('meetup').toJS()
);

export const meetupCreatorSelector = createSelector(
  stateSelector,
  (state) => state.get('meetup').toJS().meetupCreator
);

/**
 * Action Creators
 * */

export const fetchAllMeetups = () => {
  return {
    type: FETCH_ALL_REQUEST
  };
};

export const fetchMeetupById = (meetupId) => {
  return {
    type: FETCH_MEETUP_BY_ID,
    payload: { meetupId }
  };
};

export const addBook = (book) => {
  return {
    type: ADD_BOOK_REQUEST,
    payload: { book }
  };
};

export const deleteBook = (bookId) => {
  return {
    type: DELETE_BOOK_REQUEST,
    payload: { bookId }
  };
};

export const updateBook = (bookId, newBook) => {
  return {
    type: 'UPDATE_BOOK_REQUEST',
    payload: { bookId, newBook }
  };
};

/**
 * Sagas
 */
export function* fetchAllMeetupsSaga() {
  try {
    yield put({
      type: FETCH_MEETUPS_REQUEST
    });

    const { data } = yield call(ApiService.getAllMeetups);

    yield put({
      type: FETCH_MEETUPS_SUCCESS,
      payload: { data }
    });
  } catch (err) {
    console.log(err);
    yield put({
      type: FETCH_MEETUPS_ERROR,
      payload: { err }
    });
  }
}

export function* fetchMeetupByIdSaga(action) {
  const { payload } = action;

  try {
    yield put({
      type: FETCH_MEETUP_BY_ID_REQUEST
    });

    const { data } = yield call(ApiService.getMeetupById, payload.meetupId);

    yield put({
      type: FETCH_MEETUP_BY_ID_SUCCESS,
      payload: { data }
    });
  } catch (err) {
    console.log(err);

    yield put({
      type: FETCH_MEETUP_BY_ID_ERROR,
      payload: { err }
    });
  }
}

export function* addBookSaga(action) {
  const { payload } = action;

  try {
    const { data } = yield call(ApiService.addBook, payload.book);

    yield put({
      type: ADD_BOOK_SUCCESS,
      payload: { data }
    });

    yield put(replace('/'));
  } catch (err) {
    console.log(err);
    yield put({
      type: ADD_BOOK_ERROR,
      payload: { err }
    });
  }
}

export function* deleteBookSaga(action) {
  const {
    payload: { bookId }
  } = action;

  try {
    yield call(ApiService.deleteBook, bookId);

    yield put({
      type: DELETE_BOOK_SUCCESS,
      payload: bookId
    });
  } catch (err) {
    console.log(err);
    yield put({
      type: DELETE_BOOK_ERROR,
      payload: { err }
    });
  }
}

export function* updateBookSaga(action) {
  const {
    payload: { bookId, newBook }
  } = action;

  try {
    const { data } = yield call(ApiService.updateBook, bookId, newBook);

    yield put({
      type: 'UPDATE_BOOK_SUCCESS',
      payload: { data }
    });

    yield put(replace('/'));
  } catch (err) {
    console.log(err);
    yield put({
      type: 'UPDATE_BOOK_ERROR',
      payload: { err }
    });
  }
}

export function* saga() {
  yield all([
    takeEvery(FETCH_ALL_REQUEST, fetchAllMeetupsSaga),
    takeEvery(FETCH_MEETUP_BY_ID, fetchMeetupByIdSaga),
    takeEvery(ADD_BOOK_REQUEST, addBookSaga),
    takeEvery(DELETE_BOOK_REQUEST, deleteBookSaga)
  ]);
}
