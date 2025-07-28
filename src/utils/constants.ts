export const ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  LEARNER: 'learner',
};

export const STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  DEACTIVATED: 'deactivated',
  BLOCKED: 'blocked',
  REJECTED: 'rejected',
};

export const LANGUAGE_CODE = {
  EN: 'en',
  FR: 'fr',
};

export const LOGIN_TYPE = {
  NORMAL: 'normal',
  APPLE: 'apple',
  FACEBOK: 'facebook',
  GOOGLE: 'google',
};

export enum NAVIGATE_TYPE {
  NONE = 'none',
  REDIRECT_TO_VIDEO = 'redirectToVideo',
  SHOW_TEMP_VIDEO = 'showTempVideo',
}

export enum WATCH_FROM {
  VR = 'vr',
  WEB = 'web',
}

export enum QUESTION_TYPE {
  YES_NO = 'yes_no',
  RATING = 'rating',
}

export enum TYPE {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  PAUSE = 'pause',
  VIDEO_VIEW = 'videoView',
}
