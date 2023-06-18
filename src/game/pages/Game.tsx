import {
  compact,
  each,
  filter,
  find,
  first,
  flatMap,
  groupBy,
  includes,
  indexOf,
  isEmpty,
  last,
  map,
  range,
  sample,
  size,
  toUpper,
} from "lodash-es";
import React, {
  ForwardedRef,
  createRef,
  forwardRef,
  memo,
  useEffect,
  useReducer,
  useState,
} from "react";
import words from "../../words";
import classNames from "classnames";
import { Action, Letter, LetterProps, State, Take } from "../types";
import { createPortal } from "react-dom";

const word = "ERROR" || sample(words);

const initializeDailyWord = () => {
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

const initializeData = () => {
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

const setData = (
  state: State,
  initialData: { takes: Array<Take>; letters: Array<Letter> }
) => ({
  ...state,
  ...initialData,
  activeLetter: first(initialData.letters),
  activeTakeId: first(initialData.letters)?.takeId,
});

const keysConstants = {
  backspace: "Backspace",
  enter: "Enter",
};

const allowKeys = ["Backspace", "Enter"];

const toggleInputDeleteNext = (
  state: State,
  payload: { activeLetter: Letter }
) => {
  const deleteNext = isEmpty(payload.activeLetter.value);
  const inputNext = !isEmpty(payload.activeLetter.value);
  return { ...state, deleteNext, inputNext };
};

const isValid = (payload: { value: string; domId: string }) => {
  const invalidKey =
    !includes(allowKeys, payload.value) && size(payload.value) > 1;
  return true;
};

const updateLetter = (
  state: State,
  payload: { value: string; domId: string }
) => {
  const isInvalid = !isValid(payload);
  if (isInvalid) return state;
  switch (payload.value) {
    case keysConstants.backspace: {
      payload.value = "";
      const letter = getNextLetter(state, payload.value);
      return { ...state, activeLetter: letter };
    }
    case keysConstants.enter: {
      const letter = getNextLetter(state, payload.value);
      const nextTakeLetter = onSubmit(state, letter.takeId);
      return {
        ...state,
        activeLetter: nextTakeLetter,
        submittedTakeId: letter.takeId,
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
  const dailyWordCopy = [...dailyWord];
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

const resetSubmittedTake = (state: State) => {
  return { ...state, submittedTakeId: undefined };
};

const isLast = (collection: Array<object>, obj: object) => {
  return collection[indexOf(collection, obj) + 1] === undefined;
};

const actionConstants = {
  setData: "SET_DATA",
  updateLetter: "UPDATE_LETTER",
  toggleInputDeleteNext: "TOGGLE_INPUT_DELETE_NEXT",
  resetSubmittedTake: "RESET_SUBMITTED_TAKE",
};

const actions: any = {
  SET_DATA: setData,
  UPDATE_LETTER: updateLetter,
  TOGGLE_INPUT_DELETE_NEXT: toggleInputDeleteNext,
  RESET_SUBMITTED_TAKE: resetSubmittedTake,
};

const defaultState = {
  takes: [],
  letters: [],
  activeLetter: {},
  activeTakeId: "",
  wordGuessed: false,
};

function reducer(state: State, action: Action) {
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

const dailyWord = initializeDailyWord();
const initialData = initializeData();
function Game() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [loading, setLoading] = useState(false);
  const groupedLetters = groupBy(state.letters, "takeId");

  const handleDocumentClick = () => {
    const elements = document.getElementsByClassName(
      "input-active"
    ) as HTMLCollectionOf<HTMLInputElement>;
    first(elements)?.focus();
  };

  useEffect(() => {
    dispatch({ type: actionConstants.setData, payload: initialData });
    window.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    state.activeLetter.ref?.current?.focus();
    dispatch({
      type: actionConstants.toggleInputDeleteNext,
      payload: { activeLetter: state.activeLetter },
    });
  }, [state.activeLetter, state.activeLetter.value]);

  useEffect(() => {
    const letters = groupedLetters[state.submittedTakeId];
    state.submittedTakeId && setLoading(true);
    each(letters, (letter: Letter, index) => {
      let bgColor = "";
      if (letter.consists) {
        bgColor = "yellow";
      } else if (letter.isCorrect) {
        bgColor = "green";
      } else {
        bgColor = "grey";
      }
      setTimeout(() => {
        letter.ref.current?.classList.add("rotate-animation");
        letter.ref.current?.classList.add("text-white");
        letter.ref.current?.classList.add(bgColor);
      }, index * 250);
      setTimeout(() => {
        if (index === size(letters) - 1) {
          setLoading(false);
          dispatch({ type: actionConstants.resetSubmittedTake, payload: null });
        }
      }, size(letters) * 250);
    });
  }, [state.submittedTakeId, groupedLetters]);

  return (
    <div className="main-wrapper">
      {word}
      {map(groupedLetters, (letters, takeId) => {
        const take = find(state.takes, (t) => t.id === takeId);
        return (
          <div className="take" id={takeId} key={takeId}>
            {map(letters, (letter) => {
              return (
                <RenderLetter
                  consists={letter.consists && take.isSubmitted}
                  isCorrect={letter.isCorrect && take.isSubmitted}
                  isIncorrect={
                    !letter.consists && !letter.isCorrect && take.isSubmitted
                  }
                  ref={letter.ref}
                  key={letter.domId}
                  value={letter.value}
                  domId={letter.domId}
                  dispatch={dispatch}
                  disabled={state.activeLetter.domId !== letter.domId}
                  loading={loading}
                />
              );
            })}
          </div>
        );
      })}
      {createPortal(<div className="popup">Gejmer</div>, document.body)}
    </div>
  );
}

const RenderLetter = memo(
  forwardRef((props: LetterProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      value,
      domId,
      dispatch,
      disabled,
      isCorrect,
      consists,
      isIncorrect,
      loading = false,
    } = props;
    const isSubmitted = isCorrect || consists || isIncorrect;

    const onChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (loading) return;
      dispatch({
        type: actionConstants.updateLetter,
        payload: { value: e.key, domId: domId },
      });
    };

    return (
      <React.Fragment>
        <input
          ref={ref}
          value={value}
          type="text"
          tabIndex={-1}
          maxLength={1}
          onKeyDown={onChange}
          className={classNames("letter", {
            "input-animation": !isEmpty(value),
            "input-active": !disabled,
            disabled: disabled,
            "letter-border": !isSubmitted && !isEmpty(value),
          })}
          autoFocus={!disabled}
        />
      </React.Fragment>
    );
  })
);

export default Game;
