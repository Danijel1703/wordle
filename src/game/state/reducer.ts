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
  }
) => ({
  ...state,
  ...data.initialData,
  dailyWord: data.dailyWord,
  word: data.word,
  activeLetter: first(data.initialData.letters),
  activeTakeId: first(data.initialData.letters)?.takeId,
  keyboard: data.keyboard,
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
  const letters = filter(state.letters, (letter) => letter.takeId === take?.id);
  if (value === keysConstants.enter) {
    const notEnoughLetters = !every(
      letters,
      (letter) => !isEmpty(letter.value)
    );
    const word = map(letters, (letter) => letter.value).join("");
    const invalidWord = !includes(words, word);
    if (notEnoughLetters) return "Not enough letters";
    if (invalidWord) return "Not in word list";
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
    const take = find(state.takes, (take) => take.id === state.activeTakeId);
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
      const letters = filter(
        state.letters,
        (letter) => letter.takeId === state.activeTakeId
      );
      const wordGuessed = every(letters, (letter) => letter.isCorrect);
      const message =
        every(state.takes, (take) => take.isSubmitted) && !wordGuessed
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
  const letters = filter(state.letters, (l) => l.takeId === letter.takeId);
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
  const take = find(state.takes, (t) => t.id === takeId);
  const letters = filter(state.letters, (l) => l.takeId === takeId);
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
      const letter = find(letters, (l) => l.id === cl.id);
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
      const submittedLetters = filter(
        state.letters,
        (letter) => letter.value === keyboardKey.value
      );
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
};
