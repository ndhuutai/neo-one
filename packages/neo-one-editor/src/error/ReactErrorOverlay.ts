/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// tslint:disable
import { listenToRuntimeErrors } from './listenToRuntimeErrors';
import { iframeStyle } from './styles';
import { applyStyles } from './dom/css';

// Importing iframe-bundle generated in the pre build step as
// a text using webpack raw-loader.
// @ts-ignore
import iframeScript from 'raw-loader!../../../../dist/overlay/overlay.js';

import { ErrorRecord } from './listenToRuntimeErrors';
import { ErrorLocation } from './parseCompileError';
import { EngineBase } from '../engine/EngineBase';

type RuntimeReportingOptions = {
  onError?: () => void;
  filename?: string;
};

type EditorHandler = (errorLoc: ErrorLocation) => void;

let iframe: null | HTMLIFrameElement = null;
let isLoadingIframe: boolean = false;
var isIframeReady: boolean = false;

let editorHandler: null | EditorHandler = null;
let currentBuildError: null | string = null;
let currentRuntimeErrorRecords: Array<ErrorRecord> = [];
let currentRuntimeErrorOptions: null | RuntimeReportingOptions = null;
let stopListeningToRuntimeErrors: null | (() => void) = null;

export function setEditorHandler(handler: EditorHandler | null) {
  editorHandler = handler;
  if (iframe) {
    update();
  }
}

export function reportBuildError(error: string) {
  currentBuildError = error;
  update();
}

export function dismissBuildError() {
  currentBuildError = null;
  update();
}

export function startReportingRuntimeErrors(engine: EngineBase, options: RuntimeReportingOptions) {
  if (stopListeningToRuntimeErrors !== null) {
    throw new Error('Already listening');
  }
  currentRuntimeErrorOptions = options;
  stopListeningToRuntimeErrors = listenToRuntimeErrors(
    engine,
    (errorRecord) => {
      try {
        if (typeof options.onError === 'function') {
          options.onError.call(null);
        }
      } finally {
        handleRuntimeError(errorRecord);
      }
    },
    options.filename,
  );
}

function handleRuntimeError(errorRecord: ErrorRecord) {
  if (currentRuntimeErrorRecords.some(({ error }) => error === errorRecord.error)) {
    // Deduplicate identical errors.
    // This fixes https://github.com/facebook/create-react-app/issues/3011.
    return;
  }
  currentRuntimeErrorRecords = currentRuntimeErrorRecords.concat([errorRecord]);
  update();
}

export function dismissRuntimeErrors() {
  currentRuntimeErrorRecords = [];
  update();
}

export function stopReportingRuntimeErrors() {
  if (stopListeningToRuntimeErrors === null) {
    throw new Error('Not currently listening');
  }
  currentRuntimeErrorOptions = null;
  try {
    stopListeningToRuntimeErrors();
  } finally {
    stopListeningToRuntimeErrors = null;
  }
}

function update() {
  // Loading iframe can be either sync or async depending on the browser.
  if (isLoadingIframe) {
    // Iframe is loading.
    // First render will happen soon--don't need to do anything.
    return;
  }
  if (isIframeReady) {
    // Iframe is ready.
    // Just update it.
    updateIframeContent();
    return;
  }
  // We need to schedule the first render.
  isLoadingIframe = true;
  const loadingIframe = window.document.createElement('iframe');
  applyStyles(loadingIframe, iframeStyle);
  loadingIframe.onload = function() {
    const iframeDocument = loadingIframe.contentDocument;
    if (iframeDocument != null && iframeDocument.body != null) {
      iframe = loadingIframe;
      // @ts-ignore
      const script = loadingIframe.contentWindow.document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = iframeScript;
      iframeDocument.body.appendChild(script);
    }
  };
  const appDocument = window.document;
  appDocument.body.appendChild(loadingIframe);
}

function updateIframeContent() {
  if (!currentRuntimeErrorOptions) {
    throw new Error('Expected options to be injected.');
  }

  if (!iframe) {
    throw new Error('Iframe has not been created yet.');
  }

  // @ts-ignore
  const isRendered = iframe.contentWindow.updateContent({
    currentBuildError,
    currentRuntimeErrorRecords,
    dismissRuntimeErrors,
    editorHandler,
  });

  if (!isRendered) {
    window.document.body.removeChild(iframe);
    iframe = null;
    isIframeReady = false;
  }
}

// @ts-ignore
window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ =
  // @ts-ignore
  window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || {};
// @ts-ignore
window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.iframeReady = function iframeReady() {
  isIframeReady = true;
  isLoadingIframe = false;
  updateIframeContent();
};

if (process.env.NODE_ENV === 'production' && process.env.NEO_ONE_DEV !== 'true') {
  console.warn(
    'react-error-overlay is not meant for use in production. You should ' +
      'ensure it is not included in your build to reduce bundle size.',
  );
}
