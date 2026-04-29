import React, { useEffect, useReducer, useMemo } from 'react';
import AssessmentIntro from './AssessmentIntro';
import LiteWizard from './LiteWizard';
import FullAccordion from './FullAccordion';
import BasicResults from './BasicResults';
import EmailGate from './EmailGate';
import DetailedResults from './DetailedResults';
import { computeScores } from './scoring';
import { fetchQuestions, submitAssessment } from './webApi';
import { loadDraft, saveDraft, clearDraft } from './storage';

const STATES = {
  INTRO: 'intro',
  LITE: 'lite',
  FULL: 'full',
  BASIC_RESULTS: 'basic_results',
  DETAILED_RESULTS: 'detailed_results',
};

const initialState = {
  state: STATES.INTRO,
  responses: {},
  mode: null,
  submitting: false,
  errorMessage: null,
  serverScores: null,
  email: '',
};

function reducer(s, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...s, ...action.payload };
    case 'START_LITE':
      return { ...s, state: STATES.LITE, mode: 'lite' };
    case 'START_FULL':
      return { ...s, state: STATES.FULL, mode: 'full' };
    case 'ANSWER':
      return { ...s, responses: { ...s.responses, [action.qid]: action.score } };
    case 'SHOW_BASIC':
      return { ...s, state: STATES.BASIC_RESULTS };
    case 'SUBMITTING':
      return { ...s, submitting: true, errorMessage: null };
    case 'SUBMIT_ERROR':
      return { ...s, submitting: false, errorMessage: action.message };
    case 'SUBMIT_SUCCESS':
      return {
        ...s,
        submitting: false,
        state: STATES.DETAILED_RESULTS,
        serverScores: action.scores,
        email: action.email,
      };
    case 'UPGRADE_TO_FULL':
      return { ...s, state: STATES.FULL, mode: 'full' };
    case 'RESTART':
      return { ...initialState };
    default:
      return s;
  }
}

export default function AIAssessment() {
  const [questions, setQuestions] = React.useState([]);
  const [loadError, setLoadError] = React.useState(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetchQuestions()
      .then((qs) => setQuestions(qs))
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.responses && (draft.mode === 'lite' || draft.mode === 'full')) {
      dispatch({
        type: 'HYDRATE',
        payload: {
          responses: draft.responses,
          mode: draft.mode,
          state: draft.state || (draft.mode === 'lite' ? STATES.LITE : STATES.FULL),
        },
      });
    }
  }, []);

  useEffect(() => {
    if (state.state === STATES.LITE || state.state === STATES.FULL) {
      saveDraft({ responses: state.responses, mode: state.mode, state: state.state });
    }
  }, [state.responses, state.mode, state.state]);

  const liteQuestions = useMemo(() => questions.filter((q) => q.lite), [questions]);

  const liteScoresLive = useMemo(
    () => computeScores(state.responses, liteQuestions),
    [state.responses, liteQuestions]
  );
  const fullScoresLive = useMemo(
    () => computeScores(state.responses, questions),
    [state.responses, questions]
  );

  const onAnswer = (qid, score) => dispatch({ type: 'ANSWER', qid, score });
  const onCompleteQuiz = () => dispatch({ type: 'SHOW_BASIC' });

  const onSubmit = async ({ firstName, company, email, website }) => {
    dispatch({ type: 'SUBMITTING' });
    try {
      const filtered = state.mode === 'lite'
        ? Object.fromEntries(Object.entries(state.responses).filter(([qid]) => liteQuestions.some((q) => q.id === qid)))
        : state.responses;
      const result = await submitAssessment({
        email,
        firstName,
        company,
        mode: state.mode,
        responses: filtered,
        website,
      });
      clearDraft();
      dispatch({ type: 'SUBMIT_SUCCESS', scores: result.scores, email });
    } catch (e) {
      dispatch({ type: 'SUBMIT_ERROR', message: e.message || 'Something went wrong. Please try again.' });
    }
  };

  const onUpgradeToFull = () => dispatch({ type: 'UPGRADE_TO_FULL' });
  const onRestart = () => {
    clearDraft();
    dispatch({ type: 'RESTART' });
  };
  const onBookCall = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const onCancel = () => {
    clearDraft();
    dispatch({ type: 'RESTART' });
  };

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-slate-500">
        Couldn't load the assessment right now. Please try again later.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  switch (state.state) {
    case STATES.INTRO:
      return (
        <AssessmentIntro
          onStartLite={() => dispatch({ type: 'START_LITE' })}
          onStartFull={() => dispatch({ type: 'START_FULL' })}
        />
      );
    case STATES.LITE:
      return (
        <LiteWizard
          liteQuestions={liteQuestions}
          responses={state.responses}
          onChange={onAnswer}
          onComplete={onCompleteQuiz}
          onBack={onCancel}
        />
      );
    case STATES.FULL:
      return (
        <FullAccordion
          questions={questions}
          responses={state.responses}
          onChange={onAnswer}
          onComplete={onCompleteQuiz}
          onBack={onCancel}
        />
      );
    case STATES.BASIC_RESULTS: {
      const liveScores = state.mode === 'lite' ? liteScoresLive : fullScoresLive;
      return (
        <div className="space-y-2">
          <BasicResults scores={liveScores} mode={state.mode} />
          <EmailGate
            onSubmit={onSubmit}
            submitting={state.submitting}
            errorMessage={state.errorMessage}
          />
        </div>
      );
    }
    case STATES.DETAILED_RESULTS:
      return (
        <DetailedResults
          scores={state.serverScores || {}}
          questions={questions}
          mode={state.mode}
          email={state.email}
          onTakeFull={onUpgradeToFull}
          onRestart={onRestart}
          onBookCall={onBookCall}
        />
      );
    default:
      return null;
  }
}
