import apiClient from 'panoptes-client/lib/api-client.js';
import counterpart from 'counterpart';
import { getSessionID } from '../lib/get-session-id';

//Action Types
const SUBMIT_CLASSIFICATION = 'SUBMIT_CLASSIFICATION';
const CREATE_CLASSIFICATION = 'CREATE_CLASSIFICATION';

const initialState = {
  classification: null,
};

const classificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CLASSIFICATION:
      return Object.assign({}, state, {
        classification: action.classification,
      });

    case SUBMIT_CLASSIFICATION:
      const classification = state.classification;
      classification.annotations.push(action.annotations);
      classification.update({
        completed: true,
        'metadata.finished_at': (new Date()).toISOString(),
        'metadata.viewport': {
          width: innerWidth,
          height: innerHeight
        }
      }).save();
      // classification.metadata.session = getSessionID();

    default:
      return state;
  }
};

const createClassification = () => {
  return (dispatch, getState) => {
    let version = "";
    if (getState().workflow.data) {
      version = getState().workflow.data.version;
    }
    const dimensions = [];
    const classification = apiClient.type('classifications').create({
      annotations: [],
      metadata: {
        workflow_version: version,
        started_at: (new Date).toISOString(),
        user_agent: navigator.userAgent,
        user_language: counterpart.getLocale(),
        utc_offset: ((new Date).getTimezoneOffset() * 60).toString(),
        subject_dimensions: []
      },
      links: {
        project: getState().project.id,
        workflow: getState().workflow.id,
        subjects: [getState().subject.id]
      }
    });
    classification._workflow = getState().workflow.data;
    classification._subjects = [getState().subject.currentSubject];

    dispatch({
      type: CREATE_CLASSIFICATION,
      classification
    });
  };
};

const submitClassification = () => {
  return (dispatch, getState) => {
    let task = "T0";
    if (getState().workflow.data) {
      task = getState().workflow.data.first_task;
    }
    const annotations = {
      _key: Math.random(),
      _toolIndex: 0,
      task: task,
      value: getState().annotations.annotations,
    }

    dispatch({
      annotations,
      type: SUBMIT_CLASSIFICATION,
      task
    });
  };
};

export default classificationReducer;

//------------------------------------------------------------------------------

//Exports

export {
  createClassification,
  submitClassification,
};
