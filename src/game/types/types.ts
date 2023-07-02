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
  ref: RefObject<HTMLInputElement>;
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
  message: boolean;
  wordGuessed: boolean;
  dailyWord: Array<{ id: string; value: string; letterCount: number }>;
  word: string;
  keyboard: Keyboard;
};

export type Keyboard = {
  firstRow: Array<KeyboardKey>;
  secondRow: Array<KeyboardKey>;
  thirdRow: Array<KeyboardKey>;
};

export type KeyboardKey = {
  isCorrect: boolean;
  consists: boolean;
  value: string;
  row: number;
  isSubmitted: boolean;
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
  onChange: Function;
};
