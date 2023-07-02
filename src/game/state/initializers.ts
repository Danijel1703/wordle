import {
  each,
  filter,
  flatMap,
  indexOf,
  keys,
  map,
  range,
  size,
} from "lodash-es";
import { Letter, Take } from "../types";
import { createRef } from "react";
import { keyobardKeysConstants } from "../constants";

export const initializeDailyWord = (word: string) => {
  const letters = range(size(word));
  const dailyWord = map(letters, (letter, index) => {
    const id = "letter" + index;
    return {
      id: id,
      value: word[index],
      letterCount: size(filter(word, (l) => l === word[index])),
    };
  });
  return dailyWord;
};

export const initializeData = (word: string) => {
  const lettersRange = range(size(word));
  const takesRange = range(size(word) + 1);
  const takes: Array<Take> = map(takesRange, (take, index) => {
    const takeId = "take" + index;
    const letterIds: Array<string> = map(lettersRange, (letter, index) => {
      const domId = takeId + "letter" + index;
      return domId;
    });
    return {
      domId: takeId,
      id: takeId,
      letterIds: letterIds,
      isSubmitted: false,
      ref: createRef(),
    };
  });
  const letters: Array<Letter> = flatMap(takes, (take) =>
    map(take.letterIds, (domId, index) => {
      const id = "letter" + index;
      return {
        id: id,
        takeId: take.id,
        domId: domId,
        value: "",
        isCorrect: false,
        consists: false,
        ref: createRef(),
      };
    })
  );
  const data = { letters, takes };
  return data;
};

export const initializeKeyboard = () => {
  const keyboard: any = {};
  each(keys(keyobardKeysConstants), (key) => {
    keyboard[key] = map(keyobardKeysConstants[key], (keyboardKey) => ({
      isCorrect: false,
      consists: false,
      value: keyboardKey,
      row: indexOf(keys(keyobardKeysConstants), key),
      isSubmitted: false,
    }));
  });
  return keyboard;
};
