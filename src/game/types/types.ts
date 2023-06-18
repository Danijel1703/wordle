import { RefObject } from "react";

export type Letter = {
  id: string;
  domId: string;
  value: string;
  isCorrect: boolean;
  consists: boolean;
  takeId: string;
  ref: RefObject<HTMLInputElement>;
};

export type Take = {
  id: string;
  domId: string;
  letterIds: Array<string>;
  isSubmitted: boolean;
};

export type Action = {
  type: string;
  payload: any;
};

export type State = {
  takes: Array<Take>;
  letters: Array<Letter>;
  activeLetter: Letter;
  activeTakeId: string;
  deleteNext: boolean;
  inputNext: boolean;
};

export type LetterProps = {
  domId: string;
  dispatch: Function;
  value: string;
  disabled: boolean;
  consists: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  loading: boolean;
};
