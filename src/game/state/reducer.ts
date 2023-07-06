import {
  compact,
  each,
  every,
  filter,
  find,
  first,
  includes,
  indexOf,
  isBoolean,
  isEmpty,
  last,
  map,
  size,
  sortBy,
  toUpper,
} from "lodash-es";
import {
  actionConstants,
  allowedKeysConstants,
  keysConstants,
} from "../constants";
import { Action, Keyboard, Letter, State, Take } from "../types";
import words from "../../words";

export function reducer(state: State, action: Action) {
  const actionType: string = action.type;
  const triggerFunc: Function = actions[actionType];
  const defaultState = triggerFunc(state, action.payload);

  switch (actionType) {
    case actionConstants.setData:
      return triggerFunc(state, action.payload);
    case actionConstants.updateLetter:
      return triggerFunc(state, action.payload);
    case actionConstants.toggleInputDeleteNext:
      return triggerFunc(state, action.payload);
    default:
      return defaultState;
  }
}

const setData = (
  state: State,
  data: {
    initialData: { takes: Array<Take>; letters: Array<Letter> };
    dailyWord: Array<{ id: string; value: string; letterCount: number }>;
    word: string;
    keyboard: Keyboard;
    hardMode: boolean;
  }
) => ({
  ...state,
  ...data.initialData,
  dailyWord: data.dailyWord,
  word: data.word,
  activeLetter: first(data.initialData.letters),
  activeTakeId: first(data.initialData.letters)?.takeId,
  keyboard: data.keyboard,
  hardMode: data.hardMode,
});

const toggleInputDeleteNext = (
  state: State,
  payload: { activeLetter: Letter }
) => {
  const deleteNext = isEmpty(payload.activeLetter.value);
  const inputNext = !isEmpty(payload.activeLetter.value);
  return { ...state, deleteNext, inputNext };
};

const getError = ({
  value,
  domId,
  state,
}: {
  value: string;
  domId: string;
  state: State;
}) => {
  const invalidKey = !includes(allowedKeysConstants, value) && size(value) > 1;
  if (invalidKey) return true;
  const take = find(state.takes, (take) => includes(take.letterIds, domId));
  const letters = filter(state.letters, { takeId: take?.id });
  let error = "";
  if (value === keysConstants.enter) {
    const notEnoughLetters = !every(
      letters,
      (letter) => !isEmpty(letter.value)
    );
    const word = map(letters, (letter) => letter.value).join("");
    const invalidWord = !includes(words, word);
    if (state.hardMode) {
      type StateLetter = Letter & { sortOrder?: number };
      const stateLetters: Array<StateLetter> = map(
        state.letters,
        (letter, index) => {
          return { ...letter, sortOrder: index };
        }
      );
      const oldGuessedLetters = filter(stateLetters, { consists: true });
      const oldCorrectLetters = filter(stateLetters, { isCorrect: true });
      const mustContainLetters = sortBy(
        [...oldCorrectLetters, ...oldGuessedLetters],
        "sortOrder"
      );
      each(mustContainLetters, (mustContainLetter) => {
        const newLetter = find(letters, { value: mustContainLetter.value });
        if (!newLetter && isEmpty(error) && !take?.isSubmitted)
          error = `Guess must contain letter ${mustContainLetter.value}`;
        else if (newLetter && isEmpty(error) && !take?.isSubmitted) {
          const takeLetters = filter(state.letters, {
            takeId: mustContainLetter.takeId,
          });
          delete mustContainLetter["sortOrder"];
          const takeLetter = find(takeLetters, { id: mustContainLetter.id });
          const letterIndex = indexOf(takeLetters, takeLetter) + 1;
          if (
            mustContainLetter.isCorrect &&
            mustContainLetter.id !== newLetter.id &&
            !take?.isSubmitted
          ) {
            switch (letterIndex) {
              case 1:
                error = `1st letter must be ${newLetter.value}`;
                break;
              case 2:
                error = `2nd letter must be ${newLetter.value}`;
                break;
              case 3:
                error = `3rd letter must be ${newLetter.value}`;
                break;
              case 4:
                error = `4th letter must be ${newLetter.value}`;
                break;
              case 5:
                error = `5th letter must be ${newLetter.value}`;
                break;
            }
          } else if (
            mustContainLetter.consists &&
            mustContainLetter.id === newLetter.id &&
            !take?.isSubmitted
          ) {
            switch (letterIndex) {
              case 1:
                error = `1st letter cannot be ${newLetter.value}`;
                break;
              case 2:
                error = `2nd letter cannot be ${newLetter.value}`;
                break;
              case 3:
                error = `3rd letter cannot be ${newLetter.value}`;
                break;
              case 4:
                error = `4th letter cannot be ${newLetter.value}`;
                break;
              case 5:
                error = `5th letter cannot be ${newLetter.value}`;
                break;
            }
          }
        }
      });
    }
    if (notEnoughLetters) error = "Not enough letters";
    if (invalidWord) error = "Not in word list";
    if (error) return error;
  }
  return undefined;
};

const updateLetter = (
  state: State,
  payload: { value: string; domId: string }
) => {
  const error = getError({
    value: payload.value,
    domId: payload.domId,
    state: state,
  });
  if (state.wordGuessed) return state;
  if (error) {
    if (isBoolean(error)) return state;
    const take = find(state.takes, { id: state.activeTakeId });
    take?.ref.current?.classList.add("shake-animation");
    setTimeout(() => {
      take?.ref.current?.classList.remove("shake-animation");
    }, 500);
    return { ...state, message: error };
  }
  switch (payload.value) {
    case keysConstants.backspace: {
      payload.value = "";
      const letter = getNextLetter(state, payload.value);
      return { ...state, activeLetter: letter };
    }
    case keysConstants.enter: {
      const letter = getNextLetter(state, payload.value);
      const nextTakeLetter = onSubmit(state, letter.takeId);
      const letters = filter(state.letters, { takeId: state.activeTakeId });
      const wordGuessed = every(letters, { isCorrect: true });
      const message =
        every(state.takes, { isSubmitted: true }) && !wordGuessed
          ? state.word
          : state.message;
      return {
        ...state,
        activeLetter: nextTakeLetter,
        submittedTakeId: letter.takeId,
        activeTakeId: nextTakeLetter.takeId,
        wordGuessed: wordGuessed,
        message: message,
      };
    }
    default: {
      payload.value = toUpper(payload.value);
      const letter = getNextLetter(state, payload.value);
      return { ...state, activeLetter: letter };
    }
  }
};

const getNextLetter = (state: State, value: string) => {
  const letter = state.activeLetter;
  const letters = filter(state.letters, { takeId: letter.takeId });
  const index = indexOf(letters, letter);
  const dir = isEmpty(value) ? -1 : 1;
  const newLetter = letters[index + dir];
  const isLastLetter = isLast(letters, letter) && !isEmpty(letter.value);
  if (!isEmpty(value)) {
    if (state.inputNext && newLetter) {
      newLetter.value = value;
    } else {
      letter.value = isLastLetter ? letter.value : value;
    }
  } else {
    letter.value = value;
    if (state.deleteNext && newLetter) {
      newLetter.value = value;
    }
  }
  return newLetter || letter;
};

const onSubmit = (state: State, takeId: string) => {
  const take = find(state.takes, { id: takeId });
  const letters = filter(state.letters, { takeId: takeId });
  const dailyWordCopy = [...state.dailyWord];
  if (take && letters) {
    take.isSubmitted = true;
    const correctLetters = compact(
      map(letters, (letter) => {
        const correctLetter = find(
          dailyWordCopy,
          (l) => l.id === letter.id && l.value === letter.value
        );
        return correctLetter;
      })
    );
    const guessedLetters = compact(
      map(letters, (letter) => {
        const guessedLetter = find(
          dailyWordCopy,
          (l) => l.id !== letter.id && l.value === letter.value
        );
        return guessedLetter;
      })
    );
    each(correctLetters, (cl) => {
      const letter = find(letters, { id: cl.id });
      if (letter) {
        letter.isCorrect = true;
        each(dailyWordCopy, (dwl) => {
          if (dwl.value === cl.value) {
            dwl.letterCount = dwl.letterCount - 1;
          }
        });
      }
    });
    each(guessedLetters, (gl) => {
      const letter = find(
        letters,
        (l) => l.value === gl.value && gl.id !== l.id && !l.consists
      );
      if (letter) {
        letter.consists = !letter.isCorrect && gl.letterCount > 0;
      }
    });
  }
  const nextLetter = state.letters[indexOf(state.letters, last(letters)) + 1];
  return nextLetter || state.activeLetter;
};

const updateKeyboardKeys = (state: State) => {
  each(state.keyboard, (items, row) => {
    const keyboardKeys = filter(items, (item) => size(item.value) === 1);
    each(keyboardKeys, (keyboardKey) => {
      const submittedLetters = filter(state.letters, {
        value: keyboardKey.value,
      });
      const lastEntry = last(submittedLetters);
      if (lastEntry) {
        keyboardKey.isCorrect = lastEntry.isCorrect;
        keyboardKey.consists = lastEntry.consists;
        keyboardKey.isSubmitted = true;
      }
    });
  });
  return { ...state };
};

const toggleHardMode = (state: State) => {
  return { ...state, hardMode: !state.hardMode };
};

const isLast = (collection: Array<object>, obj: object) => {
  return collection[indexOf(collection, obj) + 1] === undefined;
};

const resetMessage = (state: State) => {
  return { ...state, message: undefined };
};

const resetSubmittedTake = (state: State) => {
  return { ...state, submittedTakeId: undefined };
};

const actions: any = {
  SET_DATA: setData,
  UPDATE_LETTER: updateLetter,
  TOGGLE_INPUT_DELETE_NEXT: toggleInputDeleteNext,
  RESET_SUBMITTED_TAKE: resetSubmittedTake,
  RESET_MESSAGE: resetMessage,
  UPDATE_KEYBOARD_KEYS: updateKeyboardKeys,
  TOGGLE_HARD_MODE: toggleHardMode,
};
